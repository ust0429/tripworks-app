/**
 * APIクライアント接続テスト
 * 
 * apiClientEnhanced のテストを行います。
 */
import apiClient, { logApiRequest, logApiResponse } from '../apiClientEnhanced';
import { ENDPOINTS } from '../../config/api';
import { isDevelopment } from '../../config/env';

/**
 * APIクライアントの接続テスト
 * 
 * アテンダー一覧を取得することでAPI接続をテストします
 */
export async function testApiConnection(): Promise<boolean> {
  try {
    console.info('APIクライアント接続テスト実行中...');
    logApiRequest('GET', ENDPOINTS.ATTENDER.LIST, {});
    
    const startTime = Date.now();
    const response = await apiClient.get(ENDPOINTS.ATTENDER.LIST);
    const endTime = Date.now();
    
    logApiResponse('GET', ENDPOINTS.ATTENDER.LIST, response);
    
    const requestTime = endTime - startTime;
    console.info(`API接続時間: ${requestTime}ms`);
    
    if (response.success) {
      console.info('API接続テスト成功');
      console.info(`取得したアテンダー件数: ${Array.isArray(response.data) ? response.data.length : 'データが配列ではありません'}`);
      return true;
    } else {
      console.error('API接続テスト失敗:', response.error);
      return false;
    }
  } catch (error) {
    console.error('API接続テスト例外:', error);
    return false;
  }
}

/**
 * API環境設定のテスト
 * 
 * 現在の環境設定を表示します。
 */
export function testApiEnvironment(): void {
  console.group('API環境設定');
  console.info(`環境: ${isDevelopment() ? '開発' : '本番'}`);
  console.info(`API URL: ${ENDPOINTS.ATTENDER.LIST}`);
  console.groupEnd();
}

export default {
  testApiConnection,
  testApiEnvironment
};
