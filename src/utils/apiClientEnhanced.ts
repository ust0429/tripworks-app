/**
 * 強化版 API クライアント
 * 
 * セキュリティ対策を強化したHTTPリクエスト用のユーティリティ
 * XSS対策とCSRF対策を実装
 */

import { API_BASE_URL, DEFAULT_HEADERS, DEFAULT_TIMEOUT } from '../config/api';
import { isProduction } from '../config/env';
import { sanitizeInput, generateCsrfToken } from './securityUtils';

// レスポンスの型定義
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

// APIオプションの型定義
export interface ApiOptions {
  headers?: Record<string, string>;
  timeout?: number;
  withCredentials?: boolean;
  enableCsrf?: boolean;
  sanitizeResponse?: boolean;
}

// デフォルトのオプション
const defaultOptions: ApiOptions = {
  headers: DEFAULT_HEADERS,
  timeout: DEFAULT_TIMEOUT,
  withCredentials: true,
  enableCsrf: true,
  sanitizeResponse: true
};

// CSRFトークンのストレージキー
const CSRF_TOKEN_KEY = 'echo_csrf_token';

/**
 * CSRFトークンを取得または生成する
 */
function getCsrfToken(): string {
  let token = localStorage.getItem(CSRF_TOKEN_KEY);
  
  if (!token) {
    token = generateCsrfToken();
    localStorage.setItem(CSRF_TOKEN_KEY, token);
  }
  
  return token;
}

/**
 * レスポンスデータを再帰的にサニタイズする
 * 
 * @param data サニタイズするデータ
 * @returns サニタイズされたデータ
 */
function sanitizeResponseData(data: any): any {
  if (data === null || data === undefined) {
    return data;
  }
  
  if (typeof data === 'string') {
    return sanitizeInput(data);
  }
  
  if (Array.isArray(data)) {
    return data.map(item => sanitizeResponseData(item));
  }
  
  if (typeof data === 'object') {
    const sanitizedData: Record<string, any> = {};
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        sanitizedData[key] = sanitizeResponseData(data[key]);
      }
    }
    return sanitizedData;
  }
  
  return data;
}

/**
 * リクエスト関数
 * 非同期でHTTPリクエストを行います
 */
async function request<T = any>(
  method: string,
  endpoint: string,
  data?: any,
  options?: ApiOptions
): Promise<ApiResponse<T>> {
  const opts = { ...defaultOptions, ...options };
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
  
  // CSRFトークンの設定
  const headers: Record<string, string> = {
    ...DEFAULT_HEADERS,
    ...opts.headers
  };
  
  if (opts.enableCsrf && (method === 'POST' || method === 'PUT' || method === 'DELETE' || method === 'PATCH')) {
    headers['X-CSRF-Token'] = getCsrfToken();
  }
  
  // JSONデータの場合はContent-Typeを設定
  if (data && !(data instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  } else if (data instanceof FormData) {
    // FormDataの場合はContent-Typeヘッダーを削除（ブラウザが自動設定）
    delete headers['Content-Type'];
  }
  
  // タイムアウト処理のための Promise
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new Error(`Request timeout after ${opts.timeout}ms`));
    }, opts.timeout);
  });
  
  // Fetch APIを使用したリクエスト
  const fetchPromise = fetch(url, {
    method,
    headers,
    credentials: opts.withCredentials ? 'include' : 'same-origin',
    body: data instanceof FormData
      ? data
      : data
        ? JSON.stringify(data)
        : undefined
  })
  .then(async (response) => {
    let responseData;
    
    // レスポンスボディの解析を試みる
    try {
      const contentType = response.headers.get('Content-Type') || '';
      if (contentType.includes('application/json')) {
        responseData = await response.json();
      } else {
        responseData = await response.text();
      }
    } catch (error) {
      // レスポンスの解析に失敗した場合
      responseData = { message: 'Failed to parse response' };
    }
    
    // 成功レスポンス
    if (response.ok) {
      // レスポンスデータのサニタイズが有効な場合
      if (opts.sanitizeResponse && typeof responseData === 'object') {
        responseData = sanitizeResponseData(responseData);
      }
      
      return {
        success: true,
        data: responseData
      };
    }
    
    // エラーレスポンス
    return {
      success: false,
      error: {
        code: response.status.toString(),
        message: responseData.message || response.statusText,
        details: responseData
      }
    };
  })
  .catch((error) => {
    // ネットワークエラーなど
    return {
      success: false,
      error: {
        code: 'NETWORK_ERROR',
        message: error.message || 'Network request failed',
      }
    };
  });
  
  // タイムアウトとフェッチを競争させる
  try {
    const result = await Promise.race([fetchPromise, timeoutPromise]) as ApiResponse<T>;
    return result;
  } catch (error) {
    return {
      success: false,
      error: {
        code: 'TIMEOUT',
        message: error instanceof Error ? error.message : 'Request timed out',
      }
    };
  }
}

