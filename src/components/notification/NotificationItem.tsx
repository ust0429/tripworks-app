import React from 'react';
import { Calendar, Star, Bell, Clock, CheckCircle, AlertTriangle, Info, XCircle } from 'lucide-react';
import { Notification } from '../../types';

interface NotificationItemProps {
  notification: Notification;
  onClick: (notification: Notification) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onClick }) => {
  // 通知タイプに応じたアイコンを取得
  const getIcon = () => {
    switch (notification.type) {
      case 'booking':
        return <Calendar size={20} className="text-blue-500" />;
      case 'review':
        return <Star size={20} className="text-yellow-500" />;
      case 'system':
        if (notification.subType === 'error') {
          return <XCircle size={20} className="text-red-500" />;
        } else if (notification.subType === 'warning') {
          return <AlertTriangle size={20} className="text-orange-500" />;
        } else if (notification.subType === 'success') {
          return <CheckCircle size={20} className="text-green-500" />;
        } else {
          return <Info size={20} className="text-blue-500" />;
        }
      default:
        return <Bell size={20} className="text-gray-500" />;
    }
  };

  // 日時を相対表示 (例: "3分前")
  const getRelativeTime = (date: Date) => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000); // 秒単位の差

    if (diff < 60) {
      return `${diff}秒前`;
    } else if (diff < 3600) {
      return `${Math.floor(diff / 60)}分前`;
    } else if (diff < 86400) {
      return `${Math.floor(diff / 3600)}時間前`;
    } else if (diff < 604800) {
      return `${Math.floor(diff / 86400)}日前`;
    } else {
      const dateObj = new Date(date);
      return `${dateObj.getMonth() + 1}月${dateObj.getDate()}日`;
    }
  };

  // 通知日時を取得
  const getNotificationTime = () => {
    if (!notification.createdAt) return '';
    
    if (notification.createdAt instanceof Date) {
      return getRelativeTime(notification.createdAt);
    }
    
    // Firestore のタイムスタンプを Date に変換
    if (notification.createdAt.toDate) {
      return getRelativeTime(notification.createdAt.toDate());
    }
    
    // UNIX タイムスタンプの場合
    if (typeof notification.createdAt === 'number') {
      return getRelativeTime(new Date(notification.createdAt));
    }
    
    return '';
  };

  return (
    <div 
      className={`flex p-3 cursor-pointer ${notification.isRead ? 'bg-white' : 'bg-blue-50 border-l-4 border-blue-500'}`}
      onClick={() => onClick(notification)}
    >
      <div className="flex-shrink-0 mr-3">
        {getIcon()}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium truncate ${notification.isRead ? 'text-gray-800' : 'text-black'}`}>
          {notification.title}
        </p>
        <p className="text-xs text-gray-600 mt-1 line-clamp-2">
          {notification.message}
        </p>
        <div className="flex items-center mt-1">
          <Clock size={12} className="text-gray-400 mr-1" />
          <span className="text-xs text-gray-500">{getNotificationTime()}</span>
        </div>
      </div>
      {notification.isRead && (
        <div className="flex-shrink-0 ml-2 flex items-center">
          <span className="text-xs text-gray-400">既読</span>
        </div>
      )}
    </div>
  );
};

export default NotificationItem;
