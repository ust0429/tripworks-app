import React, { useState } from "react";
import {
  Search,
  MapPin,
  Calendar,
  Clock,
  Star,
  ChevronDown,
  Menu,
  X,
  User,
  MessageCircle,
  Home,
  Compass,
  Heart,
  Users,
  ShoppingBag,
  Gift,
  Coffee,
  Sunrise,
  Info,
  Music,
  Camera,
  Headphones,
  Hammer,
  Utensils,
  Map,
  LogOut,
  Bell,
} from "lucide-react";
import { AuthProvider, useAuth } from "./AuthComponents";
import { NotificationProvider } from "./contexts/NotificationContext"; // 追加
import { HeaderNotification } from "./components/notification"; // 追加
import AttenderDetailScreen from "./components/AttenderDetailScreen";
import DirectRequestModal from "./components/DirectRequestModal";
import ReviewModal from "./components/ReviewModal";
import { NotificationsPage } from "./components/notification"; // 追加
import { AttenderType, IconProps, PastExperience } from "./types";

// サンプルデータ (実際のコードでは既存データを使用)
const attendersData: AttenderType[] = [
  {
    id: 1,
    name: "鈴木 アキラ",
    type: "バンドマン",
    description:
      "東京の地下音楽シーンを知り尽くしたベテランミュージシャン。名ライブハウスから秘密のスタジオまでご案内します。",
    rating: "4.9",
    distance: "2.3km先",
    icon: <Music size={20} />,
  },
  {
    id: 2,
    name: "山田 ユカリ",
    type: "アーティスト",
    description:
      "地元で活動する現代アーティスト。アトリエ巡りから創作体験まで、芸術の視点から街の魅力を再発見。",
    rating: "4.8",
    distance: "1.5km先",
    icon: <Camera size={20} />,
  },
  {
    id: 3,
    name: "佐藤 ケンジ",
    type: "クラフトビール職人",
    description:
      "地元醸造所のマスターブリュワー。ビール造りの過程から地域の食文化まで、職人視点の旅へ。",
    rating: "4.7",
    distance: "3.1km先",
    icon: <Coffee size={20} />,
  },
];

// アテンダーカードコンポーネントなどの実装は元のApp.tsxと同じなので省略

// メインアプリコンポーネント
const TripworksApp = () => {
  return (
    <AuthProvider>
      <NotificationProvider>
        <AppContent />
      </NotificationProvider>
    </AuthProvider>
  );
};

