/**
 * 完全版APIクライアント
 * キャッシュ、オフライン対応、認証、リトライ機能を統合したRESTful API呼び出しライブラリ
 */
import { getAuth, onAuthStateChanged, getIdToken } from 'firebase/auth';
import { isDevelopment, isDebugMode } from '../config/env';
import environmentManager from './environmentManager';
import apiCache from './cache/apiCache';

export interface ApiOptions {
  headers?: Record<string, string>;
  params?: Record<string, any>;
  timeout?: number;
  cache?: boolean;
  cacheTtl?: number;
  retry?: boolean;
  maxRetries?: number;
  useMockData?: boolean;
  requireAuth?: boolean;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  status: number;
  headers: Headers;
  cachedResponse?: boolean;
}

export interface ApiClient {
  get<T = any>(url: string, options?: ApiOptions): Promise<ApiResponse<T>>;
  post<T = any>(url: string, data?: any, options?: ApiOptions): Promise<ApiResponse<T>>;
  put<T = any>(url: string, data?: any, options?: ApiOptions): Promise<ApiResponse<T>>;
  patch<T = any>(url: string, data?: any, options?: ApiOptions): Promise<ApiResponse<T>>;
  delete<T = any>(url: string, options?: ApiOptions): Promise<ApiResponse<T>>;
  uploadFile<T = any>(
    url: string,
    file: File,
    fieldName?: string,
    additionalData?: Record<string, any>,
    options?: ApiOptions,
    progressCallback?: (progress: number) => void
  ): Promise<ApiResponse<T>>;
}

type MockGenerator<T> = (url: string, method: string, data?: any) => T;
const mockDataRegistry: Record<string, MockGenerator<any>> = {};

export function registerMock<T>(urlPattern: RegExp | string, generator: MockGenerator<T>): void {
  const pattern = typeof urlPattern === 'string' 
    ? new RegExp(urlPattern.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&'))
    : urlPattern;
  mockDataRegistry[pattern.toString()] = generator;
}

function getMockResponse<T>(url: string, method: string, data?: any): ApiResponse<T> | null {
  if (!environmentManager.getEnvironmentConfig().useMockData) {
    return null;
  }
  
  for (const patternStr in mockDataRegistry) {
    const pattern = new RegExp(patternStr.slice(1, -1));
    if (pattern.test(url)) {
      try {
        const mockData = mockDataRegistry[patternStr](url, method, data);
        return {
          success: true,
          data: mockData,
          status: 200,
          headers: new Headers({
            'content-type': 'application/json',
            'x-mock-response': 'true'
          })
        };
      } catch (error) {
        console.error('モックデータ生成エラー:', error);
        return {
          success: false,
          error: {
            code: 'MOCK_ERROR',
            message: error instanceof Error ? error.message : '不明なエラー',
            details: error
          },
          status: 500,
          headers: new Headers({
            'x-mock-response': 'true'
          })
        };
      }
    }
  }
  return null;
}

let cachedToken: string | null = null;
let tokenExpiryTime: number = 0;

export async function getAuthToken(): Promise<string | null> {
  if (!environmentManager.getEnvironmentConfig().authEnabled) {
    return null;
  }
  
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user) {
      return null;
    }
    
    const now = Date.now();
    if (cachedToken && tokenExpiryTime > now) {
      return cachedToken;
    }
    
    const token = await getIdToken(user, true);
    cachedToken = token;
    tokenExpiryTime = now + 50 * 60 * 1000;
    
    return token;
  } catch (error) {
    console.error('認証トークン取得エラー:', error);
    return null;
  }
}

export function setupAuthListener(): void {
  const auth = getAuth();
  onAuthStateChanged(auth, (user) => {
    if (!user) {
      cachedToken = null;
      tokenExpiryTime = 0;
    }
  });
}

function calculateBackoff(retryCount: number, baseDelay: number, maxDelay: number): number {
  const delay = Math.min(maxDelay, baseDelay * Math.pow(2, retryCount));
  const jitter = delay * 0.2 * (Math.random() * 2 - 1);
  return delay + jitter;
}

function isRetryableError(status: number): boolean {
  if (status === 0) return true;
  if (status >= 500 && status < 600) return true;
  if (status === 429) return true;
  return false;
}

async function request<T = any>(
  url: string,
  options: {
    method: string;
    body?: any;
    headers?: Record<string, string>;
    params?: Record<string, any>;
    timeout?: number;
    cache?: boolean;
    cacheTtl?: number;
    retry?: boolean;
    maxRetries?: number;
    requireAuth?: boolean;
    useMockData?: boolean;
  } = { method: 'GET' }
): Promise<ApiResponse<T>> {
  const envConfig = environmentManager.getEnvironmentConfig();
  
  const settings = {
    cache: options.cache !== undefined ? options.cache : envConfig.useCache,
    cacheTtl: options.cacheTtl || 30 * 60 * 1000,
    retry: options.retry !== undefined ? options.retry : true,
    maxRetries: options.maxRetries || envConfig.retryConfig.maxRetries,
    requireAuth: options.requireAuth !== undefined ? options.requireAuth : false,
    useMockData: options.useMockData !== undefined ? options.useMockData : envConfig.useMockData,
    timeout: options.timeout || envConfig.timeouts.default
  };
  
  const fullUrl = url.startsWith('http') ? url : `${envConfig.apiBaseUrl}${url}`;
  
  if (settings.useMockData) {
    const mockResponse = getMockResponse<T>(url, options.method, options.body);
    if (mockResponse) {
      if (isDevelopment() || isDebugMode()) {
        logApiResponse(options.method, url, mockResponse, true);
      }
      return mockResponse;
    }
  }
  
  if (options.method === 'GET' && settings.cache) {
    try {
      const cachedData = await apiCache.getCachedResponse(url, options.method, options.params);
      if (cachedData) {
        const cachedResponse: ApiResponse<T> = {
          success: true,
          data: cachedData,
          status: 200,
          headers: new Headers({
            'content-type': 'application/json',
            'x-cache': 'HIT'
          }),
          cachedResponse: true
        };
        
        if (isDevelopment() || isDebugMode()) {
          logApiResponse(options.method, url, cachedResponse, false, true);
        }
        
        return cachedResponse;
      }
    } catch (error) {
      console.error('キャッシュ取得エラー:', error);
    }
  }
  
  const performRequest = async (retryCount = 0): Promise<ApiResponse<T>> => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), settings.timeout);
      
      let token = null;
      if (settings.requireAuth || envConfig.authEnabled) {
        token = await getAuthToken();
        
        if (settings.requireAuth && !token) {
          return {
            success: false,
            error: {
              code: 'AUTH_REQUIRED',
              message: '認証が必要です。ログインしてください。'
            },
            status: 401,
            headers: new Headers()
          };
        }
      }
      
      const headers: HeadersInit = {
        ...options.headers
      };
      
      if (
        options.body &&
        !(options.body instanceof FormData) &&
        !headers['Content-Type']
      ) {
        headers['Content-Type'] = 'application/json';
      }
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const fetchOptions: RequestInit = {
        method: options.method,
        headers,
        credentials: 'include',
        signal: controller.signal
      };
      
      if (options.method !== 'GET' && options.body !== undefined) {
        fetchOptions.body = options.body instanceof FormData ? 
          options.body : 
          JSON.stringify(options.body);
      }
      
      const response = await fetch(fullUrl, fetchOptions);
      clearTimeout(timeoutId);
      
      const responseHeaders = response.headers;
      const contentType = responseHeaders.get('content-type') || '';
      
      let data;
      if (contentType.includes('application/json')) {
        data = await response.json();
      } else if (contentType.includes('text/')) {
        data = await response.text();
      } else {
        data = await response.blob();
      }
      
      if (response.ok) {
        const successResponse = {
          success: true,
          data,
          status: response.status,
          headers: responseHeaders
        };
        
        if (options.method === 'GET' && settings.cache) {
          try {
            await apiCache.cacheResponse(
              url,
              options.method,
              options.params,
              data,
              settings.cacheTtl
            );
          } catch (cacheError) {
            console.error('キャッシュ保存エラー:', cacheError);
          }
        }
        
        if (isDevelopment() || isDebugMode()) {
          logApiResponse(options.method, url, successResponse);
        }
        
        return successResponse;
      }
      
      let errorData = {
        code: 'UNKNOWN_ERROR',
        message: '不明なエラーが発生しました'
      };
      
      if (typeof data === 'object' && data !== null) {
        errorData = {
          ...errorData,
          ...data
        };
      }
      
      const errorResponse = {
        success: false,
        error: errorData,
        status: response.status,
        headers: responseHeaders
      };
      
      if (response.status === 401) {
        cachedToken = null;
        tokenExpiryTime = 0;
      }
      
      if (
        settings.retry &&
        retryCount < settings.maxRetries &&
        isRetryableError(response.status)
      ) {
        const delay = calculateBackoff(
          retryCount,
          envConfig.retryConfig.baseDelay,
          envConfig.retryConfig.maxDelay
        );
        
        if (isDevelopment() || isDebugMode()) {
          console.log(`🔄 リトライ ${retryCount + 1}/${settings.maxRetries} (${delay}ms後): ${options.method} ${url}`);
        }
        
        await new Promise(resolve => setTimeout(resolve, delay));
        return performRequest(retryCount + 1);
      }
      
      if (isDevelopment() || isDebugMode()) {
        logApiResponse(options.method, url, errorResponse);
      }
      
      return errorResponse;
    } catch (error) {
      console.error('APIリクエストエラー:', error);
      
      if (error instanceof DOMException && error.name === 'AbortError') {
        const timeoutResponse: ApiResponse<T> = {
          success: false,
          error: {
            code: 'TIMEOUT',
            message: 'リクエストがタイムアウトしました'
          },
          status: 0,
          headers: new Headers()
        };
        
        if (settings.retry && retryCount < settings.maxRetries) {
          const delay = calculateBackoff(
            retryCount,
            envConfig.retryConfig.baseDelay,
            envConfig.retryConfig.maxDelay
          );
          
          if (isDevelopment() || isDebugMode()) {
            console.log(`🔄 タイムアウト後リトライ ${retryCount + 1}/${settings.maxRetries} (${delay}ms後): ${options.method} ${url}`);
          }
          
          await new Promise(resolve => setTimeout(resolve, delay));
          return performRequest(retryCount + 1);
        }
        
        if (isDevelopment() || isDebugMode()) {
          logApiResponse(options.method, url, timeoutResponse);
        }
        
        return timeoutResponse;
      }
      
      const networkResponse: ApiResponse<T> = {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: error instanceof Error ? error.message : 'ネットワークエラー',
          details: error
        },
        status: 0,
        headers: new Headers()
      };
      
      if (!navigator.onLine && options.method !== 'GET') {
        try {
          await apiCache.queueOfflineRequest(
            url,
            options.method,
            options.body,
            options.headers
          );
          
          if (isDevelopment() || isDebugMode()) {
            console.log(`📤 オフラインリクエストをキューに追加: ${options.method} ${url}`);
          }
        } catch (queueError) {
          console.error('オフラインキュー追加エラー:', queueError);
        }
      }
      
      if (settings.retry && retryCount < settings.maxRetries) {
        const delay = calculateBackoff(
          retryCount,
          envConfig.retryConfig.baseDelay,
          envConfig.retryConfig.maxDelay
        );
        
        if (isDevelopment() || isDebugMode()) {
          console.log(`🔄 ネットワークエラー後リトライ ${retryCount + 1}/${settings.maxRetries} (${delay}ms後): ${options.method} ${url}`);
        }
        
        await new Promise(resolve => setTimeout(resolve, delay));
        return performRequest(retryCount + 1);
      }
      
      if (isDevelopment() || isDebugMode()) {
        logApiResponse(options.method, url, networkResponse);
      }
      
      return networkResponse;
    }
  };
  
  if (isDevelopment() || isDebugMode()) {
    logApiRequest(options.method, url, options.body);
  }
  
  return performRequest();
}

