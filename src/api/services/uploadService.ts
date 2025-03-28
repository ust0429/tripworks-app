/**
 * アップロードサービス
 * 
 * ファイルアップロード関連の機能を提供します。
 */

import { v4 as uuidv4 } from 'uuid';
import api from '../../utils/apiClient';
import { logApiRequest, logApiResponse } from '../../utils/apiClient';
import { ENDPOINTS } from '../../config/api';
import { isDevelopment } from '../../config/env';

// アップロードタイプ定義
export type UploadType = 'image' | 'document' | 'profile' | 'experience' | 'identification';

// アップロードステータス定義
export type UploadStatus = 'pending' | 'processing' | 'uploading' | 'success' | 'error';

// アップロード進捗情報
export interface UploadProgress {
  status: UploadStatus;
  progress: number; // 0-100
  file?: File;
  url?: string;
  error?: string;
}

// 進捗コールバック関数の型
export type ProgressCallback = (progress: UploadProgress) => void;

/**
 * 画像ファイルをアップロードする
 * 
 * @param file アップロードするファイル
 * @param type アップロードの種類
 * @param onProgress 進捗コールバック
 * @param additionalData 追加データ
 * @returns アップロードしたファイルのURL
 */
export async function uploadImage(
  file: File,
  type: UploadType = 'image',
  onProgress?: ProgressCallback,
  additionalData?: Record<string, string>
): Promise<string> {
  try {
    // 進捗状態の更新
    if (onProgress) {
      onProgress({
        status: 'processing',
        progress: 0,
        file
      });
    }

    // エンドポイント選択
    let endpoint;
    switch (type) {
      case 'profile':
        endpoint = ENDPOINTS.UPLOAD.PROFILE_PHOTO;
        break;
      case 'experience':
        endpoint = ENDPOINTS.UPLOAD.EXPERIENCE_PHOTO;
        break;
      case 'identification':
        endpoint = ENDPOINTS.UPLOAD.DOCUMENT;
        break;
      default:
        endpoint = ENDPOINTS.UPLOAD.IMAGE;
    }

    // 開発環境の場合はモックレスポンスを返す
    if (isDevelopment()) {
      // 開発環境での処理遅延をシミュレート
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // モックURLを生成
      const timestamp = new Date().getTime();
      const sanitizedFileName = file.name.replace(/[^a-z0-9.]/gi, '_').toLowerCase();
      const mockUrl = `/uploads/${type}/${timestamp}_${sanitizedFileName}`;
      
      console.info(`開発環境: ファイル「${file.name}」の仮アップロードURL: ${mockUrl}`);
      
      // 成功した進捗状態の更新
      if (onProgress) {
        onProgress({
          status: 'success',
          progress: 100,
          file,
          url: mockUrl
        });
      }
      
      return mockUrl;
    }

    // ログ出力
    logApiRequest('POST', endpoint, { filename: file.name, fileSize: file.size });

    // 実際のアップロード処理
    const response = await api.uploadFile(
      endpoint,
      file,
      'file',
      additionalData,
      {},
      (progress) => {
        if (onProgress) {
          onProgress({
            status: 'uploading',
            progress,
            file
          });
        }
      }
    );

    // レスポンスのログ出力
    logApiResponse('POST', endpoint, response);

    // エラーチェック
    if (!response.success || !response.data?.url) {
      const errorMessage = response.error?.message || 'ファイルのアップロードに失敗しました';
      if (onProgress) {
        onProgress({
          status: 'error',
          progress: 0,
          file,
          error: errorMessage
        });
      }
      throw new Error(errorMessage);
    }

    // 成功した進捗状態の更新
    if (onProgress) {
      onProgress({
        status: 'success',
        progress: 100,
        file,
        url: response.data.url
      });
    }

    return response.data.url;
  } catch (error) {
    console.error('ファイルアップロードエラー:', error);
    
    // エラー状態の進捗更新
    if (onProgress) {
      onProgress({
        status: 'error',
        progress: 0,
        file,
        error: error instanceof Error ? error.message : '不明なエラーが発生しました'
      });
    }
    
    throw error;
  }
}

/**
 * 文書ファイルをアップロードする
 * 
 * @param file アップロードするファイル
 * @param onProgress 進捗コールバック
 * @param additionalData 追加データ
 * @returns アップロードしたファイルのURL
 */
export async function uploadDocument(
  file: File,
  onProgress?: ProgressCallback,
  additionalData?: Record<string, string>
): Promise<string> {
  try {
    // 進捗状態の更新
    if (onProgress) {
      onProgress({
        status: 'uploading',
        progress: 0,
        file
      });
    }

    // エンドポイント
    const endpoint = ENDPOINTS.UPLOAD.DOCUMENT;

    // 開発環境の場合はモックレスポンスを返す
    if (isDevelopment()) {
      // 開発環境での処理遅延をシミュレート
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      // モックURLを生成
      const timestamp = new Date().getTime();
      const sanitizedFileName = file.name.replace(/[^a-z0-9.]/gi, '_').toLowerCase();
      const mockUrl = `/uploads/documents/${timestamp}_${sanitizedFileName}`;
      
      console.info(`開発環境: ドキュメント「${file.name}」の仮アップロードURL: ${mockUrl}`);
      
      // 進捗を段階的に更新（モック）
      if (onProgress) {
        const steps = [25, 50, 75, 100];
        for (const progress of steps) {
          await new Promise(resolve => setTimeout(resolve, 300));
          onProgress({
            status: progress === 100 ? 'success' : 'uploading',
            progress,
            file,
            ...(progress === 100 ? { url: mockUrl } : {})
          });
        }
      }
      
      return mockUrl;
    }

    // ログ出力
    logApiRequest('POST', endpoint, { filename: file.name, fileSize: file.size });

    // 実際のアップロード処理
    const response = await api.uploadFile(
      endpoint,
      file,
      'document',
      additionalData,
      {},
      (progress) => {
        if (onProgress) {
          onProgress({
            status: 'uploading',
            progress,
            file
          });
        }
      }
    );

    // レスポンスのログ出力
    logApiResponse('POST', endpoint, response);

    // エラーチェック
    if (!response.success || !response.data?.url) {
      const errorMessage = response.error?.message || 'ドキュメントのアップロードに失敗しました';
      if (onProgress) {
        onProgress({
          status: 'error',
          progress: 0,
          file,
          error: errorMessage
        });
      }
      throw new Error(errorMessage);
    }

    // 成功した進捗状態の更新
    if (onProgress) {
      onProgress({
        status: 'success',
        progress: 100,
        file,
        url: response.data.url
      });
    }

    return response.data.url;
  } catch (error) {
    console.error('ドキュメントアップロードエラー:', error);
    
    // エラー状態の進捗更新
    if (onProgress) {
      onProgress({
        status: 'error',
        progress: 0,
        file,
        error: error instanceof Error ? error.message : '不明なエラーが発生しました'
      });
    }
    
    throw error;
  }
}

export default {
  uploadImage,
  uploadDocument
};
