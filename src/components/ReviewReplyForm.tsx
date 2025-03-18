// src/components/ReviewReplyForm.tsx
import React, { useState } from 'react';
import { Send, X } from 'lucide-react';

interface ReviewReplyFormProps {
  reviewId: string;
  onSubmit: (reviewId: string, content: string) => void;
  onCancel?: () => void;
  placeholder?: string;
  submitButtonText?: string;
  isSubmitting?: boolean;
}

const ReviewReplyForm: React.FC<ReviewReplyFormProps> = ({ 
  reviewId,
  onSubmit,
  onCancel,
  placeholder = 'レビューに返信する...',
  submitButtonText = '返信する',
  isSubmitting = false
}) => {
  const [content, setContent] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (content.trim()) {
      onSubmit(reviewId, content);
      setContent('');
    }
  };
  
  return (
    <div className="pl-6 border-l border-gray-200 ml-6 mt-2 mb-3">
      <form onSubmit={handleSubmit} className="flex flex-col">
        <div className="flex-1">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            placeholder={placeholder}
            rows={2}
            disabled={isSubmitting}
          ></textarea>
        </div>
        <div className="flex justify-end space-x-2 mt-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-3 py-1.5 text-xs border border-gray-300 rounded-lg flex items-center"
              disabled={isSubmitting}
            >
              <X size={12} className="mr-1" />
              キャンセル
            </button>
          )}
          <button
            type="submit"
            className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded-lg flex items-center disabled:bg-gray-400"
            disabled={!content.trim() || isSubmitting}
          >
            <Send size={12} className="mr-1" />
            {isSubmitting ? '送信中...' : submitButtonText}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReviewReplyForm;