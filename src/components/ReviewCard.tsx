// src/components/ReviewCard.tsx
import React from 'react';
import { Star, User, ThumbsUp } from 'lucide-react';
import { Review } from '../types';

interface ReviewCardProps {
  review: Review;
}

const ReviewCard: React.FC<ReviewCardProps> = ({ review }) => {
  // 「役に立った」ボタンの状態
  const [helpful, setHelpful] = React.useState(false);
  const [helpfulCount, setHelpfulCount] = React.useState(Math.floor(Math.random() * 10));
  
  const toggleHelpful = () => {
    if (helpful) {
      setHelpfulCount(prev => prev - 1);
    } else {
      setHelpfulCount(prev => prev + 1);
    }
    setHelpful(!helpful);
  };

  return (
    <div className="border-b pb-4">
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
            <p className="text-sm text-gray-500">{formatDate(review.date)}</p>
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
          {review.experienceTitle && (
            <div className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full inline-block mb-2">
              体験: {review.experienceTitle}
            </div>
          )}
          <p className="text-sm text-gray-700 mt-1">{review.comment}</p>
          
          {/* 役に立ったボタン */}
          <div className="mt-3 flex items-center">
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
          </div>
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

export default ReviewCard;