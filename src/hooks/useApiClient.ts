import { useCallback } from 'react';
// モックライブラリをインポート
import axiosMock from '../mocks/axiosMock';
import { AxiosResponse, AxiosRequestConfig, AxiosInstance } from '../mocks/axiosMock';
import { useAuth } from './useAuth';

// APIクライアントのインターフェース
interface ApiClient {
  get: <T = any>(url: string, config?: AxiosRequestConfig) => Promise<AxiosResponse<T>>;
  post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => Promise<AxiosResponse<T>>;
  put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => Promise<AxiosResponse<T>>;
  delete: <T = any>(url: string, config?: AxiosRequestConfig) => Promise<AxiosResponse<T>>;
  patch: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => Promise<AxiosResponse<T>>;
}

/**
 * API通信を行うためのカスタムフック
 * - 認証トークンを自動的にリクエストヘッダーに付与
 * - エラーハンドリングの共通化
 * - リクエスト/レスポンスのインターセプト
 */
export const useApiClient = (): ApiClient => {
  // 認証情報を取得するフックを使用（実際の実装ではここで認証情報を取得）
  const { getToken } = useAuth();
  
  // Axiosインスタンスの作成
  const apiClient: AxiosInstance = axiosMock.create({
    baseURL: process.env.REACT_APP_API_BASE_URL || 'https://api.echo-app.example',
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    }
  });

  // リクエストインターセプター
  // typescriptのエラーを回避するためanyにキャスト
  const apiClientAny = apiClient as any;
  if (apiClientAny.interceptors) {
    apiClientAny.interceptors.request.use(
      async (config: any) => {
        // 認証トークンを取得してヘッダーに追加
        const token = await getToken();
        if (token && config.headers) {
          config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
      },
      (error: any) => {
        return Promise.reject(error);
      }
    );
  }

  // レスポンスインターセプター
  if (apiClientAny.interceptors) {
    apiClientAny.interceptors.response.use(
      (response: any) => {
        return response;
      },
      (error: any) => {
        // エラーハンドリング
        if (error.response) {
          // サーバーからのレスポンスがある場合
          switch (error.response.status) {
            case 401:
              // 認証エラー処理
              console.error('Authentication error:', error.response.data);
              // 認証情報のリセットやログイン画面へのリダイレクトなどを行う
              break;
            case 403:
              // 権限エラー処理
              console.error('Permission denied:', error.response.data);
              break;
            case 404:
              // リソース不存在エラー処理
              console.error('Resource not found:', error.response.data);
              break;
            case 500:
              // サーバーエラー処理
              console.error('Server error:', error.response.data);
              break;
            default:
              // その他のエラー処理
              console.error('API error:', error.response.data);
          }
        } else if (error.request) {
          // リクエストは送信されたがレスポンスがない場合（ネットワークエラーなど）
          console.error('Network error:', error.request);
        } else {
          // リクエスト設定中にエラーが発生した場合
          console.error('Request error:', error.message);
        }
        
        // エラーを上位コンポーネントに伝播
        return Promise.reject(error);
      }
    );
  }

  // APIメソッドの実装
  const get = useCallback(
    <T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
      // @ts-ignore - タイプ応用のための無視
      return apiClient.get(url, config);
    },
    []
  );

  const post = useCallback(
    <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
      // @ts-ignore - タイプ応用のための無視
      return apiClient.post(url, data, config);
    },
    []
  );

  const put = useCallback(
    <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
      // @ts-ignore - タイプ応用のための無視
      return apiClient.put(url, data, config);
    },
    []
  );

  const del = useCallback(
    <T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
      // @ts-ignore - タイプ応用のための無視
      return apiClient.delete(url, config);
    },
    []
  );

  const patch = useCallback(
    <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
      // @ts-ignore - タイプ応用のための無視
      return apiClient.patch(url, data, config);
    },
    []
  );

  return {
    get,
    post,
    put,
    delete: del,
    patch
  };
};
