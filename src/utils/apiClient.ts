/**
 * API クライアント
 * 
 * HTTP リクエストを行うための共通ユーティリティ
 */

import { API_BASE_URL, DEFAULT_HEADERS, DEFAULT_TIMEOUT } from '../config/api';
import { isProduction } from '../config/env';

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
}

// デフォルトのオプション
const defaultOptions: ApiOptions = {
  headers: DEFAULT_HEADERS,
  timeout: DEFAULT_TIMEOUT,
  withCredentials: true
};

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
  
  // タイムアウト処理のための Promise
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new Error(`Request timeout after ${opts.timeout}ms`));
    }, opts.timeout);
  });
  
  // Fetch APIを使用したリクエスト
  const fetchPromise = fetch(url, {
    method,
    headers: {
      ...DEFAULT_HEADERS,
      ...opts.headers,
      ...(data && !(data instanceof FormData) ? { 'Content-Type': 'application/json' } : {})
    },
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
  
  // Content-Typeヘッダーは自動的に設定されるので削除
  const customOptions: ApiOptions = {
    ...options,
    headers: {
      ...options?.headers,
    }
  };
  
  // Content-Typeを明示的に削除（自動的に設定されるため）
  if (customOptions.headers) {
    delete customOptions.headers['Content-Type'];
  }
  
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

export default {
  get,
  post,
  put,
  patch,
  delete: del,
  uploadFile,
  healthCheck
};
