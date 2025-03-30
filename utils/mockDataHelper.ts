/**
 * モックデータヘルパー
 * 
 * モックデータの生成、操作、フィルタリングを支援するユーティリティ
 */

/**
 * モックデータストア
 * 各データタイプごとにモックデータを保持
 */
export interface MockDataStore {
  attenders: Record<string, any>;
  experiences: Record<string, any>;
  bookings: Record<string, any>;
  reviews: Record<string, any>;
  users: Record<string, any>;
  conversations: Record<string, any>;
  messages: Record<string, any>;
  [key: string]: Record<string, any>; // その他のデータタイプにも対応
}

// グローバルモックデータストア
let mockDataStore: MockDataStore = {
  attenders: {},
  experiences: {},
  bookings: {},
  reviews: {},
  users: {},
  conversations: {},
  messages: {},
};

/**
 * 初期モックデータの登録
 * 
 * @param dataStore モックデータストア
 */
export function registerMockData(dataStore: Partial<MockDataStore>): void {
  mockDataStore = {
    ...mockDataStore,
    ...dataStore
  };
  
  console.log('モックデータを登録しました:', Object.keys(dataStore));
}

/**
 * モックデータの取得
 * 
 * @param type データタイプ
 * @param id エンティティID（指定しない場合は全件取得）
 * @returns モックデータ
 */
export function getMockData<T = any>(type: keyof MockDataStore, id?: string): T | T[] | null {
  const store = mockDataStore[type];
  
  if (!store) {
    console.warn(`不明なデータタイプです: ${type}`);
    return null;
  }
  
  if (id) {
    return store[id] || null;
  }
  
  return Object.values(store);
}

/**
 * モックデータの登録/更新
 * 
 * @param type データタイプ
 * @param id エンティティID
 * @param data 登録/更新するデータ
 */
export function setMockData<T = any>(type: keyof MockDataStore, id: string, data: T): void {
  if (!mockDataStore[type]) {
    mockDataStore[type] = {};
  }
  
  mockDataStore[type][id] = {
    id,
    ...data
  };
}

/**
 * モックデータの削除
 * 
 * @param type データタイプ
 * @param id エンティティID
 * @returns 削除に成功した場合はtrue
 */
export function deleteMockData(type: keyof MockDataStore, id: string): boolean {
  const store = mockDataStore[type];
  
  if (!store || !store[id]) {
    return false;
  }
  
  delete store[id];
  return true;
}

/**
 * モックデータのフィルタリング
 * 
 * @param type データタイプ
 * @param filterFn フィルタリング関数
 * @returns フィルタリングされたデータ配列
 */
export function filterMockData<T = any>(
  type: keyof MockDataStore,
  filterFn: (item: T) => boolean
): T[] {
  const store = mockDataStore[type];
  
  if (!store) {
    return [];
  }
  
  return Object.values(store).filter(filterFn);
}

/**
 * ID生成関数（プレフィックス + ランダム文字列）
 * 
 * @param prefix ID接頭辞
 * @param length ランダム部分の長さ
 * @returns 生成されたID
 */
export function generateMockId(prefix: string, length: number = 8): string {
  const randomPart = Math.random().toString(36).substring(2, 2 + length);
  return `${prefix}_${randomPart}`;
}

/**
 * 名前からサンプル写真URLを生成
 * 
 * @param name 名前
 * @param gender 性別（'male'/'female'/'other'）
 * @returns アバター画像URL
 */
export function getAvatarUrl(name: string, gender: 'male' | 'female' | 'other' = 'other'): string {
  // 名前とジェンダーからシード値を生成
  const seed = name.toLowerCase().replace(/\s+/g, '') + gender.charAt(0);
  
  // 一貫性のあるアバター生成のために文字列からハッシュ値を計算
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(i);
    hash |= 0; // 32ビット整数に変換
  }
  
  // ハッシュ値を正の数に変換
  const positiveHash = Math.abs(hash);
  
  // ランダムなアバター画像サービスのURLを生成
  return `https://randomuser.me/api/portraits/${gender === 'female' ? 'women' : (gender === 'male' ? 'men' : 'lego')}/${positiveHash % 100}.jpg`;
}

