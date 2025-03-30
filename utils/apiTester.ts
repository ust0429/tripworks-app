/**
 * API統合テスト用ユーティリティ
 * 
 * 各APIエンドポイントのテストを実行するための関数群
 */

import enhancedApi from './apiClientEnhanced';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { ENDPOINTS } from '../config/api';

// テスト結果の型定義
export interface TestResult {
  name: string;
  success: boolean;
  message: string;
  data?: any;
  error?: any;
  duration: number;
}

// テスト用のユーザー情報
const TEST_USER = {
  email: 'test@example.com',
  password: 'testpassword123'
};

/**
 * 認証テスト
 */
export async function testAuthentication(): Promise<TestResult> {
  const startTime = performance.now();
  try {
    const auth = getAuth();
    const userCredential = await signInWithEmailAndPassword(
      auth,
      TEST_USER.email, 
      TEST_USER.password
    );
    
    const user = userCredential.user;
    const token = await user.getIdToken();
    
    const endTime = performance.now();
    return {
      name: '認証テスト',
      success: !!token,
      message: '認証トークンの取得に成功しました',
      data: { uid: user.uid, tokenLength: token.length },
      duration: endTime - startTime
    };
  } catch (error) {
    const endTime = performance.now();
    return {
      name: '認証テスト',
      success: false,
      message: error instanceof Error ? error.message : '不明な認証エラー',
      error,
      duration: endTime - startTime
    };
  }
}

/**
 * 予約一覧取得テスト
 */
export async function testGetBookings(): Promise<TestResult> {
  const startTime = performance.now();
  try {
    const response = await enhancedApi.get(ENDPOINTS.BOOKING.LIST);
    
    const endTime = performance.now();
    return {
      name: '予約一覧取得テスト',
      success: response.success,
      message: response.success 
        ? `${response.data?.length || 0}件の予約を取得しました` 
        : `予約の取得に失敗しました: ${response.error?.message || '不明なエラー'}`,
      data: response.data,
      error: response.error,
      duration: endTime - startTime
    };
  } catch (error) {
    const endTime = performance.now();
    return {
      name: '予約一覧取得テスト',
      success: false,
      message: error instanceof Error ? error.message : '不明なエラー',
      error,
      duration: endTime - startTime
    };
  }
}

/**
 * レビュー一覧取得テスト
 */
export async function testGetReviews(): Promise<TestResult> {
  const startTime = performance.now();
  try {
    // アテンダーIDのサンプル
    const sampleAttenderId = 'att_123';
    
    const response = await enhancedApi.get(
      ENDPOINTS.REVIEW.LIST,
      { attenderId: sampleAttenderId }
    );
    
    const endTime = performance.now();
    return {
      name: 'レビュー一覧取得テスト',
      success: response.success,
      message: response.success 
        ? `${response.data?.length || 0}件のレビューを取得しました` 
        : `レビューの取得に失敗しました: ${response.error?.message || '不明なエラー'}`,
      data: response.data,
      error: response.error,
      duration: endTime - startTime
    };
  } catch (error) {
    const endTime = performance.now();
    return {
      name: 'レビュー一覧取得テスト',
      success: false,
      message: error instanceof Error ? error.message : '不明なエラー',
      error,
      duration: endTime - startTime
    };
  }
}

/**
 * レビュー投稿テスト
 */
export async function testCreateReview(): Promise<TestResult> {
  const startTime = performance.now();
  try {
    // テスト用レビューデータ
    const reviewData = {
      attenderId: 'att_123',
      experienceId: 'exp_001',
      rating: 4,
      comment: 'これはAPIテスターからのテストレビューです。無視してください。'
    };
    
    const response = await enhancedApi.post(
      ENDPOINTS.REVIEW.CREATE,
      reviewData
    );
    
    const endTime = performance.now();
    return {
      name: 'レビュー投稿テスト',
      success: response.success,
      message: response.success 
        ? `ID: ${response.data?.id}のレビューを作成しました` 
        : `レビューの作成に失敗しました: ${response.error?.message || '不明なエラー'}`,
      data: response.data,
      error: response.error,
      duration: endTime - startTime
    };
  } catch (error) {
    const endTime = performance.now();
    return {
      name: 'レビュー投稿テスト',
      success: false,
      message: error instanceof Error ? error.message : '不明なエラー',
      error,
      duration: endTime - startTime
    };
  }
}

/**
 * 予約作成テスト
 */
export async function testCreateBooking(): Promise<TestResult> {
  const startTime = performance.now();
  try {
    // テスト用予約データ
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    
    const bookingData = {
      attenderId: 'att_123',
      experienceId: 'exp_001',
      date: tomorrowStr,
      time: '14:00',
      duration: '2時間',
      price: 5000,
      location: '東京都渋谷区',
      notes: 'これはAPIテスターからのテスト予約です。無視してください。'
    };
    
    const response = await enhancedApi.post(
      ENDPOINTS.BOOKING.CREATE,
      bookingData
    );
    
    const endTime = performance.now();
    return {
      name: '予約作成テスト',
      success: response.success,
      message: response.success 
        ? `ID: ${response.data?.id}の予約を作成しました` 
        : `予約の作成に失敗しました: ${response.error?.message || '不明なエラー'}`,
      data: response.data,
      error: response.error,
      duration: endTime - startTime
    };
  } catch (error) {
    const endTime = performance.now();
    return {
      name: '予約作成テスト',
      success: false,
      message: error instanceof Error ? error.message : '不明なエラー',
      error,
      duration: endTime - startTime
    };
  }
}

/**
 * アップロードテスト
 */
export async function testFileUpload(): Promise<TestResult> {
  const startTime = performance.now();
  try {
    // テスト用の小さなBlobデータを作成
    const dummyBlob = new Blob(['テストデータ'], { type: 'text/plain' });
    const dummyFile = new File([dummyBlob], 'test.txt', { type: 'text/plain' });
    
    const response = await enhancedApi.uploadFile(
      ENDPOINTS.UPLOAD.FILE,
      dummyFile,
      'file',
      { description: 'テストアップロード' }
    );
    
    const endTime = performance.now();
    return {
      name: 'ファイルアップロードテスト',
      success: response.success,
      message: response.success 
        ? `ファイルのアップロードに成功しました: ${response.data?.url || ''}` 
        : `ファイルのアップロードに失敗しました: ${response.error?.message || '不明なエラー'}`,
      data: response.data,
      error: response.error,
      duration: endTime - startTime
    };
  } catch (error) {
    const endTime = performance.now();
    return {
      name: 'ファイルアップロードテスト',
      success: false,
      message: error instanceof Error ? error.message : '不明なエラー',
      error,
      duration: endTime - startTime
    };
  }
}

/**
 * アテンダー一覧取得テスト
 */
export async function testGetAttenders(): Promise<TestResult> {
  const startTime = performance.now();
  try {
    const response = await enhancedApi.get(ENDPOINTS.ATTENDER.LIST);
    
    const endTime = performance.now();
    return {
      name: 'アテンダー一覧取得テスト',
      success: response.success,
      message: response.success 
        ? `${response.data?.length || 0}件のアテンダー情報を取得しました` 
        : `アテンダー情報の取得に失敗しました: ${response.error?.message || '不明なエラー'}`,
      data: response.data,
      error: response.error,
      duration: endTime - startTime
    };
  } catch (error) {
    const endTime = performance.now();
    return {
      name: 'アテンダー一覧取得テスト',
      success: false,
      message: error instanceof Error ? error.message : '不明なエラー',
      error,
      duration: endTime - startTime
    };
  }
}

/**
 * 体験一覧取得テスト
 */
export async function testGetExperiences(): Promise<TestResult> {
  const startTime = performance.now();
  try {
    const response = await enhancedApi.get(ENDPOINTS.EXPERIENCE.LIST);
    
    const endTime = performance.now();
    return {
      name: '体験一覧取得テスト',
      success: response.success,
      message: response.success 
        ? `${response.data?.length || 0}件の体験情報を取得しました` 
        : `体験情報の取得に失敗しました: ${response.error?.message || '不明なエラー'}`,
      data: response.data,
      error: response.error,
      duration: endTime - startTime
    };
  } catch (error) {
    const endTime = performance.now();
    return {
      name: '体験一覧取得テスト',
      success: false,
      message: error instanceof Error ? error.message : '不明なエラー',
      error,
      duration: endTime - startTime
    };
  }
}

/**
 * すべてのテストを実行
 */
export async function runAllTests(): Promise<TestResult[]> {
  const results: TestResult[] = [];
  
  // 認証テスト
  results.push(await testAuthentication());
  
  // 一覧取得テスト
  results.push(await testGetAttenders());
  results.push(await testGetExperiences());
  
  // 認証が必要なAPIテスト
  const authTest = results[0];
  if (authTest.success) {
    // 予約関連テスト
    results.push(await testGetBookings());
    results.push(await testCreateBooking());
    
    // レビュー関連テスト
    results.push(await testGetReviews());
    results.push(await testCreateReview());
    
    // アップロードテスト
    results.push(await testFileUpload());
  } else {
    console.warn('認証に失敗したため、認証が必要なAPIテストはスキップします');
  }
  
  return results;
}

/**
 * テスト結果をコンソールに出力
 */
export function printTestResults(results: TestResult[]): void {
  console.group('APIテスト結果');
  
  results.forEach(result => {
    const statusIcon = result.success ? '✅' : '❌';
    console.log(`${statusIcon} ${result.name} - ${result.message} (${result.duration.toFixed(2)}ms)`);
    
    if (result.data) {
      console.log('  データ:', result.data);
    }
    
    if (result.error) {
      console.error('  エラー:', result.error);
    }
  });
  
  const successCount = results.filter(r => r.success).length;
  console.log(`\n総合結果: ${results.length}件中 ${successCount}件成功 (${(successCount / results.length * 100).toFixed(1)}%成功率)`);
  
  console.groupEnd();
}

export default {
  testAuthentication,
  testGetBookings,
  testGetReviews,
  testCreateReview,
  testCreateBooking,
  testFileUpload,
  testGetAttenders,
  testGetExperiences,
  runAllTests,
  printTestResults
};
