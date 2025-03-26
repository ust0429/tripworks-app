import React, { useState } from 'react';
import { AlertCircle, X, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';

interface ErrorDisplayProps {
  title?: string;
  message: string;
  details?: string[];
  onRetry?: () => void;
  onClose?: () => void;
  variant?: 'error' | 'warning' | 'info';
  showRetry?: boolean;
  expandable?: boolean;
  className?: string;
}

/**
 * エラー表示コンポーネント
 * 
 * アプリケーション全体で統一されたエラー表示を提供する
 * 様々なスタイルバリエーションとアクションをサポート
 */
const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  title,
  message,
  details,
  onRetry,
  onClose,
  variant = 'error',
  showRetry = false,
  expandable = false,
  className = ''
}) => {
  const [expanded, setExpanded] = useState(false);
  
  // バリアントに応じた色設定
  const getVariantStyles = () => {
    switch (variant) {
      case 'warning':
        return {
          bg: 'bg-amber-50',
          border: 'border-amber-200',
          text: 'text-amber-800',
          icon: 'text-amber-500'
        };
      case 'info':
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          text: 'text-blue-800',
          icon: 'text-blue-500'
        };
      case 'error':
      default:
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          text: 'text-red-800',
          icon: 'text-red-500'
        };
    }
  };
  
  const styles = getVariantStyles();
  
  return (
    <div 
      className={`${styles.bg} ${styles.border} border rounded-md p-4 ${className}`}
      role="alert"
      aria-live="assertive"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start">
          <div className={`${styles.icon} mr-3 mt-0.5`}>
            <AlertCircle size={20} />
          </div>
          <div className="flex-1">
            {title && (
              <h3 className={`font-semibold ${styles.text}`}>{title}</h3>
            )}
            <div className={`text-sm ${styles.text}`}>
              {message}
            </div>
            
            {expandable && details && details.length > 0 && (
              <button
                onClick={() => setExpanded(!expanded)}
                className={`flex items-center text-xs mt-1 ${styles.text} hover:underline focus:outline-none`}
                aria-expanded={expanded}
              >
                {expanded ? (
                  <>
                    <ChevronUp size={14} className="mr-1" />
                    詳細を隠す
                  </>
                ) : (
                  <>
                    <ChevronDown size={14} className="mr-1" />
                    詳細を表示
                  </>
                )}
              </button>
            )}
            
            {(!expandable || expanded) && details && details.length > 0 && (
              <ul className={`list-disc list-inside text-xs mt-2 ml-2 ${styles.text} space-y-1`}>
                {details.map((detail, index) => (
                  <li key={index} className="leading-tight">{detail}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
        
        <div className="flex space-x-1 ml-4">
          {showRetry && onRetry && (
            <button
              onClick={onRetry}
              className={`p-1 rounded-full hover:${styles.bg} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:${styles.border}`}
              aria-label="リトライ"
              title="リトライ"
            >
              <RefreshCw size={16} className={styles.text} />
            </button>
          )}
          
          {onClose && (
            <button
              onClick={onClose}
              className={`p-1 rounded-full hover:${styles.bg} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:${styles.border}`}
              aria-label="閉じる"
              title="閉じる"
            >
              <X size={16} className={styles.text} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorDisplay;