/**
 * エラータイプ定義
 * 
 * アプリケーション全体で使用する共通のエラータイプを定義します
 */

// APIエラーの基本クラス
export class ApiError extends Error {
  code: string;
  status: number;
  details?: any;

  constructor(message: string, code: string = 'API_ERROR', status: number = 500, details?: any) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

// 認証エラー
export class AuthenticationError extends ApiError {
  constructor(message: string = '認証が必要です', code: string = 'UNAUTHORIZED', details?: any) {
    super(message, code, 401, details);
    this.name = 'AuthenticationError';
  }
}

// 権限エラー
export class PermissionError extends ApiError {
  constructor(message: string = 'この操作を行う権限がありません', code: string = 'FORBIDDEN', details?: any) {
    super(message, code, 403, details);
    this.name = 'PermissionError';
  }
}

// リソース不存在エラー
export class NotFoundError extends ApiError {
  constructor(message: string = 'リソースが見つかりません', code: string = 'NOT_FOUND', details?: any) {
    super(message, code, 404, details);
    this.name = 'NotFoundError';
  }
}

// バリデーションエラー
export class ValidationError extends ApiError {
  fieldErrors?: Record<string, string>;

  constructor(
    message: string = '入力データに問題があります',
    fieldErrors?: Record<string, string>,
    code: string = 'VALIDATION_ERROR',
    details?: any
  ) {
    super(message, code, 400, details);
    this.name = 'ValidationError';
    this.fieldErrors = fieldErrors;
  }
}

// ネットワークエラー
export class NetworkError extends ApiError {
  constructor(message: string = 'ネットワーク接続に問題があります', code: string = 'NETWORK_ERROR', details?: any) {
    super(message, code, 0, details);
    this.name = 'NetworkError';
  }
}

// タイムアウトエラー
export class TimeoutError extends ApiError {
  constructor(message: string = 'リクエストがタイムアウトしました', code: string = 'TIMEOUT', details?: any) {
    super(message, code, 0, details);
    this.name = 'TimeoutError';
  }
}

// 重複エラー
export class ConflictError extends ApiError {
  constructor(message: string = 'リソースが既に存在します', code: string = 'CONFLICT', details?: any) {
    super(message, code, 409, details);
    this.name = 'ConflictError';
  }
}

// サーバーエラー
export class ServerError extends ApiError {
  constructor(message: string = 'サーバーエラーが発生しました', code: string = 'SERVER_ERROR', details?: any) {
    super(message, code, 500, details);
    this.name = 'ServerError';
  }
}

// 予期せぬエラー
export class UnexpectedError extends ApiError {
  constructor(message: string = '予期せぬエラーが発生しました', code: string = 'UNEXPECTED_ERROR', details?: any) {
    super(message, code, 500, details);
    this.name = 'UnexpectedError';
  }
}

/**
 * APIレスポンスからエラーオブジェクトを作成
 * 
 * @param response APIレスポンス
 * @returns 適切なエラーオブジェクト
 */
export function createErrorFromResponse(response: any): ApiError {
  // レスポンスが存在しない場合
  if (!response) {
    return new UnexpectedError();
  }

  // レスポンスからステータスとエラー情報を取得
  const status = response.status || 0;
  const error = response.error || {};
  
  // ステータスコードに基づいて適切なエラーを作成
  switch (status) {
    case 400:
      return new ValidationError(
        error.message || '入力データに問題があります',
        error.fieldErrors,
        error.code || 'VALIDATION_ERROR',
        error.details
      );
    case 401:
      return new AuthenticationError(
        error.message || '認証が必要です',
        error.code || 'UNAUTHORIZED',
        error.details
      );
    case 403:
      return new PermissionError(
        error.message || 'この操作を行う権限がありません',
        error.code || 'FORBIDDEN',
        error.details
      );
    case 404:
      return new NotFoundError(
        error.message || 'リソースが見つかりません',
        error.code || 'NOT_FOUND',
        error.details
      );
    case 409:
      return new ConflictError(
        error.message || 'リソースが既に存在します',
        error.code || 'CONFLICT',
        error.details
      );
    case 0:
      if (error.code === 'TIMEOUT') {
        return new TimeoutError(
          error.message || 'リクエストがタイムアウトしました',
          error.code,
          error.details
        );
      }
      return new NetworkError(
        error.message || 'ネットワーク接続に問題があります',
        error.code || 'NETWORK_ERROR',
        error.details
      );
    case 500:
    default:
      return new ServerError(
        error.message || 'サーバーエラーが発生しました',
        error.code || 'SERVER_ERROR',
        error.details
      );
  }
}

// エラーの種類を判別するヘルパー関数
export function isAuthenticationError(error: any): boolean {
  return error instanceof AuthenticationError ||
         (error && error.status === 401) ||
         (error && error.code === 'UNAUTHORIZED');
}

export function isPermissionError(error: any): boolean {
  return error instanceof PermissionError ||
         (error && error.status === 403) ||
         (error && error.code === 'FORBIDDEN');
}

export function isNotFoundError(error: any): boolean {
  return error instanceof NotFoundError ||
         (error && error.status === 404) ||
         (error && error.code === 'NOT_FOUND');
}

export function isValidationError(error: any): boolean {
  return error instanceof ValidationError ||
         (error && error.status === 400) ||
         (error && error.code === 'VALIDATION_ERROR');
}

export function isNetworkError(error: any): boolean {
  return error instanceof NetworkError ||
         (error && error.status === 0) ||
         (error && error.code === 'NETWORK_ERROR') ||
         (error && typeof error.message === 'string' && error.message.toLowerCase().includes('network'));
}

export function isTimeoutError(error: any): boolean {
  return error instanceof TimeoutError ||
         (error && error.code === 'TIMEOUT') ||
         (error && typeof error.message === 'string' && error.message.toLowerCase().includes('timeout'));
}

export function isServerError(error: any): boolean {
  return error instanceof ServerError ||
         (error && error.status === 500) ||
         (error && error.code === 'SERVER_ERROR');
}

export default {
  ApiError,
  AuthenticationError,
  PermissionError,
  NotFoundError,
  ValidationError,
  NetworkError,
  TimeoutError,
  ConflictError,
  ServerError,
  UnexpectedError,
  createErrorFromResponse,
  isAuthenticationError,
  isPermissionError,
  isNotFoundError,
  isValidationError,
  isNetworkError,
  isTimeoutError,
  isServerError
};
