/**
 * ネットワーク状態監視ユーティリティ
 * 
 * オンライン/オフライン状態を監視し、状態変化時のコールバックを提供します。
 */

// ネットワーク状態変更リスナーの型
type NetworkStatusListener = (isOnline: boolean) => void;

// リスナー配列
const listeners: NetworkStatusListener[] = [];

// 最後に確認したネットワーク状態
let lastOnlineStatus = navigator.onLine;

/**
 * 現在のネットワーク状態を取得
 * 
 * @returns オンラインならtrue
 */
export function isOnline(): boolean {
  return navigator.onLine;
}

/**
 * オフライン時に実行するアクションをラップ
 * オフライン時は代替アクションが実行され、オンライン時は元のアクションが実行される
 * 
 * @param action 実行したいアクション（オンライン時）
 * @param fallbackAction 代替アクション（オフライン時）
 * @returns ラップされたアクション
 */
export function withOfflineFallback<T>(
  action: () => Promise<T>,
  fallbackAction: () => Promise<T> | T
): () => Promise<T> {
  return async () => {
    if (isOnline()) {
      try {
        return await action();
      } catch (error) {
        // エラーがネットワーク関連の場合はフォールバックを実行
        if (isNetworkError(error)) {
          console.warn('ネットワークエラーが発生しました。オフラインモードで実行します。');
          return await fallbackAction();
        }
        throw error;
      }
    } else {
      console.info('オフライン状態です。オフライン用の処理を実行します。');
      return await fallbackAction();
    }
  };
}

/**
 * エラーがネットワーク関連かどうかを判定
 * 
 * @param error エラーオブジェクト
 * @returns ネットワークエラーならtrue
 */
function isNetworkError(error: any): boolean {
  return error &&
    (
      (error instanceof TypeError && error.message.includes('network')) ||
      (error.name === 'NetworkError') ||
      (error.code === 'NETWORK_ERROR') ||
      (error.message && typeof error.message === 'string' && (
        error.message.includes('network') ||
        error.message.includes('Network') ||
        error.message.includes('offline') ||
        error.message.includes('connection')
      ))
    );
}

/**
 * ネットワーク状態の変更を監視
 * 
 * @param callback ネットワーク状態変更時に呼び出すコールバック
 * @returns 監視解除用の関数
 */
export function addNetworkStatusListener(callback: NetworkStatusListener): () => void {
  listeners.push(callback);
  
  // ブラウザのネットワークイベントがまだ設定されていなければ設定する
  if (listeners.length === 1) {
    setupNetworkListeners();
  }
  
  // 現在の状態を即座に通知
  setTimeout(() => callback(lastOnlineStatus), 0);
  
  // リスナー解除関数を返す
  return () => {
    const index = listeners.indexOf(callback);
    if (index !== -1) {
      listeners.splice(index, 1);
    }
  };
}

/**
 * ブラウザのネットワークイベントリスナーを設定
 */
function setupNetworkListeners(): void {
  if (typeof window === 'undefined') return;
  
  const handleStatusChange = (event: Event) => {
    const isOnlineNow = event.type === 'online';
    
    // 状態が変わった場合のみ通知
    if (isOnlineNow !== lastOnlineStatus) {
      lastOnlineStatus = isOnlineNow;
      
      // すべてのリスナーに通知
      listeners.forEach(listener => {
        try {
          listener(isOnlineNow);
        } catch (error) {
          console.error('ネットワーク状態リスナーでエラーが発生しました:', error);
        }
      });
      
      // コンソールに出力
      if (isOnlineNow) {
        console.info('🌐 ネットワーク接続が回復しました');
      } else {
        console.warn('⚠️ ネットワーク接続が切断されました');
      }
    }
  };
  
  window.addEventListener('online', handleStatusChange);
  window.addEventListener('offline', handleStatusChange);
}

/**
 * ネットワーク接続を確認
 * 
 * @returns 接続確認結果
 */
export async function checkNetworkConnection(): Promise<boolean> {
  // navigator.onLineはブラウザキャッシュからの読み込みもオンラインと判断するため、
  // 実際にサーバーに接続できるかをテストする
  if (!navigator.onLine) {
    return false;
  }
  
  try {
    // シンプルな接続テスト用URL（事前にタイムアウトを設定）
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    
    // GETリクエストでファビコンなど小さなリソースを取得
    const response = await fetch('/favicon.ico', {
      method: 'HEAD',
      cache: 'no-store',
      signal: controller.signal
    });
    
    clearTimeout(timeout);
    return response.ok;
  } catch (error) {
    return false;
  }
}

/**
 * オンラインになるまで待機
 * 
 * @param options オプション
 * @returns Promise
 */
export function waitForOnline(options: {
  timeout?: number;
  pollingInterval?: number;
  showNotification?: boolean;
} = {}): Promise<void> {
  const {
    timeout = 60000, // 60秒
    pollingInterval = 5000, // 5秒
    showNotification = true
  } = options;
  
  return new Promise((resolve, reject) => {
    // すでにオンラインなら即座に解決
    if (navigator.onLine) {
      resolve();
      return;
    }
    
    if (showNotification) {
      console.warn('オフライン状態です。オンラインになるまで待機しています...');
    }
    
    const timeoutId = setTimeout(() => {
      cleanup();
      reject(new Error('ネットワーク接続待機がタイムアウトしました'));
    }, timeout);
    
    // ポーリング用のインターバル
    const intervalId = setInterval(async () => {
      const isConnected = await checkNetworkConnection();
      if (isConnected) {
        cleanup();
        resolve();
      }
    }, pollingInterval);
    
    // オンラインイベントのリスナー
    const onlineListener = () => {
      cleanup();
      resolve();
    };
    
    window.addEventListener('online', onlineListener);
    
    // リソースのクリーンアップ
    function cleanup() {
      clearTimeout(timeoutId);
      clearInterval(intervalId);
      window.removeEventListener('online', onlineListener);
    }
  });
}

export default {
  isOnline,
  addNetworkStatusListener,
  withOfflineFallback,
  checkNetworkConnection,
  waitForOnline
};
