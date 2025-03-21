import React, { useState } from 'react';

interface ReviewReplyFormProps {
  reviewId: string;
  onSubmit: ((reviewId: string, text: string) => Promise<boolean>) | ((reviewId: string, content: string) => void);
  onCancel: () => void;
  isSubmitting: boolean;
}

const ReviewReplyForm: React.FC<ReviewReplyFormProps> = ({
  reviewId,
  onSubmit,
  onCancel,
  isSubmitting
}) => {
  const [replyText, setReplyText] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!replyText.trim()) {
      setError('返信内容を入力してください');
      return;
    }
    
    try {
      const success = await onSubmit(reviewId, replyText);
      
      if (!success) {
        setError('返信の送信に失敗しました。もう一度お試しください。');
      }
    } catch (err) {
      setError('エラーが発生しました。もう一度お試しください。');
      console.error('Reply submission error:', err);
    }
  };

  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200">
      <h4 className="text-md font-medium mb-3">レビューに返信する</h4>
      
      {error && (
        <div className="mb-3 p-2 text-sm text-red-700 bg-red-100 rounded">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label
            htmlFor="reply-text"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            返信内容
          </label>
          <textarea
            id="reply-text"
            rows={4}
            className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
            placeholder="ゲストのレビューに返信してください..."
            value={replyText}
            onChange={(e) => {
              setReplyText(e.target.value);
              setError(null);
            }}
            disabled={isSubmitting}
          />
          <p className="text-xs text-gray-500 mt-1">
            {replyText.length}/500文字
          </p>
        </div>
        
        <div className="flex justify-end space-x-2">
          <button
            type="button"
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            キャンセル
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300"
            disabled={isSubmitting || !replyText.trim()}
          >
            {isSubmitting ? '送信中...' : '送信する'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReviewReplyForm;
