/**
 * APIレスポンスの型定義
 */

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  status: number;
  headers: Headers;
}

/**
 * アップロード関連のAPIエンドポイント
 */
export interface UploadEndpoints {
  PROFILE_PHOTO: string;
  EXPERIENCE_PHOTO: string;
  REVIEW_PHOTO: string;
  DOCUMENT: string;
}

/**
 * APIエンドポイント定義
 */
export interface ApiEndpoints {
  ATTENDER: {
    LIST: string;
    DETAIL: (id: string) => string;
    CREATE: string;
    UPDATE: (id: string) => string;
    DELETE: (id: string) => string;
    APPLICATION: {
      CREATE: string;
      UPDATE: (id: string) => string;
      SUBMIT: (id: string) => string;
      STATUS: (id: string) => string;
    };
    EXPERIENCES: (id: string) => string;
  };
  REVIEW: {
    LIST: string;
    DETAIL: (id: string) => string;
    CREATE: string;
    UPDATE: (id: string) => string;
    DELETE: (id: string) => string;
  };
  BOOKING: {
    LIST: string;
    DETAIL: (id: string) => string;
    CREATE: string;
    UPDATE: (id: string) => string;
    CANCEL: (id: string) => string;
  };
  UPLOAD: UploadEndpoints;
}
