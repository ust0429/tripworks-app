// src/components/AttenderDetailScreen.tsx
import React, { useState, useEffect } from 'react';
import { Star, MapPin, Clock, Calendar, MessageCircle, Heart, Share2, ArrowLeft, Bookmark, ChevronDown, Image, User, Music, Camera, Coffee, Gift, Loader, Plus } from 'lucide-react';
import { useAuth } from '../AuthComponents';
import DirectRequestModal from './DirectRequestModal';
import ReviewsList from './ReviewsList';
import ReviewCard from './ReviewCard';
import ReviewForm from './ReviewForm';
import AttenderDetailMap from './AttenderDetailMap';
import { getReviewsByAttenderId, getAverageRating, sortReviews, filterReviewsByRating, toggleReviewHelpful, addReview } from '../mockData';
import { AttenderType, AttenderDetailType, Review, IconProps } from '../types';

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
  const [isFavorite, setIsFavorite] = useState(false); // お気に入り状態
  const { isAuthenticated, user, openLoginModal } = useAuth();

  // レビュー関連の状態
  const [reviews, setReviews] = useState<Review[]>([]);
  const [filteredReviews, setFilteredReviews] = useState<Review[]>([]);
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [sortType, setSortType] = useState<'newest' | 'highest' | 'lowest' | 'most_helpful'>('newest');
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [reviewPhotosOnly, setReviewPhotosOnly] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [experienceTitle, setExperienceTitle] = useState('');
  
  // サンプルデータから対象のアテンダーを取得
  const attender = detailedAttendersData.find(a => a.id === attenderId) || detailedAttendersData[0];

  // 初期レビューの取得とソート
  useEffect(() => {
    // レビュータブが選択された時だけレビューを取得
    if (selectedTab === 'reviews') {
      setIsLoadingReviews(true);
      
      // 実際のアプリではここでAPIリクエストを送信
      // 少し遅延を入れてモックAPI呼び出しをシミュレート
      setTimeout(() => {
        try {
          const fetchedReviews = getReviewsByAttenderId(attenderId);
          setReviews(fetchedReviews);
          // レビューをソート
          applyReviewFilters(fetchedReviews, sortType, filterRating);
        } catch (error) {
          console.error('レビュー取得エラー:', error);
        } finally {
          setIsLoadingReviews(false);
        }
      }, 500);
    }
  }, [attenderId, selectedTab]);
  
  // フィルター状態が変更された時にフィルタリングを再適用
  useEffect(() => {
    if (reviews.length > 0) {
      applyReviewFilters(reviews, sortType, filterRating);
    }
  }, [reviewPhotosOnly]);
  
  // レビューのフィルタリングとソートを適用
  const applyReviewFilters = (
    reviewsToFilter: Review[], 
    currentSortType: 'newest' | 'highest' | 'lowest' | 'most_helpful',
    currentFilterRating: number | null
  ) => {
    // まずソート
    let sorted = sortReviews(reviewsToFilter, currentSortType === 'most_helpful' ? 'newest' : currentSortType);
    
    // 役立つ順の特別処理
    if (currentSortType === 'most_helpful') {
      sorted = [...sorted].sort((a, b) => (b.helpfulCount || 0) - (a.helpfulCount || 0));
    }
    
    // 評価でフィルタリングを適用
    let filtered = filterReviewsByRating(sorted, currentFilterRating);
    
    // 写真付きのみフィルターを適用
    if (reviewPhotosOnly) {
      filtered = filtered.filter(review => review.photoUrls && review.photoUrls.length > 0);
    }
    
    setFilteredReviews(filtered);
  };
  
  // レビュー並び替えハンドラー
  const handleSortChange = (type: 'newest' | 'highest' | 'lowest' | 'most_helpful') => {
    setSortType(type);
    applyReviewFilters(reviews, type, filterRating);
  };
  
  // レビューフィルターハンドラー
  const handleFilterChange = (rating: number | null) => {
    setFilterRating(rating);
    applyReviewFilters(reviews, sortType, rating);
  };
  
  // レビューを投稿済みかチェック
  const hasReviewed = isAuthenticated && reviews.some(
    review => review.userId === (user?.id || 'user1') // 継続性のためにモックユーザー・実際はログイン中のユーザーIDを使う
  );

  // アテンダーの体験に参加済みかチェック
  // 実際のアプリではここでAPIリクエストを使って確認
  const hasAttended = isAuthenticated; // モックとしてログイン済みなら体験済みとする

  // レビュー投稿ボタンをクリック
  const handleAddReviewClick = () => {
    if (!isAuthenticated) {
      openLoginModal();
      return;
    }
    
    if (!hasAttended) {
      alert('このアテンダーの体験に参加後にレビューを投稿できます。');
      return;
    }
    
    setShowReviewForm(true);
  };
  
  // レビューを投稿
  const handleSubmitReview = (reviewData: { rating: number; comment: string; photos?: File[] }) => {
    if (!isAuthenticated || !user) {
      openLoginModal();
      return;
    }
    
    // 必要なフィールドがあるか確認
    if (!experienceTitle) {
      alert('体験名を選択してください');
      return;
    }
    
    // 写真の最大数を確認
    if (reviewData.photos && reviewData.photos.length > 5) {
      alert('写真は最大5枚までアップロードできます');
      return;
    }
    
    console.log('レビュー投稿開始:', { 
      rating: reviewData.rating, 
      commentLength: reviewData.comment.length,
      photos: reviewData.photos ? `${reviewData.photos.length}枚の写真` : 'なし',
      experienceTitle
    });
    
    try {
      // 写真データを確認
      if (reviewData.photos && reviewData.photos.length > 0) {
        console.log('写真データ:', reviewData.photos.map(photo => ({
          name: photo.name,
          type: photo.type,
          size: photo.size,
          lastModified: new Date(photo.lastModified).toISOString()
        })));
      }
      
      // 新しいレビューを追加
      const newReview = addReview({
        attenderId,
        userId: user.id,
        userName: user.name,
        rating: reviewData.rating,
        comment: reviewData.comment,
        experienceTitle
      }, reviewData.photos);
      
      console.log('返却されたレビューデータ:', {
        id: newReview.id,
        photoUrls: newReview.photoUrls ? `${newReview.photoUrls.length}枚の写真` : 'なし',
        hasPhotoUrls: Boolean(newReview.photoUrls)
      });
      
      // レビューリストを更新
      setReviews([newReview, ...reviews]);
      setShowReviewForm(false);
      setExperienceTitle(''); // 体験名をリセット
      
      // フィルタリングを再適用
      applyReviewFilters([newReview, ...reviews], sortType, filterRating);
      
      // 成功メッセージ
      alert('レビューを投稿しました。ありがとうございます！');
    } catch (error) {
      console.error('レビュー投稿エラー:', error);
      alert('レビューの投稿に失敗しました。もう一度お試しください。');
    }
  };

  // レビューの「役立った」トグルハンドラー
  const handleHelpfulToggle = (reviewId: string, isHelpful: boolean) => {
    if (!isAuthenticated) {
      openLoginModal();
      return;
    }
    
    // 実際のアプリではここでAPIリクエストを送信
    
    // UIを更新
    setReviews(prev => prev.map(review => 
      review.id === reviewId 
        ? { 
            ...review, 
            helpfulCount: isHelpful 
              ? (review.helpfulCount || 0) + 1
              : Math.max((review.helpfulCount || 0) - 1, 0)
          }
        : review
    ));
    
    // フィルタリングを再適用
    const updatedReviews = reviews.map(review => 
      review.id === reviewId 
        ? { 
            ...review, 
            helpfulCount: isHelpful 
              ? (review.helpfulCount || 0) + 1
              : Math.max((review.helpfulCount || 0) - 1, 0)
          }
        : review
    );
    
    applyReviewFilters(updatedReviews, sortType, filterRating);
  };

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
      return;
    }
    
    // お気に入り状態を切り替え
    setIsFavorite(!isFavorite);
    // 実際のアプリではここでAPIリクエストを送信
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
              <Heart 
                size={20} 
                className={isFavorite ? "text-red-500 fill-current" : "text-gray-800"} 
              />
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
              
              {/* 活動地域の地図 */}
              <h2 className="text-lg font-bold mt-6 mb-2">活動エリア</h2>
              <AttenderDetailMap attender={attender} height={200} />
              <p className="text-xs text-gray-500 mt-1 text-center">
                {attender.name}さんの主な活動エリア: {attender.location}
              </p>
              
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
              {/* レビュー投稿ボタン */}
              {!hasReviewed && hasAttended && (
                <div className="mb-6 bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">このアテンダーの体験を評価しましょう</p>
                      <p className="text-sm text-gray-600">あなたのレビューは他の人の参考になります</p>
                    </div>
                    <button 
                      onClick={handleAddReviewClick}
                      className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center"
                    >
                      <Plus size={16} className="mr-1" />
                      レビューを書く
                    </button>
                  </div>
                </div>
              )}
              
              {/* レビュー投稿フォーム */}
              {showReviewForm && (
                <div className="mb-6">
                  <div className="mb-2 flex items-center">
                    <label className="block text-sm font-medium text-gray-700 mr-2">
                      体験名: <span className="text-gray-500 text-xs">(必須)</span>
                    </label>
                    <select
                      value={experienceTitle}
                      onChange={(e) => setExperienceTitle(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-gray-500 focus:border-gray-500"
                      required
                    >
                      <option value="">体験名を選択してください</option>
                      {attender.experiences.map(exp => (
                        <option key={exp.id} value={exp.title}>{exp.title}</option>
                      ))}
                    </select>
                  </div>
                  <ReviewForm
                    attenderId={attenderId}
                    experienceTitle={experienceTitle || '未選択'}
                    onSubmit={handleSubmitReview}
                    onCancel={() => setShowReviewForm(false)}
                  />
                </div>
              )}
              
              {isLoadingReviews ? (
                <div className="py-10 flex flex-col items-center justify-center">
                  <Loader size={32} className="text-gray-400 animate-spin mb-3" />
                  <p className="text-gray-500">レビューを読み込み中...</p>
                </div>
              ) : (
                <ReviewsList
                  reviews={filteredReviews.length > 0 ? filteredReviews : reviews}
                  averageRating={getAverageRating(attenderId) || parseFloat(attender.rating)}
                  reviewCount={reviews.length || attender.reviewCount}
                  onSortChange={handleSortChange}
                  onFilterChange={handleFilterChange}
                  onHelpfulToggle={handleHelpfulToggle}
                />
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
    description: '東京の地下音楽シーンを知り尽くしたベテランミュージシャン。名ライブハウスから秘密のスタジオまでご案内します。',
    distance: '2.3km先',
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
    description: '地元で活動する現代アーティスト。アトリエ巡りから創作体験まで、芸術の視点から街の魅力を再発見。',
    distance: '1.5km先',
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
    description: '地元醸造所のマスターブリュワー。ビール造りの過程から地域の食文化まで、職人視点の旅へ。',
    distance: '3.1km先',
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

export default AttenderDetailScreen;