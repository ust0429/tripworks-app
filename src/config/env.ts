/**
 * 環境設定ユーティリティ
 */

/**
 * 開発環境かどうかを判定
 * 
 * @returns 開発環境の場合はtrue
 */
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development';
}

/**
 * 本番環境かどうかを判定
 * 
 * @returns 本番環境の場合はtrue
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

/**
 * テスト環境かどうかを判定
 * 
 * @returns テスト環境の場合はtrue
 */
export function isTest(): boolean {
  return process.env.NODE_ENV === 'test';
}

/**
 * デバッグモードかどうかを判定
 * 
 * @returns デバッグモードの場合はtrue
 */
export function isDebugMode(): boolean {
  return process.env.REACT_APP_DEBUG_MODE === 'true';
}

export default {
  isDevelopment,
  isProduction,
  isTest,
  isDebugMode
};
