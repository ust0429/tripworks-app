/**
 * APIキャッシュ
 * 
 * APIレスポンスのキャッシュとオフライン対応を提供します。
 * IndexedDBを使用してキャッシュを保存し、オフライン時にキャッシュからデータを取得します。
 */

import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { enableOfflineSupport } from './environmentManager';
import { logApiRequest, logApiResponse, ApiResponse } from './apiClientEnhanced';

// キャッシュの有効期限（デフォルト: 1時間）
const DEFAULT_CACHE_EXPIRY = 60 * 60 * 1000; // ミリ秒

// データベース名
const DB_NAME = 'echo_api_cache';
const DB_VERSION = 1;

// データベースのスキーマ定義
interface ApiCacheDB extends DBSchema {
  cache: {
    key: string;
    value: {
      data: any;
      timestamp: number;
      expiry: number;
      url: string;
      method: string;
    };
    indexes: { 'by-timestamp': number };
  };
  requests: {
    key: string;
    value: {
      url: string;
      method: string;
      body?: any;
      headers?: HeadersInit;
      timestamp: number;
    };
  };
}

// データベースへの参照
let db: IDBPDatabase<ApiCacheDB> | null = null;

/**
 * データベースを初期化する
 */
export const initCache = async (): Promise<void> => {
  if (!enableOfflineSupport()) {
    return;
  }
  
  try {
    db = await openDB<ApiCacheDB>(DB_NAME, DB_VERSION, {
      upgrade(database) {
        // キャッシュストア
        const cacheStore = database.createObjectStore('cache', { keyPath: 'key' });
        cacheStore.createIndex('by-timestamp', 'timestamp');
        
        // 未処理リクエストストア
        database.createObjectStore('requests', { keyPath: 'key' });
      }
    });
    
    console.log('APIキャッシュデータベースが初期化されました');
  } catch (error) {
    console.error('APIキャッシュデータベースの初期化に失敗しました:', error);
    db = null;
  }
};

/**
 * キャッシュキーを生成する
 */
export const generateCacheKey = (url: string, params?: Record<string, any>): string => {
  const paramString = params ? JSON.stringify(params) : '';
  return `${url}|${paramString}`;
};

/**
 * レスポンスをキャッシュに保存する
 */
export const cacheResponse = async <T>(
  url: string,
  method: string,
  response: ApiResponse<T>,
  params?: Record<string, any>,
  expiry: number = DEFAULT_CACHE_EXPIRY
): Promise<void> => {
  if (!db || !enableOfflineSupport() || !response.success) {
    return;
  }
  
  try {
    const key = generateCacheKey(url, params);
    const now = Date.now();
    
    await db.put('cache', {
      key,
      url,
      method,
      data: response.data,
      timestamp: now,
      expiry: now + expiry
    });
    
    logApiRequest('CACHE', `キャッシュに保存: ${url}`, { expiry });
  } catch (error) {
    console.error('レスポンスのキャッシュに失敗しました:', error);
  }
};

/**
 * キャッシュからレスポンスを取得する
 */
export const getCachedResponse = async <T>(
  url: string,
  params?: Record<string, any>
): Promise<ApiResponse<T> | null> => {
  if (!db || !enableOfflineSupport()) {
    return null;
  }
  
  try {
    const key = generateCacheKey(url, params);
    const cached = await db.get('cache', key);
    
    if (!cached) {
      return null;
    }
    
    // キャッシュの有効期限をチェック
    if (cached.expiry < Date.now()) {
      // 期限切れのキャッシュを削除
      await db.delete('cache', key);
      return null;
    }
    
    const response: ApiResponse<T> = {
      success: true,
      data: cached.data,
      status: 200,
      headers: new Headers({ 'x-from-cache': 'true' })
    };
    
    logApiResponse('CACHE', `キャッシュから取得: ${url}`, response);
    
    return response;
  } catch (error) {
    console.error('キャッシュからのレスポンス取得に失敗しました:', error);
    return null;
  }
};

/**
 * キャッシュを消去する
 */
export const clearCache = async (pattern?: string): Promise<void> => {
  if (!db) {
    return;
  }
  
  try {
    if (pattern) {
      // 特定のパターンに一致するキャッシュのみを削除
      const tx = db.transaction('cache', 'readwrite');
      const store = tx.objectStore('cache');
      const keys = await store.getAllKeys();
      
      for (const key of keys) {
        if (key.toString().includes(pattern)) {
          await store.delete(key);
        }
      }
      
      await tx.done;
    } else {
      // すべてのキャッシュを削除
      await db.clear('cache');
    }
    
    console.log('キャッシュが消去されました', pattern ? `(パターン: ${pattern})` : '(すべて)');
  } catch (error) {
    console.error('キャッシュの消去に失敗しました:', error);
  }
};

/**
 * オフライン時のリクエストをキューに追加
 */
export const queueRequest = async (
  url: string,
  method: string,
  body?: any,
  headers?: HeadersInit
): Promise<void> => {
  if (!db || !enableOfflineSupport()) {
    return;
  }
  
  try {
    const key = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    await db.put('requests', {
      key,
      url,
      method,
      body,
      headers,
      timestamp: Date.now()
    });
    
    console.log(`オフラインリクエストがキューに追加されました: ${method} ${url}`);
  } catch (error) {
    console.error('リクエストのキューへの追加に失敗しました:', error);
  }
};

/**
 * キュー内のリクエストを処理する
 */
export const processQueue = async (processRequest: Function): Promise<void> => {
  if (!db || !enableOfflineSupport() || !navigator.onLine) {
    return;
  }
  
  try {
    const tx = db.transaction('requests', 'readwrite');
    const store = tx.objectStore('requests');
    const requests = await store.getAll();
    
    if (requests.length === 0) {
      return;
    }
    
    console.log(`キュー内の ${requests.length} 件のリクエストを処理します...`);
    
    for (const request of requests) {
      try {
        await processRequest(request.url, request.method, request.body, request.headers);
        await store.delete(request.key);
        console.log(`キューからリクエストを削除しました: ${request.method} ${request.url}`);
      } catch (error) {
        console.error(`キュー内リクエストの処理に失敗しました: ${request.method} ${request.url}`, error);
      }
    }
    
    await tx.done;
  } catch (error) {
    console.error('キュー処理に失敗しました:', error);
  }
};

/**
 * オフラインイベントリスナーを設定
 */
export const setupOfflineListeners = (processRequest: Function): void => {
  if (typeof window === 'undefined' || !enableOfflineSupport()) {
    return;
  }
  
  // オンラインに戻ったときにキュー内のリクエストを処理
  window.addEventListener('online', () => {
    console.log('オンラインに戻りました。キュー内のリクエストを処理します...');
    processQueue(processRequest);
  });
  
  // オフラインになったときに通知
  window.addEventListener('offline', () => {
    console.log('オフラインになりました。リクエストはキューに追加されます。');
  });
};

/**
 * ネットワーク状態をチェック
 */
export const isOnline = (): boolean => {
  return typeof navigator !== 'undefined' ? navigator.onLine : true;
};

/**
 * 古いキャッシュエントリを削除
 */
export const cleanupCache = async (maxAge: number = 7 * 24 * 60 * 60 * 1000): Promise<void> => {
  if (!db) {
    return;
  }
  
  try {
    const tx = db.transaction('cache', 'readwrite');
    const store = tx.objectStore('cache');
    const index = store.index('by-timestamp');
    const cutoff = Date.now() - maxAge;
    
    let cursor = await index.openCursor();
    let deleted = 0;
    
    while (cursor) {
      if (cursor.value.timestamp < cutoff) {
        await cursor.delete();
        deleted++;
      }
      cursor = await cursor.continue();
    }
    
    await tx.done;
    
    if (deleted > 0) {
      console.log(`${deleted} 件の古いキャッシュエントリを削除しました`);
    }
  } catch (error) {
    console.error('キャッシュのクリーンアップに失敗しました:', error);
  }
};

// APIキャッシュを初期化
initCache();

// オブジェクトをエクスポート
export default {
  initCache,
  cacheResponse,
  getCachedResponse,
  clearCache,
  queueRequest,
  processQueue,
  setupOfflineListeners,
  isOnline,
  cleanupCache
};
