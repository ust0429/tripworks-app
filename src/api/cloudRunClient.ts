/**
 * Cloud Run APIクライアント
 *
 * Google Cloud Run上のサービスに対するAPI呼び出しを行うクライアント
 */

import { ApiClient, ApiResponse, ApiOptions } from '../utils/apiClient';
import { cloudRunConfig } from '../utils/apiClientEnhanced';

/**
 * Cloud Run APIリクエストオプション
 */
export interface CloudRunApiOptions {
  headers?: Record<string, string>;
  params?: Record<string, any>;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  responseType?: 'json' | 'text' | 'blob' | 'arraybuffer';
}

/**
 * Cloud Run APIクライアント
 */
const cloudRunApiClient: ApiClient = {
  /**
   * GETリクエスト
   */
  async get<T = any>(url: string, options: ApiOptions = {}): Promise<ApiResponse<T>> {
    // 実装はenhancedApiClientと共通
    const { headers, params, timeout } = options;
    
    // URLパラメータの構築
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }
    
    const queryString = queryParams.toString();
    const fullUrl = queryString ? `${url}?${queryString}` : url;
    
    // Cloud Run固有のベースURLを使用
    const cloudRunUrl = url.startsWith('http') ? url : `${cloudRunConfig.baseUrl}${url}`;
    
    try {
      const response = await fetch(cloudRunUrl, {
        method: 'GET',
        headers: {
          ...cloudRunConfig.headers,
          ...headers
        },
        signal: AbortSignal.timeout(timeout || cloudRunConfig.timeout)
      });
      
      const data = await response.json();
      
      return {
        success: response.ok,
        data: response.ok ? data : undefined,
        error: !response.ok ? {
          code: `HTTP_${response.status}`,
          message: data.message || 'Unknown error',
          details: data
        } : undefined,
        status: response.status,
        headers: response.headers
      };
    } catch (error) {
      console.error('Cloud Run API request error:', error);
      
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: error instanceof Error ? error.message : 'Network error',
          details: error
        },
        status: 0,
        headers: new Headers()
      };
    }
  },
  
  /**
   * POSTリクエスト
   */
  async post<T = any>(url: string, data?: any, options: ApiOptions = {}): Promise<ApiResponse<T>> {
    // 実装はenhancedApiClientと共通
    const { headers, timeout } = options;
    
    // Cloud Run固有のベースURLを使用
    const cloudRunUrl = url.startsWith('http') ? url : `${cloudRunConfig.baseUrl}${url}`;
    
    try {
      const response = await fetch(cloudRunUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...cloudRunConfig.headers,
          ...headers
        },
        body: data ? JSON.stringify(data) : undefined,
        signal: AbortSignal.timeout(timeout || cloudRunConfig.timeout)
      });
      
      const responseData = await response.json();
      
      return {
        success: response.ok,
        data: response.ok ? responseData : undefined,
        error: !response.ok ? {
          code: `HTTP_${response.status}`,
          message: responseData.message || 'Unknown error',
          details: responseData
        } : undefined,
        status: response.status,
        headers: response.headers
      };
    } catch (error) {
      console.error('Cloud Run API request error:', error);
      
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: error instanceof Error ? error.message : 'Network error',
          details: error
        },
        status: 0,
        headers: new Headers()
      };
    }
  },
  
  /**
   * PUTリクエスト
   */
  async put<T = any>(url: string, data?: any, options: ApiOptions = {}): Promise<ApiResponse<T>> {
    // URLを修正
    const cloudRunUrl = url.startsWith('http') ? url : `${cloudRunConfig.baseUrl}${url}`;
    
    // 実装はPOSTと同様
    return this.post<T>(cloudRunUrl, data, options);
  },
  
  /**
   * PATCHリクエスト
   */
  async patch<T = any>(url: string, data?: any, options: ApiOptions = {}): Promise<ApiResponse<T>> {
    // URLを修正
    const cloudRunUrl = url.startsWith('http') ? url : `${cloudRunConfig.baseUrl}${url}`;
    
    // 実装はPOSTと同様だがメソッドがPATCH
    try {
      const { headers, timeout } = options;
      
      const response = await fetch(cloudRunUrl, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...cloudRunConfig.headers,
          ...headers
        },
        body: data ? JSON.stringify(data) : undefined,
        signal: AbortSignal.timeout(timeout || cloudRunConfig.timeout)
      });
      
      const responseData = await response.json();
      
      return {
        success: response.ok,
        data: response.ok ? responseData : undefined,
        error: !response.ok ? {
          code: `HTTP_${response.status}`,
          message: responseData.message || 'Unknown error',
          details: responseData
        } : undefined,
        status: response.status,
        headers: response.headers
      };
    } catch (error) {
      console.error('Cloud Run API request error:', error);
      
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: error instanceof Error ? error.message : 'Network error',
          details: error
        },
        status: 0,
        headers: new Headers()
      };
    }
  },
  
  /**
   * DELETEリクエスト
   */
  async delete<T = any>(url: string, options: ApiOptions = {}): Promise<ApiResponse<T>> {
    // URLを修正
    const cloudRunUrl = url.startsWith('http') ? url : `${cloudRunConfig.baseUrl}${url}`;
    
    // 実装はGETと同様だがメソッドがDELETE
    try {
      const { headers, timeout } = options;
      
      const response = await fetch(cloudRunUrl, {
        method: 'DELETE',
        headers: {
          ...cloudRunConfig.headers,
          ...headers
        },
        signal: AbortSignal.timeout(timeout || cloudRunConfig.timeout)
      });
      
      // レスポンスがない場合もある
      let data;
      try {
        data = await response.json();
      } catch {
        data = {};
      }
      
      return {
        success: response.ok,
        data: response.ok ? data : undefined,
        error: !response.ok ? {
          code: `HTTP_${response.status}`,
          message: data.message || 'Unknown error',
          details: data
        } : undefined,
        status: response.status,
        headers: response.headers
      };
    } catch (error) {
      console.error('Cloud Run API request error:', error);
      
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: error instanceof Error ? error.message : 'Network error',
          details: error
        },
        status: 0,
        headers: new Headers()
      };
    }
  },
  
  /**
   * ファイルアップロード
   */
  async uploadFile<T = any>(
    url: string,
    file: File,
    fieldName: string = 'file',
    additionalData: Record<string, any> = {},
    options: ApiOptions = {},
    progressCallback?: (progress: number) => void
  ): Promise<ApiResponse<T>> {
    // Cloud Run固有のベースURLを使用
    const cloudRunUrl = url.startsWith('http') ? url : `${cloudRunConfig.baseUrl}${url}`;
    
    try {
      const formData = new FormData();
      formData.append(fieldName, file);
      
      // 追加のデータがあれば追加
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, String(value));
      });
      
      // プログレスコールバックがある場合はXHRを使用
      if (progressCallback) {
        return new Promise((resolve) => {
          const xhr = new XMLHttpRequest();
          
          // プログレスイベントのリスナー
          xhr.upload.addEventListener('progress', (event) => {
            if (event.lengthComputable) {
              const progress = Math.round((event.loaded / event.total) * 100);
              progressCallback(progress);
            }
          });
          
          // 完了イベントのリスナー
          xhr.addEventListener('load', () => {
            let responseData;
            try {
              responseData = JSON.parse(xhr.responseText);
            } catch (e) {
              responseData = xhr.responseText;
            }
            
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve({
                success: true,
                data: responseData,
                status: xhr.status,
                headers: new Headers()
              });
            } else {
              resolve({
                success: false,
                error: {
                  code: `HTTP_${xhr.status}`,
                  message: 'Upload failed',
                  details: responseData
                },
                status: xhr.status,
                headers: new Headers()
              });
            }
          });
          
          // エラーイベントのリスナー
          xhr.addEventListener('error', () => {
            resolve({
              success: false,
              error: {
                code: 'NETWORK_ERROR',
                message: 'Network error during upload',
                details: null
              },
              status: 0,
              headers: new Headers()
            });
          });
          
          // リクエストを開始
          xhr.open('POST', cloudRunUrl, true);
          
          // ヘッダーを設定
          Object.entries(cloudRunConfig.headers).forEach(([name, value]) => {
            xhr.setRequestHeader(name, value);
          });
          
          if (options.headers) {
            Object.entries(options.headers).forEach(([name, value]) => {
              xhr.setRequestHeader(name, value);
            });
          }
          
          // タイムアウトを設定
          xhr.timeout = options.timeout || cloudRunConfig.timeout;
          
          // リクエストを送信
          xhr.send(formData);
        });
      }
      
      // プログレスコールバックがない場合はfetchを使用
      const { headers, timeout } = options;
      
      const response = await fetch(cloudRunUrl, {
        method: 'POST',
        headers: {
          ...cloudRunConfig.headers,
          ...headers
        },
        body: formData,
        signal: AbortSignal.timeout(timeout || cloudRunConfig.timeout)
      });
      
      const responseData = await response.json();
      
      return {
        success: response.ok,
        data: response.ok ? responseData : undefined,
        error: !response.ok ? {
          code: `HTTP_${response.status}`,
          message: responseData.message || 'Unknown error',
          details: responseData
        } : undefined,
        status: response.status,
        headers: response.headers
      };
    } catch (error) {
      console.error('Cloud Run API file upload error:', error);
      
      return {
        success: false,
        error: {
          code: 'UPLOAD_ERROR',
          message: error instanceof Error ? error.message : 'Upload failed',
          details: error
        },
        status: 0,
        headers: new Headers()
      };
    }
  }
};

export default cloudRunApiClient;
