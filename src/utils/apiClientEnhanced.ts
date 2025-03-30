/**
 * 認証連携機能付きAPIクライアント
 *
 * Firebase Authentication認証トークンを自動的にAPIリクエストに追加します。
 */

// Firebase Authのインポート（条件付き）
let getAuth: () => any;
let onAuthStateChanged: (auth: any, callback: (user: any) => void) => void;
let getIdToken: (user: any, forceRefresh?: boolean) => Promise<string>;

try {
  // Firebase Authを動的にインポート
  const firebaseAuth = require('firebase/auth');
  getAuth = firebaseAuth.getAuth;
  onAuthStateChanged = firebaseAuth.onAuthStateChanged;
  getIdToken = firebaseAuth.getIdToken;
} catch (e) {
  // Firebaseが利用できない場合はモック関数を使用
  console.warn('Firebase Auth is not available, using mock functions');
  getAuth = () => ({ currentUser: { uid: 'mock-user-id' } });
  onAuthStateChanged = (_, callback) => callback(null);
  getIdToken = () => Promise.resolve('mock-token');
}

import { isDevelopment, isDebugMode } from "../config/env";
import api, {
  ApiResponse,
  ApiClient,
  ApiOptions,
  logApiRequest as apiClientLogApiRequest,
  logApiResponse as apiClientLogApiResponse,
} from "./apiClient";

// Cloud Run API設定
export const cloudRunConfig = {
  baseUrl: process.env.REACT_APP_CLOUD_RUN_API_URL || 'https://api.echo-cloud.example',
  timeout: 60000, // 60秒
  maxRetries: 3,
  retryDelay: 1000,
  headers: {
    'X-API-Version': '1.0'
  }
};

// API設定
const API_TIMEOUT = 30000; // 30秒

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
    console.error("認証トークン取得エラー:", error);
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
 * リクエストを実行してレスポンスを処理する
 *
 * @param url エンドポイントURL
 * @param options リクエストオプション
 * @returns 処理済みのレスポンス
 */
