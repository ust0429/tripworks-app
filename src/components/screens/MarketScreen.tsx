// src/components/screens/MarketScreen.tsx
import React, { useState, useEffect } from 'react';
import { User, Music, Headphones, ShoppingBag, Hammer, Coffee, Utensils } from 'lucide-react';
import { ProductType, CategoryType, ExperienceProductType } from '../../types/market';
import { IconProps } from '../../types/common';
import CategoryFilter from '../market/CategoryFilter';
import SearchBar from '../market/SearchBar';
import ProductGrid from '../market/ProductGrid';
import ProductRecommendation from '../market/ProductRecommendation';

const MarketScreen: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  
  // カテゴリー
  const categories: CategoryType[] = [
    { id: 'food', name: '食品' },
    { id: 'craft', name: '工芸品' },
    { id: 'beverage', name: '飲料' },
    { id: 'fashion', name: 'ファッション' },
    { id: 'art', name: 'アート' },
    { id: 'beauty', name: 'ビューティー' },
  ];
  
  // マーケットアイテムのサンプルデータ
  const marketItems: ProductType[] = [
    {
      id: 1,
      name: '地元職人の手作り陶器セット',
      price: 8500,
      description: '伝統技術で作られた日常使いの器。シンプルかつ上品なデザイン。一点一点丁寧に手作業で仕上げられており、使うほどに味が出てきます。',
      attender: '山本 工房主',
      region: '京都',
      category: 'craft',
      icon: <Hammer size={24} />,
      rating: 4.8,
      reviewCount: 42,
      featured: true
    },
    {
      id: 2,
      name: '限定醸造クラフトビール6本セット',
      price: 3600,
      description: '地元の食材を使った季節限定の特別醸造ビール。贈り物にも最適。厳選された地元の素材を使用し、少量生産にこだわった特別な味わいをお楽しみいただけます。',
      attender: '佐藤 ケンジ',
      region: '横浜',
      category: 'beverage',
      icon: <Coffee size={24} />,
      rating: 4.7,
      reviewCount: 36,
      limited: true
    },
    {
      id: 3,
      name: '朝市直送の海産物セット',
      price: 5800,
      description: '漁港から直送の新鮮な海産物。アテンダーがセレクトした特選品。朝一番に水揚げされた鮮度抜群の魚介類を、知識豊富なアテンダーが厳選してお届けします。',
      attender: '鈴木 漁師',
      region: '福岡',
      category: 'food',
      icon: <Utensils size={24} />,
      rating: 4.9,
      reviewCount: 58
    },
    {
      id: 4,
      name: '伝統工芸の手織りストール',
      price: 12800,
      description: '熟練の職人による手織りの温かみが感じられる逸品。天然素材を使用し、伝統的な製法で丁寧に仕上げられています。',
      attender: '田中 織物師',
      region: '石川',
      category: 'fashion',
      icon: <ShoppingBag size={24} />,
      rating: 4.6,
      reviewCount: 24
    },
    {
      id: 5,
      name: '地元アーティストの限定版画',
      price: 18000,
      description: '地域の風景をモチーフにした限定50部の版画作品。若手アーティストによる新しい感性と伝統技術の融合が魅力です。',
      attender: '高橋 版画家',
      region: '東京',
      category: 'art',
      icon: <Hammer size={24} />,
      rating: 4.9,
      reviewCount: 17,
      limited: true
    },
    {
      id: 6,
      name: '山間部の蜂蜜セット',
      price: 4500,
      description: '標高の高い山間部で採取された希少な蜂蜜。花の種類ごとに3種類の味わいを楽しめるギフトセットです。',
      attender: '小林 養蜂家',
      region: '長野',
      category: 'food',
      icon: <Coffee size={24} />,
      rating: 4.8,
      reviewCount: 62
    },
    {
      id: 7,
      name: '伝統的な藍染めハンカチセット',
      price: 3200,
      description: '天然の藍を使った手染めのハンカチ。色の濃淡が美しく、使うほどに風合いが増します。',
      attender: '加藤 染物師',
      region: '徳島',
      category: 'fashion',
      icon: <ShoppingBag size={24} />,
      rating: 4.7,
      reviewCount: 29
    },
    {
      id: 8,
      name: '地元産ハーブの入浴剤セット',
      price: 2800,
      description: '自然栽培のハーブを使用した手作りの入浴剤。香りとリラックス効果にこだわった5種類のセットです。',
      attender: '前田 ハーバリスト',
      region: '北海道',
      category: 'beauty',
      icon: <Coffee size={24} />,
      rating: 4.5,
      reviewCount: 41
    }
  ];

  // 体験からの商品データ
  const experienceProducts: ExperienceProductType = {
    experienceId: "123",
    experienceName: '東京音楽シーンツアー',
    attenderName: '鈴木 アキラ',
    products: [
      {
        id: 101,
        name: '下北沢限定レコード',
        price: 3200,
        description: '下北沢のインディーズレーベルが制作した限定レコード。ツアーで訪れた店舗でしか手に入らない希少盤です。',
        attender: '鈴木 アキラ',
        region: '東京',
        category: 'art',
        icon: <Music size={24} />,
        rating: 4.8,
        reviewCount: 15
      },
      {
        id: 102,
        name: 'ローカルバンドセット',
        price: 4500,
        description: '東京の注目インディーズバンド5組のCD・グッズセット。音楽シーンの最前線を体験できるキュレーションです。',
        attender: '鈴木 アキラ',
        region: '東京',
        category: 'art',
        icon: <Headphones size={24} />,
        rating: 4.7,
        reviewCount: 8
      },
      {
        id: 103,
        name: 'ライブハウス特製Tシャツ',
        price: 3500,
        description: 'ツアーで訪れる老舗ライブハウスの限定デザインTシャツ。人気グラフィックアーティストとのコラボレーション。',
        attender: '鈴木 アキラ',
        region: '東京',
        category: 'fashion',
        icon: <ShoppingBag size={24} />,
        rating: 4.6,
        reviewCount: 12
      },
      {
        id: 104,
        name: '音楽喫茶オリジナルブレンド',
        price: 1800,
        description: '老舗音楽喫茶のために特別にブレンドされたコーヒー豆。深みのある香りと味わいが特徴です。',
        attender: '鈴木 アキラ',
        region: '東京',
        category: 'beverage',
        icon: <Coffee size={24} />,
        rating: 4.9,
        reviewCount: 23
      }
    ]
  };

  // 検索機能
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // 本来はここでAPI検索を行う
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 500);
  };

  // フィルタリングされた商品
  const filteredProducts = marketItems.filter(item => {
    // カテゴリーフィルター
    const categoryMatch = selectedCategory === 'all' || item.category === selectedCategory;
    
    // 検索フィルター
    const searchMatch = !searchQuery || 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.attender.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.region.toLowerCase().includes(searchQuery.toLowerCase());
    
    return categoryMatch && searchMatch;
  });
  
  // おすすめ商品
  const featuredProducts = marketItems.filter(item => item.featured);
  
  // 限定商品
  const limitedProducts = marketItems.filter(item => item.limited);

  // 初回のみ実行されるコード
  useEffect(() => {
    // 本来はここで商品データをAPIから取得する
    // fetchProducts();
  }, []);
  
  return (
    <div className="pb-16 space-y-6">
      {/* ヘッダー */}
      <div className="sticky top-0 z-10 bg-mono-white p-4 shadow-sm">
        <h1 className="text-2xl font-bold mb-3 text-mono-black">地域の特産品</h1>
        
        {/* 検索バー */}
        <SearchBar onSearch={handleSearch} placeholder="商品名、地域、アテンダー名で検索..." />
        
        {/* カテゴリーフィルター */}
        <div className="mt-3">
          <CategoryFilter 
            categories={categories} 
            selectedCategory={selectedCategory} 
            onCategoryChange={setSelectedCategory} 
          />
        </div>
      </div>
      
      <div className="px-4 space-y-8">
        {/* 体験から選ぶ */}
        <ProductRecommendation
          title="あなたの体験から"
          products={experienceProducts.products}
          experienceId={experienceProducts.experienceId}
          experienceName={experienceProducts.experienceName}
          attenderName={experienceProducts.attenderName}
        />
        
        {/* 特集：限定商品 */}
        {limitedProducts.length > 0 && (
          <div>
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-xl font-bold text-mono-black">数量限定</h2>
              <button className="text-sm text-mono-black font-medium">
                すべて見る
              </button>
            </div>
            <div className="overflow-x-auto pb-4">
              <div className="flex space-x-3" style={{ minWidth: 'min-content' }}>
                {limitedProducts.map(product => (
                  <div 
                    key={product.id}
                    className="w-40 flex-shrink-0 bg-mono-white rounded-lg overflow-hidden shadow-sm"
                  >
                    <div className="h-40 bg-mono-lighter relative flex items-center justify-center">
                      {product.icon && React.cloneElement(product.icon as React.ReactElement<IconProps>, { size: 32, className: "text-mono-gray-medium" })}
                      <div className="absolute top-2 left-2 bg-mono-black text-mono-white text-xs py-1 px-2 rounded-full">
                        限定品
                      </div>
                    </div>
                    <div className="p-3">
                      <p className="font-medium line-clamp-2 text-mono-black">{product.name}</p>
                      <p className="text-mono-black font-bold mt-1">¥{product.price.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {/* アテンダーおすすめ商品 */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xl font-bold text-mono-black">アテンダーおすすめ</h2>
            <button className="text-sm text-mono-black font-medium">
              すべて見る
            </button>
          </div>
          
          {loading ? (
            <div className="py-8 text-center text-mono-gray-medium">読み込み中...</div>
          ) : (
            searchQuery ? (
              <>
                <p className="mb-3 text-sm text-mono-gray-medium">「{searchQuery}」の検索結果: {filteredProducts.length}件</p>
                <ProductGrid products={filteredProducts} category={selectedCategory} />
              </>
            ) : (
              <ProductGrid products={marketItems} category={selectedCategory} />
            )
          )}
        </div>
        
        {/* 定期便サブスクリプション */}
        <div className="bg-mono-black rounded-lg p-4 text-mono-white">
          <h3 className="font-bold text-lg mb-2">地域の特産品定期便</h3>
          <p className="text-sm mb-3">
            あなたが体験した地域から、季節の特産品や限定アイテムを毎月お届け
          </p>
          <button className="bg-mono-white text-mono-black font-medium py-2 px-4 rounded-lg text-sm hover:bg-mono-lighter transition-colors duration-200">
            サブスクリプションを見る
          </button>
        </div>
      </div>
    </div>
  );
};

export default MarketScreen;