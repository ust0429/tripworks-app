import React, { useState, useEffect } from 'react';
import { Search, MapPin, Calendar, Clock, Star, ChevronDown, Menu, X, User, MessageCircle, Home, Compass, Heart, Users, ShoppingBag, Gift, Coffee, Sunrise, Info, Music, Camera, Headphones, Hammer, Utensils, Map, LogOut } from 'lucide-react';
import { AuthProvider, useAuth } from './AuthComponents';
import AttenderDetailScreen from './components/AttenderDetailScreen';
import DirectRequestModal from './components/DirectRequestModal';
import ReviewModal from './components/ReviewModal';
import ExploreScreen from './components/ExploreScreen'; // 追加
import AttenderCard from './components/AttenderCard';
import { getCurrentLocation } from './utils/mapUtils';
import { AttenderType, IconProps, PastExperience } from './types';

// サンプルデータ
const attendersData: AttenderType[] = [
  {
    id: 1,
    name: '鈴木 アキラ',
    type: 'バンドマン',
    description: '東京の地下音楽シーンを知り尽くしたベテランミュージシャン。名ライブハウスから秘密のスタジオまでご案内します。',
    rating: '4.9',
    distance: '2.3km先',
    icon: <Music size={20} />
  },
  {
    id: 2,
    name: '山田 ユカリ',
    type: 'アーティスト',
    description: '地元で活動する現代アーティスト。アトリエ巡りから創作体験まで、芸術の視点から街の魅力を再発見。',
    rating: '4.8',
    distance: '1.5km先',
    icon: <Camera size={20} />
  },
  {
    id: 3,
    name: '佐藤 ケンジ',
    type: 'クラフトビール職人',
    description: '地元醸造所のマスターブリュワー。ビール造りの過程から地域の食文化まで、職人視点の旅へ。',
    rating: '4.7',
    distance: '3.1km先',
    icon: <Coffee size={20} />
  },
];

// 人気リクエストのサンプルデータ
const popularRequests = [
  {
    id: 1,
    icon: <Music size={28} className="text-gray-800" />,
    title: '地元ミュージシャンのライブ体験',
    description: '観光客が知らない本物の音楽シーンを体験',
  },
  {
    id: 2,
    icon: <Camera size={28} className="text-gray-800" />,
    title: '夜の裏路地フォトスポット巡り',
    description: 'インスタ映えする隠れた撮影スポットへ',
  },
  {
    id: 3,
    icon: <Utensils size={28} className="text-gray-800" />,
    title: '地元民御用達の食堂めぐり',
    description: 'ガイドブックに載っていない味を堪能',
  },
];

