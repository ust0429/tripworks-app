// src/components/messages/TypingIndicator.tsx
import React from 'react';

interface TypingIndicatorProps {
  isTyping: boolean;
  userName?: string;
}

/**
 * 相手がタイピング中であることを表示するインジケータ
 */
const TypingIndicator: React.FC<TypingIndicatorProps> = ({ isTyping, userName }) => {
  if (!isTyping) {
    return null;
  }

  return (
    <div className="flex items-center text-gray-500 p-2">
      <div className="flex space-x-1 mr-2">
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
      </div>
      <span className="text-sm">
        {userName ? `${userName}が入力中...` : '入力中...'}
      </span>
    </div>
  );
};

export default TypingIndicator;
