// src/components/ReviewFilters.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Search, Filter, Star, ChevronDown, X, Clock, Calendar, User, SlidersHorizontal, Image as ImageIcon } from 'lucide-react';

export interface FilterState {
  ratingFilter: number | null;
  photoFilter: boolean | null;
  dateRange: {
    from: string | null;
    to: string | null;
  };
  searchTerm: string;
  sortBy: string;
}

interface ReviewFiltersProps {
  onFilterChange: (filters: FilterState) => void;
  totalReviews: number;
  reviewCounts: number[];
  photoReviewsCount: number;
  recentReviewsCount: number;
}

const ReviewFilters: React.FC<ReviewFiltersProps> = ({ 
  onFilterChange, 
  totalReviews, 
  reviewCounts,
  photoReviewsCount = 0,
  recentReviewsCount = 0
}) => {
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
  
  const [showFilters, setShowFilters] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const filterRef = useRef<HTMLDivElement>(null);
  
  // 画面サイズの変更を検知
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // フィルターパネル外のクリックを検知して閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node) && showFilters) {
        setShowFilters(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showFilters]);
  
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
  
  // 写真フィルターの変更を処理
  const handlePhotoFilter = () => {
    const newFilters = {
      ...filters,
      photoFilter: filters.photoFilter === true ? null : true
    };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };
  
  // 日付範囲フィルターの変更を処理
  const handleDateRangeChange = (field: 'from' | 'to', value: string) => {
    const newFilters = {
      ...filters,
      dateRange: {
        ...filters.dateRange,
        [field]: value || null
      }
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
  
  // 特定のフィルターをクリア
  const clearFilter = (filterName: 'ratingFilter' | 'photoFilter' | 'dateRange' | 'searchTerm') => {
    let newFilters: FilterState;
    
    if (filterName === 'dateRange') {
      newFilters = {
        ...filters,
        dateRange: { from: null, to: null }
      };
    } else {
      newFilters = {
        ...filters,
        [filterName]: filterName === 'searchTerm' ? '' : null
      };
    }
    
    setFilters(newFilters);
    onFilterChange(newFilters);
  };
  
  // すべてのフィルターをクリア
  const clearAllFilters = () => {
    const newFilters: FilterState = {
      ratingFilter: null,
      photoFilter: null,
      dateRange: {
        from: null,
        to: null
      },
      searchTerm: '',
      sortBy: 'newest'
    };
    setFilters(newFilters);
    onFilterChange(newFilters);
    setShowFilters(false);
  };
  
  // 最近のレビューのみを表示（過去30日）
  const showRecentReviews = () => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const formattedDate = thirtyDaysAgo.toISOString().split('T')[0];
    
    const newFilters: FilterState = {
      ...filters,
      dateRange: {
        from: formattedDate,
        to: null
      }
    };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };
  
  // フィルターが適用されているかどうか
  const hasActiveFilters = filters.ratingFilter !== null || 
                          filters.photoFilter !== null || 
                          filters.dateRange.from !== null || 
                          filters.dateRange.to !== null || 
                          filters.searchTerm !== '';
  
  return (
    <div className="mb-6" ref={filterRef}>
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
          aria-label="レビューを検索"
        />
      </div>
      
      {/* フィルターヘッダー */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex space-x-2 items-center">
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center space-x-1 text-sm font-medium px-3 py-1.5 rounded-full ${
              hasActiveFilters 
                ? 'bg-black text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            aria-expanded={showFilters}
            aria-controls="filter-panel"
          >
            <Filter size={16} />
            <span>フィルター{hasActiveFilters ? '適用中' : ''}</span>
            <ChevronDown size={14} className={`transform transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
          
          {isMobile && (
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="flex items-center space-x-1 text-sm font-medium px-3 py-1.5 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200"
              aria-expanded={showAdvancedFilters}
              aria-controls="advanced-filter-panel"
            >
              <SlidersHorizontal size={16} />
            </button>
          )}
          
          {/* クイックフィルターオプション（デスクトップ） */}
          {!isMobile && (
            <>
              <button
                onClick={() => handleRatingFilter(4)}
                className={`text-sm px-3 py-1.5 rounded-full ${
                  filters.ratingFilter === 4 
                    ? 'bg-black text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span className="flex items-center">
                  4<Star size={12} className="text-yellow-500 fill-current ml-0.5" />以上
                </span>
              </button>
              
              <button
                onClick={handlePhotoFilter}
                className={`text-sm px-3 py-1.5 rounded-full ${
                  filters.photoFilter 
                    ? 'bg-black text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span className="flex items-center">
                  写真付き ({photoReviewsCount})
                </span>
              </button>
              
              <button
                onClick={showRecentReviews}
                className={`text-sm px-3 py-1.5 rounded-full ${
                  filters.dateRange.from !== null 
                    ? 'bg-black text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span className="flex items-center">
                  <Clock size={12} className="mr-0.5" />
                  最近の投稿 ({recentReviewsCount})
                </span>
              </button>
            </>
          )}
        </div>
        
        <div className="flex items-center">
          <label className="text-sm text-gray-700 mr-2 hidden sm:inline">並べ替え: </label>
          <select
            className="p-1 border border-gray-300 rounded-md text-sm"
            value={filters.sortBy}
            onChange={handleSortChange}
            aria-label="並べ替え方法の選択"
          >
            <option value="newest">最新順</option>
            <option value="highest">評価の高い順</option>
            <option value="lowest">評価の低い順</option>
            <option value="most_helpful">参考になった順</option>
            <option value="most_photos">写真の多い順</option>
          </select>
        </div>
      </div>
      
      {/* 展開可能なフィルターパネル */}
      {showFilters && (
        <div id="filter-panel" className="bg-gray-50 p-4 rounded-lg mb-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-medium">レビューをフィルター</h3>
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="text-sm text-black hover:underline"
              >
                すべてクリア
              </button>
            )}
          </div>
          
          <div className="space-y-4">
            {/* 評価フィルター */}
            <div>
              <h4 className="text-sm font-medium mb-2">評価</h4>
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => handleRatingFilter(rating)}
                    className={`w-full flex items-center justify-between p-2 rounded-md ${
                      filters.ratingFilter === rating ? 'bg-gray-200' : 'hover:bg-gray-100'
                    }`}
                    aria-pressed={filters.ratingFilter === rating}
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
            
            {/* 写真フィルター */}
            <div>
              <h4 className="text-sm font-medium mb-2">写真</h4>
              <button
                onClick={handlePhotoFilter}
                className={`w-full flex items-center justify-between p-2 rounded-md ${
                  filters.photoFilter ? 'bg-gray-200' : 'hover:bg-gray-100'
                }`}
                aria-pressed={filters.photoFilter === true}
              >
                <div className="flex items-center">
                  <ImageIcon size={16} className="mr-2 text-gray-700" />
                  <span>写真付きレビューのみ</span>
                </div>
                <span className="text-sm text-gray-500">
                  {photoReviewsCount} ({totalReviews > 0 ? Math.round((photoReviewsCount / totalReviews) * 100) : 0}%)
                </span>
              </button>
            </div>
            
            {/* 日付フィルター */}
            <div>
              <h4 className="text-sm font-medium mb-2">期間</h4>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label htmlFor="date-from" className="block text-xs text-gray-500 mb-1">開始日</label>
                  <input
                    type="date"
                    id="date-from"
                    className="w-full p-2 border border-gray-300 rounded-md text-sm"
                    value={filters.dateRange.from || ''}
                    onChange={(e) => handleDateRangeChange('from', e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="date-to" className="block text-xs text-gray-500 mb-1">終了日</label>
                  <input
                    type="date"
                    id="date-to"
                    className="w-full p-2 border border-gray-300 rounded-md text-sm"
                    value={filters.dateRange.to || ''}
                    onChange={(e) => handleDateRangeChange('to', e.target.value)}
                    min={filters.dateRange.from || undefined}
                  />
                </div>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                <button
                  onClick={showRecentReviews}
                  className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-full"
                >
                  過去30日
                </button>
                <button
                  onClick={() => {
                    const sixMonthsAgo = new Date();
                    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
                    handleDateRangeChange('from', sixMonthsAgo.toISOString().split('T')[0]);
                  }}
                  className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-full"
                >
                  過去6ヶ月
                </button>
                <button
                  onClick={() => {
                    const oneYearAgo = new Date();
                    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
                    handleDateRangeChange('from', oneYearAgo.toISOString().split('T')[0]);
                  }}
                  className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-full"
                >
                  過去1年
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* モバイル用の詳細設定フィルター */}
      {isMobile && showAdvancedFilters && (
        <div id="advanced-filter-panel" className="bg-gray-50 p-4 rounded-lg mb-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-medium">詳細条件</h3>
            <button
              onClick={() => setShowAdvancedFilters(false)}
              className="text-sm text-black"
            >
              <X size={16} />
            </button>
          </div>
          
          <div className="space-y-3">
            <button
              onClick={() => handleRatingFilter(4)}
              className={`w-full flex items-center justify-between p-2 rounded-md ${
                filters.ratingFilter === 4 ? 'bg-gray-200' : 'hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center">
                <span>4</span>
                <Star size={16} className="text-yellow-500 fill-current mx-1" />
                <span>以上の評価</span>
              </div>
              <ChevronDown size={16} className={filters.ratingFilter === 4 ? 'transform rotate-180' : ''} />
            </button>
            
            <button
              onClick={handlePhotoFilter}
              className={`w-full flex items-center justify-between p-2 rounded-md ${
                filters.photoFilter ? 'bg-gray-200' : 'hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center">
                <ImageIcon size={16} className="mr-2" />
                <span>写真付き ({photoReviewsCount})</span>
              </div>
              <ChevronDown size={16} className={filters.photoFilter ? 'transform rotate-180' : ''} />
            </button>
            
            <button
              onClick={showRecentReviews}
              className={`w-full flex items-center justify-between p-2 rounded-md ${
                filters.dateRange.from !== null ? 'bg-gray-200' : 'hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center">
                <Clock size={16} className="mr-2" />
                <span>最近の投稿 ({recentReviewsCount})</span>
              </div>
              <ChevronDown size={16} className={filters.dateRange.from !== null ? 'transform rotate-180' : ''} />
            </button>
          </div>
        </div>
      )}
      
      {/* アクティブなフィルター表示 */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center text-sm mb-4 gap-2">
          <span className="text-gray-700">適用中のフィルター:</span>
          {filters.ratingFilter !== null && (
            <div className="px-2 py-1 bg-gray-200 rounded-full flex items-center">
              <span>{filters.ratingFilter}</span>
              <Star size={12} className="text-yellow-500 fill-current mx-1" />
              <span>以上</span>
              <button
                onClick={() => clearFilter('ratingFilter')}
                className="ml-1 text-gray-500 hover:text-gray-700"
                aria-label="評価フィルターを解除"
              >
                <X size={12} />
              </button>
            </div>
          )}
          {filters.photoFilter && (
            <div className="px-2 py-1 bg-gray-200 rounded-full flex items-center">
              <span>写真付き</span>
              <button
                onClick={() => clearFilter('photoFilter')}
                className="ml-1 text-gray-500 hover:text-gray-700"
                aria-label="写真フィルターを解除"
              >
                <X size={12} />
              </button>
            </div>
          )}
          {(filters.dateRange.from !== null || filters.dateRange.to !== null) && (
            <div className="px-2 py-1 bg-gray-200 rounded-full flex items-center">
              <Calendar size={12} className="mr-1" />
              <span>
                {filters.dateRange.from ? new Date(filters.dateRange.from).toLocaleDateString() : ''}
                {filters.dateRange.from && filters.dateRange.to ? ' 〜 ' : ''}
                {filters.dateRange.to ? new Date(filters.dateRange.to).toLocaleDateString() : ''}
              </span>
              <button
                onClick={() => clearFilter('dateRange')}
                className="ml-1 text-gray-500 hover:text-gray-700"
                aria-label="日付フィルターを解除"
              >
                <X size={12} />
              </button>
            </div>
          )}
          {filters.searchTerm && (
            <div className="px-2 py-1 bg-gray-200 rounded-full flex items-center">
              <span>「{filters.searchTerm}」</span>
              <button
                onClick={() => clearFilter('searchTerm')}
                className="ml-1 text-gray-500 hover:text-gray-700"
                aria-label="検索フィルターを解除"
              >
                <X size={12} />
              </button>
            </div>
          )}
          <button
            onClick={clearAllFilters}
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