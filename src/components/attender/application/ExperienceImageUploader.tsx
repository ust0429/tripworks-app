import React, { useState, useCallback } from 'react';
import { Trash2, PlusCircle, Image } from 'lucide-react';
import { FileUploader } from '../../common/upload';
import { uploadExperienceImage } from '../../../services/upload/FileUploadService';
import { ExperienceSample } from '../../../types/attender/index';

interface ExperienceImageUploaderProps {
  experienceSample: ExperienceSample;
  onUpdate: (imageUrls: string[]) => void;
  maxImages?: number;
}

/**
 * 体験サンプル画像アップローダーコンポーネント
 * 
 * アテンダー申請時の体験サンプル画像をアップロードするためのコンポーネント
 */
const ExperienceImageUploader: React.FC<ExperienceImageUploaderProps> = ({
  experienceSample,
  onUpdate,
  maxImages = 5
}) => {
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  // 現在の画像URL配列（undefined対策）
  const currentImageUrls = experienceSample.imageUrls || [];
  
  // 画像をアップロード
  const handleImageUpload = useCallback(async (file: File): Promise<string> => {
    // 最大数チェック
    if (currentImageUrls.length >= maxImages) {
      throw new Error(`画像は最大${maxImages}枚までアップロードできます`);
    }
    
    setIsUploading(true);
    setUploadError(null);
    
    try {
      // 体験のタイトルがない場合は仮のタイトルを使用
      const title = experienceSample.title || '新しい体験';
      
      // 画像をアップロード
      const imageUrl = await uploadExperienceImage(file, title);
      
      // 成功したら状態を更新
      const updatedImageUrls = [...currentImageUrls, imageUrl];
      onUpdate(updatedImageUrls);
      
      return imageUrl;
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : '画像のアップロードに失敗しました';
      
      setUploadError(errorMessage);
      throw error;
    } finally {
      setIsUploading(false);
    }
  }, [experienceSample, currentImageUrls, onUpdate, maxImages]);
  
  // 画像を削除
  const handleRemoveImage = useCallback((indexToRemove: number) => {
    const updatedImageUrls = currentImageUrls.filter((_, index) => index !== indexToRemove);
    onUpdate(updatedImageUrls);
  }, [currentImageUrls, onUpdate]);
  
  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-medium text-gray-700">体験サンプル画像</h4>
        <span className="text-xs text-gray-500">
          {currentImageUrls.length} / {maxImages} 枚
        </span>
      </div>
      
      {/* アップロード済み画像のプレビュー */}
      {currentImageUrls.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
          {currentImageUrls.map((url, index) => (
            <div key={index} className="relative group">
              <img 
                src={url} 
                alt={`体験サンプル画像 ${index + 1}`} 
                className="w-full h-24 object-cover rounded-md"
              />
              <button
                type="button"
                onClick={() => handleRemoveImage(index)}
                className="absolute top-1 right-1 p-1 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="画像を削除"
              >
                <Trash2 className="w-4 h-4 text-red-500" />
              </button>
            </div>
          ))}
        </div>
      )}
      
      {/* 新規アップロードフォーム */}
      {currentImageUrls.length < maxImages ? (
        <FileUploader
          onFileSelect={handleImageUpload}
          onSuccess={() => setUploadError(null)}
          onError={(error) => setUploadError(error.message)}
          accept="image/jpeg,image/png,image/webp"
          maxSize={5 * 1024 * 1024} // 5MB
          buttonText="画像を追加"
          dragActiveText="画像をドロップ"
          dragInactiveText="ここに画像をドロップするか、クリックして選択"
          showPreview={false}
        />
      ) : (
        <div className="text-center p-3 border border-gray-200 rounded-md bg-gray-50">
          <p className="text-sm text-gray-500">
            最大枚数に達しました。他の画像をアップロードするには、既存の画像を削除してください。
          </p>
        </div>
      )}
      
      {/* エラーメッセージ */}
      {uploadError && (
        <div className="mt-2 text-xs text-red-600">
          {uploadError}
        </div>
      )}
      
      {isUploading && (
        <div className="mt-2 text-xs text-gray-500">
          アップロード中...しばらくお待ちください
        </div>
      )}
      
      <div className="mt-1 text-xs text-gray-500">
        ※ JPG、PNG、WEBP形式の画像が利用できます（1枚あたり最大5MB）
      </div>
    </div>
  );
};

export default ExperienceImageUploader;
