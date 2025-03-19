// src/components/ReviewsList.tsx
import React, { useState, useEffect } from 'react';
import { MessageSquare, ThumbsUp, AlertCircle } from 'lucide-react';
import { Review } from '../types';
import ReviewCard from './ReviewCard';
import ReviewFilters, { FilterState } from './ReviewFilters';

interface ReviewsListProps {
  reviews: Review[];
  showFilters?: boolean;
  isLoading?: boolean;
  error?: string;
  attenderId?: number;
  averageRating?: number;
  reviewCount?: number;
  onSortChange?: (type: "newest" | "highest" | "lowest" | "most_helpful") => void;
  onFilterChange?: (rating: number | null) => void;
  onHelpfulToggle?: (reviewId: string, isHelpful: boolean) => void;
}

const ReviewsList: React.FC<ReviewsListProps> = ({
  reviews,
  showFilters = true,
  isLoading = false,
  error,
  attenderId,
  onHelpfulToggle
}) => {
  const [filteredReviews, setFilteredReviews] = useState<Review[]>(reviews);
  const [filters, setFilters] = useState<FilterState>({
    ratingFilter: null,
    photoFilter: null,
    dateRange: {
      from: null,
      to: null
    },
    searchTerm: '',
    sortBy: 'newest'
  });

  // レビューが変更されたときに再フィルター
  useEffect(() => {
    handleFilterChange(filters);
  }, [reviews]);

  // レビューカウントの計算
  const reviewCounts = [0, 0, 0, 0, 0]; // 5, 4, 3, 2, 1 の順
  reviews.forEach(review => {
    if (review.rating >= 1 && review.rating <= 5) {
      reviewCounts[5 - review.rating]++;
    }
  });

  // 写真付きレビューの数
  const photoReviewsCount = reviews.filter(review => 
    review.photoUrls && review.photoUrls.length > 0
  ).length;

  // 最近のレビュー数（過去30日）
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recentReviewsCount = reviews.filter(review => {
    const reviewDate = new Date(review.date);
    return reviewDate >= thirtyDaysAgo;
  }).length;

  // フィルターの適用
  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    
    let results = [...reviews];
    
    // 評価でフィルター
    if (newFilters.ratingFilter !== null) {
      results = results.filter(review => review.rating >= newFilters.ratingFilter!);
    }
    
    // 写真の有無でフィルター
    if (newFilters.photoFilter) {
      results = results.filter(review => 
        review.photoUrls && review.photoUrls.length > 0
      );
    }
    
    // 日付範囲でフィルター
    if (newFilters.dateRange.from !== null || newFilters.dateRange.to !== null) {
      results = results.filter(review => {
        const reviewDate = new Date(review.date);
        let isInRange = true;
        
        if (newFilters.dateRange.from !== null) {
          const fromDate = new Date(newFilters.dateRange.from);
          isInRange = isInRange && reviewDate >= fromDate;
        }
        
        if (newFilters.dateRange.to !== null) {
          const toDate = new Date(newFilters.dateRange.to);
          toDate.setHours(23, 59, 59, 999); // その日の終わりまで
          isInRange = isInRange && reviewDate <= toDate;
        }
        
        return isInRange;
      });
    }
    
    // 検索語でフィルター
    if (newFilters.searchTerm) {
      const searchLower = newFilters.searchTerm.toLowerCase();
      results = results.filter(review => 
        review.comment.toLowerCase().includes(searchLower) ||
        review.userName.toLowerCase().includes(searchLower) ||
        (review.experienceTitle && review.experienceTitle.toLowerCase().includes(searchLower))
      );
    }
    
    // 並べ替え
    switch (newFilters.sortBy) {
      case 'newest':
        results.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        break;
      case 'highest':
        results.sort((a, b) => b.rating - a.rating);
        break;
      case 'lowest':
        results.sort((a, b) => a.rating - b.rating);
        break;
      case 'most_helpful':
        results.sort((a, b) => (b.helpfulCount || 0) - (a.helpfulCount || 0));
        break;
      case 'most_photos':
        results.sort((a, b) => 
          ((b.photoUrls?.length || 0) - (a.photoUrls?.length || 0))
        );
        break;
      default:
        break;
    }
    
    setFilteredReviews(results);
  };

  // ローディング状態
  if (isLoading) {
    return (
      <div className="py-10 flex justify-center items-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-8 w-8 bg-gray-200 rounded-full mb-2"></div>
          <div className="h-4 w-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  // エラー状態
  if (error) {
    return (
      <div className="py-6 text-center">
        <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
        <p className="text-gray-700">{error}</p>
        <button 
          className="mt-4 px-4 py-2 bg-gray-100 rounded-lg text-sm font-medium hover:bg-gray-200"
          onClick={() => handleFilterChange(filters)}
        >
          再試行
        </button>
      </div>
    );
  }

  // レビューがない場合
  if (reviews.length === 0) {
    return (
      <div className="py-10 text-center">
        <MessageSquare className="h-8 w-8 text-gray-400 mx-auto mb-2" />
        <p className="text-gray-500">レビューはまだありません</p>
        {attenderId && (
          <p className="text-sm text-gray-400 mt-1">
            このアテンダーとの体験後にレビューを投稿できます
          </p>
        )}
      </div>
    );
  }

  return (
    <div>
      {/* フィルター */}
      {showFilters && reviews.length > 0 && (
        <ReviewFilters
          onFilterChange={handleFilterChange}
          totalReviews={reviews.length}
          reviewCounts={reviewCounts}
          photoReviewsCount={photoReviewsCount}
          recentReviewsCount={recentReviewsCount}
        />
      )}
      
      {/* レビュー数表示 */}
      <div className="mb-4 text-sm text-gray-600">
        {filteredReviews.length} 件のレビュー
        {filters.searchTerm || filters.ratingFilter !== null || filters.photoFilter || filters.dateRange.from !== null || filters.dateRange.to !== null
          ? ` (全${reviews.length}件中)`
          : ''
        }
      </div>
      
      {/* フィルター結果がない場合 */}
      {filteredReviews.length === 0 && (
        <div className="py-6 text-center border-t border-gray-200">
          <p className="text-gray-500">条件に一致するレビューはありません</p>
          <button
            onClick={() => handleFilterChange({
              ratingFilter: null,
              photoFilter: null,
              dateRange: { from: null, to: null },
              searchTerm: '',
              sortBy: 'newest'
            })}
            className="mt-2 text-sm text-black hover:underline"
          >
            フィルターをクリア
          </button>
        </div>
      )}
      
      {/* レビューリスト */}
      <div className="space-y-6">
        {filteredReviews.map(review => (
          <ReviewCard
            key={review.id}
            review={review}
            onHelpfulToggle={onHelpfulToggle}
          />
        ))}
      </div>
      
      {/* ページネーション (将来的な機能として) */}
      {filteredReviews.length > 10 && (
        <div className="mt-8 flex justify-center">
          <div className="inline-flex items-center justify-center space-x-1">
            <button className="px-3 py-1 rounded-md border border-gray-300 text-sm hover:bg-gray-50">前へ</button>
            <button className="px-3 py-1 rounded-md bg-black text-white text-sm">1</button>
            <button className="px-3 py-1 rounded-md border border-gray-300 text-sm hover:bg-gray-50">2</button>
            <button className="px-3 py-1 rounded-md border border-gray-300 text-sm hover:bg-gray-50">3</button>
            <span className="text-gray-500">...</span>
            <button className="px-3 py-1 rounded-md border border-gray-300 text-sm hover:bg-gray-50">次へ</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewsList;