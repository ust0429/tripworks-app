import React, { useState, useRef } from 'react';
import { Upload, X, Loader } from 'lucide-react';

interface FileUploaderProps {
  onUploadComplete: (url: string) => void;
  acceptedFileTypes?: string;
  buttonLabel?: string;
  className?: string;
}

const FileUploader: React.FC<FileUploaderProps> = ({
  onUploadComplete,
  acceptedFileTypes = '*',
  buttonLabel = 'ファイルを選択',
  className = ''
}) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // ファイルタイプのチェック
    if (acceptedFileTypes !== '*') {
      const fileType = file.type;
      const acceptedTypesArray = acceptedFileTypes.split(',');
      
      const isAccepted = acceptedTypesArray.some(type => {
        // image/* などのワイルドカード対応
        if (type.endsWith('*')) {
          const category = type.split('/*')[0];
          return fileType.startsWith(category);
        }
        return type === fileType;
      });

      if (!isAccepted) {
        setError(`サポートされていないファイルタイプです。${acceptedFileTypes}のみ許可されています。`);
        return;
      }
    }

    uploadFile(file);
  };

  const uploadFile = async (file: File) => {
    setUploading(true);
    setError(null);

    try {
      // 開発環境ではモックアップロードを使用
      // 本番環境では実際のAPIに置き換える
      await mockUpload(file);
      
      // ファイルのURLを生成(実際はサーバーから返されるURL)
      const fileUrl = URL.createObjectURL(file);
      onUploadComplete(fileUrl);
    } catch (err) {
      console.error('File upload failed:', err);
      setError('ファイルのアップロードに失敗しました。後でもう一度お試しください。');
    } finally {
      setUploading(false);
      // 入力フィールドをリセット
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // モックアップロード処理（開発用）
  const mockUpload = (file: File): Promise<void> => {
    return new Promise(resolve => {
      // アップロード処理を模倣するための遅延
      setTimeout(() => {
        resolve();
      }, 1000);
    });
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const clearError = () => {
    setError(null);
  };

  return (
    <div className={`flex flex-col ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedFileTypes}
        onChange={handleFileSelect}
        className="hidden"
        disabled={uploading}
      />
      
      <button
        type="button"
        onClick={handleClick}
        disabled={uploading}
        className="flex items-center px-3 py-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50 text-sm"
      >
        {uploading ? (
          <>
            <Loader className="w-4 h-4 animate-spin mr-2" />
            アップロード中...
          </>
        ) : (
          <>
            <Upload className="w-4 h-4 mr-2" />
            {buttonLabel}
          </>
        )}
      </button>
      
      {error && (
        <div className="mt-2 bg-red-50 p-2 rounded text-red-700 text-sm flex items-start">
          <span className="flex-1">{error}</span>
          <button
            type="button"
            onClick={clearError}
            className="text-red-700 hover:text-red-900"
          >
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
};

export default FileUploader;
