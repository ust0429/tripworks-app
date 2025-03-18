// src/components/screens/SeasonalEventsScreen.tsx
import React, { useState } from 'react';
import { Calendar, Sunrise, Coffee, User, Info } from 'lucide-react';

const SeasonalEventsScreen: React.FC = () => {
  const [viewType, setViewType] = useState('list'); // 'list' or 'calendar'
  
  // 季節限定イベントのサンプルデータ
  const seasonalEvents = [
    {
      id: 1,
      day: '15',
      title: '早朝の漁港見学と海鮮朝食',
      time: '5:00〜8:00',
      attender: '鈴木 漁師',
      period: '7月限定',
      note: '温かい服装でお越しください',
    },
    {
      id: 2,
      day: '20',
      title: '夏祭り特別ガイドツアー',
      time: '18:00〜21:00',
      attender: '田中 歴史家',
      period: '年に一度',
      note: '浴衣でご参加の方は割引あり',
    },
    {
      id: 3,
      day: '25',
      title: '満月の夜の路地裏散策',
      time: '20:00〜22:00',
      attender: '佐藤 写真家',
      period: '満月限定',
      note: 'カメラ持参推奨',
    },
  ];
  
  return (
    <div className="p-4 space-y-6">
      <div className="flex justify-between items-center">
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
      
      {/* 特集イベント */}
      <div className="bg-gradient-to-r from-gray-800 to-black rounded-lg p-4 text-white relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center mb-2">
            <Calendar size={20} className="mr-2" />
            <span className="font-medium">7月2日〜7月7日</span>
          </div>
          <h2 className="text-xl font-bold mb-1">七夕祭り特別体験</h2>
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
        <h2 className="text-xl font-bold mb-3">時間帯別の特別体験</h2>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="bg-gray-100 p-3 flex items-center">
              <Sunrise size={20} className="text-gray-600 mr-2" />
              <span className="font-medium">早朝体験</span>
            </div>
            <div className="p-3">
              <p className="font-medium text-sm">漁港の朝市ツアー</p>
              <p className="text-xs text-gray-600 mt-1">5:00〜7:00限定</p>
              <div className="flex items-center mt-2">
                <span className="text-xs ml-1">4.9 (27件)</span>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="bg-gray-100 p-3 flex items-center">
              <Coffee size={20} className="text-gray-600 mr-2" />
              <span className="font-medium">午後体験</span>
            </div>
            <div className="p-3">
              <p className="font-medium text-sm">職人の工房見学</p>
              <p className="text-xs text-gray-600 mt-1">14:00〜16:00限定</p>
              <div className="flex items-center mt-2">
                <span className="text-xs ml-1">4.8 (42件)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* 季節イベント一覧 */}
      <div>
        <h2 className="text-xl font-bold mb-3">今月の季節イベント</h2>
        <div className="space-y-3">
          {seasonalEvents.map(event => (
            <div key={event.id} className="bg-white rounded-lg shadow-sm p-3">
              <div className="flex justify-between items-start">
                <div className="flex items-start space-x-3">
                  <div className="bg-gray-100 rounded-lg p-2 text-center w-12">
                    <p className="text-xs text-gray-600">7月</p>
                    <p className="text-lg font-bold text-gray-800">{event.day}</p>
                  </div>
                  <div>
                    <p className="font-medium">{event.title}</p>
                    <p className="text-xs text-gray-600 mt-1">{event.time}</p>
                    <div className="flex items-center mt-1">
                      <User size={12} className="text-gray-500 mr-1" />
                      <span className="text-xs text-gray-600">{event.attender}</span>
                    </div>
                  </div>
                </div>
                <div className="bg-green-100 text-green-800 text-xs py-1 px-2 rounded-full">
                  {event.period}
                </div>
              </div>
              <div className="mt-2 pt-2 border-t flex justify-between items-center">
                <div className="flex items-center">
                  <Info size={14} className="text-gray-500 mr-1" />
                  <span className="text-xs text-gray-600">{event.note}</span>
                </div>
                <button className="text-black text-sm font-medium">
                  予約する
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SeasonalEventsScreen;