// アプリのコンテンツ部分
const AppContent = () => {
  const [activeTab, setActiveTab] = useState("home");
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedAttenderId, setSelectedAttenderId] = useState<number | null>(
    null
  );
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
      {/* ヘッダー - 通知アイコンを追加 */}
      <header className="bg-black text-white p-4 flex justify-between items-center">
        <div className="flex items-center">
          <h1 className="text-2xl" style={{ fontFamily: "sans-serif" }}>
            <span className="font-bold">e</span>
            <span className="font-light">cho</span>
            <span className="text-xs align-top ml-1" style={{ opacity: 0.7 }}>
              β
            </span>
          </h1>
        </div>
        <div className="flex items-center space-x-2">
          {isAuthenticated && <HeaderNotification />} {/* 通知アイコンを追加 */}
          
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
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="p-2 rounded-full hover:bg-gray-800"
              >
                {menuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </>
          )}
        </div>
      </header>

      {/* メインコンテンツ - 通知ページを追加 */}
      <main className="flex-1 overflow-auto pb-16">
        {selectedAttenderId ? (
          <AttenderDetailScreen
            attenderId={selectedAttenderId}
            onBack={handleBackFromDetail}
          />
        ) : (
          <>
            {activeTab === "home" && (
              <HomeScreen onAttenderClick={handleAttenderClick} />
            )}
            {activeTab === "explore" && (
              <ExploreScreen onAttenderClick={handleAttenderClick} />
            )}
            {activeTab === "trips" && <TripsScreen />}
            {activeTab === "saved" && (
              <SavedScreen onAttenderClick={handleAttenderClick} />
            )}
            {activeTab === "market" && <MarketScreen />}
            {activeTab === "community" && <CommunityScreen />}
            {activeTab === "events" && <SeasonalEventsScreen />}
            {activeTab === "profile" && <ProfileScreen />}
            {activeTab === "notifications" && <NotificationsPage />} {/* 通知ページを追加 */}
          </>
        )}
      </main>

      {/* メニュー (サイドバー) - 通知設定アイテムを追加 */}
      {menuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setMenuOpen(false)}
        >
          <div
            className="absolute right-0 top-0 bottom-0 w-64 bg-white shadow-lg z-50"
            onClick={(e) => e.stopPropagation()}
          >
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
                      setActiveTab("profile");
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
                {isAuthenticated && (
                  <li
                    className="flex items-center space-x-3 text-gray-700 hover:text-black cursor-pointer"
                    onClick={() => {
                      setActiveTab("notifications");
                      setMenuOpen(false);
                    }}
                  >
                    <Bell size={20} />
                    <span>通知</span>
                  </li>
                )}
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
          onClick={() => setActiveTab("home")}
          className={`flex flex-col items-center justify-center flex-1 h-full ${
            activeTab === "home" ? "text-black" : "text-gray-500"
          }`}
        >
          <Home size={20} />
          <span className="text-xs mt-1">ホーム</span>
        </button>
        <button
          onClick={() => setActiveTab("explore")}
          className={`flex flex-col items-center justify-center flex-1 h-full ${
            activeTab === "explore" ? "text-black" : "text-gray-500"
          }`}
        >
          <Compass size={20} />
          <span className="text-xs mt-1">探索</span>
        </button>
        <button
          onClick={() => setActiveTab("trips")}
          className={`flex flex-col items-center justify-center flex-1 h-full ${
            activeTab === "trips" ? "text-black" : "text-gray-500"
          }`}
        >
          <Calendar size={20} />
          <span className="text-xs mt-1">旅程</span>
        </button>
        <button
          onClick={() => setActiveTab("events")}
          className={`flex flex-col items-center justify-center flex-1 h-full ${
            activeTab === "events" ? "text-black" : "text-gray-500"
          }`}
        >
          <Gift size={20} />
          <span className="text-xs mt-1">イベント</span>
        </button>
        <button
          onClick={() => setActiveTab("market")}
          className={`flex flex-col items-center justify-center flex-1 h-full ${
            activeTab === "market" ? "text-black" : "text-gray-500"
          }`}
        >
          <ShoppingBag size={20} />
          <span className="text-xs mt-1">マーケット</span>
        </button>
        <button
          onClick={() => setActiveTab("community")}
          className={`flex flex-col items-center justify-center flex-1 h-full ${
            activeTab === "community" ? "text-black" : "text-gray-500"
          }`}
        >
          <Users size={20} />
          <span className="text-xs mt-1">コミュニティ</span>
        </button>
      </footer>
    </div>
  );
};

// 各画面コンポーネントの実装（元のApp.tsxと同じなので省略）
const HomeScreen = ({ onAttenderClick }: { onAttenderClick: (id: number) => void }) => {
  // 元のHomeScreenの実装
  return <div>HomeScreen</div>;
};

const ExploreScreen = ({ onAttenderClick }: { onAttenderClick: (id: number) => void }) => {
  // 元のExploreScreenの実装
  return <div>ExploreScreen</div>;
};

const TripsScreen = () => {
  // 元のTripsScreenの実装
  return <div>TripsScreen</div>;
};

const SavedScreen = ({ onAttenderClick }: { onAttenderClick: (id: number) => void }) => {
  // 元のSavedScreenの実装
  return <div>SavedScreen</div>;
};

const MarketScreen = () => {
  // 元のMarketScreenの実装
  return <div>MarketScreen</div>;
};

const CommunityScreen = () => {
  // 元のCommunityScreenの実装
  return <div>CommunityScreen</div>;
};

const SeasonalEventsScreen = () => {
  // 元のSeasonalEventsScreenの実装
  return <div>SeasonalEventsScreen</div>;
};

const ProfileScreen = () => {
  // 元のProfileScreenの実装
  return <div>ProfileScreen</div>;
};

export default TripworksApp;
