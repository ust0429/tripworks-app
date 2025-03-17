// src/components/ExploreScreen.tsx
import React, { useState, useEffect } from 'react';
import { Search, List, Map as MapIcon, Sliders, MapPin, Music, Camera, Coffee, Hammer, Utensils } from 'lucide-react';
import { useAuth } from '../AuthComponents';
import MapView from './MapView';
import AttenderCard from './AttenderCard';
import { getCurrentLocation, geocodeAddress } from '../utils/mapUtils';
import { AttenderType } from '../types';

// 明示的な型定義
interface ExploreScreenProps {
  onAttenderClick: (id: number) => void;
  attendersData: AttenderType[];
}

const ExploreScreen = ({ onAttenderClick, attendersData }: ExploreScreenProps) => {
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [quickRequestModalOpen, setQuickRequestModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [currentLocation, setCurrentLocation] = useState<[number, number]>([139.7690, 35.6804]); // 東京をデフォルト
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [locationName, setLocationName] = useState('東京');
  
  const { isAuthenticated, openLoginModal } = useAuth();

  // カテゴリーデータ
  const categories = [
    { id: 'all', name: 'すべて', icon: <MapPin size={16} className="mr-1" /> },
    { id: 'music', name: '音楽', icon: <Music size={16} className="mr-1" /> },
    { id: 'art', name: 'アート', icon: <Camera size={16} className="mr-1" /> },
    { id: 'coffee', name: 'カフェ', icon: <Coffee size={16} className="mr-1" /> },
    { id: 'craft', name: '職人技', icon: <Hammer size={16} className="mr-1" /> },
    { id: 'food', name: '料理', icon: <Utensils size={16} className="mr-1" /> },
  ];

  // フィルタリングされたアテンダーリスト
  const filteredAttenders = attendersData.filter(attender => {
    // 検索クエリでフィルタリング
    const matchesSearch = searchQuery === '' || 
      attender.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      attender.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      attender.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    // カテゴリーでフィルタリング
    const matchesCategory = !filterCategory || filterCategory === 'all' || 
      attender.type.toLowerCase().includes(filterCategory.toLowerCase());
    
    return matchesSearch && matchesCategory;
  });

  // 現在地を取得
  const handleGetCurrentLocation = async () => {
    setIsLoadingLocation(true);
    try {
      const location = await getCurrentLocation();
      setCurrentLocation(location);
      setLocationName('現在地');
    } catch (error) {
      console.error('Error getting current location:', error);
      // エラー時は東京をデフォルトとして設定
    } finally {
      setIsLoadingLocation(false);
    }
  };

  // 検索処理（住所検索）
  const handleSearch = async () => {
    if (!searchQuery) return;
    
    setIsLoadingLocation(true);
    try {
      const location = await geocodeAddress(searchQuery);
      if (location) {
        setCurrentLocation(location);
        setLocationName(searchQuery);
      }
    } catch (error) {
      console.error('Geocoding error:', error);
    } finally {
      setIsLoadingLocation(false);
    }
  };

  // クイックリクエスト処理
  const handleQuickRequestClick = () => {
    if (isAuthenticated) {
      setQuickRequestModalOpen(true);
    } else {
      openLoginModal();
    }
  };

  // 初回ロード時に現在地を取得
  useEffect(() => {
    handleGetCurrentLocation();
  }, []);

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold">周辺を探索</h1>
      
      {/* 検索バー */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search size={20} className="text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="場所、アテンダー、体験を検索"
          className="w-full pl-10 pr-14 py-3 bg-white border border-gray-300 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
          <button 
            onClick={handleSearch}
            className="p-1 rounded-full hover:bg-gray-100"
          >
            <Sliders size={20} className="text-gray-500" />
          </button>
        </div>
      </div>
      
      {/* 現在地表示 */}
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
      
      {/* カテゴリーフィルター */}
      <div className="flex space-x-2 overflow-x-auto pb-2">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setFilterCategory(category.id === 'all' ? null : category.id)}
            className={`px-3 py-1 rounded-full text-sm whitespace-nowrap flex items-center ${
              (category.id === 'all' && !filterCategory) || filterCategory === category.id
                ? 'bg-black text-white'
                : 'bg-white border border-gray-300 text-gray-700'
            }`}
          >
            {category.icon}
            {category.name}
          </button>
        ))}
      </div>
      
      {/* 表示切替タブ */}
      <div className="flex space-x-2 bg-gray-100 rounded-lg p-1">
        <button
          onClick={() => setViewMode('list')}
          className={`flex-1 py-2 flex items-center justify-center rounded ${
            viewMode === 'list' ? 'bg-white shadow-sm' : ''
          }`}
        >
          <List size={18} className="mr-1" />
          <span className="text-sm">リスト</span>
        </button>
        <button
          onClick={() => setViewMode('map')}
          className={`flex-1 py-2 flex items-center justify-center rounded ${
            viewMode === 'map' ? 'bg-white shadow-sm' : ''
          }`}
        >
          <MapIcon size={18} className="mr-1" />
          <span className="text-sm">地図</span>
        </button>
      </div>

      {/* クイックリクエストボタン */}
      <button 
        onClick={handleQuickRequestClick}
        className="w-full bg-black text-white py-3 rounded-lg font-medium shadow-md hover:bg-gray-800 transition duration-200 flex items-center justify-center"
      >
        この周辺のアテンダーをリクエスト
      </button>

      {/* 地図ビュー / リストビュー */}
      {viewMode === 'map' ? (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden" style={{ height: '400px' }}>
          <MapView 
            attendersData={filteredAttenders}
            onAttenderClick={onAttenderClick}
            center={currentLocation}
            zoom={14}
          />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">近くのアテンダー</h2>
            <span className="text-sm text-gray-500">{filteredAttenders.length}人のアテンダー</span>
          </div>
          
          {filteredAttenders.length > 0 ? (
            <div className="space-y-4">
              {filteredAttenders.map((attender) => (
                <div 
                  key={attender.id}
                  onClick={() => onAttenderClick(attender.id)}
                  className="cursor-pointer"
                >
                  <AttenderCard attender={attender} compact />
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <p className="text-gray-500">アテンダーが見つかりませんでした</p>
              <p className="text-sm text-gray-400 mt-2">別のキーワードや場所で探してみてください</p>
            </div>
          )}
        </div>
      )}

      {/* クイックリクエストモーダル */}
      {quickRequestModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-md p-6">
            <h3 className="text-lg font-bold mb-4">クイックリクエスト</h3>
            <p className="text-gray-600 mb-4">現在地周辺のアテンダーに今すぐリクエストを送ります。</p>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                リクエスト内容（例：裏路地散策、地元カフェ巡り）
              </label>
              <input
                type="text"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-gray-500 focus:border-gray-500"
                placeholder="短い要望を入力してください"
              />
            </div>
            
            {/* クイックリクエスト例 */}
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">よくあるリクエスト例：</p>
              <div className="grid grid-cols-2 gap-2">
                <button className="text-xs bg-gray-100 hover:bg-gray-200 py-2 px-3 rounded-lg text-left">
                  地元民のようにコーヒーブレイク
                </button>
                <button className="text-xs bg-gray-100 hover:bg-gray-200 py-2 px-3 rounded-lg text-left">
                  隠れた路地裏アート探索
                </button>
                <button className="text-xs bg-gray-100 hover:bg-gray-200 py-2 px-3 rounded-lg text-left">
                  地元のマーケットでショッピング
                </button>
                <button className="text-xs bg-gray-100 hover:bg-gray-200 py-2 px-3 rounded-lg text-left">
                  インディーズ書店巡り
                </button>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setQuickRequestModalOpen(false)}
                className="flex-1 py-3 border border-gray-300 rounded-lg font-medium"
              >
                キャンセル
              </button>
              <button
                onClick={() => setQuickRequestModalOpen(false)}
                className="flex-1 py-3 bg-black text-white rounded-lg font-medium"
              >
                今すぐリクエスト
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExploreScreen;