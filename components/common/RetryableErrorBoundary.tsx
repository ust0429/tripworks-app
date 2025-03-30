import React, { ErrorInfo, Component, ReactNode } from 'react';
import { isNetworkError, isTimeoutError } from '../../utils/errorTypes';

interface RetryableErrorBoundaryProps {
  children: ReactNode;
  fallback?: React.ReactNode | ((error: Error, retry: () => void) => React.ReactNode);
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  maxRetries?: number;
  retryDelay?: number;
  allowRetryFor?: (error: Error) => boolean;
}

interface RetryableErrorBoundaryState {
  error: Error | null;
  retryCount: number;
  isRetrying: boolean;
}

class RetryableErrorBoundary extends Component<RetryableErrorBoundaryProps, RetryableErrorBoundaryState> {
  static defaultProps = {
    maxRetries: 3,
    retryDelay: 2000,
    allowRetryFor: (error: Error) => isNetworkError(error) || isTimeoutError(error)
  };

  constructor(props: RetryableErrorBoundaryProps) {
    super(props);
    this.state = {
      error: null,
      retryCount: 0,
      isRetrying: false
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // エラー情報をコンソールに出力
    console.error('RetryableErrorBoundary caught an error:', error, errorInfo);
    
    // エラーをStateに設定
    this.setState({ error });
    
    // onErrorコールバックが存在すれば実行
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
    
    // 再試行可能なエラーかチェック
    const { allowRetryFor, maxRetries } = this.props;
    const { retryCount } = this.state;
    
    if (allowRetryFor && allowRetryFor(error) && retryCount < maxRetries!) {
      this.handleRetry();
    }
  }

  handleRetry = () => {
    const { retryDelay } = this.props;
    
    this.setState({ isRetrying: true });
    
    // 再試行前に遅延を設定
    setTimeout(() => {
      this.setState(prevState => ({
        error: null,
        retryCount: prevState.retryCount + 1,
        isRetrying: false
      }));
    }, retryDelay);
  };

  render() {
    const { children, fallback } = this.props;
    const { error, isRetrying, retryCount } = this.state;
    
    if (isRetrying) {
      // 再試行中の表示
      return (
        <div className="flex flex-col items-center justify-center p-6 text-center">
          <div className="mb-4 w-12 h-12 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
          <h3 className="text-lg font-medium text-gray-900">再接続中...</h3>
          <p className="mt-2 text-sm text-gray-600">
            通信エラーが発生しました。再接続しています（{retryCount}/{this.props.maxRetries}）
          </p>
        </div>
      );
    }
    
    if (error) {
      // エラー発生時のフォールバック表示
      if (typeof fallback === 'function') {
        return fallback(error, this.handleRetry);
      }
      
      if (fallback) {
        return fallback;
      }
      
      // デフォルトのエラー表示
      return (
        <div className="p-6 max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden">
          <div className="text-center">
            <svg className="h-12 w-12 text-red-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">エラーが発生しました</h3>
            <p className="mt-2 text-sm text-gray-600">{error.message}</p>
            <button
              onClick={this.handleRetry}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            >
              再試行
            </button>
          </div>
        </div>
      );
    }
    
    // 通常の子要素を表示
    return children;
  }
}

export default RetryableErrorBoundary;
