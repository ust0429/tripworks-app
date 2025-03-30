/**
 * モックデータセットアップ
 * 
 * アプリケーション起動時にモックデータを初期化する
 */

import { useMockData } from '../config/env';
import { initializeMockData } from './commonMockData';

/**
 * モックデータを初期化
 * 開発環境で、かつモックデータ使用設定の場合のみ実行
 */
export function setupMockData(): void {
  if (useMockData()) {
    console.info('モックデータを初期化中...');
    initializeMockData();
    console.info('モックデータの初期化が完了しました');
  } else {
    console.info('本番APIを使用するため、モックデータは初期化しません');
  }
}

/**
 * APIリクエスト傍受の設定
 * 開発環境のみで使用
 */
export function setupMockInterceptors(): void {
  if (useMockData() && typeof window !== 'undefined') {
    try {
      console.info('モックインターセプターを設定中...');
      
      // 元のfetchを保存
      const originalFetch = window.fetch;
      
      // fetchをオーバーライド
      window.fetch = async function mockFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
        const url = input instanceof Request ? input.url : input.toString();
        
        // ここでURLパターンに基づいて処理を分岐
        // 実装例: URLに基づいてモックレスポンスを返す
        
        // デバッグログ
        console.debug(`[Mock Fetch] ${init?.method || 'GET'} ${url}`);
        
        // 実際のfetchを呼び出す
        return originalFetch(input, init);
      };
      
      console.info('モックインターセプターの設定が完了しました');
    } catch (error) {
      console.error('モックインターセプターの設定に失敗しました:', error);
    }
  }
}

/**
 * すべてのモックセットアップを実行
 */
export function initializeMocks(): void {
  setupMockData();
  setupMockInterceptors();
}

export default {
  setupMockData,
  setupMockInterceptors,
  initializeMocks
};
