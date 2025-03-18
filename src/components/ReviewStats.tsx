import React from 'react';
import { Star } from 'lucide-react';
import { Review } from '../types';

interface ReviewStatsProps {
  reviews: Review[];
  averageRating: number;
  reviewCount: number;
}

const ReviewStats: React.FC<ReviewStatsProps> = ({ reviews, averageRating, reviewCount }) => {
  // 評価別のレビュー数を計算
  const ratingCounts = React.useMemo(() => {
    const counts = [0, 0, 0, 0, 0]; // 5つの星評価（1-5）に対応
    
    reviews.forEach(review => {
      if (review.rating >= 1 && review.rating <= 5) {
        counts[review.rating - 1]++;
      }
    });
    
    return counts;
  }, [reviews]);
  
  // 最も多い評価数を取得（バーの長さの基準とするため）
  const maxCount = Math.max(...ratingCounts);
  
  // 高評価率（4-5星）の計算
  const highRatingPercentage = React.useMemo(() => {
    const highRatings = ratingCounts[3] + ratingCounts[4]; // 4星と5星
    return reviewCount > 0 ? Math.round((highRatings / reviewCount) * 100) : 0;
  }, [ratingCounts, reviewCount]);
  
  // 最も頻度の高い評価を取得
  const mostFrequentRating = React.useMemo(() => {
    let maxIndex = 0;
    ratingCounts.forEach((count, index) => {
      if (count > ratingCounts[maxIndex]) {
        maxIndex = index;
      }
    });
    return maxIndex + 1; // インデックスは0からなので+1
  }, [ratingCounts]);

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <div className="flex items-center">
            <span className="text-3xl font-bold mr-2">{averageRating.toFixed(1)}</span>
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={18}
                  className={
                    star <= Math.round(averageRating)
                      ? "text-yellow-500 fill-current"
                      : "text-gray-300"
                  }
                />
              ))}
            </div>
          </div>
          <p className="text-sm text-gray-500">{reviewCount} 件のレビュー</p>
        </div>
        <div className="text-right">
          <div className="text-sm font-medium">統計情報</div>
          <div className="text-xs text-gray-500">高評価率: {highRatingPercentage}%</div>
          <div className="text-xs text-gray-500">最頻評価: {mostFrequentRating}★</div>
        </div>
      </div>
      
      {/* 評価分布バーチャート */}
      <div className="space-y-2">
        {[5, 4, 3, 2, 1].map((rating) => (
          <div key={rating} className="flex items-center">
            <div className="flex items-center w-12">
              <span className="text-sm mr-1">{rating}</span>
              <Star size={14} className="text-yellow-500" fill="currentColor" />
            </div>
            <div className="flex-1 h-5 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-yellow-500 rounded-full"
                style={{ 
                  width: `${maxCount ? (ratingCounts[rating - 1] / maxCount) * 100 : 0}%`,
                  transition: 'width 0.5s ease'
                }}
              ></div>
            </div>
            <div className="w-10 text-right text-sm text-gray-500">
              {ratingCounts[rating - 1]}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReviewStats;