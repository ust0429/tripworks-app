<<<<<<< HEAD
import React, { useState } from 'react';
import { Star, MapPin, Clock, Calendar, MessageCircle, Heart, Share2, ArrowLeft, Bookmark, ChevronDown, Image, User, Music, Camera, Coffee, Gift } from 'lucide-react';
import { useAuth } from './AuthComponents';
import DirectRequestModal from './DirectRequestModal'; // 変更
import { AttenderType, IconProps } from './types'; // 追加

// アテンダー詳細に必要な型定義
interface AttenderDetailType {
  id: number;
  name: string;
  type: string;
  rating: string;
  reviewCount: number;
  location: string;
  responseTime: string;
  languages: string[];
  about: string;
  experiences: ExperienceType[];
  reviews: ReviewType[];
  availableDates: string[];
  icon: React.ReactElement<IconProps>; // 修正
  gallery: string[];
  specialties: string[];
}

interface ExperienceType {
  id: number;
  title: string;
  duration: string;
  price: number;
  description: string;
  image?: string;
}

interface ReviewType {
  id: number;
  userName: string;
  date: string;
  rating: number;
  comment: string;
  userImage?: string;
}

// アテンダー詳細画面コンポーネント
interface AttenderDetailScreenProps {
  attenderId: number;
  onBack: () => void;
}

