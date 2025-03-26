import React, { useState, useEffect } from 'react';
import { ErrorInfo, handleError } from '../../../utils/errorHandler';
import ErrorDisplay from '../../common/ErrorDisplay';

interface ApiErrorHandlerProps {
  error: unknown;
  onRetry?: () => void;
  onClose?: () => void;
  title?: string;
  expandDetails?: boolean;
  className?: string;
  autoHideAfter?: number; // ミリ秒単位、0以下なら自動非表示しない
}

/**
 * API エラーをハンドリングして適切な形式で表示するコンポーネント
 * 
 * 様々なタイプのエラーを統一された形式で処理し表示する
 */
const ApiErrorHandler: React.FC<ApiErrorHandlerProps> = ({
  error,
  onRetry,
  onClose,
  title,
  expandDetails = false,
  className = '',
  autoHideAfter = 0
}) => {
  const [visible, setVisible] = useState(true);
  const [processedError, setProcessedError] = useState<ErrorInfo | null>(null);
  
  // エラーを処理
  useEffect(() => {
    if (error) {
      const errorInfo = handleError(error);
      setProcessedError(errorInfo);
      setVisible(true);
    } else {
      setProcessedError(null);
      setVisible(false);
    }
  }, [error]);
  
  // 自動非表示タイマー
  useEffect(() => {
    if (autoHideAfter > 0 && processedError) {
      const timer = setTimeout(() => {
        setVisible(false);
        if (onClose) {
          onClose();
        }
      }, autoHideAfter);
      
      return () => clearTimeout(timer);
    }
  }, [processedError, autoHideAfter, onClose]);
  
  // 閉じるハンドラー
  const handleClose = () => {
    setVisible(false);
    if (onClose) {
      onClose();
    }
  };
  
  if (!processedError || !visible) {
    return null;
  }
  
  // エラーの種類に応じたバリアントを決定
  const getVariant = () => {
    if (processedError.isNetworkError) {
      return 'warning';
    }
    if (processedError.isAuthError) {
      return 'info';
    }
    return 'error';
  };
  
  // エラーの詳細情報を配列に変換
  const getErrorDetails = (): string[] => {
    const details: string[] = [];
    
    // エラーコードがあれば追加
    if (processedError.code) {
      details.push(`エラーコード: ${processedError.code}`);
    }
    
    // フィールド指定のエラーがあれば追加
    if (processedError.field) {
      details.push(`フィールド: ${processedError.field}`);
    }
    
    // 詳細オブジェクトの内容を追加
    if (processedError.details) {
      // エラー配列があれば追加
      if (Array.isArray(processedError.details.errors)) {
        processedError.details.errors.forEach(err => {
          if (typeof err === 'string') {
            details.push(err);
          } else if (err && typeof err === 'object') {
            if (err.message) {
              const fieldPrefix = err.field ? `${err.field}: ` : '';
              details.push(`${fieldPrefix}${err.message}`);
            }
          }
        });
      }
      
      // ステータスコードがあれば追加
      if (processedError.details.status) {
        details.push(`ステータスコード: ${processedError.details.status}`);
      }
    }
    
    return details;
  };
  
  // エラーハンドリングに基づく適切なタイトルを生成
  const getErrorTitle = (): string => {
    if (title) {
      return title;
    }
    
    if (processedError.isNetworkError) {
      return 'ネットワークエラー';
    }
    if (processedError.isAuthError) {
      return '認証エラー';
    }
    if (processedError.isValidationError) {
      return '入力エラー';
    }
    
    return 'エラーが発生しました';
  };
  
  return (
    <ErrorDisplay
      title={getErrorTitle()}
      message={processedError.message}
      details={getErrorDetails()}
      onRetry={onRetry}
      onClose={handleClose}
      variant={getVariant()}
      showRetry={!!onRetry}
      expandable={expandDetails}
      className={className}
    />
  );
};

export default ApiErrorHandler;