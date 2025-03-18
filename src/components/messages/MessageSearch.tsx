// src/components/messages/MessageSearch.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Search, X } from 'lucide-react';
import { Message } from '../../types';
import { getMessagesByConversationId } from '../../mockData';

// 検索結果の最大表示数
const MAX_SEARCH_RESULTS = 5;

interface MessageSearchProps {
  conversationId: string;
  onResultSelect: (messageId: string) => void;
  onClose: () => void;
}

/**
 * メッセージ検索コンポーネント
 */
const MessageSearch: React.FC<MessageSearchProps> = ({ 
  conversationId, 
  onResultSelect,
  onClose
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<Message[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  // 検索処理（デバウンス処理を入れる）
  const handleSearch = useCallback(
    debounce(async (term: string) => {
      if (!term || term.length < 2) {
        setResults([]);
        return;
      }
      
      setIsSearching(true);
      try {
        // 実際のアプリではAPIにリクエストを送信
        // モックアプリではローカルで検索
        const messages = getMessagesByConversationId(conversationId);
        const filteredMessages = messages.filter(message => 
          message.content.toLowerCase().includes(term.toLowerCase())
        );
        
        // 最大表示数に制限
        setResults(filteredMessages.slice(0, MAX_SEARCH_RESULTS));
      } catch (error) {
        console.error('メッセージ検索エラー:', error);
      } finally {
        setIsSearching(false);
      }
    }, 300),
    [conversationId]
  );
  
  // 検索語が変わったら検索実行
  useEffect(() => {
    handleSearch(searchTerm);
  }, [searchTerm, handleSearch]);
  
  // 検索結果がクリックされたときの処理
  const handleResultClick = (messageId: string) => {
    onResultSelect(messageId);
    // 検索フォームをクリア
    setSearchTerm('');
  };
  
  // メッセージの日時をフォーマット
  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  return (
    <div className="p-2 border-b">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search size={16} className="text-gray-400" />
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="メッセージを検索..."
          className="w-full pl-8 pr-8 py-2 bg-gray-100 rounded-full text-sm"
        />
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={16} />
          </button>
        </div>
      </div>
      
      {isSearching && (
        <div className="text-center py-2">
          <span className="text-sm text-gray-500">検索中...</span>
        </div>
      )}
      
      {searchTerm.length > 0 && results.length === 0 && !isSearching && (
        <div className="text-center py-2">
          <span className="text-sm text-gray-500">結果が見つかりませんでした</span>
        </div>
      )}
      
      {results.length > 0 && (
        <div className="mt-2 max-h-60 overflow-y-auto">
          {results.map(result => (
            <button
              key={result.id}
              onClick={() => handleResultClick(result.id)}
              className="block w-full text-left p-2 hover:bg-gray-100 rounded mb-1"
            >
              <p className="text-sm truncate">{result.content}</p>
              <p className="text-xs text-gray-500">{formatDate(result.timestamp)}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// デバウンス関数（連続呼び出しを防止）
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function(...args: Parameters<T>) {
    if (timeout) {
      clearTimeout(timeout);
    }
    
    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
}

export default MessageSearch;