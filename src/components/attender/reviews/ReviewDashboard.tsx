import React, { useState, useEffect } from 'react';
import { UUID } from '../../../types/attender';
import { Review, ReviewSummary } from '../../../types/review';
import { getAttenderReviews, getReviewSummary } from '../../../services/reviewService';
import ReviewsTable from './ReviewsTable';
import ReviewStats from './ReviewStats';
import { FilterState } from '../../ReviewFilters';
import ReviewFilters from '../../ReviewFilters';

interface ReviewDashboardProps {
  attenderId: UUID;
}

// レビューソート用の型
type SortField = 'date' | 'rating' | 'experience';
type SortOrder = 'asc' | 'desc';

// フィルタリングオプション
interface FilterOptions {
  rating: number | null;
  experience: string | null;
  period: 'all' | 'month' | 'week' | 'day';
  withPhotos: boolean;
  withReplies: boolean;
  noReplies: boolean;
}

const ReviewDashboard: React.FC<ReviewDashboardProps> = ({ attenderId }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [filteredReviews, setFilteredReviews] = useState<Review[]>([]);
  const [summary, setSummary] = useState<ReviewSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // ソートとフィルタリングの状態
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [filters, setFilters] = useState<FilterState>({
    rating: null,
    experience: null,
    period: 'all',
    withPhotos: false,
    withReplies: false,
    noReplies: false,
    ratingFilter: null,
    photoFilter: null,
    dateRange: { from: null, to: null },
    searchTerm: '',
    sortBy: 'newest'
  });

  // レビューデータの取得
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // レビュー一覧の取得
        const reviewsData = await getAttenderReviews(attenderId);
        setReviews(reviewsData);
        
        // レビュー統計の取得
        const summaryData = await getReviewSummary(attenderId);
        setSummary(summaryData);
        
        setError(null);
      } catch (err) {
        console.error('Failed to fetch review data:', err);
        setError('レビューデータの取得に失敗しました。');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [attenderId]);

  // フィルタとソートが変更されたときにレビューをフィルタリング
  useEffect(() => {
    if (!reviews.length) return;

    let result = [...reviews];

    // フィルターの適用
    if (filters.rating !== null) {
      result = result.filter(review => Math.floor(review.rating) === filters.rating);
    }

    if (filters.experience !== null) {
      result = result.filter(review => review.experienceId === filters.experience);
    }

    if (filters.period && filters.period !== 'all') {
      const now = new Date();
      const periodMap: Record<string, number> = {
        day: 1,
        week: 7,
        month: 30
      };
      
      // filters.periodがnullの場合の対策
      const days = periodMap[filters.period] || 30; // デフォルトは30日
      const cutoffDate = new Date(now.setDate(now.getDate() - days));
      
      result = result.filter(review => new Date(review.createdAt) >= cutoffDate);
    }

    if (filters.withPhotos) {
      result = result.filter(review => review.photos && review.photos.length > 0);
    }

    if (filters.withReplies) {
      result = result.filter(review => review.attenderReply !== null);
    }

    if (filters.noReplies) {
      result = result.filter(review => review.attenderReply === null);
    }

    // ソートの適用
    result.sort((a, b) => {
      if (sortField === 'date') {
        return sortOrder === 'asc'
          ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      
      if (sortField === 'rating') {
        return sortOrder === 'asc'
          ? a.rating - b.rating
          : b.rating - a.rating;
      }
      
      if (sortField === 'experience') {
        return sortOrder === 'asc'
          ? a.experienceTitle.localeCompare(b.experienceTitle)
          : b.experienceTitle.localeCompare(a.experienceTitle);
      }
      
      return 0;
    });

    setFilteredReviews(result);
  }, [reviews, filters, sortField, sortOrder]);

  // ソート変更ハンドラー
  const handleSortChange = (field: SortField) => {
    // 同じフィールドをクリックした場合は順序を反転
    if (field === sortField) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc'); // 新しいフィールドでは降順から始める
    }
  };

  // フィルター変更ハンドラー
  const handleFilterChange = (newFilters: Partial<FilterState>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  // フィルターリセットハンドラー
  const handleResetFilters = () => {
    setFilters({
      rating: null,
      experience: null,
      period: 'all',
      withPhotos: false,
      withReplies: false,
      noReplies: false,
      ratingFilter: null,
      photoFilter: null,
      dateRange: { from: null, to: null },
      searchTerm: '',
      sortBy: 'newest'
    });
  };

  // レビュー返信ハンドラー
  const handleReplySubmit = async (reviewId: string, replyText: string) => {
    try {
      // TODO: 実際のAPIを叩いてレビュー返信を保存する処理
      // const updatedReview = await reviewService.submitReply(reviewId, replyText);
      
      // レビューデータの更新（モック）
      const updatedReviews = reviews.map(review => {
        if (review.id === reviewId) {
          return {
            ...review,
            attenderReply: {
              id: `reply-${Date.now()}`,
              text: replyText,
              createdAt: new Date().toISOString()
            }
          };
        }
        return review;
      });
      
      setReviews(updatedReviews);
      
      return true;
    } catch (error) {
      console.error('Failed to submit reply:', error);
      return false;
    }
  };

  if (loading && !reviews.length) {
    return <div className="p-4 text-center">ロード中...</div>;
  }

  if (error && !reviews.length) {
    return <div className="p-4 text-red-500 text-center">{error}</div>;
  }

  const totalReviews = reviews.length;
  const filteredCount = filteredReviews.length;

  return (
    <div className="space-y-6">
      {summary && <ReviewStats summary={summary} />}
      
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-lg font-semibold mb-4">レビュー一覧</h3>
        
        <ReviewFilters
          filters={filters}
          experiences={Array.from(new Set(reviews.map(r => ({ id: r.experienceId, title: r.experienceTitle }))))}
          onFilterChange={handleFilterChange}
          onResetFilters={handleResetFilters}
        />
        
        <div className="mt-4 mb-2 text-sm text-gray-600">
          {filteredCount === totalReviews
            ? `全 ${totalReviews} 件のレビュー`
            : `${filteredCount} / ${totalReviews} 件のレビューを表示中`}
        </div>
        
        <ReviewsTable
          reviews={filteredReviews}
          sortField={sortField}
          sortOrder={sortOrder}
          onSortChange={handleSortChange}
          onReplySubmit={handleReplySubmit}
        />
      </div>
    </div>
  );
};

export default ReviewDashboard;