const AttenderDetailScreen: React.FC<AttenderDetailScreenProps> = ({ attenderId, onBack }) => {
  const [showFullAbout, setShowFullAbout] = useState(false);
  const [selectedTab, setSelectedTab] = useState('about'); // 'about', 'experiences', 'reviews'
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const { isAuthenticated, openLoginModal } = useAuth();

  // サンプルデータから対象のアテンダーを取得
  const attender = detailedAttendersData.find(a => a.id === attenderId) || detailedAttendersData[0];

  // ログイン状態に応じたリクエスト処理
  const handleRequestClick = () => {
    if (isAuthenticated) {
      setRequestModalOpen(true);
    } else {
      openLoginModal();
    }
  };

  // お気に入り処理
  const handleFavoriteClick = () => {
    if (!isAuthenticated) {
      openLoginModal();
    }
    // お気に入り登録処理（ログイン済みの場合）
  };

  return (
    <div className="pb-20">
      {/* ヘッダー部分 */}
      <div className="relative h-64 bg-gray-200">
        {/* ギャラリー画像（モック） */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Image size={48} className="text-gray-400" />
        </div>
        
        {/* トップナビゲーション */}
        <div className="absolute top-0 left-0 right-0 p-4 flex justify-between z-10">
          <button 
            onClick={onBack}
            className="p-2 bg-white rounded-full shadow-md"
          >
            <ArrowLeft size={20} className="text-gray-800" />
          </button>
          <div className="flex space-x-2">
            <button className="p-2 bg-white rounded-full shadow-md">
              <Share2 size={20} className="text-gray-800" />
            </button>
            <button 
              onClick={handleFavoriteClick}
              className="p-2 bg-white rounded-full shadow-md"
            >
              <Heart size={20} className="text-gray-800" />
            </button>
          </div>
        </div>
      </div>
      
      {/* プロフィール概要 */}
      <div className="bg-white -mt-8 rounded-t-3xl relative z-10 px-4 pt-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex space-x-4">
            <div className="w-16 h-16 -mt-12 rounded-xl overflow-hidden bg-white p-1 shadow-md flex items-center justify-center">
              <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center">
                {attender.icon}
              </div>
            </div>
            <div>
              <h1 className="text-xl font-bold">{attender.name}</h1>
              <div className="flex items-center space-x-1 mt-1">
                <Star size={16} className="text-yellow-500" />
                <span className="text-sm font-medium">{attender.rating}</span>
                <span className="text-sm text-gray-500">({attender.reviewCount}件のレビュー)</span>
              </div>
              <p className="text-sm text-gray-700 mt-1">{attender.type}</p>
            </div>
          </div>
          <button 
            onClick={handleRequestClick}
            className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            リクエスト
          </button>
        </div>
        
        {/* 基本情報 */}
        <div className="flex flex-wrap -mx-2 mb-6">
          <div className="px-2 w-1/2 mb-3">
            <div className="flex items-center">
              <MapPin size={16} className="text-gray-500 mr-2" />
              <span className="text-sm text-gray-700">{attender.location}</span>
            </div>
          </div>
          <div className="px-2 w-1/2 mb-3">
            <div className="flex items-center">
              <Clock size={16} className="text-gray-500 mr-2" />
              <span className="text-sm text-gray-700">返信: {attender.responseTime}</span>
            </div>
          </div>
          <div className="px-2 w-1/2 mb-3">
            <div className="flex items-center">
              <MessageCircle size={16} className="text-gray-500 mr-2" />
              <span className="text-sm text-gray-700">言語: {attender.languages.join(', ')}</span>
            </div>
          </div>
          <div className="px-2 w-1/2 mb-3">
            <div className="flex items-center">
              <Calendar size={16} className="text-gray-500 mr-2" />
              <span className="text-sm text-gray-700">予約可: {attender.availableDates.length}日</span>
            </div>
          </div>
        </div>
        
        {/* 専門分野タグ */}
        <div className="mb-6">
          <p className="text-sm font-medium mb-2">専門分野:</p>
          <div className="flex flex-wrap gap-2">
            {attender.specialties.map((specialty, index) => (
              <span 
                key={index} 
                className="px-3 py-1 bg-gray-100 rounded-full text-sm"
              >
                {specialty}
              </span>
            ))}
          </div>
        </div>
        
        {/* タブナビゲーション */}
        <div className="border-b mb-4">
          <div className="flex -mb-px">
            <button
              onClick={() => setSelectedTab('about')}
              className={`px-4 py-2 font-medium text-sm mr-4 ${
                selectedTab === 'about'
                  ? 'border-b-2 border-black text-black'
                  : 'text-gray-500'
              }`}
            >
              概要
            </button>
            <button
              onClick={() => setSelectedTab('experiences')}
              className={`px-4 py-2 font-medium text-sm mr-4 ${
                selectedTab === 'experiences'
                  ? 'border-b-2 border-black text-black'
                  : 'text-gray-500'
              }`}
            >
              体験プラン
            </button>
            <button
              onClick={() => setSelectedTab('reviews')}
              className={`px-4 py-2 font-medium text-sm ${
                selectedTab === 'reviews'
                  ? 'border-b-2 border-black text-black'
                  : 'text-gray-500'
              }`}
            >
              レビュー
            </button>
          </div>
        </div>
        
        {/* タブコンテンツ */}
        <div className="pb-4">
          {/* 概要タブ */}
          {selectedTab === 'about' && (
            <div>
              <h2 className="text-lg font-bold mb-2">自己紹介</h2>
              <div className={`text-gray-700 text-sm ${!showFullAbout && 'line-clamp-3'}`}>
                {attender.about}
              </div>
              {attender.about.length > 150 && (
                <button
                  onClick={() => setShowFullAbout(!showFullAbout)}
                  className="text-black font-medium text-sm mt-2 flex items-center"
                >
                  {showFullAbout ? '閉じる' : 'もっと見る'}
                  <ChevronDown
                    size={16}
                    className={`ml-1 transform ${showFullAbout ? 'rotate-180' : ''}`}
                  />
                </button>
              )}
              
              {/* ギャラリー（モック） */}
              <h2 className="text-lg font-bold mt-6 mb-2">ギャラリー</h2>
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3, 4, 5, 6].map((item) => (
                  <div key={item} className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                    <Image size={24} className="text-gray-400" />
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* 体験プランタブ */}
          {selectedTab === 'experiences' && (
            <div>
              <h2 className="text-lg font-bold mb-4">提供中の体験プラン</h2>
              <div className="space-y-4">
                {attender.experiences.map((experience) => (
                  <div key={experience.id} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-bold">{experience.title}</h3>
                        <div className="flex items-center space-x-3 mt-1 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Clock size={14} className="mr-1" />
                            <span>{experience.duration}</span>
                          </div>
                          <div className="flex items-center">
                            <Star size={14} className="text-yellow-500 mr-1" />
                            <span>{attender.rating}</span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-700 mt-2">{experience.description}</p>
                      </div>
                      <p className="font-bold text-black">¥{experience.price.toLocaleString()}</p>
                    </div>
                    <button 
                      onClick={handleRequestClick}
                      className="w-full mt-4 py-2 bg-black text-white rounded-lg text-sm font-medium"
                    >
                      予約する
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* レビュータブ */}
          {selectedTab === 'reviews' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold">レビュー</h2>
                <div className="flex items-center">
                  <Star size={18} className="text-yellow-500 mr-1" />
                  <span className="font-bold">{attender.rating}</span>
                  <span className="text-gray-500 ml-1">({attender.reviewCount})</span>
                </div>
              </div>
              
              <div className="space-y-6">
                {attender.reviews.map((review) => (
                  <div key={review.id} className="border-b pb-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        {review.userImage ? (
                          <img src={review.userImage} alt={review.userName} className="w-full h-full rounded-full" />
                        ) : (
                          <User size={20} className="text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <h3 className="font-medium">{review.userName}</h3>
                          <p className="text-sm text-gray-500">{review.date}</p>
                        </div>
                        <div className="flex mt-1 mb-2">
                          {Array.from({ length: 5 }).map((_, index) => (
                            <Star
                              key={index}
                              size={14}
                              className={index < review.rating ? "text-yellow-500" : "text-gray-300"}
                              fill={index < review.rating ? "currentColor" : "none"}
                            />
                          ))}
                        </div>
                        <p className="text-sm text-gray-700">{review.comment}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* すべてのレビューを見るボタン */}
              {attender.reviews.length < attender.reviewCount && (
                <button className="w-full mt-4 py-2 border border-gray-300 rounded-lg text-black font-medium text-sm">
                  すべてのレビューを見る
                </button>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* 予約リクエストモーダル */}
      {requestModalOpen && (
        <DirectRequestModal 
          attender={{
            id: attender.id,
            name: attender.name,
            type: attender.type,
            description: attender.about.substring(0, 100) + '...',
            rating: attender.rating,
            distance: attender.location,
            icon: attender.icon
          }}
          onClose={() => setRequestModalOpen(false)}
        />
      )}
    </div>
  );
};

// サンプルデータ
const detailedAttendersData: AttenderDetailType[] = [
  {
    id: 1,
    name: '鈴木 アキラ',
    type: 'バンドマン',
    rating: '4.9',
    reviewCount: 124,
    location: '東京都・新宿区',
    responseTime: '通常1時間以内',
    languages: ['日本語', '英語'],
    about: `東京の地下音楽シーンを20年以上知り尽くしたミュージシャンです。メジャーデビュー経験もありますが、現在はインディーズの魅力を伝えるために活動しています。下北沢、新宿、渋谷のライブハウス、レコードショップ、楽器店、ミュージシャンが集まる隠れた飲食店など、ガイドブックには載っていない本物の音楽文化をご案内します。

楽器を持っている方には、地元ミュージシャンとのセッションも手配可能です。音楽好きな方はもちろん、東京の別の一面を知りたい方にもおすすめの体験です。`,
    experiences: [
      {
        id: 101,
        title: '下北沢インディーシーン探訪ツアー',
        duration: '3時間',
        price: 8500,
        description: '下北沢のレコードショップ、ライブハウス、ミュージシャン御用達の飲食店を巡り、実際に地元バンドのリハーサルや小規模ライブを体験できます。',
      },
      {
        id: 102,
        title: 'ミュージシャン体験ワークショップ',
        duration: '2時間',
        price: 12000,
        description: 'プロの機材が揃ったスタジオでの演奏体験と、簡単なレコーディング体験ができます。楽器経験は問いません。',
      },
      {
        id: 103,
        title: '夜の音楽バー巡りツアー',
        duration: '4時間',
        price: 10000,
        description: 'ミュージシャンたちが集まる隠れた名店を巡り、時には飛び入りライブも楽しめる夜の音楽体験ツアーです。',
      }
    ],
    reviews: [
      {
        id: 1001,
        userName: 'Taro Y.',
        date: '2023年6月',
        rating: 5,
        comment: '鈴木さんのツアーは本当に素晴らしかったです！観光客が絶対に知らないような場所に連れて行ってもらい、地元のミュージシャンとも交流できました。次回東京に来るときも絶対に参加したいです。',
      },
      {
        id: 1002,
        userName: 'Emma S.',
        date: '2023年5月',
        rating: 5,
        comment: '音楽に詳しくなくても楽しめました。アキラさんの知識が豊富で、東京の音楽シーンの歴史から現在のトレンドまで詳しく教えてもらえて勉強になりました。',
      },
      {
        id: 1003,
        userName: 'Kenji M.',
        date: '2023年4月',
        rating: 4,
        comment: 'バンド仲間と一緒に参加しました。普段は入れないスタジオや、有名ミュージシャンが通うお店に案内してもらえて満足です。ただ、少し時間が足りないと感じました。',
      }
    ],
    availableDates: ['2023-07-15', '2023-07-16', '2023-07-18', '2023-07-20', '2023-07-21'],
    icon: <Music size={20} />,
    gallery: [], // 実際の画像URLを入れる
    specialties: ['インディーズ音楽', 'ライブハウス', 'レコードショップ', 'スタジオセッション', '音楽バー']
  },
  {
    id: 2,
    name: '山田 ユカリ',
    type: 'アーティスト',
    rating: '4.8',
    reviewCount: 98,
    location: '東京都・目黒区',
    responseTime: '通常3時間以内',
    languages: ['日本語', '英語', 'フランス語'],
    about: `美術大学卒業後、フランスでの留学経験もある現代アーティストです。東京のアートシーンを知り尽くし、有名な美術館から地下の小さなギャラリーまで精通しています。

アートツアーでは、単に作品を見るだけでなく、制作背景や文化的コンテキストについても詳しく解説します。また、希望に応じてアトリエでの創作体験もご用意しています。芸術に詳しい方はもちろん、「アートに興味はあるけど難しそう」という方にこそ、新しい視点を提供できると思います。`,
    experiences: [
      {
        id: 201,
        title: '現代アートギャラリーツアー',
        duration: '3時間',
        price: 7500,
        description: '表参道、銀座、天王洲などのギャラリーエリアで、注目の展示を巡ります。展示の背景や作家について詳しく解説します。',
      },
      {
        id: 202,
        title: 'アーティストアトリエ訪問＆創作体験',
        duration: '4時間',
        price: 15000,
        description: '実際のアーティストアトリエを訪問し、創作過程を見学。その後、簡単な創作ワークショップを体験できます。',
      }
    ],
    reviews: [
      {
        id: 2001,
        userName: 'Yuki T.',
        date: '2023年5月',
        rating: 5,
        comment: 'ユカリさんのアートツアーは素晴らしかったです。普段は近寄りがたいと思っていた現代アートについて、わかりやすく解説してもらえて新しい世界が開けました。',
      },
      {
        id: 2002,
        userName: 'Michael B.',
        date: '2023年3月',
        rating: 4,
        comment: '東京のアートシーンをより深く知ることができました。山田さんの知識が豊富で、各作品についての詳細な解説が有益でした。',
      }
    ],
    availableDates: ['2023-07-14', '2023-07-17', '2023-07-19', '2023-07-22', '2023-07-23'],
    icon: <Camera size={20} />,
    gallery: [], // 実際の画像URLを入れる
    specialties: ['現代アート', 'ギャラリー巡り', '創作ワークショップ', '美術史', 'アートコレクション']
  },
  {
    id: 3,
    name: '佐藤 ケンジ',
    type: 'クラフトビール職人',
    rating: '4.7',
    reviewCount: 86,
    location: '東京都・墨田区',
    responseTime: '通常6時間以内',
    languages: ['日本語', '英語'],
    about: `大手ビールメーカーで10年勤務した後、独立して小規模醸造所を立ち上げました。現在は東京のクラフトビールシーンを盛り上げるため、醸造所経営の傍ら、日本のクラフトビール文化を広める活動をしています。

ビールの製造過程はもちろん、原料や歴史、適切な楽しみ方まで、ビールにまつわるあらゆる知識をお伝えします。ツアーでは、都内の有名醸造所から隠れた名店まで、目的に合わせてカスタマイズ可能です。ビール好きな方だけでなく、日本の新しい食文化に興味がある方にもおすすめです。`,
    experiences: [
      {
        id: 301,
        title: '醸造所見学と試飲ツアー',
        duration: '3時間',
        price: 8000,
        description: '東京の代表的なクラフトビール醸造所を訪問。製造工程の見学と、できたての樽生ビールの試飲体験ができます。',
      },
      {
        id: 302,
        title: 'クラフトビールと日本食ペアリング体験',
        duration: '4時間',
        price: 12000,
        description: '厳選された日本のクラフトビールと、相性の良い日本食を楽しむガストロノミーツアー。5種類以上のペアリングを体験できます。',
      }
    ],
    reviews: [
      {
        id: 3001,
        userName: 'David L.',
        date: '2023年6月',
        rating: 5,
        comment: '佐藤さんのビール知識は本当に素晴らしいです。製造工程の細かい説明から、テイスティングのコツまで、ビール好きにはたまらないツアーでした。',
      },
      {
        id: 3002,
        userName: 'Akiko M.',
        date: '2023年4月',
        rating: 4,
        comment: 'ビールにあまり詳しくなかったのですが、とても楽しめました。特に日本食とのペアリングが新鮮な体験でした。',
      }
    ],
    availableDates: ['2023-07-16', '2023-07-17', '2023-07-18', '2023-07-21', '2023-07-24'],
    icon: <Coffee size={20} />,
    gallery: [], // 実際の画像URLを入れる
    specialties: ['クラフトビール', '醸造所見学', 'テイスティング', 'フードペアリング', '発酵文化']
  }
];

=======
import React, { useState } from 'react';
import { Star, MapPin, Clock, Calendar, MessageCircle, Heart, Share2, ArrowLeft, Bookmark, ChevronDown, Image, User, Music, Camera, Coffee, Gift } from 'lucide-react';
import { useAuth } from './AuthComponents';
import DirectRequestModal from './DirectRequestModal'; // 変更
import { AttenderType, IconProps } from './types'; // 追加

// アテンダー詳細に必要な型定義
interface AttenderDetailType {
  id: number;
  name: string;
  type: string;
  rating: string;
  reviewCount: number;
  location: string;
  responseTime: string;
  languages: string[];
  about: string;
  experiences: ExperienceType[];
  reviews: ReviewType[];
  availableDates: string[];
  icon: React.ReactElement<IconProps>; // 修正
  gallery: string[];
  specialties: string[];
}

interface ExperienceType {
  id: number;
  title: string;
  duration: string;
  price: number;
  description: string;
  image?: string;
}

interface ReviewType {
  id: number;
  userName: string;
  date: string;
  rating: number;
  comment: string;
  userImage?: string;
}

// アテンダー詳細画面コンポーネント
interface AttenderDetailScreenProps {
  attenderId: number;
  onBack: () => void;
}

const AttenderDetailScreen: React.FC<AttenderDetailScreenProps> = ({ attenderId, onBack }) => {
  const [showFullAbout, setShowFullAbout] = useState(false);
  const [selectedTab, setSelectedTab] = useState('about'); // 'about', 'experiences', 'reviews'
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const { isAuthenticated, openLoginModal } = useAuth();

  // サンプルデータから対象のアテンダーを取得
  const attender = detailedAttendersData.find(a => a.id === attenderId) || detailedAttendersData[0];

  // ログイン状態に応じたリクエスト処理
  const handleRequestClick = () => {
    if (isAuthenticated) {
      setRequestModalOpen(true);
    } else {
      openLoginModal();
    }
  };

  // お気に入り処理
  const handleFavoriteClick = () => {
    if (!isAuthenticated) {
      openLoginModal();
    }
    // お気に入り登録処理（ログイン済みの場合）
  };

  return (
    <div className="pb-20">
      {/* ヘッダー部分 */}
      <div className="relative h-64 bg-gray-200">
        {/* ギャラリー画像（モック） */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Image size={48} className="text-gray-400" />
        </div>
        
        {/* トップナビゲーション */}
        <div className="absolute top-0 left-0 right-0 p-4 flex justify-between z-10">
          <button 
            onClick={onBack}
            className="p-2 bg-white rounded-full shadow-md"
          >
            <ArrowLeft size={20} className="text-gray-800" />
          </button>
          <div className="flex space-x-2">
            <button className="p-2 bg-white rounded-full shadow-md">
              <Share2 size={20} className="text-gray-800" />
            </button>
            <button 
              onClick={handleFavoriteClick}
              className="p-2 bg-white rounded-full shadow-md"
            >
              <Heart size={20} className="text-gray-800" />
            </button>
          </div>
        </div>
      </div>
      
      {/* プロフィール概要 */}
      <div className="bg-white -mt-8 rounded-t-3xl relative z-10 px-4 pt-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex space-x-4">
            <div className="w-16 h-16 -mt-12 rounded-xl overflow-hidden bg-white p-1 shadow-md flex items-center justify-center">
              <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center">
                {attender.icon}
              </div>
            </div>
            <div>
              <h1 className="text-xl font-bold">{attender.name}</h1>
              <div className="flex items-center space-x-1 mt-1">
                <Star size={16} className="text-yellow-500" />
                <span className="text-sm font-medium">{attender.rating}</span>
                <span className="text-sm text-gray-500">({attender.reviewCount}件のレビュー)</span>
              </div>
              <p className="text-sm text-gray-700 mt-1">{attender.type}</p>
            </div>
          </div>
          <button 
            onClick={handleRequestClick}
            className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            リクエスト
          </button>
        </div>
        
        {/* 基本情報 */}
        <div className="flex flex-wrap -mx-2 mb-6">
          <div className="px-2 w-1/2 mb-3">
            <div className="flex items-center">
              <MapPin size={16} className="text-gray-500 mr-2" />
              <span className="text-sm text-gray-700">{attender.location}</span>
            </div>
          </div>
          <div className="px-2 w-1/2 mb-3">
            <div className="flex items-center">
              <Clock size={16} className="text-gray-500 mr-2" />
              <span className="text-sm text-gray-700">返信: {attender.responseTime}</span>
            </div>
          </div>
          <div className="px-2 w-1/2 mb-3">
            <div className="flex items-center">
              <MessageCircle size={16} className="text-gray-500 mr-2" />
              <span className="text-sm text-gray-700">言語: {attender.languages.join(', ')}</span>
            </div>
          </div>
          <div className="px-2 w-1/2 mb-3">
            <div className="flex items-center">
              <Calendar size={16} className="text-gray-500 mr-2" />
              <span className="text-sm text-gray-700">予約可: {attender.availableDates.length}日</span>
            </div>
          </div>
        </div>
        
        {/* 専門分野タグ */}
        <div className="mb-6">
          <p className="text-sm font-medium mb-2">専門分野:</p>
          <div className="flex flex-wrap gap-2">
            {attender.specialties.map((specialty, index) => (
              <span 
                key={index} 
                className="px-3 py-1 bg-gray-100 rounded-full text-sm"
              >
                {specialty}
              </span>
            ))}
          </div>
        </div>
        
        {/* タブナビゲーション */}
        <div className="border-b mb-4">
          <div className="flex -mb-px">
            <button
              onClick={() => setSelectedTab('about')}
              className={`px-4 py-2 font-medium text-sm mr-4 ${
                selectedTab === 'about'
                  ? 'border-b-2 border-black text-black'
                  : 'text-gray-500'
              }`}
            >
              概要
            </button>
            <button
              onClick={() => setSelectedTab('experiences')}
              className={`px-4 py-2 font-medium text-sm mr-4 ${
                selectedTab === 'experiences'
                  ? 'border-b-2 border-black text-black'
                  : 'text-gray-500'
              }`}
            >
              体験プラン
            </button>
            <button
              onClick={() => setSelectedTab('reviews')}
              className={`px-4 py-2 font-medium text-sm ${
                selectedTab === 'reviews'
                  ? 'border-b-2 border-black text-black'
                  : 'text-gray-500'
              }`}
            >
              レビュー
            </button>
          </div>
        </div>
        
        {/* タブコンテンツ */}
        <div className="pb-4">
          {/* 概要タブ */}
          {selectedTab === 'about' && (
            <div>
              <h2 className="text-lg font-bold mb-2">自己紹介</h2>
              <div className={`text-gray-700 text-sm ${!showFullAbout && 'line-clamp-3'}`}>
                {attender.about}
              </div>
              {attender.about.length > 150 && (
                <button
                  onClick={() => setShowFullAbout(!showFullAbout)}
                  className="text-black font-medium text-sm mt-2 flex items-center"
                >
                  {showFullAbout ? '閉じる' : 'もっと見る'}
                  <ChevronDown
                    size={16}
                    className={`ml-1 transform ${showFullAbout ? 'rotate-180' : ''}`}
                  />
                </button>
              )}
              
              {/* ギャラリー（モック） */}
              <h2 className="text-lg font-bold mt-6 mb-2">ギャラリー</h2>
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3, 4, 5, 6].map((item) => (
                  <div key={item} className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                    <Image size={24} className="text-gray-400" />
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* 体験プランタブ */}
          {selectedTab === 'experiences' && (
            <div>
              <h2 className="text-lg font-bold mb-4">提供中の体験プラン</h2>
              <div className="space-y-4">
                {attender.experiences.map((experience) => (
                  <div key={experience.id} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-bold">{experience.title}</h3>
                        <div className="flex items-center space-x-3 mt-1 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Clock size={14} className="mr-1" />
                            <span>{experience.duration}</span>
                          </div>
                          <div className="flex items-center">
                            <Star size={14} className="text-yellow-500 mr-1" />
                            <span>{attender.rating}</span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-700 mt-2">{experience.description}</p>
                      </div>
                      <p className="font-bold text-black">¥{experience.price.toLocaleString()}</p>
                    </div>
                    <button 
                      onClick={handleRequestClick}
                      className="w-full mt-4 py-2 bg-black text-white rounded-lg text-sm font-medium"
                    >
                      予約する
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* レビュータブ */}
          {selectedTab === 'reviews' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold">レビュー</h2>
                <div className="flex items-center">
                  <Star size={18} className="text-yellow-500 mr-1" />
                  <span className="font-bold">{attender.rating}</span>
                  <span className="text-gray-500 ml-1">({attender.reviewCount})</span>
                </div>
              </div>
              
              <div className="space-y-6">
                {attender.reviews.map((review) => (
                  <div key={review.id} className="border-b pb-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        {review.userImage ? (
                          <img src={review.userImage} alt={review.userName} className="w-full h-full rounded-full" />
                        ) : (
                          <User size={20} className="text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <h3 className="font-medium">{review.userName}</h3>
                          <p className="text-sm text-gray-500">{review.date}</p>
                        </div>
                        <div className="flex mt-1 mb-2">
                          {Array.from({ length: 5 }).map((_, index) => (
                            <Star
                              key={index}
                              size={14}
                              className={index < review.rating ? "text-yellow-500" : "text-gray-300"}
                              fill={index < review.rating ? "currentColor" : "none"}
                            />
                          ))}
                        </div>
                        <p className="text-sm text-gray-700">{review.comment}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* すべてのレビューを見るボタン */}
              {attender.reviews.length < attender.reviewCount && (
                <button className="w-full mt-4 py-2 border border-gray-300 rounded-lg text-black font-medium text-sm">
                  すべてのレビューを見る
                </button>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* 予約リクエストモーダル */}
      {requestModalOpen && (
        <DirectRequestModal 
          attender={{
            id: attender.id,
            name: attender.name,
            type: attender.type,
            description: attender.about.substring(0, 100) + '...',
            rating: attender.rating,
            distance: attender.location,
            icon: attender.icon
          }}
          onClose={() => setRequestModalOpen(false)}
        />
      )}
    </div>
  );
};

// サンプルデータ
const detailedAttendersData: AttenderDetailType[] = [
  {
    id: 1,
    name: '鈴木 アキラ',
    type: 'バンドマン',
    rating: '4.9',
    reviewCount: 124,
    location: '東京都・新宿区',
    responseTime: '通常1時間以内',
    languages: ['日本語', '英語'],
    about: `東京の地下音楽シーンを20年以上知り尽くしたミュージシャンです。メジャーデビュー経験もありますが、現在はインディーズの魅力を伝えるために活動しています。下北沢、新宿、渋谷のライブハウス、レコードショップ、楽器店、ミュージシャンが集まる隠れた飲食店など、ガイドブックには載っていない本物の音楽文化をご案内します。

楽器を持っている方には、地元ミュージシャンとのセッションも手配可能です。音楽好きな方はもちろん、東京の別の一面を知りたい方にもおすすめの体験です。`,
    experiences: [
      {
        id: 101,
        title: '下北沢インディーシーン探訪ツアー',
        duration: '3時間',
        price: 8500,
        description: '下北沢のレコードショップ、ライブハウス、ミュージシャン御用達の飲食店を巡り、実際に地元バンドのリハーサルや小規模ライブを体験できます。',
      },
      {
        id: 102,
        title: 'ミュージシャン体験ワークショップ',
        duration: '2時間',
        price: 12000,
        description: 'プロの機材が揃ったスタジオでの演奏体験と、簡単なレコーディング体験ができます。楽器経験は問いません。',
      },
      {
        id: 103,
        title: '夜の音楽バー巡りツアー',
        duration: '4時間',
        price: 10000,
        description: 'ミュージシャンたちが集まる隠れた名店を巡り、時には飛び入りライブも楽しめる夜の音楽体験ツアーです。',
      }
    ],
    reviews: [
      {
        id: 1001,
        userName: 'Taro Y.',
        date: '2023年6月',
        rating: 5,
        comment: '鈴木さんのツアーは本当に素晴らしかったです！観光客が絶対に知らないような場所に連れて行ってもらい、地元のミュージシャンとも交流できました。次回東京に来るときも絶対に参加したいです。',
      },
      {
        id: 1002,
        userName: 'Emma S.',
        date: '2023年5月',
        rating: 5,
        comment: '音楽に詳しくなくても楽しめました。アキラさんの知識が豊富で、東京の音楽シーンの歴史から現在のトレンドまで詳しく教えてもらえて勉強になりました。',
      },
      {
        id: 1003,
        userName: 'Kenji M.',
        date: '2023年4月',
        rating: 4,
        comment: 'バンド仲間と一緒に参加しました。普段は入れないスタジオや、有名ミュージシャンが通うお店に案内してもらえて満足です。ただ、少し時間が足りないと感じました。',
      }
    ],
    availableDates: ['2023-07-15', '2023-07-16', '2023-07-18', '2023-07-20', '2023-07-21'],
    icon: <Music size={20} />,
    gallery: [], // 実際の画像URLを入れる
    specialties: ['インディーズ音楽', 'ライブハウス', 'レコードショップ', 'スタジオセッション', '音楽バー']
  },
  {
    id: 2,
    name: '山田 ユカリ',
    type: 'アーティスト',
    rating: '4.8',
    reviewCount: 98,
    location: '東京都・目黒区',
    responseTime: '通常3時間以内',
    languages: ['日本語', '英語', 'フランス語'],
    about: `美術大学卒業後、フランスでの留学経験もある現代アーティストです。東京のアートシーンを知り尽くし、有名な美術館から地下の小さなギャラリーまで精通しています。

アートツアーでは、単に作品を見るだけでなく、制作背景や文化的コンテキストについても詳しく解説します。また、希望に応じてアトリエでの創作体験もご用意しています。芸術に詳しい方はもちろん、「アートに興味はあるけど難しそう」という方にこそ、新しい視点を提供できると思います。`,
    experiences: [
      {
        id: 201,
        title: '現代アートギャラリーツアー',
        duration: '3時間',
        price: 7500,
        description: '表参道、銀座、天王洲などのギャラリーエリアで、注目の展示を巡ります。展示の背景や作家について詳しく解説します。',
      },
      {
        id: 202,
        title: 'アーティストアトリエ訪問＆創作体験',
        duration: '4時間',
        price: 15000,
        description: '実際のアーティストアトリエを訪問し、創作過程を見学。その後、簡単な創作ワークショップを体験できます。',
      }
    ],
    reviews: [
      {
        id: 2001,
        userName: 'Yuki T.',
        date: '2023年5月',
        rating: 5,
        comment: 'ユカリさんのアートツアーは素晴らしかったです。普段は近寄りがたいと思っていた現代アートについて、わかりやすく解説してもらえて新しい世界が開けました。',
      },
      {
        id: 2002,
        userName: 'Michael B.',
        date: '2023年3月',
        rating: 4,
        comment: '東京のアートシーンをより深く知ることができました。山田さんの知識が豊富で、各作品についての詳細な解説が有益でした。',
      }
    ],
    availableDates: ['2023-07-14', '2023-07-17', '2023-07-19', '2023-07-22', '2023-07-23'],
    icon: <Camera size={20} />,
    gallery: [], // 実際の画像URLを入れる
    specialties: ['現代アート', 'ギャラリー巡り', '創作ワークショップ', '美術史', 'アートコレクション']
  },
  {
    id: 3,
    name: '佐藤 ケンジ',
    type: 'クラフトビール職人',
    rating: '4.7',
    reviewCount: 86,
    location: '東京都・墨田区',
    responseTime: '通常6時間以内',
    languages: ['日本語', '英語'],
    about: `大手ビールメーカーで10年勤務した後、独立して小規模醸造所を立ち上げました。現在は東京のクラフトビールシーンを盛り上げるため、醸造所経営の傍ら、日本のクラフトビール文化を広める活動をしています。

ビールの製造過程はもちろん、原料や歴史、適切な楽しみ方まで、ビールにまつわるあらゆる知識をお伝えします。ツアーでは、都内の有名醸造所から隠れた名店まで、目的に合わせてカスタマイズ可能です。ビール好きな方だけでなく、日本の新しい食文化に興味がある方にもおすすめです。`,
    experiences: [
      {
        id: 301,
        title: '醸造所見学と試飲ツアー',
        duration: '3時間',
        price: 8000,
        description: '東京の代表的なクラフトビール醸造所を訪問。製造工程の見学と、できたての樽生ビールの試飲体験ができます。',
      },
      {
        id: 302,
        title: 'クラフトビールと日本食ペアリング体験',
        duration: '4時間',
        price: 12000,
        description: '厳選された日本のクラフトビールと、相性の良い日本食を楽しむガストロノミーツアー。5種類以上のペアリングを体験できます。',
      }
    ],
    reviews: [
      {
        id: 3001,
        userName: 'David L.',
        date: '2023年6月',
        rating: 5,
        comment: '佐藤さんのビール知識は本当に素晴らしいです。製造工程の細かい説明から、テイスティングのコツまで、ビール好きにはたまらないツアーでした。',
      },
      {
        id: 3002,
        userName: 'Akiko M.',
        date: '2023年4月',
        rating: 4,
        comment: 'ビールにあまり詳しくなかったのですが、とても楽しめました。特に日本食とのペアリングが新鮮な体験でした。',
      }
    ],
    availableDates: ['2023-07-16', '2023-07-17', '2023-07-18', '2023-07-21', '2023-07-24'],
    icon: <Coffee size={20} />,
    gallery: [], // 実際の画像URLを入れる
    specialties: ['クラフトビール', '醸造所見学', 'テイスティング', 'フードペアリング', '発酵文化']
  }
];

>>>>>>> 7b9c74b (初期コミット: プロジェクト基本構造)
export default AttenderDetailScreen;