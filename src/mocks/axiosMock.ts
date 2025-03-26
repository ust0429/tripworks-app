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

// ユーザープロフィールのモックデータ
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
  if (url.includes('/users/profile')) {
    // ユーザープロフィールを取得
return Promise.resolve({ 
      data: getUserProfileFromStorage(), 
      status: 200, 
      statusText: 'OK', 
      headers: {}, 
      config: config || {} 
    });
  }

  return Promise.resolve({ data: {}, status: 200, statusText: 'OK', headers: {}, config: config || {} });
}) as any;

// PUT リクエストのモック
axiosMock.put = ((url: string, data?: any, config?: AxiosRequestConfig) => {
  if (url.includes('/users/profile') && data) {
    // 保存されているユーザープロフィールを取得
    const currentProfile = getUserProfileFromStorage();
    
    // ユーザープロフィールを更新
    const updatedProfile = { ...currentProfile, ...data };
    
    // ローカルストレージに保存
    try {
      localStorage.setItem('echo_user', JSON.stringify(updatedProfile));
    } catch (e) {
      console.error('Failed to save user profile to localStorage:', e);
    }
    
    return Promise.resolve({ 
      data: updatedProfile, 
      status: 200, 
      statusText: 'OK', 
      headers: {}, 
      config: config || {} 
    });
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
