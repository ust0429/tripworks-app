/**
 * APIキャッシュシステム
 * 
 * IndexedDBを使用してAPIレスポンスをキャッシュし、オフライン対応とパフォーマンス向上を実現します。
 */
import { openDB, IDBPDatabase, DBSchema } from 'idb';
import { isDevelopment, isDebugMode } from '../../config/env';

// キャッシュデータベースの型定義
interface ApiCacheDB extends DBSchema {
  'api-cache': {
    key: string;
    value: {
      url: string;
      method: string;
      params?: Record<string, any>;
      data: any;
      timestamp: number;
      expiresAt: number;
    };
    indexes: { 'by-url': string; 'by-expiry': number };
  };
  'api-queue': {
    key: string;
    value: {
      url: string;
      method: string;
      body?: any;
      headers?: Record<string, string>;
      timestamp: number;
      retryCount: number;
    };
  };
}

// データベース名とバージョン
const DB_NAME = 'echo-api-cache';
const DB_VERSION = 1;

// デフォルトのキャッシュ設定
const DEFAULT_CACHE_CONFIG = {
  // 有効期限（ミリ秒）
  ttl: {
    short: 5 * 60 * 1000, // 5分
    medium: 30 * 60 * 1000, // 30分
    long: 24 * 60 * 60 * 1000, // 24時間
  },
  // 最大キャッシュサイズ（アイテム数）
  maxItems: 500,
  // 最大オフラインキューサイズ
  maxQueueItems: 100,
  // クリーンアップ間隔（ミリ秒）
  cleanupInterval: 15 * 60 * 1000, // 15分
};

// データベース接続
let dbPromise: Promise<IDBPDatabase<ApiCacheDB>> | null = null;

/**
 * データベースへの接続を取得
 */
export async function getDB(): Promise<IDBPDatabase<ApiCacheDB>> {
  if (!dbPromise) {
    dbPromise = openDB<ApiCacheDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // api-cacheストア
        if (!db.objectStoreNames.contains('api-cache')) {
          const apiCacheStore = db.createObjectStore('api-cache', { keyPath: 'url' });
          apiCacheStore.createIndex('by-url', 'url');
          apiCacheStore.createIndex('by-expiry', 'expiresAt');
        }

        // api-queueストア（オフライン時のリクエストキュー）
        if (!db.objectStoreNames.contains('api-queue')) {
          db.createObjectStore('api-queue', { keyPath: 'timestamp' });
        }
      },
    });
  }

  return dbPromise;
}

/**
 * キャッシュキーを生成
 */
export function generateCacheKey(url: string, method: string, params?: Record<string, any>): string {
  const normalizedUrl = url.toLowerCase();
  const normalizedMethod = method.toUpperCase();
  
  if (!params || Object.keys(params).length === 0) {
    return `${normalizedMethod}:${normalizedUrl}`;
  }
  
  // パラメータをアルファベット順にソート
  const sortedParams = Object.keys(params)
    .sort()
    .reduce((result: Record<string, any>, key) => {
      if (params[key] !== undefined && params[key] !== null) {
        result[key] = params[key];
      }
      return result;
    }, {});
  
  return `${normalizedMethod}:${normalizedUrl}:${JSON.stringify(sortedParams)}`;
}

/**
 * レスポンスをキャッシュに保存
 */
export async function cacheResponse(
  url: string,
  method: string,
  params: Record<string, any> | undefined,
  data: any,
  ttl: number = DEFAULT_CACHE_CONFIG.ttl.medium
): Promise<void> {
  try {
    // GETリクエスト以外はキャッシュしない
    if (method.toUpperCase() !== 'GET') {
      return;
    }

    const db = await getDB();
    const cacheKey = generateCacheKey(url, method, params);
    const timestamp = Date.now();
    const expiresAt = timestamp + ttl;

    await db.put('api-cache', {
      url: cacheKey,
      method,
      params,
      data,
      timestamp,
      expiresAt,
    });

    if (isDevelopment() || isDebugMode()) {
      console.log(`✓ キャッシュ保存: ${cacheKey} (有効期限: ${new Date(expiresAt).toLocaleString()})`);
    }

    // 定期的にキャッシュのクリーンアップを実行
    await cleanupCache();
  } catch (error) {
    console.error('キャッシュ保存エラー:', error);
  }
}

/**
 * キャッシュからレスポンスを取得
 */
export async function getCachedResponse(
  url: string,
  method: string,
  params?: Record<string, any>
): Promise<any | null> {
  try {
    // GETリクエスト以外はキャッシュから取得しない
    if (method.toUpperCase() !== 'GET') {
      return null;
    }

    const db = await getDB();
    const cacheKey = generateCacheKey(url, method, params);
    const cacheItem = await db.get('api-cache', cacheKey);

    if (!cacheItem) {
      return null;
    }

    // キャッシュが有効期限切れの場合
    if (cacheItem.expiresAt < Date.now()) {
      if (isDevelopment() || isDebugMode()) {
        console.log(`✗ キャッシュ期限切れ: ${cacheKey}`);
      }
      // 期限切れのキャッシュを削除
      await db.delete('api-cache', cacheKey);
      return null;
    }

    if (isDevelopment() || isDebugMode()) {
      console.log(`✓ キャッシュヒット: ${cacheKey}`);
    }

    return cacheItem.data;
  } catch (error) {
    console.error('キャッシュ取得エラー:', error);
    return null;
  }
}

/**
 * オフラインリクエストをキューに追加
 */
export async function queueOfflineRequest(
  url: string,
  method: string,
  body?: any,
  headers?: Record<string, string>
): Promise<void> {
  try {
    const db = await getDB();
    const timestamp = Date.now();

    await db.add('api-queue', {
      url,
      method,
      body,
      headers,
      timestamp,
      retryCount: 0,
    });

    if (isDevelopment() || isDebugMode()) {
      console.log(`✓ オフラインリクエストをキューに追加: ${method} ${url}`);
    }
  } catch (error) {
    console.error('オフラインリクエストのキュー追加エラー:', error);
  }
}

/**
 * キューに入っているオフラインリクエストを取得
 */
export async function getQueuedRequests(): Promise<any[]> {
  try {
    const db = await getDB();
    return await db.getAll('api-queue');
  } catch (error) {
    console.error('キューされたリクエスト取得エラー:', error);
    return [];
  }
}

/**
 * キューからリクエストを削除
 */
export async function removeQueuedRequest(timestamp: number): Promise<void> {
  try {
    const db = await getDB();
    await db.delete('api-queue', timestamp);
  } catch (error) {
    console.error('キューリクエスト削除エラー:', error);
  }
}

/**
 * 期限切れのキャッシュアイテムをクリーンアップ
 */
export async function cleanupCache(): Promise<void> {
  try {
    const db = await getDB();
    const tx = db.transaction('api-cache', 'readwrite');
    const index = tx.store.index('by-expiry');
    const now = Date.now();

    // 期限切れのアイテムを探して削除
    let cursor = await index.openCursor();
    let deletedCount = 0;

    while (cursor) {
      if (cursor.value.expiresAt < now) {
        await cursor.delete();
        deletedCount++;
      }
      cursor = await cursor.continue();
    }

    await tx.done;

    // キャッシュサイズの確認と制限
    const totalItems = await db.count('api-cache');
    
    if (totalItems > DEFAULT_CACHE_CONFIG.maxItems) {
      // 最も古いアイテムから削除
      const tx = db.transaction('api-cache', 'readwrite');
      let cursor = await tx.store.openCursor();
      let itemsToDelete = totalItems - DEFAULT_CACHE_CONFIG.maxItems;
      
      // タイムスタンプでソートするためにアイテムを取得
      const items: Array<{ key: string; timestamp: number }> = [];
      
      while (cursor) {
        items.push({
          key: cursor.key as string,
          timestamp: cursor.value.timestamp,
        });
        cursor = await cursor.continue();
      }
      
      // タイムスタンプで古い順にソート
      items.sort((a, b) => a.timestamp - b.timestamp);
      
      // 古いアイテムから削除
      for (let i = 0; i < itemsToDelete; i++) {
        if (i < items.length) {
          await tx.store.delete(items[i].key);
          deletedCount++;
        }
      }
      
      await tx.done;
    }

    if (deletedCount > 0 && (isDevelopment() || isDebugMode())) {
      console.log(`✓ キャッシュクリーンアップ完了: ${deletedCount}件のアイテムを削除`);
    }
  } catch (error) {
    console.error('キャッシュクリーンアップエラー:', error);
  }
}

/**
 * 特定のURLパターンに一致するキャッシュを削除
 */
export async function invalidateCache(urlPattern: string | RegExp): Promise<void> {
  try {
    const db = await getDB();
    const tx = db.transaction('api-cache', 'readwrite');
    const store = tx.store;
    
    let cursor = await store.openCursor();
    let deletedCount = 0;
    
    const pattern = typeof urlPattern === 'string' 
      ? new RegExp(urlPattern.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&'))
      : urlPattern;
    
    while (cursor) {
      if (pattern.test(cursor.value.url)) {
        await cursor.delete();
        deletedCount++;
      }
      cursor = await cursor.continue();
    }
    
    await tx.done;
    
    if (deletedCount > 0 && (isDevelopment() || isDebugMode())) {
      console.log(`✓ キャッシュ無効化完了: ${urlPattern} に一致する ${deletedCount}件のアイテムを削除`);
    }
  } catch (error) {
    console.error('キャッシュ無効化エラー:', error);
  }
}

/**
 * キャッシュの詳細情報を取得
 */
export async function getCacheStats(): Promise<{
  totalItems: number;
  totalSize: number;
  oldestItem: Date | null;
  newestItem: Date | null;
  expiringItems: number;
}> {
  try {
    const db = await getDB();
    const items = await db.getAll('api-cache');
    const now = Date.now();
    const next24h = now + 24 * 60 * 60 * 1000;
    
    // キャッシュサイズの概算（JSONの文字列化サイズを使用）
    let totalSize = 0;
    let oldestTimestamp = Number.MAX_SAFE_INTEGER;
    let newestTimestamp = 0;
    let expiringItems = 0;
    
    items.forEach(item => {
      totalSize += JSON.stringify(item).length;
      
      if (item.timestamp < oldestTimestamp) {
        oldestTimestamp = item.timestamp;
      }
      
      if (item.timestamp > newestTimestamp) {
        newestTimestamp = item.timestamp;
      }
      
      if (item.expiresAt > now && item.expiresAt < next24h) {
        expiringItems++;
      }
    });
    
    return {
      totalItems: items.length,
      totalSize,
      oldestItem: items.length > 0 ? new Date(oldestTimestamp) : null,
      newestItem: items.length > 0 ? new Date(newestTimestamp) : null,
      expiringItems,
    };
  } catch (error) {
    console.error('キャッシュ統計取得エラー:', error);
    return {
      totalItems: 0,
      totalSize: 0,
      oldestItem: null,
      newestItem: null,
      expiringItems: 0,
    };
  }
}

// キャッシュのクリーンアップを定期的に実行
setInterval(cleanupCache, DEFAULT_CACHE_CONFIG.cleanupInterval);

export default {
  cacheResponse,
  getCachedResponse,
  queueOfflineRequest,
  getQueuedRequests,
  removeQueuedRequest,
  cleanupCache,
  invalidateCache,
  getCacheStats,
};
