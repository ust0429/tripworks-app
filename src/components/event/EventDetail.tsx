import React, { useState } from 'react';
import { ChevronLeft, Calendar, MapPin, Clock, User, Star, Heart, Share2, AlertCircle } from 'lucide-react';
import { EventType } from '../../types/event';
import { IconProps } from '../../types/common';
import { useNavigate } from 'react-router-dom';

interface EventDetailProps {
  event: EventType;
  relatedEvents?: EventType[];
}

const EventDetail: React.FC<EventDetailProps> = ({ event, relatedEvents = [] }) => {
  const navigate = useNavigate();
  const [imageIndex, setImageIndex] = useState(0);
  
  // 仮のイベント画像配列
  const eventImages = event.imageUrl 
    ? [event.imageUrl, ...Array(3).fill('https://via.placeholder.com/400')] 
    : Array(4).fill('https://via.placeholder.com/400');
  
  const handleBack = () => {
    navigate(-1);
  };
  
  const formatDate = () => {
    if (event.date) return event.date;
    return `${event.month || '7'}月${event.day}日`;
  };
  
  return (
    <div className="pb-20">
      {/* ヘッダー */}
      <div className="fixed top-0 left-0 right-0 bg-white z-10 px-4 py-3 flex items-center border-b">
        <button onClick={handleBack} className="mr-4">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-lg font-bold flex-1 truncate">{event.title}</h1>
        <div className="flex space-x-2">
          <button className="w-8 h-8 flex items-center justify-center">
            <Heart size={20} className="text-gray-600" />
          </button>
          <button className="w-8 h-8 flex items-center justify-center">
            <Share2 size={20} className="text-gray-600" />
          </button>
        </div>
      </div>
      
      <div className="pt-16">
        {/* イベント画像 */}
        <div className="aspect-video relative bg-gray-100">
          <img 
            src={eventImages[imageIndex]} 
            alt={event.title} 
            className="w-full h-full object-cover"
          />
          {event.badge && (
            <div className="absolute top-4 left-4 bg-red-600 text-white text-xs py-1 px-2 rounded-full">
              {event.badge}
            </div>
          )}
        </div>
        
        {/* サムネイル画像 */}
        <div className="flex px-4 space-x-2 mt-3">
          {eventImages.map((img, index) => (
            <button 
              key={index}
              className={`w-16 h-12 rounded-md overflow-hidden ${imageIndex === index ? 'ring-2 ring-black' : 'opacity-70'}`}
              onClick={() => setImageIndex(index)}
            >
              <img src={img} alt={`Thumbnail ${index}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
        
        {/* イベント情報 */}
        <div className="p-4 space-y-4">
          <div>
            <div className="flex items-center mb-2">
              <Calendar size={16} className="text-gray-500 mr-1" />
              <span className="text-sm text-gray-600">{formatDate()}</span>
              {event.period && (
                <>
                  <div className="mx-2 w-1 h-1 rounded-full bg-gray-300"></div>
                  <span className="text-sm text-gray-600">{event.period}</span>
                </>
              )}
            </div>
            <h1 className="text-xl font-bold">{event.title}</h1>
            <p className="text-2xl font-bold mt-2">¥{event.price.toLocaleString()}</p>
            
            {event.remainingSpots !== undefined && event.remainingSpots < 5 && (
              <div className="flex items-center mt-2 text-red-600">
                <AlertCircle size={16} className="mr-1" />
                <p className="text-sm">残り{event.remainingSpots}席のみ</p>
              </div>
            )}
          </div>
          
          {/* 評価 */}
          {event.rating !== undefined && (
            <div className="flex items-center bg-gray-50 p-3 rounded-lg">
              <div className="flex items-center">
                {Array(5).fill(0).map((_, i) => (
                  <Star 
                    key={i}
                    size={16}
                    className={i < Math.floor(event.rating || 0) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}
                  />
                ))}
                <span className="ml-1 text-lg font-bold">
                  {event.rating.toFixed(1)}
                </span>
              </div>
              <div className="ml-3 text-sm">
                <p className="font-medium">{event.reviewCount || 0}件のレビュー</p>
                <button className="text-black underline mt-1">
                  レビューを見る
                </button>
              </div>
            </div>
          )}
          
          {/* 詳細情報 */}
          <div className="bg-white rounded-lg border p-3 space-y-3">
            <div className="flex items-start">
              <MapPin size={18} className="text-gray-600 mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">場所</p>
                <p className="text-sm text-gray-600">{event.location || '東京都渋谷区'}</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <Clock size={18} className="text-gray-600 mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">時間</p>
                <p className="text-sm text-gray-600">{event.time}</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <User size={18} className="text-gray-600 mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">アテンダー</p>
                <div className="flex items-center mt-1">
                  <div className="w-8 h-8 bg-gray-200 rounded-full mr-2 overflow-hidden">
                    {event.attenderAvatar ? (
                      <img 
                        src={event.attenderAvatar} 
                        alt={event.attender} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <User size={16} className="text-gray-500" />
                      </div>
                    )}
                  </div>
                  <p className="text-sm">{event.attender}</p>
                </div>
                <button className="text-black text-sm font-medium mt-2 underline">
                  プロフィールを見る
                </button>
              </div>
            </div>
          </div>
          
          {/* イベント説明 */}
          <div>
            <h2 className="font-bold text-lg mb-2">イベント内容</h2>
            <p className="text-gray-700">{event.description || `${event.title}の詳細なイベント内容です。アテンダーによる特別な体験をお楽しみください。`}</p>
          </div>
          
          {/* 注意事項 */}
          {event.note && (
            <div>
              <h2 className="font-bold text-lg mb-2">ご注意</h2>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-700">{event.note}</p>
              </div>
            </div>
          )}
          
          {/* 関連イベント */}
          {relatedEvents.length > 0 && (
            <div>
              <h2 className="font-bold text-lg mb-2">関連イベント</h2>
              <div className="overflow-x-auto pb-2">
                <div className="flex space-x-3" style={{ minWidth: 'min-content' }}>
                  {relatedEvents.map(relEvent => (
                    <div 
                      key={relEvent.id}
                      className="w-64 flex-shrink-0 bg-white rounded-lg shadow-sm overflow-hidden"
                      onClick={() => navigate(`/events/${relEvent.id}`)}
                    >
                      <div className="h-32 bg-gray-100 relative">
                        {relEvent.imageUrl ? (
                          <img 
                            src={relEvent.imageUrl} 
                            alt={relEvent.title} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            {relEvent.icon && React.isValidElement(relEvent.icon) && 
                              React.cloneElement(relEvent.icon as React.ReactElement<IconProps>, { size: 32, className: "text-gray-300" })}
                          </div>
                        )}
                      </div>
                      <div className="p-3">
                        <p className="font-medium line-clamp-1">{relEvent.title}</p>
                        <p className="text-xs text-gray-600 mt-1">{relEvent.time}</p>
                        <p className="font-bold mt-2">¥{relEvent.price.toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* 予約ボタン */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t px-4 py-3 flex items-center">
        <div className="mr-3">
          <p className="text-sm text-gray-600">1人あたり</p>
          <p className="text-xl font-bold">¥{event.price.toLocaleString()}</p>
        </div>
        <button className="flex-1 py-3 bg-black text-white rounded-lg font-medium">
          予約する
        </button>
      </div>
    </div>
  );
};

export default EventDetail;