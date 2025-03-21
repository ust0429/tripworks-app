// src/components/explore/ExperienceSearchFilters.tsx
import React, { useState } from 'react';
import { X, ChevronDown, Calendar, Clock, Users, DollarSign, Filter } from 'lucide-react';

// フィルターの型定義
export interface ExperienceFilters {
  categories: string[];
  dateRange: {
    start?: Date;
    end?: Date;
  };
  priceRange: {
    min: number;
    max: number;
  };
  duration: {
    min: number; // 分単位
    max: number; // 分単位
  };
  groupSize: {
    min: number;
    max: number;
  };
  timeOfDay: ('morning' | 'afternoon' | 'evening' | 'night')[];
  languages: string[];
  specialFeatures: string[];
  accessibility: string[];
}

// フィルターモーダルの型定義
interface ExperienceSearchFiltersProps {
  isOpen: boolean;
  onClose: () => void;
  filters: ExperienceFilters;
  onApplyFilters: (filters: ExperienceFilters) => void;
}

// 日本語のカテゴリーデータ
const categoryOptions = [
  { id: 'music', name: '音楽' },
  { id: 'art', name: 'アート' },
  { id: 'food', name: '料理とグルメ' },
  { id: 'nature', name: '自然と冒険' },
  { id: 'craft', name: '工芸と職人技' },
  { id: 'history', name: '歴史と文化' },
  { id: 'wellness', name: 'ウェルネス' },
  { id: 'nightlife', name: 'ナイトライフ' },
  { id: 'shopping', name: 'ショッピング' },
  { id: 'photography', name: '写真撮影' },
  { id: 'local', name: 'ローカル体験' },
];

// 言語オプション
const languageOptions = [
  { id: 'ja', name: '日本語' },
  { id: 'en', name: '英語' },
  { id: 'zh', name: '中国語' },
  { id: 'ko', name: '韓国語' },
  { id: 'fr', name: 'フランス語' },
  { id: 'es', name: 'スペイン語' },
];

// 特別な特徴オプション
const specialFeatureOptions = [
  { id: 'local_exclusive', name: '地元民限定' },
  { id: 'off_the_beaten_path', name: '知られざるスポット' },
  { id: 'limited_time', name: '期間限定' },
  { id: 'photo_spots', name: 'フォトジェニック' },
  { id: 'food_included', name: '食事付き' },
  { id: 'drinks_included', name: '飲み物付き' },
  { id: 'transport_included', name: '交通手段付き' },
  { id: 'private_experience', name: 'プライベート体験' },
];

// アクセシビリティオプション
const accessibilityOptions = [
  { id: 'wheelchair', name: '車椅子対応' },
  { id: 'step_free', name: '段差なし' },
  { id: 'sign_language', name: '手話対応' },
  { id: 'audio_description', name: '音声ガイド' },
  { id: 'visual_aids', name: '視覚補助' },
  { id: 'elderly_friendly', name: 'シニア向け' },
  { id: 'family_friendly', name: '家族向け' },
];

