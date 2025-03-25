/**
 * 環境設定関連のユーティリティ
 * 
 * アプリケーションの環境判定や環境変数へのアクセスを提供します。
 */

/**
 * 現在の環境が開発環境かどうかを判定
 * @returns 開発環境の場合はtrue、そうでない場合はfalse
 */
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development';
}

/**
 * 現在の環境が本番環境かどうかを判定
 * @returns 本番環境の場合はtrue、そうでない場合はfalse
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

/**
 * 現在の環境がテスト環境かどうかを判定
 * @returns テスト環境の場合はtrue、そうでない場合はfalse
 */
export function isTest(): boolean {
  return process.env.NODE_ENV === 'test';
}

/**
 * 環境変数から値を取得（存在しない場合はデフォルト値を返す）
 * @param key 環境変数のキー
 * @param defaultValue 環境変数が存在しない場合のデフォルト値
 * @returns 環境変数の値またはデフォルト値
 */
export function getEnv(key: string, defaultValue: string = ''): string {
  // Reactアプリでは環境変数はREACT_APP_プレフィックスが必要
  const envKey = key.startsWith('REACT_APP_') ? key : `REACT_APP_${key}`;
  return process.env[envKey] || defaultValue;
}

/**
 * アプリケーションのAPIベースURLを取得
 * @returns APIのベースURL
 */
export function getApiBaseUrl(): string {
  return getEnv('API_BASE_URL', 'https://api.echo-app.jp/v1');
}

/**
 * アプリケーションのバージョンを取得
 * @returns アプリケーションのバージョン
 */
export function getAppVersion(): string {
  return getEnv('APP_VERSION', '0.0.0');
}

/**
 * モック機能が有効かどうかを判定
 * @returns モック機能が有効な場合はtrue、そうでない場合はfalse
 */
export function isMockEnabled(): boolean {
  return getEnv('ENABLE_MOCK', isDevelopment() ? 'true' : 'false') === 'true';
}

/**
 * デバッグモードが有効かどうかを判定
 * @returns デバッグモードが有効な場合はtrue、そうでない場合はfalse
 */
export function isDebugMode(): boolean {
  return getEnv('DEBUG_MODE', 'false') === 'true';
}

export default {
  isDevelopment,
  isProduction,
  isTest,
  getEnv,
  getApiBaseUrl,
  getAppVersion,
  isMockEnabled,
  isDebugMode
};