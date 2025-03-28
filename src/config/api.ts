/**
 * APIエンドポイント定義
 */

// API基本URL
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://api.echo-app.example';

// APIエンドポイント
export const ENDPOINTS = {
  // アテンダー関連
  ATTENDER: {
    LIST: `${API_BASE_URL}/attenders`,
    DETAIL: (id: string) => `${API_BASE_URL}/attenders/${id}`,
    EXPERIENCES: (id: string) => `${API_BASE_URL}/attenders/${id}/experiences`,
    CREATE: `${API_BASE_URL}/attenders`,
    UPDATE: (id: string) => `${API_BASE_URL}/attenders/${id}`
  },
  
  // 体験関連
  EXPERIENCE: {
    LIST: `${API_BASE_URL}/experiences`,
    DETAIL: (id: string) => `${API_BASE_URL}/experiences/${id}`,
    CREATE: `${API_BASE_URL}/experiences`,
    UPDATE: (id: string) => `${API_BASE_URL}/experiences/${id}`,
    DELETE: (id: string) => `${API_BASE_URL}/experiences/${id}`,
    SEARCH: `${API_BASE_URL}/experiences/search`,
    BOOKINGS: (id: string) => `${API_BASE_URL}/experiences/${id}/bookings`,
    RATINGS: (id: string) => `${API_BASE_URL}/experiences/${id}/ratings`
  },
  
  // レビュー関連
  REVIEW: {
    LIST: `${API_BASE_URL}/reviews`,
    DETAIL: (id: string) => `${API_BASE_URL}/reviews/${id}`,
    CREATE: `${API_BASE_URL}/reviews`,
    EXPERIENCE_REVIEWS: (experienceId: string) => `${API_BASE_URL}/experiences/${experienceId}/reviews`,
    ATTENDER_REVIEWS: (attenderId: string) => `${API_BASE_URL}/attenders/${attenderId}/reviews`,
    USER_REVIEWS: `${API_BASE_URL}/users/me/reviews`,
    REPLY: (id: string) => `${API_BASE_URL}/reviews/${id}/replies`,
    UPDATE: (id: string) => `${API_BASE_URL}/reviews/${id}`,
    DELETE: (id: string) => `${API_BASE_URL}/reviews/${id}`,
    HELPFUL: (id: string) => `${API_BASE_URL}/reviews/${id}/helpful`
  },
  
  // 予約関連
  BOOKING: {
    CREATE: `${API_BASE_URL}/bookings`,
    DETAIL: (id: string) => `${API_BASE_URL}/bookings/${id}`,
    USER_BOOKINGS: `${API_BASE_URL}/users/me/bookings`,
    ATTENDER_BOOKINGS: `${API_BASE_URL}/attenders/me/bookings`,
    UPDATE_STATUS: (id: string) => `${API_BASE_URL}/bookings/${id}/status`,
    CANCEL: (id: string) => `${API_BASE_URL}/bookings/${id}/cancel`,
    LIST: `${API_BASE_URL}/bookings`
  },
  
  // アップロード関連
  UPLOAD: {
    IMAGE: `${API_BASE_URL}/uploads/image`,
    DOCUMENT: `${API_BASE_URL}/uploads/document`,
    PROFILE_PHOTO: `${API_BASE_URL}/uploads/profile-photo`,
    EXPERIENCE_PHOTO: `${API_BASE_URL}/uploads/experience-photo`
  },
  
  // ユーザー関連
  USER: {
    PROFILE: `${API_BASE_URL}/users/me`,
    UPDATE: `${API_BASE_URL}/users/me`
  }
};

export default {
  API_BASE_URL,
  ENDPOINTS
};
