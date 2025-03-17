// src/components/ReviewModal.tsx
import React, { useState } from 'react';
import { Star, X, AlertCircle, Camera } from 'lucide-react';

interface ReviewModalProps {
  experienceName: string;
  onClose: () => void;
  onSubmit: (rating: number, comment: string) => void;
}

const ReviewModal: React.FC<ReviewModalProps> = ({ experienceName, onClose, onSubmit }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [photoAdded, setPhotoAdded] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // バリデーション
    if (rating === 0) {
      setValidationError('評価を選択してください');
      return;
    }
    
    if (comment.trim().length < 10) {
      setValidationError('コメントは最低10文字入力してください');
      return;
    }
    
    setValidationError('');
    setIsSubmitting(true);
    
    try {
      // 実際のAPIリクエストはここで行う
      // モックの遅延を追加
      await new Promise(resolve => setTimeout(resolve, 500));
      onSubmit(rating, comment);
    } catch (error) {
      console.error('レビュー投稿エラー:', error);
      setValidationError('レビューの投稿中にエラーが発生しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddPhoto = () => {
    // 実際のアプリでは写真アップロード機能を実装
    // ここではモックとして成功したことにする
    setPhotoAdded(true);
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

        {validationError && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 flex items-start">
            <AlertCircle size={18} className="mr-2 mt-0.5 flex-shrink-0" />
            <p className="text-sm">{validationError}</p>
          </div>
        )}

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
            {/* 評価の説明テキスト */}
            <p className="text-sm text-gray-600 mt-1">
              {rating === 1 && "非常に不満"}
              {rating === 2 && "不満"}
              {rating === 3 && "普通"}
              {rating === 4 && "満足"}
              {rating === 5 && "非常に満足"}
              {rating === 0 && "評価をタップしてください"}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
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
            ></textarea>
            <p className="text-xs text-gray-500 mt-1">
              {comment.length} / 最低10文字
            </p>
          </div>

          {/* 写真追加ボタン */}
          <div className="mb-4">
            <button 
              type="button"
              onClick={handleAddPhoto}
              className={`w-full py-2 border border-gray-300 rounded-lg text-sm flex items-center justify-center ${
                photoAdded ? 'bg-gray-100 text-gray-700' : 'text-black'
              }`}
              disabled={photoAdded}
            >
              <Camera size={16} className="mr-2" />
              {photoAdded ? '写真を追加しました' : '写真を追加する (任意)'}
            </button>
          </div>

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 border border-gray-300 rounded-lg font-medium"
              disabled={isSubmitting}
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="flex-1 py-3 bg-black text-white rounded-lg font-medium disabled:bg-gray-400"
              disabled={isSubmitting || rating === 0 || comment.trim().length < 10}
            >
              {isSubmitting ? '送信中...' : 'レビューを投稿'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewModal;