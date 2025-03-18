// src/components/ReviewsTab.tsx
import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { useAuth } from '../AuthComponents';
import ReviewsList from './ReviewsList';
import ReviewForm from './ReviewForm';
import { Review } from '../types';
import { addReview, getReviewsByAttenderId, getAverageRating, toggleReviewHelpful } from '../mockData';

interface ReviewsTabProps {
  attenderId: number;
  initialReviews: Review[];
  averageRating: number;
  reviewCount: number;
  attendeeUserId?: string; // 現在ログイン中のユーザーのIDと、体験したことがあるかのフラグ
  hasAttended?: boolean;
}

const ReviewsTab: React.FC<ReviewsTabProps> = ({ 
  attenderId, 
  initialReviews, 
  averageRating,
  reviewCount,
  attendeeUserId,
  hasAttended = false
}) => {
  const { isAuthenticated, user, openLoginModal } = useAuth();
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [experienceTitle, setExperienceTitle] = useState(''); // 体験名を追加

  // 既にレビューを投稿済みかチェック
  const hasReviewed = isAuthenticated && reviews.some(
    review => review.userId === (user?.id || attendeeUserId)
  );

  // レビュー投稿ボタンをクリック
  const handleAddReviewClick = () => {
    if (!isAuthenticated) {
      openLoginModal();
      return;
    }
    
    if (!hasAttended) {
      alert('このアテンダーの体験に参加後にレビューを投稿できます。');
      return;
    }
    
    setShowReviewForm(true);
  };
  
  // レビューを投稿
  const handleSubmitReview = (reviewData: { rating: number; comment: string }) => {
    if (!isAuthenticated || !user) {
      openLoginModal();
      return;
    }
    
    try {
      // 新しいレビューを追加
      const newReview = addReview({
        attenderId,
        userId: user.id,
        userName: user.name,
        rating: reviewData.rating,
        comment: reviewData.comment,
        experienceTitle
      });
      
      // レビューリストを更新
      setReviews([newReview, ...reviews]);
      setShowReviewForm(false);
      
      // 成功メッセージ
      alert('レビューを投稿しました。ありがとうございます！');
    } catch (error) {
      console.error('レビュー投稿エラー:', error);
      alert('レビューの投稿に失敗しました。もう一度お試しください。');
    }
  };
  
  // 「役に立った」を切り替え
  const handleHelpfulToggle = (reviewId: string, isHelpful: boolean) => {
    if (!isAuthenticated || !user) {
      openLoginModal();
      return;
    }
    
    // モックデータを更新
    toggleReviewHelpful(reviewId, user.id, isHelpful);
    
    // UIを更新
    setReviews(reviews.map(review => {
      if (review.id === reviewId) {
        const newHelpfulCount = (review.helpfulCount || 0) + (isHelpful ? 1 : -1);
        return {
          ...review,
          helpfulCount: Math.max(0, newHelpfulCount)
        };
      }
      return review;
    }));
  };
  
  // レビューをソート
  const handleSortChange = (sortType: 'newest' | 'highest' | 'lowest' | 'most_helpful') => {
    // モックデータからレビューを再取得してソート
    const freshReviews = getReviewsByAttenderId(attenderId);
    
    let sortedReviews = [...freshReviews];
    
    switch (sortType) {
      case 'newest':
        sortedReviews.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        break;
      case 'highest':
        sortedReviews.sort((a, b) => b.rating - a.rating);
        break;
      case 'lowest':
        sortedReviews.sort((a, b) => a.rating - b.rating);
        break;
      case 'most_helpful':
        sortedReviews.sort((a, b) => (b.helpfulCount || 0) - (a.helpfulCount || 0));
        break;
    }
    
    setReviews(sortedReviews);
  };
  
  // レビューをフィルター
  const handleFilterChange = (rating: number | null) => {
    const freshReviews = getReviewsByAttenderId(attenderId);
    
    if (rating === null) {
      setReviews(freshReviews);
    } else {
      setReviews(freshReviews.filter(review => review.rating === rating));
    }
  };
  
  return (
    <div>
      {/* レビュー投稿ボタン */}
      {!hasReviewed && hasAttended && (
        <div className="mb-6 bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">このアテンダーの体験を評価しましょう</p>
              <p className="text-sm text-gray-600">あなたのレビューは他の人の参考になります</p>
            </div>
            <button 
              onClick={handleAddReviewClick}
              className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center"
            >
              <Plus size={16} className="mr-1" />
              レビューを書く
            </button>
          </div>
        </div>
      )}
      
      {/* レビュー投稿フォーム */}
      {showReviewForm && (
        <div className="mb-6">
          <div className="mb-2 flex items-center">
            <label className="block text-sm font-medium text-gray-700 mr-2">
              体験名:
            </label>
            <select
              value={experienceTitle}
              onChange={(e) => setExperienceTitle(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="">体験名を選択してください</option>
              <option value="下北沢インディーシーン探訪ツアー">下北沢インディーシーン探訪ツアー</option>
              <option value="ミュージシャン体験ワークショップ">ミュージシャン体験ワークショップ</option>
              <option value="夜の音楽バー巡りツアー">夜の音楽バー巡りツアー</option>
            </select>
          </div>
          <ReviewForm
            attenderId={attenderId}
            experienceTitle={experienceTitle || '未選択'}
            onSubmit={handleSubmitReview}
            onCancel={() => setShowReviewForm(false)}
          />
        </div>
      )}
      
      {/* レビューリスト */}
      <ReviewsList
        reviews={reviews}
        averageRating={averageRating}
        reviewCount={reviewCount}
        onSortChange={handleSortChange}
        onFilterChange={handleFilterChange}
        onHelpfulToggle={handleHelpfulToggle}
      />
    </div>
  );
};

export default ReviewsTab;