async function get<T = any>(url: string, options: ApiOptions = {}): Promise<ApiResponse<T>> {
  return request<T>(url, {
    method: 'GET',
    headers: options.headers,
    params: options.params,
    timeout: options.timeout,
    cache: options.cache,
    cacheTtl: options.cacheTtl,
    retry: options.retry,
    maxRetries: options.maxRetries,
    requireAuth: options.requireAuth,
    useMockData: options.useMockData
  });
}

async function post<T = any>(url: string, data?: any, options: ApiOptions = {}): Promise<ApiResponse<T>> {
  return request<T>(url, {
    method: 'POST',
    body: data,
    headers: options.headers,
    params: options.params,
    timeout: options.timeout,
    cache: false,
    retry: options.retry,
    maxRetries: options.maxRetries,
    requireAuth: options.requireAuth,
    useMockData: options.useMockData
  });
}

async function put<T = any>(url: string, data?: any, options: ApiOptions = {}): Promise<ApiResponse<T>> {
  return request<T>(url, {
    method: 'PUT',
    body: data,
    headers: options.headers,
    params: options.params,
    timeout: options.timeout,
    cache: false,
    retry: options.retry,
    maxRetries: options.maxRetries,
    requireAuth: options.requireAuth,
    useMockData: options.useMockData
  });
}

