/**
 * axiosのモック実装
 */

export interface AxiosResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  config: any;
}

export interface AxiosError<T = any> extends Error {
  config: any;
  code?: string;
  request?: any;
  response?: AxiosResponse<T>;
  isAxiosError: boolean;
}

export interface AxiosRequestConfig {
  url?: string;
  method?: string;
  baseURL?: string;
  headers?: Record<string, string>;
  params?: any;
  data?: any;
  timeout?: number;
  withCredentials?: boolean;
  responseType?: string;
  [key: string]: any;
}

export interface AxiosInstance {
  (config: AxiosRequestConfig): Promise<AxiosResponse>;
  (url: string, config?: AxiosRequestConfig): Promise<AxiosResponse>;
  defaults: AxiosRequestConfig;
  get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
  post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
  put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
  delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
  patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
}

interface AxiosStatic extends AxiosInstance {
  create(config?: AxiosRequestConfig): AxiosInstance;
  CancelToken: any;
  isCancel: (value: any) => boolean;
  all<T>(values: (T | Promise<T>)[]): Promise<T[]>;
  spread<T, R>(callback: (...args: T[]) => R): (array: T[]) => R;
}

// モックユーザープロフィール
// isAttenderフラグを同期するためのモックデータ
const mockUserProfile = {
  id: '1',
  displayName: 'テストユーザー',
  email: 'test@example.com',
  phoneNumber: '090-1234-5678',
  bio: 'よろしくお願いします。',
  location: '東京都',
  interests: ['アート・クラフト', '料理・グルメ', '音楽・ライブ'],
  profileImage: 'https://via.placeholder.com/150',
  isAttender: false,
  createdAt: '2023-01-01T00:00:00Z'
};

// モックアテンダープロフィール
const mockAttenderProfile = {
  id: '1',
  name: 'テストユーザー',
  bio: 'よろしくお願いします。アテンダーとして多様な体験を提供します。',
  location: '東京都',
  specialties: ['アート・クラフト', '料理・グルメ', '音楽・ライブ'],
  imageUrl: 'https://via.placeholder.com/150',
  profilePhoto: 'https://via.placeholder.com/150',
  experienceSamples: [],
  languages: [
    { language: '日本語', proficiency: 'native' },
    { language: '英語', proficiency: 'intermediate' }
  ],
  isLocalResident: true,
  isMigrant: false,
  expertise: [],
  availableTimes: [],
  rating: 0,
  reviewCount: 0,
  createdAt: '2023-01-01T00:00:00Z',
  updatedAt: '2023-01-01T00:00:00Z',
  completionScore: 40,
  verified: false
};

// localStorageからユーザープロフィールを取得するヘルパー関数
const getUserProfileFromStorage = () => {
  try {
    const storedUser = localStorage.getItem('echo_user');
    if (storedUser) {
      return JSON.parse(storedUser);
    }
  } catch (e) {
    console.error('Failed to parse stored user data:', e);
  }
  return mockUserProfile;
};

// requestメソッドのインターフェース実装
const request = (config: AxiosRequestConfig): Promise<AxiosResponse> => {
  return Promise.resolve({ data: {}, status: 200, statusText: 'OK', headers: {}, config });
};

// モックインスタンスの作成
const axiosMock: AxiosInstance = request as AxiosInstance;

// インスタンスメソッドの追加
axiosMock.defaults = {};

// GET リクエストのモック
axiosMock.get = ((url: string, config?: AxiosRequestConfig) => {
  console.log('[MOCK] GET request:', url);
  
  if (url.includes('/users/profile') || url.includes('/users/me')) {
    // ユーザープロフィールを取得
    const userData = getUserProfileFromStorage();
    console.log('[MOCK] Returning user profile:', userData);
    
    return Promise.resolve({ 
      data: userData, 
      status: 200, 
      statusText: 'OK', 
      headers: {}, 
      config: config || {} 
    });
  }
  
  // アテンダープロフィールのエンドポイント対応
  if (url.includes('/attenders/')) {
    // ユーザーがアテンダーか確認
    const userData = getUserProfileFromStorage();
    
    if (userData.isAttender) {
      // アテンダーの場合はモックアテンダープロフィールを返す
      console.log('[MOCK] Returning attender profile for user:', userData.id);
      return Promise.resolve({ 
        data: { ...mockAttenderProfile, id: userData.id, name: userData.displayName }, 
        status: 200, 
        statusText: 'OK', 
        headers: {}, 
        config: config || {} 
      });
    } else {
      // アテンダーでない場合は404エラー
      console.log('[MOCK] User is not an attender, returning 404');
      return Promise.reject({
        response: {
          data: { error: 'Attender profile not found' },
          status: 404,
          statusText: 'Not Found',
          headers: {},
          config: config || {}
        }
      });
    }
  }

  // その他のエンドポイントは空のレスポンスを返す
  return Promise.resolve({ data: {}, status: 200, statusText: 'OK', headers: {}, config: config || {} });
}) as any;

