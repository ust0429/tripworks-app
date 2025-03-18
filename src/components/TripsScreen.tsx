// src/components/TripsScreen.tsx
import React, { useState, useEffect } from 'react';
import { User, Star, Calendar, Check, RefreshCcw } from 'lucide-react';
import ReviewModal from './ReviewModal';
import { useAuth } from '../AuthComponents';
import { PastExperience } from '../types';
import { addReview, getReviewsByAttenderId } from '../mockData'; // 必要な関数をインポート

const TripsScreen: React.FC = () => {
  const [showPastPlans, setShowPastPlans] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedExperience, setSelectedExperience] = useState<PastExperience | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { isAuthenticated, openLoginModal, user } = useAuth();
  
  // サンプルの過去の体験データ
  const initialPastExperiences: PastExperience[] = [
    {
      id: 101,
      title: "大阪の食文化探訪",
      date: "2023年6月10日",
      isReviewed: false,
      attenderId: 3 // 佐藤さんを指定
    },
    {
      id: 102,
      title: "京都の路地裏散策",
      date: "2023年5月20日",
      isReviewed: false,
      attenderId: 2 // 山田さんを指定
    },
    {
      id: 103,
      title: "下北沢インディーシーン探訪ツアー",
      date: "2023年6月30日",
      isReviewed: true,
      attenderId: 1 // 鈴木さんを指定
    }
  ];
  
  const [pastExperiences, setPastExperiences] = useState<PastExperience[]>(initialPastExperiences);
  
  // 過去の体験に対するレビューステータスを確認
  useEffect(() => {
    // 実際のアプリではここでAPIリクエストを送信してデータを取得
    
    // レビュー済みの体験を確認するロジックを実装可能
    const checkReviewedExperiences = () => {
      // APIデータの代わりにモックデータを使用
      pastExperiences.forEach(exp => {
        if (!exp.attenderId) return;
        
        const reviews = getReviewsByAttenderId(exp.attenderId);
        // レビューが存在するか確認
        const hasReviewed = reviews.some(review => 
          review.experienceTitle?.includes(exp.title) && 
          review.userId === (user?.id || 'current-user')
        );
        
        if (hasReviewed && !exp.isReviewed) {
          setPastExperiences(prev => 
            prev.map(e => e.id === exp.id ? { ...e, isReviewed: true } : e)
          );
        }
      });
    };
    
    checkReviewedExperiences();
  }, []);
  
  const handleReviewClick = (experience: PastExperience) => {
    if (isAuthenticated) {
      setSelectedExperience(experience);
      setReviewModalOpen(true);
    } else {
      openLoginModal();
    }
  };
  
  const [refreshing, setRefreshing] = useState(false);
  
  // データの更新処理
  const refreshData = () => {
    setRefreshing(true);
    // 実際のアプリではここで最新データを取得
    
    // 更新成功をシミュレート
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const handleReviewSubmit = async (rating: number, comment: string, photos?: File[]) => {
    if (!selectedExperience) return;
    
    setIsSubmitting(true);
    setReviewError(null);
    setUploadProgress(0);
    
    try {
      // 写真がある場合は、アップロード進捗をシミュレート
      if (photos && photos.length > 0) {
        // 進捗シミュレーション
        const simulateUploadProgress = () => {
          let progress = 0;
          const interval = setInterval(() => {
            progress += Math.floor(Math.random() * 10) + 1;
            if (progress >= 100) {
              progress = 100;
              clearInterval(interval);
            }
            setUploadProgress(progress);
          }, 300);
          
          // 実際のアプリではアップロード完了時にクリア
          return interval;
        };
        
        const progressInterval = simulateUploadProgress();
        
        // 進捗シミュレーションのクリーンアップ
        setTimeout(() => {
          clearInterval(progressInterval);
          setUploadProgress(100);
        }, 3000);
      }
      
      // mockData内のaddReview関数を使用
      const newReview = addReview({
        attenderId: selectedExperience.attenderId || 1, // アテンダーID
        userId: user?.id || 'current-user', // ユーザーID
        userName: user?.name || 'ゲスト', // ユーザー名
        rating: rating,
        comment: comment,
        experienceTitle: selectedExperience.title,
        helpfulCount: 0 // 初期値
      }, photos); // 写真を追加
      
      console.log('投稿されたレビュー:', newReview);
      
      // UIの更新
      setPastExperiences(prev => 
        prev.map(exp => 
          exp.id === selectedExperience.id 
            ? { ...exp, isReviewed: true } 
            : exp
        )
      );
      
      // 成功時の処理
      setTimeout(() => {
        setReviewModalOpen(false);
        setUploadProgress(0);
        
        // レビュー完了メッセージ
        setTimeout(() => {
          alert('レビューを投稿いただきありがとうございます！');
        }, 500);
      }, 1000);
      
    } catch (error) {
      console.error('レビュー投稿エラー:', error);
      setReviewError(error instanceof Error ? error.message : 'レビューの投稿中にエラーが発生しました');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // 未ログインの場合はログインを促す
  if (!isAuthenticated) {
    return (
      <div className="p-4 flex flex-col items-center justify-center h-full space-y-4">
        <div className="bg-gray-100 rounded-full p-6">
          <Calendar size={48} className="text-gray-400" />
        </div>
        <h2 className="text-xl font-bold text-center">旅程を管理</h2>
        <p className="text-gray-600 text-center">
          予約やレビューを管理するには、ログインしてください。
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
      <h1 className="text-2xl font-bold">あなたの旅程</h1>
      
      {/* サンプルプラン紹介 */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-bold text-gray-800">サンプルプラン</h2>
          <button 
            onClick={() => setShowPastPlans(!showPastPlans)}
            className="text-black text-sm"
          >
            {showPastPlans ? '閉じる' : '見る'}
          </button>
        </div>
        
        {showPastPlans && (
          <div className="space-y-3 mt-3">
            <div className="bg-white rounded-lg p-3 border border-gray-200">
              <div className="flex items-center space-x-2 mb-2">
                <div className="text-xl">🎵</div>
                <p className="font-medium text-gray-800">下北沢音楽散策プラン</p>
              </div>
              <p className="text-sm text-gray-600 mb-2">
                バンドマンの鈴木さんと巡る、地元ミュージシャンに人気のレコードショップとライブハウス。楽器店での試奏体験やオープンマイクへの飛び入り参加も。
              </p>
              <div className="text-xs text-gray-500">人気度: ★★★★☆ • 所要時間: 約3時間</div>
            </div>
            
            <div className="bg-white rounded-lg p-3 border border-gray-200">
              <div className="flex items-center space-x-2 mb-2">
                <div className="text-xl">🍶</div>
                <p className="font-medium text-gray-800">地元民の角打ち体験</p>
              </div>
              <p className="text-sm text-gray-600 mb-2">
                酒販店元店主の田中さんと巡る、観光客が知らない角打ちスポット。地酒の試飲と地元の常連客との交流を通じて、リアルな食文化を体験。
              </p>
              <div className="text-xs text-gray-500">人気度: ★★★★★ • 所要時間: 約2時間</div>
            </div>
            
            <div className="bg-white rounded-lg p-3 border border-gray-200">
              <div className="flex items-center space-x-2 mb-2">
                <div className="text-xl">🏮</div>
                <p className="font-medium text-gray-800">夕暮れの路地裏写真スポット</p>
              </div>
              <p className="text-sm text-gray-600 mb-2">
                写真家の佐藤さんと巡る、夕暮れ時の都市の隠れた絶景スポット。昼と夜の境目に現れる特別な光の演出を、プロのアドバイスとともに撮影。
              </p>
              <div className="text-xs text-gray-500">人気度: ★★★★☆ • 所要時間: 約2.5時間</div>
            </div>
          </div>
        )}
      </div>
      
      {/* 今後の予約 */}
      <div>
        <h2 className="text-xl font-bold mb-3">今後の予約</h2>
        <div className="bg-white rounded-lg shadow-sm p-4 space-y-4">
          <div className="flex items-center space-x-3">
            <div className="bg-gray-100 rounded-full p-2">
              <User size={24} className="text-gray-600" />
            </div>
            <div>
              <p className="font-medium">鈴木 アキラ (バンドマン)</p>
              <p className="text-sm text-gray-500">東京の音楽シーンを巡る</p>
            </div>
          </div>
          <div className="border-t pt-4">
            <div className="flex justify-between">
              <div className="text-sm text-gray-700">
                <p>2023年7月15日 14:00〜17:00</p>
                <p className="mt-1">集合場所: 新宿駅東口</p>
              </div>
              <button className="px-4 py-2 bg-black text-white rounded-lg text-sm">
                詳細
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* 過去の体験 */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xl font-bold">過去の体験</h2>
          <button 
            onClick={refreshData}
            className="flex items-center text-sm text-gray-600 hover:text-black transition-colors"
            disabled={refreshing}
          >
            {refreshing ? (
              <>
                <RefreshCcw size={16} className="mr-1 animate-spin" />
                更新中...
              </>
            ) : (
              <>
                <RefreshCcw size={16} className="mr-1" />
                更新
              </>
            )}
          </button>
        </div>
        
        {pastExperiences.length > 0 ? (
          <div className="space-y-3">
            {pastExperiences.map((experience) => (
              <div key={experience.id} className="bg-white rounded-lg shadow-sm p-3 flex justify-between items-center">
                <div>
                  <p className="font-medium">{experience.title}</p>
                  <p className="text-sm text-gray-500">{experience.date}</p>
                </div>
                {experience.isReviewed ? (
                  <div className="flex items-center bg-green-50 text-green-700 px-2 py-1 rounded-full">
                    <Check size={14} className="mr-1" />
                    <span className="text-xs">レビュー済み</span>
                  </div>
                ) : (
                  <button 
                    onClick={() => handleReviewClick(experience)} 
                    className="px-3 py-1 bg-black text-white rounded-full text-xs font-medium hover:bg-gray-800 transition-colors"
                  >
                    レビューを書く
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 p-6 rounded-lg text-center">
            <p className="text-gray-500 mb-2">過去の体験はまだありません</p>
            <p className="text-sm text-gray-400">体験に参加すると、ここに表示されます</p>
          </div>
        )}
      </div>
      
      {/* レビューモーダル */}
      {reviewModalOpen && selectedExperience && (
        <ReviewModal 
          experienceName={selectedExperience.title}
          onClose={() => {
            setReviewModalOpen(false);
            setReviewError(null);
          }}
          onSubmit={handleReviewSubmit}
          isSubmitting={isSubmitting}
          error={reviewError}
          enableCamera={true} // カメラ機能を有効化
          uploadProgress={uploadProgress} // アップロード進捗を渡す
        />
      )}
    </div>
  );
};

export default TripsScreen;