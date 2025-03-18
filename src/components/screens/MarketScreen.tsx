// src/components/screens/MarketScreen.tsx
import React, { useState } from 'react';
import { User, Music, Headphones, Hammer, Coffee, Utensils } from 'lucide-react';

const MarketScreen: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  
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

export default MarketScreen;