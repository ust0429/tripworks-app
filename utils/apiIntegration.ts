/**
 * API統合ユーティリティ
 * 
 * モックデータと実際のバックエンドAPIを切り替えるユーティリティ
 */

import enhancedApi, { ApiResponse } from './apiClientEnhanced';
import { useMockData, isDevelopment, isDebugMode } from '../config/env';

/**
 * モックデータまたは実データを取得
 * 
 * @param mockFn モックデータを返す関数
 * @param apiFn 実際のAPIリクエストを行う関数
 * @param args APIリクエスト関数に渡す引数
 * @returns APIレスポンス
 */
export async function getDataFromMockOrApi<T>(
  mockFn: (...args: any[]) => T | Promise<T>,
  apiFn: (...args: any[]) => Promise<ApiResponse<T>>,
  ...args: any[]
): Promise<ApiResponse<T>> {
  try {
    // モックデータを使用する場合
    if (useMockData()) {
      if (isDebugMode()) {
        console.info('モックデータを使用しています');
      }
      
      // モック関数を実行（非同期の場合はawaitを使用）
      const mockResult = await mockFn(...args);
      
      // モックデータはAPIレスポンス形式に変換
      return {
        success: true,
        data: mockResult,
        status: 200,
        headers: new Headers()
      };
    }
    
    // 実際のAPIを使用する場合
    if (isDebugMode()) {
      console.info('実際のAPIを使用しています');
    }
    
    return await apiFn(...args);
  } catch (error) {
    console.error('データ取得エラー:', error);
    
    // エラーはAPIレスポンス形式にして返す
    return {
      success: false,
      error: {
        code: 'DATA_FETCH_ERROR',
        message: error instanceof Error ? error.message : '不明なエラーが発生しました',
      },
      status: 500,
      headers: new Headers()
    };
  }
}

/**
 * モックからAPIへの移行のために、実行環境に応じて関数を選択
 * 
 * @param mockFn モック環境用の関数
 * @param apiFn 本番環境用の関数
 * @returns 環境に応じた関数
 */
export function selectImplementation<T extends (...args: any[]) => any>(
  mockFn: T,
  apiFn: T
): T {
  return useMockData() ? mockFn : apiFn;
}

/**
 * API呼び出しのラッパー関数
 * クエリパラメータとボディの両方を処理できるユーティリティ
 * 
 * @param method HTTPメソッド
 * @param endpoint エンドポイントURL
 * @param data クエリパラメータまたはリクエストボディ
 * @returns APIレスポンス
 */
export async function callApi<T>(
  method: 'get' | 'post' | 'put' | 'patch' | 'delete',
  endpoint: string,
  data?: any
): Promise<ApiResponse<T>> {
  try {
    let response: ApiResponse<T>;

    switch (method) {
      case 'get':
        response = await enhancedApi.get<T>(endpoint, data); // data はクエリパラメータ
        break;
      case 'post':
        response = await enhancedApi.post<T>(endpoint, data); // data はリクエストボディ
        break;
      case 'put':
        response = await enhancedApi.put<T>(endpoint, data); // data はリクエストボディ
        break;
      case 'patch':
        response = await enhancedApi.patch<T>(endpoint, data); // data はリクエストボディ
        break;
      case 'delete':
        response = await enhancedApi.delete<T>(endpoint); // deleteはボディを受け取らない
        break;
      default:
        throw new Error(`Unsupported method: ${method}`);
    }

    return response;
  } catch (error) {
    console.error(`API ${method} error:`, error);
    
    return {
      success: false,
      error: {
        code: 'API_CALL_ERROR',
        message: error instanceof Error ? error.message : '不明なエラーが発生しました',
      },
      status: 500,
      headers: new Headers()
    };
  }
}

/**
 * ファイルアップロードAPIラッパー
 * 
 * @param endpoint アップロードエンドポイント
 * @param file アップロードするファイル
 * @param fieldName フォームフィールド名（デフォルトは'file'）
 * @param additionalData 追加のフォームデータ
 * @param progressCallback 進捗コールバック関数
 * @returns APIレスポンス
 */
export async function uploadFile<T>(
  endpoint: string,
  file: File,
  fieldName: string = 'file',
  additionalData: Record<string, any> = {},
  progressCallback?: (progress: number) => void
): Promise<ApiResponse<T>> {
  try {
    return await enhancedApi.uploadFile<T>(
      endpoint,
      file,
      fieldName,
      additionalData,
      {},
      progressCallback
    );
  } catch (error) {
    console.error('File upload error:', error);
    
    return {
      success: false,
      error: {
        code: 'UPLOAD_ERROR',
        message: error instanceof Error ? error.message : 'ファイルのアップロードに失敗しました',
      },
      status: 500,
      headers: new Headers()
    };
  }
}

export default {
  getDataFromMockOrApi,
  selectImplementation,
  callApi,
  uploadFile
};
