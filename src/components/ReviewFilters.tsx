import React, { useState } from 'react';
import { Search, Star, Filter, X } from 'lucide-react';

interface ReviewFiltersProps {
  onFilterChange: (filters: FilterState) => void;
  totalReviews: number;
  reviewCounts: number[]; // 各評価のレビュー数 [5星の数, 4星の数, ...]
}

export interface FilterState {
  ratingFilter: number | null;
  searchTerm: string;
  sortBy: 'newest' | 'highest' | 'lowest' | 'helpful';
}

const ReviewFilters: React.FC<ReviewFiltersProps> = ({ 
  onFilterChange, 
  totalReviews,
  reviewCounts 
}) => {
  const [ratingFilter, setRatingFilter] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'highest' | 'lowest' | 'helpful'>('newest');
  const [filtersExpanded, setFiltersExpanded] = useState(false);

  // フィルター変更時に親コンポーネントに通知
  const applyFilters = (
    newRating: number | null = ratingFilter,
    newSearchTerm: string = searchTerm,
    newSortBy: 'newest' | 'highest' | 'lowest' | 'helpful' = sortBy
  ) => {
    onFilterChange({
      ratingFilter: newRating,
      searchTerm: newSearchTerm,
      sortBy: newSortBy
    });
  };

  // 評価フィルターの変更処理
  const handleRatingFilter = (rating: number) => {
    const newRating = ratingFilter === rating ? null : rating;
    setRatingFilter(newRating);
    applyFilters(newRating);
  };

  // 検索語の変更処理
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    applyFilters(ratingFilter, e.target.value);
  };

  // ソート方法の変更処理
  const handleSortChange = (newSortBy: 'newest' | 'highest' | 'lowest' | 'helpful') => {
    setSortBy(newSortBy);
    applyFilters(ratingFilter, searchTerm, newSortBy);
  };

  // フィルターをリセット
  const resetFilters = () => {
    setRatingFilter(null);
    setSearchTerm('');
    applyFilters(null, '');
  };

  return (
    <div className="bg-white rounded-lg shadow-sm mb-4">
      {/* 検索バー */}
      <div className="relative mb-3">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search size={18} className="text-gray-400" />
        </div>
        <input
          type="text"
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-black focus:border-black"
          placeholder="レビュー内を検索..."
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </div>

      {/* フィルターとソートのヘッダー */}
      <div className="flex justify-between items-center">
        <button
          onClick={() => setFiltersExpanded(!filtersExpanded)}
          className="flex items-center text-gray-700 hover:text-black"
        >
          <Filter size={18} className="mr-1" />
          <span className="text-sm font-medium">フィルター</span>
          {ratingFilter && (
            <span className="ml-2 bg-black text-white text-xs rounded-full px-2 py-0.5">
              {ratingFilter}★
            </span>
          )}
        </button>

        <div className="flex items-center">
          <span className="text-sm text-gray-500 mr-2">並び替え:</span>
          <select
            value={sortBy}
            onChange={(e) => handleSortChange(e.target.value as any)}
            className="text-sm border-gray-300 rounded-lg focus:ring-black focus:border-black"
          >
            <option value="newest">新しい順</option>
            <option value="highest">高評価順</option>
            <option value="lowest">低評価順</option>
            <option value="helpful">役立つ順</option>
          </select>
        </div>
      </div>

      {/* 拡張フィルター */}
      {filtersExpanded && (
        <div className="mt-3 pt-3 border-t">
          <p className="text-sm font-medium mb-2">評価でフィルター:</p>
          <div className="flex flex-wrap gap-2">
            {[5, 4, 3, 2, 1].map((rating) => (
              <button
                key={rating}
                onClick={() => handleRatingFilter(rating)}
                className={`flex items-center px-3 py-1.5 rounded-lg border ${
                  ratingFilter === rating
                    ? 'bg-black text-white border-black'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                <span className="mr-1">{rating}</span>
                <Star size={14} fill={ratingFilter === rating ? 'white' : 'none'} />
                <span className="ml-1 text-xs">({reviewCounts[5 - rating]})</span>
              </button>
            ))}
            
            {ratingFilter && (
              <button
                onClick={resetFilters}
                className="text-sm text-gray-700 hover:text-black underline"
              >
                リセット
              </button>
            )}
          </div>
          
          <div className="mt-2 text-xs text-gray-500">
            {totalReviews}件中 
            {(ratingFilter || searchTerm) 
              ? <span className="font-medium"> フィルター適用中</span> 
              : <span> すべて表示</span>
            }
          </div>
        </div>
      )}

      {/* アクティブなフィルターの表示 */}
      {(searchTerm || ratingFilter) && (
        <div className="mt-3 pt-3 border-t flex items-center justify-between">
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs text-gray-600">適用中:</span>
            
            {ratingFilter && (
              <div className="flex items-center bg-gray-100 px-2 py-1 rounded text-xs">
                <span>{ratingFilter}★のみ</span>
                <button 
                  onClick={() => {
                    setRatingFilter(null);
                    applyFilters(null);
                  }}
                  className="ml-1 text-gray-400 hover:text-gray-600"
                >
                  <X size={12} />
                </button>
              </div>
            )}
            
            {searchTerm && (
              <div className="flex items-center bg-gray-100 px-2 py-1 rounded text-xs">
                <span>「{searchTerm}」</span>
                <button 
                  onClick={() => {
                    setSearchTerm('');
                    applyFilters(ratingFilter, '');
                  }}
                  className="ml-1 text-gray-400 hover:text-gray-600"
                >
                  <X size={12} />
                </button>
              </div>
            )}
          </div>
          
          <button 
            onClick={resetFilters}
            className="text-xs text-black hover:underline"
          >
            すべてクリア
          </button>
        </div>
      )}
    </div>
  );
};

export default ReviewFilters;