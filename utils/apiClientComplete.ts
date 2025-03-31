/**
 * 完全版APIクライアント
 * 
 * Firebase認証、キャッシュ機能、オフライン対応、リトライ機能を備えた
 * APIクライアントです。バックエンド統合を100%完成させるための拡張版です。
 */
import { getAuth, onAuthStateChanged, getIdToken } from 'firebase/auth';
import apiCache, {
  cacheResponse,
  getCachedResponse,
  queueRequest,
  isOnline,
  setupOfflineListeners
} from './apiCache';
import { 
  getCurrentSettings, 
  getApiBaseUrl, 
  useMockData, 
  enableLogging, 
  getApiTimeout 
} from './environmentManager';
import { ApiResponse } from './apiClientEnhanced';

// リトライ設定
interface RetryConfig {
  maxRetries: number;
  initialDelay: number;
  maxDelay: number;
  factor: number;
  retryCondition: (error: any) => boolean;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  initialDelay: 1000, // 1秒
  maxDelay: 30000, // 30秒
  factor: 2, // 指数バックオフ係数
  retryCondition: (error: any) => {
    // ネットワークエラーやタイムアウトエラー、一時的なサーバーエラー（5xx）の場合にリトライ
    return (
      error instanceof TypeError ||
      error instanceof DOMException ||
      (error && error.status && error.status >= 500 && error.status < 600)
    );
  }
};

// トークンのキャッシュ
let cachedToken: string | null = null;
let tokenExpiryTime: number = 0;

/**
 * 現在のFirebase認証トークンを取得
 * 
 * @returns 認証トークン、未ログインの場合はnull
 */
export async function getAuthToken(): Promise<string | null> {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user) {
      return null;
    }
    
    // キャッシュされたトークンが有効な場合はそれを使用
    const now = Date.now();
    if (cachedToken && tokenExpiryTime > now) {
      return cachedToken;
    }
    
    // 新しいトークンを取得
    const token = await getIdToken(user, true);
    
    // トークンをキャッシュ（有効期限は50分と仮定）
    cachedToken = token;
    tokenExpiryTime = now + 50 * 60 * 1000;
    
    return token;
  } catch (error) {
    console.error('認証トークン取得エラー:', error);
    return null;
  }
}

/**
 * 認証状態の変更を監視し、トークンキャッシュをクリア
 */
export function setupAuthListener(): void {
  const auth = getAuth();
  onAuthStateChanged(auth, (user) => {
    if (!user) {
      // ログアウト時はキャッシュをクリア
      cachedToken = null;
      tokenExpiryTime = 0;
    }
  });
}

/**
 * 指数バックオフでリトライするユーティリティ関数
 */
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  retryConfig: RetryConfig = DEFAULT_RETRY_CONFIG
): Promise<T> {
  let lastError: any;
  let delay = retryConfig.initialDelay;
  
  for (let attempt = 0; attempt <= retryConfig.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // リトライ条件を満たさない場合はエラーをスロー
      if (!retryConfig.retryCondition(error)) {
        throw error;
      }
      
      // 最大リトライ回数に達した場合はエラーをスロー
      if (attempt >= retryConfig.maxRetries) {
        throw error;
      }
      
      // リトライ前に待機
      await new Promise(resolve => setTimeout(resolve, delay));
      
      // 次の待機時間を計算（指数バックオフ）
      delay = Math.min(delay * retryConfig.factor, retryConfig.maxDelay);
      
      // ログ出力
      if (enableLogging()) {
        console.log(`リクエストをリトライしています(${attempt + 1}/${retryConfig.maxRetries})...`);
      }
    }
  }
  
  throw lastError;
}

/**
 * モックレスポンスを生成する
 */
function createMockResponse<T>(url: string, method: string): ApiResponse<T> {
  // 開発用のモックデータを返す
  // 実際の実装では、パターンマッチングやモックデータストアを使うべきです
  return {
    success: true,
    data: { message: '開発環境用のモックレスポンスです' } as any,
    status: 200,
    headers: new Headers({ 'x-mock': 'true' })
  };
}

/**
 * リクエストを実行してレスポンスを処理する
 * 
 * @param url エンドポイントURL
 * @param options リクエストオプション
 * @param cacheConfig キャッシュ設定
 * @returns 処理済みのレスポンス
 */
