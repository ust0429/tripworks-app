import React, { useState } from "react";
import {
  Search,
  MapPin,
  Calendar,
  Clock,
  Music,
  Camera,
  Utensils,
  Coffee,
  Gift,
  UserPlus,
  ArrowRight,
} from "lucide-react";
import { useAuth } from "../../AuthComponents";
import { AttenderType } from "../../types";
import AttenderCard from "../AttenderCard";

// 人気リクエストのサンプルデータをインポート
import { popularRequests } from "../../mockData";

interface HomeScreenProps {
  onAttenderClick: (id: number) => void;
  attendersData: AttenderType[];
  navigateToAttenderInfo?: () => void;
}

// アイコンタイプを対応するコンポーネントに変換する関数
const getIconComponent = (iconType: string) => {
  switch (iconType) {
    case "music":
      return <Music size={28} className="text-gray-800" />;
    case "camera":
      return <Camera size={28} className="text-gray-800" />;
    case "utensils":
      return <Utensils size={28} className="text-gray-800" />;
    case "coffee":
      return <Coffee size={28} className="text-gray-800" />;
    case "gift":
      return <Gift size={28} className="text-gray-800" />;
    default:
      return <Clock size={28} className="text-gray-800" />;
  }
};

const HomeScreen: React.FC<HomeScreenProps> = ({
  onAttenderClick,
  attendersData,
  navigateToAttenderInfo,
}) => {
  const [currentLocation, _setCurrentLocation] = useState("東京");
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
      <h2 className="text-2xl font-bold mb-3">さぁ、何をしよう？</h2>
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

      {/* リクエストボタン */}
      <button
        onClick={handleRequestClick}
        className="w-full bg-black text-white py-4 rounded-lg font-medium text-lg shadow-md hover:bg-gray-800 transition duration-200 flex items-center justify-center"
      >
        <span className="font-bold">アテンダーをリクエストする</span>
      </button>

      {/* 人気リクエスト */}
      <div>
        <h2 className="text-xl font-bold mb-3">人気リクエスト</h2>
        <div className="space-y-3">
          {popularRequests.map((request) => (
            <div key={request.id} className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getIconComponent(request.iconType)}
                  <div>
                    <p className="font-medium">{request.title}</p>
                    <p className="text-sm text-gray-600">
                      {request.description}
                    </p>
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

      {/* アテンダー募集バナー */}
      <div className="bg-mono-black rounded-lg p-6 text-mono-white shadow-lg mt-8">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <UserPlus size={24} className="text-mono-white" />
              <h3 className="text-xl font-bold">アテンダーになりませんか？</h3>
            </div>
            <p className="text-mono-white/90">
              あなたの街の魅力を旅行者に伝えてみませんか？自分のペースで活動できるアテンダーとして、新しい出会いと収入を得ることができます。
            </p>
            <button
              onClick={() =>
                navigateToAttenderInfo
                  ? navigateToAttenderInfo()
                  : (window.location.href = "/attender/info")
              }
              className="mt-3 bg-mono-white text-mono-black px-4 py-2 rounded-lg font-medium flex items-center space-x-1 hover:bg-mono-lighter transition duration-200"
            >
              <span>詳細を見る</span>
              <ArrowRight size={16} />
            </button>
          </div>
          <div className="hidden md:block">
            <img
              src="/images/attender-illustration.svg"
              alt="アテンダーイラスト"
              className="w-32 h-32 object-contain"
              onError={(e) => (e.currentTarget.style.display = "none")}
            />
          </div>
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
              <p className="text-sm font-medium text-gray-700 mb-2">
                人気リクエスト例：
              </p>
              <div className="flex flex-wrap gap-2">
                <button className="text-xs bg-gray-200 hover:bg-gray-300 py-1 px-2 rounded-full">
                  地元の音楽ライブハウス巡り
                </button>
                <button className="text-xs bg-gray-200 hover:bg-gray-300 py-1 px-2 rounded-full">
                  フォトジェニックな裏路地を案内
                </button>
                <button className="text-xs bg-gray-200 hover:bg-gray-300 py-1 px-2 rounded-full">
                  地元民しか知らない穴場カフェ
                </button>
                <button className="text-xs bg-gray-200 hover:bg-gray-300 py-1 px-2 rounded-full">
                  伝統工芸の職人工房訪問
                </button>
                <button className="text-xs bg-gray-200 hover:bg-gray-300 py-1 px-2 rounded-full">
                  夜の屋台文化探訪
                </button>
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

export default HomeScreen;
