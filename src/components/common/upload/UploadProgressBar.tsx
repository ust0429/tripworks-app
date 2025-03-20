import React, { useEffect, useState } from 'react';
import { UploadProgress } from '../../../services/upload/FileUploadService';
import { FileX, CheckCircle2, AlertCircle, FileUp } from 'lucide-react';

interface UploadProgressBarProps {
  progress: UploadProgress;
  onDismiss?: () => void;
  showDismissButton?: boolean;
  className?: string;
}

/**
 * ファイルアップロードの進捗を表示するプログレスバーコンポーネント
 */
const UploadProgressBar: React.FC<UploadProgressBarProps> = ({
  progress,
  onDismiss,
  showDismissButton = true,
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  // 成功時は数秒後に自動的に消える
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (progress.status === 'success') {
      timer = setTimeout(() => {
        setFadeOut(true);
        
        // フェードアウトアニメーション後に非表示にする
        setTimeout(() => {
          setIsVisible(false);
          if (onDismiss) onDismiss();
        }, 500);
      }, 3000);
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [progress.status, onDismiss]);
  
  // 非表示の場合は何も描画しない
  if (!isVisible) return null;
  
  // ステータスに基づいて進捗バーの色を決定
  const getColorClass = () => {
    switch (progress.status) {
      case 'success':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      case 'uploading':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };
  
  // ステータスに基づいてアイコンを決定
  const getStatusIcon = () => {
    switch (progress.status) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'pending':
      case 'processing':
      case 'uploading':
        return <FileUp className="w-5 h-5 text-blue-500" />;
      default:
        return null;
    }
  };
  
  // ステータスに基づいてメッセージを決定
  const getStatusMessage = () => {
    const filename = progress.file?.name || 'ファイル';
    
    switch (progress.status) {
      case 'pending':
        return `${filename} の準備中...`;
      case 'processing':
        return `${filename} を処理中...`;
      case 'uploading':
        return `${filename} をアップロード中...`;
      case 'success':
        return `${filename} のアップロードが完了しました`;
      case 'error':
        return progress.error || `${filename} のアップロードに失敗しました`;
      default:
        return `${filename} をアップロード中...`;
    }
  };
  
  return (
    <div 
      className={`
        rounded-md border p-3 shadow-sm mb-3 transition-all duration-300
        ${fadeOut ? 'opacity-0' : 'opacity-100'}
        ${progress.status === 'error' ? 'bg-red-50 border-red-200' : 
          progress.status === 'success' ? 'bg-green-50 border-green-200' : 
          'bg-blue-50 border-blue-200'}
        ${className}
      `}
    >
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center space-x-2">
          {getStatusIcon()}
          <span className="text-sm font-medium">
            {getStatusMessage()}
          </span>
        </div>
        
        {showDismissButton && (
          <button 
            onClick={() => {
              setIsVisible(false);
              if (onDismiss) onDismiss();
            }}
            className="text-gray-400 hover:text-gray-600"
            aria-label="閉じる"
          >
            <FileX className="w-4 h-4" />
          </button>
        )}
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className={`${getColorClass()} h-2 rounded-full transition-all duration-300`}
          style={{ width: `${progress.progress}%` }}
        />
      </div>
      
      {progress.status === 'success' && progress.url && (
        <div className="mt-2 text-xs text-gray-500 truncate">
          アップロード先: {progress.url}
        </div>
      )}
    </div>
  );
};

export default UploadProgressBar;
