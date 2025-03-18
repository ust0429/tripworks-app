// src/components/ReviewReply.tsx
import React, { useState } from 'react';
import { User, Edit, Trash, MoreVertical } from 'lucide-react';
import { ReviewReply } from '../types';

interface ReviewReplyProps {
  reply: ReviewReply;
  isOwner?: boolean; // 返信の所有者かどうか
  onEdit?: (replyId: string, newContent: string) => void;
  onDelete?: (replyId: string) => void;
}

const ReviewReplyComponent: React.FC<ReviewReplyProps> = ({ 
  reply, 
  isOwner = false,
  onEdit,
  onDelete
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(reply.content);
  const [showOptions, setShowOptions] = useState(false);
  
  // 日付をフォーマット
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
  };
  
  // 編集を保存
  const handleSaveEdit = () => {
    if (editContent.trim() && onEdit) {
      onEdit(reply.id, editContent);
      setIsEditing(false);
    }
  };
  
  // 編集をキャンセル
  const handleCancelEdit = () => {
    setEditContent(reply.content);
    setIsEditing(false);
  };
  
  // 削除を確認
  const handleDelete = () => {
    if (onDelete && window.confirm('この返信を削除してもよろしいですか？')) {
      onDelete(reply.id);
    }
    setShowOptions(false);
  };

  return (
    <div className="pl-6 border-l border-gray-200 ml-6 mt-3 mb-3">
      <div className="flex items-start space-x-3">
        <div className="w-7 h-7 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
          {reply.userImage ? (
            <img src={reply.userImage} alt={reply.userName} className="w-full h-full object-cover" />
          ) : (
            <User size={16} className="text-gray-400" />
          )}
        </div>
        
        <div className="flex-1">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <h4 className="font-medium text-sm">{reply.userName}</h4>
              
              {/* ユーザータイプに応じたバッジ */}
              {reply.userType === 'attender' && (
                <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full">
                  アテンダー
                </span>
              )}
              {reply.userType === 'admin' && (
                <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-800 rounded-full">
                  運営
                </span>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <p className="text-xs text-gray-500">{formatDate(reply.date)}</p>
              
              {/* 所有者の場合のみオプションメニューを表示 */}
              {isOwner && (
                <div className="relative">
                  <button
                    onClick={() => setShowOptions(!showOptions)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <MoreVertical size={14} />
                  </button>
                  
                  {showOptions && (
                    <div className="absolute right-0 mt-1 bg-white shadow-lg rounded-lg py-1 z-10 w-28">
                      <button
                        onClick={() => {
                          setIsEditing(true);
                          setShowOptions(false);
                        }}
                        className="w-full px-3 py-1.5 text-left text-xs flex items-center hover:bg-gray-100"
                      >
                        <Edit size={12} className="mr-2 text-gray-500" />
                        編集する
                      </button>
                      <button
                        onClick={handleDelete}
                        className="w-full px-3 py-1.5 text-left text-xs flex items-center hover:bg-gray-100 text-red-500"
                      >
                        <Trash size={12} className="mr-2" />
                        削除する
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {/* 編集モード/表示モード */}
          {isEditing ? (
            <div className="mt-1">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
                rows={3}
              ></textarea>
              <div className="flex justify-end space-x-2 mt-2">
                <button 
                  onClick={handleCancelEdit}
                  className="px-3 py-1 text-xs border border-gray-300 rounded-lg"
                >
                  キャンセル
                </button>
                <button 
                  onClick={handleSaveEdit}
                  className="px-3 py-1 text-xs bg-blue-600 text-white rounded-lg"
                >
                  保存
                </button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-700 mt-1">{reply.content}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewReplyComponent;