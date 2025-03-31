/**
 * 画像アップロード機能のテスト用ユーティリティ
 * 
 * このファイルは開発環境でのみ使用します。
 * 画像アップロード機能のテストをコンソールから実行するためのヘルパー関数を提供します。
 */

import AttenderService from '../services/AttenderService';
import { AttenderProfile } from '../types/attender/profile';

/**
 * ファイルからBlobを作成する関数（APIのシミュレート用）
 */
export const createImageBlob = async (url: string, fileName: string, mimeType: string = 'image/jpeg'): Promise<File> => {
  try {
    // 画像URLからblobを取得
    const response = await fetch(url);
    const blob = await response.blob();
    
    // blobをFileに変換
    return new File([blob], fileName, { type: mimeType });
  } catch (error) {
    console.error('画像の取得に失敗しました:', error);
    throw error;
  }
}

/**
 * 画像アップロードをテストする関数
 */
export const testImageUpload = async (
  attenderId: string,
  imageUrl: string = 'https://example.com/test.jpg',
  fileName: string = 'test-profile.jpg'
): Promise<string> => {
  try {
    console.info('画像アップロードテスト開始', { attenderId, imageUrl, fileName });
    
    // 画像ファイルを取得
    const file = await createImageBlob(imageUrl, fileName);
    console.info('テスト用ファイル作成完了', { size: file.size, type: file.type });
    
    // 進行状況表示用コールバック
    const onProgress = (progress: number) => {
      console.info(`アップロード進行中: ${progress}%`);
    };
    
    // 画像アップロード実行
    const uploadedUrl = await AttenderService.uploadAttenderProfilePhoto(
      attenderId, 
      file,
      onProgress
    );
    
    console.info('アップロード成功', { uploadedUrl });
    return uploadedUrl;
  } catch (error) {
    console.error('画像アップロードテスト失敗:', error);
    throw error;
  }
};

/**
 * 画像アップロードとプロフィール更新をテストする関数
 */
export const testImageUploadAndProfileUpdate = async (
  attenderId: string,
  profile: AttenderProfile,
  imageUrl: string = 'https://example.com/test.jpg',
  fileName: string = 'test-profile.jpg'
): Promise<string> => {
  try {
    console.info('画像アップロードとプロフィール更新テスト開始', { 
      attenderId, 
      profileId: profile.id,
      imageUrl, 
      fileName 
    });
    
    // 画像ファイルを取得
    const file = await createImageBlob(imageUrl, fileName);
    console.info('テスト用ファイル作成完了', { size: file.size, type: file.type });
    
    // 進行状況表示用コールバック
    const onProgress = (progress: number) => {
      console.info(`アップロード進行中: ${progress}%`);
    };
    
    // 画像アップロードとプロフィール更新を実行
    const uploadedUrl = await AttenderService.uploadAndUpdateProfilePhoto(
      attenderId, 
      file,
      profile,
      onProgress,
      true
    );
    
    console.info('アップロードとプロフィール更新成功', { uploadedUrl });
    return uploadedUrl;
  } catch (error) {
    console.error('画像アップロードとプロフィール更新テスト失敗:', error);
    throw error;
  }
};

export default {
  createImageBlob,
  testImageUpload,
  testImageUploadAndProfileUpdate
};
