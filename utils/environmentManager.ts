/**
 * 環境管理システム
 * 
 * 開発環境、ステージング環境、本番環境の切り替えと管理を行います。
 * API連携のモード切替や環境に応じた設定の適用を担当します。
 */

import { getAuth } from 'firebase/auth';
import { isDevelopment, isProduction, isTest } from '../config/env';

// 環境タイプの定義
export type EnvironmentType = 'development' | 'staging' | 'production';

// 環境設定インターフェース
export interface EnvironmentSettings {
  apiBaseUrl: string;
  useMockData: boolean;
  enableLogging: boolean;
  apiTimeout: number;
  enableOfflineSupport: boolean;
  enableAnalytics: boolean;
}

// デフォルトの環境設定
const DEFAULT_SETTINGS: Record<EnvironmentType, EnvironmentSettings> = {
  development: {
    apiBaseUrl: 'http://localhost:3001',
    useMockData: true,
    enableLogging: true,
    apiTimeout: 30000,
    enableOfflineSupport: true,
    enableAnalytics: false
  },
  staging: {
    apiBaseUrl: 'https://echo-backend-api-xxxxxxxx-an.a.run.app',
    useMockData: false,
    enableLogging: true,
    apiTimeout: 30000,
    enableOfflineSupport: true,
    enableAnalytics: true
  },
  production: {
    apiBaseUrl: 'https://api.echo-app.jp',
    useMockData: false,
    enableLogging: false,
    apiTimeout: 30000,
    enableOfflineSupport: true,
    enableAnalytics: true
  }
};

// 現在の環境設定
let currentEnvironment: EnvironmentType = 
  isProduction() ? 'production' : 
  process.env.REACT_APP_BACKEND_ENV === 'staging' ? 'staging' : 
  'development';

let currentSettings: EnvironmentSettings = { ...DEFAULT_SETTINGS[currentEnvironment] };

// 環境変数の値で設定を上書き
if (process.env.REACT_APP_API_URL) {
  currentSettings.apiBaseUrl = process.env.REACT_APP_API_URL;
}

if (process.env.REACT_APP_USE_MOCK_DATA === 'true') {
  currentSettings.useMockData = true;
} else if (process.env.REACT_APP_USE_MOCK_DATA === 'false') {
  currentSettings.useMockData = false;
}

if (process.env.REACT_APP_API_TIMEOUT) {
  const timeout = parseInt(process.env.REACT_APP_API_TIMEOUT, 10);
  if (!isNaN(timeout)) {
    currentSettings.apiTimeout = timeout;
  }
}

// 環境設定の保存と読み込み
const STORAGE_KEY = 'echo_environment_settings';

/**
 * 現在の環境設定をローカルストレージに保存
 */
export const saveSettings = (): void => {
  try {
    if (typeof window !== 'undefined') {
      const settings = {
        environment: currentEnvironment,
        settings: currentSettings,
        timestamp: new Date().toISOString()
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    }
  } catch (error) {
    console.error('環境設定の保存に失敗しました:', error);
  }
};

/**
 * ローカルストレージから環境設定を読み込み
 */
export const loadSettings = (): void => {
  try {
    if (typeof window !== 'undefined') {
      const savedSettings = localStorage.getItem(STORAGE_KEY);
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        // 開発環境でのみカスタム設定を適用（本番環境では常にデフォルト設定を使用）
        if (isDevelopment()) {
          currentEnvironment = parsed.environment || currentEnvironment;
          currentSettings = { ...currentSettings, ...parsed.settings };
        }
      }
    }
  } catch (error) {
    console.error('環境設定の読み込みに失敗しました:', error);
  }
};

/**
 * 環境の切り替え
 * @param environment 切り替える環境
 * @param customSettings 環境のカスタム設定（オプション）
 */
export const switchEnvironment = (
  environment: EnvironmentType,
  customSettings?: Partial<EnvironmentSettings>
): void => {
  // 本番環境への切り替えは開発中のみ許可
  if (environment === 'production' && !isDevelopment()) {
    console.warn('本番環境への切り替えは開発環境でのみ可能です');
    return;
  }

  currentEnvironment = environment;
  currentSettings = {
    ...DEFAULT_SETTINGS[environment],
    ...customSettings
  };

  // ログ出力（開発環境のみ）
  if (isDevelopment()) {
    console.info(`環境を切り替えました: ${environment}`);
    console.info('現在の設定:', currentSettings);
  }

  // 設定を保存
  saveSettings();
};

/**
 * 現在の環境を取得
 */
export const getCurrentEnvironment = (): EnvironmentType => currentEnvironment;

/**
 * 現在の環境設定を取得
 */
export const getCurrentSettings = (): EnvironmentSettings => ({ ...currentSettings });

/**
 * APIのベースURLを取得
 */
export const getApiBaseUrl = (): string => currentSettings.apiBaseUrl;

/**
 * モックデータを使用するかどうかを取得
 */
export const useMockData = (): boolean => {
  // クエリパラメータでのオーバーライド（開発環境のみ）
  if (isDevelopment() && typeof window !== 'undefined') {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('mock')) {
      return urlParams.get('mock') !== 'false';
    }
    if (urlParams.has('useMock')) {
      return urlParams.get('useMock') !== 'false';
    }
  }
  
  return currentSettings.useMockData;
};

/**
 * ログ出力を有効にするかどうかを取得
 */
export const enableLogging = (): boolean => currentSettings.enableLogging;

/**
 * APIタイムアウト値を取得
 */
export const getApiTimeout = (): number => currentSettings.apiTimeout;

/**
 * オフラインサポートを有効にするかどうかを取得
 */
export const enableOfflineSupport = (): boolean => currentSettings.enableOfflineSupport;

/**
 * 分析機能を有効にするかどうかを取得
 */
export const enableAnalytics = (): boolean => currentSettings.enableAnalytics;

/**
 * 現在のユーザーが認証されているかどうかを取得
 */
export const isAuthenticated = (): boolean => {
  const auth = getAuth();
  return !!auth.currentUser;
};

/**
 * 設定を更新
 * @param settings 更新する設定
 */
export const updateSettings = (settings: Partial<EnvironmentSettings>): void => {
  currentSettings = {
    ...currentSettings,
    ...settings
  };
  
  // ログ出力（開発環境のみ）
  if (isDevelopment()) {
    console.info('環境設定を更新しました');
    console.info('現在の設定:', currentSettings);
  }
  
  // 設定を保存
  saveSettings();
};

// 初期化時に設定を読み込み
loadSettings();

// グローバルなヘルパー関数（開発用）
if (isDevelopment() && typeof window !== 'undefined') {
  (window as any).echoEnv = {
    getCurrentEnvironment,
    getCurrentSettings,
    switchEnvironment,
    updateSettings,
    useMockData
  };
}

export default {
  getCurrentEnvironment,
  getCurrentSettings,
  switchEnvironment,
  updateSettings,
  getApiBaseUrl,
  useMockData,
  enableLogging,
  getApiTimeout,
  enableOfflineSupport,
  enableAnalytics,
  isAuthenticated
};
