// src/components/explore/index.tsx
import React, { useState, useEffect } from 'react';
import { Search, MapPin, Calendar } from 'lucide-react';
import ExperienceSearch from './ExperienceSearch';
import ExperienceSearchFilters, { ExperienceFilters } from './ExperienceSearchFilters';
import { AttenderType, ExperienceType } from '../../types';
import { getCurrentLocation, geocodeAddress } from '../../utils/mapUtils';

interface ExploreProps {
  onAttenderClick: (id: number) => void;
  onExperienceClick: (id: number) => void;
  attendersData: AttenderType[];
  experiencesData: ExperienceType[];
}

const Explore: React.FC<ExploreProps> = ({
  onAttenderClick,
  onExperienceClick,
  attendersData,
  experiencesData,
}) => {
  const [searchType, setSearchType] = useState<'attendees' | 'experiences'>('experiences');
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [locationName, setLocationName] = useState('東京');
  const [coordinates, setCoordinates] = useState<[number, number]>([139.7690, 35.6804]); // 東京をデフォルト
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [dateRangeText, setDateRangeText] = useState<string>('');

  // フィルター状態
  const [filters, setFilters] = useState<ExperienceFilters>({
    categories: [],
    dateRange: {
      start: undefined,
      end: undefined,
    },
    priceRange: {
      min: 0,
      max: 50000,
    },
    duration: {
      min: 30,
      max: 480,
    },
    groupSize: {
      min: 1,
      max: 10,
    },
    timeOfDay: [],
    languages: [],
    specialFeatures: [],
    accessibility: [],
  });

  // 現在地を取得
  const handleGetCurrentLocation = async () => {
    setIsLoadingLocation(true);
    try {
      const location = await getCurrentLocation();
      setCoordinates(location);
      setLocationName('現在地');
    } catch (error) {
      console.error('Error getting current location:', error);
      // エラー時は東京をデフォルトとして設定
    } finally {
      setIsLoadingLocation(false);
    }
  };

  // 初回ロード時に現在地を取得
  useEffect(() => {
    handleGetCurrentLocation();
  }, []);

  // 日付範囲のテキスト表示を更新
  useEffect(() => {
    if (filters.dateRange.start && filters.dateRange.end) {
      const start = filters.dateRange.start.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' });
      const end = filters.dateRange.end.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' });
      setDateRangeText(`${start} - ${end}`);
    } else if (filters.dateRange.start) {
      setDateRangeText(filters.dateRange.start.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' }) + ' ~');
    } else if (filters.dateRange.end) {
      setDateRangeText('~ ' + filters.dateRange.end.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' }));
    } else {
      setDateRangeText('');
    }
  }, [filters.dateRange]);

  // フィルターの適用
  const handleApplyFilters = (newFilters: ExperienceFilters) => {
    setFilters(newFilters);
  };

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold">体験を探す</h1>
      
      {/* 場所と日付のクイックアクセス */}
      <div className="space-y-3">
        <div className="bg-white rounded-lg shadow-sm p-3 flex justify-between items-center">
          <div className="flex items-center">
            <MapPin size={18} className="text-black mr-2" />
            <span className="font-medium">{isLoadingLocation ? '位置情報取得中...' : locationName}</span>
          </div>
          <button 
            onClick={handleGetCurrentLocation}
            disabled={isLoadingLocation}
            className="text-black text-sm font-medium flex items-center"
          >
            <MapPin size={16} className="mr-1" />
            現在地を取得
          </button>
        </div>
        
        <div 
          className="bg-white rounded-lg shadow-sm p-3 flex justify-between items-center"
          onClick={() => setFilterModalOpen(true)}
        >
          <div className="flex items-center">
            <Calendar size={18} className="text-black mr-2" />
            <span className="font-medium">
              {dateRangeText || 'いつでも'}
            </span>
          </div>
          <span className="text-black text-sm font-medium">日付を選択</span>
        </div>
      </div>
      
      {/* タブ切り替え */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setSearchType('experiences')}
          className={`py-2 px-4 border-b-2 font-medium text-sm ${
            searchType === 'experiences' 
              ? 'border-black text-black' 
              : 'border-transparent text-gray-500'
          }`}
        >
          体験
        </button>
        <button
          onClick={() => setSearchType('attendees')}
          className={`py-2 px-4 border-b-2 font-medium text-sm ${
            searchType === 'attendees' 
              ? 'border-black text-black' 
              : 'border-transparent text-gray-500'
          }`}
        >
          アテンダー
        </button>
      </div>
      
      {/* 検索結果 */}
      {searchType === 'experiences' ? (
        <ExperienceSearch
          experiences={experiencesData}
          onExperienceClick={onExperienceClick}
          onFilterOpen={() => setFilterModalOpen(true)}
          location={locationName}
          locationCoordinates={coordinates}
        />
      ) : (
        // アテンダー検索の場合はExploreScreen.tsxの既存の実装を使う
        <div className="text-center p-8">
          <p className="text-gray-500">このタブはまだ実装中です。「体験」タブをお試しください。</p>
        </div>
      )}
      
      {/* フィルターモーダル */}
      <ExperienceSearchFilters
        isOpen={filterModalOpen}
        onClose={() => setFilterModalOpen(false)}
        filters={filters}
        onApplyFilters={handleApplyFilters}
      />
    </div>
  );
};

export default Explore;