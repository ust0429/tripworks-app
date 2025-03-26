/**
 * API設定
 * 
 * API接続に関する設定とエンドポイントの定義を行います。
 */

import env from './env';

// APIのベースURL
export const API_BASE_URL = env.apiBaseUrl;

// デフォルトのリクエストタイムアウト (ミリ秒)
export const DEFAULT_TIMEOUT = 30000;

// デフォルトのAPIヘッダー
export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json'
};

// APIエンドポイント
export const ENDPOINTS = {
  // 認証関連
  AUTH: {
    SIGNUP: '/auth/signup',
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH_TOKEN: '/auth/refresh-token',
    RESET_PASSWORD: '/auth/reset-password',
    VERIFY_EMAIL: '/auth/verify-email'
  },
  
  // ユーザー関連
  USER: {
    PROFILE: '/users/profile',
    UPDATE_PROFILE: '/users/profile',
    PREFERENCES: '/users/preferences',
    NOTIFICATIONS: '/users/notifications'
  },
  
  // アテンダー関連
  ATTENDER: {
    LIST: '/attenders',
    DETAIL: (id: string) => `/attenders/${id}`,
    APPLICATION: '/attenders/application',
    APPLICATION_STATUS: (id: string) => `/attenders/application/${id}/status`,
    DRAFT_APPLICATION: '/attenders/draft-application',
    GET_DRAFT_APPLICATION: (userId: string) => `/attenders/users/${userId}/draft-application`,
    DELETE_DRAFT_APPLICATION: (userId: string, draftId: string) => `/attenders/users/${userId}/draft-application/${draftId}`,
    UPDATE_PROFILE: (id: string) => `/attenders/${id}/profile`,
    UPDATE_AVAILABILITY: (id: string) => `/attenders/${id}/availability`,
    ADD_PORTFOLIO: (id: string) => `/attenders/${id}/portfolio`,
    REMOVE_PORTFOLIO: (id: string, itemId: string) => `/attenders/${id}/portfolio/${itemId}`,
    METRICS: (id: string) => `/attenders/${id}/metrics`,
    FILTER: '/attenders/filter',
    BY_CITY: '/attenders/by-city',
    BY_SPECIALTY: '/attenders/by-specialty'
  },
  
  // 体験関連
  EXPERIENCE: {
    LIST: '/experiences',
    DETAIL: (id: string) => `/experiences/${id}`,
    CREATE: '/experiences',
    UPDATE: (id: string) => `/experiences/${id}`,
    DELETE: (id: string) => `/experiences/${id}`,
    ATTENDER_EXPERIENCES: (attenderId: string) => `/attenders/${attenderId}/experiences`,
    POPULAR: '/experiences/popular',
    SEARCH: '/experiences/search',
    CATEGORIES: '/experiences/categories'
  },
  
  // 予約関連
  BOOKING: {
    CREATE: '/bookings',
    DETAIL: (id: string) => `/bookings/${id}`,
    USER_BOOKINGS: '/users/bookings',
    ATTENDER_BOOKINGS: '/attenders/bookings',
    UPDATE_STATUS: (id: string) => `/bookings/${id}/status`,
    CANCEL: (id: string) => `/bookings/${id}/cancel`
  },
  
  // レビュー関連
  REVIEW: {
    LIST: '/reviews',
    CREATE: '/reviews',
    DETAIL: (id: string) => `/reviews/${id}`,
    EXPERIENCE_REVIEWS: (experienceId: string) => `/experiences/${experienceId}/reviews`,
    ATTENDER_REVIEWS: (attenderId: string) => `/attenders/${attenderId}/reviews`,
    USER_REVIEWS: '/users/reviews',
    REPLY: (id: string) => `/reviews/${id}/reply`
  },
  
  // メッセージ関連
  MESSAGE: {
    CONVERSATIONS: '/messages/conversations',
    CONVERSATION_DETAIL: (id: string) => `/messages/conversations/${id}`,
    SEND: '/messages/send',
    MARK_READ: '/messages/mark-read'
  },
  
  // 支払い関連
  PAYMENT: {
    METHODS: '/payments/methods',
    ADD_METHOD: '/payments/methods',
    REMOVE_METHOD: (id: string) => `/payments/methods/${id}`,
    PROCESS: '/payments/process',
    VERIFY: '/payments/verify',
    TRANSACTION: (id: string) => `/payments/transactions/${id}`
  },
  
  // ファイルアップロード
  UPLOAD: {
    IMAGE: '/uploads/image',
    DOCUMENT: '/uploads/document',
    PROFILE_PHOTO: '/uploads/profile-photo',
    EXPERIENCE_PHOTO: '/uploads/experience-photo'
  }
};

/**
 * API URLを生成する
 * 
 * @param endpoint エンドポイントパス
 * @returns 完全なURL
 */
export const apiUrl = (endpoint: string): string => {
  return `${API_BASE_URL}${endpoint}`;
};

export default {
  BASE_URL: API_BASE_URL,
  DEFAULT_TIMEOUT,
  DEFAULT_HEADERS,
  ENDPOINTS,
  apiUrl
};
