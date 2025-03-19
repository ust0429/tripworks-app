import React, { useState } from 'react';
import { Calendar, Clock, MapPin, ChevronRight, Star, Image } from 'lucide-react';
import { useAuth } from '../../AuthComponents';

// モックデータの型定義
interface BookingType {
  id: number;
  title: string;
  attenderId: number;
  attenderName: string;
  attenderType: string;
  date: string;
  time: string;
  location: string;
  status: 'upcoming' | 'completed' | 'cancelled' | 'payment_pending';
  paymentMethod?: 'credit_card' | 'convenience' | 'bank_transfer' | 'qr_code';
  paymentStatus?: 'paid' | 'pending' | 'failed';
  price: number;
  isReviewed: boolean;
  imageUrl?: string;
  bookingId?: string;
}

// モックデータ
const mockBookings: BookingType[] = [
  {
    id: 6,
    title: '江戸切子体験ワークショップ',
    attenderId: 3,
    attenderName: '佐藤 ケンジ',
    attenderType: 'クラフトビール職人',
    date: '2025-04-10',
    time: '10:00',
    location: '東京都墨田区押上1-1-2',
    status: 'payment_pending',
    paymentMethod: 'convenience',
    paymentStatus: 'pending',
    price: 6800,
    isReviewed: false,
    bookingId: 'ECH20250301'
  },
  {
    id: 1,
    title: '浅草の裏路地を知り尽くしたガイドツアー',
    attenderId: 1,
    attenderName: '鈴木 アキラ',
    attenderType: 'バンドマン',
    date: '2025-03-25',
    time: '13:00',
    location: '浅草寺 雷門前',
    status: 'upcoming',
    price: 5000,
    isReviewed: false,
    imageUrl: 'https://source.unsplash.com/random/400x300/?tokyo,temple'
  },
  {
    id: 2,
    title: '地元ライブハウスめぐり',
    attenderId: 2,
    attenderName: '山田 ユカリ',
    attenderType: 'アーティスト',
    date: '2025-04-01',
    time: '19:00',
    location: '渋谷駅 ハチ公前',
    status: 'upcoming',
    price: 7500,
    isReviewed: false
  },
  {
    id: 3,
    title: '谷根千エリアの古民家カフェツアー',
    attenderId: 3,
    attenderName: '佐藤 ケンジ',
    attenderType: 'クラフトビール職人',
    date: '2025-03-05',
    time: '14:00',
    location: '根津神社 入口',
    status: 'completed',
    price: 4500,
    isReviewed: false
  },
  {
    id: 4,
    title: '神保町の古書店めぐり',
    attenderId: 1,
    attenderName: '鈴木 アキラ',
    attenderType: 'バンドマン',
    date: '2025-02-20',
    time: '11:00',
    location: '神保町駅 A2出口',
    status: 'completed',
    price: 3500,
    isReviewed: true
  },
  {
    id: 5,
    title: '下北沢の隠れ家レコードショップ',
    attenderId: 2,
    attenderName: '山田 ユカリ',
    attenderType: 'アーティスト',
    date: '2025-02-10',
    time: '16:00',
    location: '下北沢駅 南口',
    status: 'cancelled',
    price: 6000,
    isReviewed: false
  }
];

