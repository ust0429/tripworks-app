// src/components/messages/ConversationsList.tsx
import React, { useState, useEffect } from 'react';
import { Search, User, ChevronRight, Archive, ChevronDown } from 'lucide-react';
import { Conversation } from '../../types';
import { 
  getActiveConversations, 
  getArchivedConversations, 
  archiveConversation, 
  unarchiveConversation,
  muteConversation,
  unmuteConversation,
  deleteConversation 
} from '../../mockData';
import { useAuth } from '../../contexts/AuthContext';
import ConversationMenu from './ConversationMenu';

interface ConversationsListProps {
  onSelectConversation: (conversationId: string) => void;
}

const ConversationsList: React.FC<ConversationsListProps> = ({ onSelectConversation }) => {
  const { user } = useAuth();
  const [activeConversations, setActiveConversations] = useState<Conversation[]>([]);
  const [archivedConversations, setArchivedConversations] = useState<Conversation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  
  // モックデータから会話を取得
  useEffect(() => {
    if (user) {
      // 実際のアプリではAPIリクエストを送信して、ユーザーの会話を取得
      loadConversations();
    }
  }, [user]);
  
  // 会話一覧を読み込む
  const loadConversations = () => {
    setActiveConversations(getActiveConversations(user?.id || ''));
    setArchivedConversations(getArchivedConversations(user?.id || ''));
  };
  
  // 検索機能
  const filteredActiveConversations = activeConversations.filter(conversation => {
    if (!searchQuery) return true;
    // 実際のアプリではAPIからユーザー名で検索結果を取得
    // ここではモックデータのため、実装は簡略化 - 最終メッセージの内容で検索
    return conversation.lastMessage?.content.toLowerCase().includes(searchQuery.toLowerCase()) || false;
  });
  
  const filteredArchivedConversations = archivedConversations.filter(conversation => {
    if (!searchQuery) return true;
    return conversation.lastMessage?.content.toLowerCase().includes(searchQuery.toLowerCase()) || false;
  });
  
  // 会話をクリックした時の処理
  const handleConversationClick = (conversationId: string) => {
    onSelectConversation(conversationId);
  };
  
  // 会話をアーカイブする
  const handleArchive = (conversationId: string) => {
    archiveConversation(conversationId);
    loadConversations(); // 一覧を再読み込み
  };
  
  // アーカイブを解除する
  const handleUnarchive = (conversationId: string) => {
    unarchiveConversation(conversationId);
    loadConversations(); // 一覧を再読み込み
  };
  
  // 会話をミュートする
  const handleMute = (conversationId: string) => {
    muteConversation(conversationId);
    loadConversations();
  };
  
  // ミュートを解除する
  const handleUnmute = (conversationId: string) => {
    unmuteConversation(conversationId);
    loadConversations();
  };
  
  // 会話を削除する
  const handleDelete = (conversationId: string) => {
    deleteConversation(conversationId);
    loadConversations();
  };
  
  // 問題を報告する
  const handleReport = (conversationId: string) => {
    // 実際のアプリではAPIリクエストを送信
    alert('問題が報告されました');
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

  // 会話項目を描画する関数
  const renderConversationItem = (conversation: Conversation) => {
    // 会話の相手を特定（ユーザー自身以外の参加者）
    const otherParticipantId = conversation.participantIds.find(id => id !== user?.id) || '';
    // 実際のアプリではAPIからユーザー情報を取得
    const otherParticipantName = otherParticipantId.startsWith('attender') 
      ? `アテンダー ${otherParticipantId.replace('attender', '')}` 
      : `ユーザー ${otherParticipantId.replace('user', '')}`;
    
    return (
      <div
        key={conversation.id}
        className="relative flex p-4 hover:bg-gray-50 cursor-pointer"
      >
        {/* クリック可能なメインエリア */}
        <div 
          className="flex flex-1 items-center space-x-3"
          onClick={() => handleConversationClick(conversation.id)}
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
          
          <div className="flex-1 min-w-0 pr-2">
            <div className="flex justify-between">
              <h3 className="font-medium truncate">{otherParticipantName}</h3>
              <p className="text-xs text-gray-500">{conversation.lastMessage ? formatTime(conversation.lastMessage.timestamp) : ''}</p>
            </div>
            <div className="flex items-center">
              {conversation.isMuted && (
                <span className="mr-1 text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 5L6 9H2v6h4l5 4V5z"></path>
                    <line x1="23" y1="9" x2="17" y2="15"></line>
                    <line x1="17" y1="9" x2="23" y2="15"></line>
                  </svg>
                </span>
              )}
              <p className={`text-sm truncate ${conversation.unreadCount > 0 ? 'font-medium text-black' : 'text-gray-500'}`}>
                {conversation.lastMessage?.content || '新しい会話'}
              </p>
            </div>
          </div>
        </div>
        
        {/* 会話メニュー */}
        <div className="flex-shrink-0 self-center ml-2" onClick={(e) => e.stopPropagation()}>
          <ConversationMenu 
            conversationId={conversation.id}
            isArchived={conversation.isArchived}
            isMuted={conversation.isMuted}
            onArchive={handleArchive}
            onUnarchive={handleUnarchive}
            onMute={handleMute}
            onUnmute={handleUnmute}
            onDelete={handleDelete}
            onReport={handleReport}
          />
        </div>
      </div>
    );
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
            placeholder="会話を検索"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-100 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-gray-500"
          />
        </div>
      </div>
      
      {/* アーカイブ表示切り替え */}
      {(activeConversations.length > 0 || archivedConversations.length > 0) && (
        <div className="mt-2 px-4 py-2 flex items-center justify-between text-sm">
          <span className="font-medium">
            {showArchived ? 'アーカイブ済み' : '会話'}
          </span>
          <button
            onClick={() => setShowArchived(!showArchived)}
            className="text-gray-600 flex items-center"
          >
            {showArchived ? '通常の会話を表示' : 'アーカイブを表示'}
            <ChevronDown
              size={16}
              className={`ml-1 transform ${showArchived ? 'rotate-180' : ''}`}
            />
          </button>
        </div>
      )}
      
      {/* 会話リスト */}
      <div className="flex-1 overflow-auto">
        {showArchived ? (
          // アーカイブ済みの会話リスト
          filteredArchivedConversations.length > 0 ? (
            <div className="divide-y">
              {filteredArchivedConversations.map((conversation) => renderConversationItem(conversation))}
            </div>
          ) : (
            <div className="p-4 text-center text-gray-500">
              <p>アーカイブされた会話はありません</p>
            </div>
          )
        ) : (
          // 通常の会話リスト
          filteredActiveConversations.length > 0 ? (
            <div className="divide-y">
              {filteredActiveConversations.map((conversation) => renderConversationItem(conversation))}
            </div>
          ) : (
            <div className="p-4 text-center text-gray-500">
              <p>メッセージはありません</p>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default ConversationsList;