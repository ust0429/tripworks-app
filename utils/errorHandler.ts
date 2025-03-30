/**
 * APIエラー処理ユーティリティ
 * 
 * APIレスポンスからユーザーフレンドリーなエラーメッセージを生成します
 */

import { ApiResponse } from './apiClientEnhanced';
import * as ErrorTypes from './errorTypes';

// エラーコードごとのメッセージマッピング
const ERROR_MESSAGES: Record<string, string> = {
  // 認証関連エラー
  'auth/invalid-email': 'メールアドレスの形式が正しくありません',
  'auth/user-disabled': 'このアカウントは無効になっています',
  'auth/user-not-found': 'ユーザーが見つかりません',
  'auth/wrong-password': 'パスワードが正しくありません',
  'auth/email-already-in-use': 'このメールアドレスは既に使用されています',
  'auth/weak-password': 'パスワードが脆弱です。より強力なパスワードを設定してください',
  'auth/requires-recent-login': '再認証が必要です。再度ログインしてください',
  'auth/unauthorized': '認証されていないか、権限がありません',
  
  // API関連エラー
  'UNAUTHORIZED': 'ログインが必要です',
  'FORBIDDEN': 'この操作を行う権限がありません',
  'NOT_FOUND': 'リクエストされたリソースが見つかりません',
  'VALIDATION_ERROR': '入力データに問題があります',
  'SERVER_ERROR': 'サーバーエラーが発生しました',
  'NETWORK_ERROR': 'ネットワーク接続に問題があります',
  'TIMEOUT': 'リクエストがタイムアウトしました',
  'CONFLICT': 'データの競合が発生しました',
  
  // ビジネスロジックエラー
  'BOOKING_ALREADY_CANCELLED': '予約は既にキャンセルされています',
  'BOOKING_ALREADY_COMPLETED': '完了済みの予約に対して操作できません',
  'BOOKING_NOT_CONFIRMED': '予約が確定されていないため、操作できません',
  'REVIEW_OWN_CONTENT': '自分自身のコンテンツに対してレビューできません',
  'UNAVAILABLE_TIME': '指定された時間は予約できません',
  'INSUFFICIENT_POINTS': 'ポイントが足りません',
  
  // その他のエラー
  'UPLOAD_ERROR': 'ファイルのアップロードに失敗しました',
  'UNKNOWN_ERROR': '予期せぬエラーが発生しました',
  'DATA_FETCH_ERROR': 'データの取得に失敗しました',
  'UNEXPECTED_ERROR': '予期せぬエラーが発生しました'
};

/**
 * エラーの種類に基づいてリトライ可能かどうかを判定
 * 
 * @param error エラーオブジェクト
 * @returns リトライ可能ならtrue
 */
export function isRetryableError(error: any): boolean {
  // ネットワークエラーやタイムアウトはリトライ可能
  if (ErrorTypes.isNetworkError(error) || ErrorTypes.isTimeoutError(error)) {
    return true;
  }
  
  // サーバーエラー(500系)はリトライ可能
  if (ErrorTypes.isServerError(error)) {
    return true;
  }
  
  // 特定のエラーコードをリトライ不可としてマーク
  const nonRetryableCodes = [
    'VALIDATION_ERROR',
    'NOT_FOUND',
    'UNAUTHORIZED',
    'FORBIDDEN',
    'CONFLICT'
  ];
  
  if (error && error.code && nonRetryableCodes.includes(error.code)) {
    return false;
  }
  
  // デフォルトではリトライ不可
  return false;
}

/**
 * APIエラーからユーザーフレンドリーなメッセージを取得
 * 
 * @param error APIエラーまたはエラーコード
 * @returns ユーザーフレンドリーなエラーメッセージ
 */
export function getErrorMessage(error: any): string {
  // エラーコードが文字列の場合
  if (typeof error === 'string') {
    return ERROR_MESSAGES[error] || error;
  }
  
  // エラータイプのインスタンスの場合
  if (error instanceof ErrorTypes.ApiError) {
    return error.message || ERROR_MESSAGES[error.code] || '不明なエラーが発生しました';
  }
  
  // Firebase認証エラーの場合
  if (error && error.code && typeof error.code === 'string') {
    return ERROR_MESSAGES[error.code] || error.message || '不明なエラーが発生しました';
  }
  
  // APIレスポンスの場合
  if (error && error.error && error.error.code) {
    return ERROR_MESSAGES[error.error.code] || error.error.message || '不明なエラーが発生しました';
  }
  
  // 通常のError型の場合
  if (error instanceof Error) {
    return error.message;
  }
  
  // それ以外の場合
  return '不明なエラーが発生しました';
}

/**
 * APIレスポンスからエラーを抽出してユーザーフレンドリーなメッセージを返す
 * 
 * @param response APIレスポンス
 * @returns エラーメッセージ（エラーがない場合はnull）
 */
export function getApiErrorMessage<T>(response: ApiResponse<T>): string | null {
  if (response.success) {
    return null;
  }
  
  // エラーオブジェクトがある場合
  if (response.error) {
    // カスタムエラーメッセージがある場合はそれを返す
    if (response.error.message) {
      return response.error.message;
    }
    
    // エラーコードがある場合はマッピングされたメッセージを返す
    if (response.error.code && ERROR_MESSAGES[response.error.code]) {
      return ERROR_MESSAGES[response.error.code];
    }
  }
  
  // エラーステータスコードに基づいたメッセージ
  if (response.status === 401) {
    return 'ログインが必要です';
  } else if (response.status === 403) {
    return '権限がありません';
  } else if (response.status === 404) {
    return 'リクエストされたリソースが見つかりません';
  } else if (response.status >= 400 && response.status < 500) {
    return 'リクエストに問題があります';
  } else if (response.status >= 500) {
    return 'サーバーエラーが発生しました';
  }
  
  return '不明なエラーが発生しました';
}

/**
 * APIレスポンスからエラーオブジェクトを作成
 * 
 * @param response APIレスポンス
 * @returns 適切なエラーオブジェクト
 */
export function createErrorFromResponse<T>(response: ApiResponse<T>): ErrorTypes.ApiError {
  return ErrorTypes.createErrorFromResponse(response);
}

/**
 * エラーメッセージを特定のコンテキスト向けにカスタマイズ
 * 
 * @param error エラーオブジェクト
 * @param context エラーが発生したコンテキスト名（例：'予約作成'）
 * @returns コンテキスト化されたエラーメッセージ
 */
export function getContextualErrorMessage(error: any, context: string): string {
  const baseMessage = getErrorMessage(error);
  
  // 認証エラーの場合は特別なメッセージ
  if (ErrorTypes.isAuthenticationError(error)) {
    return `${context}するには、ログインが必要です`;
  }
  
  // 権限エラーの場合は特別なメッセージ
  if (ErrorTypes.isPermissionError(error)) {
    return `${context}する権限がありません`;
  }
  
  // ネットワークエラーやタイムアウトの場合は特別なメッセージ
  if (ErrorTypes.isNetworkError(error) || ErrorTypes.isTimeoutError(error)) {
    return `ネットワーク接続の問題により、${context}できませんでした。インターネット接続を確認して再試行してください`;
  }
  
  // コンテキストを前置詞付きで追加（一般的なエラー）
  return `${context}中にエラーが発生しました: ${baseMessage}`;
}

export default {
  getErrorMessage,
  getApiErrorMessage,
  isRetryableError,
  createErrorFromResponse,
  getContextualErrorMessage
};
