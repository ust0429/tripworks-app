/**
 * Cloud Run API設定
 * 
 * GCP Cloud Run上で動作するバックエンドAPIへの接続設定
 */

// 環境ごとのAPIエンドポイント
const ENDPOINTS = {
  // ローカル開発環境（Cloud Runエミュレータ）
  local: 'http://localhost:8080',
  
  // ステージング環境
  staging: 'https://echo-backend-api-xxxxxxxx-an.a.run.app',
  
  // 本番環境
  production: 'https://echo-backend-api-yyyyyyyy-an.a.run.app',
};

// 現在のAPIエンドポイントを環境に基づいて取得
// 注: この値はenvファイルから取得するか、process.env.REACT_APP_BACKEND_ENV等から取得するようにして、
// デプロイ環境ごとに自動的に切り替わるようにするのが望ましい
const CURRENT_ENV = process.env.REACT_APP_BACKEND_ENV || 'local';

// API URLを構築
export const API_URL = ENDPOINTS[CURRENT_ENV as keyof typeof ENDPOINTS];

// デフォルトのHTTPリクエストタイムアウト（ミリ秒）
export const DEFAULT_TIMEOUT = 30000;

// デフォルトのAPIヘッダー
export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
};

// APIエンドポイント一覧
export const API_ENDPOINTS = {
  // ヘルスチェック
  HEALTH: '/health',
  
  // アテンダー関連エンドポイント
  ATTENDERS: {
    LIST: '/api/attenders',
    GET: (id: string) => `/api/attenders/${id}`,
    CREATE: '/api/attenders',
    UPDATE: (id: string) => `/api/attenders/${id}`,
    DELETE: (id: string) => `/api/attenders/${id}`,
    SEARCH: '/api/attenders/search',
  },
  
  // 体験関連エンドポイント
  EXPERIENCES: {
    LIST: '/api/experiences',
    GET: (id: string) => `/api/experiences/${id}`,
    CREATE: '/api/experiences',
    UPDATE: (id: string) => `/api/experiences/${id}`,
    DELETE: (id: string) => `/api/experiences/${id}`,
    SEARCH: '/api/experiences/search',
    BY_ATTENDER: (attenderId: string) => `/api/attenders/${attenderId}/experiences`,
  },
  
  // レビュー関連エンドポイント
  REVIEWS: {
    LIST: '/api/reviews',
    GET: (id: string) => `/api/reviews/${id}`,
    CREATE: '/api/reviews',
    UPDATE: (id: string) => `/api/reviews/${id}`,
    DELETE: (id: string) => `/api/reviews/${id}`,
    BY_EXPERIENCE: (experienceId: string) => `/api/experiences/${experienceId}/reviews`,
    BY_ATTENDER: (attenderId: string) => `/api/attenders/${attenderId}/reviews`,
    REPLY: (reviewId: string) => `/api/reviews/${reviewId}/reply`,
  },
  
  // 予約関連エンドポイント
  BOOKINGS: {
    LIST: '/api/bookings',
    GET: (id: string) => `/api/bookings/${id}`,
    CREATE: '/api/bookings',
    UPDATE: (id: string) => `/api/bookings/${id}`,
    DELETE: (id: string) => `/api/bookings/${id}`,
    BY_USER: '/api/bookings/user',
    BY_ATTENDER: '/api/bookings/attender',
  },
  
  // ユーザー関連エンドポイント
  USERS: {
    PROFILE: '/api/users/profile',
    UPDATE_PROFILE: '/api/users/profile',
  },
  
  // アップロード関連エンドポイント
  UPLOADS: {
    IMAGE: '/api/uploads/image',
    DOCUMENT: '/api/uploads/document',
  },
};

export default {
  API_URL,
  DEFAULT_TIMEOUT,
  DEFAULT_HEADERS,
  API_ENDPOINTS,
};