// src/components/ReviewForm.tsx
import React, { useState } from 'react';
import { Star } from 'lucide-react';

interface ReviewFormProps {
  attenderId: number;
  experienceTitle: string;
  onSubmit: (review: { rating: number; comment: string }) => void;
  onCancel: () => void;
}

const ReviewForm: React.FC<ReviewFormProps> = ({ 
  attenderId, 
  experienceTitle, 
  onSubmit, 
  onCancel 
}) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [hoverRating, setHoverRating] = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      alert('評価を選択してください');
      return;
    }
    onSubmit({ rating, comment });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h3 className="text-lg font-bold mb-4">
        「{experienceTitle}」のレビューを投稿
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 星評価 */}
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">評価</p>
          <div className="flex space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="text-2xl focus:outline-none"
              >
                <Star
                  size={24}
                  className={`${
                    (hoverRating || rating) >= star
                      ? 'text-yellow-500 fill-current'
                      : 'text-gray-300'
                  }`}
                  fill={(hoverRating || rating) >= star ? "currentColor" : "none"}
                />
              </button>
            ))}
          </div>
        </div>
        
        {/* コメント */}
        <div>
          <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-1">
            コメント
          </label>
          <textarea
            id="comment"
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="体験の感想を書いてください..."
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-gray-500 focus:border-gray-500"
          />
        </div>
        
        {/* ボタン */}
        <div className="flex space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2 border border-gray-300 rounded-lg font-medium"
          >
            キャンセル
          </button>
          <button
            type="submit"
            className="flex-1 py-2 bg-black text-white rounded-lg font-medium"
          >
            投稿する
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReviewForm;