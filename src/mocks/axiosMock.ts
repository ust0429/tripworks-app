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

// requestメソッドのインターフェース実装
const request = (config: AxiosRequestConfig): Promise<AxiosResponse> => {
  return Promise.resolve({ data: {}, status: 200, statusText: 'OK', headers: {}, config });
};

// モックインスタンスの作成
const axiosMock: AxiosInstance = request as AxiosInstance;

// インスタンスメソッドの追加
axiosMock.defaults = {};

// 型キャストを追加
axiosMock.get = ((url: string, config?: AxiosRequestConfig) => 
  Promise.resolve({ data: {}, status: 200, statusText: 'OK', headers: {}, config: config || {} })) as any;

axiosMock.post = ((url: string, data?: any, config?: AxiosRequestConfig) => 
  Promise.resolve({ data: {}, status: 200, statusText: 'OK', headers: {}, config: config || {} })) as any;

axiosMock.put = ((url: string, data?: any, config?: AxiosRequestConfig) => 
  Promise.resolve({ data: {}, status: 200, statusText: 'OK', headers: {}, config: config || {} })) as any;
  
axiosMock.delete = ((url: string, config?: AxiosRequestConfig) => 
  Promise.resolve({ data: {}, status: 200, statusText: 'OK', headers: {}, config: config || {} })) as any;
  
axiosMock.patch = ((url: string, data?: any, config?: AxiosRequestConfig) => 
  Promise.resolve({ data: {}, status: 200, statusText: 'OK', headers: {}, config: config || {} })) as any;

// 静的メソッドの追加
const axiosStaticMock = axiosMock as unknown as AxiosStatic;
axiosStaticMock.create = (config?: AxiosRequestConfig) => axiosMock;
axiosStaticMock.CancelToken = { source: () => ({ token: {}, cancel: () => {} }) };
axiosStaticMock.isCancel = (value: any) => false;
axiosStaticMock.all = <T>(values: (T | Promise<T>)[]) => Promise.all(values);
axiosStaticMock.spread = <T, R>(callback: (...args: T[]) => R) => (array: T[]) => callback(...array);

export default axiosStaticMock;
