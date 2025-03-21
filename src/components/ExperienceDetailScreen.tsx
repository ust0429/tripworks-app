// src/components/ExperienceDetailScreen.tsx
import React, { useState } from 'react';
import { ArrowLeft, Star, Clock, Users, Calendar, Heart, Share2, MapPin } from 'lucide-react';
import MapView from './MapView';
import { ExperienceType } from '../types';

interface ExperienceDetailScreenProps {
  experienceId: number;
  onBack: () => void;
  onBookingRequest: (data: {
    experienceId: number;
    date: string;
    time: string;
    duration: string;
    location: string;
    price: number;
  }) => void;
}

const ExperienceDetailScreen: React.FC<ExperienceDetailScreenProps> = ({
  experienceId,
  onBack,
  onBookingRequest,
}) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [selectedParticipants, setSelectedParticipants] = useState<number>(1);
  
  // 実際のアプリでは、APIから体験データを取得します
  // ここではサンプルデータを使用
  const experiencesData: ExperienceType[] = [
    {
      id: 1,
      title: '音楽家と巡る 下北沢ライブハウスツアー',
      duration: '3時間',
      price: 5000,
      description: 'ローカルミュージシャンと一緒に、下北沢の歴史あるライブハウスを巡ります。各会場で内部の見学や簡単な楽器演奏体験ができます。',
      image: 'https://source.unsplash.com/random/400x300/?music,liveshow',
    },
    {
      id: 2,
      title: '街の裏側を知る 昭和レトロ商店街ツアー',
      duration: '2時間',
      price: 3500,
      description: '古き良き昭和の雰囲気が残る商店街を地元民と一緒に散策。普段は入れないお店の裏側や、商店街の歴史についてのストーリーを聞きながら、レトロな世界を体験します。',
      image: 'https://source.unsplash.com/random/400x300/?japan,showa,market',
    }
  ];
  
  // IDから体験を検索
  const experience = experiencesData.find(exp => exp.id === experienceId) || experiencesData[0];
  
  // 利用可能な日付のサンプルデータ
  const availableDates = [
    { date: '2025-03-22', day: '土' },
    { date: '2025-03-23', day: '日' },
    { date: '2025-03-24', day: '月' },
    { date: '2025-03-25', day: '火' },
    { date: '2025-03-26', day: '水' },
    { date: '2025-03-27', day: '木' },
    { date: '2025-03-28', day: '金' },
  ];
  
  // 利用可能な時間帯のサンプルデータ
  const availableTimes = [
    '10:00',
    '13:00',
    '16:00',
    '19:00',
  ];
  
  // お気に入り状態の切り替え
  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };
  
  // 予約リクエスト
  const handleBookingRequest = () => {
    if (!selectedDate || !selectedTime) {
      // 日付または時間が選択されていない場合、エラーメッセージを表示するなどの処理
      return;
    }
    
    onBookingRequest({
      experienceId: experience.id,
      date: selectedDate,
      time: selectedTime,
      duration: experience.duration,
      location: '東京都世田谷区北沢', // ダミーデータ
      price: experience.price * selectedParticipants,
    });
  };
  
  // 日付の表示フォーマット
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="pb-32">
      {/* ヘッダー画像 */}
      <div 
        className="h-64 bg-gray-200 relative"
        style={{
          backgroundImage: experience.image ? `url(${experience.image})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        
        <div className="absolute top-4 left-4 right-4 flex justify-between">
          <button
            onClick={onBack}
            className="bg-white rounded-full p-2 shadow-md"
          >
            <ArrowLeft size={20} />
          </button>
          
          <div className="flex space-x-2">
            <button
              onClick={toggleFavorite}
              className="bg-white rounded-full p-2 shadow-md"
            >
              <Heart
                size={20}
                className={isFavorite ? "text-red-500 fill-current" : "text-gray-700"}
              />
            </button>
            
            <button className="bg-white rounded-full p-2 shadow-md">
              <Share2 size={20} className="text-gray-700" />
            </button>
          </div>
        </div>
      </div>
      
      {/* 体験情報 */}
      <div className="p-4 space-y-6">
        <div>
          <h1 className="text-2xl font-bold">{experience.title}</h1>
          
          <div className="flex items-center mt-2 text-sm">
            <div className="flex items-center">
              <Star size={18} className="text-yellow-500 mr-1" />
              <span className="font-medium">4.9</span>
              <span className="text-gray-500 ml-1">(28)</span>
            </div>
            
            <div className="mx-2 text-gray-300">•</div>
            
            <div className="flex items-center text-gray-600">
              <Clock size={16} className="mr-1" />
              <span>{experience.duration}</span>
            </div>
          </div>
        </div>
        
        {/* 概要 */}
        <div className="space-y-2">
          <h2 className="text-lg font-medium">この体験について</h2>
          <p className="text-gray-700">{experience.description}</p>
        </div>
        
        {/* 体験内容 */}
        <div className="space-y-2">
          <h2 className="text-lg font-medium">体験内容</h2>
          <div className="bg-gray-50 rounded-lg p-3">
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>地元ミュージシャンによる案内</li>
              <li>3つの歴史あるライブハウスの見学</li>
              <li>簡単な楽器演奏体験</li>
              <li>1ドリンク付き</li>
            </ul>
          </div>
        </div>
        
        {/* 場所 */}
        <div className="space-y-2">
          <h2 className="text-lg font-medium">開催場所</h2>
          <div className="flex items-center">
            <MapPin size={18} className="text-gray-500 mr-2" />
            <p className="text-gray-700">東京都世田谷区北沢</p>
          </div>
          
          <div className="h-40 bg-gray-200 rounded-lg overflow-hidden">
            <MapView
              center={[139.6698, 35.6612]} // 下北沢の座標
              zoom={15}
              showControls={false}
              interactive={false}
            />
          </div>
        </div>
        
        {/* 日付選択 */}
        <div className="space-y-3">
          <h2 className="text-lg font-medium">日付を選ぶ</h2>
          <div className="flex space-x-3 overflow-x-auto pb-2">
            {availableDates.map((dateInfo) => (
              <button
                key={dateInfo.date}
                onClick={() => setSelectedDate(dateInfo.date)}
                className={`flex-shrink-0 flex flex-col items-center justify-center w-16 h-16 rounded-lg border ${
                  selectedDate === dateInfo.date
                    ? 'bg-black text-white border-black'
                    : 'bg-white text-gray-700 border-gray-200'
                }`}
              >
                <span className="text-xs">{dateInfo.day}</span>
                <span className="font-medium">{formatDate(dateInfo.date).split('/')[1]}</span>
              </button>
            ))}
          </div>
        </div>
        
        {/* 時間選択 */}
        {selectedDate && (
          <div className="space-y-3">
            <h2 className="text-lg font-medium">時間を選ぶ</h2>
            <div className="grid grid-cols-2 gap-3">
              {availableTimes.map((time) => (
                <button
                  key={time}
                  onClick={() => setSelectedTime(time)}
                  className={`py-3 px-4 rounded-lg border text-center ${
                    selectedTime === time
                      ? 'bg-black text-white border-black'
                      : 'bg-white text-gray-700 border-gray-200'
                  }`}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>
        )}
        
        {/* 人数選択 */}
        {selectedDate && selectedTime && (
          <div className="space-y-3">
            <h2 className="text-lg font-medium">人数を選ぶ</h2>
            <div className="flex items-center justify-between bg-white rounded-lg border border-gray-200 p-3">
              <span className="text-gray-700">参加人数</span>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setSelectedParticipants(Math.max(1, selectedParticipants - 1))}
                  className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center"
                  disabled={selectedParticipants <= 1}
                >
                  -
                </button>
                <span className="font-medium">{selectedParticipants}</span>
                <button
                  onClick={() => setSelectedParticipants(Math.min(10, selectedParticipants + 1))}
                  className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center"
                  disabled={selectedParticipants >= 10}
                >
                  +
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* 予約ボタン（固定フッター） */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 z-10">
        <div className="flex justify-between items-center mb-2">
          <div>
            <span className="font-bold text-xl">¥{(experience.price * (selectedParticipants || 1)).toLocaleString()}</span>
            <span className="text-sm text-gray-500">（{selectedParticipants || 1}人）</span>
          </div>
          
          {selectedDate && selectedTime && (
            <div className="text-sm text-gray-600 flex items-center">
              <Calendar size={14} className="mr-1" />
              {formatDate(selectedDate)} {selectedTime}
            </div>
          )}
        </div>
        
        <button
          onClick={handleBookingRequest}
          disabled={!selectedDate || !selectedTime}
          className={`w-full py-3 rounded-lg font-medium ${
            selectedDate && selectedTime
              ? 'bg-black text-white'
              : 'bg-gray-200 text-gray-500'
          }`}
        >
          {selectedDate && selectedTime ? '予約リクエストを送る' : '日時を選択してください'}
        </button>
      </div>
    </div>
  );
};

export default ExperienceDetailScreen;