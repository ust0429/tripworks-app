// src/components/screens/SavedScreen.tsx
import React from 'react';
import { Star, Heart, Camera, Utensils } from 'lucide-react';
import { useAuth } from '../../AuthComponents';
import AttenderCard from '../AttenderCard';
import { AttenderType } from '../../types';

interface SavedScreenProps {
  onAttenderClick: (id: number) => void;
}

const SavedScreen: React.FC<SavedScreenProps> = ({ onAttenderClick }) => {
  const { isAuthenticated, openLoginModal } = useAuth();
  
  // サンプルのお気に入り保存アテンダー
  const savedAttenders: AttenderType[] = [
    {
      id: 1,
      name: '鈴木 アキラ',
      type: 'バンドマン',
      description: '東京の地下音楽シーンを知り尽くしたベテランミュージシャン。名ライブハウスから秘密のスタジオまでご案内します。',
      rating: '4.9',
      distance: '2.3km先',
      icon: <Camera size={20} />
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
  ];
  
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
          {savedAttenders.map((attender) => (
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

export default SavedScreen;