import React, { useState, useEffect } from 'react';
import { ErrorInfo, handleError } from '@/utils/errorHandler';
import ErrorDisplay from '../../../../components/common/ErrorDisplay';

interface ApiErrorHandlerProps {
  error: any | null;
  onRetry?: () => void;
  onClose?: () => void;
  className?: string;
}

/**
 * APIエラー処理コンポーネント
 * APIエラーを適切に処理し、ユーザーフレンドリーなエラー表示を提供
 */
const ApiErrorHandler: React.FC<ApiErrorHandlerProps> = ({
  error,
  onRetry,
  onClose,
  className
}) => {
  const [errorInfo, setErrorInfo] = useState<ErrorInfo | null>(null);
  
  // エラーが変更されたときに処理
  useEffect(() => {
    if (error) {
      // エラーを処理
      const processedError = handleError(error, 'データの送信中にエラーが発生しました。');
      setErrorInfo(processedError);
    } else {
      // エラーがクリアされた場合
      setErrorInfo(null);
    }
  }, [error]);
  
  // エラーがない場合は何も表示しない
  if (!errorInfo) {
    return null;
  }
  
  return (
    <ErrorDisplay
      error={errorInfo}
      onRetry={onRetry}
      onClose={onClose}
      className={className}
    />
  );
};

export default ApiErrorHandler;