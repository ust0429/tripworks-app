/**
 * API統合テスト用ヘルパー関数
 * 
 * APIと連携するコンポーネントやフックのテストを支援するユーティリティ
 */

import enhancedApi, { ApiResponse } from './apiClientEnhanced';
import { ENDPOINTS } from '../config/api';

// テストレポートの型
export interface TestReport {
  name: string;
  success: boolean;
  error?: string;
  duration: number;
  data?: any;
}

/**
 * APIエンドポイントへの接続テスト
 * 
 * @param endpoint テスト対象のエンドポイント
 * @returns テストレポート
 */
export async function testEndpointConnection(endpoint: string): Promise<TestReport> {
  const startTime = performance.now();
  
  try {
    // OPTIONSリクエストを送信してサーバーの応答を確認
    const response = await fetch(endpoint, { method: 'OPTIONS' });
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    return {
      name: `接続テスト: ${endpoint}`,
      success: response.ok,
      duration,
      data: {
        status: response.status,
        headers: Array.from(response.headers.entries()).reduce((obj, [key, value]) => {
          obj[key] = value;
          return obj;
        }, {} as Record<string, string>)
      }
    };
  } catch (error) {
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    return {
      name: `接続テスト: ${endpoint}`,
      success: false,
      error: error instanceof Error ? error.message : '不明なエラー',
      duration
    };
  }
}

/**
 * 認証トークン取得テスト
 * 
 * @returns テストレポート
 */
export async function testAuthToken(): Promise<TestReport> {
  const startTime = performance.now();
  
  try {
    const token = await enhancedApi.getAuthToken();
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    return {
      name: '認証トークン取得テスト',
      success: !!token,
      duration,
      data: {
        tokenExists: !!token,
        tokenLength: token ? token.length : 0
      }
    };
  } catch (error) {
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    return {
      name: '認証トークン取得テスト',
      success: false,
      error: error instanceof Error ? error.message : '不明なエラー',
      duration
    };
  }
}

/**
 * GETリクエストテスト
 * 
 * @param endpoint テスト対象のエンドポイント
 * @param params クエリパラメータ（オプション）
 * @returns テストレポート
 */
export async function testGetRequest(endpoint: string, params?: Record<string, any>): Promise<TestReport> {
  const startTime = performance.now();
  
  try {
    const response = await enhancedApi.get(endpoint, params || {});
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    return {
      name: `GETリクエストテスト: ${endpoint}`,
      success: response.success,
      error: !response.success ? JSON.stringify(response.error) : undefined,
      duration,
      data: {
        status: response.status,
        dataSize: response.data ? JSON.stringify(response.data).length : 0,
        data: response.data
      }
    };
  } catch (error) {
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    return {
      name: `GETリクエストテスト: ${endpoint}`,
      success: false,
      error: error instanceof Error ? error.message : '不明なエラー',
      duration
    };
  }
}

/**
 * POSTリクエストテスト
 * 
 * @param endpoint テスト対象のエンドポイント
 * @param data リクエストボディ
 * @returns テストレポート
 */
export async function testPostRequest(endpoint: string, data: any): Promise<TestReport> {
  const startTime = performance.now();
  
  try {
    const response = await enhancedApi.post(endpoint, data);
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    return {
      name: `POSTリクエストテスト: ${endpoint}`,
      success: response.success,
      error: !response.success ? JSON.stringify(response.error) : undefined,
      duration,
      data: {
        status: response.status,
        response: response.data
      }
    };
  } catch (error) {
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    return {
      name: `POSTリクエストテスト: ${endpoint}`,
      success: false,
      error: error instanceof Error ? error.message : '不明なエラー',
      duration
    };
  }
}

/**
 * 一連のAPIテストを実行
 * 
 * @returns テストレポートの配列
 */
export async function runApiTests(): Promise<TestReport[]> {
  const reports: TestReport[] = [];
  
  // 認証トークン取得テスト
  reports.push(await testAuthToken());
  
  // 基本的なエンドポイントの接続テスト
  const endpointsToTest = [
    ENDPOINTS.ATTENDER.LIST,
    ENDPOINTS.BOOKING.LIST,
    ENDPOINTS.REVIEW.LIST,
    ENDPOINTS.EXPERIENCE.LIST
  ];
  
  for (const endpoint of endpointsToTest) {
    reports.push(await testEndpointConnection(endpoint));
  }
  
  // アテンダー一覧取得テスト
  reports.push(await testGetRequest(ENDPOINTS.ATTENDER.LIST));
  
  // 予約一覧取得テスト（認証が必要）
  if (reports[0].success) { // 認証トークンが取得できた場合のみ
    reports.push(await testGetRequest(ENDPOINTS.BOOKING.LIST));
  }
  
  return reports;
}

/**
 * テストレポートを表形式でコンソールに出力
 * 
 * @param reports テストレポートの配列
 */
export function printTestReports(reports: TestReport[]): void {
  console.group('API統合テスト結果');
  
  reports.forEach(report => {
    const statusSymbol = report.success ? '✅' : '❌';
    console.log(`${statusSymbol} ${report.name} (${report.duration.toFixed(2)}ms)`);
    
    if (!report.success && report.error) {
      console.error(`  エラー: ${report.error}`);
    }
    
    if (report.data) {
      console.log('  データ:', report.data);
    }
  });
  
  const successCount = reports.filter(r => r.success).length;
  const failCount = reports.length - successCount;
  
  console.log(`\n合計: ${reports.length}テスト、成功: ${successCount}、失敗: ${failCount}`);
  console.groupEnd();
}

export default {
  testEndpointConnection,
  testAuthToken,
  testGetRequest,
  testPostRequest,
  runApiTests,
  printTestReports
};
