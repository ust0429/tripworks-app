import React, { useState } from 'react';
import { 
  AlertTriangle, 
  WifiOff, 
  AlertCircle, 
  Clock, 
  ServerCrash, 
  LockKeyhole, 
  RefreshCw, 
  X
} from 'lucide-react';
import { ErrorInfo, ErrorType } from '@/utils/errorHandler';

interface ErrorDisplayProps {
  error: ErrorInfo;
  onRetry?: () => void;
  onClose?: () => void;
  className?: string;
  compact?: boolean;
}

/**
 * 汎用エラー表示コンポーネント
 * エラータイプに応じた適切な表示を行います
 */
const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  error,
  onRetry,
  onClose,
  className = '',
  compact = false
}) => {
  const [expanded, setExpanded] = useState(false);
  
  // エラータイプに応じたスタイルとアイコン
  const getErrorStyle = () => {
    switch (error.type) {
      case ErrorType.NETWORK:
        return {
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-400',
          textColor: 'text-yellow-800',
          icon: <WifiOff className="h-5 w-5 text-yellow-500" aria-hidden="true" />
        };
      case ErrorType.VALIDATION:
        return {
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-400',
          textColor: 'text-orange-800',
          icon: <AlertCircle className="h-5 w-5 text-orange-500" aria-hidden="true" />
        };
      case ErrorType.AUTH:
        return {
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-400',
          textColor: 'text-blue-800',
          icon: <LockKeyhole className="h-5 w-5 text-blue-500" aria-hidden="true" />
        };
      case ErrorType.SERVER:
        return {
          bgColor: 'bg-red-50',
          borderColor: 'border-red-400',
          textColor: 'text-red-800',
          icon: <ServerCrash className="h-5 w-5 text-red-500" aria-hidden="true" />
        };
      case ErrorType.TIMEOUT:
        return {
          bgColor: 'bg-amber-50',
          borderColor: 'border-amber-400',
          textColor: 'text-amber-800',
          icon: <Clock className="h-5 w-5 text-amber-500" aria-hidden="true" />
        };
      default:
        return {
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-400',
          textColor: 'text-gray-800',
          icon: <AlertTriangle className="h-5 w-5 text-gray-500" aria-hidden="true" />
        };
    }
  };
  
  const { bgColor, borderColor, textColor, icon } = getErrorStyle();
  
  // コンパクト表示の場合
  if (compact) {
    return (
      <div className={`rounded-md p-2 ${bgColor} ${className}`}>
        <div className="flex items-center">
          {icon}
          <p className={`ml-2 text-sm ${textColor}`}>{error.message}</p>
          {error.retryable && onRetry && (
            <button
              onClick={onRetry}
              className="ml-2 inline-flex items-center px-2 py-1 text-xs font-medium rounded-md bg-white border border-gray-300 hover:bg-gray-50"
              aria-label="再試行"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              再試行
            </button>
          )}
        </div>
      </div>
    );
  }
  
  // 標準表示
  return (
    <div className={`border-l-4 ${borderColor} ${bgColor} p-4 rounded-md ${className}`}>
      <div className="flex">
        <div className="flex-shrink-0">
          {icon}
        </div>
        <div className="ml-3 flex-1">
          <div className="flex items-center justify-between">
            <h3 className={`text-sm font-medium ${textColor}`}>
              {getErrorTitle(error.type)}
            </h3>
            {onClose && (
              <button
                type="button"
                className={`ml-auto -mx-1.5 -my-1.5 ${bgColor} rounded-md p-1.5 inline-flex items-center justify-center ${textColor} hover:bg-opacity-80`}
                onClick={onClose}
                aria-label="閉じる"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <div className="mt-2">
            <p className={`text-sm ${textColor}`}>{error.message}</p>
            
            {/* 詳細エラー情報 (開発環境またはインタラクティブエラー) */}
            {error.details && (
              <div className="mt-1">
                <button
                  type="button"
                  onClick={() => setExpanded(!expanded)}
                  className={`text-xs underline ${textColor} opacity-80`}
                >
                  {expanded ? 'エラー詳細を隠す' : 'エラー詳細を表示'}
                </button>
                
                {expanded && (
                  <pre className={`mt-2 p-2 text-xs overflow-x-auto rounded bg-opacity-50 ${bgColor} border ${borderColor} ${textColor}`}>
                    {JSON.stringify(error.details, null, 2)}
                  </pre>
                )}
              </div>
            )}
            
            {/* フィールドエラー */}
            {error.fieldErrors && Object.keys(error.fieldErrors).length > 0 && (
              <ul className="mt-2 list-disc list-inside text-sm">
                {Object.entries(error.fieldErrors).map(([field, message]) => (
                  <li key={field} className={textColor}>
                    <span className="font-medium">{formatFieldName(field)}:</span> {message}
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          {/* 再試行ボタン */}
          {error.retryable && onRetry && (
            <div className="mt-4">
              <button
                onClick={onRetry}
                className={`inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
              >
                <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                再試行
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * エラータイプに応じたタイトルを取得
 */
function getErrorTitle(errorType: ErrorType): string {
  switch (errorType) {
    case ErrorType.NETWORK:
      return 'ネットワークエラー';
    case ErrorType.VALIDATION:
      return '入力エラー';
    case ErrorType.AUTH:
      return '認証エラー';
    case ErrorType.SERVER:
      return 'サーバーエラー';
    case ErrorType.TIMEOUT:
      return 'タイムアウトエラー';
    default:
      return 'エラーが発生しました';
  }
}

/**
 * フィールド名を人間が読みやすい形式に変換
 */
function formatFieldName(field: string): string {
  // ネストされたフィールド
  if (field.includes('.')) {
    return field
      .split('.')
      .map(part => formatFieldName(part))
      .join(' › ');
  }
  
  // 配列インデックス
  if (field.includes('[') && field.includes(']')) {
    const match = field.match(/(.+)\[(\d+)\]\.?(.+)?/);
    if (match) {
      const [_, fieldName, index, subField] = match;
      if (subField) {
        return `${formatFieldName(fieldName)} ${Number(index) + 1} の ${formatFieldName(subField)}`;
      }
      return `${formatFieldName(fieldName)} ${Number(index) + 1}`;
    }
  }
  
  // 一般的なフィールド名
  const fieldMappings: Record<string, string> = {
    name: '名前',
    email: 'メールアドレス',
    phoneNumber: '電話番号',
    location: '所在地',
    country: '国',
    region: '地域',
    city: '都市',
    address: '住所',
    postalCode: '郵便番号',
    biography: '自己紹介',
    specialties: '専門分野',
    languages: '言語',
    expertise: '専門知識',
    category: 'カテゴリ',
    subcategories: 'サブカテゴリ',
    description: '説明',
    yearsOfExperience: '経験年数',
    experienceSamples: '体験サンプル',
    title: 'タイトル',
    estimatedDuration: '想定所要時間',
    maxParticipants: '最大参加人数',
    pricePerPerson: '1人あたり料金',
    images: '画像',
    availableTimes: '利用可能時間',
    isLocalResident: '地元住民',
    isMigrant: '移住者',
    yearsMoved: '移住年数',
    previousLocation: '以前の居住地',
    identificationDocument: '身分証明書',
    type: '種類',
    number: '番号',
    expirationDate: '有効期限',
    frontImageUrl: '表面画像',
    backImageUrl: '裏面画像',
    agreements: '同意事項',
    termsOfService: '利用規約',
    privacyPolicy: 'プライバシーポリシー',
    codeOfConduct: '行動規範',
    backgroundCheck: 'バックグラウンドチェック',
  };
  
  return fieldMappings[field] || field;
}

export default ErrorDisplay;