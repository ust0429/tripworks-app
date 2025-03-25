// src/components/screens/SeasonalEventsScreen.tsx
import React, { useState, useEffect } from 'react';
import { Calendar, Sunrise, Coffee, Moon, Compass, ArrowRight } from 'lucide-react';
import { EventType, FilterOptionType } from '../../types/event';
import EventList from '../event/EventList';
import EventCard from '../event/EventCard';
import EventFilter from '../event/EventFilter';

const SeasonalEventsScreen: React.FC = () => {
  const [viewType, setViewType] = useState('list'); // 'list' or 'calendar'
  const [loading, setLoading] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({
    type: 'all',
    period: 'all'
  });
  
  // フィルターオプション
  const filterOptions = {
    types: [
      { id: 'morning', name: '朝体験' },
      { id: 'afternoon', name: '昼体験' },
      { id: 'evening', name: '夕方体験' },
      { id: 'night', name: '夜体験' },
      { id: 'workshop', name: 'ワークショップ' }
    ] as FilterOptionType[],
    periods: [
      { id: 'oneday', name: '1日限り' },
      { id: 'weekend', name: '週末' },
      { id: 'weekly', name: '毎週' },
      { id: 'monthly', name: '毎月' },
      { id: 'seasonal', name: '季節限定' }
    ] as FilterOptionType[]
  };
  
  // 季節限定イベントのサンプルデータ
  const seasonalEvents: EventType[] = [
    {
      id: 1,
      day: '15',
      title: '早朝の漁港見学と海鮮朝食',
      time: '5:00〜8:00',
      attender: '鈴木 漁師',
      period: '7月限定',
      note: '温かい服装でお越しください',
      price: 5800,
      location: '福岡県福岡市',
      description: '夜明け前の漁港で活気ある競りの様子を見学後、獲れたての海鮮で朝食をいただきます。魚のさばき方のミニレッスンも実施。',
      icon: <Sunrise size={24} />,
      type: 'morning',
      rating: 4.9,
      reviewCount: 32,
      featured: true
    },
    {
      id: 2,
      day: '20',
      title: '夏祭り特別ガイドツアー',
      time: '18:00〜21:00',
      attender: '田中 歴史家',
      period: '年に一度',
      note: '浴衣でご参加の方は割引あり',
      price: 4800,
      location: '京都府京都市',
      description: '地元の方しか知らない祭りの裏話や歴史的背景を解説しながら最高の場所から祭りを楽しめます。地元の屋台での食事つき。',
      icon: <Moon size={24} />,
      type: 'evening',
      rating: 4.7,
      reviewCount: 56
    },
    {
      id: 3,
      day: '25',
      title: '満月の夜の路地裏散策',
      time: '20:00〜22:00',
      attender: '佐藤 写真家',
      period: '満月限定',
      note: 'カメラ持参推奨',
      price: 3500,
      location: '東京都台東区',
      description: '満月の夜に照らされた街並みを写真家と一緒に巡り、特別な写真スポットでナイトフォトグラフィーのテクニックを学びます。',
      icon: <Moon size={24} />,
      type: 'night',
      rating: 4.8,
      reviewCount: 24
    },
    {
      id: 4,
      day: '18',
      title: '朝市散策と郷土料理クッキング',
      time: '9:00〜13:00',
      attender: '山本 料理人',
      period: '週末限定',
      note: 'エプロン付き',
      price: 6800,
      location: '石川県金沢市',
      description: '朝市で地元の食材を料理人と一緒に選び、その場で郷土料理の作り方を教わりながら調理を体験。作った料理をみんなで試食します。',
      icon: <Coffee size={24} />,
      type: 'morning',
      rating: 4.9,
      reviewCount: 48
    },
    {
      id: 5,
      day: '10',
      title: '蛍観察とナイトハイク',
      time: '19:30〜21:30',
      attender: '伊藤 自然ガイド',
      period: '6月〜7月限定',
      note: '長袖・長ズボン推奨',
      price: 3800,
      location: '長野県軽井沢町',
      description: '夏の夕暮れから始まるナイトハイクで、幻想的な蛍の光を観察します。自然環境の専門家による蛍の生態や環境保全についての話も聞けます。',
      icon: <Moon size={24} />,
      type: 'night',
      rating: 4.8,
      reviewCount: 37
    },
  ];

  // 時間帯別体験
  const timeFrameExperiences = [
    {
      id: 101,
      title: '漁港の朝市ツアー',
      time: '5:00〜7:00',
      period: '早朝限定',
      price: 4500,
      type: 'morning',
      icon: <Sunrise size={24} />,
      day: '毎週土日',
      attender: '鈴木 漁師',
      rating: 4.9,
      reviewCount: 27
    },
    {
      id: 102,
      title: '職人の工房見学',
      time: '14:00〜16:00',
      period: '平日限定',
      price: 3800,
      type: 'afternoon',
      icon: <Coffee size={24} />,
      day: '毎週火木',
      attender: '山田 職人',
      rating: 4.8,
      reviewCount: 42
    },
    {
      id: 103,
      title: '夜景スポット巡り',
      time: '19:00〜21:00',
      period: '晴天時のみ',
      price: 4000,
      type: 'night',
      icon: <Moon size={24} />,
      day: '不定期',
      attender: '高橋 フォトグラファー',
      rating: 4.7,
      reviewCount: 36
    },
    {
      id: 104,
      title: '秘密の路地裏散策',
      time: '13:00〜15:30',
      period: '毎日開催',
      price: 3500,
      type: 'afternoon',
      icon: <Compass size={24} />,
      day: '毎日',
      attender: '佐藤 地元ガイド',
      rating: 4.9,
      reviewCount: 64
    }
  ];

  // 特集イベント
  const featuredEvent: EventType = {
    id: 201,
    title: '七夕祭り特別体験',
    day: '2',
    month: '7',
    time: '18:00〜21:00',
    attender: '田中 祭り案内人',
    period: '7月2日〜7月7日',
    price: 4500,
    location: '東京都浅草',
    description: '伝統的な七夕飾り作りから夜空観察まで、季節限定のスペシャルプログラム。地元の職人から七夕飾りの作り方を教わり、自分だけのオリジナル飾りを作るワークショップに参加した後、特別な場所から星空観察を行います。',
    badge: '特別イベント',
    featured: true,
    icon: <Calendar size={24} />,
    rating: 4.9,
    reviewCount: 28
  };

  // フィルタリング処理
  const handleFilterChange = (filterType: 'type' | 'period', value: string) => {
    setSelectedFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
    
    // アニメーション用の読み込み状態
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 500);
  };
  
  const clearFilters = () => {
    setSelectedFilters({
      type: 'all',
      period: 'all'
    });
  };
  
  // フィルタリングされたイベント
  const filteredEvents = seasonalEvents.filter(event => {
    const typeMatch = selectedFilters.type === 'all' || event.type === selectedFilters.type;
    const periodMatch = selectedFilters.period === 'all' || (
      event.period && event.period.includes(
        filterOptions.periods.find(p => p.id === selectedFilters.period)?.name || ''
      )
    );
    
    return typeMatch && periodMatch;
  });
  
  useEffect(() => {
    // 本来はここでイベントデータをAPIから取得する
    // fetchEvents();
  }, []);
  
  return (
    <div className="pb-16 space-y-6">
      {/* ヘッダー */}
      <div className="sticky top-0 z-10 bg-white p-4 shadow-sm">
        <div className="flex justify-between items-center mb-3">
          <h1 className="text-2xl font-bold">季節限定体験</h1>
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            <button 
              onClick={() => setViewType('list')}
              className={`px-3 py-1 rounded text-sm ${
                viewType === 'list' ? 'bg-white shadow-sm' : ''
              }`}
            >
              リスト
            </button>
            <button 
              onClick={() => setViewType('calendar')}
              className={`px-3 py-1 rounded text-sm ${
                viewType === 'calendar' ? 'bg-white shadow-sm' : ''
              }`}
            >
              カレンダー
            </button>
          </div>
        </div>
        
        {/* フィルター */}
        <EventFilter 
          filters={filterOptions}
          selectedFilters={selectedFilters}
          onFilterChange={handleFilterChange}
          onClearFilters={clearFilters}
        />
      </div>
      
      <div className="px-4 space-y-8">
        {/* 特集イベント */}
        <div className="bg-gradient-to-r from-gray-800 to-black rounded-lg p-4 text-white relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center mb-2">
              <Calendar size={20} className="mr-2" />
              <span className="font-medium">{featuredEvent.period}</span>
            </div>
            <h2 className="text-xl font-bold mb-1">{featuredEvent.title}</h2>
            <p className="text-sm opacity-90 mb-3">
              伝統的な七夕飾り作りから夜空観察まで、季節限定のスペシャルプログラム
            </p>
            <button className="bg-white text-black font-medium py-2 px-4 rounded-lg text-sm">
              詳細を見る
            </button>
          </div>
          <div className="absolute top-0 right-0 opacity-20 text-9xl">
            🎋
          </div>
        </div>
        
        {/* 時間帯別体験 */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xl font-bold">時間帯別の特別体験</h2>
            <button className="flex items-center text-sm font-medium">
              すべて見る
              <ArrowRight size={16} className="ml-1" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {timeFrameExperiences.map(experience => (
              <EventCard 
                key={experience.id}
                event={experience}
                variant="compact"
              />
            ))}
          </div>
        </div>
        
        {/* 季節イベント一覧 */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xl font-bold">今月の季節イベント</h2>
            {(selectedFilters.type !== 'all' || selectedFilters.period !== 'all') && (
              <p className="text-sm text-gray-600">
                {filteredEvents.length}件見つかりました
              </p>
            )}
          </div>
          
          {loading ? (
            <div className="py-8 text-center text-gray-500">読み込み中...</div>
          ) : viewType === 'list' ? (
            <EventList events={filteredEvents} />
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {filteredEvents.map(event => (
                <EventCard key={event.id} event={event} />
              ))}
              {filteredEvents.length === 0 && (
                <div className="col-span-full py-8 text-center text-gray-500">
                  条件に一致するイベントが見つかりませんでした
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* ボランティア募集 */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-bold text-lg mb-2">地域イベントのボランティア</h3>
          <p className="text-sm text-gray-700 mb-3">
            地域のお祭りや文化イベントのボランティアに参加して、地元住民と共に楽しみながら貢献しませんか？
          </p>
          <button className="bg-black text-white font-medium py-2 px-4 rounded-lg text-sm w-full">
            ボランティア情報を見る
          </button>
        </div>
      </div>
    </div>
  );
};

export default SeasonalEventsScreen;