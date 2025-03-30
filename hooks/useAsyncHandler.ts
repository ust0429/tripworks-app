/**
 * 非同期処理を扱うためのカスタムフック
 * 
 * 非同期関数の実行状態（ローディング、エラー）を管理し、再利用可能な形で提供します。
 */

import { useState, useCallback } from 'react';

/**
 * AsyncHandler型定義
 */
interface AsyncHandler<T, Args extends any[]> {
  execute: (...args: Args) => Promise<T>;
  isLoading: boolean;
  error: Error | null;
  reset: () => void;
}

/**
 * 非同期関数を実行し、その状態を管理するフック
 * 
 * @param asyncFunction 実行する非同期関数
 * @param onSuccess 成功時のコールバック（オプション）
 * @param onError エラー時のコールバック（オプション）
 * @returns AsyncHandler オブジェクト
 */
export function useAsyncHandler<T, Args extends any[]>(
  asyncFunction: (...args: Args) => Promise<T>,
  onSuccess?: (result: T) => void,
  onError?: (error: Error) => void
): AsyncHandler<T, Args> {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  // 実行状態をリセットする関数
  const reset = useCallback(() => {
    setIsLoading(false);
    setError(null);
  }, []);

  // 非同期関数を実行する関数
  const execute = useCallback(
    async (...args: Args): Promise<T> => {
      try {
        setIsLoading(true);
        setError(null);
        
        const result = await asyncFunction(...args);
        
        if (onSuccess) {
          onSuccess(result);
        }
        
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        
        if (onError) {
          onError(error);
        }
        
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [asyncFunction, onSuccess, onError]
  );

  return { execute, isLoading, error, reset };
}

/**
 * 実際の使用例:
 * 
 * const { execute: fetchData, isLoading, error } = useAsyncHandler(
 *   async (id: string) => {
 *     const response = await api.get(`/data/${id}`);
 *     return response.data;
 *   },
 *   (result) => console.log('成功:', result),
 *   (error) => console.error('エラー:', error)
 * );
 * 
 * // コンポーネント内で使用する
 * return (
 *   <div>
 *     <button onClick={() => fetchData('123')} disabled={isLoading}>
 *       {isLoading ? 'ロード中...' : 'データを取得'}
 *     </button>
 *     {error && <p className="error">{error.message}</p>}
 *   </div>
 * );
 */

export default useAsyncHandler;
