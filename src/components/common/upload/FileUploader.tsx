import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, FileImage, ImagePlus, AlertCircle } from 'lucide-react';
import UploadProgressBar from './UploadProgressBar';
import { UploadProgress } from '../../../services/upload/FileUploadService';

interface FileUploaderProps {
  onFileSelect?: (file: File) => Promise<string>; // オプショナルに変更
  onSuccess?: (url: string) => void;
  onError?: (error: Error) => void;
  accept?: string;
  maxSize?: number; // バイト単位の最大サイズ
  id?: string;
  className?: string;
  buttonText?: string;
  dragActiveText?: string;
  dragInactiveText?: string;
  placeholder?: string;
  showPreview?: boolean;
  previewAsBackground?: boolean; // 背景として画像プレビューを表示するかどうか
  multiple?: boolean; // 複数ファイルの選択を許可するかどうか
  initialImageUrl?: string; // 初期画像URL
  
  // ProfileHeaderで使用されている追加プロパティ
  onFileSelected?: (file: File) => Promise<void>;
  disabled?: boolean;
  children?: React.ReactNode;
}

/**
 * ファイルアップロードコンポーネント
 * 
 * ドラッグアンドドロップとファイル選択ダイアログをサポートしたファイルアップローダー
 */
const FileUploader: React.FC<FileUploaderProps> = ({
  onFileSelect,
  onSuccess,
  onError,
  accept = "image/*",
  maxSize = 10 * 1024 * 1024, // デフォルト10MB
  id = "file-uploader",
  className = "",
  buttonText = "ファイルを選択",
  dragActiveText = "ドロップしてアップロード",
  dragInactiveText = "ここにファイルをドロップするか、クリックして選択",
  placeholder = "ファイルがまだ選択されていません",
  showPreview = true,
  previewAsBackground = false,
  multiple = false,
  initialImageUrl,
  // 追加プロパティ
  onFileSelected,
  disabled = false,
  children
}) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(initialImageUrl || null);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ドラッグアンドドロップイベントのハンドラー
  const handleDrag = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  }, []);

  // ファイルドロップのハンドラー
  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      processFile(file);
    }
  }, []);

  // ファイル検証とプレビュー生成
  const processFile = useCallback(async (file: File) => {
    // エラー状態をリセット
    setError(null);
    
    // ファイルサイズの検証
    if (file.size > maxSize) {
      const maxSizeMB = Math.round(maxSize / (1024 * 1024));
      setError(`ファイルサイズが大きすぎます。${maxSizeMB}MB以下のファイルを選択してください。`);
      return;
    }
    
    // MIMEタイプの検証（簡易版）
    const acceptTypes = accept.split(',').map(type => type.trim());
    const isValidType = acceptTypes.some(type => {
      if (type === '*/*') return true;
      if (type.endsWith('/*')) {
        const mainType = type.split('/')[0];
        return file.type.startsWith(`${mainType}/`);
      }
      return type === file.type;
    });
    
    if (!isValidType) {
      setError(`非対応のファイル形式です。${accept}形式のファイルを選択してください。`);
      return;
    }
    
    // ファイルの設定と画像プレビューの生成
    setSelectedFile(file);
    
    // 画像ファイルの場合はプレビューを生成
    if (showPreview && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
    
    // アップロードを実行
    try {
      // ProfileHeaderで使用しているonFileSelectedがあればそちらを優先
      if (onFileSelected) {
        await onFileSelected(file);
        return "";
      }
      
      // 通常のonFileSelectを使用
      if (onFileSelect) {
        const url = await onFileSelect(file);
        
        if (onSuccess) {
          onSuccess(url);
        }
        
        return url;
      }
      
      // 両方のハンドラが指定されていない場合
      console.warn('Neither onFileSelect nor onFileSelected was provided to FileUploader');
      return "";
    } catch (err) {
      const error = err instanceof Error ? err : new Error('ファイルアップロードに失敗しました');
      setError(error.message);
      
      if (onError) {
        onError(error);
      }
      
      return null;
    }
  }, [accept, maxSize, onFileSelect, onSuccess, onError, showPreview, onFileSelected]);

  // ファイル選択時のハンドラー
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  }, [processFile]);

  // ファイル選択ボタンクリック
  const handleButtonClick = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, []);

  // 選択したファイルを削除
  const handleRemoveFile = useCallback(() => {
    setSelectedFile(null);
    setPreview(null);
    setError(null);
    setUploadProgress(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  // 進捗状況のハンドラー
  const handleProgress = useCallback((progress: UploadProgress) => {
    setUploadProgress(progress);
  }, []);

  // プレビュー表示の決定
  const renderPreview = () => {
    if (!showPreview) return null;
    
    // プレビュー画像がある場合
    if (preview) {
      if (previewAsBackground) {
        // 背景画像として表示
        return (
          <div className="relative w-full h-32 mb-3">
            <div 
              className="absolute inset-0 bg-cover bg-center rounded-md"
              style={{ backgroundImage: `url(${preview})` }}
            />
            <div className="absolute top-2 right-2">
              <button
                type="button"
                onClick={handleRemoveFile}
                className="p-1 bg-white rounded-full shadow-md text-gray-700 hover:text-red-500"
                aria-label="画像を削除"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        );
      } else {
        // 通常の画像プレビュー
        return (
          <div className="relative mb-3">
            <img 
              src={preview} 
              alt="プレビュー" 
              className="max-w-full h-auto max-h-32 rounded-md" 
            />
            <button
              type="button"
              onClick={handleRemoveFile}
              className="absolute top-1 right-1 p-1 bg-white rounded-full shadow-md text-gray-700 hover:text-red-500"
              aria-label="画像を削除"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      }
    }
    
    return null;
  };

  return (
    <div className={`w-full ${className}`}>
      {/* 実際のファイル入力（非表示） */}
      <input
        ref={fileInputRef}
        type="file"
        id={id}
        accept={accept}
        onChange={handleChange}
        className="hidden"
        multiple={multiple}
        disabled={disabled}
      />
      
      {/* エラーメッセージ */}
      {error && (
        <div className="mb-3 text-sm text-red-600 bg-red-50 p-2 rounded-md border border-red-200">
          <span className="flex items-center">
            <AlertCircle className="w-4 h-4 mr-1" />
            {error}
          </span>
        </div>
      )}
      
      {/* アップロード進捗バー */}
      {uploadProgress && (
        <UploadProgressBar 
          progress={uploadProgress}
          onDismiss={() => setUploadProgress(null)}
        />
      )}
      
      {/* プレビュー表示エリア */}
      {renderPreview()}

      {/* childrenがあれば表示し、なければ通常のドロップゾーンを表示 */}
      {children ? (
        <div onClick={handleButtonClick}>
          {children}
        </div>
      ) : (
        /* ドロップゾーン */
        <div
          onClick={handleButtonClick}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`
            w-full border-2 border-dashed rounded-md p-4 text-center cursor-pointer
            transition-colors duration-200 ease-in-out
            ${isDragActive
              ? 'border-blue-400 bg-blue-50'
              : selectedFile
                ? 'border-green-400 bg-green-50'
                : 'border-gray-300 hover:border-blue-300 bg-gray-50 hover:bg-blue-50'
            }
          `}
        >
          {/* アイコンと説明テキスト */}
          <div className="flex flex-col items-center justify-center">
            {selectedFile ? (
              <>
                <FileImage className="w-10 h-10 text-green-500 mb-2" />
                <p className="text-sm font-medium text-gray-700">{selectedFile.name}</p>
                <p className="text-xs text-gray-500">
                  {Math.round(selectedFile.size / 1024)} KB
                </p>
              </>
            ) : (
              <>
                {isDragActive ? (
                  <>
                    <Upload className="w-10 h-10 text-blue-500 mb-2" />
                    <p className="text-sm font-medium text-blue-600">{dragActiveText}</p>
                  </>
                ) : (
                  <>
                    <ImagePlus className="w-10 h-10 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500 mb-2">{dragInactiveText}</p>
                    <button
                      type="button"
                      className="px-4 py-2 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      disabled={disabled}
                    >
                      {buttonText}
                    </button>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      )}
      
      {/* ファイル選択済みの場合の削除ボタン */}
      {selectedFile && (
        <div className="flex justify-end mt-2">
          <button
            type="button"
            onClick={handleRemoveFile}
            className="text-sm text-red-600 hover:text-red-700 flex items-center"
            disabled={disabled}
          >
            <X className="w-4 h-4 mr-1" />
            削除
          </button>
        </div>
      )}
    </div>
  );
};

export default FileUploader;

// 互換性のために名前付きエクスポートも追加
export { FileUploader };
