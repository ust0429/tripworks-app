import React, { useState } from 'react';
import { MessageSquare, ThumbsUp, ThumbsDown, X, Send } from 'lucide-react';

interface FeedbackCollectorProps {
  contextName: string;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  onSubmit?: (data: {
    rating: 'positive' | 'negative' | null;
    comment: string;
    context: string;
    metadata?: Record<string, any>;
  }) => void;
  metadata?: Record<string, any>;
}

/**
 * フィードバック収集コンポーネント
 * 
 * ユーザーからの評価とコメントを収集するフローティングUI
 */
const FeedbackCollector: React.FC<FeedbackCollectorProps> = ({
  contextName,
  position = 'bottom-right',
  onSubmit,
  metadata = {}
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [rating, setRating] = useState<'positive' | 'negative' | null>(null);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);
  
  // ポジションに基づくスタイル
  const positionStyles = {
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4'
  };
  
  // フィードバックを開く
  const handleOpen = () => {
    setIsOpen(true);
  };
  
  // フィードバックを閉じる
  const handleClose = () => {
    setIsOpen(false);
    // 一定時間後に状態をリセット
    setTimeout(() => {
      setIsExpanded(false);
      setRating(null);
      setComment('');
      setSubmitted(false);
    }, 300);
  };
  
  // 評価を設定
  const handleSetRating = (newRating: 'positive' | 'negative') => {
    setRating(newRating);
    setIsExpanded(true);
  };
  
  // フィードバックを送信
  const handleSubmit = () => {
    if (onSubmit) {
      onSubmit({
        rating,
        comment,
        context: contextName,
        metadata
      });
    }
    
    // 送信成功表示
    setSubmitted(true);
    
    // 分析イベントがあれば送信（実装があれば）
    try {
      const analyticsAny = window as any;
      if (analyticsAny.analytics) {
        analyticsAny.analytics.track('Feedback_Submitted', {
          context: contextName,
          rating,
          hasComment: comment.length > 0
        });
      }
    } catch (analyticsError) {
      console.warn('分析イベント送信エラー:', analyticsError);
    }
    
    // 3秒後に閉じる
    setTimeout(() => {
      handleClose();
    }, 3000);
  };
  
  // フィードバックボタン
  if (!isOpen) {
    return (
      <button
        onClick={handleOpen}
        className={`fixed ${positionStyles[position]} p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all z-40`}
        aria-label="フィードバックを送る"
      >
        <MessageSquare size={20} />
      </button>
    );
  }
  
  return (
    <div className={`fixed ${positionStyles[position]} z-40`}>
      <div className="bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden w-72">
        {/* ヘッダー */}
        <div className="bg-blue-600 text-white p-3 flex justify-between items-center">
          <h3 className="text-sm font-medium">このページについてのフィードバック</h3>
          <button
            onClick={handleClose}
            className="text-white hover:text-blue-100"
            aria-label="閉じる"
          >
            <X size={18} />
          </button>
        </div>
        
        {/* コンテンツ */}
        <div className="p-4">
          {!submitted ? (
            <>
              {!isExpanded ? (
                <>
                  <p className="text-sm text-gray-600 mb-4">
                    このフォームの使いやすさはいかがでしたか？
                  </p>
                  <div className="flex justify-center space-x-6">
                    <button
                      onClick={() => handleSetRating('positive')}
                      className="flex flex-col items-center px-4 py-2 rounded-md hover:bg-blue-50"
                      aria-label="良い評価"
                    >
                      <ThumbsUp className="w-6 h-6 text-blue-500 mb-1" />
                      <span className="text-sm">良い</span>
                    </button>
                    <button
                      onClick={() => handleSetRating('negative')}
                      className="flex flex-col items-center px-4 py-2 rounded-md hover:bg-blue-50"
                      aria-label="改善が必要"
                    >
                      <ThumbsDown className="w-6 h-6 text-red-500 mb-1" />
                      <span className="text-sm">改善が必要</span>
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center mb-3">
                    <span className="text-sm text-gray-600 mr-2">評価:</span>
                    {rating === 'positive' ? (
                      <span className="flex items-center text-blue-600">
                        <ThumbsUp className="w-4 h-4 mr-1" /> 良い
                      </span>
                    ) : (
                      <span className="flex items-center text-red-600">
                        <ThumbsDown className="w-4 h-4 mr-1" /> 改善が必要
                      </span>
                    )}
                  </div>
                  <div className="mb-3">
                    <label htmlFor="feedback-comment" className="block text-sm text-gray-600 mb-1">
                      詳細なフィードバック (任意):
                    </label>
                    <textarea
                      id="feedback-comment"
                      className="w-full border border-gray-300 rounded-md p-2 text-sm"
                      rows={3}
                      placeholder="ご意見やご提案を入力してください"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                    />
                  </div>
                  <div className="flex justify-end">
                    <button
                      onClick={handleSubmit}
                      className="flex items-center bg-blue-600 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-700"
                    >
                      <Send size={14} className="mr-1" />
                      送信
                    </button>
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="py-2 text-center">
              <p className="text-green-600 font-medium mb-1">フィードバックありがとうございます！</p>
              <p className="text-sm text-gray-600">
                いただいたご意見はサービス改善に活用させていただきます。
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FeedbackCollector;