async function request<T = any>(
  url: string,
  options: RequestInit = {},
  cacheConfig: {
    useCache?: boolean;
    expiry?: number;
    bypassCache?: boolean;
  } = {}
): Promise<ApiResponse<T>> {
  // デフォルトのキャッシュ設定
  const { useCache = true, expiry = 3600000, bypassCache = false } = cacheConfig;
  
  // 開発環境でモックデータを使用する場合
  if (useMockData() && options.method !== 'POST' && options.method !== 'PUT' && options.method !== 'DELETE') {
    if (enableLogging()) {
      console.log(`モックデータを使用: ${options.method || 'GET'} ${url}`);
    }
    return createMockResponse<T>(url, options.method || 'GET');
  }
  
  // キャッシュから取得を試みる（GETリクエストのみ）
  if (
    useCache &&
    !bypassCache &&
    (options.method === 'GET' || !options.method)
  ) {
    const params = url.includes('?') ? 
      Object.fromEntries(new URLSearchParams(url.split('?')[1]).entries()) : 
      undefined;
    
    const cachedResponse = await getCachedResponse<T>(url, params);
    if (cachedResponse) {
      return cachedResponse;
    }
  }
  
  // オフライン時はキューに追加してエラーをスロー
  if (!isOnline()) {
    // GETリクエスト以外のリクエストはキューに追加
    if (options.method && options.method !== 'GET') {
      await queueRequest(
        url,
        options.method,
        options.body,
        options.headers
      );
      
      return {
        success: false,
        error: {
          code: 'OFFLINE',
          message: 'オフラインモードです。リクエストはキューに追加され、オンラインになったときに処理されます。'
        },
        status: 0,
        headers: new Headers()
      };
    } else {
      // GETリクエストの場合は直接エラーを返す
      return {
        success: false,
        error: {
          code: 'OFFLINE',
          message: 'オフラインモードです。後でもう一度お試しください。'
        },
        status: 0,
        headers: new Headers()
      };
    }
  }
  
  try {
    // 実際のリクエスト処理をリトライ対応で実行
    return await retryWithBackoff(async () => {
      // デフォルトのタイムアウト設定
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), getApiTimeout());
      
      // 認証トークンを取得
      const token = await getAuthToken();
      
      // ヘッダーを準備
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...options.headers,
      };
      
      // 認証トークンがあれば追加
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      // CSRFトークンがあれば追加（将来的な拡張用）
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
      if (csrfToken) {
        headers['X-CSRF-Token'] = csrfToken;
      }
      
      // オプションをマージ
      const mergedOptions: RequestInit = {
        headers,
        credentials: 'include', // クッキーを送信
        signal: controller.signal,
        ...options,
      };
      
      // リクエスト実行
      const response = await fetch(url, mergedOptions);
      clearTimeout(timeoutId);
      
      // レスポンスヘッダー
      const responseHeaders = response.headers;
      const contentType = responseHeaders.get('content-type') || '';
      
      // レスポンスボディの取得
      let data;
      if (contentType.includes('application/json')) {
        data = await response.json();
      } else if (contentType.includes('text/')) {
        data = await response.text();
      } else {
        // バイナリデータなど
        data = await response.blob();
      }
      
      // 成功レスポンスの処理
      if (response.ok) {
        const successResponse: ApiResponse<T> = {
          success: true,
          data,
          status: response.status,
          headers: responseHeaders
        };
        
        // キャッシュに保存（GETリクエストのみ）
        if (useCache && (options.method === 'GET' || !options.method)) {
          const params = url.includes('?') ? 
            Object.fromEntries(new URLSearchParams(url.split('?')[1]).entries()) : 
            undefined;
          
          await cacheResponse<T>(url, options.method || 'GET', successResponse, params, expiry);
        }
        
        return successResponse;
      }
      
      // エラーレスポンスの処理
      let errorData = {
        code: 'UNKNOWN_ERROR',
        message: 'An unknown error occurred',
      };
      
      if (typeof data === 'object' && data !== null) {
        errorData = {
          ...errorData,
          ...data,
        };
      }
      
      // 401エラーの場合、トークンキャッシュをクリア
      if (response.status === 401) {
        cachedToken = null;
        tokenExpiryTime = 0;
      }
      
      const errorResponse: ApiResponse<T> = {
        success: false,
        error: errorData,
        status: response.status,
        headers: responseHeaders
      };
      
      // 500系エラーはリトライ対象
      if (response.status >= 500 && response.status < 600) {
        throw errorResponse;
      }
      
      return errorResponse;
    });
  } catch (error) {
    // エラー処理
    if (enableLogging()) {
      console.error('API request error:', error);
    }
    
    // AbortControllerによるタイムアウトの場合
    if (error instanceof DOMException && error.name === 'AbortError') {
      return {
        success: false,
        error: {
          code: 'TIMEOUT',
          message: 'リクエストがタイムアウトしました',
        },
        status: 0,
        headers: new Headers(),
      };
    }
    
    // API応答エラーの場合はそのまま返す
    if (error && typeof error === 'object' && 'success' in error && !error.success) {
      return error as ApiResponse<T>;
    }
    
    // ネットワークエラーなど
    return {
      success: false,
      error: {
        code: 'NETWORK_ERROR',
        message: error instanceof Error ? error.message : 'ネットワークエラーが発生しました',
        details: error
      },
      status: 0,
      headers: new Headers(),
    };
  }
}