/**
 * GETリクエスト
 */
export function get<T = any>(endpoint: string, options?: ApiOptions): Promise<ApiResponse<T>> {
  return request<T>('GET', endpoint, undefined, options);
}

/**
 * POSTリクエスト
 */
export function post<T = any>(endpoint: string, data?: any, options?: ApiOptions): Promise<ApiResponse<T>> {
  return request<T>('POST', endpoint, data, options);
}

/**
 * PUTリクエスト
 */
export function put<T = any>(endpoint: string, data?: any, options?: ApiOptions): Promise<ApiResponse<T>> {
  return request<T>('PUT', endpoint, data, options);
}

/**
 * PATCHリクエスト
 */
export function patch<T = any>(endpoint: string, data?: any, options?: ApiOptions): Promise<ApiResponse<T>> {
  return request<T>('PATCH', endpoint, data, options);
}

/**
 * DELETEリクエスト
 */
export function del<T = any>(endpoint: string, options?: ApiOptions): Promise<ApiResponse<T>> {
  return request<T>('DELETE', endpoint, undefined, options);
}

/**
 * FormDataを使用したファイルアップロード
 */
export function uploadFile<T = any>(
  endpoint: string, 
  file: File, 
  fieldName: string = 'file',
  additionalData?: Record<string, string>,
  options?: ApiOptions
): Promise<ApiResponse<T>> {
  const formData = new FormData();
  formData.append(fieldName, file);
  
  // 追加データがあれば追加
  if (additionalData) {
    Object.entries(additionalData).forEach(([key, value]) => {
      formData.append(key, value);
    });
  }
  
  // CSRFトークンをFormDataに追加
  if (!options?.enableCsrf === false) {
    formData.append('csrf_token', getCsrfToken());
  }
  
  // Content-Typeヘッダーは自動的に設定されるので削除
  const customOptions: ApiOptions = {
    ...options,
    enableCsrf: false, // すでにFormDataにCSRFトークンを含めている
  };
  
  return post<T>(endpoint, formData, customOptions);
}

/**
 * API接続のヘルスチェック
 */
export async function healthCheck(): Promise<boolean> {
  try {
    const response = await get('/health');
    return response.success;
  } catch (error) {
    return false;
  }
}

/**
 * デバッグログ出力
 */
export function logApiRequest(method: string, endpoint: string, data?: any): void {
  if (!isProduction()) {
    console.group(`API Request: ${method} ${endpoint}`);
    if (data) console.log('Request Data:', data);
    console.groupEnd();
  }
}

/**
 * デバッグレスポンスログ出力
 */
export function logApiResponse<T>(method: string, endpoint: string, response: ApiResponse<T>): void {
  if (!isProduction()) {
    console.group(`API Response: ${method} ${endpoint}`);
    console.log('Success:', response.success);
    if (response.data) console.log('Response Data:', response.data);
    if (response.error) console.error('Error:', response.error);
    console.groupEnd();
  }
}

