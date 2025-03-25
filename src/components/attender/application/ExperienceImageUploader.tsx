import React, { useState, useCallback, useRef } from 'react';
import { Trash2, PlusCircle, Image, Upload, X, Loader, AlertCircle, Camera, CheckCircle } from 'lucide-react';
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
 * 画像のプレビュー、ドラッグ＆ドロップ、削除機能を提供
 */
const ExperienceImageUploader: React.FC<ExperienceImageUploaderProps> = ({
  experienceSample,
  onUpdate,
  maxImages = 5
}) => {
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // 現在の画像URL配列（undefined対策）
  const currentImageUrls = experienceSample.imageUrls || [];
  
  // ファイル入力をトリガー
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  // 画像をアップロード
  const handleImageUpload = useCallback(async (file: File): Promise<string> => {
    // 最大数チェック
    if (currentImageUrls.length >= maxImages) {
      throw new Error(`画像は最大${maxImages}枚までアップロードできます`);
    }
    
    // ファイルタイプのチェック
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      throw new Error('JPG、PNG、WEBP形式の画像のみアップロード可能です');
    }
    
    // ファイルサイズのチェック
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new Error('ファイルサイズは5MB以下にしてください');
    }
    
    setIsUploading(true);
    setUploadError(null);
    setUploadProgress(0);
    
    // 擬似的な進行状況の更新
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        const next = prev + Math.random() * 15;
        return next > 90 ? 90 : next;
      });
    }, 300);
    
    try {
      // 体験のタイトルがない場合は仮のタイトルを使用
      const title = experienceSample.title || '新しい体験';
      
      // 画像をアップロード
      const imageUrl = await uploadExperienceImage(file, title);
      
      // 成功したら状態を更新
      const updatedImageUrls = [...currentImageUrls, imageUrl];
      onUpdate(updatedImageUrls);
      
      // プレビューをクリア
      setPreviewImage(null);
      
      // 完了時に進行状況を100%に
      setUploadProgress(100);
      
      return imageUrl;
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : '画像のアップロードに失敗しました';
      
      setUploadError(errorMessage);
      throw error;
    } finally {
      clearInterval(progressInterval);
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 1000);
    }
  }, [experienceSample, currentImageUrls, onUpdate, maxImages]);
  
  // 画像を削除
  const handleRemoveImage = useCallback((indexToRemove: number) => {
    const updatedImageUrls = currentImageUrls.filter((_, index) => index !== indexToRemove);
    onUpdate(updatedImageUrls);
  }, [currentImageUrls, onUpdate]);
  
  // ドラッグイベントハンドラ
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };
  
  // ドロップハンドラ
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      
      // 画像ファイルのプレビュー表示
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
      
      // アップロード処理
      handleImageUpload(file).catch(() => {
        // エラーはcatchブロックで処理済み
      });
    }
  };
  
  // ファイル選択ハンドラ
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      // 画像ファイルのプレビュー表示
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
      
      // アップロード処理
      handleImageUpload(file).catch(() => {
        // エラーはcatchブロックで処理済み
      });
      
      // 入力をリセット（同じファイルを連続で選択できるように）
      e.target.value = '';
    }
  };
  
  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-medium text-gray-700 flex items-center">
          <Camera className="w-4 h-4 mr-1 text-gray-500" />
          体験サンプル画像
        </h4>
        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
          {currentImageUrls.length} / {maxImages} 枚
        </span>
      </div>
      
      {/* アップロード済み画像のプレビュー */}
      {currentImageUrls.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
          {currentImageUrls.map((url, index) => (
            <div key={index} className="relative group border border-gray-200 rounded-md overflow-hidden">
              <img 
                src={url} 
                alt={`体験サンプル画像 ${index + 1}`} 
                className="w-full h-24 object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  className="p-1.5 bg-white rounded-full shadow-md"
                  aria-label="画像を削除"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 text-center">
                画像 {index + 1}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* 新規アップロードフォーム */}
      {currentImageUrls.length < maxImages ? (
        <div
          className={`border-2 border-dashed rounded-md p-6 transition-colors ${
            dragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center justify-center">
            {isUploading ? (
              <div className="text-center">
                <div className="mb-2">
                  <Loader className="w-8 h-8 text-blue-500 mx-auto animate-spin" />
                </div>
                <p className="text-sm text-gray-600 mb-1">アップロード中...</p>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            ) : previewImage ? (
              <div className="relative mb-3">
                <img
                  src={previewImage}
                  alt="プレビュー"
                  className="w-40 h-40 object-cover rounded-md"
                />
                <button
                  type="button"
                  onClick={() => setPreviewImage(null)}
                  className="absolute top-1 right-1 p-1 bg-white rounded-full shadow-md"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            ) : (
              <>
                <Upload
                  className={`w-10 h-10 ${dragActive ? 'text-blue-600' : 'text-gray-400'}`}
                />
                <p className="mt-2 text-sm text-gray-600">
                  {dragActive ? '画像をドロップしてアップロード' : 'ここに画像をドラッグ＆ドロップ'}
                </p>
              </>
            )}
            
            {!isUploading && (
              <button
                type="button"
                onClick={triggerFileInput}
                className="mt-4 px-4 py-2 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center"
                disabled={isUploading}
              >
                <PlusCircle className="w-4 h-4 mr-1" />
                画像を選択
              </button>
            )}
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        </div>
      ) : (
        <div className="text-center p-4 border border-gray-200 rounded-md bg-gray-50">
          <div className="flex items-center justify-center text-yellow-500 mb-2">
            <AlertCircle className="w-5 h-5 mr-1" />
          </div>
          <p className="text-sm text-gray-600 mb-1 font-medium">
            最大アップロード数に達しました
          </p>
          <p className="text-xs text-gray-500">
            他の画像をアップロードするには、既存の画像を削除してください。
          </p>
        </div>
      )}
      
      {/* エラーメッセージ */}
      {uploadError && (
        <div className="mt-2 flex items-start text-xs text-red-600">
          <AlertCircle className="w-4 h-4 mr-1 flex-shrink-0 mt-0.5" />
          <span>{uploadError}</span>
        </div>
      )}
      
      <div className="mt-2 flex items-center text-xs text-gray-500">
        <div className="flex items-center mr-3">
          <CheckCircle className="w-3 h-3 mr-1 text-gray-400" />
          JPG, PNG, WEBP
        </div>
        <div className="flex items-center">
          <CheckCircle className="w-3 h-3 mr-1 text-gray-400" />
          最大5MB/枚
        </div>
      </div>
    </div>
  );
};

export default ExperienceImageUploader;