// HomeScreen コンポーネント
interface HomeScreenProps {
  onAttenderClick: (id: number) => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ onAttenderClick }) => {
  const [currentLocation, setCurrentLocation] = useState('東京');
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [coordinates, setCoordinates] = useState<[number, number]>([139.7690, 35.6804]); // 東京のデフォルト座標
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const { isAuthenticated, openLoginModal } = useAuth();

  const handleRequestClick = () => {
    if (isAuthenticated) {
      setRequestModalOpen(true);
    } else {
      openLoginModal();
    }
  };

  // 現在地取得処理
  const handleGetLocation = async () => {
    setIsLoadingLocation(true);
    try {
      const location = await getCurrentLocation();
      setCoordinates(location);
      setCurrentLocation('現在地');
    } catch (error) {
      console.error('位置情報の取得に失敗しました:', error);
      // エラー処理（必要に応じてユーザーに通知）
    } finally {
      setIsLoadingLocation(false);
    }
  };

  return (
    <div className="p-4 space-y-6">
      <h2 className="text-2xl font-bold mb-3">体験を検索</h2>    
      {/* 検索バー */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search size={20} className="text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="行き先、アテンダー、体験を検索"
          className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
        />
      </div>

      {/* 現在地と日時 */}
      <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm">
        <div className="flex items-center space-x-2">
          <MapPin size={20} className="text-black" />
          <span className="font-medium">
            {isLoadingLocation ? '位置情報取得中...' : currentLocation}
          </span>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <Calendar size={18} className="text-gray-500" />
            <span className="text-sm text-gray-700">今日</span>
          </div>
          <div className="flex items-center space-x-1">
            <Clock size={18} className="text-gray-500" />
            <span className="text-sm text-gray-700">今すぐ</span>
          </div>
        </div>
      </div>
      
      {/* リクエストボタン */}
      <button 
        onClick={handleRequestClick}
        className="w-full bg-black text-white py-4 rounded-lg font-medium text-lg shadow-md hover:bg-gray-800 transition duration-200 flex items-center justify-center"
      >
        <span className="font-bold">アテンダーをリクエスト</span>
      </button>
      
      {/* 人気リクエスト */}
      <div>
        <h2 className="text-xl font-bold mb-3">人気リクエスト</h2>
        <div className="space-y-3">
          {popularRequests.map((request) => (
            <div key={request.id} className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {request.icon}
                  <div>
                    <p className="font-medium">{request.title}</p>
                    <p className="text-sm text-gray-600">{request.description}</p>
                  </div>
                </div>
                <button 
                  onClick={isAuthenticated ? () => {} : openLoginModal}
                  className="text-black text-sm font-medium"
                >
                  リクエスト
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* アテンダーカード */}
      <div>
        <h2 className="text-xl font-bold mb-3">おすすめのアテンダー</h2>
        <div className="space-y-4">
          {attendersData.map((attender) => (
            <div 
              key={attender.id}
              onClick={() => onAttenderClick(attender.id)}
              className="cursor-pointer"
            >
              <AttenderCard attender={attender} />
            </div>
          ))}
        </div>
      </div>

      {/* リクエストモーダル */}
      {requestModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-md p-6 space-y-4">
            <h3 className="text-xl font-bold">新しいリクエスト</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                あなたの体験したいことは？
              </label>
              <textarea
                placeholder="例：地元の音楽シーンを知りたい、裏路地のカフェを巡りたい..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-gray-500 focus:border-gray-500"
                rows={3}
              ></textarea>
            </div>
            
            {/* サンプルリクエスト例 */}
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm font-medium text-gray-700 mb-2">人気リクエスト例：</p>
              <div className="flex flex-wrap gap-2">
                <button className="text-xs bg-gray-200 hover:bg-gray-300 py-1 px-2 rounded-full">地元の音楽ライブハウス巡り</button>
                <button className="text-xs bg-gray-200 hover:bg-gray-300 py-1 px-2 rounded-full">フォトジェニックな裏路地を案内</button>
                <button className="text-xs bg-gray-200 hover:bg-gray-300 py-1 px-2 rounded-full">地元民しか知らない穴場カフェ</button>
                <button className="text-xs bg-gray-200 hover:bg-gray-300 py-1 px-2 rounded-full">伝統工芸の職人工房訪問</button>
                <button className="text-xs bg-gray-200 hover:bg-gray-300 py-1 px-2 rounded-full">夜の屋台文化探訪</button>
              </div>
            </div>
            
            {/* 日時選択など */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  日付
                </label>
                <input
                  type="date"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-gray-500 focus:border-gray-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  時間
                </label>
                <input
                  type="time"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-gray-500 focus:border-gray-500"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                希望の時間（時間）
              </label>
              <select className="w-full p-2 border border-gray-300 rounded-lg focus:ring-gray-500 focus:border-gray-500">
                <option>1時間</option>
                <option>2時間</option>
                <option>3時間</option>
                <option>4時間以上</option>
              </select>
            </div>
            
            <div className="flex space-x-3 pt-2">
              <button
                onClick={() => setRequestModalOpen(false)}
                className="flex-1 py-3 border border-gray-300 rounded-lg font-medium"
              >
                キャンセル
              </button>
              <button
                onClick={() => setRequestModalOpen(false)}
                className="flex-1 py-3 bg-black text-white rounded-lg font-medium"
              >
                リクエスト送信
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// 簡易版のトリップ画面
const TripsScreen: React.FC = () => {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">あなたの旅程</h1>
      <p className="text-gray-500">この画面では予約した旅程を確認できます。</p>
    </div>
  );
};

// 簡易版の保存済み画面
const SavedScreen: React.FC<{ onAttenderClick: (id: number) => void }> = ({ onAttenderClick }) => {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">保存済み</h1>
      <p className="text-gray-500">お気に入りに登録したアテンダーや体験が表示されます。</p>
    </div>
  );
};

// 簡易版のマーケット画面
const MarketScreen: React.FC = () => {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">マーケット</h1>
      <p className="text-gray-500">地域の特産品を購入できます。</p>
    </div>
  );
};

// 簡易版のコミュニティ画面
const CommunityScreen: React.FC = () => {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">コミュニティ</h1>
      <p className="text-gray-500">地域コミュニティのプロジェクトに参加できます。</p>
    </div>
  );
};

// 簡易版のイベント画面
const SeasonalEventsScreen: React.FC = () => {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">季節限定イベント</h1>
      <p className="text-gray-500">季節に応じた特別なイベント情報を確認できます。</p>
    </div>
  );
};

// 簡易版のプロフィール画面
const ProfileScreen: React.FC = () => {
  const { user, logout } = useAuth();
  
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">プロフィール</h1>
      {user ? (
        <div>
          <p>ユーザー名: {user.name}</p>
          <p>メール: {user.email}</p>
          <button 
            onClick={logout}
            className="mt-4 px-4 py-2 bg-red-50 text-red-600 rounded-lg"
          >
            ログアウト
          </button>
        </div>
      ) : (
        <p className="text-gray-500">ログインしてください</p>
      )}
    </div>
  );
};

// アプリのコンテンツ部分
const AppContent = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedAttenderId, setSelectedAttenderId] = useState<number | null>(null);
  const { isAuthenticated, user, logout, openLoginModal } = useAuth();

  // アテンダー詳細ページに遷移する関数
  const handleAttenderClick = (id: number) => {
    setSelectedAttenderId(id);
  };

  // アテンダー詳細ページから戻る関数
  const handleBackFromDetail = () => {
    setSelectedAttenderId(null);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
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
        {selectedAttenderId ? (
          <AttenderDetailScreen attenderId={selectedAttenderId} onBack={handleBackFromDetail} />
        ) : (
          <>
            {activeTab === 'home' && <HomeScreen onAttenderClick={handleAttenderClick} />}
            {activeTab === 'explore' && (
  <ExploreScreen 
    onAttenderClick={handleAttenderClick} 
    attendersData={attendersData}
  />
)}
            {activeTab === 'trips' && <TripsScreen />}
            {activeTab === 'saved' && <SavedScreen onAttenderClick={handleAttenderClick} />}
            {activeTab === 'market' && <MarketScreen />}
            {activeTab === 'community' && <CommunityScreen />}
            {activeTab === 'events' && <SeasonalEventsScreen />}
            {activeTab === 'profile' && <ProfileScreen />}
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
                <li className="flex items-center space-x-3 text-gray-700 hover:text-black cursor-pointer">
                  <MessageCircle size={20} />
                  <span>メッセージ</span>
                </li>
                <li className="flex items-center space-x-3 text-gray-700 hover:text-black cursor-pointer">
                  <Heart size={20} />
                  <span>お気に入り</span>
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
      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around items-center h-16 z-30">
        <button
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center justify-center flex-1 h-full ${activeTab === 'home' ? 'text-black' : 'text-gray-500'}`}
        >
          <Home size={20} />
          <span className="text-xs mt-1">ホーム</span>
        </button>
        <button
          onClick={() => setActiveTab('explore')}
          className={`flex flex-col items-center justify-center flex-1 h-full ${activeTab === 'explore' ? 'text-black' : 'text-gray-500'}`}
        >
          <Compass size={20} />
          <span className="text-xs mt-1">探索</span>
        </button>
        <button
          onClick={() => setActiveTab('trips')}
          className={`flex flex-col items-center justify-center flex-1 h-full ${activeTab === 'trips' ? 'text-black' : 'text-gray-500'}`}
        >
          <Calendar size={20} />
          <span className="text-xs mt-1">旅程</span>
        </button>
        <button
          onClick={() => setActiveTab('events')}
          className={`flex flex-col items-center justify-center flex-1 h-full ${activeTab === 'events' ? 'text-black' : 'text-gray-500'}`}
        >
          <Gift size={20} />
          <span className="text-xs mt-1">イベント</span>
        </button>
        <button
          onClick={() => setActiveTab('community')}
          className={`flex flex-col items-center justify-center flex-1 h-full ${activeTab === 'community' ? 'text-black' : 'text-gray-500'}`}
        >
          <Users size={20} />
          <span className="text-xs mt-1">コミュニティ</span>
        </button>
      </footer>
    </div>
  );
};

// メインアプリコンポーネント
const App = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;