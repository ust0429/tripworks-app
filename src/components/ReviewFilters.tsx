import React from 'react';

interface Experience {
  id: string;
  title: string;
}

// 元のFiltersProps定義を残しつつ、既存の使用しているFilterState型を追加
export interface FilterState {
  ratingFilter: number | null;
  photoFilter: boolean | null;
  dateRange: {
    from: string | null;
    to: string | null;
  };
  searchTerm: string;
  sortBy: string;
  // 新しい定義に合わせた追加プロパティ（併用できるように）
  rating?: number | null;
  experience?: string | null;
  period?: 'all' | 'month' | 'week' | 'day';
  withPhotos?: boolean;
  withReplies?: boolean;
  noReplies?: boolean;
}

interface FiltersProps {
  filters: FilterState;
  experiences: Experience[];
  onFilterChange: (newFilters: Partial<FilterState>) => void;
  onResetFilters: () => void;
  // ReviewsList.tsxで使用されている追加のprops
  totalReviews?: number;
  reviewCounts?: number[];
  photoReviewsCount?: number;
  recentReviewsCount?: number;
}

const ReviewFilters: React.FC<FiltersProps> = ({
  filters,
  experiences,
  onFilterChange,
  onResetFilters
}) => {
  // 重複を除去した体験リスト
  const uniqueExperiences = experiences.filter(
    (experience, index, self) =>
      index === self.findIndex((e) => e.id === experience.id)
  );

  return (
    <div className="bg-gray-50 p-4 rounded-lg mb-4">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-medium text-gray-700">フィルター</h4>
        <button
          type="button"
          onClick={onResetFilters}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          リセット
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 評価フィルター */}
        <div>
          <label
            htmlFor="rating-filter"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            評価
          </label>
          <select
            id="rating-filter"
            className="block w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            value={filters.rating === null ? '' : filters.rating}
            onChange={(e) =>
              onFilterChange({
                rating: e.target.value === '' ? null : Number(e.target.value)
              })
            }
          >
            <option value="">すべての評価</option>
            <option value="5">5つ星</option>
            <option value="4">4つ星</option>
            <option value="3">3つ星</option>
            <option value="2">2つ星</option>
            <option value="1">1つ星</option>
          </select>
        </div>

        {/* 体験フィルター */}
        <div>
          <label
            htmlFor="experience-filter"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            体験
          </label>
          <select
            id="experience-filter"
            className="block w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            value={filters.experience === null ? '' : filters.experience}
            onChange={(e) =>
              onFilterChange({
                experience: e.target.value === '' ? null : e.target.value
              })
            }
          >
            <option value="">すべての体験</option>
            {uniqueExperiences.map((exp) => (
              <option key={exp.id} value={exp.id}>
                {exp.title}
              </option>
            ))}
          </select>
        </div>

        {/* 期間フィルター */}
        <div>
          <label
            htmlFor="period-filter"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            期間
          </label>
          <select
            id="period-filter"
            className="block w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            value={filters.period}
            onChange={(e) =>
              onFilterChange({
                period: e.target.value as 'all' | 'month' | 'week' | 'day'
              })
            }
          >
            <option value="all">すべての期間</option>
            <option value="month">過去1ヶ月</option>
            <option value="week">過去1週間</option>
            <option value="day">過去24時間</option>
          </select>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-4">
        {/* 写真付きフィルター */}
        <label className="inline-flex items-center">
          <input
            type="checkbox"
            className="form-checkbox h-4 w-4 text-blue-600 rounded"
            checked={filters.withPhotos}
            onChange={(e) =>
              onFilterChange({ withPhotos: e.target.checked })
            }
          />
          <span className="ml-2 text-sm text-gray-700">写真付きのみ</span>
        </label>

        {/* 返信済みフィルター */}
        <label className="inline-flex items-center">
          <input
            type="checkbox"
            className="form-checkbox h-4 w-4 text-blue-600 rounded"
            checked={filters.withReplies}
            onChange={(e) =>
              onFilterChange({
                withReplies: e.target.checked,
                // 排他的な選択にするため、片方をチェックしたら他方を解除
                noReplies: e.target.checked ? false : filters.noReplies
              })
            }
          />
          <span className="ml-2 text-sm text-gray-700">返信済みのみ</span>
        </label>

        {/* 未返信フィルター */}
        <label className="inline-flex items-center">
          <input
            type="checkbox"
            className="form-checkbox h-4 w-4 text-blue-600 rounded"
            checked={filters.noReplies}
            onChange={(e) =>
              onFilterChange({
                noReplies: e.target.checked,
                // 排他的な選択にするため、片方をチェックしたら他方を解除
                withReplies: e.target.checked ? false : filters.withReplies
              })
            }
          />
          <span className="ml-2 text-sm text-gray-700">未返信のみ</span>
        </label>
      </div>
    </div>
  );
};

export default ReviewFilters;