// PUT リクエストのモック
axiosMock.put = ((url: string, data?: any, config?: AxiosRequestConfig) => {
  console.log('[MOCK] PUT request:', url, data);
  
  if ((url.includes('/users/profile') || url.includes('/users/me')) && data) {
    // 保存されているユーザープロフィールを取得
    const currentProfile = getUserProfileFromStorage();
    
    // ユーザープロフィールを更新
    const updatedProfile = { ...currentProfile, ...data };
    
    // ローカルストレージに保存
    try {
      localStorage.setItem('echo_user', JSON.stringify(updatedProfile));
      // 認証状態も更新
      if (data.isAttender !== undefined) {
        try {
          const storedCurrentUser = localStorage.getItem('echo_currentUser');
          if (storedCurrentUser) {
            const currentUserData = JSON.parse(storedCurrentUser);
            currentUserData.isAttender = data.isAttender;
            localStorage.setItem('echo_currentUser', JSON.stringify(currentUserData));
            console.log('[MOCK] Updated auth state isAttender:', data.isAttender);
          }
        } catch (e) {
          console.error('[MOCK] Failed to update auth state:', e);
        }
      }
      
      console.log('[MOCK] Updated user profile:', updatedProfile);
    } catch (e) {
      console.error('[MOCK] Failed to save user profile to localStorage:', e);
    }
    
    return Promise.resolve({ 
      data: updatedProfile, 
      status: 200, 
      statusText: 'OK', 
      headers: {}, 
      config: config || {} 
    });
  }
  
  // アテンダープロフィールの更新処理
  if (url.includes('/attenders/') && data) {
    // ユーザーがアテンダーか確認
    const userData = getUserProfileFromStorage();
    
    if (userData.isAttender) {
      console.log('[MOCK] Updating attender profile:', data);
      // アテンダープロフィールを更新して返す
      return Promise.resolve({ 
        data: { ...mockAttenderProfile, ...data, id: userData.id }, 
        status: 200, 
        statusText: 'OK', 
        headers: {}, 
        config: config || {} 
      });
    } else {
      // アテンダーでない場合は403エラー
      console.log('[MOCK] User is not an attender, returning 403');
      return Promise.reject({
        response: {
          data: { error: 'User is not an attender' },
          status: 403,
          statusText: 'Forbidden',
          headers: {},
          config: config || {}
        }
      });
    }
  }
  
  return Promise.resolve({ data: data || {}, status: 200, statusText: 'OK', headers: {}, config: config || {} });
}) as any;

// POST リクエストのモック
axiosMock.post = ((url: string, data?: any, config?: AxiosRequestConfig) => 
  Promise.resolve({ data: data || {}, status: 200, statusText: 'OK', headers: {}, config: config || {} })) as any;
  
// DELETE リクエストのモック
axiosMock.delete = ((url: string, config?: AxiosRequestConfig) => 
  Promise.resolve({ data: {}, status: 200, statusText: 'OK', headers: {}, config: config || {} })) as any;
  
// PATCH リクエストのモック
axiosMock.patch = ((url: string, data?: any, config?: AxiosRequestConfig) => 
  Promise.resolve({ data: data || {}, status: 200, statusText: 'OK', headers: {}, config: config || {} })) as any;

// 静的メソッドの追加
const axiosStaticMock = axiosMock as unknown as AxiosStatic;
axiosStaticMock.create = (config?: AxiosRequestConfig) => axiosMock;
axiosStaticMock.CancelToken = { source: () => ({ token: {}, cancel: () => {} }) };
axiosStaticMock.isCancel = (value: any) => false;
axiosStaticMock.all = <T>(values: (T | Promise<T>)[]) => Promise.all(values);
axiosStaticMock.spread = <T, R>(callback: (...args: T[]) => R) => (array: T[]) => callback(...array);

export default axiosStaticMock;
