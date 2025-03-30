/**
 * 環境設定
 * 
 * アプリケーションの環境設定を管理します。
 */

// 環境設定のインターフェース
export interface EnvironmentConfig {
  production: boolean;
  development: boolean;
  apiUrl: string;
  debugMode: boolean;
  useMockData: boolean;
}

// 現在の環境を判定
export const isDevelopment = (): boolean => process.env.NODE_ENV === 'development';
export const isProduction = (): boolean => process.env.NODE_ENV === 'production';
export const isTest = (): boolean => process.env.NODE_ENV === 'test';

// デバッグモードの判定
export const isDebugMode = (): boolean => {
  // クエリパラメータでデバッグモードを有効化できる（開発環境のみ）
  if (isDevelopment() && typeof window !== 'undefined') {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('debug')) {
      return true;
    }
  }
  
  // 環境変数でデバッグモードを有効化
  return process.env.REACT_APP_DEBUG_MODE === 'true';
};

// モックデータ使用の判定
export const useMockData = (): boolean => {
  // クエリパラメータでモックデータの切り替えが可能（開発環境のみ）
  if (isDevelopment() && typeof window !== 'undefined') {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('mock')) {
      return urlParams.get('mock') !== 'false';
    }
  }
  
  // テスト環境では常にモックデータを使用
  if (isTest()) {
    return true;
  }
  
  // 本番環境では常に実データを使用
  if (isProduction()) {
    return false;
  }
  
  // 開発環境では環境変数に基づく
  return process.env.REACT_APP_USE_MOCK_DATA !== 'false';
};

// API URLの取得
export const getApiUrl = (): string => {
  if (isDevelopment()) {
    return process.env.REACT_APP_DEV_API_URL || 'http://localhost:3001';
  }
  
  if (isTest()) {
    return process.env.REACT_APP_TEST_API_URL || 'http://localhost:3001';
  }
  
  return process.env.REACT_APP_API_URL || 'https://api.echo-app.jp';
};

// 環境設定を取得
export const getEnvironmentConfig = (): EnvironmentConfig => {
  return {
    production: isProduction(),
    development: isDevelopment(),
    apiUrl: getApiUrl(),
    debugMode: isDebugMode(),
    useMockData: useMockData()
  };
};

export default {
  isDevelopment,
  isProduction,
  isTest,
  isDebugMode,
  useMockData,
  getApiUrl,
  getEnvironmentConfig
};
