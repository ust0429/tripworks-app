/**
 * API モジュール
 * 
 * すべてのAPIサービスをまとめたエントリーポイント
 */

// API クライアント
import cloudRunApiClient from "./cloudRunClient";
import enhancedApiClient, { cloudRunConfig } from "../utils/apiClientEnhanced";

// サービス
import attenderService from "./services/attenderService";
import experienceService from "./services/experienceService";
import reviewService from "./services/reviewService";
import bookingService from "./services/bookingService";
import userService from "./services/userService";
import paymentService from "./services/paymentService";
import notificationService from "./services/notificationService";
import uploadService from "./services/uploadService";

// サービスのエクスポート
export { default as attenderService } from "./services/attenderService";
export { default as experienceService } from "./services/experienceService";
export { default as reviewService } from "./services/reviewService";
export { default as bookingService } from "./services/bookingService";
export { default as userService } from "./services/userService";
export { default as paymentService } from "./services/paymentService";
export { default as notificationService } from "./services/notificationService";
export { default as uploadService } from "./services/uploadService";

// API共通設定
const API_VERSION = '1.0';
const DEFAULT_LOCALE = 'ja';

/**
 * APIクライアントの設定
 * 
 * @param token 認証トークン（オプション）
 * @param locale ロケール（オプション）
 */
export function configureApi(token?: string, locale: string = DEFAULT_LOCALE) {
  // ヘッダー設定
  const headers: Record<string, string> = {
    'Accept-Language': locale,
    'X-API-Version': API_VERSION
  };

  // トークンがあれば追加
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return {
    headers,
    locale
  };
}

/**
 * エラーハンドラー設定
 * 
 * @param callback エラー処理コールバック
 */
export function setErrorHandler(callback: (error: any) => void) {
  apiErrorHandler = callback;
}

/**
 * APIエラーハンドラー
 */
let apiErrorHandler: ((error: any) => void) | null = null;

/**
 * API共通エラーハンドリング
 * 
 * @param error エラーオブジェクト
 */
export function handleApiError(error: any) {
  // コンソールにエラーを記録
  console.error('API Error:', error);

  // カスタムエラーハンドラーがあれば実行
  if (apiErrorHandler) {
    apiErrorHandler(error);
  }
}

/**
 * レスポンスの解析と処理
 * 
 * @param response APIレスポンス
 * @returns データまたはnull
 */
export function parseApiResponse<T>(response: any): T | null {
  if (!response) return null;

  // 成功レスポンスの場合はデータを返す
  if (response.success && response.data) {
    return response.data as T;
  }

  // エラーの場合はnullを返す
  return null;
}

/**
 * APIクライアントの設定
 */
export interface ApiClientConfig {
  baseUrl: string;
  timeout: number;
  headers: Record<string, string>;
}

/**
 * API サービス
 */
export interface ApiService {
  [key: string]: any;
}

/**
 * ステータスコード
 */
export const StatusCodes = {
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503
};

/**
 * レスポンスタイプ
 */
export enum ResponseType {
  JSON = 'json',
  TEXT = 'text',
  BLOB = 'blob',
  ARRAY_BUFFER = 'arraybuffer'
}

/**
 * APIリクエストオプション
 */
export interface ApiRequestOptions {
  headers?: Record<string, string>;
  params?: Record<string, any>;
  timeout?: number;
  responseType?: ResponseType;
  withCredentials?: boolean;
}

// デフォルトエクスポート
export default {
  client: enhancedApiClient.client,
  cloudRunApiClient: enhancedApiClient.cloudRunApiClient,
  cloudRunConfig,
  attenderService,
  experienceService,
  reviewService,
  bookingService,
  userService,
  paymentService,
  notificationService,
  uploadService,
  configureApi,
  setErrorHandler,
  handleApiError,
  parseApiResponse,
  StatusCodes,
  ResponseType
};