// 予約履歴画面コンポーネント
const BookingHistoryScreen: React.FC = () => {
  const { isAuthenticated, openLoginModal } = useAuth();
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<BookingType | null>(null);
  
  if (!isAuthenticated) {
    return (
      <div className="p-4 flex flex-col items-center justify-center h-full space-y-4">
        <div className="bg-gray-100 rounded-full p-6">
          <Calendar size={48} className="text-gray-400" />
        </div>
        <h2 className="text-xl font-bold text-center">旅程を表示</h2>
        <p className="text-gray-600 text-center">
          予約した体験や今後の旅程を確認するには、ログインしてください。
        </p>
        <button 
          onClick={openLoginModal}
          className="mt-4 bg-black text-white py-2 px-6 rounded-lg font-medium"
        >
          ログイン / 新規登録
        </button>
      </div>
    );
  }
  
  // タブに応じたデータをフィルタリング
  const upcomingBookings = mockBookings.filter(booking => booking.status === 'upcoming');
  const pastBookings = mockBookings.filter(booking => booking.status === 'completed' || booking.status === 'cancelled');
  
  // 表示するデータを選択
  const bookingsToShow = activeTab === 'upcoming' ? upcomingBookings : pastBookings;
  
  // レビュー投稿モーダルを開く
  const handleOpenReviewModal = (booking: BookingType) => {
    setSelectedBooking(booking);
    setShowReviewModal(true);
  };
  
  // 予約詳細に移動
  const handleViewBookingDetail = (booking: BookingType) => {
    // 予約詳細画面への遷移を実装
    console.log('View booking detail:', booking.id);
  };
  
  return (
    <div className="bg-gray-50 min-h-screen pb-16">
      <div className="bg-white p-4 shadow-sm">
        <h1 className="text-2xl font-bold">あなたの旅程</h1>
      </div>
      
      {/* タブ */}
      <div className="bg-white border-b">
        <div className="flex">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`flex-1 py-3 font-medium text-center ${
              activeTab === 'upcoming' 
                ? 'text-black border-b-2 border-black' 
                : 'text-gray-500'
            }`}
          >
            今後の予定
          </button>
          <button
            onClick={() => setActiveTab('past')}
            className={`flex-1 py-3 font-medium text-center ${
              activeTab === 'past' 
                ? 'text-black border-b-2 border-black' 
                : 'text-gray-500'
            }`}
          >
            過去の体験
          </button>
        </div>
      </div>
      
      {/* 予約リスト */}
      <div className="p-4 space-y-4">
        {bookingsToShow.length === 0 ? (
          <div className="text-center py-8">
            <div className="bg-gray-100 rounded-full p-6 inline-flex mb-4">
              <Calendar size={48} className="text-gray-400" />
            </div>
            <p className="text-gray-600">
              {activeTab === 'upcoming' 
                ? '今後の予定はありません'
                : '過去の体験はありません'}
            </p>
          </div>
        ) : (
          bookingsToShow.map((booking) => (
            <div 
              key={booking.id} 
              className="bg-white rounded-lg shadow-sm overflow-hidden"
            >
              {/* イメージがあれば表示 */}
              {booking.imageUrl && (
                <div className="relative h-32 bg-gray-200">
                  <img 
                    src={booking.imageUrl} 
                    alt={booking.title} 
                    className="w-full h-full object-cover"
                  />
                  {/* ステータスバッジ */}
                  {booking.status === 'cancelled' && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                      キャンセル済
                    </div>
                  )}
                  {booking.status === 'payment_pending' && (
                    <div className="absolute top-2 right-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded">
                      支払い待ち
                    </div>
                  )}
                </div>
              )}
              
              {/* 予約内容 */}
              <div className="p-4">
                <h2 className="font-bold text-lg mb-1">{booking.title}</h2>
                <p className="text-gray-600 text-sm">
                  {booking.attenderName} ({booking.attenderType})
                </p>
                
                <div className="mt-3 space-y-2">
                  <div className="flex items-center">
                    <Calendar size={16} className="text-gray-500 mr-2" />
                    <p className="text-sm text-gray-700">
                      {new Date(booking.date).toLocaleDateString('ja-JP', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        weekday: 'long'
                      })}
                    </p>
                  </div>
                  
                  <div className="flex items-center">
                    <Clock size={16} className="text-gray-500 mr-2" />
                    <p className="text-sm text-gray-700">{booking.time}～</p>
                  </div>
                  
                  <div className="flex items-start">
                    <MapPin size={16} className="text-gray-500 mr-2 mt-1" />
                    <p className="text-sm text-gray-700">{booking.location}</p>
                  </div>
                </div>
                
                {/* アクションボタン */}
                <div className="mt-4 flex flex-wrap justify-between items-center">
                  <div>
                    <p className="font-medium">¥{booking.price.toLocaleString()}</p>
                    {booking.paymentStatus && (
                      <p className={`text-xs mt-1 ${booking.paymentStatus === 'paid' ? 'text-green-600' : booking.paymentStatus === 'pending' ? 'text-yellow-600' : 'text-red-600'}`}>
                        {booking.paymentStatus === 'paid' ? '支払い完了' : booking.paymentStatus === 'pending' ? '支払い手続き中' : '支払い失敗'}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex space-x-2">
                    {activeTab === 'upcoming' ? (
                      <>
                        {booking.status === 'payment_pending' ? (
                          <button 
                            className="text-sm bg-black text-white px-3 py-1 rounded"
                            onClick={() => handleViewBookingDetail(booking)}
                          >
                            支払いを完了する
                          </button>
                        ) : (
                          <button 
                            onClick={() => handleViewBookingDetail(booking)}
                            className="flex items-center text-sm font-medium"
                          >
                            詳細を見る
                            <ChevronRight size={16} />
                          </button>
                        )}
                      </>
                    ) : (
                      <>
                        {booking.status === 'completed' && !booking.isReviewed && (
                          <button 
                            onClick={() => handleOpenReviewModal(booking)}
                            className="text-sm bg-black text-white px-3 py-1 rounded flex items-center"
                          >
                            <Star size={14} className="mr-1" />
                            レビューを書く
                          </button>
                        )}
                        <button 
                          onClick={() => handleViewBookingDetail(booking)}
                          className="flex items-center text-sm font-medium"
                        >
                          詳細を見る
                          <ChevronRight size={16} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      
      {/* レビューモーダル（実際はimportするコンポーネント） */}
      {showReviewModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-md p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold">体験のレビュー</h3>
              <button onClick={() => setShowReviewModal(false)} className="text-gray-500">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div>
              <p className="font-medium">{selectedBooking.title}</p>
              <p className="text-sm text-gray-600">
                {selectedBooking.attenderName} ({selectedBooking.attenderType})
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {new Date(selectedBooking.date).toLocaleDateString('ja-JP')}
              </p>
            </div>
            
            <div>
              <p className="text-sm font-medium text-gray-700 mb-1">評価</p>
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star 
                    key={star}
                    size={24} 
                    className="text-gray-300 cursor-pointer hover:text-yellow-400"
                  />
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                体験の感想
              </label>
              <textarea
                placeholder="体験はいかがでしたか？他の利用者の参考になる点を教えてください"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-gray-500 focus:border-gray-500"
                rows={4}
              ></textarea>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                写真を追加（任意）
              </label>
              <button className="w-full border border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center">
                <Image size={24} className="text-gray-400 mb-2" />
                <span className="text-sm text-gray-600">写真をアップロード</span>
              </button>
            </div>
            
            <div className="flex space-x-3 pt-2">
              <button
                onClick={() => setShowReviewModal(false)}
                className="flex-1 py-2 border border-gray-300 rounded-lg font-medium"
              >
                キャンセル
              </button>
              <button
                onClick={() => {
                  console.log('レビューを投稿');
                  setShowReviewModal(false);
                }}
                className="flex-1 py-2 bg-black text-white rounded-lg font-medium"
              >
                投稿する
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingHistoryScreen;