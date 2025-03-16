// src/components/ReviewCard.tsx
import React from 'react';
import { Star, User } from 'lucide-react';
import { Review } from '../types';

interface ReviewCardProps {
  review: Review;
}

const ReviewCard: React.FC<ReviewCardProps> = ({ review }) => {
  return (
    <div className="border-b pb-4">
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
            <p className="text-xs text-gray-600 mb-1">
              体験: {review.experienceTitle}
            </p>
          )}
          <p className="text-sm text-gray-700">{review.comment}</p>
        </div>
      </div>
    </div>
  );
};

// 日付をフォーマットする関数
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
};

export default ReviewCard;