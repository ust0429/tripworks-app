/**
 * APIクライアント初期化
 * 
 * アプリケーション起動時にAPIクライアントを初期化します。
 */
import firebase from 'firebase/app';
import 'firebase/auth';
import apiClient, { setupAuthListener } from './apiClientEnhanced';
import apiMonitor from './apiMonitor';
import { isDevelopment, isDebugMode } from '../config/env';
import { ENDPOINTS } from '../config/api';

/**
 * APIクライアントを初期化
 * 
 * アプリケーション起動時に呼び出します。
 * Firebase認証との連携と、APIへの接続テストを行います。
 */
export async function initializeApiClient(): Promise<boolean> {
  try {
    console.info('APIクライアントを初期化中...');
    
    // 認証リスナーを設定（すでにapiClientEnhanced内で実行されている場合もある）
    setupAuthListener();
    
    // 接続テスト
    if (isDevelopment() || isDebugMode()) {
      console.info('API接続テストを実行中...');
      
      try {
        // 認証が不要なエンドポイントを使用
        const response = await apiClient.get(ENDPOINTS.ATTENDER.LIST);
        
        if (response.success) {
          console.info('API接続テスト成功');
          console.info(`取得したデータサイズ: ${JSON.stringify(response.data).length} バイト`);
        } else {
          console.warn('API接続テスト失敗:', response.error);
          console.warn('APIサーバーが起動していることを確認してください');
        }
      } catch (error) {
        console.error('API接続テスト例外:', error);
        // テスト失敗は初期化失敗とはみなさない
      }
    }
    
    // API監視の開始
    if (typeof window !== 'undefined') {
      apiMonitor.start();
    }
    
    console.info('APIクライアント初期化完了');
    return true;
  } catch (error) {
    console.error('APIクライアント初期化エラー:', error);
    return false;
  }
}

/**
 * ブラウザ環境でのみ実行される初期化コード
 */
export function initializeApiOnBrowser(): void {
  if (typeof window !== 'undefined') {
    // クライアントサイドでのみ実行
    initializeApiClient().then(success => {
      if (success) {
        console.info('APIクライアントの初期化に成功しました');
      } else {
        console.warn('APIクライアントの初期化に失敗しました');
      }
    });
  }
}

export default {
  initializeApiClient,
  initializeApiOnBrowser
};
