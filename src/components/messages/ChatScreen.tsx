// src/components/messages/ChatScreen.tsx
import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Send, X, Search, Paperclip } from 'lucide-react';
import { Message, MessageAttachment, MessageStatus } from '../../types';
import { getMessagesByConversationId, addMessage, markConversationAsRead } from '../../mockData';
import { useAuth } from '../../contexts/AuthContext';
import { webSocketService, ConnectionStatus } from '../../utils/websocketService';
import MessageSearch from './MessageSearch';
import ChatMessage from './ChatMessage';
import AttachmentOptions from './AttachmentOptions';
import TypingIndicator from './TypingIndicator';
import ConnectionStatusIndicator from './ConnectionStatusIndicator';

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
  const [currentAttachment, setCurrentAttachment] = useState<MessageAttachment | null>(null);
  const [showSearch, setShowSearch] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>(ConnectionStatus.DISCONNECTED);
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const typingTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLInputElement>(null);
  
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
      markConversationAsRead(conversationId, user.id || 'user1');
      
      setLoading(false);
    }
  }, [user, conversationId]);
  
  // WebSocketを使用してリアルタイム更新を設定
  useEffect(() => {
    if (user && conversationId && otherParticipantId) {
      // WebSocket接続
      webSocketService.connect(user.id || 'user1', 'dummy-token');
      
      // 接続状態のリスナー
      const removeConnectionListener = webSocketService.addConnectionListener((status) => {
        setConnectionStatus(status);
      });
      
      // タイピング状態のリスナー
      const removeTypingListener = webSocketService.subscribeToTypingEvent(
        conversationId,
        (userId, isTyping) => {
          // 自分以外のユーザーのタイピング状態を更新
          if (userId === otherParticipantId) {
            setOtherUserTyping(isTyping);
          }
        }
      );
      
      // メッセージリスナー
      const removeMessageListener = webSocketService.addMessageListener((newMsg) => {
        // 当該会話のメッセージかチェック
        if (
          (newMsg.senderId === user.id && newMsg.receiverId === otherParticipantId) ||
          (newMsg.senderId === otherParticipantId && newMsg.receiverId === user.id)
        ) {
          setMessages((prev) => [...prev, newMsg]);
          
          // 自分宛てでないメッセージを既読にする
          if (newMsg.senderId !== user.id) {
            markConversationAsRead(conversationId, user.id || 'user1');
          }
        }
      });
      
      return () => {
        removeConnectionListener();
        removeMessageListener();
        removeTypingListener();
        
        // タイピングタイマーのクリーンアップ
        if (typingTimerRef.current) {
          clearTimeout(typingTimerRef.current);
        }
        
        webSocketService.disconnect();
      };
    }
  }, [user, conversationId, otherParticipantId]);

  // メッセージが更新されたら一番下にスクロール
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // 検索結果からメッセージを選択したときの処理
  const handleSearchResultSelect = (messageId: string) => {
    // 指定されたメッセージにスクロール
    const messageElement = document.getElementById(`message-${messageId}`);
    if (messageElement) {
      messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      messageElement.classList.add('highlight-message');
      setTimeout(() => {
        messageElement.classList.remove('highlight-message');
      }, 2000);
    }
    
    // 検索モードを閉じる
    setShowSearch(false);
  };
  
  // 添付ファイルが選択されたときの処理
  const handleAttachmentSelect = (attachment: MessageAttachment) => {
    setCurrentAttachment(attachment);
    setShowAttachmentOptions(false);
    // 入力にフォーカス
    messageInputRef.current?.focus();
  };
  
  // 添付ファイルを削除
  const handleRemoveAttachment = () => {
    setCurrentAttachment(null);
  };
  
  // 入力中のタイピング状態を処理
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setNewMessage(text);
    
    // タイピング状態の送信
    const shouldSendTypingEvent = text.length > 0 && !isTyping;
    const shouldCancelTypingEvent = text.length === 0 && isTyping;
    
    if (shouldSendTypingEvent) {
      setIsTyping(true);
      webSocketService.sendTypingEvent(conversationId, true);
    } else if (shouldCancelTypingEvent) {
      setIsTyping(false);
      webSocketService.sendTypingEvent(conversationId, false);
    }
    
    // タイピング状態のリセット（3秒後に自動的に入力完了とする）
    if (typingTimerRef.current) {
      clearTimeout(typingTimerRef.current);
    }
    
    if (text.length > 0) {
      typingTimerRef.current = setTimeout(() => {
        setIsTyping(false);
        webSocketService.sendTypingEvent(conversationId, false);
      }, 3000);
    }
  };
  
  // メッセージ送信処理
  const handleSendMessage = () => {
    if ((!newMessage.trim() && !currentAttachment) || !user || !otherParticipantId) return;
    
    // タイピング状態をリセット
    if (isTyping) {
      setIsTyping(false);
      webSocketService.sendTypingEvent(conversationId, false);
      
      if (typingTimerRef.current) {
        clearTimeout(typingTimerRef.current);
        typingTimerRef.current = null;
      }
    }
    
    // 実際のアプリではAPIリクエストを送信
    const messageData = {
      senderId: user.id || 'user1',
      receiverId: otherParticipantId,
      content: newMessage,
      attachments: currentAttachment ? [currentAttachment] : undefined,
      conversationId: conversationId
    };
    
    // モック用に一時的なIDを生成
    const tempId = `temp-${Date.now()}`;
    
    // メッセージを仮表示（送信中状態）
    const optimisticMessage: Message = {
      id: tempId,
      senderId: user.id || 'user1',
      receiverId: otherParticipantId,
      content: newMessage,
      timestamp: new Date().toISOString(),
      isRead: false,
      status: MessageStatus.SENDING,
      attachments: currentAttachment ? [currentAttachment] : undefined,
      conversationId: conversationId
    };
    
    // 画面上に仮表示
    setMessages(prev => [...prev, optimisticMessage]);
    
    // リアルタイム通信が可能な場合はWebSocketで送信
    if (connectionStatus === ConnectionStatus.CONNECTED) {
      const sent = webSocketService.sendMessage(messageData);
      if (!sent) {
        // WebSocketで送信できなかった場合は通常の方法で送信
        const sentMessage = addMessage(messageData);
        
        // 仮表示を実際のメッセージに置き換え
        setMessages(prev => prev.map(m => 
          m.id === tempId ? { ...(sentMessage as Message), status: MessageStatus.SENT } : m
        ));
      } else {
        // 送信完了ステータスに更新
        setTimeout(() => {
          setMessages(prev => prev.map(m => 
            m.id === tempId ? { ...m, status: MessageStatus.SENT } : m
          ));
        }, 500); // 送信に要する時間をシミュレート
      }
    } else {
      // オフライン時はモックの送信処理
      setTimeout(() => {
        const sentMessage = addMessage(messageData);
        
        // 仮表示を実際のメッセージに置き換え
        setMessages(prev => prev.map(m => 
          m.id === tempId ? { ...(sentMessage as Message), status: MessageStatus.SENT } : m
        ));
      }, 500); // オフライン送信をシミュレート
    }
    
    // 入力をクリア
    setNewMessage('');
    setCurrentAttachment(null);
    
    // 添付ファイルオプションを閉じる
    setShowAttachmentOptions(false);
  };
  
  // 送信失敗時の再送処理
  const handleRetryMessage = (messageId: string) => {
    const failedMessage = messages.find(m => m.id === messageId);
    if (!failedMessage) return;
    
    // メッセージのステータスを送信中に更新
    setMessages(prev => prev.map(m => 
      m.id === messageId ? { ...m, status: MessageStatus.SENDING } : m
    ));
    
    // 再送信試行
    if (connectionStatus === ConnectionStatus.CONNECTED) {
      const messageData = {
        senderId: failedMessage.senderId,
        receiverId: failedMessage.receiverId,
        content: failedMessage.content,
        attachments: failedMessage.attachments,
        conversationId: failedMessage.conversationId
      };
      
      const sent = webSocketService.sendMessage(messageData);
      if (sent) {
        // 再送信成功
        setTimeout(() => {
          setMessages(prev => prev.map(m => 
            m.id === messageId ? { ...m, status: MessageStatus.SENT } : m
          ));
        }, 500);
      } else {
        // 再送信失敗
        setTimeout(() => {
          setMessages(prev => prev.map(m => 
            m.id === messageId ? { ...m, status: MessageStatus.FAILED } : m
          ));
        }, 500);
      }
    } else {
      // オフラインの場合
      setTimeout(() => {
        setMessages(prev => prev.map(m => 
          m.id === messageId ? { ...m, status: MessageStatus.FAILED } : m
        ));
      }, 500);
    }
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
          {connectionStatus === ConnectionStatus.CONNECTED && (
            <div className="text-xs text-green-600 flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
              オンライン
            </div>
          )}
        </div>
        
        {/* 検索ボタン */}
        <button 
          onClick={() => setShowSearch(!showSearch)}
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-full"
        >
          <Search size={20} />
        </button>
      </div>
      
      {/* 検索バー */}
      {showSearch && (
        <MessageSearch
          conversationId={conversationId}
          onResultSelect={handleSearchResultSelect}
          onClose={() => setShowSearch(false)}
        />
      )}
      
      {/* 接続状態インジケーター */}
      {connectionStatus !== ConnectionStatus.CONNECTED && (
        <div className="px-4 py-2">
          <ConnectionStatusIndicator />
        </div>
      )}
      
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
                  <div id={`message-${message.id}`} key={message.id}>
                    <ChatMessage 
                      message={message} 
                      isOwn={isOwn}
                      onRetry={handleRetryMessage}
                    />
                  </div>
                );
              })}
            </div>
          ))
        )}
        
        {/* タイピングインジケータ */}
        {otherUserTyping && (
          <TypingIndicator 
            isTyping={otherUserTyping} 
            userName={otherParticipantName}
          />
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* 現在の添付ファイルプレビュー */}
      {currentAttachment && (
        <div className="border-t p-2 bg-gray-50">
          <div className="flex items-center justify-between bg-gray-100 p-2 rounded-lg">
            <div className="flex items-center">
              {currentAttachment.type === 'image' && (
                <div className="text-blue-500 mr-2">画像</div>
              )}
              {currentAttachment.type === 'file' && (
                <div className="text-green-500 mr-2">ファイル</div>
              )}
              {currentAttachment.type === 'location' && (
                <div className="text-purple-500 mr-2">位置情報</div>
              )}
              {currentAttachment.type === 'date' && (
                <div className="text-orange-500 mr-2">日程</div>
              )}
              <span className="text-sm truncate">
                {currentAttachment.name || '添付ファイル'}
              </span>
            </div>
            <button
              onClick={handleRemoveAttachment}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}
      
      {/* メッセージ入力エリア */}
      <div className="p-3 border-t">
        {/* 添付ファイルオプション */}
        {showAttachmentOptions && (
          <AttachmentOptions
            onClose={() => setShowAttachmentOptions(false)}
            onAttachmentSelect={handleAttachmentSelect}
          />
        )}
        
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => setShowAttachmentOptions(!showAttachmentOptions)}
            className="p-2 text-gray-500 hover:text-gray-700"
          >
            <Paperclip size={20} />
          </button>
          <div className="flex-1 relative">
            <input
              type="text"
              ref={messageInputRef}
              value={newMessage}
              onChange={handleInputChange}
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
            disabled={!newMessage.trim() && !currentAttachment}
            className={`p-2 rounded-full ${
              !newMessage.trim() && !currentAttachment ? 'text-gray-400' : 'text-black'
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