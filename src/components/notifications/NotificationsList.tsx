import React, { useState, useEffect } from 'react';
import { Notification, NotificationType, NotificationFilter } from '../../types/notification';
import notificationService from '../../services/notificationService';
import NotificationItem from './NotificationItem';
import NotificationFilters from './NotificationFilters';

interface NotificationsListProps {
  userId: string;
  onNotificationClick?: (notification: Notification) => void;
}

const NotificationsList: React.FC<NotificationsListProps> = ({ userId, onNotificationClick }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<NotificationFilter>({});

  useEffect(() => {
    fetchNotifications();
  }, [userId, filters]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await notificationService.getNotifications(userId, filters);
      setNotifications(data);
      setError(null);
    } catch (err) {
      setError('Failed to load notifications');
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications(prevNotifications =>
        prevNotifications.map(notification =>
          notification.id === notificationId
            ? { ...notification, isRead: true }
            : notification
        )
      );
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead(userId);
      setNotifications(prevNotifications =>
        prevNotifications.map(notification => ({ ...notification, isRead: true }))
      );
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      await notificationService.deleteNotification(notificationId);
      setNotifications(prevNotifications =>
        prevNotifications.filter(notification => notification.id !== notificationId)
      );
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };

  const handleFilterChange = (newFilters: NotificationFilter) => {
    setFilters(newFilters);
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      handleMarkAsRead(notification.id);
    }
    if (onNotificationClick) {
      onNotificationClick(notification);
    }
  };

  if (loading && notifications.length === 0) {
    return (
      <div className="flex justify-center items-center py-10">
        <div className="animate-pulse w-8 h-8 rounded-full bg-indigo-400 opacity-75"></div>
      </div>
    );
  }

  if (error && notifications.length === 0) {
    return (
      <div className="flex flex-col items-center py-8 text-gray-500">
        <p>{error}</p>
        <button 
          onClick={fetchNotifications}
          className="mt-4 px-4 py-2 text-sm bg-indigo-50 text-indigo-600 rounded-md hover:bg-indigo-100"
        >
          Try again
        </button>
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center py-10 text-gray-500">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-12 w-12 mb-4 text-gray-400" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={1.5} 
            d="M15 17h5l-1.5-1.5c-0.5-0.5-0.8-1.2-0.8-2V7c0-2.2-1.8-4-4-4H8C5.8 3 4 4.8 4 7v6.5c0 0.8-0.3 1.5-0.8 2L1.7 17H15z"
          />
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={1.5} 
            d="M12 13V7M8 10h8"
          />
        </svg>
        <p className="text-lg font-medium">No notifications</p>
        <p className="text-sm">You're all caught up!</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex justify-between items-center p-4 border-b">
        <h2 className="text-lg font-semibold">Notifications</h2>
        <div className="flex space-x-2">
          <NotificationFilters 
            currentFilters={filters} 
            onFilterChange={handleFilterChange} 
          />
          {notifications.some(n => !n.isRead) && (
            <button
              onClick={handleMarkAllAsRead}
              className="text-sm text-indigo-600 hover:text-indigo-800"
            >
              Mark all as read
            </button>
          )}
        </div>
      </div>

      <ul className="divide-y divide-gray-200">
        {notifications.map(notification => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onNotificationClick={handleNotificationClick}
            onDelete={handleDeleteNotification}
          />
        ))}
      </ul>
    </div>
  );
};

export default NotificationsList;
