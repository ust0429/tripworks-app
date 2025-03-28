import React from 'react';
import { Link } from 'react-router-dom';
import { X, CheckCircle } from 'lucide-react';
import NotificationItem from './NotificationItem';
import { Notification } from '../../types';

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: Notification[];
  onNotificationClick: (notification: Notification) => void;
  onMarkAllAsRead: () => void;
  isLoading: boolean;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  isOpen,
  onClose,
  notifications,
  onNotificationClick,
  onMarkAllAsRead,
  isLoading
}) => {
  if (!isOpen) return null;

  return (
    <div className="absolute top-14 right-0 w-80 max-h-[70vh] bg-white rounded-lg shadow-lg overflow-hidden z-50">
      <div className="flex items-center justify-between p-3 border-b">
        <h3 className="font-medium">通知</h3>
        <div className="flex space-x-2">
          <button
            onClick={onMarkAllAsRead}
            className="p-1 hover:bg-gray-100 rounded-full"
            title="すべて既読にする"
          >
            <CheckCircle size={18} className="text-gray-600" />
          </button>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full"
            title="閉じる"
          >
            <X size={18} className="text-gray-600" />
          </button>
        </div>
      </div>

      <div className="overflow-y-auto max-h-[50vh]">
        {isLoading ? (
          <div className="flex items-center justify-center h-24">
            <p className="text-gray-500">読み込み中...</p>
          </div>
        ) : notifications.length > 0 ? (
          <div className="divide-y">
            {notifications.slice(0, 10).map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onClick={(notification) => {
                  onNotificationClick(notification);
                  onClose();
                }}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-24 p-4">
            <p className="text-gray-500 text-sm">通知はありません</p>
          </div>
        )}
      </div>

      <div className="p-3 border-t">
        <Link
          to="/notifications"
          className="block w-full text-center py-2 bg-gray-100 rounded-lg text-sm font-medium hover:bg-gray-200"
          onClick={onClose}
        >
          すべての通知を見る
        </Link>
      </div>
    </div>
  );
};

export default NotificationDropdown;
