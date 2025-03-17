import React, { useState } from 'react';
import { Search, MapPin, Calendar, Clock, Star, ChevronDown, Menu, X, User, MessageCircle, Home, Compass, Heart, Users, ShoppingBag, Gift, Coffee, Sunrise, Info, Music, Camera, Headphones, Hammer, Utensils, Map, LogOut } from 'lucide-react';
import { AuthProvider, useAuth } from './AuthComponents';
import AttenderDetailScreen from './components/AttenderDetailScreen';
import DirectRequestModal from './components/DirectRequestModal';
import ReviewModal from './components/ReviewModal'; // 追加
import { AttenderType, IconProps, PastExperience } from './types'; // PastExperience を追加
import TripsScreen from './components/TripsScreen';
import ReviewsList from './components/ReviewsList';
import ReviewCard from './components/ReviewCard';

// TypeScript型定義
interface DirectRequestModalProps {
  attender: AttenderType;
  onClose: () => void;
}

interface AttenderCardProps {
  attender: AttenderType;
  compact?: boolean;
}

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

// マーケットアイテムのサンプルデータ
const marketItems = [
  {
    id: 1,
    name: '地元職人の手作り陶器セット',
    price: 8500,
    description: '伝統技術で作られた日常使いの器。シンプルかつ上品なデザイン。',
    attender: '山本 工房主',
    region: '京都',
    icon: <Hammer size={24} />
  },
  {
    id: 2,
    name: '限定醸造クラフトビール6本セット',
    price: 3600,
    description: '地元の食材を使った季節限定の特別醸造ビール。贈り物にも最適。',
    attender: '佐藤 ケンジ',
    region: '横浜',
    icon: <Coffee size={24} />
  },
  {
    id: 3,
    name: '朝市直送の海産物セット',
    price: 5800,
    description: '漁港から直送の新鮮な海産物。アテンダーがセレクトした特選品。',
    attender: '鈴木 漁師',
    region: '福岡',
    icon: <Utensils size={24} />
  },
];

// コミュニティプロジェクトのサンプルデータ
const communityProjects = [
  {
    id: 1,
    title: '伝統工芸の継承プロジェクト',
    location: '京都市',
    status: '進行中',
    description: '地域の若手職人を支援し、伝統技術を次世代に継承するためのワークショップや展示会を開催します。',
    progress: 65,
    icon: <Hammer size={24} />
  },
  {
    id: 2,
    title: '商店街活性化プロジェクト',
    location: '神戸市',
    status: '計画中',
    description: 'シャッター街となりつつある商店街に若手クリエイターを誘致し、新しい魅力を創出するプロジェクト。',
    progress: 30,
    icon: <ShoppingBag size={24} />
  },
];

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

// アテンダーカードコンポーネント
const AttenderCard = ({ attender, compact = false }: AttenderCardProps) => {
  const [directRequestModalOpen, setDirectRequestModalOpen] = useState(false);
  const { isAuthenticated, openLoginModal } = useAuth();

  const handleRequestClick = () => {
    if (isAuthenticated) {
      setDirectRequestModalOpen(true);
    } else {
      openLoginModal();
    }
  };

  if (compact) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-3 flex items-center space-x-3">
        <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded-full overflow-hidden flex items-center justify-center">
        {attender.icon ? React.cloneElement(attender.icon as React.ReactElement<any>, { size: 24, className: "text-gray-600" }) : null}
        </div>
        <div className="flex-1">
          <div className="flex justify-between">
            <div>
              <p className="font-medium">{attender.name}</p>
              <p className="text-sm text-gray-500">{attender.type}</p>
            </div>
            <div className="flex items-center">
              <Star size={16} className="text-yellow-500" />
              <span className="text-sm ml-1">{attender.rating}</span>
            </div>
          </div>
          <div className="flex justify-between items-center mt-1">
            <p className="text-sm text-gray-700">{attender.distance}</p>
            <button 
              onClick={handleRequestClick} 
              className="px-3 py-1 bg-black text-white rounded-lg text-xs">
              リクエスト
            </button>
          </div>
        </div>
        
        {/* 直接リクエストモーダル */}
        {directRequestModalOpen && (
          <DirectRequestModal 
            attender={attender}
            onClose={() => setDirectRequestModalOpen(false)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="h-40 bg-gray-100 relative flex items-center justify-center">
        {/* アテンダーのアイコン (大きく表示) */}
        {attender.icon ? React.cloneElement(attender.icon as React.ReactElement<any>, { size: 64, className: "text-gray-400 opacity-30" }) : null}
        <div className="absolute bottom-3 left-3 bg-white rounded-full p-1 px-3 text-sm font-medium">
          {attender.type}
        </div>
        {isAuthenticated && (
          <button className="absolute top-3 right-3 bg-white rounded-full p-2 shadow-sm">
            <Heart size={16} className="text-gray-700" />
          </button>
        )}
      </div>
      <div className="p-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gray-200 rounded-full overflow-hidden flex items-center justify-center">
            {attender.icon ? React.cloneElement(attender.icon as React.ReactElement<any>, { size: 20, className: "text-gray-600" }) : null}
            </div>
            <p className="font-medium">{attender.name}</p>
          </div>
          <div className="flex items-center">
            <Star size={16} className="text-yellow-500" />
            <span className="text-sm ml-1">{attender.rating}</span>
          </div>
        </div>
        <p className="text-sm text-gray-700 mt-2">{attender.description}</p>
        <div className="flex justify-between items-center mt-3">
          <p className="text-sm text-gray-500">{attender.distance}</p>
          <button 
            onClick={handleRequestClick}
            className="px-4 py-2 bg-black text-white rounded-lg text-sm">
            リクエストする
          </button>
        </div>
      </div>
      
      {/* 直接リクエストモーダル */}
      {directRequestModalOpen && (
        <DirectRequestModal 
          attender={attender}
          onClose={() => setDirectRequestModalOpen(false)}
        />
      )}
    </div>
  );
};

// 各画面コンポーネント
// HomeScreen コンポーネントの修正
interface HomeScreenProps {
  onAttenderClick: (id: number) => void;
}

const HomeScreen = ({ onAttenderClick }: HomeScreenProps) => {
  const [currentLocation, _setCurrentLocation] = useState('東京');
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const { isAuthenticated, openLoginModal } = useAuth();

  const handleRequestClick = () => {
    if (isAuthenticated) {
      setRequestModalOpen(true);
    } else {
      openLoginModal();
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

      {/* 現在地と日時 - 変更なし */}
      <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm">
        <div className="flex items-center space-x-2">
          <MapPin size={20} className="text-black" />
          <span className="font-medium">{currentLocation}</span>
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
      
      {/* リクエストボタン - 変更なし */}
      <button 
        onClick={handleRequestClick}
        className="w-full bg-black text-white py-4 rounded-lg font-medium text-lg shadow-md hover:bg-gray-800 transition duration-200 flex items-center justify-center"
      >
        <span className="font-bold">アテンダーをリクエスト</span>
      </button>
      
      {/* 人気リクエスト - 変更なし */}
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
      
      {/* アテンダーカード - クリックで詳細へ遷移するよう修正 */}
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

      {/* リクエストモーダル - 変更なし */}
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
            
            {/* 日時選択など - 変更なし */}
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

// ExploreScreen コンポーネントの修正
interface ExploreScreenProps {
  onAttenderClick: (id: number) => void;
}

const ExploreScreen = ({ onAttenderClick }: ExploreScreenProps) => {
  const [quickRequestModalOpen, setQuickRequestModalOpen] = useState(false);
  const { isAuthenticated, openLoginModal } = useAuth();

  const handleQuickRequestClick = () => {
    if (isAuthenticated) {
      setQuickRequestModalOpen(true);
    } else {
      openLoginModal();
    }
  };

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold">周辺を探索</h1>
      
      {/* フィルターバー - 変更なし */}
      <div className="flex space-x-2 overflow-x-auto pb-2">
        <button className="px-3 py-1 bg-black text-white rounded-full text-sm whitespace-nowrap">
          すべて
        </button>
        <button className="px-3 py-1 bg-white border border-gray-300 rounded-full text-sm whitespace-nowrap">
          音楽
        </button>
        <button className="px-3 py-1 bg-white border border-gray-300 rounded-full text-sm whitespace-nowrap">
          アート
        </button>
        <button className="px-3 py-1 bg-white border border-gray-300 rounded-full text-sm whitespace-nowrap">
          クラフト
        </button>
        <button className="px-3 py-1 bg-white border border-gray-300 rounded-full text-sm whitespace-nowrap">
          カフェ
        </button>
        <button className="px-3 py-1 bg-white border border-gray-300 rounded-full text-sm whitespace-nowrap">
          裏路地
        </button>
      </div>

      {/* クイックリクエストボタン - 変更なし */}
      <button 
        onClick={handleQuickRequestClick}
        className="w-full bg-black text-white py-3 rounded-lg font-medium shadow-md hover:bg-gray-800 transition duration-200 flex items-center justify-center mb-4"
      >
        この周辺のアテンダーをリクエスト
      </button>

      {/* 地図表示エリア - 変更なし */}
      <div className="bg-gray-200 h-40 flex items-center justify-center rounded-lg">
        <span className="text-gray-600 font-medium">地図が表示されます</span>
      </div>
      
      {/* クイックリクエストモーダル - 変更なし */}
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

      {/* アテンダーリスト - クリックで詳細へ遷移するよう修正 */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xl font-bold">近くのアテンダー</h2>
          <button className="text-black text-sm">すべて表示</button>
        </div>
        <div className="space-y-4">
          {attendersData.map((attender) => (
            <div 
              key={attender.id} 
              onClick={() => onAttenderClick(attender.id)}
              className="cursor-pointer"
            >
              <AttenderCard attender={attender} compact />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// SavedScreen コンポーネントの修正
interface SavedScreenProps {
  onAttenderClick: (id: number) => void;
}

const SavedScreen = ({ onAttenderClick }: SavedScreenProps) => {
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
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold">保存済み</h1>
      
      {/* お気に入りのアテンダー - クリックで詳細へ遷移するよう修正 */}
      <div>
        <h2 className="text-xl font-bold mb-3">お気に入りのアテンダー</h2>
        <div className="space-y-4">
          {attendersData.slice(0, 2).map((attender) => (
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
      
      {/* 保存した体験 - 変更なし */}
      <div>
        <h2 className="text-xl font-bold mb-3">保存した体験</h2>
        <div className="space-y-3">
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="h-32 bg-gray-100 flex items-center justify-center">
              <Camera size={32} className="text-gray-400" />
            </div>
            <div className="p-3">
              <p className="font-medium">伝統工芸×現代アート</p>
              <p className="text-sm text-gray-500">金沢市</p>
              <div className="flex items-center mt-1">
                <Star size={16} className="text-yellow-500" />
                <span className="text-sm ml-1">4.8 (92件のレビュー)</span>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="h-32 bg-gray-100 flex items-center justify-center">
              <Utensils size={32} className="text-gray-400" />
            </div>
            <div className="p-3">
              <p className="font-medium">夜の屋台文化探訪</p>
              <p className="text-sm text-gray-500">福岡市</p>
              <div className="flex items-center mt-1">
                <Star size={16} className="text-yellow-500" />
                <span className="text-sm ml-1">4.9 (124件のレビュー)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// マーケット画面
const MarketScreen = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold">地域の特産品</h1>
      
      {/* カテゴリーフィルター */}
      <div className="flex space-x-2 overflow-x-auto pb-2">
        <button 
          onClick={() => setSelectedCategory('all')}
          className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${
            selectedCategory === 'all' ? 'bg-black text-white' : 'bg-white border border-gray-300'
          }`}
        >
          すべて
        </button>
        <button 
          onClick={() => setSelectedCategory('food')}
          className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${
            selectedCategory === 'food' ? 'bg-black text-white' : 'bg-white border border-gray-300'
          }`}
        >
          食品
        </button>
        <button 
          onClick={() => setSelectedCategory('craft')}
          className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${
            selectedCategory === 'craft' ? 'bg-black text-white' : 'bg-white border border-gray-300'
          }`}
        >
          工芸品
        </button>
        <button 
          onClick={() => setSelectedCategory('beverage')}
          className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${
            selectedCategory === 'beverage' ? 'bg-black text-white' : 'bg-white border border-gray-300'
          }`}
        >
          飲料
        </button>
      </div>
      
      {/* 体験から選ぶ */}
      <div>
        <h2 className="text-xl font-bold mb-3">あなたの体験から</h2>
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center mb-3">
            <div className="w-12 h-12 bg-gray-200 rounded-full mr-3 flex items-center justify-center">
              <User size={24} className="text-gray-600" />
            </div>
            <div>
              <p className="font-medium">鈴木 アキラさんの案内で巡った</p>
              <p className="text-sm text-gray-700">東京音楽シーンツアー</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-lg overflow-hidden shadow-sm">
              <div className="h-24 bg-gray-100 flex items-center justify-center">
                <Music size={24} className="text-gray-400" />
              </div>
              <div className="p-2">
                <p className="font-medium text-sm">下北沢限定レコード</p>
                <p className="text-xs text-gray-600">¥3,200〜</p>
              </div>
            </div>
            <div className="bg-white rounded-lg overflow-hidden shadow-sm">
              <div className="h-24 bg-gray-100 flex items-center justify-center">
                <Headphones size={24} className="text-gray-400" />
              </div>
              <div className="p-2">
                <p className="font-medium text-sm">ローカルバンドセット</p>
                <p className="text-xs text-gray-600">¥4,500〜</p>
              </div>
            </div>
          </div>
          <button className="w-full mt-3 py-2 text-black text-sm font-medium">
            すべての商品を見る
          </button>
        </div>
      </div>
      
      {/* アテンダーおすすめ商品 */}
      <div>
        <h2 className="text-xl font-bold mb-3">アテンダーおすすめ</h2>
        <div className="space-y-3">
          {marketItems.map(item => (
            <div key={item.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="flex">
                <div className="w-1/3 bg-gray-100 flex items-center justify-center">
                  {item.icon && React.cloneElement(item.icon, { size: 32, className: "text-gray-400" })}
                </div>
                <div className="w-2/3 p-3">
                  <div className="flex justify-between">
                    <p className="font-medium">{item.name}</p>
                    <p className="text-black font-medium">¥{item.price.toLocaleString()}</p>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                  <div className="flex items-center mt-2">
                    <div className="flex items-center text-xs text-gray-500">
                      <User size={12} className="mr-1" />
                      <span>{item.attender}</span>
                    </div>
                    <div className="mx-2 text-gray-300">|</div>
                    <div className="text-xs text-gray-500">{item.region}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* 定期便サブスクリプション */}
      <div className="bg-gradient-to-r from-gray-800 to-black rounded-lg p-4 text-white">
        <h3 className="font-bold text-lg mb-2">地域の特産品定期便</h3>
        <p className="text-sm mb-3">
          あなたが体験した地域から、季節の特産品や限定アイテムを毎月お届け
        </p>
        <button className="bg-white text-black font-medium py-2 px-4 rounded-lg text-sm">
          サブスクリプションを見る
        </button>
      </div>
    </div>
  );
};

// コミュニティへの貢献画面
const CommunityScreen = () => {
  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold">地域コミュニティ</h1>
      
      {/* あなたの貢献 */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <h2 className="text-xl font-bold mb-2">あなたの貢献</h2>
        <div className="flex items-center justify-between mb-3">
          <p className="text-gray-700">これまでの貢献額</p>
          <p className="text-xl font-bold text-black">¥2,850</p>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div className="bg-black h-2.5 rounded-full" style={{ width: '65%' }}></div>
        </div>
        <p className="text-sm text-gray-600 mt-1">次のレベルまで ¥1,150</p>
      </div>
      
      {/* サポート中のプロジェクト */}
      <div>
        <h2 className="text-xl font-bold mb-3">サポート中のプロジェクト</h2>
        <div className="space-y-3">
          {communityProjects.map(project => (
            <div key={project.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="h-32 bg-gray-100 relative flex items-center justify-center">
                {project.icon && React.cloneElement(project.icon, { size: 48, className: "text-gray-300" })}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-3">
                  <p className="text-white font-medium">{project.title}</p>
                </div>
              </div>
              <div className="p-3">
                <div className="flex justify-between items-center mb-2">
                  <div className="text-sm text-gray-600">{project.location}</div>
                  <div className="bg-gray-100 text-gray-800 text-xs py-1 px-2 rounded-full">
                    {project.status}
                  </div>
                </div>
                <p className="text-sm text-gray-700 mb-3">{project.description}</p>
                <div className="mb-2">
                  <div className="flex justify-between text-sm mb-1">
                    <span>達成率</span>
                    <span>{project.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-black h-2 rounded-full" 
                      style={{ width: `${project.progress}%` }}
                    ></div>
                  </div>
                </div>
                <button className="w-full py-2 bg-black text-white rounded-lg text-sm">
                  さらに貢献する
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* 地域イベントボランティア */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="font-bold text-lg mb-2">イベントボランティア募集</h3>
        <p className="text-sm text-gray-700 mb-3">
          地域のお祭りや文化イベントのボランティアに参加して、地元住民と共に楽しみながら貢献しませんか？
        </p>
        <button className="bg-black text-white font-medium py-2 px-4 rounded-lg text-sm w-full">
          募集中のボランティアを見る
        </button>
      </div>
    </div>
  );
};

// 季節限定イベント画面
const SeasonalEventsScreen = () => {
  const [viewType, setViewType] = useState('list'); // 'list' or 'calendar'
  
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
                <Star size={14} className="text-yellow-500" />
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
                <Star size={14} className="text-yellow-500" />
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

// 新しく追加するプロフィール画面
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
        
        <div className="space-y-4">
          <div className="border-b pb-4">
            <h3 className="font-medium text-gray-700 mb-2">アカウント情報</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">名前</p>
                <p>{user?.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">メールアドレス</p>
                <p>{user?.email}</p>
              </div>
            </div>
          </div>
          
          <div className="border-b pb-4">
            <h3 className="font-medium text-gray-700 mb-2">通知設定</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p>メッセージ通知</p>
                <input type="checkbox" defaultChecked className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded" />
              </div>
              <div className="flex items-center justify-between">
                <p>予約リマインダー</p>
                <input type="checkbox" defaultChecked className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded" />
              </div>
              <div className="flex items-center justify-between">
                <p>特別オファー</p>
                <input type="checkbox" className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded" />
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium text-gray-700 mb-2">お支払い情報</h3>
            <div className="flex justify-between items-center">
              <p className="text-gray-500">お支払い方法は登録されていません</p>
              <button className="px-3 py-1 bg-gray-100 text-black rounded-md text-sm">
                追加
              </button>
            </div>
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

// メインアプリコンポーネント
const TripworksApp = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
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
      {activeTab === 'explore' && <ExploreScreen onAttenderClick={handleAttenderClick} />}
      {activeTab === 'trips' && <TripsScreen />} {/* インポートされたTripsScreenを使用 */}
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
    <Gift size={20} /> {/* カレンダーから別のアイコンに変更 */}
    <span className="text-xs mt-1">イベント</span>
  </button>
  <button
    onClick={() => setActiveTab('market')}
    className={`flex flex-col items-center justify-center flex-1 h-full ${activeTab === 'market' ? 'text-black' : 'text-gray-500'}`}
  >
    <ShoppingBag size={20} />
    <span className="text-xs mt-1">マーケット</span>
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

export default TripworksApp;