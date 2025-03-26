/**
 * ネットワーク状態管理ユーティリティ
 * 
 * オンライン・オフライン状態の検出とオフラインキューの管理を行う
 */

type QueueItem = {
  id: string;
  timestamp: number;
  endpoint: string;
  method: string;
  data: any;
  retryCount: number;
  lastAttempt?: number;
};

// オフラインキューのストレージキー
const OFFLINE_QUEUE_KEY = 'echo_offline_queue';
const MAX_QUEUE_AGE_DAYS = 7; // キューアイテムの最大保持日数
const MAX_RETRY_COUNT = 5; // 再試行の最大回数

/**
 * 現在のネットワーク状態がオンラインかどうかを確認
 */
export const isOnline = (): boolean => {
  return navigator.onLine;
};

/**
 * ネットワーク状態変化のイベントリスナーを設定
 */
export const listenToConnectionChanges = (
  onOnline: () => void,
  onOffline: () => void
): (() => void) => {
  window.addEventListener('online', onOnline);
  window.addEventListener('offline', onOffline);
  
  // クリーンアップ関数を返す
  return () => {
    window.removeEventListener('online', onOnline);
    window.removeEventListener('offline', onOffline);
  };
};

/**
 * オフラインキューにリクエストを追加
 */
export const addToOfflineQueue = (
  endpoint: string,
  method: string,
  data: any
): string => {
  try {
    const queue = getOfflineQueue();
    
    // 重複防止用のIDを生成
    const id = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // 新しいキューアイテムを作成
    const newItem: QueueItem = {
      id,
      timestamp: Date.now(),
      endpoint,
      method,
      data,
      retryCount: 0
    };
    
    // キューに追加
    queue.push(newItem);
    
    // キューを保存
    saveOfflineQueue(queue);
    
    console.info(`オフラインキューにリクエストを追加しました: ${method} ${endpoint}`);
    return id;
  } catch (error) {
    console.error('オフラインキューへの追加に失敗しました:', error);
    throw error;
  }
};

/**
 * オフラインキューからリクエストを削除
 */
export const removeFromOfflineQueue = (id: string): boolean => {
  try {
    const queue = getOfflineQueue();
    const initialLength = queue.length;
    
    // IDに一致するアイテムを除外
    const newQueue = queue.filter(item => item.id !== id);
    
    // 変更があった場合のみ保存
    if (newQueue.length !== initialLength) {
      saveOfflineQueue(newQueue);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('オフラインキューからの削除に失敗しました:', error);
    return false;
  }
};

/**
 * オフラインキューを取得
 */
export const getOfflineQueue = (): QueueItem[] => {
  try {
    const queueData = localStorage.getItem(OFFLINE_QUEUE_KEY);
    
    if (!queueData) {
      return [];
    }
    
    return JSON.parse(queueData);
  } catch (error) {
    console.error('オフラインキューの取得に失敗しました:', error);
    return [];
  }
};

/**
 * オフラインキューを保存
 */
export const saveOfflineQueue = (queue: QueueItem[]): void => {
  try {
    // 古いデータを除外
    const now = Date.now();
    const maxAge = MAX_QUEUE_AGE_DAYS * 24 * 60 * 60 * 1000; // 日数をミリ秒に変換
    const filteredQueue = queue.filter(item => now - item.timestamp < maxAge);
    
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(filteredQueue));
  } catch (error) {
    console.error('オフラインキューの保存に失敗しました:', error);
  }
};

/**
 * オフラインキュー内のデータを同期
 */
