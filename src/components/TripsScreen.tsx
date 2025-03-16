// src/components/TripsScreen.tsx（既存のファイルを更新）
import React, { useState } from 'react';
import { Calendar, Clock, Star, User } from 'lucide-react';
import ReviewForm from './ReviewForm'; // 作成したReviewFormをインポート

// 体験の型定義
interface Experience {
  id: number;
  title: string;
  date: string;
  attenderId: number;
}

const TripsScreen = () => {
  const [showPastPlans, setShowPastPlans] = useState(false);
  // レビュー対象の体験を状態として保持
  const [reviewingExperience, setReviewingExperience] = useState<Experience | null>(null);

  // サンプルの過去の体験データ
  const pastExperiences: Experience[] = [
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

  // レビュー投稿処理
  const handleReviewSubmit = (review: { rating: number; comment: string }) => {
    if (!reviewingExperience) return;
    
    // ここで実際にはAPIリクエストを送信してレビューを保存
    console.log('レビュー投稿:', {
      attenderId: reviewingExperience.attenderId,
      experienceId: reviewingExperience.id,
      experienceTitle: reviewingExperience.title,
      rating: review.rating,
      comment: review.comment,
      date: new Date().toISOString(),
    });
    
    // レビュー投稿フォームを閉じる
    setReviewingExperience(null);
    
    // 成功メッセージを表示
    alert('レビューを投稿しました！');
  };

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold">あなたの旅程</h1>
      
      {/* サンプルプラン紹介（既存コード） */}
      <div className="bg-gray-50 p-4 rounded-lg">
        {/* 既存コードはそのまま */}
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
            {/* 既存コード */}
          </div>
        )}
      </div>
      
      {/* 今後の予約（既存コード） */}
      <div>
        <h2 className="text-xl font-bold mb-3">今後の予約</h2>
        <div className="bg-white rounded-lg shadow-sm p-4 space-y-4">
          {/* 既存コード */}
        </div>
      </div>
      
      {/* 過去の体験 - レビューボタンの機能を追加 */}
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
  onClick={(e) => {
    e.preventDefault();
    e.stopPropagation();
    alert('レビューボタンがクリックされました'); // デバッグ用
    setReviewingExperience(experience);
  }}
  className="text-black text-sm px-4 py-1 border border-gray-300 rounded-lg hover:bg-gray-100"
>
  レビューを書く
</button>
            </div>
          ))}
        </div>
      </div>
      
      {/* レビュー投稿モーダル */}
{reviewingExperience && (
  <div className="fixed inset-0 bg-black bg-opacity-50 z-[1000] flex items-center justify-center p-4">
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