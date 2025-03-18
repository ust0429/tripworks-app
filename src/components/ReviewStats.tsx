// src/components/ReviewStats.tsx
import React from 'react';
import { Star } from 'lucide-react';
import { Review } from '../types';

interface ReviewStatsProps {
  reviews: Review[];
  averageRating: number;
  reviewCount: number;
}

const ReviewStats: React.FC<ReviewStatsProps> = ({ 
  reviews, 
  averageRating, 
  reviewCount 
}) => {
  // 評価ごとのレビュー数を計算
  const ratingCounts = [5, 4, 3, 2, 1].map(rating => {
    const count = reviews.filter(review => review.rating === rating).length;
    const percentage = reviews.length > 0 ? Math.round((count / reviews.length) * 100) : 0;
    return { rating, count, percentage };
  });

  return (
    <div className="bg-gray-50 p-4 rounded-lg mb-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center">
          <div className="text-3xl font-bold mr-2">{averageRating.toFixed(1)}</div>
          <div className="flex flex-col">
            <div className="flex mb-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={16}
                  className={
                    star <= Math.round(averageRating)
                      ? "text-yellow-500 fill-current"
                      : "text-gray-300"
                  }
                />
              ))}
            </div>
            <span className="text-sm text-gray-500">{reviewCount}件のレビュー</span>
          </div>
        </div>
      </div>

      {/* 評価バー */}
      <div className="space-y-2">
        {ratingCounts.map(({ rating, count, percentage }) => (
          <div key={rating} className="flex items-center">
            <div className="w-20 text-sm">
              {rating} <Star size={12} className="inline text-yellow-500 fill-current" />
            </div>
            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-yellow-500 rounded-full"
                style={{ width: `${percentage}%` }}
              ></div>
            </div>
            <div className="w-12 text-right text-sm text-gray-500">{count}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReviewStats;
