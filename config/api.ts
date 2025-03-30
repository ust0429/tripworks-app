/**
 * API設定
 * 
 * APIエンドポイントURLとその他の設定
 */

// API基本URL
export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://api.echo-app.jp';

// 開発環境では固定のモックAPIを使用
export const DEVELOPMENT_API_URL = 'http://localhost:3001';

// 環境変数を基にしたAPIベースURL
export const getApiBaseUrl = (): string => {
  // 開発環境ではモックAPIを使用
  if (process.env.NODE_ENV === 'development') {
    return DEVELOPMENT_API_URL;
  }
  
  return API_BASE_URL;
};

// APIバージョン
export const API_VERSION = 'v1';

// APIエンドポイント一覧
export const ENDPOINTS = {
  // 認証関連
  AUTH: {
    LOGIN: `${getApiBaseUrl()}/api/${API_VERSION}/auth/login`,
    LOGOUT: `${getApiBaseUrl()}/api/${API_VERSION}/auth/logout`,
    REGISTER: `${getApiBaseUrl()}/api/${API_VERSION}/auth/register`,
    VERIFY_EMAIL: `${getApiBaseUrl()}/api/${API_VERSION}/auth/verify-email`,
    RESET_PASSWORD: `${getApiBaseUrl()}/api/${API_VERSION}/auth/reset-password`,
    REFRESH_TOKEN: `${getApiBaseUrl()}/api/${API_VERSION}/auth/refresh-token`,
  },
  
  // ユーザー関連
  USER: {
    PROFILE: `${getApiBaseUrl()}/api/${API_VERSION}/users/profile`,
    UPDATE_PROFILE: `${getApiBaseUrl()}/api/${API_VERSION}/users/profile`,
    NOTIFICATIONS: `${getApiBaseUrl()}/api/${API_VERSION}/users/notifications`,
    PREFERENCES: `${getApiBaseUrl()}/api/${API_VERSION}/users/preferences`,
  },
  
  // アテンダー関連
  ATTENDER: {
    LIST: `${getApiBaseUrl()}/api/${API_VERSION}/attenders`,
    DETAIL: (id: string) => `${getApiBaseUrl()}/api/${API_VERSION}/attenders/${id}`,
    CREATE: `${getApiBaseUrl()}/api/${API_VERSION}/attenders`,
    UPDATE: (id: string) => `${getApiBaseUrl()}/api/${API_VERSION}/attenders/${id}`,
    EXPERIENCES: (id: string) => `${getApiBaseUrl()}/api/${API_VERSION}/attenders/${id}/experiences`,
    APPLICATION: `${getApiBaseUrl()}/api/${API_VERSION}/attenders/application`,
    SAVE_DRAFT: `${getApiBaseUrl()}/api/${API_VERSION}/attenders/draft`,
    GET_DRAFT: (userId: string) => `${getApiBaseUrl()}/api/${API_VERSION}/attenders/draft/${userId}`,
    FILTER: `${getApiBaseUrl()}/api/${API_VERSION}/attenders/filter`,
    UPDATE_PROFILE: (id: string) => `${getApiBaseUrl()}/api/${API_VERSION}/attenders/${id}/profile`,
    UPDATE_AVAILABILITY: (id: string) => `${getApiBaseUrl()}/api/${API_VERSION}/attenders/${id}/availability`,
    ADD_PORTFOLIO: (id: string) => `${getApiBaseUrl()}/api/${API_VERSION}/attenders/${id}/portfolio`,
  },
  
  // 体験関連
  EXPERIENCE: {
    LIST: `${getApiBaseUrl()}/api/${API_VERSION}/experiences`,
    DETAIL: (id: string) => `${getApiBaseUrl()}/api/${API_VERSION}/experiences/${id}`,
    CREATE: `${getApiBaseUrl()}/api/${API_VERSION}/experiences`,
    UPDATE: (id: string) => `${getApiBaseUrl()}/api/${API_VERSION}/experiences/${id}`,
    DELETE: (id: string) => `${getApiBaseUrl()}/api/${API_VERSION}/experiences/${id}`,
    AVAILABILITY: (id: string) => `${getApiBaseUrl()}/api/${API_VERSION}/experiences/${id}/availability`,
  },
  
  // 予約関連
  BOOKING: {
    LIST: `${getApiBaseUrl()}/api/${API_VERSION}/bookings`,
    DETAIL: (id: string) => `${getApiBaseUrl()}/api/${API_VERSION}/bookings/${id}`,
    CREATE: `${getApiBaseUrl()}/api/${API_VERSION}/bookings`,
    CANCEL: (id: string) => `${getApiBaseUrl()}/api/${API_VERSION}/bookings/${id}/cancel`,
  },
  
  // レビュー関連
  REVIEW: {
    LIST: `${getApiBaseUrl()}/api/${API_VERSION}/reviews`,
    DETAIL: (id: string) => `${getApiBaseUrl()}/api/${API_VERSION}/reviews/${id}`,
    CREATE: `${getApiBaseUrl()}/api/${API_VERSION}/reviews`,
    UPDATE: (id: string) => `${getApiBaseUrl()}/api/${API_VERSION}/reviews/${id}`,
    DELETE: (id: string) => `${getApiBaseUrl()}/api/${API_VERSION}/reviews/${id}`,
  },
  
  // メッセージ関連
  MESSAGE: {
    LIST: `${getApiBaseUrl()}/api/${API_VERSION}/messages`,
    CONVERSATIONS: `${getApiBaseUrl()}/api/${API_VERSION}/messages/conversations`,
    CONVERSATION: (id: string) => `${getApiBaseUrl()}/api/${API_VERSION}/messages/conversations/${id}`,
    SEND: `${getApiBaseUrl()}/api/${API_VERSION}/messages/send`,
  },
  
  // アップロード関連
  UPLOAD: {
    IMAGE: `${getApiBaseUrl()}/api/${API_VERSION}/uploads/image`,
    FILE: `${getApiBaseUrl()}/api/${API_VERSION}/uploads/file`,
    PROFILE_PHOTO: `${getApiBaseUrl()}/api/${API_VERSION}/uploads/profile-photo`,
  },
  
  // 検索関連
  SEARCH: {
    ATTENDERS: `${getApiBaseUrl()}/api/${API_VERSION}/search/attenders`,
    EXPERIENCES: `${getApiBaseUrl()}/api/${API_VERSION}/search/experiences`,
  },
  
  // 通知関連
  NOTIFICATION: {
    LIST: `${getApiBaseUrl()}/api/${API_VERSION}/notifications`,
    READ: (id: string) => `${getApiBaseUrl()}/api/${API_VERSION}/notifications/${id}/read`,
    SETTINGS: `${getApiBaseUrl()}/api/${API_VERSION}/notifications/settings`,
  },
  
  // 支払い関連
  PAYMENT: {
    METHODS: `${getApiBaseUrl()}/api/${API_VERSION}/payments/methods`,
    ADD_METHOD: `${getApiBaseUrl()}/api/${API_VERSION}/payments/methods/add`,
    PROCESS: `${getApiBaseUrl()}/api/${API_VERSION}/payments/process`,
    HISTORY: `${getApiBaseUrl()}/api/${API_VERSION}/payments/history`,
  },
};

// リクエストタイムアウト設定（ミリ秒）
export const REQUEST_TIMEOUT = 30000; // 30秒

// ページネーション設定
export const DEFAULT_PAGE_SIZE = 10;

// API設定をエクスポート
export default {
  API_BASE_URL,
  API_VERSION,
  ENDPOINTS,
  REQUEST_TIMEOUT,
  DEFAULT_PAGE_SIZE,
};
