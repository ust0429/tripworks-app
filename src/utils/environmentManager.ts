/**
 * 環境管理システム
 * 
 * 開発/ステージング/本番環境の切り替えとそれに伴う設定の管理を行います。
 */
import { isDevelopment, isDebugMode } from '../config/env';

// 環境タイプの定義
export enum EnvironmentType {
  DEVELOPMENT = 'development',
  STAGING = 'staging',
  PRODUCTION = 'production'
}

// 環境設定の型定義
export interface EnvironmentConfig {
  type: EnvironmentType;
  apiBaseUrl: string;
  useCache: boolean;
  useMockData: boolean;
  authEnabled: boolean;
  timeouts: {
    default: number;
    upload: number;
    long: number;
  };
  retryConfig: {
    maxRetries: number;
    baseDelay: number;
    maxDelay: number;
  };
}

// ローカルストレージのキー
const STORAGE_KEY = 'echo_environment_settings';

// デフォルト設定
const DEFAULT_CONFIGS: Record<EnvironmentType, EnvironmentConfig> = {
  [EnvironmentType.DEVELOPMENT]: {
    type: EnvironmentType.DEVELOPMENT,
    apiBaseUrl: process.env.REACT_APP_DEV_API_URL || 'http://localhost:5000/api',
    useCache: true,
    useMockData: true,
    authEnabled: false,
    timeouts: {
      default: 10000, // 10秒
      upload: 60000,  // 60秒
      long: 30000     // 30秒
    },
    retryConfig: {
      maxRetries: 1,
      baseDelay: 500,
      maxDelay: 3000
    }
  },
  [EnvironmentType.STAGING]: {
    type: EnvironmentType.STAGING,
    apiBaseUrl: process.env.REACT_APP_STAGING_API_URL || 'https://staging-api.echo-app.example/api',
    useCache: true,
    useMockData: false,
    authEnabled: true,
    timeouts: {
      default: 15000, // 15秒
      upload: 90000,  // 90秒
      long: 45000     // 45秒
    },
    retryConfig: {
      maxRetries: 2,
      baseDelay: 1000,
      maxDelay: 5000
    }
  },
  [EnvironmentType.PRODUCTION]: {
    type: EnvironmentType.PRODUCTION,
    apiBaseUrl: process.env.REACT_APP_PROD_API_URL || 'https://api.echo-app.example/api',
    useCache: true,
    useMockData: false,
    authEnabled: true,
    timeouts: {
      default: 20000, // 20秒
      upload: 120000, // 120秒
      long: 60000     // 60秒
    },
    retryConfig: {
      maxRetries: 3,
      baseDelay: 2000,
      maxDelay: 10000
    }
  }
};

// 現在の環境設定
let currentConfig: EnvironmentConfig;

/**
 * 現在のNode環境に基づいてデフォルト環境タイプを取得
 */
function getDefaultEnvironmentType(): EnvironmentType {
  if (process.env.NODE_ENV === 'production') {
    return EnvironmentType.PRODUCTION;
  } else if (process.env.REACT_APP_ENV === 'staging') {
    return EnvironmentType.STAGING;
  } else {
    return EnvironmentType.DEVELOPMENT;
  }
}

/**
 * ローカルストレージから設定を読み込み
 */
function loadSavedConfig(): EnvironmentConfig | null {
  try {
    const savedConfig = localStorage.getItem(STORAGE_KEY);
    if (savedConfig) {
      return JSON.parse(savedConfig);
    }
    return null;
  } catch (error) {
    console.error('環境設定の読み込みエラー:', error);
    return null;
  }
}

/**
 * 設定をローカルストレージに保存
 */
function saveConfig(config: EnvironmentConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch (error) {
    console.error('環境設定の保存エラー:', error);
  }
}

/**
 * 現在の環境設定を初期化
 */
function initializeConfig(): void {
  // 保存された設定があれば読み込み
  const savedConfig = loadSavedConfig();
  
  // デフォルト環境タイプを取得
  const defaultType = getDefaultEnvironmentType();
  
  // 設定を決定
  if (savedConfig && savedConfig.type) {
    // 保存された設定を使用するが、APIベースURLは環境変数から取得されたものを優先
    const baseConfig = DEFAULT_CONFIGS[savedConfig.type];
    currentConfig = {
      ...baseConfig,
      ...savedConfig,
      // 環境変数が設定されている場合は常にそれを優先
      apiBaseUrl: process.env.REACT_APP_API_URL || 
                  (savedConfig.type === EnvironmentType.PRODUCTION ? process.env.REACT_APP_PROD_API_URL : 
                   savedConfig.type === EnvironmentType.STAGING ? process.env.REACT_APP_STAGING_API_URL :
                   process.env.REACT_APP_DEV_API_URL) ||
                  savedConfig.apiBaseUrl
    };
  } else {
    // デフォルト設定を使用
    currentConfig = DEFAULT_CONFIGS[defaultType];
  }
  
  // 設定を保存
  saveConfig(currentConfig);
  
  // 開発環境の場合は設定をコンソールに出力
  if (isDevelopment() || isDebugMode()) {
    console.log('🔧 現在の環境設定:', currentConfig);
  }
}

