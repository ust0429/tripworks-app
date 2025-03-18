// src/components/ReviewsList.tsx
import React, { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import ReviewStats from './ReviewStats';
import ReviewFilters, { FilterState } from './ReviewFilters';
import ReviewCard from './ReviewCard';
import { Review } from '../types';

interface ReviewsListProps {
  reviews: Review[];
  averageRating: number;
  reviewCount: number;
  onSortChange?: (sortType: 'newest' | 'highest' | 'lowest' | 'most_helpful') => void;
  onFilterChange?: (rating: number | null) => void;
  onHelpfulToggle?: (reviewId: string, isHelpful: boolean) => void;
}

const ReviewsList: React.FC<ReviewsListProps> = ({ 
  reviews, 
  averageRating, 
  reviewCount,
  onSortChange,
  onFilterChange,
  onHelpfulToggle
}) => {
  // フィルター状態
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortBy, setSortBy] = useState<'newest' | 'highest' | 'lowest' | 'most_helpful'>('newest');
  
  // 表示するレビュー
  const [displayedReviews, setDisplayedReviews] = useState<Review[]>(reviews);
  
  // 評価ごとのレビュー数
  const reviewCountsByRating = [
    reviews.filter(r => r.rating === 5).length,
    reviews.filter(r => r.rating === 4).length,
    reviews.filter(r => r.rating === 3).length,
    reviews.filter(r => r.rating === 2).length,
    reviews.filter(r => r.rating === 1).length
  ];
  
  // レビューをフィルタリングして並べ替える
  useEffect(() => {
    // フィルターを適用
    let filtered = reviews.filter(review => {
      // 評価フィルター
      if (filterRating !== null && review.rating !== filterRating) {
        return false;
      }
      
      // 検索フィルター
      if (searchTerm) {
        const lowercaseSearch = searchTerm.toLowerCase();
        const matchesName = review.userName.toLowerCase().includes(lowercaseSearch);
        const matchesComment = review.comment.toLowerCase().includes(lowercaseSearch);
        const matchesExperience = review.experienceTitle 
          ? review.experienceTitle.toLowerCase().includes(lowercaseSearch) 
          : false;
          
        if (!matchesName && !matchesComment && !matchesExperience) {
          return false;
        }
      }
      
      return true;
    });
    
    // 並べ替えを適用
    const sorted = [...filtered];
    
    switch (sortBy) {
      case 'newest':
        sorted.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        break;
      case 'highest':
        sorted.sort((a, b) => b.rating - a.rating);
        break;
      case 'lowest':
        sorted.sort((a, b) => a.rating - b.rating);
        break;
      case 'most_helpful':
        sorted.sort((a, b) => (b.helpfulCount || 0) - (a.helpfulCount || 0));
        break;
    }
    
    setDisplayedReviews(sorted);
  }, [reviews, filterRating, searchTerm, sortBy]);
  
  // フィルターを全てクリア
  const clearFilters = () => {
    setFilterRating(null);
    setSearchTerm('');
    if (onFilterChange) onFilterChange(null);
  };
  
  // フィルター状態の変更を処理
  const handleFilterChange = (filters: FilterState) => {
    // 検索キーワード
    setSearchTerm(filters.searchTerm);
    
    // 評価フィルター
    setFilterRating(filters.ratingFilter);
    if (onFilterChange) {
      onFilterChange(filters.ratingFilter);
    }
    
    // 並べ替え
    const newSortBy = filters.sortBy as 'newest' | 'highest' | 'lowest' | 'most_helpful';
    setSortBy(newSortBy);
    if (onSortChange) {
      onSortChange(newSortBy);
    }
  };
  
  return (
    <div>
      <h2 className="text-lg font-bold mb-4">レビュー</h2>
      
      {/* 統計情報 */}
      <ReviewStats
        reviews={reviews}
        averageRating={averageRating}
        reviewCount={reviewCount}
      />
      
      {/* フィルターコンポーネント */}
      <ReviewFilters
        onFilterChange={handleFilterChange}
        totalReviews={reviews.length}
        reviewCounts={reviewCountsByRating}
      />
      
      {/* レビュー一覧 */}
      {displayedReviews.length > 0 ? (
        <div className="space-y-6">
          {/* レビューカード */}
          {displayedReviews.map((review) => (
            <ReviewCard 
              key={review.id} 
              review={review} 
              onHelpfulToggle={onHelpfulToggle}
            />
          ))}
          
          {/* 全てのレビューをロードするボタン */}
          {reviews.length > 0 && reviews.length < reviewCount && (
            <button className="w-full mt-4 py-2 border border-gray-300 rounded-lg text-black font-medium text-sm">
              すべてのレビューを見る
            </button>
          )}
        </div>
      ) : (
        <div className="bg-gray-50 p-8 rounded-lg text-center">
          {reviews.length > 0 ? (
            <>
              <p className="text-gray-600 font-medium mb-2">フィルターに一致するレビューがありません</p>
              <button
                onClick={clearFilters}
                className="text-black underline text-sm"
              >
                すべてのレビューを表示
              </button>
            </>
          ) : (
            <p className="text-gray-500">まだレビューがありません</p>
          )}
        </div>
      )}
    </div>
  );
};

export default ReviewsList;