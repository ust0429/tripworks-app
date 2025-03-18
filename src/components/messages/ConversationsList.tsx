// src/components/messages/ConversationsList.tsx
import React, { useState, useEffect } from 'react';
import { Search, User, ChevronRight } from 'lucide-react';
import { Conversation } from '../../types';
import { mockConversations } from '../../mockData';
import { useAuth } from '../../AuthComponents';

interface ConversationsListProps {
  onSelectConversation: (conversationId: string) => void;
}

const ConversationsList: React.FC<ConversationsListProps> = ({ onSelectConversation }) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // モックデータから会話を取得
  useEffect(() => {
    if (user) {
      // 実際のアプリではAPIリクエストを送信して、ユーザーの会話を取得
      // ここではユーザーIDに関係なくすべての会話を表示
      setConversations(mockConversations);
    }
  }, [user]);
  
  // 検索機能
  const filteredConversations = conversations.filter(conversation => {
    // 実際のアプリではAPIからユーザー名で検索結果を取得
    // ここではモックデータのため、実装は簡略化
    return true;
  });
  
  // 会話をクリックした時の処理
  const handleConversationClick = (conversationId: string) => {
    onSelectConversation(conversationId);
  };
  
  // 会話の日時を表示用にフォーマット
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    
    // 今日の日付かチェック
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      // 今日なら時間を表示
      return date.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
    } else {
      // 今日以外は日付を表示
      return date.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' });
    }
  };
  
  return (
    <div className="h-full flex flex-col bg-white">
      <div className="p-4 border-b">
        <h1 className="text-xl font-bold mb-3">メッセージ</h1>
        
        {/* 検索バー */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={16} className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="名前で検索"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-100 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-gray-500"
          />
        </div>
      </div>
      
      {/* 会話リスト */}
      <div className="flex-1 overflow-auto">
        {filteredConversations.length > 0 ? (
          <div className="divide-y">
            {filteredConversations.map((conversation) => {
              // 会話の相手を特定（ユーザー自身以外の参加者）
              const otherParticipantId = conversation.participantIds.find(id => id !== user?.id) || '';
              // 実際のアプリではAPIからユーザー情報を取得
              const otherParticipantName = otherParticipantId.startsWith('attender') 
                ? `アテンダー ${otherParticipantId.replace('attender', '')}` 
                : `ユーザー ${otherParticipantId.replace('user', '')}`;
              
              return (
                <div
                  key={conversation.id}
                  onClick={() => handleConversationClick(conversation.id)}
                  className={`p-4 flex items-center space-x-3 hover:bg-gray-50 cursor-pointer
                    ${conversation.unreadCount > 0 ? 'bg-gray-50' : ''}`}
                >
                  <div className="relative flex-shrink-0">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                      <User size={24} className="text-gray-400" />
                    </div>
                    {conversation.unreadCount > 0 && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">{conversation.unreadCount}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between">
                      <h3 className="font-medium truncate">{otherParticipantName}</h3>
                      <p className="text-xs text-gray-500">{conversation.lastMessage ? formatTime(conversation.lastMessage.timestamp) : ''}</p>
                    </div>
                    <p className={`text-sm truncate mt-1 ${conversation.unreadCount > 0 ? 'font-medium text-black' : 'text-gray-500'}`}>
                      {conversation.lastMessage?.content || '新しい会話'}
                    </p>
                  </div>
                  
                  <ChevronRight size={16} className="text-gray-400" />
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-4 text-center text-gray-500">
            <p>メッセージはありません</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversationsList;