// src/components/messages/ChatMessage.tsx
import React from 'react';
import { Message } from '../../types';
import AttachmentPreview from './AttachmentPreview';

interface ChatMessageProps {
  message: Message;
  isOwn: boolean;
  showTime?: boolean;
}

/**
 * チャットメッセージを表示するコンポーネント
 */
const ChatMessage: React.FC<ChatMessageProps> = ({ 
  message, 
  isOwn, 
  showTime = true 
}) => {
  // メッセージの時間をフォーマット
  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
  };
  
  // 従来の添付ファイル形式を新しい形式に変換（後方互換性のため）
  const legacyAttachments = message.attachmentUrl && message.attachmentType
    ? [{
        id: `legacy-${message.id}`,
        type: message.attachmentType,
        url: message.attachmentUrl
      }]
    : [];
    
  // 全ての添付ファイル（新形式と旧形式を結合）
  const allAttachments = [
    ...(message.attachments || []),
    ...legacyAttachments
  ];
  
  return (
    <div className={`mb-4 flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[75%] ${isOwn ? 'order-2' : 'order-1'}`}>
        <div
          className={`p-3 rounded-2xl ${
            isOwn
              ? 'bg-black text-white rounded-tr-none'
              : 'bg-white border border-gray-200 rounded-tl-none'
          }`}
        >
          {/* メッセージ本文 */}
          {message.content && <p className="text-sm">{message.content}</p>}
          
          {/* 添付ファイル */}
          {allAttachments.map((attachment) => (
            <AttachmentPreview 
              key={attachment.id}
              attachment={attachment}
              isOwn={isOwn}
            />
          ))}
        </div>
        
        {/* 時間表示 */}
        {showTime && (
          <div className={`mt-1 text-xs text-gray-500 ${isOwn ? 'text-right' : 'text-left'}`}>
            {formatMessageTime(message.timestamp)}
            {isOwn && (
              <span className="ml-1">
                {message.isRead ? '既読' : '送信済み'}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;