// src/components/messages/MessagesScreen.tsx
import React, { useState } from 'react';
import ConversationsList from './ConversationsList';
import ChatScreen from './ChatScreen';
import { useAuth } from '../../AuthComponents';

interface MessagesScreenProps {
  initialConversationId?: string;
}

const MessagesScreen: React.FC<MessagesScreenProps> = ({ initialConversationId }) => {
  const { isAuthenticated, openLoginModal } = useAuth();
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(
    initialConversationId || null
  );
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);
  
  // リサイズイベントのハンドラー
  React.useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // 未認証の場合はログインを促す
  if (!isAuthenticated) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-4">
        <div className="bg-gray-100 rounded-full p-6 mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-gray-400"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold mb-2">メッセージを見る</h2>
        <p className="text-gray-600 text-center mb-6">
          アテンダーとのメッセージを表示するにはログインしてください。
        </p>
        <button
          onClick={openLoginModal}
          className="bg-black text-white px-6 py-2 rounded-lg font-medium"
        >
          ログイン
        </button>
      </div>
    );
  }
  
  // モバイルビューの場合は会話リストまたはチャット画面のどちらかを表示
  if (isMobileView) {
    if (selectedConversationId) {
      return (
        <ChatScreen
          conversationId={selectedConversationId}
          onBack={() => setSelectedConversationId(null)}
        />
      );
    } else {
      return (
        <ConversationsList
          onSelectConversation={(id) => setSelectedConversationId(id)}
        />
      );
    }
  }
  
  // デスクトップビューの場合は分割レイアウト
  return (
    <div className="h-full flex bg-white">
      {/* サイドバー：会話リスト */}
      <div className="w-1/3 border-r">
        <ConversationsList
          onSelectConversation={(id) => setSelectedConversationId(id)}
        />
      </div>
      
      {/* メインエリア：チャット画面 */}
      <div className="w-2/3">
        {selectedConversationId ? (
          <ChatScreen
            conversationId={selectedConversationId}
            onBack={() => setSelectedConversationId(null)}
          />
        ) : (
          <div className="h-full flex flex-col items-center justify-center p-4 bg-gray-50">
            <div className="bg-gray-200 rounded-full p-6 mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-gray-400"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold mb-2">メッセージを選択</h2>
            <p className="text-gray-600 text-center">
              左側のリストから会話を選択してメッセージを表示します。
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagesScreen;