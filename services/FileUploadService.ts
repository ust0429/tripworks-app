/**
 * ファイルアップロードサービス
 * 
 * Firebase Storageを使用してファイルをアップロードし、
 * プロフィール画像やレビュー画像、体験関連画像などを管理します。
 */

import { getStorage, ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';
import api, { logApiRequest, logApiResponse } from '../src/utils/apiClient';
import { ENDPOINTS } from '../src/config/api';
import { isDevelopment, isDebugMode } from '../src/config/env';

// アップロードディレクトリ設定
export enum UploadDirectory {
  PROFILES = 'profiles',
  REVIEWS = 'reviews',
  EXPERIENCES = 'experiences',
}

// ファイルアップロード結果の型定義
export interface UploadResult {
  success: boolean;
  url?: string;
  path?: string;
  error?: {
    code: string;
    message: string;
  };
}

// ファイルアップロード進捗の型定義
export interface UploadProgress {
  progress: number;
  state: 'running' | 'paused' | 'success' | 'error' | 'canceled';
  bytesTransferred: number;
  totalBytes: number;
}

/**
 * ファイルの拡張子を取得
 * 
 * @param file ファイルオブジェクト
 * @returns 拡張子（ドットなし）
 */
function getFileExtension(file: File): string {
  const name = file.name;
  const lastDot = name.lastIndexOf('.');
  
  if (lastDot === -1) {
    // 拡張子がない場合はMIMEタイプから推測
    if (file.type.startsWith('image/')) {
      return file.type.split('/')[1];
    }
    // デフォルト
    return 'bin';
  }
  
  return name.slice(lastDot + 1).toLowerCase();
}

/**
 * 安全なファイル名を生成
 * 
 * @param file ファイルオブジェクト
 * @returns ユニークなファイル名
 */
function generateSafeFileName(file: File): string {
  const uuid = uuidv4();
  const extension = getFileExtension(file);
  return `${uuid}.${extension}`;
}

/**
 * ファイルサイズバリデーション
 * 
 * @param file ファイルオブジェクト
 * @param maxSizeMB 最大サイズ（MB）
 * @returns 有効な場合はtrue、無効な場合はエラーメッセージ
 */
export function validateFileSize(file: File, maxSizeMB: number = 10): true | string {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return `ファイルサイズが大きすぎます。${maxSizeMB}MB以下のファイルを選択してください。`;
  }
  return true;
}

/**
 * ファイルタイプバリデーション
 * 
 * @param file ファイルオブジェクト
 * @param allowedTypes 許可されるMIMEタイプの配列
 * @returns 有効な場合はtrue、無効な場合はエラーメッセージ
 */
export function validateFileType(file: File, allowedTypes: string[] = ['image/jpeg', 'image/png', 'image/gif']): true | string {
  if (!allowedTypes.includes(file.type)) {
    return `サポートされていないファイル形式です。${allowedTypes.map(type => type.split('/')[1]).join(', ')}のみ許可されています。`;
  }
  return true;
}

/**
 * ファイルをアップロード
 * 
 * Firebase Storage直接アップロードからバックエンドAPIからのアップロードに移行
 * 
 * @param file アップロードするファイル
 * @param directory 保存先ディレクトリ
 * @param userId ユーザーID（オプション、ユーザー固有のパスに保存する場合）
 * @param progressCallback 進捗コールバック関数
 * @returns アップロード結果の約束
 */
export async function uploadFile(
  file: File,
  directory: UploadDirectory,
  userId?: string,
  progressCallback?: (progress: UploadProgress) => void
): Promise<UploadResult> {
  try {
    // ファイルバリデーション
    const sizeValidation = validateFileSize(file);
    if (sizeValidation !== true) {
      return {
        success: false,
        error: {
          code: 'FILE_TOO_LARGE',
          message: sizeValidation
        }
      };
    }
    
    const typeValidation = validateFileType(file);
    if (typeValidation !== true) {
      return {
        success: false,
        error: {
          code: 'INVALID_FILE_TYPE',
          message: typeValidation
        }
      };
    }
    
    // バックエンドAPIを使用してアップロード
    const formData = new FormData();
    formData.append('file', file);
    
    // アップロードタイプに基づいてエンドポイントを決定
    let endpoint = '';
    switch (directory) {
      case UploadDirectory.PROFILES:
        endpoint = ENDPOINTS.UPLOAD.PROFILE;
        break;
      case UploadDirectory.REVIEWS:
        endpoint = ENDPOINTS.UPLOAD.REVIEW;
        break;
      case UploadDirectory.EXPERIENCES:
        endpoint = ENDPOINTS.UPLOAD.EXPERIENCE;
        break;
      default:
        return {
          success: false,
          error: {
            code: 'INVALID_DIRECTORY',
            message: '無効なディレクトリ指定です'
          }
        };
    }
    
    // アップロードリクエストを送信
    const response = await api.post(endpoint, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent) => {
        if (progressCallback && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded / progressEvent.total) * 100);
          progressCallback({
            progress,
            state: progress === 100 ? 'success' : 'running',
            bytesTransferred: progressEvent.loaded,
            totalBytes: progressEvent.total
          });
        }
      }
    });
    
    if (response.success && response.data) {
      return {
        success: true,
        url: response.data.url,
        path: response.data.path
      };
    } else {
      return {
        success: false,
        error: {
          code: 'UPLOAD_ERROR',
          message: response.error?.message || 'ファイルのアップロードに失敗しました'
        }
      };
    }
  } catch (error) {
    console.error('ファイルアップロード処理エラー:', error);
    return {
      success: false,
      error: {
        code: 'UPLOAD_PROCESSING_ERROR',
        message: error instanceof Error ? error.message : 'ファイルアップロード処理中にエラーが発生しました'
      }
    };
  }
}

