import React, { useState, useRef, ChangeEvent } from 'react';
import { Upload, X, Image } from 'lucide-react';
import FileUploadService from '../../../services/FileUploadService';
import { UploadDirectory, UploadProgress } from '../../../services/FileUploadService';

interface FileUploaderProps {
  onFileUploaded: (urls: string[]) => void;
  multiple?: boolean;
  maxFiles?: number;
  userId: string;
  uploadType: 'profile' | 'review' | 'experience';
  existingFiles?: string[];
  className?: string;
}

const FileUploader: React.FC<FileUploaderProps> = ({
  onFileUploaded,
  multiple = false,
  maxFiles = 5,
  userId,
  uploadType,
  existingFiles = [],
  className = '',
}) => {
  const [files, setFiles] = useState<string[]>(existingFiles);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    // 最大ファイル数のチェック
    if (multiple && files.length + selectedFiles.length > maxFiles) {
      setError(`アップロードできる画像は最大${maxFiles}枚です`);
      return;
    }

    setUploading(true);
    setError(null);

    try {
      // ファイルをアップロード
      if (multiple) {
        const filesToUpload = Array.from(selectedFiles);
        const results = await FileUploadService.uploadMultipleImages(
          filesToUpload,
          uploadType === 'profile' 
            ? UploadDirectory.PROFILES 
            : uploadType === 'review'
              ? UploadDirectory.REVIEWS
              : UploadDirectory.EXPERIENCES,
          userId,
          (progress) => setUploadProgress(progress)
        );

        const successfulUploads = results
          .filter(result => result.success && result.url)
          .map(result => result.url as string);

        if (successfulUploads.length > 0) {
          const newFiles = [...files, ...successfulUploads];
          setFiles(newFiles);
          onFileUploaded(newFiles);
        }

        const failures = results.filter(result => !result.success);
        if (failures.length > 0) {
          setError(`${failures.length}個のファイルのアップロードに失敗しました`);
        }
      } else {
        // 単一ファイルのアップロード
        const file = selectedFiles[0];
        let result;

        const progressCallback = (progress: UploadProgress) => {
          setUploadProgress(progress.progress);
        };

        if (uploadType === 'profile') {
          result = await FileUploadService.uploadProfileImage(file, userId, progressCallback);
        } else if (uploadType === 'review') {
          result = await FileUploadService.uploadReviewImage(file, userId, progressCallback);
        } else {
          result = await FileUploadService.uploadExperienceImage(file, userId, progressCallback);
        }

        if (result.success && result.url) {
          const newFiles = [result.url];
          setFiles(newFiles);
          onFileUploaded(newFiles);
        } else {
          setError(result.error?.message || 'アップロードに失敗しました');
        }
      }
    } catch (err) {
      console.error('アップロードエラー:', err);
      setError('アップロード中にエラーが発生しました');
    } finally {
      setUploading(false);
      setUploadProgress(0);
      
      // ファイル入力をリセット
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveFile = (index: number) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
    onFileUploaded(newFiles);
  };

  const triggerFileSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className={`w-full ${className}`}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/jpeg,image/png,image/gif"
        multiple={multiple}
        className="hidden"
      />

      {/* アップロードボタン */}
      <div className="flex flex-col items-center">
        <button
          type="button"
          onClick={triggerFileSelect}
          disabled={uploading || (multiple && files.length >= maxFiles)}
          className={`
            w-full p-3 border-2 border-dashed rounded-lg text-center
            ${uploading ? 'bg-gray-100 border-gray-300' : 'border-gray-300 hover:border-gray-500'}
            transition-colors duration-200
          `}
        >
          <div className="flex flex-col items-center justify-center space-y-2">
            <Upload className={uploading ? 'text-gray-400' : 'text-gray-600'} />
            <span className={uploading ? 'text-gray-400' : 'text-gray-600'}>
              {multiple
                ? `画像をアップロード (${files.length}/${maxFiles})`
                : '画像をアップロード'}
            </span>
          </div>
        </button>

        {/* アップロード中のプログレスバー */}
        {uploading && (
          <div className="w-full mt-2">
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <p className="text-xs text-center mt-1 text-gray-500">
              {uploadProgress}% アップロード中...
            </p>
          </div>
        )}
      </div>

      {/* エラーメッセージ */}
      {error && (
        <div className="mt-2 p-2 bg-red-100 border border-red-200 rounded text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* アップロード済みファイルのプレビュー */}
      {files.length > 0 && (
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
          {files.map((fileUrl, index) => (
            <div key={index} className="relative group">
              <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                <img
                  src={fileUrl}
                  alt={`アップロード画像 ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
              
              <button
                type="button"
                onClick={() => handleRemoveFile(index)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileUploader;