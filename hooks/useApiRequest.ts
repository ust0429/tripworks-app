/**
 * API リクエスト用カスタムフック
 * 
 * データ取得、キャッシュ、ローディング状態、エラー処理を一元管理
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import api, { ApiResponse } from '../utils/apiClient';
import { getApiErrorMessage, isNetworkError, isAuthError } from '../utils/errorHandler';

// キャッシュの設定
const DEFAULT_CACHE_TIME = 5 * 60 * 1000; // 5分
const globalCache = new Map<string, { data: any; timestamp: number }>();

// フックの戻り値の型
interface UseApiRequestResult<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  setData: (newData: T) => void;
}

// フックのオプションの型
interface UseApiRequestOptions {
  dependencies?: any[];
  skipInitialFetch?: boolean;
  cacheTime?: number;
  cacheKey?: string;
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
  enableCache?: boolean;
}

/**
 * APIリクエスト用カスタムフック
 * 
 * @param method HTTPメソッド ('get', 'post', 'put', 'patch', 'delete')
 * @param url APIエンドポイントURL
 * @param payload リクエストデータ（GETの場合はクエリパラメータ、その他はボディ）
 * @param options フックのオプション
 * @returns データ、ローディング状態、エラー、再取得関数
 */
function useApiRequest<T = any>(
  method: 'get' | 'post' | 'put' | 'patch' | 'delete',
  url: string,
  payload?: any,
  options: UseApiRequestOptions = {}
): UseApiRequestResult<T> {
  const {
    dependencies = [],
    skipInitialFetch = false,
    cacheTime = DEFAULT_CACHE_TIME,
    cacheKey,
    onSuccess,
    onError,
    enableCache = true
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(!skipInitialFetch);
  const [error, setError] = useState<string | null>(null);

  // ペイロード参照を保持（依存配列に含めるため）
  const payloadRef = useRef(payload);
  payloadRef.current = payload;

  // 実際のキャッシュキーを計算
  const effectiveCacheKey = cacheKey || `${method}-${url}-${JSON.stringify(payload)}`;

  // キャッシュからデータを取得する関数
  const getFromCache = useCallback(() => {
    if (!enableCache) return null;

    const cached = globalCache.get(effectiveCacheKey);
    if (!cached) return null;

    const now = Date.now();
    if (now - cached.timestamp > cacheTime) {
      // キャッシュが期限切れの場合は削除
      globalCache.delete(effectiveCacheKey);
      return null;
    }

    return cached.data;
  }, [effectiveCacheKey, cacheTime, enableCache]);

  // キャッシュにデータを保存する関数
  const saveToCache = useCallback(
    (data: T) => {
      if (!enableCache) return;
      globalCache.set(effectiveCacheKey, {
        data,
        timestamp: Date.now()
      });
    },
    [effectiveCacheKey, enableCache]
  );

  // APIリクエストを実行する関数
  const fetchData = useCallback(async (): Promise<void> => {
    // スキップフラグがある場合は何もしない
    if (skipInitialFetch) return;

    // まずキャッシュを確認
    const cachedData = getFromCache();
    if (cachedData) {
      setData(cachedData);
      setIsLoading(false);
      setError(null);
      if (onSuccess) onSuccess(cachedData);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      let response: ApiResponse<T>;

      switch (method) {
        case 'get':
          response = await api.get<T>(url, payloadRef.current);
          break;
        case 'post':
          response = await api.post<T>(url, payloadRef.current);
          break;
        case 'put':
          response = await api.put<T>(url, payloadRef.current);
          break;
        case 'patch':
          response = await api.patch<T>(url, payloadRef.current);
          break;
        case 'delete':
          response = await api.delete<T>(url);
          break;
        default:
          throw new Error(`Unsupported method: ${method}`);
      }

      if (response.success && response.data) {
        setData(response.data);
        saveToCache(response.data);
        if (onSuccess) onSuccess(response.data);
      } else {
        const errorMessage = getApiErrorMessage(response);
        setError(errorMessage);
        if (onError) onError(errorMessage);
      }
    } catch (err) {
      console.error('API request error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      if (onError) onError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [method, url, skipInitialFetch, getFromCache, saveToCache, onSuccess, onError]);

  // 依存関係が変更されたら再取得
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchData, ...dependencies]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchData,
    setData
  };
}

export default useApiRequest;
