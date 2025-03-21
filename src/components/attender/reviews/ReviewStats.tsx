import React from 'react';
import { ReviewSummary } from '../../../types/review';

interface ReviewStatsProps {
  summary: ReviewSummary;
}

const ReviewStats: React.FC<ReviewStatsProps> = ({ summary }) => {
  // 評価の分布を視覚化するためのバー
  const renderRatingBar = (count: number, total: number) => {
    const percentage = total > 0 ? (count / total) * 100 : 0;
    
    return (
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-blue-600 h-2 rounded-full"
          style={{ width: `${percentage}%` }}
        />
      </div>
    );
  };

  // 日付をフォーマット
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-lg font-semibold mb-4">レビュー概要</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 評価の概要 */}
        <div className="col-span-1">
          <div className="text-center">
            <div className="text-5xl font-bold text-gray-800">
              {summary.averageRating.toFixed(1)}
            </div>
            <div className="flex justify-center my-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg
                  key={star}
                  className={`w-5 h-5 ${
                    star <= Math.round(summary.averageRating)
                      ? 'text-yellow-400'
                      : 'text-gray-300'
                  }`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 15.585l-5.196 3.09 1.25-6.148L1.5 8.363l6.292-.769L10 2l2.208 5.594 6.292.769-4.554 4.164 1.25 6.148L10 15.585z"
                    clipRule="evenodd"
                  />
                </svg>
              ))}
            </div>
            <div className="text-sm text-gray-500">
              {summary.totalReviews}件のレビュー
            </div>
          </div>
          
          <div className="mt-4">
            <div className="text-sm font-medium mb-1">
              返信済み: {summary.repliedReviews}件
            </div>
            <div className="text-sm font-medium mb-1">
              写真付き: {summary.reviewsWithPhotos}件
            </div>
            <div className="text-sm text-gray-500 mt-3">
              最新レビュー: {formatDate(summary.latestReviewDate)}
            </div>
          </div>
        </div>
        
        {/* 評価の分布 */}
        <div className="col-span-1 md:col-span-2">
          <div className="space-y-3">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = summary.ratingCounts[rating] || 0;
              return (
                <div key={rating} className="flex items-center">
                  <div className="w-16 text-sm font-medium">{rating}つ星</div>
                  <div className="flex-grow mx-3">
                    {renderRatingBar(count, summary.totalReviews)}
                  </div>
                  <div className="w-12 text-right text-sm text-gray-600">{count}</div>
                </div>
              );
            })}
          </div>
          
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="bg-blue-50 p-3 rounded">
              <div className="text-sm font-medium text-gray-500">レスポンス率</div>
              <div className="text-2xl font-bold text-blue-700">
                {summary.totalReviews > 0
                  ? Math.round((summary.repliedReviews / summary.totalReviews) * 100)
                  : 0}%
              </div>
            </div>
            
            <div className="bg-green-50 p-3 rounded">
              <div className="text-sm font-medium text-gray-500">平均返信時間</div>
              <div className="text-2xl font-bold text-green-700">
                {summary.averageReplyTime < 24
                  ? `${summary.averageReplyTime}時間`
                  : `${Math.round(summary.averageReplyTime / 24)}日`}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewStats;
