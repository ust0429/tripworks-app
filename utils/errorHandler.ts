/**
 * APIエラー処理ユーティリティ
 * 
 * APIレスポンスからユーザーフレンドリーなエラーメッセージを生成します
 */

import { ApiResponse } from './apiClient';

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
  
  // ビジネスロジックエラー
  'BOOKING_ALREADY_CANCELLED': '予約は既にキャンセルされています',
  'BOOKING_ALREADY_COMPLETED': '完了済みの予約に対して操作できません',
  'BOOKING_NOT_CONFIRMED': '予約が確定されていないため、操作できません',
  'REVIEW_OWN_CONTENT': '自分自身のコンテンツに対してレビューできません',
  'UNAVAILABLE_TIME': '指定された時間は予約できません',
  'INSUFFICIENT_POINTS': 'ポイントが足りません',
  
  // その他のエラー
  'UPLOAD_ERROR': 'ファイルのアップロードに失敗しました',
  'UNKNOWN_ERROR': '予期せぬエラーが発生しました'
};

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
 * ネットワークエラーかどうかを判定
 * 
 * @param error エラーオブジェクト
 * @returns ネットワークエラーの場合true
 */
export function isNetworkError(error: any): boolean {
  if (!error) return false;
  
  // 一般的なネットワークエラーパターン
  if (error instanceof Error && 
      (error.message.includes('network') || 
       error.message.includes('Network') ||
       error.message.includes('fetch') ||
       error.message.includes('connection') ||
       error.message.includes('timeout'))) {
    return true;
  }
  
  // APIクライアントのネットワークエラーパターン
  if (error.error && error.error.code === 'NETWORK_ERROR') {
    return true;
  }
  
  // ステータスコードがない場合（サーバー到達前のエラー）
  if (error.status === 0) {
    return true;
  }
  
  return false;
}

/**
 * 認証エラーかどうかを判定
 * 
 * @param error エラーオブジェクトまたはAPIレスポンス
 * @returns 認証エラーの場合true
 */
export function isAuthError(error: any): boolean {
  if (!error) return false;
  
  // Firebase認証エラー
  if (error.code && typeof error.code === 'string' && error.code.startsWith('auth/')) {
    return true;
  }
  
  // APIレスポンスの認証エラー
  if (error.status === 401 || error.status === 403) {
    return true;
  }
  
  // APIクライアントの認証エラー
  if (error.error && 
      (error.error.code === 'UNAUTHORIZED' || error.error.code === 'FORBIDDEN')) {
    return true;
  }
  
  return false;
}

export default {
  getErrorMessage,
  getApiErrorMessage,
  isNetworkError,
  isAuthError
};
