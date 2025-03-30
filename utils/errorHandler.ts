/**
 * エラー処理ユーティリティ
 * 
 * APIエラーの処理と表示のためのユーティリティ関数
 */

import { ApiResponse } from './apiClientEnhanced';

// エラータイプの定義
export type ErrorType = 
  | 'network'      // ネットワーク関連エラー
  | 'auth'         // 認証関連エラー
  | 'validation'   // 入力検証エラー
  | 'notFound'     // リソースが見つからないエラー
  | 'permission'   // 権限関連エラー
  | 'server'       // サーバーエラー
  | 'unknown';     // 不明なエラー

// エラーコードとエラータイプのマッピング
const ERROR_TYPE_MAPPING: Record<string, ErrorType> = {
  'NETWORK_ERROR': 'network',
  'TIMEOUT': 'network',
  'ABORTED': 'network',
  'INVALID_TOKEN': 'auth',
  'UNAUTHORIZED': 'auth',
  'AUTH_REQUIRED': 'auth',
  'VALIDATION_ERROR': 'validation',
  'INVALID_INPUT': 'validation',
  'RESOURCE_NOT_FOUND': 'notFound',
  'NOT_FOUND': 'notFound',
  'PERMISSION_DENIED': 'permission',
  'INSUFFICIENT_PERMISSIONS': 'permission',
  'SERVER_ERROR': 'server',
  'INTERNAL_ERROR': 'server',
};

/**
 * APIエラーからエラータイプを判定
 * 
 * @param error APIレスポンスのエラー情報
 * @param status HTTPステータスコード
 * @returns エラータイプ
 */
export function getErrorType(error?: { code: string; message: string; details?: any }, status?: number): ErrorType {
  // エラーコードからの判定
  if (error?.code && ERROR_TYPE_MAPPING[error.code]) {
    return ERROR_TYPE_MAPPING[error.code];
  }
  
  // HTTPステータスコードからの判定
  if (status) {
    if (status === 401 || status === 403) {
      return 'auth';
    } else if (status === 404) {
      return 'notFound';
    } else if (status >= 400 && status < 500) {
      return 'validation';
    } else if (status >= 500) {
      return 'server';
    }
  }
  
  // どちらにも当てはまらない場合
  return 'unknown';
}

/**
 * ユーザーフレンドリーなエラーメッセージを生成
 * 
 * @param response APIレスポンス
 * @returns ユーザー向けのエラーメッセージ
 */
export function getErrorMessage(response: ApiResponse): string {
  const errorType = getErrorType(response.error, response.status);
  const defaultMessage = response.error?.message || '予期せぬエラーが発生しました';
  
  switch (errorType) {
    case 'network':
      return 'ネットワークに接続できません。インターネット接続をご確認ください。';
    
    case 'auth':
      if (response.status === 401) {
        return 'セッションの有効期限が切れました。再度ログインしてください。';
      }
      if (response.status === 403) {
        return 'この操作を行う権限がありません。';
      }
      return defaultMessage;
    
    case 'validation':
      return response.error?.message || '入力内容に問題があります。確認して再試行してください。';
    
    case 'notFound':
      return '該当する情報が見つかりませんでした。URLが正しいか確認してください。';
    
    case 'permission':
      return '権限がありません。アクセス権を確認してください。';
    
    case 'server':
      return 'サーバー側でエラーが発生しました。しばらくたってから再試行してください。';
    
    default:
      return defaultMessage;
  }
}

/**
 * フィールドごとのエラーメッセージを抽出
 * 
 * @param response APIレスポンス
 * @returns フィールド名をキーとし、エラーメッセージを値とするオブジェクト
 */
export function getFieldErrors(response: ApiResponse): Record<string, string> {
  if (response.error?.details?.fieldErrors) {
    return response.error.details.fieldErrors as Record<string, string>;
  }
  
  return {};
}

/**
 * エラーをコンソールに詳細にログ出力
 * 
 * @param response APIレスポンス
 * @param context エラーが発生した状況の説明
 */
export function logDetailedError(response: ApiResponse, context: string): void {
  const errorType = getErrorType(response.error, response.status);
  
  console.group(`🔴 API Error [${errorType}]: ${context}`);
  console.log('Status:', response.status);
  console.log('Error Code:', response.error?.code);
  console.log('Error Message:', response.error?.message);
  
  if (response.error?.details) {
    console.log('Details:', response.error.details);
  }
  
  console.groupEnd();
}

/**
 * エラー情報をスタックトレース付きでログ出力
 * 
 * @param error JavaScriptエラーオブジェクト
 * @param context エラー発生状況の説明
 */
export function logErrorWithTrace(error: unknown, context: string): void {
  if (error instanceof Error) {
    console.error(`🔴 Error in ${context}:`, error.message);
    console.error(error.stack);
  } else {
    console.error(`🔴 Unknown error in ${context}:`, error);
  }
}

export default {
  getErrorType,
  getErrorMessage,
  getFieldErrors,
  logDetailedError,
  logErrorWithTrace
};