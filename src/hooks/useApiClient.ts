/**
 * APIクライアントのモックフック
 * 実際のプロジェクトではaxiosなどを使用したAPIクライアントを実装してください
 */

interface ApiResponse<T> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
}

interface ApiClient {
  get: <T = any>(url: string, config?: any) => Promise<ApiResponse<T>>;
  post: <T = any>(url: string, data?: any, config?: any) => Promise<ApiResponse<T>>;
  put: <T = any>(url: string, data?: any, config?: any) => Promise<ApiResponse<T>>;
  delete: <T = any>(url: string, config?: any) => Promise<ApiResponse<T>>;
}

/**
 * モックのAPIクライアントを提供するフック
 */
export const useApiClient = (): ApiClient => {
  const defaultHeaders = {
    'Content-Type': 'application/json'
  };
  
  // GETリクエスト
  const get = async <T = any>(url: string, config?: any): Promise<ApiResponse<T>> => {
    console.log(`[API Mock] GET ${url}`, config);
    
    // モックデータを返す（実際はAPIからのレスポンス）
    const mockData: any = {
      // プロフィール取得のモックレスポンス
      '/attender/profile': {
        id: 'mock-attender-id',
        userId: 'mock-user-id',
        displayName: 'モックアテンダー',
        bio: 'モック用のテストプロフィールです。',
        location: '東京',
        languages: ['日本語', '英語'],
        expertise: ['アート', '文化体験', '食べ歩き'],
        experiences: [
          {
            id: 'exp-1',
            title: '下町散策ツアー',
            description: '東京の下町を巡るツアーです。',
            imageUrl: 'https://via.placeholder.com/300',
            duration: 120,
            price: 5000
          }
        ],
        availability: {
          mon: { available: true, timeRange: [9, 17] },
          tue: { available: true, timeRange: [9, 17] },
          wed: { available: true, timeRange: [9, 17] },
          thu: { available: true, timeRange: [9, 17] },
          fri: { available: true, timeRange: [9, 17] },
          sat: { available: false, timeRange: [10, 15] },
          sun: { available: false, timeRange: [10, 15] }
        },
        profileImage: 'https://via.placeholder.com/150',
        rating: 4.8,
        reviewCount: 12,
        verified: true,
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-03-15')
      }
    };
    
    // URLに対応するモックデータがあれば返す
    if (mockData[url]) {
      return {
        data: mockData[url] as T,
        status: 200,
        statusText: 'OK',
        headers: defaultHeaders
      };
    }
    
    // モックデータがない場合は404エラー
    throw {
      response: {
        data: { message: 'Not found' },
        status: 404,
        statusText: 'Not Found',
        headers: defaultHeaders
      }
    };
  };
  
  // POSTリクエスト
  const post = async <T = any>(url: string, data?: any, config?: any): Promise<ApiResponse<T>> => {
    console.log(`[API Mock] POST ${url}`, data, config);
    
    // 成功レスポンスを返す
    return {
      data: data as T,
      status: 201,
      statusText: 'Created',
      headers: defaultHeaders
    };
  };
  
  // PUTリクエスト
  const put = async <T = any>(url: string, data?: any, config?: any): Promise<ApiResponse<T>> => {
    console.log(`[API Mock] PUT ${url}`, data, config);
    
    // 成功レスポンスを返す
    return {
      data: data as T,
      status: 200,
      statusText: 'OK',
      headers: defaultHeaders
    };
  };
  
  // DELETEリクエスト
  const delete_ = async <T = any>(url: string, config?: any): Promise<ApiResponse<T>> => {
    console.log(`[API Mock] DELETE ${url}`, config);
    
    // 成功レスポンスを返す
    return {
      data: { success: true } as T,
      status: 200,
      statusText: 'OK',
      headers: defaultHeaders
    };
  };
  
  return {
    get,
    post,
    put,
    delete: delete_
  };
};

export default useApiClient;