/**
 * モックのレスポンス遅延を模倣
 * 
 * @param minDelay 最小遅延（ミリ秒）
 * @param maxDelay 最大遅延（ミリ秒）
 * @returns Promiseオブジェクト
 */
export function mockDelay(minDelay: number = 200, maxDelay: number = 800): Promise<void> {
  const delay = Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay;
  return new Promise(resolve => setTimeout(resolve, delay));
}

/**
 * ページネーション付きの結果を返す
 * 
 * @param items 全アイテム配列
 * @param page ページ番号（1ベース）
 * @param pageSize ページサイズ
 * @returns ページネーション結果
 */
export function paginateResults<T>(items: T[], page: number = 1, pageSize: number = 10): {
  items: T[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  hasMore: boolean;
} {
  const totalItems = items.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const currentPage = Math.max(1, Math.min(page, totalPages));
  
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  
  return {
    items: items.slice(startIndex, endIndex),
    totalItems,
    totalPages,
    currentPage,
    hasMore: currentPage < totalPages
  };
}

/**
 * モックエラーを一定確率で発生させる
 * 
 * @param errorRate エラー発生確率（0-1の値、デフォルトは0.05）
 * @param errorMessage エラーメッセージ
 * @throws Error ランダムに発生するエラー
 */
export function randomMockError(errorRate: number = 0.05, errorMessage: string = 'モックサーバーでエラーが発生しました'): void {
  if (Math.random() < errorRate) {
    throw new Error(errorMessage);
  }
}

/**
 * モックAPIレスポンスを生成
 * 
 * @param data レスポンスデータ
 * @param options オプション
 * @returns モックAPIレスポンス
 */
export function createMockResponse<T>(
  data: T,
  options: {
    status?: number;
    errorRate?: number;
    delay?: boolean;
    minDelay?: number;
    maxDelay?: number;
  } = {}
): Promise<{
  success: boolean;
  data?: T;
  error?: { code: string; message: string };
  status: number;
}> {
  const {
    status = 200,
    errorRate = 0,
    delay = true,
    minDelay = 200,
    maxDelay = 800
  } = options;
  
  return new Promise(async (resolve, reject) => {
    // ランダムな遅延を追加
    if (delay) {
      await mockDelay(minDelay, maxDelay);
    }
    
    try {
      // ランダムエラーの可能性
      randomMockError(errorRate);
      
      // 成功レスポンス
      resolve({
        success: true,
        data,
        status
      });
    } catch (error) {
      // エラーレスポンス
      resolve({
        success: false,
        error: {
          code: 'MOCK_ERROR',
          message: error instanceof Error ? error.message : '不明なエラー'
        },
        status: 500
      });
    }
  });
}

/**
 * モックデータを指定された条件でフィルタリング
 * 
 * @param items アイテム配列
 * @param filters フィルター条件
 * @returns フィルタリングされたアイテム配列
 */
export function filterByConditions<T extends Record<string, any>>(
  items: T[],
  filters: Record<string, any>
): T[] {
  return items.filter(item => {
    return Object.entries(filters).every(([key, value]) => {
      // 値がnullまたはundefinedの場合はフィルターしない
      if (value === null || value === undefined) {
        return true;
      }
      
      // itemのプロパティがない場合
      if (!(key in item)) {
        return false;
      }
      
      // 配列の場合は一致するものが1つでもあればOK
      if (Array.isArray(value)) {
        return value.includes(item[key]);
      }
      
      // 文字列の場合は部分一致
      if (typeof item[key] === 'string' && typeof value === 'string') {
        return item[key].toLowerCase().includes(value.toLowerCase());
      }
      
      // その他は完全一致
      return item[key] === value;
    });
  });
}

/**
 * 現在日時のISO文字列を取得
 * 
 * @returns ISO形式の日時文字列
 */
export function getCurrentISOString(): string {
  return new Date().toISOString();
}

export default {
  registerMockData,
  getMockData,
  setMockData,
  deleteMockData,
  filterMockData,
  generateMockId,
  getAvatarUrl,
  mockDelay,
  paginateResults,
  randomMockError,
  createMockResponse,
  filterByConditions,
  getCurrentISOString
};
