// APIエンドポイント設定

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

export const ENDPOINTS = {
  // アテンダー関連
  ATTENDER: {
    LIST: `${BASE_URL}/attenders`,
    DETAIL: (id: string) => `${BASE_URL}/attenders/${id}`,
    EXPERIENCES: (id: string) => `${BASE_URL}/attenders/${id}/experiences`,
    CREATE_EXPERIENCE: (id: string) => `${BASE_URL}/attenders/${id}/experiences`,
    CHECK_IF_ATTENDER: `${BASE_URL}/users/me/attender`
  },
  
  // 予約関連
  BOOKING: {
    LIST: `${BASE_URL}/bookings`,
    DETAIL: (id: string) => `${BASE_URL}/bookings/${id}`,
    CREATE: `${BASE_URL}/bookings`,
  },
  
  // レビュー関連
  REVIEW: {
    LIST: `${BASE_URL}/reviews`,
    DETAIL: (id: string) => `${BASE_URL}/reviews/${id}`,
    CREATE: `${BASE_URL}/reviews`,
    UPDATE: (id: string) => `${BASE_URL}/reviews/${id}`,
    DELETE: (id: string) => `${BASE_URL}/reviews/${id}`,
  },
  
  // ユーザー関連
  USER: {
    PROFILE: `${BASE_URL}/users/profile`,
    UPDATE_PROFILE: `${BASE_URL}/users/profile`,
  },
};

export default ENDPOINTS;
