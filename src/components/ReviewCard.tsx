// src/components/ReviewCard.tsx
import React, { useState } from 'react';
import { Star, User, ThumbsUp, MoreVertical, Flag, Calendar, Award, Clock, Image, MessageCircle } from 'lucide-react';
import { Review, ReviewReply } from '../types';
import { useAuth } from '../AuthComponents';
import ReviewPhotoViewer from './ReviewPhotoViewer';
import ReviewReplyComponent from './ReviewReply';
import ReviewReplyForm from './ReviewReplyForm';
import { getReviewReplies, addReviewReply, updateReviewReply, deleteReviewReply } from '../mockData';

interface ReviewCardProps {
  review: Review;
  onHelpfulToggle?: (reviewId: string, isHelpful: boolean) => void;
}

const ReviewCard: React.FC<ReviewCardProps> = ({ review, onHelpfulToggle }) => {
  const { isAuthenticated, openLoginModal, currentUser } = useAuth();
  // 「役に立った」ボタンの状態
  const [helpful, setHelpful] = useState(false);
  const [helpfulCount, setHelpfulCount] = useState(review.helpfulCount || 0);
  const [showOptions, setShowOptions] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [showFullReview, setShowFullReview] = useState(false);
  const [showPhotoViewer, setShowPhotoViewer] = useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  
  // 返信関連の状態
  const [replies, setReplies] = useState<ReviewReply[]>([]);
  const [showReplies, setShowReplies] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // コメントが長いかどうかをチェック
  const isLongComment = review.comment.length > 200;
  // 表示用のコメント
  const displayComment = isLongComment && !showFullReview 
    ? `${review.comment.substring(0, 200)}...` 
    : review.comment;
  
  // 初期読み込み時に返信を取得
  React.useEffect(() => {
    if (showReplies) {
      const fetchedReplies = getReviewReplies(review.id);
      setReplies(fetchedReplies as ReviewReply[]);
    }
  }, [showReplies, review.id]);
  
  const toggleHelpful = () => {
    if (!isAuthenticated) {
      openLoginModal();
      return;
    }
    
    if (helpful) {
      setHelpfulCount(prev => prev - 1);
    } else {
      setHelpfulCount(prev => prev + 1);
    }
    setHelpful(!helpful);
    
    // 親コンポーネントにイベントを通知
    if (onHelpfulToggle) {
      onHelpfulToggle(review.id, !helpful);
    }
    
    // 実際のアプリではここでAPIリクエストを送信
  };
  
  const handleReport = () => {
    if (!isAuthenticated) {
      openLoginModal();
      return;
    }
    
    setReportModalOpen(true);
    setShowOptions(false);
  };
  
  const handleReportSubmit = () => {
    // 実際のアプリではここでAPIリクエストを送信
    console.log(`レビューID: ${review.id} の報告理由: ${reportReason}`);
    setReportModalOpen(false);
    setReportReason('');
    // 報告完了通知
    alert('レビューの報告を受け付けました。ご協力ありがとうございます。');
  };
  
  // 返信表示切り替え
  const toggleReplies = () => {
    setShowReplies(!showReplies);
    if (!showReplies && !replies.length) {
      const fetchedReplies = getReviewReplies(review.id);
      setReplies(fetchedReplies as ReviewReply[]);
    }
  };
  
  // 返信フォーム表示切り替え
  const toggleReplyForm = () => {
    if (!isAuthenticated) {
      openLoginModal();
      return;
    }
    setShowReplyForm(!showReplyForm);
  };
  
  // 返信の送信
  const handleSubmitReply = (reviewId: string, content: string) => {
    if (!isAuthenticated || !currentUser) {
      openLoginModal();
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // 返信を追加
      const newReply = addReviewReply({
        reviewId,
        userId: currentUser.id,
        userName: currentUser.name,
        userType: currentUser.type || 'user',
        userImage: currentUser.photoUrl,
        content
      });
      
      // 返信リストを更新
      setReplies([...replies, newReply as ReviewReply]);
      
      // フォームを閉じる
      setShowReplyForm(false);
      setShowReplies(true);
      
      // レビュー返信カウントを更新（実際のアプリではAPI応答から更新）
      review.replyCount = (review.replyCount || 0) + 1;
    } catch (error) {
      console.error('返信送信エラー:', error);
      alert('返信の送信中にエラーが発生しました');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // 返信の編集
  const handleEditReply = (replyId: string, newContent: string) => {
    if (updateReviewReply(replyId, newContent)) {
      // 返信リストを更新
      setReplies(replies.map(reply => 
        reply.id === replyId 
          ? { ...reply, content: newContent } 
          : reply
      ));
    }
  };
  
  // 返信の削除
  const handleDeleteReply = (replyId: string) => {
    if (deleteReviewReply(replyId)) {
      // 返信リストから削除
      setReplies(replies.filter(reply => reply.id !== replyId));
      
      // レビュー返信カウントを更新（実際のアプリではAPI応答から更新）
      if (review.replyCount && review.replyCount > 0) {
        review.replyCount -= 1;
      }
    }
  };

  return (
    <div className="border-b pb-4 relative">
      <div className="flex items-start space-x-3">
        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
          {review.userImage ? (
            <img src={review.userImage} alt={review.userName} className="w-full h-full object-cover" />
          ) : (
            <User size={20} className="text-gray-400" />
          )}
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-center">
            <h3 className="font-medium">{review.userName}</h3>
            <div className="flex items-center space-x-2">
              <p className="text-sm text-gray-500">{formatDate(review.date)}</p>
              <button
                onClick={() => setShowOptions(!showOptions)}
                className="text-gray-400 hover:text-gray-600"
              >
                <MoreVertical size={16} />
              </button>
            </div>
          </div>
          
          {/* 評価と時間表示 */}
          <div className="flex items-center mt-1 mb-2">
            <div className="flex mr-3">
              {Array.from({ length: 5 }).map((_, index) => (
                <Star
                  key={index}
                  size={14}
                  className={index < review.rating ? "text-yellow-500" : "text-gray-300"}
                  fill={index < review.rating ? "currentColor" : "none"}
                />
              ))}
            </div>
            
            {/* 体験からの経過時間 */}
            <div className="flex items-center text-xs text-gray-500">
              <Clock size={12} className="mr-1" />
              <span>{getTimeSinceExperience(review.date)}</span>
            </div>
          </div>
          
          {/* 体験名とバッジ */}
          <div className="flex flex-wrap gap-2 mb-2">
            {review.experienceTitle && (
              <div className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full inline-flex items-center">
                <Calendar size={10} className="mr-1" />
                <span>{review.experienceTitle}</span>
              </div>
            )}
            
            {/* 有益なレビューバッジ（helpfulCountが高い場合） */}
            {helpfulCount >= 5 && (
              <div className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full inline-flex items-center">
                <Award size={10} className="mr-1" />
                <span>人気のレビュー</span>
              </div>
            )}
          </div>
          
          {/* レビュー本文 */}
          <p className="text-sm text-gray-700 mt-1">{displayComment}</p>
          
          {/* もっと見るボタン */}
          {isLongComment && (
            <button
              onClick={() => setShowFullReview(!showFullReview)}
              className="text-gray-500 text-xs mt-1 hover:text-black"
            >
              {showFullReview ? '一部を表示' : 'すべて表示'}
            </button>
          )}
          
          {/* レビュー写真の表示 */}
          {review.photoUrls && review.photoUrls.length > 0 && (
            <div className="mt-3">
              <div className="flex flex-wrap gap-2">
                {review.photoUrls.map((url, index) => (
                  <div 
                    key={index} 
                    className="w-20 h-20 bg-gray-100 rounded overflow-hidden cursor-pointer"
                    onClick={() => {
                      setSelectedPhotoIndex(index);
                      setShowPhotoViewer(true);
                    }}
                  >
                    <img 
                      src={url} 
                      alt={`${review.userName}の写真 ${index + 1}`} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-1 flex items-center">
                <Image size={12} className="mr-1" />
                {review.photoUrls.length}枚の写真が添付されています
              </p>
            </div>
          )}
          
          {/* 写真ビューワーモーダル */}
          {showPhotoViewer && review.photoUrls && (
            <ReviewPhotoViewer
              photos={review.photoUrls}
              initialIndex={selectedPhotoIndex}
              onClose={() => setShowPhotoViewer(false)}
            />
          )}
          
          {/* 追加情報とメタデータ */}
          <div className="mt-2 flex items-center text-xs text-gray-500">
            <Calendar size={12} className="mr-1" />
            <span className="mr-3">体験日: {formatDate(review.date.split('T')[0])}</span>
          </div>
          
          {/* 役に立ったボタンと返信ボタン */}
          <div className="mt-3 flex items-center justify-between">
            <button 
              onClick={toggleHelpful}
              className={`flex items-center space-x-1 text-xs px-2 py-1 rounded-full ${
                helpful 
                  ? 'bg-gray-200 text-gray-800' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <ThumbsUp size={12} className={helpful ? 'text-black' : 'text-gray-500'} />
              <span>{helpful ? '役に立った' : '役に立つ'}</span>
              {helpfulCount > 0 && <span className="ml-1">({helpfulCount})</span>}
            </button>
            
            {/* 返信ボタン */}
            <div className="flex space-x-2">
              {review.replyCount && review.replyCount > 0 && (
                <button 
                  onClick={toggleReplies}
                  className="text-xs text-gray-500 flex items-center"
                >
                  <MessageCircle size={12} className="mr-1" />
                  {showReplies ? '返信を非表示' : `返信を表示 (${review.replyCount})`}
                </button>
              )}
              {isAuthenticated && (
                <button 
                  onClick={toggleReplyForm}
                  className="text-xs text-gray-500 hover:text-black"
                >
                  返信
                </button>
              )}
            </div>
          </div>
          
          {/* レビュー返信の表示 */}
          {showReplies && replies.length > 0 && (
            <div className="mt-3">
              {replies.map(reply => (
                <ReviewReplyComponent
                  key={reply.id}
                  reply={reply}
                  isOwner={currentUser ? currentUser.id === reply.userId : false}
                  onEdit={handleEditReply}
                  onDelete={handleDeleteReply}
                />
              ))}
            </div>
          )}
          
          {/* 返信フォーム */}
          {showReplyForm && (
            <ReviewReplyForm
              reviewId={review.id}
              onSubmit={handleSubmitReply}
              onCancel={() => setShowReplyForm(false)}
              isSubmitting={isSubmitting}
            />
          )}
          
          {/* レビューオプションメニュー */}
          {showOptions && (
            <div className="absolute top-8 right-0 bg-white shadow-lg rounded-lg py-1 z-10 w-32">
              <button
                onClick={handleReport}
                className="w-full px-3 py-2 text-left text-sm flex items-center hover:bg-gray-100"
              >
                <Flag size={14} className="mr-2 text-gray-500" />
                報告する
              </button>
            </div>
          )}
          
          {/* 報告モーダル */}
          {reportModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-lg w-full max-w-md p-6">
                <h3 className="text-lg font-bold mb-3">レビューを報告</h3>
                <p className="text-sm text-gray-600 mb-4">このレビューを報告する理由を選択してください</p>
                
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg mb-4"
                >
                  <option value="">理由を選択</option>
                  <option value="inappropriate">不適切なコンテンツ</option>
                  <option value="spam">スパム/広告</option>
                  <option value="fake">偽のレビュー</option>
                  <option value="other">その他</option>
                </select>
                
                <div className="flex space-x-3">
                  <button
                    onClick={() => setReportModalOpen(false)}
                    className="flex-1 py-2 border border-gray-300 rounded-lg"
                  >
                    キャンセル
                  </button>
                  <button
                    onClick={handleReportSubmit}
                    disabled={!reportReason}
                    className="flex-1 py-2 bg-red-600 text-white rounded-lg disabled:bg-gray-400"
                  >
                    報告する
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// 日付をフォーマットする関数
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  
  // 無効な日付の場合はそのまま返す
  if (isNaN(date.getTime())) {
    // 既に "2023年6月" のような形式ならそのまま返す
    if (dateString.includes('年') && dateString.includes('月')) {
      return dateString;
    }
    return "日付不明";
  }
  
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
};

// 体験からの経過時間を計算する関数
const getTimeSinceExperience = (dateString: string): string => {
  const experienceDate = new Date(dateString);
  
  // 無効な日付の場合
  if (isNaN(experienceDate.getTime())) {
    return '';
  }
  
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - experienceDate.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    return '今日体験';
  } else if (diffDays < 7) {
    return `${diffDays}日前に体験`;
  } else if (diffDays < 30) {
    const diffWeeks = Math.floor(diffDays / 7);
    return `${diffWeeks}週間前に体験`;
  } else if (diffDays < 365) {
    const diffMonths = Math.floor(diffDays / 30);
    return `${diffMonths}ヶ月前に体験`;
  } else {
    const diffYears = Math.floor(diffDays / 365);
    return `${diffYears}年前に体験`;
  }
};

export default ReviewCard;