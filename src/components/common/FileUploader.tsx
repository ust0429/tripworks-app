import React, { useState, ReactNode } from 'react';
import { Upload, CheckCircle, AlertCircle, Loader } from 'lucide-react';

interface FileUploaderProps {
  onUploadComplete: (url: string) => void;
  acceptedFileTypes?: string;
  buttonLabel?: ReactNode;
  maxFileSizeMB?: number;
}

const FileUploader: React.FC<FileUploaderProps> = ({
  onUploadComplete,
  acceptedFileTypes = '*/*',
  buttonLabel = 'ファイルを選択',
  maxFileSizeMB = 5,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // ファイルサイズチェック
    if (file.size > maxFileSizeMB * 1024 * 1024) {
      setUploadError(`ファイルサイズは${maxFileSizeMB}MB以下にしてください`);
      return;
    }

    setIsUploading(true);
    setUploadError(null);
    setUploadSuccess(false);

    try {
      // 本来はここで実際のアップロードAPIを呼び出します
      // モック用のタイムアウトとURLを使用
      const formData = new FormData();
      formData.append('file', file);

      // 実際の実装では以下のようなAPIコールを行います
      // const response = await axios.post(`${API_URL}/upload`, formData);
      // const fileUrl = response.data.url;

      // モック用タイムアウト
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // モック用URL (実際の実装では上のAPIコール結果を使用)
      const fileUrl = URL.createObjectURL(file);
      
      setUploadSuccess(true);
      onUploadComplete(fileUrl);
    } catch (error) {
      console.error('File upload failed:', error);
      setUploadError('ファイルのアップロードに失敗しました');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div>
      <label className="relative cursor-pointer">
        <input
          type="file"
          className="hidden"
          accept={acceptedFileTypes}
          onChange={handleFileChange}
          disabled={isUploading}
        />
        
        <div className={`inline-flex items-center px-4 py-2 rounded-lg ${
          isUploading 
            ? 'bg-gray-100 text-gray-500'
            : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
        }`}>
          {isUploading ? (
            <>
              <Loader className="w-4 h-4 animate-spin mr-2" />
              アップロード中...
            </>
          ) : uploadSuccess ? (
            <>
              <CheckCircle className="w-4 h-4 mr-2" />
              アップロード完了
            </>
          ) : (
            <>
              {typeof buttonLabel === 'string' ? (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  {buttonLabel}
                </>
              ) : (
                buttonLabel
              )}
            </>
          )}
        </div>
      </label>
      
      {uploadError && (
        <div className="mt-2 text-xs text-red-600 flex items-center">
          <AlertCircle className="w-3 h-3 mr-1" />
          {uploadError}
        </div>
      )}
    </div>
  );
};

export default FileUploader;