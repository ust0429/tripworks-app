import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { MessageCircle, Menu, X, User, Home, Compass, Heart, Users, ShoppingBag, Gift, Calendar, LogOut } from 'lucide-react';
import { AuthProvider, useAuth } from './AuthComponents';
import { PaymentProvider } from './contexts/PaymentContext';
import AttenderDetailScreen from './components/AttenderDetailScreen';
import ExploreScreen from './components/ExploreScreen';
import { MessagesScreen } from './components/messages';
import BookingConfirmationScreen from './components/BookingConfirmationScreen';
import OnboardingScreen from './components/screens/OnboardingScreen';
import BookingHistoryScreen from './components/screens/BookingHistoryScreen';
import { HomeScreen } from './components/screens';
import { AttenderType } from './types';

// サンプルデータ
const attendersData: AttenderType[] = [
  {
    id: 1,
    name: '鈴木 アキラ',
    type: 'バンドマン',
    description: '東京の地下音楽シーンを知り尽くしたベテランミュージシャン。名ライブハウスから秘密のスタジオまでご案内します。',
    rating: '4.9',
    distance: '2.3km先',
    icon: <User size={20} />
  },
  {
    id: 2,
    name: '山田 ユカリ',
    type: 'アーティスト',
    description: '地元で活動する現代アーティスト。アトリエ巡りから創作体験まで、芸術の視点から街の魅力を再発見。',
    rating: '4.8',
    distance: '1.5km先',
    icon: <User size={20} />
  },
  {
    id: 3,
    name: '佐藤 ケンジ',
    type: 'クラフトビール職人',
    description: '地元醸造所のマスターブリュワー。ビール造りの過程から地域の食文化まで、職人視点の旅へ。',
    rating: '4.7',
    distance: '3.1km先',
    icon: <User size={20} />
  },
];

// マーケット画面
const MarketScreen = () => {
  return (
    <div className="p-4 flex items-center justify-center h-full">
      <div className="text-center">
        <div className="bg-gray-100 rounded-full p-6 inline-flex mb-4">
          <ShoppingBag size={48} className="text-gray-400" />
        </div>
        <h2 className="text-xl font-bold mb-2">マーケット</h2>
        <p className="text-gray-600">地域の特産品や限定アイテムを<br/>購入できるマーケット機能は<br/>現在開発中です。</p>
      </div>
    </div>
  );
};

// 保存済み画面
const SavedScreen = () => {
  const { isAuthenticated, openLoginModal } = useAuth();
  
  if (!isAuthenticated) {
    return (
      <div className="p-4 flex flex-col items-center justify-center h-full space-y-4">
        <div className="bg-gray-100 rounded-full p-6">
          <Heart size={48} className="text-gray-400" />
        </div>
        <h2 className="text-xl font-bold text-center">お気に入りを保存</h2>
        <p className="text-gray-600 text-center">
          アテンダーや体験をお気に入りに保存するには、ログインしてください。
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
  
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">保存済み</h1>
      <p className="text-gray-600">お気に入りはありません</p>
    </div>
  );
};

// コミュニティ画面
const CommunityScreen = () => {
  return (
    <div className="p-4 flex items-center justify-center h-full">
      <div className="text-center">
        <div className="bg-gray-100 rounded-full p-6 inline-flex mb-4">
          <Users size={48} className="text-gray-400" />
        </div>
        <h2 className="text-xl font-bold mb-2">コミュニティ</h2>
        <p className="text-gray-600">地域コミュニティとの交流や<br/>コミュニティプロジェクトへの<br/>参加機能は現在開発中です。</p>
      </div>
    </div>
  );
};

// 季節限定イベント画面
const SeasonalEventsScreen = () => {
  return (
    <div className="p-4 flex items-center justify-center h-full">
      <div className="text-center">
        <div className="bg-gray-100 rounded-full p-6 inline-flex mb-4">
          <Gift size={48} className="text-gray-400" />
        </div>
        <h2 className="text-xl font-bold mb-2">季節限定イベント</h2>
        <p className="text-gray-600">季節ごとの特別イベントや<br/>限定体験の情報は<br/>現在開発中です。</p>
      </div>
    </div>
  );
};

// プロフィール画面
const ProfileScreen = () => {
  const { user, logout } = useAuth();
  
  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold">プロフィール</h1>
      
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-gray-700 text-2xl font-medium">
            {user?.name.charAt(0)}
          </div>
          <div>
            <h2 className="text-xl font-bold">{user?.name}</h2>
            <p className="text-gray-600">{user?.email}</p>
          </div>
        </div>
        
        <div className="mt-8 flex justify-between">
          <button className="px-4 py-2 bg-gray-100 text-black rounded-lg">
            プロフィールを編集
          </button>
          <button 
            onClick={logout}
            className="px-4 py-2 bg-red-50 text-red-600 rounded-lg"
          >
            ログアウト
          </button>
        </div>
      </div>
    </div>
  );
};

// PaymentProviderのラッパーコンポーネント
const PaymentProviderWithNavigate = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  return <PaymentProvider navigate={navigate}>{children}</PaymentProvider>;
};

// アプリのコンテンツ部分
const AppContent = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedAttenderId, setSelectedAttenderId] = useState<number | null>(null);
  const [bookingData, setBookingData] = useState<{
    attenderId: number;
    experienceId?: number;
    date: string;
    time: string;
    duration: string;
    location: string;
    price: number;
  } | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const { isAuthenticated, user, logout, openLoginModal } = useAuth();

  // 初回起動時にオンボーディング表示
  useEffect(() => {
    // localStorage でオンボーディング表示済みかチェック
    const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
    if (!hasSeenOnboarding) {
      setShowOnboarding(true);
    }
  }, []);

  // オンボーディング完了時の処理
  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    localStorage.setItem('hasSeenOnboarding', 'true');
  };

  // アテンダー詳細ページに遷移する関数
  const handleAttenderClick = (id: number) => {
    setSelectedAttenderId(id);
  };

  // アテンダー詳細ページから戻る関数
  const handleBackFromDetail = () => {
    setSelectedAttenderId(null);
  };

  // 予約確認画面を表示する関数
  const handleBookingRequest = (data: {
    attenderId: number;
    experienceId?: number;
    date: string;
    time: string;
    duration: string;
    location: string;
    price: number;
  }) => {
    setBookingData(data);
  };

  // 予約確認画面から戻る関数
  const handleBackFromBooking = () => {
    setBookingData(null);
  };

  // 予約確定処理
  const handleConfirmBooking = () => {
    // 旅程画面に遷移
    setBookingData(null);
    setActiveTab('trips');
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* オンボーディング画面 */}
      {showOnboarding && (
        <OnboardingScreen onComplete={handleOnboardingComplete} />
      )}

      {/* ヘッダー */}
      <header className="bg-black text-white p-4 flex justify-between items-center">
        <div className="flex items-center">
          <h1 className="text-2xl" style={{ fontFamily: 'sans-serif' }}>
            <span className="font-bold">e</span>
            <span className="font-light">cho</span>
            <span className="text-xs align-top ml-1" style={{ opacity: 0.7 }}>β</span>
          </h1>
        </div>
        <div className="flex items-center space-x-2">
          {isAuthenticated ? (
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 rounded-full hover:bg-gray-800 flex items-center space-x-2"
            >
              <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center text-white text-sm">
                {user?.name.charAt(0)}
              </div>
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          ) : (
            <>
              <button
                onClick={openLoginModal}
                className="py-1 px-3 border border-white rounded-full text-sm hover:bg-white hover:text-black transition duration-200"
              >
                ログイン
              </button>
              <button onClick={() => setMenuOpen(!menuOpen)} className="p-2 rounded-full hover:bg-gray-800">
                {menuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </>
          )}
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="flex-1 overflow-auto pb-16">
        {bookingData ? (
          <BookingConfirmationScreen 
            attenderId={bookingData.attenderId}
            experienceId={bookingData.experienceId}
            date={bookingData.date}
            time={bookingData.time}
            duration={bookingData.duration}
            location={bookingData.location}
            price={bookingData.price}
            onBack={handleBackFromBooking}
            onConfirm={handleConfirmBooking}
            onCancel={handleBackFromBooking}
            attendersData={attendersData}
          />
        ) : selectedAttenderId ? (
          <AttenderDetailScreen 
            attenderId={selectedAttenderId} 
            onBack={handleBackFromDetail}
            onBookingRequest={handleBookingRequest}
          />
        ) : (
          <>
            {activeTab === 'home' && <HomeScreen onAttenderClick={handleAttenderClick} attendersData={attendersData} />}
            {activeTab === 'explore' && <ExploreScreen onAttenderClick={handleAttenderClick} attendersData={attendersData} />}
            {activeTab === 'trips' && <BookingHistoryScreen />}
            {activeTab === 'saved' && <SavedScreen />}
            {activeTab === 'market' && <MarketScreen />}
            {activeTab === 'community' && <CommunityScreen />}
            {activeTab === 'events' && <SeasonalEventsScreen />}
            {activeTab === 'profile' && <ProfileScreen />}
            {activeTab === 'messages' && <MessagesScreen />}
          </>
        )}
      </main>

      {/* メニュー (サイドバー) */}
      {menuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setMenuOpen(false)}>
          <div className="absolute right-0 top-0 bottom-0 w-64 bg-white shadow-lg z-50" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b">
              {isAuthenticated ? (
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-700 text-lg font-medium">
                    {user?.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium">{user?.name}</p>
                    <p className="text-sm text-gray-500">{user?.email}</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <div className="bg-gray-100 rounded-full p-2">
                    <User size={24} className="text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium">ゲストさん</p>
                    <p className="text-sm text-gray-500">
                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          openLoginModal();
                        }}
                        className="text-black hover:underline"
                      >
                        ログイン / 新規登録
                      </button>
                    </p>
                  </div>
                </div>
              )}
            </div>
            <div className="p-4">
              <ul className="space-y-4">
                {isAuthenticated && (
                  <li
                    className="flex items-center space-x-3 text-gray-700 hover:text-black cursor-pointer"
                    onClick={() => {
                      setActiveTab('profile');
                      setMenuOpen(false);
                    }}
                  >
                    <User size={20} />
                    <span>プロフィール</span>
                  </li>
                )}
                <li 
                  className="flex items-center space-x-3 text-gray-700 hover:text-black cursor-pointer"
                  onClick={() => {
                    setActiveTab('messages');
                    setMenuOpen(false);
                  }}
                >
                  <MessageCircle size={20} />
                  <span>メッセージ</span>
                </li>
                <li 
                  className="flex items-center space-x-3 text-gray-700 hover:text-black cursor-pointer"
                  onClick={() => {
                    setActiveTab('saved');
                    setMenuOpen(false);
                  }}
                >
                  <Heart size={20} />
                  <span>お気に入り</span>
                </li>
                <li 
                  className="flex items-center space-x-3 text-gray-700 hover:text-black cursor-pointer"
                  onClick={() => {
                    setActiveTab('trips');
                    setMenuOpen(false);
                  }}
                >
                  <Calendar size={20} />
                  <span>旅程</span>
                </li>
                <li className="border-t my-2 pt-2 flex items-center space-x-3 text-gray-700 hover:text-black cursor-pointer">
                  <span>ヘルプ</span>
                </li>
                <li className="flex items-center space-x-3 text-gray-700 hover:text-black cursor-pointer">
                  <span>設定</span>
                </li>
                {isAuthenticated && (
                  <li
                    className="border-t my-2 pt-2 flex items-center space-x-3 text-red-600 hover:text-red-700 cursor-pointer"
                    onClick={() => {
                      logout();
                      setMenuOpen(false);
                    }}
                  >
                    <LogOut size={20} />
                    <span>ログアウト</span>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* フッター */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around items-center h-14 z-30">
        <button
          onClick={() => setActiveTab('home')}
          className={`flex items-center justify-center flex-1 h-full ${activeTab === 'home' ? 'text-black' : 'text-gray-500'}`}
        >
          <Home size={24} />
        </button>
        <button
          onClick={() => setActiveTab('explore')}
          className={`flex items-center justify-center flex-1 h-full ${activeTab === 'explore' ? 'text-black' : 'text-gray-500'}`}
        >
          <Compass size={24} />
        </button>
        <button
          onClick={() => setActiveTab('trips')}
          className={`flex items-center justify-center flex-1 h-full ${activeTab === 'trips' ? 'text-black' : 'text-gray-500'}`}
        >
          <Calendar size={24} />
        </button>
        <button
          onClick={() => setActiveTab('market')}
          className={`flex items-center justify-center flex-1 h-full ${activeTab === 'market' ? 'text-black' : 'text-gray-500'}`}
        >
          <ShoppingBag size={24} />
        </button>
        <button
          onClick={() => setActiveTab('events')}
          className={`flex items-center justify-center flex-1 h-full ${activeTab === 'events' ? 'text-black' : 'text-gray-500'}`}
        >
          <Gift size={24} />
        </button>
        <button
          onClick={() => setActiveTab('community')}
          className={`flex items-center justify-center flex-1 h-full ${activeTab === 'community' ? 'text-black' : 'text-gray-500'}`}
        >
          <Users size={24} />
        </button>
      </footer>
    </div>
  );
};

// メインアプリコンポーネント
const TripworksApp = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="*" element={
            <PaymentProviderWithNavigate>
              <AppContent />
            </PaymentProviderWithNavigate>
          } />
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default TripworksApp;