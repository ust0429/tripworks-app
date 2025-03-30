/**
 * API統合テスト用ユーティリティ
 * 
 * 各APIエンドポイントのテストを実行するための関数群
 */

import api from './apiClient';
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
      name: 'Authentication Test',
      success: !!token,
      message: 'Successfully retrieved authentication token',
      data: { uid: user.uid },
      duration: endTime - startTime
    };
  } catch (error) {
    const endTime = performance.now();
    return {
      name: 'Authentication Test',
      success: false,
      message: error instanceof Error ? error.message : 'Unknown authentication error',
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
    const response = await api.get(ENDPOINTS.BOOKING.LIST);
    
    const endTime = performance.now();
    return {
      name: 'Get Bookings Test',
      success: response.success,
      message: response.success 
        ? `Successfully retrieved ${response.data?.length || 0} bookings` 
        : `Failed to retrieve bookings: ${response.error?.message || 'Unknown error'}`,
      data: response.data,
      error: response.error,
      duration: endTime - startTime
    };
  } catch (error) {
    const endTime = performance.now();
    return {
      name: 'Get Bookings Test',
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
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
    
    const response = await api.get(
      ENDPOINTS.REVIEW.LIST,
      { attenderId: sampleAttenderId }
    );
    
    const endTime = performance.now();
    return {
      name: 'Get Reviews Test',
      success: response.success,
      message: response.success 
        ? `Successfully retrieved ${response.data?.length || 0} reviews` 
        : `Failed to retrieve reviews: ${response.error?.message || 'Unknown error'}`,
      data: response.data,
      error: response.error,
      duration: endTime - startTime
    };
  } catch (error) {
    const endTime = performance.now();
    return {
      name: 'Get Reviews Test',
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
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
      comment: 'This is a test review from the API tester. Please ignore.'
    };
    
    const response = await api.post(
      ENDPOINTS.REVIEW.CREATE,
      reviewData
    );
    
    const endTime = performance.now();
    return {
      name: 'Create Review Test',
      success: response.success,
      message: response.success 
        ? `Successfully created review with ID: ${response.data?.id}` 
        : `Failed to create review: ${response.error?.message || 'Unknown error'}`,
      data: response.data,
      error: response.error,
      duration: endTime - startTime
    };
  } catch (error) {
    const endTime = performance.now();
    return {
      name: 'Create Review Test',
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
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
      notes: 'This is a test booking from the API tester. Please ignore.'
    };
    
    const response = await api.post(
      ENDPOINTS.BOOKING.CREATE,
      bookingData
    );
    
    const endTime = performance.now();
    return {
      name: 'Create Booking Test',
      success: response.success,
      message: response.success 
        ? `Successfully created booking with ID: ${response.data?.id}` 
        : `Failed to create booking: ${response.error?.message || 'Unknown error'}`,
      data: response.data,
      error: response.error,
      duration: endTime - startTime
    };
  } catch (error) {
    const endTime = performance.now();
    return {
      name: 'Create Booking Test',
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
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
    // テスト用のダミーファイルデータを作成
    // Note: 実際のファイルオブジェクトがないので、このテストは失敗することを想定
    const dummyFormData = new FormData();
    
    const response = await fetch(ENDPOINTS.UPLOAD.IMAGE, {
      method: 'POST',
      body: dummyFormData,
      headers: {
        // 通常はAuthorizationヘッダーを追加するが、formDataを使うので自動的に追加される
      }
    });
    
    const responseData = await response.json();
    
    const endTime = performance.now();
    return {
      name: 'File Upload Test',
      success: response.ok,
      message: response.ok 
        ? `Successfully uploaded file: ${responseData?.url}` 
        : `Failed to upload file: ${responseData?.message || response.statusText}`,
      data: responseData,
      error: !response.ok ? responseData : undefined,
      duration: endTime - startTime
    };
  } catch (error) {
    const endTime = performance.now();
    return {
      name: 'File Upload Test',
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
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
  
  // 予約関連テスト
  results.push(await testGetBookings());
  results.push(await testCreateBooking());
  
  // レビュー関連テスト
  results.push(await testGetReviews());
  results.push(await testCreateReview());
  
  // アップロードテスト
  results.push(await testFileUpload());
  
  return results;
}

export default {
  testAuthentication,
  testGetBookings,
  testGetReviews,
  testCreateReview,
  testCreateBooking,
  testFileUpload,
  runAllTests
};