export const syncOfflineData = async (): Promise<{
  success: number;
  failed: number;
  remaining: number;
}> => {
  // オフラインの場合は同期しない
  if (!isOnline()) {
    return { success: 0, failed: 0, remaining: getOfflineQueue().length };
  }
  
  const queue = getOfflineQueue();
  if (queue.length === 0) {
    return { success: 0, failed: 0, remaining: 0 };
  }
  
  console.info(`オフラインキューのデータ同期を開始します。キュー内アイテム数: ${queue.length}`);
  
  let successCount = 0;
  let failedCount = 0;
  
  // キューを処理
  for (const item of queue) {
    try {
      // リトライカウントを更新
      item.retryCount += 1;
      item.lastAttempt = Date.now();
      
      // リクエストを実行
      const response = await fetch(item.endpoint, {
        method: item.method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(item.data)
      });
      
      if (response.ok) {
        // 成功したアイテムをキューから削除
        removeFromOfflineQueue(item.id);
        successCount++;
      } else {
        // APIエラーの場合
        const errorData = await response.json();
        console.error(`オフラインキューアイテム同期エラー: ${response.status}`, errorData);
        
        // 最大リトライ回数を超えた場合は削除
        if (item.retryCount >= MAX_RETRY_COUNT) {
          removeFromOfflineQueue(item.id);
        }
        
        failedCount++;
      }
    } catch (error) {
      console.error(`オフラインキューアイテム同期中のネットワークエラー:`, error);
      
      // 最大リトライ回数を超えた場合は削除
      if (item.retryCount >= MAX_RETRY_COUNT) {
        removeFromOfflineQueue(item.id);
      }
      
      failedCount++;
    }
  }
  
  // 処理後のキューの残りアイテム数
  const remainingCount = getOfflineQueue().length;
  
  console.info(`オフラインキュー同期結果: 成功=${successCount}, 失敗=${failedCount}, 残り=${remainingCount}`);
  
  return {
    success: successCount,
    failed: failedCount,
    remaining: remainingCount
  };
};

/**
 * オフラインキューの状態を表示
 */
export const getOfflineQueueStatus = (): {
  count: number;
  oldestTimestamp: number | null;
  newestTimestamp: number | null;
} => {
  const queue = getOfflineQueue();
  
  if (queue.length === 0) {
    return {
      count: 0,
      oldestTimestamp: null,
      newestTimestamp: null
    };
  }
  
  // タイムスタンプでソート
  const sortedQueue = [...queue].sort((a, b) => a.timestamp - b.timestamp);
  
  return {
    count: queue.length,
    oldestTimestamp: sortedQueue[0].timestamp,
    newestTimestamp: sortedQueue[sortedQueue.length - 1].timestamp
  };
};

/**
 * ネットワークエラー時に適切なエラーメッセージを生成
 */
export const getNetworkErrorMessage = (error: any): string => {
  if (!isOnline()) {
    return 'インターネット接続がオフラインです。データは自動的に保存され、接続が復旧次第送信されます。';
  }
  
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return 'サーバーに接続できません。インターネット接続を確認してください。';
  }
  
  if (error.timeout) {
    return 'サーバーからの応答がタイムアウトしました。後ほど再試行してください。';
  }
  
  return 'ネットワークエラーが発生しました。インターネット接続を確認してください。';
};

/**
 * オフラインフォールバック処理
 * 
 * オンライン・オフラインに関わらず安全に API 呼び出しを行うためのラッパー関数
 */
export const offlineFallbackRequest = async <T>(
  endpoint: string,
  method: string,
  data: any,
  options: {
    timeout?: number; // タイムアウト（ミリ秒）
    retryCount?: number; // リトライ回数
    retryDelay?: number; // リトライ間隔（ミリ秒）
    allowOfflineQueue?: boolean; // オフラインキューへの追加を許可
  } = {}
): Promise<T> => {
  const {
    timeout = 30000,
    retryCount = 2,
    retryDelay = 1000,
    allowOfflineQueue = true
  } = options;
  
  // オフラインの場合
  if (!isOnline()) {
    if (allowOfflineQueue) {
      const queueId = addToOfflineQueue(endpoint, method, data);
      
      // オフラインキューに追加された旨を返す
      throw new Error(`OFFLINE_QUEUED:${queueId}`);
    } else {
      throw new Error('OFFLINE_ERROR');
    }
  }
  
  // オンラインの場合、通常のリクエストを試みる
  let lastError: any;
  
  for (let attempt = 0; attempt <= retryCount; attempt++) {
    try {
      // タイムアウト付きのフェッチリクエスト
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          JSON.stringify({
            status: response.status,
            statusText: response.statusText,
            data: errorData
          })
        );
      }
      
      return await response.json();
    } catch (error) {
      lastError = error;
      
      // AbortController によるタイムアウトの場合
      if (error && typeof error === 'object' && 'name' in error && error.name === 'AbortError') {
        lastError = { ...(error as Error), timeout: true };
      }
      
      // 最終試行でなければリトライ
      if (attempt < retryCount) {
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        continue;
      }
      
      // 最終試行後もエラーの場合
      if (allowOfflineQueue) {
        // オフラインキューに追加
        const queueId = addToOfflineQueue(endpoint, method, data);
        throw new Error(`REQUEST_FAILED_QUEUED:${queueId}`);
      } else {
        throw lastError;
      }
    }
  }
  
  // ここには到達しないはずだが、TypeScript の型を満たすため
  throw lastError;
};