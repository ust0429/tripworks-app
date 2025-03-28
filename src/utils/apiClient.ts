/**
 * APIクライアント
 * 
 * RESTful API呼び出しのためのシンプルなラッパー
 */

import { API_BASE_URL } from '../config/api';

// APIオプションの型定義
export interface ApiOptions {
  headers?: Record<string, string>;
  params?: Record<string, any>;
  timeout?: number;
}

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

// APIクライアントインターフェース
export interface ApiClient {
  get<T = any>(
    url: string,
    options?: ApiOptions
  ): Promise<ApiResponse<T>>;
  post<T = any>(
    url: string,
    data?: any,
    options?: ApiOptions
  ): Promise<ApiResponse<T>>;
  put<T = any>(
    url: string,
    data?: any,
    options?: ApiOptions
  ): Promise<ApiResponse<T>>;
  patch<T = any>(
    url: string,
    data?: any,
    options?: ApiOptions
  ): Promise<ApiResponse<T>>;
  delete<T = any>(
    url: string,
    options?: ApiOptions
  ): Promise<ApiResponse<T>>;
  uploadFile<T = any>(
    url: string,
    file: File,
    fieldName?: string,
    additionalData?: Record<string, any>,
    options?: ApiOptions,
    progressCallback?: (progress: number) => void
  ): Promise<ApiResponse<T>>;
}

/**
 * 簡易APIクライアント
 *
 * 認証機能なしのシンプルな実装
 */
class SimpleApiClient implements ApiClient {
  async get<T = any>(
    url: string,
    options: ApiOptions = {}
  ): Promise<ApiResponse<T>> {
    const queryParams = new URLSearchParams();
    
    if (options.params) {
      Object.entries(options.params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }
    
    const queryString = queryParams.toString();
    const fullUrl = queryString ? `${url}?${queryString}` : url;
    
    return this.request<T>(fullUrl, {
      method: 'GET',
      headers: options.headers,
      timeout: options.timeout
    });
  }

  async post<T = any>(
    url: string,
    data?: any,
    options: ApiOptions = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>(url, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
      headers: options.headers,
      timeout: options.timeout
    });
  }

  async put<T = any>(
    url: string,
    data?: any,
    options: ApiOptions = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>(url, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
      headers: options.headers,
      timeout: options.timeout
    });
  }

  async patch<T = any>(
    url: string,
    data?: any,
    options: ApiOptions = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>(url, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
      headers: options.headers,
      timeout: options.timeout
    });
  }

  async delete<T = any>(
    url: string,
    options: ApiOptions = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>(url, {
      method: 'DELETE',
      headers: options.headers,
      timeout: options.timeout
    });
  }

  async uploadFile<T = any>(
    url: string,
    file: File,
    fieldName: string = 'file',
    additionalData: Record<string, any> = {},
    options: ApiOptions = {},
    progressCallback?: (progress: number) => void
  ): Promise<ApiResponse<T>> {
    const formData = new FormData();
    formData.append(fieldName, file);

    Object.entries(additionalData).forEach(([key, value]) => {
      formData.append(key, String(value));
    });

    // プログレスコールバックがある場合はモック実装（実際の実装は拡張APIクライアントで行う）
    if (progressCallback) {
      setTimeout(() => progressCallback(50), 500);
      setTimeout(() => progressCallback(100), 1000);
    }

    return this.request<T>(url, {
      method: 'POST',
      body: formData,
      headers: options.headers,
      timeout: options.timeout
    });
  }

  private async request<T = any>(
    url: string,
    options: {
      method: string;
      body?: any;
      headers?: Record<string, string>;
      timeout?: number;
    } = { method: 'GET' }
  ): Promise<ApiResponse<T>> {
    try {
      // URLの先頭にベースURLがない場合は追加
      const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;

      // ヘッダーにContent-Typeを設定（フォームデータの場合は設定しない）
      const headers: HeadersInit = {
        ...options.headers,
      };

      if (
        options.body &&
        !(options.body instanceof FormData) &&
        !headers['Content-Type']
      ) {
        headers['Content-Type'] = 'application/json';
      }

      // AbortController for timeout
      const controller = new AbortController();
      let timeoutId: NodeJS.Timeout | null = null;
      
      if (options.timeout) {
        timeoutId = setTimeout(() => controller.abort(), options.timeout);
      }

      const mergedOptions: RequestInit = {
        method: options.method,
        headers,
        body: options.body,
        signal: controller.signal
      };

      const response = await fetch(fullUrl, mergedOptions);
      
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

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
          headers: responseHeaders,
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
        headers: responseHeaders,
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

      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: error instanceof Error ? error.message : 'Network error',
          details: error,
        },
        status: 0,
        headers: new Headers(),
      };
    }
  }
}

/**
 * APIリクエストをログ出力（開発環境のみ）
 */
export function logApiRequest(method: string, url: string, data?: any): void {
  if (process.env.NODE_ENV === 'development' || process.env.DEBUG === 'true') {
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
export function logApiResponse<T = any>(
  method: string,
  url: string,
  response: ApiResponse<T>
): void {
  if (process.env.NODE_ENV === 'development' || process.env.DEBUG === 'true') {
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

// APIクライアントのシングルトンインスタンス
const api = new SimpleApiClient();

export default api;