import React, { useState, useRef } from 'react';
import { Star, X, Camera, XCircle, ImagePlus } from 'lucide-react';

interface ReviewModalProps {
  experienceName: string;
  onClose: () => void;
  onSubmit: (rating: number, comment: string, photos?: File[]) => void;
  isSubmitting?: boolean;
  error?: string | null;
  enableCamera?: boolean;
  uploadProgress?: number;
}

const ReviewModal: React.FC<ReviewModalProps> = ({ 
  experienceName, 
  onClose, 
  onSubmit,
  isSubmitting = false,
  error = null,
  enableCamera = false,
  uploadProgress = 0
}) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviewUrls, setPhotoPreviewUrls] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [localIsSubmitting, setLocalIsSubmitting] = useState(false);

  // クリーンアップ関数 - コンポーネントがアンマウントされた時にオブジェクトURLを解放
  React.useEffect(() => {
    return () => {
      // オブジェクトURLをクリーンアップ
      photoPreviewUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [photoPreviewUrls]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      alert('評価を選択してください');
      return;
    }

    setLocalIsSubmitting(true);
    try {
      // 実際のAPIリクエストはここで行う
      // モックの遅延を追加
      await new Promise(resolve => setTimeout(resolve, 500));
      onSubmit(rating, comment, photos);
    } catch (error) {
      console.error('レビュー投稿エラー:', error);
      alert('レビューの投稿中にエラーが発生しました');
    } finally {
      setLocalIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">体験レビューを投稿</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <div className="mb-6">
          <h3 className="font-medium mb-2">{experienceName}</h3>
          <div className="border-b pb-4">
            <p className="text-sm text-gray-600 mb-2">体験の評価</p>
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1"
                >
                  <Star
                    size={32}
                    className={
                      (hoverRating || rating) >= star
                        ? "text-yellow-500 fill-current"
                        : "text-gray-300"
                    }
                  />
                </button>
              ))}
            </div>

          {/* アップロード進捗バー */}
          {isSubmitting && uploadProgress > 0 && (
            <div className="mb-4">
              <p className="text-xs text-gray-600 mb-1">写真アップロード中...</p>
              <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-600 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 text-right mt-1">{uploadProgress}%</p>
            </div>
          )}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* バリデーションエラーまたはエラー表示 */}
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4">
              <p className="text-sm">{error}</p>
            </div>
          )}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              コメント
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-gray-500 focus:border-gray-500"
              rows={5}
              placeholder="体験についての感想を入力してください..."
              disabled={isSubmitting || localIsSubmitting}
            ></textarea>
          </div>

          {/* 写真アップロード部分 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              写真を追加
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {photoPreviewUrls.map((url, index) => (
                <div key={index} className="relative w-20 h-20">
                  <img src={url} alt="プレビュー" className="w-full h-full object-cover rounded-lg" />
                  <button
                    type="button"
                    onClick={() => {
                      // 削除する前にオブジェクトURLを解放
                      URL.revokeObjectURL(photoPreviewUrls[index]);
                      
                      const newPhotos = [...photos];
                      newPhotos.splice(index, 1);
                      setPhotos(newPhotos);
                      
                      const newUrls = [...photoPreviewUrls];
                      newUrls.splice(index, 1);
                      setPhotoPreviewUrls(newUrls);
                    }}
                    className="absolute -top-2 -right-2 bg-white rounded-full p-0.5"
                  >
                    <XCircle size={18} className="text-red-500" />
                  </button>
                </div>
              ))}
              
              {photoPreviewUrls.length < 5 && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center"
                  disabled={isSubmitting || localIsSubmitting}
                >
                  <ImagePlus size={24} className="text-gray-400" />
                </button>
              )}
            </div>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              multiple
              onChange={(e) => {
                if (e.target.files) {
                  const selectedFiles = Array.from(e.target.files);
                  const availableSlots = 5 - photos.length;
                  const filesToAdd = selectedFiles.slice(0, availableSlots);
                  
                  // 新しい写真を追加
                  setPhotos([...photos, ...filesToAdd]);
                  
                  // プレビューURLを生成
                  const newPreviewUrls = filesToAdd.map(file => URL.createObjectURL(file));
                  setPhotoPreviewUrls([...photoPreviewUrls, ...newPreviewUrls]);
                  
                  // 入力をリセット
                  e.target.value = '';
                }
              }}
            />
            <p className="text-xs text-gray-500">最大5枚まで追加できます</p>
          </div>

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 border border-gray-300 rounded-lg font-medium"
              disabled={isSubmitting || localIsSubmitting}
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="flex-1 py-3 bg-black text-white rounded-lg font-medium"
              disabled={isSubmitting || localIsSubmitting}
            >
              {isSubmitting || localIsSubmitting ? '送信中...' : 'レビューを投稿'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewModal;