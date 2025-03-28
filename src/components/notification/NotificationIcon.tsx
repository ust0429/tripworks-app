import React from 'react';
import { Bell } from 'lucide-react';

interface NotificationIconProps {
  unreadCount: number;
  onClick: () => void;
}

const NotificationIcon: React.FC<NotificationIconProps> = ({ unreadCount, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="p-2 rounded-full hover:bg-gray-800 relative"
      aria-label="通知"
    >
      <Bell size={20} className="text-white" />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </button>
  );
};

export default NotificationIcon;
