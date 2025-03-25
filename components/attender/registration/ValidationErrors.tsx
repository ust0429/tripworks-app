import React from 'react';
import { AlertTriangle, Check, X } from 'lucide-react';

interface ValidationErrorsProps {
  errors: string[];
  title?: string;
  showCloseButton?: boolean;
  onClose?: () => void;
  className?: string;
}

/**
 * バリデーションエラーを表示するコンポーネント
 * 複数のエラーメッセージを一括表示します
 */
const ValidationErrors: React.FC<ValidationErrorsProps> = ({ 
  errors,
  title = 'エラーを修正してください',
  showCloseButton = false,
  onClose,
  className = ''
}) => {
  // エラーがない場合は何も表示しない
  if (!errors || errors.length === 0) {
    return null;
  }
  
  return (
    <div className={`bg-red-50 border-l-4 border-red-500 rounded-md p-4 mb-4 ${className}`}>
      <div className="flex">
        <div className="flex-shrink-0">
          <AlertTriangle className="h-5 w-5 text-red-400" aria-hidden="true" />
        </div>
        <div className="ml-3 flex-1">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-red-800">{title}</h3>
            {showCloseButton && onClose && (
              <button
                type="button"
                className="ml-auto -mx-1.5 -my-1.5 bg-red-50 text-red-500 rounded-lg p-1.5 inline-flex h-8 w-8 hover:bg-red-100"
                onClick={onClose}
                aria-label="閉じる"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
          <div className="mt-2">
            {errors.length === 1 ? (
              <p className="text-sm text-red-700">{errors[0]}</p>
            ) : (
              <ul className="list-disc pl-5 space-y-1 text-sm text-red-700">
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

interface ValidationSuccessProps {
  message: string;
  showCloseButton?: boolean;
  onClose?: () => void;
  className?: string;
}

/**
 * バリデーション成功メッセージを表示するコンポーネント
 */
export const ValidationSuccess: React.FC<ValidationSuccessProps> = ({
  message,
  showCloseButton = false,
  onClose,
  className = ''
}) => {
  if (!message) {
    return null;
  }
  
  return (
    <div className={`bg-green-50 border-l-4 border-green-500 rounded-md p-4 mb-4 ${className}`}>
      <div className="flex">
        <div className="flex-shrink-0">
          <Check className="h-5 w-5 text-green-400" aria-hidden="true" />
        </div>
        <div className="ml-3 flex-1">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-green-800">入力内容は正しいフォーマットです</h3>
            {showCloseButton && onClose && (
              <button
                type="button"
                className="ml-auto -mx-1.5 -my-1.5 bg-green-50 text-green-500 rounded-lg p-1.5 inline-flex h-8 w-8 hover:bg-green-100"
                onClick={onClose}
                aria-label="閉じる"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
          <div className="mt-2">
            <p className="text-sm text-green-700">{message}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ValidationErrors;