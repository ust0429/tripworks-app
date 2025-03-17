// src/components/ReviewsList.tsx
import React from 'react';
import { Star } from 'lucide-react';
import ReviewCard from './ReviewCard';
import { Review } from '../types';

interface ReviewsListProps {
  reviews: Review[];
  averageRating: number;
  reviewCount: number;
}

const ReviewsList: React.FC<ReviewsListProps> = ({ 
  reviews, 
  averageRating, 
  reviewCount 
}) => {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold">レビュー</h2>
        <div className="flex items-center">
          <Star size={18} className="text-yellow-500 mr-1" />
          <span className="font-bold">{averageRating.toFixed(1)}</span>
          <span className="text-gray-500 ml-1">({reviewCount})</span>
        </div>
      </div>
      
      {/* レビューのサマリー */}
      <div className="bg-gray-50 p-4 rounded-lg mb-4">
        <div className="flex mb-3">
          <div className="w-1/2">
            <div className="flex items-center mb-1">
              <div className="w-1/3 text-sm text-right pr-2">5</div>
              <div className="w-2/3 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-yellow-500 h-2 rounded-full" 
                  style={{ width: `${calcPercentage(reviews, 5)}%` }}
                ></div>
              </div>
            </div>
            <div className="flex items-center mb-1">
              <div className="w-1/3 text-sm text-right pr-2">4</div>
              <div className="w-2/3 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-yellow-500 h-2 rounded-full" 
                  style={{ width: `${calcPercentage(reviews, 4)}%` }}
                ></div>
              </div>
            </div>
            <div className="flex items-center mb-1">
              <div className="w-1/3 text-sm text-right pr-2">3</div>
              <div className="w-2/3 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-yellow-500 h-2 rounded-full" 
                  style={{ width: `${calcPercentage(reviews, 3)}%` }}
                ></div>
              </div>
            </div>
          </div>
          <div className="w-1/2 pl-4">
            <div className="flex items-center mb-1">
              <div className="w-1/3 text-sm text-right pr-2">2</div>
              <div className="w-2/3 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-yellow-500 h-2 rounded-full" 
                  style={{ width: `${calcPercentage(reviews, 2)}%` }}
                ></div>
              </div>
            </div>
            <div className="flex items-center mb-1">
              <div className="w-1/3 text-sm text-right pr-2">1</div>
              <div className="w-2/3 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-yellow-500 h-2 rounded-full" 
                  style={{ width: `${calcPercentage(reviews, 1)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
        <p className="text-center text-sm text-gray-600">
          {reviews.length > 0 
            ? `${reviews.length}件のレビューから` 
            : '評価はまだありません'}
        </p>
      </div>
      
      {/* レビュー一覧 */}
      {reviews.length > 0 ? (
        <div className="space-y-6">
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-center py-4">
          まだレビューがありません
        </p>
      )}
      
      {/* レビューが一定数以上ある場合は「もっと見る」ボタン */}
      {reviews.length > 3 && reviews.length < reviewCount && (
        <button className="w-full mt-4 py-2 border border-gray-300 rounded-lg text-black font-medium text-sm">
          すべてのレビューを見る
        </button>
      )}
    </div>
  );
};

// 特定の評価の割合を計算する関数
const calcPercentage = (reviews: Review[], rating: number): number => {
  if (reviews.length === 0) return 0;
  
  const count = reviews.filter(review => review.rating === rating).length;
  return (count / reviews.length) * 100;
};

export default ReviewsList;