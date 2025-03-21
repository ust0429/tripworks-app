import React, { useState } from 'react';
import { Review } from '../../../types/review';
import ReviewReplyForm from '../../ReviewReplyForm';

interface ReviewsTableProps {
  reviews: Review[];
  sortField: 'date' | 'rating' | 'experience';
  sortOrder: 'asc' | 'desc';
  onSortChange: (field: 'date' | 'rating' | 'experience') => void;
  onReplySubmit: (reviewId: string, replyText: string) => Promise<boolean>;
}

const ReviewsTable: React.FC<ReviewsTableProps> = ({
  reviews,
  sortField,
  sortOrder,
  onSortChange,
  onReplySubmit
}) => {
  const [expandedReviewId, setExpandedReviewId] = useState<string | null>(null);
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replying, setReplying] = useState(false);

  // ソートアイコンの表示
  const getSortIcon = (field: 'date' | 'rating' | 'experience') => {
    if (field !== sortField) return null;
    
    return sortOrder === 'asc' ? (
      <span className="ml-1">↑</span>
    ) : (
      <span className="ml-1">↓</span>
    );
  };

  // レビュー詳細の展開/折りたたみ
  const toggleReviewExpand = (reviewId: string) => {
    setExpandedReviewId(expandedReviewId === reviewId ? null : reviewId);
    setReplyingToId(null);
  };

  // 返信フォームの表示/非表示
  const toggleReplyForm = (reviewId: string) => {
    setReplyingToId(replyingToId === reviewId ? null : reviewId);
  };

  // 返信の送信
  const handleReplySubmit = async (reviewId: string, replyText: string) => {
    setReplying(true);
    
    try {
      const success = await onReplySubmit(reviewId, replyText);
      
      if (success) {
        setReplyingToId(null);
      }
      
      return success;
    } finally {
      setReplying(false);
    }
  };

  // 日付のフォーマット
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (reviews.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        レビューがありません
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              onClick={() => onSortChange('date')}
            >
              日付{getSortIcon('date')}
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              onClick={() => onSortChange('rating')}
            >
              評価{getSortIcon('rating')}
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              onClick={() => onSortChange('experience')}
            >
              体験{getSortIcon('experience')}
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              ユーザー
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              状態
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              アクション
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {reviews.map((review) => (
            <React.Fragment key={review.id}>
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(review.createdAt)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-900 mr-2">
                      {review.rating.toFixed(1)}
                    </span>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg
                          key={star}
                          className={`w-4 h-4 ${
                            star <= Math.round(review.rating)
                              ? 'text-yellow-400'
                              : 'text-gray-300'
                          }`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 15.585l-5.196 3.09 1.25-6.148L1.5 8.363l6.292-.769L10 2l2.208 5.594 6.292.769-4.554 4.164 1.25 6.148L10 15.585z"
                            clipRule="evenodd"
                          />
                        </svg>
                      ))}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {review.experienceTitle}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {review.userName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {review.attenderReply ? (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      返信済
                    </span>
                  ) : (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                      未返信
                    </span>
                  )}
                  {review.photos && review.photos.length > 0 && (
                    <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      写真あり
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    type="button"
                    onClick={() => toggleReviewExpand(review.id)}
                    className="text-indigo-600 hover:text-indigo-900 mr-3"
                  >
                    {expandedReviewId === review.id ? '閉じる' : '詳細'}
                  </button>
                  {!review.attenderReply && (
                    <button
                      type="button"
                      onClick={() => toggleReplyForm(review.id)}
                      className="text-green-600 hover:text-green-900"
                    >
                      返信
                    </button>
                  )}
                </td>
              </tr>
              
              {/* 詳細表示部分 */}
              {expandedReviewId === review.id && (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-sm text-gray-500 bg-gray-50">
                    <div className="mb-4">
                      <p className="font-medium mb-2">レビュー本文:</p>
                      <p className="whitespace-pre-line">{review.text}</p>
                    </div>
                    
                    {review.photos && review.photos.length > 0 && (
                      <div className="mb-4">
                        <p className="font-medium mb-2">写真:</p>
                        <div className="flex flex-wrap gap-2">
                          {review.photos.map((photo, idx) => (
                            <div
                              key={idx}
                              className="w-24 h-24 rounded overflow-hidden bg-gray-100"
                            >
                              <img
                                src={photo.url}
                                alt={`レビュー写真 ${idx + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {review.attenderReply && (
                      <div>
                        <p className="font-medium mb-2">あなたの返信:</p>
                        <div className="bg-blue-50 p-3 rounded">
                          <p className="whitespace-pre-line">
                            {review.attenderReply.text}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {formatDate(review.attenderReply.createdAt)}
                          </p>
                        </div>
                      </div>
                    )}
                  </td>
                </tr>
              )}
              
              {/* 返信フォーム */}
              {replyingToId === review.id && (
                <tr>
                  <td colSpan={6} className="px-6 py-4 bg-gray-50">
                    <ReviewReplyForm
                      reviewId={review.id}
                      onSubmit={handleReplySubmit}
                      onCancel={() => setReplyingToId(null)}
                      isSubmitting={replying}
                    />
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ReviewsTable;
