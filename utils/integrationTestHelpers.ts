/**
 * バックエンド統合テスト用ヘルパーユーティリティ
 */

import AttenderService from '../services/AttenderService';

export async function testAuthAndApiConnection(): Promise<boolean> {
  try {
    // 利用可能な開発用アテンダーIDを取得
    const TEST_ATTENDER_ID = 'att_123';
    
    // アテンダー情報取得APIを呼び出し
    const attender = await AttenderService.getAttender(TEST_ATTENDER_ID);
    
    console.info('API接続テスト結果:', {
      success: !!attender,
      attenderId: attender?.id,
      name: attender?.name,
    });
    
    return !!attender;
  } catch (error) {
    console.error('API接続テスト失敗:', error);
    return false;
  }
}

export async function testProfileUpdateFlow(): Promise<boolean> {
  try {
    // テスト用アテンダーIDを設定
    const TEST_ATTENDER_ID = 'att_123';
    
    // アテンダー情報取得
    const attender = await AttenderService.getAttender(TEST_ATTENDER_ID);
    if (!attender) {
      throw new Error('テスト用アテンダーが見つかりません');
    }
    
    // プロフィール更新
    const testName = `テストユーザー_${new Date().getTime()}`;
    await AttenderService.updateAttenderProfile(attender, {
      name: testName
    });
    
    // 更新後のアテンダー情報を取得して検証
    const updatedAttender = await AttenderService.getAttender(TEST_ATTENDER_ID);
    const success = updatedAttender?.name === testName;
    
    console.info('プロフィール更新テスト結果:', {
      success,
      originalName: attender.name,
      updatedName: updatedAttender?.name
    });
    
    return success;
  } catch (error) {
    console.error('プロフィール更新テスト失敗:', error);
    return false;
  }
}

export async function testUploadAndProfileFlow(): Promise<boolean> {
  try {
    // テスト用アテンダーIDを設定
    const TEST_ATTENDER_ID = 'att_123';
    
    // アテンダー情報取得
    const attender = await AttenderService.getAttender(TEST_ATTENDER_ID);
    if (!attender) {
      throw new Error('テスト用アテンダーが見つかりません');
    }
    
    // 進行状況監視用コールバック
    const progressCallback = (progress: number) => {
      console.info(`アップロード進捗: ${progress}%`);
    };
    
    // ダミー画像ファイルを作成
    const testFile = await fetchImageFile('test-image.jpg');
    
    // 画像アップロードとプロフィール更新を実行
    const imageUrl = await AttenderService.uploadAndUpdateProfilePhoto(
      TEST_ATTENDER_ID,
      testFile,
      attender,
      progressCallback
    );
    
    // 更新後のアテンダー情報を取得して検証
    const updatedAttender = await AttenderService.getAttender(TEST_ATTENDER_ID);
    const success = updatedAttender?.profileImage === imageUrl;
    
    console.info('画像アップロードとプロフィール更新テスト結果:', {
      success,
      imageUrl,
      updatedProfileImage: updatedAttender?.profileImage
    });
    
    return success;
  } catch (error) {
    console.error('画像アップロードとプロフィール更新テスト失敗:', error);
    return false;
  }
}

/**
 * テスト用の画像ファイルを取得
 * 
 * @param filename ファイル名
 * @returns File オブジェクト
 */
export async function fetchImageFile(filename: string = 'test-image.jpg'): Promise<File> {
  try {
    // テスト用の1x1 透明ピクセルの小さなPNG画像のbase64データ
    const base64Data = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
    const byteString = atob(base64Data.split(',')[1] || base64Data);
    const mimeType = 'image/png';
    
    // バイナリデータを作成
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const intArray = new Uint8Array(arrayBuffer);
    
    for (let i = 0; i < byteString.length; i++) {
      intArray[i] = byteString.charCodeAt(i);
    }
    
    // Blobと画像ファイルを作成
    const blob = new Blob([arrayBuffer], { type: mimeType });
    const file = new File([blob], filename, { type: mimeType });
    
    return file;
  } catch (error) {
    console.error('テスト用画像ファイル作成エラー:', error);
    // エラー時はフォールバックとして空のファイルを作成
    const fallbackBlob = new Blob(['test'], { type: 'image/jpeg' });
    return new File([fallbackBlob], filename, { type: 'image/jpeg' });
  }
}

/**
 * 新しいアップロード機能をテスト
 * 
 * @param attenderId テスト対象のアテンダーID
 * @param filename アップロードするファイル名（省略可）
 */
export async function testNewUploadFeature(attenderId: string, filename?: string): Promise<string | null> {
  try {
    console.info(`新しいアップロード機能テスト開始: アテンダーID=${attenderId}`);
    
    // テスト用の画像ファイルを取得
    const imageFile = await fetchImageFile(filename || `test-${Date.now()}.png`);
    console.info(`テスト画像準備完了: ${imageFile.name}, サイズ=${imageFile.size}バイト`);
    
    // 進捗コールバック
    const progressCallback = (progress: number) => {
      const progressBar = '█'.repeat(Math.floor(progress / 10)) + '░'.repeat(10 - Math.floor(progress / 10));
      console.info(`アップロード進捗: ${progressBar} ${progress}%`);
    };
    
    // アップロード実行
    console.info('画像アップロード開始...');
    const startTime = Date.now();
    
    const imageUrl = await AttenderService.uploadAttenderProfilePhoto(
      attenderId,
      imageFile,
      progressCallback
    );
    
    const elapsedTime = Date.now() - startTime;
    console.info(`アップロード完了: ${elapsedTime}ms`);
    console.info(`画像URL: ${imageUrl}`);
    
    return imageUrl;
  } catch (error) {
    console.error('新しいアップロード機能テスト失敗:', error);
    return null;
  }
}

export default {
  testAuthAndApiConnection,
  testProfileUpdateFlow,
  testUploadAndProfileFlow,
  fetchImageFile,
  testNewUploadFeature
};
