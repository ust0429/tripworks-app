import React, { useState } from 'react';
import { User, Calendar } from 'lucide-react';
import { useAuth } from '../AuthComponents';
import ReviewForm from './ReviewForm'; // 正しいパスを確認してください

const TripsScreen = () => {
  const [showPastPlans, setShowPastPlans] = useState(false);
  const { isAuthenticated, openLoginModal } = useAuth();
  
  // レビュー関連の状態変数を追加
  const [reviewingExperience, setReviewingExperience] = useState<{
    id: number;
    title: string;
    attenderId: number;
  } | null>(null);

  // レビュー投稿処理
  const handleReviewSubmit = (review: { rating: number; comment: string }) => {
    if (!reviewingExperience) return;
    
    // ここで実際にはAPIリクエストを送信してレビューを保存
    console.log('レビュー投稿:', {
      attenderId: reviewingExperience.attenderId,
      experienceId: reviewingExperience.id,
      experienceTitle: reviewingExperience.title,
      ...review,
      date: new Date().toISOString(),
    });
    
    // レビュー投稿フォームを閉じる
    setReviewingExperience(null);
    
    // 成功メッセージを表示
    alert('レビューを投稿しました！');
  };
  
  // サンプルの過去の体験データ
  const pastExperiences = [
    {
      id: 101,
      title: '大阪の食文化探訪',
      date: '2023年6月10日',
      attenderId: 1,
    },
    {
      id: 102,
      title: '京都の路地裏散策',
      date: '2023年5月20日',
      attenderId: 2,
    }
  ];
  
  if (!isAuthenticated) {
    return (
      <div className="p-4 flex flex-col items-center justify-center h-full space-y-4">
        <div className="bg-gray-100 rounded-full p-6">
          <Calendar size={48} className="text-gray-400" />
        </div>
        <h2 className="text-xl font-bold text-center">あなたの旅程を確認</h2>
        <p className="text-gray-600 text-center">
          予約した体験やカスタム旅程を確認するには、ログインしてください。
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
        <h2 className="text-xl font-bold mb-3">過去の体験</h2>
        <div className="space-y-3">
          {pastExperiences.map((experience) => (
            <div key={experience.id} className="bg-white rounded-lg shadow-sm p-3 flex justify-between items-center">
              <div>
                <p className="font-medium">{experience.title}</p>
                <p className="text-sm text-gray-500">{experience.date}</p>
              </div>
              <button 
                onClick={() => setReviewingExperience(experience)}
                className="text-black text-sm"
              >
                レビューを書く
              </button>
            </div>
          ))}
        </div>
      </div>
      
      {/* レビュー投稿モーダル */}
      {reviewingExperience && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            <ReviewForm
              attenderId={reviewingExperience.attenderId}
              experienceTitle={reviewingExperience.title}
              onSubmit={handleReviewSubmit}
              onCancel={() => setReviewingExperience(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default TripsScreen;