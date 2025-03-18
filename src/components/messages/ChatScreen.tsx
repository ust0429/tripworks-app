// src/components/messages/ChatScreen.tsx
import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Send, Image, Map, Paperclip, ChevronDown, X, Calendar } from 'lucide-react';
import { Message } from '../../types';
import { getMessagesByConversationId, addMessage, markConversationAsRead } from '../../mockData';
import { useAuth } from '../../AuthComponents';

interface ChatScreenProps {
  conversationId: string;
  onBack: () => void;
}

const ChatScreen: React.FC<ChatScreenProps> = ({ conversationId, onBack }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [otherParticipantId, setOtherParticipantId] = useState('');
  const [otherParticipantName, setOtherParticipantName] = useState('');
  const [showAttachmentOptions, setShowAttachmentOptions] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // モックデータからメッセージを取得
  useEffect(() => {
    if (user && conversationId) {
      // 実際のアプリではAPIリクエストを送信
      const fetchedMessages = getMessagesByConversationId(conversationId);
      setMessages(fetchedMessages);
      
      // 会話の相手を特定
      if (fetchedMessages.length > 0) {
        const firstMessage = fetchedMessages[0];
        const otherId = firstMessage.senderId === user.id ? firstMessage.receiverId : firstMessage.senderId;
        setOtherParticipantId(otherId);
        
        // 実際のアプリではAPIから相手の情報を取得
        const otherName = otherId.startsWith('attender') 
          ? `アテンダー ${otherId.replace('attender', '')}` 
          : `ユーザー ${otherId.replace('user', '')}`;
        setOtherParticipantName(otherName);
      }
      
      // メッセージを既読にする
      markConversationAsRead(conversationId, user.id);
      
      setLoading(false);
    }
  }, [user, conversationId]);
  
  // メッセージが更新されたら一番下にスクロール
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // メッセージ送信処理
  const handleSendMessage = () => {
    if (newMessage.trim() === '' || !user || !otherParticipantId) return;
    
    // 実際のアプリではAPIリクエストを送信
    const messageData = {
      senderId: user.id,
      receiverId: otherParticipantId,
      content: newMessage
    };
    
    const sentMessage = addMessage(messageData);
    
    // UIを更新
    setMessages(prev => [...prev, sentMessage]);
    setNewMessage('');
    
    // 添付ファイルオプションを閉じる
    setShowAttachmentOptions(false);
  };
  
  // メッセージの日時をフォーマット
  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
  };
  
  // メッセージをグループ化して日付ごとにセパレータを表示
  const groupedMessages = messages.reduce((groups: { [key: string]: Message[] }, message) => {
    const date = new Date(message.timestamp);
    const dateStr = date.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' });
    
    if (!groups[dateStr]) {
      groups[dateStr] = [];
    }
    
    groups[dateStr].push(message);
    return groups;
  }, {});
  
  return (
    <div className="h-full flex flex-col bg-white">
      {/* ヘッダー */}
      <div className="p-4 border-b flex items-center space-x-3">
        <button onClick={onBack} className="p-1">
          <ArrowLeft size={20} className="text-gray-600" />
        </button>
        <div className="flex-1">
          <h2 className="font-bold">{otherParticipantName}</h2>
        </div>
      </div>
      
      {/* メッセージエリア */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <p className="text-gray-500">読み込み中...</p>
          </div>
        ) : (
          Object.entries(groupedMessages).map(([dateStr, dayMessages]) => (
            <div key={dateStr}>
              {/* 日付セパレータ */}
              <div className="flex justify-center my-4">
                <div className="bg-gray-200 rounded-full px-3 py-1">
                  <span className="text-xs text-gray-600">{dateStr}</span>
                </div>
              </div>
              
              {/* その日のメッセージ */}
              {dayMessages.map((message) => {
                const isOwn = message.senderId === user?.id;
                
                return (
                  <div
                    key={message.id}
                    className={`mb-4 flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[75%] ${isOwn ? 'order-2' : 'order-1'}`}>
                      <div
                        className={`p-3 rounded-2xl ${
                          isOwn
                            ? 'bg-black text-white rounded-tr-none'
                            : 'bg-white border border-gray-200 rounded-tl-none'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        
                        {/* 添付ファイルがある場合 */}
                        {message.attachmentUrl && message.attachmentType === 'image' && (
                          <div className="mt-2 rounded-lg overflow-hidden">
                            <div className="bg-gray-200 h-32 flex items-center justify-center">
                              <Image size={24} className="text-gray-400" />
                            </div>
                          </div>
                        )}
                        
                        {message.attachmentUrl && message.attachmentType === 'location' && (
                          <div className="mt-2 rounded-lg overflow-hidden">
                            <div className="bg-gray-200 h-32 flex items-center justify-center">
                              <Map size={24} className="text-gray-400" />
                            </div>
                          </div>
                        )}
                      </div>
                      <div className={`mt-1 text-xs text-gray-500 ${isOwn ? 'text-right' : 'text-left'}`}>
                        {formatMessageTime(message.timestamp)}
                        {isOwn && (
                          <span className="ml-1">
                            {message.isRead ? '既読' : '送信済み'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* メッセージ入力エリア */}
      <div className="p-3 border-t">
        {/* 添付ファイルオプション */}
        {showAttachmentOptions && (
          <div className="bg-white rounded-lg shadow-lg p-3 mb-3 border">
            <div className="flex justify-between mb-2">
              <h3 className="font-medium text-sm">添付するファイル</h3>
              <button 
                onClick={() => setShowAttachmentOptions(false)}
                className="text-gray-500"
              >
                <X size={16} />
              </button>
            </div>
            <div className="grid grid-cols-4 gap-2">
              <button className="flex flex-col items-center justify-center p-2 hover:bg-gray-100 rounded-lg">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mb-1">
                  <Image size={20} className="text-blue-600" />
                </div>
                <span className="text-xs">画像</span>
              </button>
              <button className="flex flex-col items-center justify-center p-2 hover:bg-gray-100 rounded-lg">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mb-1">
                  <Map size={20} className="text-green-600" />
                </div>
                <span className="text-xs">位置情報</span>
              </button>
              <button className="flex flex-col items-center justify-center p-2 hover:bg-gray-100 rounded-lg">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mb-1">
                  <Calendar size={20} className="text-purple-600" />
                </div>
                <span className="text-xs">日程</span>
              </button>
              <button className="flex flex-col items-center justify-center p-2 hover:bg-gray-100 rounded-lg">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mb-1">
                  <Paperclip size={20} className="text-gray-600" />
                </div>
                <span className="text-xs">ファイル</span>
              </button>
            </div>
          </div>
        )}
        
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => setShowAttachmentOptions(!showAttachmentOptions)}
            className="p-2 text-gray-500 hover:text-gray-700"
          >
            {showAttachmentOptions ? (
              <ChevronDown size={20} />
            ) : (
              <Paperclip size={20} />
            )}
          </button>
          <div className="flex-1 relative">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="メッセージを入力..."
              className="w-full py-2 px-4 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-gray-500"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSendMessage();
                }
              }}
            />
          </div>
          <button
            onClick={handleSendMessage}
            disabled={newMessage.trim() === ''}
            className={`p-2 rounded-full ${
              newMessage.trim() === '' ? 'text-gray-400' : 'text-black'
            }`}
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatScreen;