// src/components/messages/ConversationMenu.tsx
import React, { useState } from 'react';
import { MoreVertical, Archive, Bell, AlertCircle, Trash2, Check, BellOff } from 'lucide-react';

interface ConversationMenuProps {
  conversationId: string;
  isArchived?: boolean;
  isMuted?: boolean;
  onArchive?: (conversationId: string) => void;
  onUnarchive?: (conversationId: string) => void;
  onMute?: (conversationId: string) => void;
  onUnmute?: (conversationId: string) => void;
  onDelete?: (conversationId: string) => void;
  onReport?: (conversationId: string) => void;
}

/**
 * 会話の操作メニューコンポーネント
 */
const ConversationMenu: React.FC<ConversationMenuProps> = ({
  conversationId,
  isArchived = false,
  isMuted = false,
  onArchive,
  onUnarchive,
  onMute,
  onUnmute,
  onDelete,
  onReport
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // メニューの表示・非表示を切り替え
  const toggleMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpen(!menuOpen);
    // 削除確認を閉じる
    setShowDeleteConfirm(false);
  };
  
  // メニュー項目がクリックされたときの共通処理
  const handleMenuItemClick = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
    setMenuOpen(false);
  };
  
  // アーカイブ/アーカイブ解除
  const handleArchiveClick = (e: React.MouseEvent) => {
    if (isArchived && onUnarchive) {
      handleMenuItemClick(e, () => onUnarchive(conversationId));
    } else if (!isArchived && onArchive) {
      handleMenuItemClick(e, () => onArchive(conversationId));
    }
  };
  
  // ミュート/ミュート解除
  const handleMuteClick = (e: React.MouseEvent) => {
    if (isMuted && onUnmute) {
      handleMenuItemClick(e, () => onUnmute(conversationId));
    } else if (!isMuted && onMute) {
      handleMenuItemClick(e, () => onMute(conversationId));
    }
  };
  
  // 削除処理
  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (showDeleteConfirm) {
      if (onDelete) {
        onDelete(conversationId);
      }
      setShowDeleteConfirm(false);
      setMenuOpen(false);
    } else {
      setShowDeleteConfirm(true);
    }
  };
  
  // 報告処理
  const handleReportClick = (e: React.MouseEvent) => {
    if (onReport) {
      handleMenuItemClick(e, () => onReport(conversationId));
    }
  };
  
  return (
    <div className="relative">
      <button
        onClick={toggleMenu}
        className="p-1 hover:bg-gray-100 rounded-full"
      >
        <MoreVertical size={16} className="text-gray-500" />
      </button>
      
      {menuOpen && (
        <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg z-10 py-1">
          <button
            onClick={handleArchiveClick}
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center"
          >
            <Archive size={16} className="mr-2 text-gray-600" />
            {isArchived ? 'アーカイブを解除' : 'アーカイブ'}
          </button>
          
          <button
            onClick={handleMuteClick}
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center"
          >
            {isMuted ? (
              <>
                <Bell size={16} className="mr-2 text-gray-600" />
                ミュート解除
              </>
            ) : (
              <>
                <BellOff size={16} className="mr-2 text-gray-600" />
                ミュート
              </>
            )}
          </button>
          
          <button
            onClick={handleReportClick}
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center"
          >
            <AlertCircle size={16} className="mr-2 text-gray-600" />
            問題を報告
          </button>
          
          <hr className="my-1" />
          
          <button
            onClick={handleDeleteClick}
            className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center ${
              showDeleteConfirm ? 'text-red-600' : ''
            }`}
          >
            {showDeleteConfirm ? (
              <>
                <Check size={16} className="mr-2 text-red-600" />
                削除を確認
              </>
            ) : (
              <>
                <Trash2 size={16} className="mr-2 text-gray-600" />
                削除
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default ConversationMenu;