// 初期化
initializeConfig();

/**
 * 現在の環境設定を取得
 */
export function getEnvironmentConfig(): EnvironmentConfig {
  return { ...currentConfig };
}

/**
 * 環境タイプを変更
 */
export function setEnvironmentType(type: EnvironmentType): EnvironmentConfig {
  // デフォルト設定をベースに現在のカスタム設定を適用
  const customSettings = {
    useCache: currentConfig.useCache,
    useMockData: currentConfig.useMockData,
    authEnabled: currentConfig.authEnabled
  };
  
  currentConfig = {
    ...DEFAULT_CONFIGS[type],
    ...customSettings
  };
  
  saveConfig(currentConfig);
  
  if (isDevelopment() || isDebugMode()) {
    console.log(`🔄 環境を変更しました: ${type}`);
    console.log('🔧 現在の環境設定:', currentConfig);
  }
  
  // 環境変更イベントを発行
  window.dispatchEvent(new CustomEvent('echo:environment-changed', {
    detail: { type, config: currentConfig }
  }));
  
  return { ...currentConfig };
}

/**
 * 環境設定を更新
 */
export function updateEnvironmentConfig(updates: Partial<EnvironmentConfig>): EnvironmentConfig {
  currentConfig = {
    ...currentConfig,
    ...updates
  };
  
  saveConfig(currentConfig);
  
  if (isDevelopment() || isDebugMode()) {
    console.log('🔄 環境設定を更新しました');
    console.log('🔧 現在の環境設定:', currentConfig);
  }
  
  // 環境変更イベントを発行
  window.dispatchEvent(new CustomEvent('echo:environment-changed', {
    detail: { type: currentConfig.type, config: currentConfig }
  }));
  
  return { ...currentConfig };
}

/**
 * モックデータの使用設定を切り替え
 */
export function setUseMockData(useMock: boolean): void {
  updateEnvironmentConfig({ useMockData: useMock });
}

/**
 * キャッシュの使用設定を切り替え
 */
export function setUseCache(useCache: boolean): void {
  updateEnvironmentConfig({ useCache });
}

/**
 * 認証の使用設定を切り替え
 */
export function setAuthEnabled(authEnabled: boolean): void {
  updateEnvironmentConfig({ authEnabled });
}

/**
 * APIベースURLを設定
 */
export function setApiBaseUrl(apiBaseUrl: string): void {
  updateEnvironmentConfig({ apiBaseUrl });
}

/**
 * 環境設定をデフォルトに戻す
 */
export function resetToDefault(): EnvironmentConfig {
  const defaultType = getDefaultEnvironmentType();
  currentConfig = DEFAULT_CONFIGS[defaultType];
  saveConfig(currentConfig);
  
  if (isDevelopment() || isDebugMode()) {
    console.log('🔄 環境設定をデフォルトに戻しました');
    console.log('🔧 現在の環境設定:', currentConfig);
  }
  
  // 環境変更イベントを発行
  window.dispatchEvent(new CustomEvent('echo:environment-changed', {
    detail: { type: defaultType, config: currentConfig }
  }));
  
  return { ...currentConfig };
}

// 環境設定のグローバルアクセス用（開発目的）
if (isDevelopment() || isDebugMode()) {
  (window as any).echoEnv = {
    getConfig: getEnvironmentConfig,
    setType: setEnvironmentType,
    updateConfig: updateEnvironmentConfig,
    setUseMock: setUseMockData,
    setUseCache,
    setAuthEnabled,
    setApiBaseUrl,
    reset: resetToDefault,
    EnvironmentType
  };
}

export default {
  getEnvironmentConfig,
  setEnvironmentType,
  updateEnvironmentConfig,
  setUseMockData,
  setUseCache,
  setAuthEnabled,
  setApiBaseUrl,
  resetToDefault,
  EnvironmentType
};