async function request<T = any>(
  url: string,
  options: {
    method: string;
    body?: any;
    headers?: Record<string, string>;
    timeout?: number;
  } = { method: "GET" }
): Promise<ApiResponse<T>> {
  try {
    // デフォルトのタイムアウト設定
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), options.timeout || API_TIMEOUT);

    // 認証トークンを取得
    const token = await getAuthToken();

    // ヘッダーを準備
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    // 認証トークンがあれば追加
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    // CSRFトークンがあれば追加（将来的な拡張用）
    const csrfToken = document
      .querySelector('meta[name="csrf-token"]')
      ?.getAttribute("content");
    if (csrfToken) {
      headers["X-CSRF-Token"] = csrfToken;
    }

    // オプションをマージ
    const mergedOptions: RequestInit = {
      method: options.method,
      headers,
      body: options.body,
      credentials: "include", // クッキーを送信
      signal: controller.signal,
    };

    // リクエスト実行
    const response = await fetch(url, mergedOptions);
    clearTimeout(timeoutId);

    // レスポンスヘッダー
    const responseHeaders = response.headers;
    const contentType = responseHeaders.get("content-type") || "";

    // レスポンスボディの取得
    let data;
    if (contentType.includes("application/json")) {
      data = await response.json();
    } else if (contentType.includes("text/")) {
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
      code: "UNKNOWN_ERROR",
      message: "An unknown error occurred",
    };

    if (typeof data === "object" && data !== null) {
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

    return {
      success: false,
      error: errorData,
      status: response.status,
      headers: responseHeaders,
    };
  } catch (error) {
    console.error("API request error:", error);

    // AbortControllerによるタイムアウトの場合
    if (error instanceof DOMException && error.name === "AbortError") {
      return {
        success: false,
        error: {
          code: "TIMEOUT",
          message: "Request timed out",
        },
        status: 0,
        headers: new Headers(),
      };
    }

    // ネットワークエラーなど
    return {
      success: false,
      error: {
        code: "NETWORK_ERROR",
        message: error instanceof Error ? error.message : "Network error",
        details: error,
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
  options: ApiOptions = {}
): Promise<ApiResponse<T>> {
  // URLパラメータの構築
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

  return request<T>(fullUrl, {
    method: "GET",
    headers: options.headers,
    timeout: options.timeout,
  });
}

/**
 * POSTリクエスト
 */
async function post<T = any>(
  url: string,
  data?: any,
  options: ApiOptions = {}
): Promise<ApiResponse<T>> {
  return request<T>(url, {
    method: "POST",
    body: data ? JSON.stringify(data) : undefined,
    headers: options.headers,
    timeout: options.timeout,
  });
}

/**
 * PUTリクエスト
 */
async function put<T = any>(
  url: string,
  data?: any,
  options: ApiOptions = {}
): Promise<ApiResponse<T>> {
  return request<T>(url, {
    method: "PUT",
    body: data ? JSON.stringify(data) : undefined,
    headers: options.headers,
    timeout: options.timeout,
  });
}

/**
 * PATCHリクエスト
 */
async function patch<T = any>(
  url: string,
  data?: any,
  options: ApiOptions = {}
): Promise<ApiResponse<T>> {
  return request<T>(url, {
    method: "PATCH",
    body: data ? JSON.stringify(data) : undefined,
    headers: options.headers,
    timeout: options.timeout,
  });
}

/**
 * DELETEリクエスト
 */
async function del<T = any>(
  url: string,
  options: ApiOptions = {}
): Promise<ApiResponse<T>> {
  return request<T>(url, {
    method: "DELETE",
    headers: options.headers,
    timeout: options.timeout,
  });
}

/**
 * ファイルアップロード用POSTリクエスト
 */
async function uploadFile<T = any>(
  url: string,
  file: File,
  fieldName: string = "file",
  additionalData: Record<string, any> = {},
  options: ApiOptions = {},
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
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.upload.addEventListener("progress", (event) => {
          if (event.lengthComputable) {
            const progress = Math.round((event.loaded / event.total) * 100);
            progressCallback(progress);
          }
        });

        xhr.addEventListener("load", () => {
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
                xhr
                  .getAllResponseHeaders()
                  .split("\r\n")
                  .filter(Boolean)
                  .reduce((acc, header) => {
                    const [name, value] = header.split(": ");
                    if (name && value) {
                      acc[name.toLowerCase()] = value;
                    }
                    return acc;
                  }, {} as Record<string, string>)
              ),
            });
          } else {
            let errorData;
            try {
              errorData = JSON.parse(xhr.responseText);
            } catch (e) {
              errorData = { message: "Unknown error" };
            }

            resolve({
              success: false,
              error: {
                code: `HTTP_${xhr.status}`,
                message: errorData.message || "Request failed",
                details: errorData,
              },
              status: xhr.status,
              headers: new Headers(
                xhr
                  .getAllResponseHeaders()
                  .split("\r\n")
                  .filter(Boolean)
                  .reduce((acc, header) => {
                    const [name, value] = header.split(": ");
                    if (name && value) {
                      acc[name.toLowerCase()] = value;
                    }
                    return acc;
                  }, {} as Record<string, string>)
              ),
            });
          }
        });

        xhr.addEventListener("error", () => {
          reject(new Error("Network error occurred"));
        });

        xhr.addEventListener("abort", () => {
          reject(new Error("Request was aborted"));
        });

        xhr.addEventListener("timeout", () => {
          reject(new Error("Request timed out"));
        });

        xhr.open("POST", url);

        // タイムアウト設定
        xhr.timeout = options.timeout || API_TIMEOUT;

        // 認証トークンを設定
        if (token) {
          xhr.setRequestHeader("Authorization", `Bearer ${token}`);
        }

        // CSRFトークンがあれば追加
        const csrfToken = document
          .querySelector('meta[name="csrf-token"]')
          ?.getAttribute("content");
        if (csrfToken) {
          xhr.setRequestHeader("X-CSRF-Token", csrfToken);
        }

        // 追加のヘッダーがあれば設定
        if (options.headers) {
          Object.entries(options.headers).forEach(([name, value]) => {
            if (typeof value === "string") {
              xhr.setRequestHeader(name, value);
            }
          });
        }

        xhr.send(formData);
      });
    }

    // プログレスコールバックがない場合は通常のfetchを使用
    return request<T>(url, {
      method: "POST",
      body: formData,
      headers: {
        ...(options.headers || {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      timeout: options.timeout
    });
  } catch (error) {
    console.error("ファイルアップロードエラー:", error);
    return {
      success: false,
      error: {
        code: "UPLOAD_ERROR",
        message:
          error instanceof Error
            ? error.message
            : "ファイルアップロードに失敗しました",
        details: error,
      },
      status: 0,
      headers: new Headers(),
    };
  }
}

// APIクライアントの生成
const enhancedApiClient: ApiClient = {
  get,
  post,
  put,
  patch,
  delete: del, // 'delete'はJavaScriptの予約語のためdelをエイリアスとして使用
  uploadFile,
};

// API クライアント
const client = enhancedApiClient;
const cloudRunApiClient = enhancedApiClient; // Cloud Run用クライアント（同じインターフェースを使用）

// アプリケーション起動時に認証リスナーを設定
setupAuthListener();

// 型のエクスポート - isolatedModulesフラグに対応
export type { ApiResponse };

// エクスポート
/**
 * APIリクエストをログ出力（開発環境のみ）
 */
export function logApiRequest(method: string, url: string, data?: any): void {
  apiClientLogApiRequest(method, url, data);
}

/**
 * APIレスポンスをログ出力（開発環境のみ）
 */
export function logApiResponse<T = any>(method: string, url: string, response: ApiResponse<T>): void {
  apiClientLogApiResponse(method, url, response);
}

export default {
  client,
  cloudRunApiClient,
  getAuthToken,
  setupAuthListener
};