import { Notification, NotificationType, NotificationFilter, NotificationSettings } from '../types/notification';
import { v4 as uuidv4 } from 'uuid';

// Mock notifications data
const mockNotifications: Notification[] = [
  {
    id: uuidv4(),
    type: NotificationType.MESSAGE,
    title: 'New message from Miyuki',
    message: 'I am looking forward to our Kyoto pottery experience!',
    createdAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    isRead: false,
    userId: 'user123',
    data: {
      senderId: 'sender456',
      senderName: 'Miyuki Takahashi',
      senderAvatar: 'https://randomuser.me/api/portraits/women/44.jpg',
      conversationId: 'conv789',
      redirectUrl: '/messages/conv789'
    }
  },
  {
    id: uuidv4(),
    type: NotificationType.RESERVATION,
    title: 'Reservation confirmed',
    message: 'Your Urban Exploration in Osaka has been confirmed',
    createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    isRead: true,
    userId: 'user123',
    data: {
      reservationId: 'res123',
      reservationStatus: 'confirmed',
      experienceId: 'exp456',
      experienceTitle: 'Urban Exploration in Osaka',
      attenderId: 'att789',
      attenderName: 'Kenji Watanabe',
      redirectUrl: '/reservations/res123'
    }
  },
  {
    id: uuidv4(),
    type: NotificationType.SYSTEM,
    title: 'Welcome to echo!',
    message: 'Thanks for joining our community of cultural explorers',
    createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    isRead: true,
    userId: 'user123',
    data: {
      redirectUrl: '/onboarding'
    }
  },
  {
    id: uuidv4(),
    type: NotificationType.REVIEW,
    title: 'New review received',
    message: 'Someone left a 5-star review on your experience',
    createdAt: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
    isRead: false,
    userId: 'user123',
    data: {
      reviewId: 'rev123',
      rating: 5,
      experienceId: 'exp789',
      experienceTitle: 'Traditional Tea Ceremony',
      redirectUrl: '/reviews/rev123'
    }
  },
  {
    id: uuidv4(),
    type: NotificationType.PAYMENT,
    title: 'Payment successful',
    message: 'Your payment of ¥5,800 has been processed',
    createdAt: new Date(Date.now() - 345600000).toISOString(), // 4 days ago
    isRead: true,
    userId: 'user123',
    data: {
      paymentId: 'pay123',
      amount: 5800,
      currency: 'JPY',
      paymentStatus: 'completed',
      redirectUrl: '/payments/pay123'
    }
  },
  {
    id: uuidv4(),
    type: NotificationType.MARKETING,
    title: 'Discover new experiences',
    message: 'Check out these unique cultural experiences in Tokyo',
    createdAt: new Date(Date.now() - 432000000).toISOString(), // 5 days ago
    isRead: false,
    userId: 'user123',
    data: {
      redirectUrl: '/explore?location=Tokyo'
    }
  }
];

// Default notification settings
const defaultSettings: NotificationSettings = {
  enablePush: true,
  enableEmail: true,
  enableInApp: true,
  muteAll: false,
  categories: {
    [NotificationType.SYSTEM]: { push: true, email: true, inApp: true },
    [NotificationType.MESSAGE]: { push: true, email: true, inApp: true },
    [NotificationType.RESERVATION]: { push: true, email: true, inApp: true },
    [NotificationType.REVIEW]: { push: true, email: true, inApp: true },
    [NotificationType.PAYMENT]: { push: true, email: true, inApp: true },
    [NotificationType.MARKETING]: { push: false, email: true, inApp: true }
  }
};

class NotificationService {
  private notifications: Notification[] = [...mockNotifications];
  private settings: NotificationSettings = { ...defaultSettings };

  // Get all notifications for the current user
  async getNotifications(userId: string, filter?: NotificationFilter): Promise<Notification[]> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    let filteredNotifications = this.notifications.filter(n => n.userId === userId);
    
    if (filter) {
      if (filter.type && filter.type.length > 0) {
        filteredNotifications = filteredNotifications.filter(n => filter.type?.includes(n.type));
      }
      
      if (filter.read !== undefined) {
        filteredNotifications = filteredNotifications.filter(n => n.isRead === filter.read);
      }
      
      if (filter.startDate) {
        const startDate = new Date(filter.startDate).getTime();
        filteredNotifications = filteredNotifications.filter(n => new Date(n.createdAt).getTime() >= startDate);
      }
      
      if (filter.endDate) {
        const endDate = new Date(filter.endDate).getTime();
        filteredNotifications = filteredNotifications.filter(n => new Date(n.createdAt).getTime() <= endDate);
      }
    }
    
    // Sort by date (newest first)
    return filteredNotifications.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  // Get unread notifications count
  async getUnreadCount(userId: string): Promise<number> {
    await new Promise(resolve => setTimeout(resolve, 100));
    return this.notifications.filter(n => n.userId === userId && !n.isRead).length;
  }

  // Mark notification as read
  async markAsRead(notificationId: string): Promise<Notification> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const notification = this.notifications.find(n => n.id === notificationId);
    if (!notification) {
      throw new Error('Notification not found');
    }
    
    notification.isRead = true;
    return { ...notification };
  }

  // Mark all notifications as read
  async markAllAsRead(userId: string): Promise<number> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    let count = 0;
    this.notifications.forEach(n => {
      if (n.userId === userId && !n.isRead) {
        n.isRead = true;
        count++;
      }
    });
    
    return count;
  }

  // Delete a notification
  async deleteNotification(notificationId: string): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const index = this.notifications.findIndex(n => n.id === notificationId);
    if (index === -1) {
      throw new Error('Notification not found');
    }
    
    this.notifications.splice(index, 1);
    return true;
  }

  // Get notification settings
  async getNotificationSettings(userId: string): Promise<NotificationSettings> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return { ...this.settings };
  }

  // Update notification settings
  async updateNotificationSettings(userId: string, settings: Partial<NotificationSettings>): Promise<NotificationSettings> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    this.settings = {
      ...this.settings,
      ...settings,
      categories: {
        ...this.settings.categories,
        ...(settings.categories || {})
      }
    };
    
    return { ...this.settings };
  }

  // Create a new notification (for testing purposes)
  async createNotification(notification: Omit<Notification, 'id' | 'createdAt'>): Promise<Notification> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const newNotification: Notification = {
      ...notification,
      id: uuidv4(),
      createdAt: new Date().toISOString()
    };
    
    this.notifications.unshift(newNotification);
    return { ...newNotification };
  }
}

export const notificationService = new NotificationService();
export default notificationService;
