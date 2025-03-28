import React, { useState, useEffect } from 'react';
import { UUID } from '../../../types/attender';
import { getAttenderReviews, getReviewSummary } from '../../../services/reviewService';
import { Review, ReviewSummary } from '../../../types/review';

// 型定義問題を回避するためのサンプル実装
interface ReviewDashboardProps {
  attenderId: UUID;
}

const ReviewDashboard: React.FC<ReviewDashboardProps> = ({ attenderId }) => {
  const [reviews, setReviews] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>({
    averageRating: 0,
    totalReviews: 0,
    ratingCounts: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    mostRecent: null
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // レビュー一覧の取得
        const reviewsData = await getAttenderReviews(attenderId);
        setReviews(reviewsData);
        
        // レビュー統計の取得
        const summaryData = await getReviewSummary(attenderId);
        setSummary(summaryData);
      } catch (error) {
        console.error('レビューデータの取得に失敗しました:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [attenderId]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="review-dashboard">
      <h2>レビュー管理</h2>
      
      <div className="summary-section">
        <h3>レビュー統計</h3>
        <div className="stats-container">
          <div className="rating-overview">
            <p className="average-rating">{summary.averageRating.toFixed(1)}</p>
            <p className="total-reviews">全{summary.totalReviews}件のレビュー</p>
          </div>
          
          <div className="rating-distribution">
            {[5, 4, 3, 2, 1].map(rating => (
              <div key={rating} className="rating-bar">
                <span className="rating-label">{rating}</span>
                <div className="rating-bar-container">
                  <div 
                    className="rating-bar-fill"
                    style={{ 
                      width: summary.totalReviews ? 
                        `${(summary.ratingCounts[rating] / summary.totalReviews) * 100}%` : 
                        '0%' 
                    }}
                  ></div>
                </div>
                <span className="rating-count">{summary.ratingCounts[rating]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="reviews-section">
        <h3>最近のレビュー</h3>
        {reviews.length > 0 ? (
          <div className="reviews-list">
            {reviews.map(review => (
              <div key={review.id} className="review-item">
                <div className="review-header">
                  <div className="reviewer-info">
                    <img 
                      src={review.userPhotoUrl || '/images/default-avatar.png'} 
                      alt={review.userDisplayName} 
                      className="reviewer-avatar"
                    />
                    <span className="reviewer-name">{review.userDisplayName}</span>
                  </div>
                  <div className="review-rating">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span 
                        key={i} 
                        className={`star ${i < review.rating ? 'filled' : ''}`}
                      >★</span>
                    ))}
                  </div>
                </div>
                <p className="review-comment">{review.comment}</p>
                <div className="review-footer">
                  <span className="review-date">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </span>
                  <span className="review-helpful">
                    役に立った: {review.helpfulCount}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-reviews">まだレビューがありません</p>
        )}
      </div>
    </div>
  );
};

export default ReviewDashboard;
