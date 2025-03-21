// src/components/explore/ExperienceSearch.tsx
import React, { useState, useEffect } from 'react';
import { Search, Sliders, Map as MapIcon, List, ArrowUpDown } from 'lucide-react';
import MapView from '../MapView';
import ExperienceCard from './ExperienceCard';
import { ExperienceFilters } from './ExperienceSearchFilters';
import { ExperienceType } from '../../types';

interface ExperienceSearchProps {
  experiences: ExperienceType[];
  onExperienceClick: (id: number) => void;
  onFilterOpen: () => void;
  location?: string;
  locationCoordinates?: [number, number]; // [longitude, latitude]
}

// ソートオプション
type SortOption = 'recommended' | 'price_low' | 'price_high' | 'rating' | 'distance';

const ExperienceSearch: React.FC<ExperienceSearchProps> = ({
  experiences,
  onExperienceClick,
  onFilterOpen,
  location = '東京',
  locationCoordinates = [139.7690, 35.6804], // 東京の座標をデフォルトに設定
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [sortBy, setSortBy] = useState<SortOption>('recommended');
  const [showSortOptions, setShowSortOptions] = useState(false);
  const [favorites, setFavorites] = useState<number[]>([]);

  // 検索クエリに基づいて体験をフィルタリング
  const filteredExperiences = experiences.filter(experience => {
    if (!searchQuery) return true;
    
    return (
      experience.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      experience.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // 体験をソート
  const sortedExperiences = [...filteredExperiences].sort((a, b) => {
    switch (sortBy) {
      case 'price_low':
        return a.price - b.price;
      case 'price_high':
        return b.price - a.price;
      case 'rating':
        // ここではランダムにソート（実際にはレーティングデータを使用）
        return Math.random() - 0.5;
      case 'distance':
        // ここではランダムにソート（実際には距離データを使用）
        return Math.random() - 0.5;
      case 'recommended':
      default:
        // ここではランダムにソート（実際にはレコメンデーションスコアを使用）
        return Math.random() - 0.5;
    }
  });

  // お気に入りの切り替え
  const handleFavoriteToggle = (id: number) => {
    if (favorites.includes(id)) {
      setFavorites(favorites.filter(favId => favId !== id));
    } else {
      setFavorites([...favorites, id]);
    }
  };

  // ソートラベルを取得
  const getSortLabel = (option: SortOption): string => {
    switch (option) {
      case 'recommended':
        return 'おすすめ順';
      case 'price_low':
        return '料金の安い順';
      case 'price_high':
        return '料金の高い順';
      case 'rating':
        return '評価の高い順';
      case 'distance':
        return '近い順';
      default:
        return 'おすすめ順';
    }
  };

  return (
    <div className="space-y-4">
      {/* 検索バー */}
      <div className="sticky top-0 bg-white z-10 pt-2 pb-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={20} className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="体験を検索..."
            className="w-full pl-10 pr-14 py-3 bg-gray-100 border-none rounded-full focus:outline-none focus:ring-2 focus:ring-gray-400"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <button
              onClick={onFilterOpen}
              className="p-1 rounded-full hover:bg-gray-200"
              aria-label="フィルター"
            >
              <Sliders size={20} className="text-gray-500" />
            </button>
          </div>
        </div>
      </div>
      
      {/* 表示切替・並び替え */}
      <div className="flex justify-between items-center">
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-1.5 rounded-md flex items-center text-sm ${
              viewMode === 'list' ? 'bg-white shadow-sm' : 'text-gray-500'
            }`}
          >
            <List size={16} className="mr-1" />
            リスト
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={`px-3 py-1.5 rounded-md flex items-center text-sm ${
              viewMode === 'map' ? 'bg-white shadow-sm' : 'text-gray-500'
            }`}
          >
            <MapIcon size={16} className="mr-1" />
            地図
          </button>
        </div>
        
        <div className="relative">
          <button
            onClick={() => setShowSortOptions(!showSortOptions)}
            className="flex items-center text-sm bg-gray-100 px-3 py-1.5 rounded-md"
          >
            <ArrowUpDown size={14} className="mr-1" />
            {getSortLabel(sortBy)}
          </button>
          
          {showSortOptions && (
            <div className="absolute right-0 mt-1 bg-white rounded-lg shadow-lg overflow-hidden z-20 w-48">
              {(['recommended', 'price_low', 'price_high', 'rating', 'distance'] as SortOption[]).map((option) => (
                <button
                  key={option}
                  onClick={() => {
                    setSortBy(option);
                    setShowSortOptions(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                    sortBy === option ? 'font-medium bg-gray-50' : ''
                  }`}
                >
                  {getSortLabel(option)}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* 検索結果 - リスト表示 */}
      {viewMode === 'list' && (
        <div className="pb-20 space-y-4">
          {sortedExperiences.length > 0 ? (
            sortedExperiences.map((experience) => (
              <ExperienceCard
                key={experience.id}
                experience={experience}
                onClick={() => onExperienceClick(experience.id)}
                onFavoriteToggle={handleFavoriteToggle}
                isFavorite={favorites.includes(experience.id)}
              />
            ))
          ) : (
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <p className="text-gray-500">体験が見つかりませんでした</p>
              <p className="text-sm text-gray-400 mt-2">
                検索条件を変更するか、別のキーワードで試してみてください
              </p>
            </div>
          )}
        </div>
      )}
      
      {/* 検索結果 - 地図表示 */}
      {viewMode === 'map' && (
        <div className="pb-20">
          <div className="h-96 bg-gray-100 rounded-lg overflow-hidden relative">
            <MapView
              center={locationCoordinates}
              zoom={12}
              showControls={true}
              showUserLocation={true}
              showStyleSelector={true}
              className="h-full"
            />
            {/* 地図上にカードのプレビューを表示 */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-11/12 max-w-md">
              {sortedExperiences.length > 0 && (
                <ExperienceCard
                  experience={sortedExperiences[0]}
                  onClick={() => onExperienceClick(sortedExperiences[0].id)}
                  onFavoriteToggle={handleFavoriteToggle}
                  isFavorite={favorites.includes(sortedExperiences[0].id)}
                  compact
                />
              )}
            </div>
          </div>
          
          {/* 地図下のリスト */}
          <div className="mt-4 space-y-4">
            <h3 className="font-medium">近くの体験</h3>
            {sortedExperiences.slice(0, 3).map((experience) => (
              <ExperienceCard
                key={experience.id}
                experience={experience}
                onClick={() => onExperienceClick(experience.id)}
                onFavoriteToggle={handleFavoriteToggle}
                isFavorite={favorites.includes(experience.id)}
                compact
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ExperienceSearch;