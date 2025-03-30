/**
 * API再試行ユーティリティ
 * 
 * APIリクエストが失敗した場合の再試行ロジックを提供します
 */

import { isRetryableError } from './errorHandler';
import { getServiceConfig } from '../config/serviceConfig';

// 再試行オプションの型定義
export interface RetryOptions {
  maxAttempts: number;  // 最大再試行回数
  initialDelay: number; // 初回の遅延時間（ミリ秒）
  maxDelay: number;     // 最大遅延時間（ミリ秒）
  factor: number;       // 遅延時間の増加係数
  jitter: boolean;      // ランダムなジッターを追加するかどうか
  retryCondition?: (error: any) => boolean; // 再試行条件
}

// デフォルトの再試行オプション
const DEFAULT_RETRY_OPTIONS: RetryOptions = {
  maxAttempts: getServiceConfig().network.retry.maxAttempts,
  initialDelay: getServiceConfig().network.retry.interval,
  maxDelay: 10000, // 10秒
  factor: 2,       // 指数バックオフ
  jitter: true     // ジッターを有効化
};

/**
 * 遅延時間を計算する関数
 * 
 * @param attempt 試行回数（0ベース）
 * @param options 再試行オプション
 * @returns 遅延時間（ミリ秒）
 */
function calculateDelay(attempt: number, options: RetryOptions): number {
  // 指数バックオフで遅延時間を計算
  const delay = Math.min(
    options.maxDelay,
    options.initialDelay * Math.pow(options.factor, attempt)
  );
  
  // ジッターの追加（0.5〜1.5倍のランダム係数）
  if (options.jitter) {
    return delay * (0.5 + Math.random());
  }
  
  return delay;
}

/**
 * 指定した時間だけ待機する
 * 
 * @param ms 待機時間（ミリ秒）
 * @returns Promise
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 再試行付きで非同期関数を実行
 * 
 * @param fn 実行する非同期関数
 * @param options 再試行オプション
 * @returns 関数の実行結果
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: Partial<RetryOptions> = {}
): Promise<T> {
  // オプションをデフォルト値とマージ
  const retryOptions: RetryOptions = {
    ...DEFAULT_RETRY_OPTIONS,
    ...options,
    retryCondition: options.retryCondition || isRetryableError
  };
  
  let lastError: any;
  
  // 試行回数分ループ（初回の実行 + 再試行）
  for (let attempt = 0; attempt < retryOptions.maxAttempts; attempt++) {
    try {
      // 初回以外は待機
      if (attempt > 0) {
        const delay = calculateDelay(attempt - 1, retryOptions);
        await sleep(delay);
      }
      
      // 関数を実行
      return await fn();
    } catch (error) {
      lastError = error;
      
      // 再試行条件を評価
      const shouldRetry = retryOptions.retryCondition
        ? retryOptions.retryCondition(error)
        : isRetryableError(error);
      
      // 再試行すべきでない場合、またはこれが最後の試行だった場合は例外をスロー
      if (!shouldRetry || attempt === retryOptions.maxAttempts - 1) {
        throw error;
      }
      
      // デバッグ用ログ
      console.warn(
        `APIリクエスト失敗 (試行 ${attempt + 1}/${retryOptions.maxAttempts}): ${error instanceof Error ? error.message : 'Unknown error'}. 再試行します...`
      );
    }
  }
  
  // ここには到達しないはずだが、型安全のために
  throw lastError;
}

/**
 * 再試行ポリシーを定義
 * 
 * @param options 再試行オプション
 * @returns 再試行関数
 */
export function createRetryPolicy(options: Partial<RetryOptions> = {}) {
  return <T>(fn: () => Promise<T>) => withRetry(fn, options);
}

export default {
  withRetry,
  createRetryPolicy
};
