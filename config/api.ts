/**
 * APIエンドポイントの定義
 * 
 * すべてのAPIエンドポイントをここで一元管理します。
 * これにより、エンドポイントの変更が必要な場合に一箇所だけを修正すれば良くなります。
 */

// APIのベースURL（環境に応じて変更）
export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://api.echo-app.jp/v1';

// 各種エンドポイント
export const ENDPOINTS = {
  // 認証関連
  AUTH: {
    LOGIN: `${API_BASE_URL}/auth/login`,
    REGISTER: `${API_BASE_URL}/auth/register`,
    LOGOUT: `${API_BASE_URL}/auth/logout`,
    REFRESH_TOKEN: `${API_BASE_URL}/auth/refresh`,
    RESET_PASSWORD: `${API_BASE_URL}/auth/reset-password`,
    VERIFY_EMAIL: `${API_BASE_URL}/auth/verify-email`,
  },
  
  // ユーザー関連
  USER: {
    PROFILE: `${API_BASE_URL}/users/profile`,
    UPDATE_PROFILE: `${API_BASE_URL}/users/profile`,
    PREFERENCES: `${API_BASE_URL}/users/preferences`,
    NOTIFICATIONS: `${API_BASE_URL}/users/notifications`,
  },
  
  // アテンダー関連
  ATTENDER: {
    LIST: `${API_BASE_URL}/attenders`,
    DETAIL: (attenderId: string) => `${API_BASE_URL}/attenders/${attenderId}`,
    APPLICATION: `${API_BASE_URL}/attenders/application`,
    SAVE_DRAFT: `${API_BASE_URL}/attenders/draft`,
    FILTER: `${API_BASE_URL}/attenders/filter`,
    UPDATE_PROFILE: (attenderId: string) => `${API_BASE_URL}/attenders/${attenderId}/profile`,
    UPDATE_AVAILABILITY: (attenderId: string) => `${API_BASE_URL}/attenders/${attenderId}/availability`,
    ADD_PORTFOLIO: (attenderId: string) => `${API_BASE_URL}/attenders/${attenderId}/portfolio`,
  },
  
  // 体験関連
  EXPERIENCE: {
    LIST: `${API_BASE_URL}/experiences`,
    DETAIL: (experienceId: string) => `${API_BASE_URL}/experiences/${experienceId}`,
    CREATE: `${API_BASE_URL}/experiences`,
    UPDATE: (experienceId: string) => `${API_BASE_URL}/experiences/${experienceId}`,
    DELETE: (experienceId: string) => `${API_BASE_URL}/experiences/${experienceId}`,
    SEARCH: `${API_BASE_URL}/experiences/search`,
    CATEGORIES: `${API_BASE_URL}/experiences/categories`,
  },
  
  // 予約関連
  BOOKING: {
    CREATE: `${API_BASE_URL}/bookings`,
    LIST: `${API_BASE_URL}/bookings`,
    DETAIL: (bookingId: string) => `${API_BASE_URL}/bookings/${bookingId}`,
    CANCEL: (bookingId: string) => `${API_BASE_URL}/bookings/${bookingId}/cancel`,
    CONFIRM: (bookingId: string) => `${API_BASE_URL}/bookings/${bookingId}/confirm`,
  },
  
  // レビュー関連
  REVIEW: {
    CREATE: `${API_BASE_URL}/reviews`,
    LIST: `${API_BASE_URL}/reviews`,
    DETAIL: (reviewId: string) => `${API_BASE_URL}/reviews/${reviewId}`,
    UPDATE: (reviewId: string) => `${API_BASE_URL}/reviews/${reviewId}`,
    DELETE: (reviewId: string) => `${API_BASE_URL}/reviews/${reviewId}`,
  },
  
  // 支払い関連
  PAYMENT: {
    METHODS: `${API_BASE_URL}/payments/methods`,
    ADD_METHOD: `${API_BASE_URL}/payments/methods`,
    PROCESS: `${API_BASE_URL}/payments/process`,
    HISTORY: `${API_BASE_URL}/payments/history`,
  },
  
  // 商品関連
  PRODUCT: {
    LIST: `${API_BASE_URL}/products`,
    DETAIL: (productId: string) => `${API_BASE_URL}/products/${productId}`,
    CATEGORIES: `${API_BASE_URL}/products/categories`,
  },
  
  // ファイルアップロード
  UPLOAD: {
    IMAGE: `${API_BASE_URL}/uploads/image`,
    DOCUMENT: `${API_BASE_URL}/uploads/document`,
  },
  
  // 通知関連
  NOTIFICATION: {
    LIST: `${API_BASE_URL}/notifications`,
    MARK_READ: (notificationId: string) => `${API_BASE_URL}/notifications/${notificationId}/read`,
    SETTINGS: `${API_BASE_URL}/notifications/settings`,
  },
  
  // チャット関連
  CHAT: {
    CONVERSATIONS: `${API_BASE_URL}/chats`,
    MESSAGES: (conversationId: string) => `${API_BASE_URL}/chats/${conversationId}/messages`,
    SEND: (conversationId: string) => `${API_BASE_URL}/chats/${conversationId}/messages`,
  },
  
  // ヘルプ・サポート
  SUPPORT: {
    FAQ: `${API_BASE_URL}/support/faq`,
    CONTACT: `${API_BASE_URL}/support/contact`,
    CATEGORIES: `${API_BASE_URL}/support/categories`,
  },
};

export default ENDPOINTS;