/**
 * Firebase Storageにファイルを直接アップロード(レガシーメソッド)
 */
export async function uploadToFirebaseStorage(
  file: File,
  directory: UploadDirectory,
  userId?: string,
  progressCallback?: (progress: UploadProgress) => void
): Promise<UploadResult> {
  // 新しいメソッドを使用
  return uploadFile(file, directory, userId, progressCallback);
}

/**
 * Firebase Storageからファイルを削除
 * 
 * @param filePath 削除するファイルのパス
 * @returns 削除結果の約束
 */
export async function deleteFromFirebaseStorage(filePath: string): Promise<boolean> {
  try {
    const storage = getStorage();
    const fileRef = ref(storage, filePath);
    
    await deleteObject(fileRef);
    return true;
  } catch (error) {
    console.error('ファイル削除エラー:', error);
    return false;
  }
}

/**
 * プロフィール画像をアップロード
 * 
 * @param file アップロードするファイル
 * @param userId ユーザーID
 * @param progressCallback 進捗コールバック関数
 * @returns アップロード結果
 */
export async function uploadProfileImage(
  file: File,
  userId: string,
  progressCallback?: (progress: UploadProgress) => void
): Promise<UploadResult> {
  // バックエンドアップロードAPIを使用
  // バックエンドでアップロード処理とプロフィール更新を同時に行う
  return uploadFile(file, UploadDirectory.PROFILES, userId, progressCallback);
}

/**
 * レビュー画像をアップロード
 * 
 * @param file アップロードするファイル
 * @param userId ユーザーID
 * @param progressCallback 進捗コールバック関数
 * @returns アップロード結果
 */
export async function uploadReviewImage(
  file: File,
  userId: string,
  progressCallback?: (progress: UploadProgress) => void
): Promise<UploadResult> {
  return uploadFile(file, UploadDirectory.REVIEWS, userId, progressCallback);
}

/**
 * 体験画像をアップロード
 * 
 * @param file アップロードするファイル
 * @param attenderId アテンダーID
 * @param progressCallback 進捗コールバック関数
 * @returns アップロード結果
 */
export async function uploadExperienceImage(
  file: File,
  attenderId: string,
  progressCallback?: (progress: UploadProgress) => void
): Promise<UploadResult> {
  return uploadFile(file, UploadDirectory.EXPERIENCES, attenderId, progressCallback);
}

/**
 * 複数の画像を一括アップロード
 * 
 * @param files アップロードするファイルの配列
 * @param directory 保存先ディレクトリ
 * @param userId ユーザーID
 * @param progressCallback 全体の進捗コールバック関数
 * @returns 各ファイルのアップロード結果の配列
 */
export async function uploadMultipleImages(
  files: File[],
  directory: UploadDirectory,
  userId: string,
  progressCallback?: (overallProgress: number) => void
): Promise<UploadResult[]> {
  // レビュー用と体験用でAPIエンドポイントを切り替え
  if (files.length === 0) {
    return [];
  }
  
  try {
    // フォームデータの作成
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });
    
    // アップロードタイプに基づいてエンドポイントを決定
    let endpoint = '';
    if (directory === UploadDirectory.REVIEWS) {
      endpoint = ENDPOINTS.UPLOAD.REVIEWS_MULTIPLE;
    } else if (directory === UploadDirectory.EXPERIENCES) {
      endpoint = ENDPOINTS.UPLOAD.EXPERIENCES_MULTIPLE;
    } else {
      // 他のタイプは個別アップロードにフォールバック
      const results: UploadResult[] = [];
      let totalProgress = 0;
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // 個別ファイルの進捗を全体の進捗に反映するためのコールバック
        const fileProgressCallback = (progress: UploadProgress) => {
          // 現在のファイルの進捗を全体の進捗に反映
          const fileContribution = progress.progress / files.length;
          const overallProgress = Math.round(totalProgress + fileContribution);
          
          if (progressCallback) {
            progressCallback(overallProgress);
          }
        };
        
        // ファイルをアップロード
        const result = await uploadFile(
          file,
          directory,
          userId,
          fileProgressCallback
        );
        
        results.push(result);
        
        // 全体の進捗を更新
        totalProgress += 100 / files.length;
        
        if (progressCallback) {
          progressCallback(Math.round(totalProgress));
        }
      }
      
      return results;
    }
    
    // バックエンドに複数画像を一度にアップロード
    const response = await api.post(endpoint, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent) => {
        if (progressCallback && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded / progressEvent.total) * 100);
          progressCallback(progress);
        }
      }
    });
    
    if (response.success && response.data) {
      return response.data.map((item: any) => ({
        success: true,
        url: item.url,
        path: item.path
      }));
    } else {
      return [{
        success: false,
        error: {
          code: 'UPLOAD_ERROR',
          message: response.error?.message || 'ファイルのアップロードに失敗しました'
        }
      }];
    }
  } catch (error) {
    console.error('複数ファイルアップロードエラー:', error);
    return [{
      success: false,
      error: {
        code: 'MULTIPLE_UPLOAD_ERROR',
        message: error instanceof Error ? error.message : '複数ファイルのアップロード中にエラーが発生しました'
      }
    }];
  }
}

// サービスの集約
const FileUploadService = {
  uploadToFirebaseStorage,
  deleteFromFirebaseStorage,
  uploadProfileImage,
  uploadReviewImage,
  uploadExperienceImage,
  uploadMultipleImages,
  validateFileSize,
  validateFileType
};

export default FileUploadService;
