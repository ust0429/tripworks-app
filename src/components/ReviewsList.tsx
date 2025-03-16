// src/components/ReviewsList.tsx
import React from 'react';
import { Star } from 'lucide-react';
import ReviewCard from './ReviewCard';
import { Review } from '../types';

interface ReviewsListProps {
  reviews: Review[];
  averageRating: number;
  reviewCount: number;
}

const ReviewsList: React.FC<ReviewsListProps> = ({ 
  reviews, 
  averageRating, 
  reviewCount 
}) => {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold">レビュー</h2>
        <div className="flex items-center">
          <Star size={18} className="text-yellow-500 mr-1" />
          <span className="font-bold">{averageRating.toFixed(1)}</span>
          <span className="text-gray-500 ml-1">({reviewCount})</span>
        </div>
      </div>
      
      {reviews.length > 0 ? (
        <div className="space-y-6">
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-center py-4">
          まだレビューがありません
        </p>
      )}
    </div>
  );
};

export default ReviewsList;