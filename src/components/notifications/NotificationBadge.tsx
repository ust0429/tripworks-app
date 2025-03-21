import React, { useState, useEffect } from 'react';
import notificationService from '../../services/notificationService';

interface NotificationBadgeProps {
  userId: string;
  className?: string;
}

const NotificationBadge: React.FC<NotificationBadgeProps> = ({ userId, className = '' }) => {
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!userId) return;
    
    const fetchUnreadCount = async () => {
      try {
        setLoading(true);
        const count = await notificationService.getUnreadCount(userId);
        setUnreadCount(count);
      } catch (err) {
        console.error('Error fetching unread notification count:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUnreadCount();

    // Set up a polling interval to check for new notifications
    const intervalId = setInterval(fetchUnreadCount, 60000); // Check every minute

    return () => clearInterval(intervalId);
  }, [userId]);

  if (loading || unreadCount === 0) {
    return null;
  }

  return (
    <span 
      className={`inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-medium leading-none text-white bg-red-500 rounded-full ${className}`}
      aria-label={`${unreadCount} unread notifications`}
    >
      {unreadCount > 99 ? '99+' : unreadCount}
    </span>
  );
};

export default NotificationBadge;
