/**
 * API通信用クライアント
 * 
 * fetch APIをラップして一貫したAPIリクエスト処理を提供します。
 */
import { isDevelopment, isDebugMode } from '../config/env';

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
    
    // オプションをマージ
    const mergedOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include', // クッキーを送信
      signal: controller.signal,
      ...options,
    };
    
    // リクエスト実行
    const response = await fetch(url, mergedOptions);
    clearTimeout(timeoutId);
    
    // レスポンスヘッダー
    const headers = response.headers;
    const contentType = headers.get('content-type') || '';
    
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
        headers
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
      headers
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
async function uploadFile<T = any>(url: string, file: File, fieldName: string = 'file', additionalData: Record<string, any> = {}, options: RequestInit = {}): Promise<ApiResponse<T>> {
  const formData = new FormData();
  formData.append(fieldName, file);
  
  // 追加のデータがあれば追加
  Object.entries(additionalData).forEach(([key, value]) => {
    formData.append(key, String(value));
  });
  
  return request<T>(url, {
    method: 'POST',
    body: formData,
    headers: {
      // Content-Typeはブラウザが自動設定するのでここでは指定しない
      ...options.headers,
    },
    ...options,
  });
}

/**
 * APIリクエストをログ出力（開発環境のみ）
 */
export function logApiRequest(method: string, url: string, data?: any): void {
  if (isDevelopment() || isDebugMode()) {
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
  if (isDevelopment() || isDebugMode()) {
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
};

export default apiClient;