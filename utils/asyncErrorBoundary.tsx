/**
 * 非同期エラー境界コンポーネント
 * 
 * 非同期操作のエラーを適切に捕捉し、UIに表示するためのユーティリティ
 */

import React, { Component, ReactNode, useState, useCallback } from 'react';
import { getErrorMessage } from './errorHandler';

// エラー境界のプロパティ
interface AsyncErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode | ((error: Error, resetError: () => void) => ReactNode);
  onError?: (error: Error) => void;
}

// エラー境界の状態
interface AsyncErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * 非同期エラー境界コンポーネント
 * Reactコンポーネントツリー内で発生したエラーを捕捉し、フォールバックUIを表示
 */
export class AsyncErrorBoundary extends Component<AsyncErrorBoundaryProps, AsyncErrorBoundaryState> {
  constructor(props: AsyncErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): AsyncErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('Error caught by AsyncErrorBoundary:', error, errorInfo);
    
    // エラーハンドラがあれば呼び出す
    if (this.props.onError) {
      this.props.onError(error);
    }
  }

  resetError = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    const { children, fallback } = this.props;
    const { hasError, error } = this.state;

    if (hasError && error) {
      // フォールバックが関数の場合は関数を実行
      if (typeof fallback === 'function') {
        return fallback(error, this.resetError);
      }
      
      // フォールバックがReactノードの場合はそれを表示
      if (fallback) {
        return fallback;
      }
      
      // デフォルトのエラー表示
      return (
        <div className="error-boundary-fallback">
          <h3>エラーが発生しました</h3>
          <p>{getErrorMessage(error)}</p>
          <button onClick={this.resetError}>リトライ</button>
        </div>
      );
    }

    return children;
  }
}

/**
 * 非同期操作の状態を管理するためのフック
 * ローディング状態、エラー状態、リセット機能を提供
 */
export function useAsyncHandler<T extends (...args: any[]) => Promise<any>>(
  asyncFn: T,
  options: {
    onSuccess?: (result: Awaited<ReturnType<T>>) => void;
    onError?: (error: Error) => void;
    resetOnSuccess?: boolean;
  } = {}
): {
  execute: (...args: Parameters<T>) => Promise<Awaited<ReturnType<T>> | undefined>;
  isLoading: boolean;
  error: Error | null;
  reset: () => void;
} {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { onSuccess, onError, resetOnSuccess = true } = options;

  const reset = useCallback(() => {
    setError(null);
  }, []);

  const execute = useCallback(
    async (...args: Parameters<T>): Promise<Awaited<ReturnType<T>> | undefined> => {
      try {
        setIsLoading(true);
        setError(null);
        
        const result = await asyncFn(...args);
        
        if (resetOnSuccess) {
          setError(null);
        }
        
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
        
        return undefined;
      } finally {
        setIsLoading(false);
      }
    },
    [asyncFn, onSuccess, onError, resetOnSuccess]
  );

  return { execute, isLoading, error, reset };
}

export default {
  AsyncErrorBoundary,
  useAsyncHandler
};