async function patch<T = any>(url: string, data?: any, options: ApiOptions = {}): Promise<ApiResponse<T>> {
  return request<T>(url, {
    method: 'PATCH',
    body: data,
    headers: options.headers,
    params: options.params,
    timeout: options.timeout,
    cache: false,
    retry: options.retry,
    maxRetries: options.maxRetries,
    requireAuth: options.requireAuth,
    useMockData: options.useMockData
  });
}

async function del<T = any>(url: string, options: ApiOptions = {}): Promise<ApiResponse<T>> {
  return request<T>(url, {
    method: 'DELETE',
    headers: options.headers,
    params: options.params,
    timeout: options.timeout,
    cache: false,
    retry: options.retry,
    maxRetries: options.maxRetries,
    requireAuth: options.requireAuth,
    useMockData: options.useMockData
  });
}

async function uploadFile<T = any>(
  url: string,
  file: File,
  fieldName: string = 'file',
  additionalData: Record<string, any> = {},
  options: ApiOptions = {},
  progressCallback?: (progress: number) => void
): Promise<ApiResponse<T>> {
  const envConfig = environmentManager.getEnvironmentConfig();
  
  try {
    let token = null;
    if (options.requireAuth || envConfig.authEnabled) {
      token = await getAuthToken();
      
      if (options.requireAuth && !token) {
        return {
          success: false,
          error: {
            code: 'AUTH_REQUIRED',
            message: '認証が必要です。ログインしてください。'
          },
          status: 401,
          headers: new Headers()
        };
      }
    }
    
    const formData = new FormData();
    formData.append(fieldName, file);
    
    Object.entries(additionalData).forEach(([key, value]) => {
      formData.append(key, String(value));
    });
    
    const fullUrl = url.startsWith('http') ? url : `${envConfig.apiBaseUrl}${url}`;
    
    if (isDevelopment() || isDebugMode()) {
      logApiRequest('POST(FILE)', url, { fileName: file.name, size: file.size, type: file.type, additionalData });
    }
    
    if (progressCallback) {
      return new Promise((resolve) => {
        const xhr = new XMLHttpRequest();
        
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const progress = Math.round((event.loaded / event.total) * 100);
            progressCallback(progress);
          }
        });
        
        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            let data;
            try {
              data = JSON.parse(xhr.responseText);
            } catch (e) {
              data = xhr.responseText;
            }
            
            const successResponse = {
              success: true,
              data,
              status: xhr.status,
              headers: new Headers(
                xhr.getAllResponseHeaders().split('\r\n')
                  .filter(Boolean)
                  .reduce((acc, header) => {
                    const [name, value] = header.split(': ');
                    if (name && value) {
                      acc[name.toLowerCase()] = value;
                    }
                    return acc;
                  }, {} as Record<string, string>)
              )
            };
            
            if (isDevelopment() || isDebugMode()) {
              logApiResponse('POST(FILE)', url, successResponse);
            }
            
            resolve(successResponse);
          } else {
            let errorData;
            try {
              errorData = JSON.parse(xhr.responseText);
            } catch (e) {
              errorData = { message: '不明なエラー' };
            }
            
            const errorResponse = {
              success: false,
              error: {
                code: `HTTP_${xhr.status}`,
                message: errorData.message || 'リクエストが失敗しました',
                details: errorData
              },
              status: xhr.status,
              headers: new Headers(
                xhr.getAllResponseHeaders().split('\r\n')
                  .filter(Boolean)
                  .reduce((acc, header) => {
                    const [name, value] = header.split(': ');
                    if (name && value) {
                      acc[name.toLowerCase()] = value;
                    }
                    return acc;
                  }, {} as Record<string, string>)
              )
            };
            
            if (isDevelopment() || isDebugMode()) {
              logApiResponse('POST(FILE)', url, errorResponse);
            }
            
            resolve(errorResponse);
          }
        });
        
        xhr.addEventListener('error', () => {
          const networkError = {
            success: false,
            error: {
              code: 'NETWORK_ERROR',
              message: 'ネットワークエラーが発生しました'
            },
            status: 0,
            headers: new Headers()
          };
          
          if (isDevelopment() || isDebugMode()) {
            logApiResponse('POST(FILE)', url, networkError);
          }
          
          resolve(networkError);
        });
        
        xhr.addEventListener('abort', () => {
          const abortError = {
            success: false,
            error: {
              code: 'ABORTED',
              message: 'リクエストが中断されました'
            },
            status: 0,
            headers: new Headers()
          };
          
          if (isDevelopment() || isDebugMode()) {
            logApiResponse('POST(FILE)', url, abortError);
          }
          
          resolve(abortError);
        });
        
        xhr.addEventListener('timeout', () => {
          const timeoutError = {
            success: false,
            error: {
              code: 'TIMEOUT',
              message: 'リクエストがタイムアウトしました'
            },
            status: 0,
            headers: new Headers()
          };
          
          if (isDevelopment() || isDebugMode()) {
            logApiResponse('POST(FILE)', url, timeoutError);
          }
          
          resolve(timeoutError);
        });
        
        xhr.open('POST', fullUrl);
        xhr.timeout = options.timeout || envConfig.timeouts.upload;
        
        if (token) {
          xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        }
        
        if (options.headers) {
          Object.entries(options.headers).forEach(([name, value]) => {
            if (typeof value === 'string') {
              xhr.setRequestHeader(name, value);
            }
          });
        }
        
        xhr.send(formData);
      });
    }
    
    return request<T>(url, {
      method: 'POST',
      body: formData,
      headers: options.headers,
      timeout: options.timeout || envConfig.timeouts.upload,
      requireAuth: options.requireAuth,
      useMockData: options.useMockData
    });
  } catch (error) {
    console.error('ファイルアップロードエラー:', error);
    return {
      success: false,
      error: {
        code: 'UPLOAD_ERROR',
        message: error instanceof Error ? error.message : 'ファイルアップロードに失敗しました',
        details: error
      },
      status: 0,
      headers: new Headers()
    };
  }
}

// オフラインキューの処理
function processOfflineQueue(): void {
  if (!navigator.onLine) return;
  
  apiCache.getQueuedRequests().then(async (requests) => {
    if (requests.length === 0) return;
    
    if (isDevelopment() || isDebugMode()) {
      console.log(`📤 オフラインキュー処理: ${requests.length}件のリクエストを処理します`);
    }
    
    for (const queuedRequest of requests) {
      try {
        if (isDevelopment() || isDebugMode()) {
          console.log(`📤 キュー処理: ${queuedRequest.method} ${queuedRequest.url}`);
        }
        
        await request(queuedRequest.url, {
          method: queuedRequest.method,
          body: queuedRequest.body,
          headers: queuedRequest.headers,
          retry: true
        });
        
        await apiCache.removeQueuedRequest(queuedRequest.timestamp);
      } catch (error) {
        console.error('キュー処理エラー:', error);
      }
    }
  }).catch((error) => {
    console.error('オフラインキュー取得エラー:', error);
  });
}

// オンラインに戻ったときにキューを処理
window.addEventListener('online', processOfflineQueue);

// 定期的にキューを処理（バックグラウンドでオンラインになった場合に対応）
setInterval(() => {
  if (navigator.onLine) {
    processOfflineQueue();
  }
}, 60000); // 1分ごとに確認

export function logApiRequest(method: string, url: string, data?: any): void {
  if (isDevelopment() || isDebugMode()) {
    console.groupCollapsed(`🚀 API Request: ${method} ${url}`);
    console.log('URL:', url);
    console.log('Method:', method);
    if (data) console.log('Data:', data);
    console.groupEnd();
  }
}

export function logApiResponse<T = any>(
  method: string, 
  url: string, 
  response: ApiResponse<T>, 
  isMock: boolean = false,
  isCache: boolean = false
): void {
  if (isDevelopment() || isDebugMode()) {
    const prefix = isMock ? '🔸' : isCache ? '📦' : response.success ? '✅' : '❌';
    const suffix = isMock ? ' (Mock)' : isCache ? ' (Cache)' : '';
    
    console.groupCollapsed(`${prefix} API Response: ${method} ${url}${suffix}`);
    console.log('Status:', response.status);
    console.log('Success:', response.success);
    if (response.data) console.log('Data:', response.data);
    if (response.error) console.log('Error:', response.error);
    console.groupEnd();
  }
}

// アプリケーション起動時に認証リスナーを設定
setupAuthListener();

const api = {
  get,
  post,
  put,
  patch,
  delete: del,
  uploadFile,
  getAuthToken,
  setupAuthListener,
  registerMock
};

export default api;
