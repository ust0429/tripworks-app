/**
 * エラーハンドリングユーティリティ
 * 
 * アプリケーション全体で一貫したエラー処理と表示を提供します。
 */

import { ApiResponse } from './apiClient';

// エラータイプの定義
export enum ErrorType {
  NETWORK = 'network',
  VALIDATION = 'validation',
  AUTH = 'auth',
  SERVER = 'server',
  TIMEOUT = 'timeout',
  UNKNOWN = 'unknown'
}

// エラーコードの定義
export const ErrorCode = {
  // ネットワークエラー
  NETWORK_OFFLINE: 'NETWORK_OFFLINE',
  NETWORK_ERROR: 'NETWORK_ERROR',
  
  // APIエラー
  TIMEOUT: 'TIMEOUT',
  SERVER_ERROR: 'SERVER_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  INVALID_REQUEST: 'INVALID_REQUEST',
  
  // 認証エラー
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  SESSION_EXPIRED: 'SESSION_EXPIRED',
  
  // バリデーションエラー
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  REQUIRED_FIELD: 'REQUIRED_FIELD',
  INVALID_FORMAT: 'INVALID_FORMAT',
  
  // その他
  UNKNOWN_ERROR: 'UNKNOWN_ERROR'
};

// エラー情報の型定義
export interface ErrorInfo {
  type: ErrorType;
  code: string;
  message: string;
  details?: any;
  retryable?: boolean;
  fieldErrors?: Record<string, string>;
}

/**
 * HTTPステータスコードからエラータイプを取得
 * @param status HTTPステータスコード
 * @returns エラータイプ
 */
export function getErrorTypeFromStatus(status: number): ErrorType {
  if (status >= 500) return ErrorType.SERVER;
  if (status === 401 || status === 403) return ErrorType.AUTH;
  if (status === 422) return ErrorType.VALIDATION;
  if (status === 408) return ErrorType.TIMEOUT;
  if (status >= 400) return ErrorType.VALIDATION;
  return ErrorType.UNKNOWN;
}

/**
 * APIレスポンスからエラー情報を生成
 * @param response APIレスポンス
 * @returns エラー情報
 */
export function getErrorFromResponse(response: ApiResponse): ErrorInfo {
  // 成功レスポンスの場合はデフォルトエラー
  if (response.success) {
    return {
      type: ErrorType.UNKNOWN,
      code: ErrorCode.UNKNOWN_ERROR,
      message: '不明なエラーが発生しました',
      retryable: false
    };
  }
  
  // ステータスコードからエラータイプを取得
  const errorType = getErrorTypeFromStatus(response.status);
  
  // レスポンスにエラー情報がある場合はそちらを優先
  if (response.error) {
    const { code, message, details } = response.error;
    
    // フィールドエラーの抽出（バリデーションエラーの場合）
    const fieldErrors = errorType === ErrorType.VALIDATION && 
                        details?.fieldErrors ? 
                        details.fieldErrors : undefined;
    
    return {
      type: errorType,
      code: code || getDefaultErrorCode(errorType),
      message: message || getDefaultErrorMessage(errorType),
      details: details,
      retryable: isRetryable(errorType, code),
      fieldErrors
    };
  }
  
  // デフォルトエラー情報
  return {
    type: errorType,
    code: getDefaultErrorCode(errorType),
    message: getDefaultErrorMessage(errorType),
    retryable: isRetryable(errorType)
  };
}

/**
 * エラータイプに応じたデフォルトのエラーコードを取得
 */
function getDefaultErrorCode(errorType: ErrorType): string {
  switch (errorType) {
    case ErrorType.NETWORK:
      return ErrorCode.NETWORK_ERROR;
    case ErrorType.VALIDATION:
      return ErrorCode.VALIDATION_ERROR;
    case ErrorType.AUTH:
      return ErrorCode.UNAUTHORIZED;
    case ErrorType.SERVER:
      return ErrorCode.SERVER_ERROR;
    case ErrorType.TIMEOUT:
      return ErrorCode.TIMEOUT;
    default:
      return ErrorCode.UNKNOWN_ERROR;
  }
}

/**
 * エラータイプに応じたデフォルトのエラーメッセージを取得
 */
function getDefaultErrorMessage(errorType: ErrorType): string {
  switch (errorType) {
    case ErrorType.NETWORK:
      return 'ネットワーク接続に問題があります。インターネット接続を確認してください。';
    case ErrorType.VALIDATION:
      return '入力内容に問題があります。内容を確認して再度お試しください。';
    case ErrorType.AUTH:
      return '認証に失敗しました。再度ログインしてください。';
    case ErrorType.SERVER:
      return 'サーバーエラーが発生しました。しばらく経ってから再度お試しください。';
    case ErrorType.TIMEOUT:
      return 'リクエストがタイムアウトしました。しばらく経ってから再度お試しください。';
    default:
      return '不明なエラーが発生しました。しばらく経ってから再度お試しください。';
  }
}

/**
 * エラーが再試行可能かどうかを判定
 */
function isRetryable(errorType: ErrorType, errorCode?: string): boolean {
  // 特定のエラーコードの場合
  if (errorCode) {
    if (errorCode === ErrorCode.VALIDATION_ERROR || 
        errorCode === ErrorCode.UNAUTHORIZED || 
        errorCode === ErrorCode.FORBIDDEN) {
      return false;
    }
  }
  
  // エラータイプによる判定
  switch (errorType) {
    case ErrorType.NETWORK:
    case ErrorType.SERVER:
    case ErrorType.TIMEOUT:
      return true;
    case ErrorType.VALIDATION:
    case ErrorType.AUTH:
    default:
      return false;
  }
}

/**
 * 汎用のエラーハンドラー
 * 
 * @param error エラーオブジェクト
 * @param fallbackMessage デフォルトのエラーメッセージ
 * @returns エラー情報
 */
export function handleError(error: any, fallbackMessage: string = '予期せぬエラーが発生しました'): ErrorInfo {
  console.error('エラー発生:', error);
  
  // APIレスポンスからのエラー
  if (error && error.status !== undefined && error.success === false) {
    return getErrorFromResponse(error as ApiResponse);
  }
  
  // ネットワークエラー
  if (error instanceof TypeError && error.message.includes('Network')) {
    return {
      type: ErrorType.NETWORK,
      code: ErrorCode.NETWORK_ERROR,
      message: 'ネットワーク接続に問題があります。インターネット接続を確認してください。',
      retryable: true
    };
  }
  
  // タイムアウトエラー
  if (error.name === 'AbortError' || (error.message && error.message.includes('timeout'))) {
    return {
      type: ErrorType.TIMEOUT,
      code: ErrorCode.TIMEOUT,
      message: 'リクエストがタイムアウトしました。しばらく経ってから再度お試しください。',
      retryable: true
    };
  }
  
  // 通常のエラーオブジェクト
  if (error instanceof Error) {
    return {
      type: ErrorType.UNKNOWN,
      code: ErrorCode.UNKNOWN_ERROR,
      message: error.message || fallbackMessage,
      details: error,
      retryable: false
    };
  }
  
  // それ以外のエラー
  return {
    type: ErrorType.UNKNOWN,
    code: ErrorCode.UNKNOWN_ERROR,
    message: typeof error === 'string' ? error : fallbackMessage,
    details: error,
    retryable: false
  };
}

/**
 * ユーザーフレンドリーなエラーメッセージを取得
 * 
 * @param error エラー情報
 * @returns ユーザー向けメッセージ
 */
export function getUserFriendlyErrorMessage(errorInfo: ErrorInfo): string {
  // 既に適切なメッセージがある場合はそのまま返す
  if (errorInfo.message) return errorInfo.message;
  
  // エラータイプに応じたデフォルトメッセージ
  return getDefaultErrorMessage(errorInfo.type);
}

/**
 * フィールドエラーのフォーマット
 * APIからのフィールドエラー形式を内部形式に変換
 * 
 * @param errors APIから返されたフィールドエラー
 * @returns フォーマット済みフィールドエラー
 */
export function formatFieldErrors(errors: any): Record<string, string> {
  if (!errors) return {};
  
  // 既に適切な形式の場合
  if (typeof errors === 'object' && !Array.isArray(errors)) {
    return errors;
  }
  
  // 配列形式のエラーを変換
  if (Array.isArray(errors)) {
    return errors.reduce((acc, error) => {
      if (error.field && error.message) {
        acc[error.field] = error.message;
      }
      return acc;
    }, {} as Record<string, string>);
  }
  
  return {};
}

export default {
  ErrorType,
  ErrorCode,
  getErrorFromResponse,
  getErrorTypeFromStatus,
  handleError,
  getUserFriendlyErrorMessage,
  formatFieldErrors
};