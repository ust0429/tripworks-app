/**
 * ファイルアップロードサービス
 * 
 * アプリケーション内でのファイルアップロード処理を一元管理します。
 * 画像圧縮、形式変換、進捗追跡などの機能を提供します。
 */

import api, { logApiRequest, logApiResponse } from '../../utils/apiClient';
import { ENDPOINTS } from '../../config/api';
import { isDevelopment } from '../../config/env';
import { processImage, isSupportedImageType, convertHeicToJpeg } from '../../utils/imageUtils';

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

    let processedFile = file;
    const mimeType = file.type.toLowerCase();

    // HEIC形式の画像をJPEGに変換
    if (mimeType === 'image/heic' || mimeType === 'image/heif') {
      if (onProgress) {
        onProgress({
          status: 'processing',
          progress: 10,
          file
        });
      }
      processedFile = await convertHeicToJpeg(file);
    }

    // サポートしていない画像形式の場合はエラー
    if (!isSupportedImageType(processedFile.type)) {
      throw new Error(`非対応の画像形式です: ${processedFile.type}`);
    }

    // 画像の前処理（圧縮とEXIF情報の削除）
    if (onProgress) {
      onProgress({
        status: 'processing',
        progress: 30,
        file: processedFile
      });
    }
    
    processedFile = await processImage(processedFile, {
      quality: 0.85,
      maxWidth: 2000,
      maxHeight: 2000,
      maxSize: 5 * 1024 * 1024, // 5MB
      removeExif: true
    });

    // 進捗状態の更新
    if (onProgress) {
      onProgress({
        status: 'uploading',
        progress: 50,
        file: processedFile
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
      
      // モックURLを生成（実際のファイル名を使用してより現実的に）
      const timestamp = new Date().getTime();
      const sanitizedFileName = processedFile.name.replace(/[^a-z0-9.]/gi, '_').toLowerCase();
      const mockUrl = `/uploads/${type}/${timestamp}_${sanitizedFileName}`;
      
      console.info(`開発環境: ファイル「${processedFile.name}」の仮アップロードURL: ${mockUrl}`);
      
      // 成功した進捗状態の更新
      if (onProgress) {
        onProgress({
          status: 'success',
          progress: 100,
          file: processedFile,
          url: mockUrl
        });
      }
      
      return mockUrl;
    }

    // ログ出力
    logApiRequest('POST', endpoint, { filename: processedFile.name, fileSize: processedFile.size });

    // 実際のアップロード処理
    const response = await api.uploadFile(
      endpoint,
      processedFile,
      'file',
      additionalData
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
          file: processedFile,
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
        file: processedFile,
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
      additionalData
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

/**
 * 身分証明書をアップロードする（必要な検証を含む）
 * 
 * @param file アップロードする身分証明書ファイル
 * @param identificationType 身分証明書のタイプ
 * @param onProgress 進捗コールバック
 * @returns アップロードした身分証明書のURL
 */
export async function uploadIdentificationDocument(
  file: File,
  identificationType: string,
  onProgress?: ProgressCallback
): Promise<string> {
  const additionalData = {
    documentType: identificationType,
    purpose: 'identity_verification'
  };

  // 画像タイプの場合は圧縮して前処理を行い、URLを返す
  if (file.type.startsWith('image/')) {
    return uploadImage(file, 'identification', onProgress, additionalData);
  }
  
  // PDFなどのドキュメントタイプの場合
  return uploadDocument(file, onProgress, additionalData);
}

/**
 * 体験サンプル画像をアップロードする
 * 
 * @param file アップロードするファイル
 * @param experienceTitle 関連する体験のタイトル
 * @param onProgress 進捗コールバック
 * @returns アップロードした画像のURL
 */
export async function uploadExperienceImage(
  file: File,
  experienceTitle: string,
  onProgress?: ProgressCallback
): Promise<string> {
  const additionalData = {
    experienceTitle,
    caption: `体験「${experienceTitle}」のサンプル画像`
  };
  
  return uploadImage(file, 'experience', onProgress, additionalData);
}

/**
 * プロフィール画像をアップロードする
 * 
 * @param file アップロードするファイル
 * @param userId ユーザーID（オプション）
 * @param onProgress 進捗コールバック
 * @returns アップロードした画像のURL
 */
export async function uploadProfileImage(
  file: File,
  userId?: string,
  onProgress?: ProgressCallback
): Promise<string> {
  const additionalData = userId ? { userId } : undefined;
  return uploadImage(file, 'profile', onProgress, additionalData);
}

export default {
  uploadImage,
  uploadDocument,
  uploadIdentificationDocument,
  uploadExperienceImage,
  uploadProfileImage
};
