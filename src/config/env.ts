/**
 * 環境変数と実行環境の判定ユーティリティ
 */

// 開発環境かどうか
export const isDevelopment = (): boolean => {
  return process.env.NODE_ENV === 'development';
};

// デバッグモードかどうか
export const isDebugMode = (): boolean => {
  return process.env.REACT_APP_DEBUG === 'true';
};