/**
 * アップロードの進捗を追跡するファイルアップロード
 * XMLHttpRequestを使用して進捗イベントを取得
 */
export function uploadFileWithProgress<T = any>(
  endpoint: string,
  file: File,
  onProgress?: (progressEvent: { loaded: number; total: number; percentage: number }) => void,
  fieldName: string = 'file',
  additionalData?: Record<string, string>,
  options?: ApiOptions
): Promise<ApiResponse<T>> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    
    // ファイルを追加
    formData.append(fieldName, file);
    
    // 追加データがあれば追加
    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, value);
      });
    }
    
    // CSRFトークンを追加
    formData.append('csrf_token', getCsrfToken());
    
    // 進捗イベントリスナーを設定
    if (onProgress) {
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percentage = Math.round((e.loaded / e.total) * 100);
          onProgress({
            loaded: e.loaded,
            total: e.total,
            percentage
          });
        }
      });
    }
    
    // レスポンスイベントリスナーを設定
    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        // 成功レスポンス
        try {
          const data = JSON.parse(xhr.responseText);
          resolve({
            success: true,
            data: options?.sanitizeResponse ? sanitizeResponseData(data) : data
          });
        } catch (error) {
          // JSONパースエラー
          resolve({
            success: true,
            data: { rawResponse: xhr.responseText } as any
          });
        }
      } else {
        // エラーレスポンス
        try {
          const errorData = JSON.parse(xhr.responseText);
          resolve({
            success: false,
            error: {
              code: xhr.status.toString(),
              message: errorData.message || xhr.statusText,
              details: errorData
            }
          });
        } catch (error) {
          // JSONパースエラー
          resolve({
            success: false,
            error: {
              code: xhr.status.toString(),
              message: xhr.statusText,
              details: { rawResponse: xhr.responseText }
            }
          });
        }
      }
    });
    
    // エラーイベントリスナーを設定
    xhr.addEventListener('error', () => {
      resolve({
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: 'Network request failed'
        }
      });
    });
    
    // アボートイベントリスナーを設定
    xhr.addEventListener('abort', () => {
      resolve({
        success: false,
        error: {
          code: 'ABORTED',
          message: 'Request was aborted'
        }
      });
    });
    
    // タイムアウトイベントリスナーを設定
    xhr.addEventListener('timeout', () => {
      resolve({
        success: false,
        error: {
          code: 'TIMEOUT',
          message: 'Request timed out'
        }
      });
    });
    
    // リクエストを設定して送信
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
    xhr.open('POST', url);
    
    // 認証情報を含める
    xhr.withCredentials = options?.withCredentials ?? defaultOptions.withCredentials ?? true;
    
    // タイムアウトを設定
    xhr.timeout = options?.timeout ?? defaultOptions.timeout ?? 30000;
    
    // ヘッダーを設定
    if (options?.headers) {
      Object.entries(options.headers).forEach(([key, value]) => {
        // Content-Typeはブラウザが自動設定するので除外
        if (key.toLowerCase() !== 'content-type') {
          xhr.setRequestHeader(key, value);
        }
      });
    }
    
    // デフォルトヘッダーを設定
    Object.entries(DEFAULT_HEADERS).forEach(([key, value]) => {
      // Content-Typeはブラウザが自動設定するので除外
      if (key.toLowerCase() !== 'content-type') {
        xhr.setRequestHeader(key, value);
      }
    });
    
    // CSRFトークンをヘッダーに追加
    xhr.setRequestHeader('X-CSRF-Token', getCsrfToken());
    
    // リクエストを送信
    xhr.send(formData);
  });
}

export default {
  get,
  post,
  put,
  patch,
  delete: del,
  uploadFile,
  uploadFileWithProgress,
  healthCheck,
  logApiRequest,
  logApiResponse
};
