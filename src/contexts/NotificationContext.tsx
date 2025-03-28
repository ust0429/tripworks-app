import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { collection, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { db } from '../config/firebase';
import { Notification } from '../types';
import { markAsRead, markAllAsRead } from '../services/notification/NotificationService';
import { useAuth } from '../AuthComponents';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  handleNotificationClick: (notification: Notification) => Promise<void>;
  markAllNotificationsAsRead: () => Promise<void>;
  refetchNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // リアルタイムで通知を取得する
  const fetchNotifications = useCallback(() => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      setIsLoading(false);
      return () => {};
    }

    setIsLoading(true);
    const notificationsRef = collection(db, 'notifications');
    const q = query(
      notificationsRef,
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc'),
      limit(20)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newNotifications = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Notification[];
      
      setNotifications(newNotifications);
      setUnreadCount(newNotifications.filter(n => !n.isRead).length);
      setIsLoading(false);
    }, (error) => {
      console.error('Failed to fetch notifications:', error);
      setIsLoading(false);
    });

    return unsubscribe;
  }, [user]);

  // 通知をクリックした時の処理
  const handleNotificationClick = useCallback(async (notification: Notification) => {
    // 既読にする
    await markAsRead(notification.id);
    
    // 関連ページへ移動
    if (notification.link) {
      navigate(notification.link);
    } else if (notification.resourceType === 'booking' && notification.resourceId) {
      navigate(`/bookings/${notification.resourceId}`);
    } else if (notification.resourceType === 'review' && notification.resourceId) {
      navigate(`/reviews/${notification.resourceId}`);
    } else if (notification.resourceType === 'attender' && notification.resourceId) {
      navigate(`/attenders/${notification.resourceId}`);
    } else if (notification.resourceType === 'experience' && notification.resourceId) {
      navigate(`/experiences/${notification.resourceId}`);
    } else if (notification.type === 'system') {
      navigate('/notifications');
    }
  }, [navigate]);

  // すべての通知を既読にする
  const markAllNotificationsAsRead = useCallback(async () => {
    if (!user) return;
    await markAllAsRead(user.uid);
  }, [user]);

  // 通知のリフェッチ（手動更新）
  const refetchNotifications = useCallback(() => {
    // unsubscribeと再subscribe
    const unsubscribe = fetchNotifications();
    return () => {
      unsubscribe();
    };
  }, [fetchNotifications]);

  // マウント時に通知を取得
  useEffect(() => {
    const unsubscribe = fetchNotifications();
    return () => {
      unsubscribe();
    };
  }, [fetchNotifications]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        isLoading,
        handleNotificationClick,
        markAllNotificationsAsRead,
        refetchNotifications
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
