// src/components/ReviewFilters.tsx
import React, { useState } from 'react';
import { Search, Filter, Star } from 'lucide-react';

export interface FilterState {
  ratingFilter: number | null;
  searchTerm: string;
  sortBy: string;
}

interface ReviewFiltersProps {
  onFilterChange: (filters: FilterState) => void;
  totalReviews: number;
  reviewCounts: number[];
}

const ReviewFilters: React.FC<ReviewFiltersProps> = ({ 
  onFilterChange, 
  totalReviews, 
  reviewCounts 
}) => {
  const [filters, setFilters] = useState<FilterState>({
    ratingFilter: null,
    searchTerm: '',
    sortBy: 'newest'
  });
  
  const [showFilters, setShowFilters] = useState(false);
  
  // 検索語の変更を処理
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFilters = {
      ...filters,
      searchTerm: e.target.value
    };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };
  
  // 評価フィルターの変更を処理
  const handleRatingFilter = (rating: number | null) => {
    const newFilters = {
      ...filters,
      ratingFilter: filters.ratingFilter === rating ? null : rating
    };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };
  
  // ソート方法の変更を処理
  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newFilters = {
      ...filters,
      sortBy: e.target.value
    };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };
  
  return (
    <div className="mb-6">
      {/* 検索バー */}
      <div className="relative mb-4">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search size={18} className="text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="レビューを検索"
          className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-gray-500 focus:border-gray-500"
          value={filters.searchTerm}
          onChange={handleSearchChange}
        />
      </div>
      
      {/* フィルターヘッダー */}
      <div className="flex justify-between items-center mb-4">
        <button 
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center space-x-1 text-sm font-medium text-gray-700"
        >
          <Filter size={16} />
          <span>フィルター</span>
        </button>
        
        <div className="flex items-center">
          <label className="text-sm text-gray-700 mr-2">並べ替え: </label>
          <select
            className="p-1 border border-gray-300 rounded-md text-sm"
            value={filters.sortBy}
            onChange={handleSortChange}
          >
            <option value="newest">最新順</option>
            <option value="highest">評価の高い順</option>
            <option value="lowest">評価の低い順</option>
            <option value="most_helpful">参考になった順</option>
          </select>
        </div>
      </div>
      
      {/* 展開可能なフィルターパネル */}
      {showFilters && (
        <div className="bg-gray-50 p-4 rounded-lg mb-4">
          <h3 className="font-medium mb-2">評価でフィルター</h3>
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((rating) => (
              <button
                key={rating}
                onClick={() => handleRatingFilter(rating)}
                className={`w-full flex items-center justify-between p-2 rounded-md ${
                  filters.ratingFilter === rating ? 'bg-gray-200' : 'hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center">
                  <span className="mr-2">{rating}</span>
                  <Star size={16} className="text-yellow-500 fill-current" />
                  <span className="ml-1">以上</span>
                </div>
                <span className="text-sm text-gray-500">
                  {reviewCounts[5 - rating]} ({totalReviews > 0 ? Math.round((reviewCounts[5 - rating] / totalReviews) * 100) : 0}%)
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* アクティブなフィルター表示 */}
      {(filters.ratingFilter !== null || filters.searchTerm) && (
        <div className="flex items-center text-sm mb-4">
          <span className="text-gray-700 mr-2">適用中のフィルター:</span>
          {filters.ratingFilter !== null && (
            <div className="px-2 py-1 bg-gray-200 rounded-full flex items-center mr-2">
              <span>{filters.ratingFilter}</span>
              <Star size={12} className="text-yellow-500 fill-current mx-1" />
              <span>以上</span>
              <button
                onClick={() => handleRatingFilter(filters.ratingFilter)}
                className="ml-1 text-gray-500 hover:text-gray-700"
              >
                &times;
              </button>
            </div>
          )}
          {filters.searchTerm && (
            <div className="px-2 py-1 bg-gray-200 rounded-full flex items-center">
              <span>「{filters.searchTerm}」</span>
              <button
                onClick={() => {
                  const newFilters = { ...filters, searchTerm: '' };
                  setFilters(newFilters);
                  onFilterChange(newFilters);
                }}
                className="ml-1 text-gray-500 hover:text-gray-700"
              >
                &times;
              </button>
            </div>
          )}
          <button
            onClick={() => {
              const newFilters = { ...filters, ratingFilter: null, searchTerm: '' };
              setFilters(newFilters);
              onFilterChange(newFilters);
            }}
            className="ml-auto text-black text-sm hover:underline"
          >
            クリア
          </button>
        </div>
      )}
    </div>
  );
};

export default ReviewFilters;