/**
 * GETリクエスト
 */
async function get<T = any>(
  url: string,
  params: Record<string, any> = {},
  options: RequestInit = {},
  cacheConfig: { useCache?: boolean; expiry?: number; bypassCache?: boolean } = {}
): Promise<ApiResponse<T>> {
  // URLパラメータの構築
  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      queryParams.append(key, String(value));
    }
  });
  
  const queryString = queryParams.toString();
  const fullUrl = queryString ? `${url}?${queryString}` : url;
  
  // ログ出力
  if (enableLogging()) {
    console.log(`GET リクエスト: ${fullUrl}`);
  }
  
  return request<T>(fullUrl, {
    method: 'GET',
    ...options,
  }, cacheConfig);
}

/**
 * POSTリクエスト
 */
async function post<T = any>(
  url: string,
  data?: any,
  options: RequestInit = {},
  cacheConfig: { expiry?: number } = {}
): Promise<ApiResponse<T>> {
  // ログ出力
  if (enableLogging()) {
    console.log(`POST リクエスト: ${url}`, data);
  }
  
  return request<T>(url, {
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
    ...options,
  }, { useCache: false, ...cacheConfig });
}

/**
 * PUTリクエスト
 */
async function put<T = any>(
  url: string,
  data?: any,
  options: RequestInit = {},
  cacheConfig: { expiry?: number } = {}
): Promise<ApiResponse<T>> {
  // ログ出力
  if (enableLogging()) {
    console.log(`PUT リクエスト: ${url}`, data);
  }
  
  return request<T>(url, {
    method: 'PUT',
    body: data ? JSON.stringify(data) : undefined,
    ...options,
  }, { useCache: false, ...cacheConfig });
}

/**
 * PATCHリクエスト
 */
async function patch<T = any>(
  url: string,
  data?: any,
  options: RequestInit = {},
  cacheConfig: { expiry?: number } = {}
): Promise<ApiResponse<T>> {
  // ログ出力
  if (enableLogging()) {
    console.log(`PATCH リクエスト: ${url}`, data);
  }
  
  return request<T>(url, {
    method: 'PATCH',
    body: data ? JSON.stringify(data) : undefined,
    ...options,
  }, { useCache: false, ...cacheConfig });
}

/**
 * DELETEリクエスト
 */
async function del<T = any>(
  url: string,
  options: RequestInit = {},
  cacheConfig: { expiry?: number } = {}
): Promise<ApiResponse<T>> {
  // ログ出力
  if (enableLogging()) {
    console.log(`DELETE リクエスト: ${url}`);
  }
  
  return request<T>(url, {
    method: 'DELETE',
    ...options,
  }, { useCache: false, ...cacheConfig });
}

/**
 * ファイルアップロード用POSTリクエスト
 */
async function uploadFile<T = any>(
  url: string,
  file: File,
  fieldName: string = 'file',
  additionalData: Record<string, any> = {},
  options: RequestInit = {},
  progressCallback?: (progress: number) => void
): Promise<ApiResponse<T>> {
  try {
    // オフライン時はエラーを返す
    if (!isOnline()) {
      return {
        success: false,
        error: {
          code: 'OFFLINE',
          message: 'オフラインモードではファイルをアップロードできません'
        },
        status: 0,
        headers: new Headers()
      };
    }
    
    // 認証トークンを取得
    const token = await getAuthToken();
    
    const formData = new FormData();
    formData.append(fieldName, file);
    
    // 追加のデータがあれば追加
    Object.entries(additionalData).forEach(([key, value]) => {
      formData.append(key, String(value));
    });
    
    // プログレスコールバックがある場合はXMLHttpRequestを使用
    if (progressCallback) {
      return new Promise((resolve, reject) => {
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
            
            resolve({
              success: true,
              data,
              status: xhr.status,
              headers: new Headers(
                xhr.getAllResponseHeaders().split('\r\n')
                  .filter(Boolean)
                  .reduce((acc, header) => {
                    const [name, value] = header.split(': ');
                    acc[name.toLowerCase()] = value;
                    return acc;
                  }, {} as Record<string, string>)
              )
            });
          } else {
            let errorData;
            try {
              errorData = JSON.parse(xhr.responseText);
            } catch (e) {
              errorData = { message: 'Unknown error' };
            }
            
            resolve({
              success: false,
              error: {
                code: `HTTP_${xhr.status}`,
                message: errorData.message || 'Request failed',
                details: errorData
              },
              status: xhr.status,
              headers: new Headers(
                xhr.getAllResponseHeaders().split('\r\n')
                  .filter(Boolean)
                  .reduce((acc, header) => {
                    const [name, value] = header.split(': ');
                    acc[name.toLowerCase()] = value;
                    return acc;
                  }, {} as Record<string, string>)
              )
            });
          }
        });
        
        xhr.addEventListener('error', () => {
          reject(new Error('Network error occurred'));
        });
        
        xhr.addEventListener('abort', () => {
          reject(new Error('Request was aborted'));
        });
        
        xhr.addEventListener('timeout', () => {
          reject(new Error('Request timed out'));
        });
        
        xhr.open('POST', url);
        
        // タイムアウト設定
        xhr.timeout = getApiTimeout();
        
        // 認証トークンを設定
        if (token) {
          xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        }
        
        // CSRFトークンがあれば追加
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
        if (csrfToken) {
          xhr.setRequestHeader('X-CSRF-Token', csrfToken);
        }
        
        // 追加のヘッダーがあれば設定
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
    
    // プログレスコールバックがない場合は通常のfetchを使用
    return request<T>(url, {
      method: 'POST',
      body: formData,
      headers: token ? { 'Authorization': `Bearer ${token}` } : undefined,
      ...options,
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
      headers: new Headers(),
    };
  }
}

/**
 * APIリクエストをログ出力（開発環境のみ）
 */
export function logApiRequest(method: string, url: string, data?: any): void {
  if (enableLogging()) {
    console.groupCollapsed(`🚀 API Request: ${method} ${url}`);
    console.log('URL:', url);
    console.log('Method:', method);
    if (data) console.log('Data:', data);
    console.groupEnd();
  }
}

/**
 * APIレスポンスをログ出力（開発環境のみ）
 */
export function logApiResponse<T = any>(method: string, url: string, response: ApiResponse<T>): void {
  if (enableLogging()) {
    if (response.success) {
      console.groupCollapsed(`✅ API Response: ${method} ${url}`);
    } else {
      console.groupCollapsed(`❌ API Error: ${method} ${url}`);
    }
    console.log('Status:', response.status);
    console.log('Success:', response.success);
    if (response.data) console.log('Data:', response.data);
    if (response.error) console.log('Error:', response.error);
    console.groupEnd();
  }
}

/**
 * キャッシュをクリア
 */
export function clearApiCache(pattern?: string): Promise<void> {
  return apiCache.clearCache(pattern);
}

/**
 * キャッシュされているリソースの一覧を取得
 */
export async function getCachedResources(): Promise<string[]> {
  // この機能は実際のデータベースAPIを使って実装する必要があります
  // モック実装のみを提供
  return ['cached-resources-not-implemented'];
}

/**
 * オフラインキューに溜まっているリクエストの数を取得
 */
export async function getQueuedRequestCount(): Promise<number> {
  // この機能は実際のデータベースAPIを使って実装する必要があります
  // モック実装のみを提供
  return 0;
}

// アプリケーション起動時に認証リスナーを設定
setupAuthListener();

// オフラインモード時のリクエスト処理用リスナーを設定
setupOfflineListeners((url: string, method: string, body: any, headers: HeadersInit) => {
  // リクエストを処理する関数
  const options: RequestInit = { method, headers };
  if (body) {
    options.body = body;
  }
  
  return request(url, options);
});

// APIクライアントをエクスポート
const apiClientComplete = {
  get,
  post,
  put,
  patch,
  delete: del, // 'delete'はJavaScriptの予約語のためdelをエイリアスとして使用
  uploadFile,
  getAuthToken,
  clearCache: clearApiCache,
  getCachedResources,
  getQueuedRequestCount,
};

export default apiClientComplete;