export const ExperienceSearchFilters: React.FC<ExperienceSearchFiltersProps> = ({
  isOpen,
  onClose,
  filters,
  onApplyFilters,
}) => {
  // ローカルフィルター状態
  const [localFilters, setLocalFilters] = useState<ExperienceFilters>(filters);
  
  // アコーディオンの開閉状態
  const [expandedSections, setExpandedSections] = useState<{
    categories: boolean;
    date: boolean;
    price: boolean;
    duration: boolean;
    groupSize: boolean;
    timeOfDay: boolean;
    languages: boolean;
    features: boolean;
    accessibility: boolean;
  }>({
    categories: true,
    date: false,
    price: false,
    duration: false,
    groupSize: false,
    timeOfDay: false,
    languages: false,
    features: false,
    accessibility: false,
  });

  // トグルセクションの開閉
  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections({
      ...expandedSections,
      [section]: !expandedSections[section],
    });
  };

  // カテゴリーの選択切り替え
  const toggleCategory = (categoryId: string) => {
    if (localFilters.categories.includes(categoryId)) {
      setLocalFilters({
        ...localFilters,
        categories: localFilters.categories.filter(id => id !== categoryId),
      });
    } else {
      setLocalFilters({
        ...localFilters,
        categories: [...localFilters.categories, categoryId],
      });
    }
  };

  // 時間帯の選択切り替え
  const toggleTimeOfDay = (time: 'morning' | 'afternoon' | 'evening' | 'night') => {
    if (localFilters.timeOfDay.includes(time)) {
      setLocalFilters({
        ...localFilters,
        timeOfDay: localFilters.timeOfDay.filter(t => t !== time),
      });
    } else {
      setLocalFilters({
        ...localFilters,
        timeOfDay: [...localFilters.timeOfDay, time],
      });
    }
  };

  // 言語の選択切り替え
  const toggleLanguage = (languageId: string) => {
    if (localFilters.languages.includes(languageId)) {
      setLocalFilters({
        ...localFilters,
        languages: localFilters.languages.filter(id => id !== languageId),
      });
    } else {
      setLocalFilters({
        ...localFilters,
        languages: [...localFilters.languages, languageId],
      });
    }
  };

  // 特別な特徴の選択切り替え
  const toggleSpecialFeature = (featureId: string) => {
    if (localFilters.specialFeatures.includes(featureId)) {
      setLocalFilters({
        ...localFilters,
        specialFeatures: localFilters.specialFeatures.filter(id => id !== featureId),
      });
    } else {
      setLocalFilters({
        ...localFilters,
        specialFeatures: [...localFilters.specialFeatures, featureId],
      });
    }
  };

  // アクセシビリティの選択切り替え
  const toggleAccessibility = (accessibilityId: string) => {
    if (localFilters.accessibility.includes(accessibilityId)) {
      setLocalFilters({
        ...localFilters,
        accessibility: localFilters.accessibility.filter(id => id !== accessibilityId),
      });
    } else {
      setLocalFilters({
        ...localFilters,
        accessibility: [...localFilters.accessibility, accessibilityId],
      });
    }
  };

  // 価格レンジの設定
  const handlePriceChange = (type: 'min' | 'max', value: number) => {
    setLocalFilters({
      ...localFilters,
      priceRange: {
        ...localFilters.priceRange,
        [type]: value,
      },
    });
  };

  // 所要時間の設定
  const handleDurationChange = (type: 'min' | 'max', value: number) => {
    setLocalFilters({
      ...localFilters,
      duration: {
        ...localFilters.duration,
        [type]: value,
      },
    });
  };

  // グループサイズの設定
  const handleGroupSizeChange = (type: 'min' | 'max', value: number) => {
    setLocalFilters({
      ...localFilters,
      groupSize: {
        ...localFilters.groupSize,
        [type]: value,
      },
    });
  };

  // 日付範囲の設定
  const handleDateChange = (type: 'start' | 'end', dateString: string) => {
    const date = dateString ? new Date(dateString) : undefined;
    setLocalFilters({
      ...localFilters,
      dateRange: {
        ...localFilters.dateRange,
        [type]: date,
      },
    });
  };

  // フィルターのリセット
  const resetFilters = () => {
    setLocalFilters({
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
  };

  // フィルターの適用
  const applyFilters = () => {
    onApplyFilters(localFilters);
    onClose();
  };

  // フィルターがアクティブかどうかを判定
  const hasActiveFilters = (
    localFilters.categories.length > 0 ||
    localFilters.timeOfDay.length > 0 ||
    localFilters.languages.length > 0 ||
    localFilters.specialFeatures.length > 0 ||
    localFilters.accessibility.length > 0 ||
    localFilters.dateRange.start !== undefined ||
    localFilters.dateRange.end !== undefined ||
    localFilters.priceRange.min > 0 ||
    localFilters.priceRange.max < 50000 ||
    localFilters.duration.min > 30 ||
    localFilters.duration.max < 480 ||
    localFilters.groupSize.min > 1 ||
    localFilters.groupSize.max < 10
  );

  // 閉じるボタンが押されたときの処理
  const handleClose = () => {
    // 変更を破棄して閉じる
    setLocalFilters(filters);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex flex-col">
      <div className="bg-white p-4 shadow-lg flex justify-between items-center">
        <h2 className="text-lg font-bold">フィルター</h2>
        <button onClick={handleClose} className="p-2 text-gray-500 hover:text-black">
          <X size={20} />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto bg-gray-50">
        <div className="p-4 space-y-6">
          {/* カテゴリー */}
          <div className="bg-white rounded-lg shadow-sm">
            <button
              onClick={() => toggleSection('categories')}
              className="w-full p-4 flex justify-between items-center"
            >
              <div className="flex items-center space-x-3">
                <Filter size={20} className="text-gray-600" />
                <span className="font-medium">カテゴリー</span>
                {localFilters.categories.length > 0 && (
                  <span className="bg-gray-100 text-gray-800 text-xs rounded-full px-2 py-1">
                    {localFilters.categories.length}
                  </span>
                )}
              </div>
              <ChevronDown
                size={20}
                className={`transition-transform ${expandedSections.categories ? 'rotate-180' : ''}`}
              />
            </button>
            
            {expandedSections.categories && (
              <div className="p-4 pt-0 border-t">
                <div className="grid grid-cols-2 gap-2 mt-3">
                  {categoryOptions.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => toggleCategory(category.id)}
                      className={`py-2 px-3 rounded-lg text-sm text-left ${
                        localFilters.categories.includes(category.id)
                          ? 'bg-black text-white'
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      }`}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* 日付 */}
          <div className="bg-white rounded-lg shadow-sm">
            <button
              onClick={() => toggleSection('date')}
              className="w-full p-4 flex justify-between items-center"
            >
              <div className="flex items-center space-x-3">
                <Calendar size={20} className="text-gray-600" />
                <span className="font-medium">日付</span>
                {(localFilters.dateRange.start || localFilters.dateRange.end) && (
                  <span className="bg-gray-100 text-gray-800 text-xs rounded-full px-2 py-1">
                    選択中
                  </span>
                )}
              </div>
              <ChevronDown
                size={20}
                className={`transition-transform ${expandedSections.date ? 'rotate-180' : ''}`}
              />
            </button>
            
            {expandedSections.date && (
              <div className="p-4 pt-0 border-t">
                <div className="space-y-3 mt-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">開始日</label>
                    <input
                      type="date"
                      value={localFilters.dateRange.start ? localFilters.dateRange.start.toISOString().split('T')[0] : ''}
                      onChange={(e) => handleDateChange('start', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">終了日</label>
                    <input
                      type="date"
                      value={localFilters.dateRange.end ? localFilters.dateRange.end.toISOString().split('T')[0] : ''}
                      onChange={(e) => handleDateChange('end', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* 価格 */}
          <div className="bg-white rounded-lg shadow-sm">
            <button
              onClick={() => toggleSection('price')}
              className="w-full p-4 flex justify-between items-center"
            >
              <div className="flex items-center space-x-3">
                <DollarSign size={20} className="text-gray-600" />
                <span className="font-medium">価格帯</span>
                {(localFilters.priceRange.min > 0 || localFilters.priceRange.max < 50000) && (
                  <span className="bg-gray-100 text-gray-800 text-xs rounded-full px-2 py-1">
                    ¥{localFilters.priceRange.min.toLocaleString()} - ¥{localFilters.priceRange.max.toLocaleString()}
                  </span>
                )}
              </div>
              <ChevronDown
                size={20}
                className={`transition-transform ${expandedSections.price ? 'rotate-180' : ''}`}
              />
            </button>
            
            {expandedSections.price && (
              <div className="p-4 pt-0 border-t">
                <div className="space-y-4 mt-3">
                  <div>
                    <div className="flex justify-between mb-1">
                      <label className="text-sm font-medium text-gray-700">最低価格</label>
                      <span className="text-sm text-gray-600">¥{localFilters.priceRange.min.toLocaleString()}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="50000"
                      step="1000"
                      value={localFilters.priceRange.min}
                      onChange={(e) => handlePriceChange('min', parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <label className="text-sm font-medium text-gray-700">最高価格</label>
                      <span className="text-sm text-gray-600">¥{localFilters.priceRange.max.toLocaleString()}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="50000"
                      step="1000"
                      value={localFilters.priceRange.max}
                      onChange={(e) => handlePriceChange('max', parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* フィルターボタン */}
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t">
            <div className="flex space-x-3">
              <button
                onClick={resetFilters}
                className="flex-1 py-3 border border-gray-300 rounded-lg font-medium"
              >
                リセット
              </button>
              <button
                onClick={applyFilters}
                className="flex-1 py-3 bg-black text-white rounded-lg font-medium"
              >
                適用 {hasActiveFilters && '✓'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExperienceSearchFilters;