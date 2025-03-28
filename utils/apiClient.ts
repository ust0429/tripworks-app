/**
 * APIクライアント
 * 
 * APIリクエストを行うための共通ユーティリティ
 */

import { getApiUrl } from '../config/env';
import { getAuth, getIdToken } from 'firebase/auth';

// APIレスポンスの型定義
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
}

// API設定
const API_TIMEOUT = 30000; // 30秒

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
    
    // トークンを取得
    const token = await getIdToken(user, true);
    return token;
  } catch (error) {
    console.error('認証トークン取得エラー:', error);
    return null;
  }
}

/**
 * リクエストを実行してレスポンスを処理する
 * 
 * @param url エンドポイントURL
 * @param options リクエストオプション
 * @returns 処理済みのレスポンス
 */
async function request<T = any>(url: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  try {
    // デフォルトのタイムアウト設定
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);
    
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
      return {
        success: true,
        data,
        status: response.status,
        headers: responseHeaders
      };
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
    
    return {
      success: false,
      error: errorData,
      status: response.status,
      headers: responseHeaders
    };
  } catch (error) {
    console.error('API request error:', error);
    
    // AbortControllerによるタイムアウトの場合
    if (error instanceof DOMException && error.name === 'AbortError') {
      return {
        success: false,
        error: {
          code: 'TIMEOUT',
          message: 'Request timed out',
        },
        status: 0,
        headers: new Headers(),
      };
    }
    
    // ネットワークエラーなど
    return {
      success: false,
      error: {
        code: 'NETWORK_ERROR',
        message: error instanceof Error ? error.message : 'Network error',
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
async function get<T = any>(url: string, params: Record<string, any> = {}, options: RequestInit = {}): Promise<ApiResponse<T>> {
  // URLパラメータの構築
  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      queryParams.append(key, String(value));
    }
  });
  
  const queryString = queryParams.toString();
  const fullUrl = queryString ? `${url}?${queryString}` : url;
  
  return request<T>(fullUrl, {
    method: 'GET',
    ...options,
  });
}

/**
 * POSTリクエスト
 */
async function post<T = any>(url: string, data?: any, options: RequestInit = {}): Promise<ApiResponse<T>> {
  return request<T>(url, {
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
    ...options,
  });
}

/**
 * PUTリクエスト
 */
async function put<T = any>(url: string, data?: any, options: RequestInit = {}): Promise<ApiResponse<T>> {
  return request<T>(url, {
    method: 'PUT',
    body: data ? JSON.stringify(data) : undefined,
    ...options,
  });
}

/**
 * PATCHリクエスト
 */
async function patch<T = any>(url: string, data?: any, options: RequestInit = {}): Promise<ApiResponse<T>> {
  return request<T>(url, {
    method: 'PATCH',
    body: data ? JSON.stringify(data) : undefined,
    ...options,
  });
}

/**
 * DELETEリクエスト
 */
async function del<T = any>(url: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  return request<T>(url, {
    method: 'DELETE',
    ...options,
  });
}

/**
 * ファイルアップロード用POSTリクエスト
 */
async function uploadFile<T = any>(
  url: string,
  file: File,
  fieldName: string = 'file',
  additionalData: Record<string, any> = {},
  progressCallback?: (progress: number) => void
): Promise<ApiResponse<T>> {
  try {
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
            
            resolve({
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
                    if (name && value) {
                      acc[name.toLowerCase()] = value;
                    }
                    return acc;
                  }, {} as Record<string, string>)
              )
            });
          }
        });
        
        xhr.addEventListener('error', () => {
          resolve({
            success: false,
            error: {
              code: 'NETWORK_ERROR',
              message: 'Network error occurred'
            },
            status: 0,
            headers: new Headers()
          });
        });
        
        xhr.addEventListener('abort', () => {
          resolve({
            success: false,
            error: {
              code: 'ABORTED',
              message: 'Request was aborted'
            },
            status: 0,
            headers: new Headers()
          });
        });
        
        xhr.addEventListener('timeout', () => {
          resolve({
            success: false,
            error: {
              code: 'TIMEOUT',
              message: 'Request timed out'
            },
            status: 0,
            headers: new Headers()
          });
        });
        
        xhr.open('POST', url);
        
        // タイムアウト設定
        xhr.timeout = API_TIMEOUT;
        
        // 認証トークンを設定
        if (token) {
          xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        }
        
        xhr.send(formData);
      });
    }
    
    // プログレスコールバックがない場合は通常のfetchを使用
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
      headers: token ? { 'Authorization': `Bearer ${token}` } : undefined,
    });
    
    const contentType = response.headers.get('content-type') || '';
    let data;
    
    if (contentType.includes('application/json')) {
      data = await response.json();
    } else if (contentType.includes('text/')) {
      data = await response.text();
    } else {
      data = await response.blob();
    }
    
    if (response.ok) {
      return {
        success: true,
        data,
        status: response.status,
        headers: response.headers
      };
    }
    
    return {
      success: false,
      error: {
        code: `HTTP_${response.status}`,
        message: typeof data === 'object' && data?.message ? data.message : 'Upload failed',
        details: data
      },
      status: response.status,
      headers: response.headers
    };
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
  if (process.env.NODE_ENV === 'development' || process.env.REACT_APP_DEBUG_MODE === 'true') {
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
  if (process.env.NODE_ENV === 'development' || process.env.REACT_APP_DEBUG_MODE === 'true') {
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

// APIクライアントをエクスポート
const apiClient = {
  get,
  post,
  put,
  patch,
  delete: del, // 'delete'はJavaScriptの予約語のためdelをエイリアスとして使用
  uploadFile,
  getAuthToken
};

export default apiClient;
