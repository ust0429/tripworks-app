import { User } from './user';
import { Experience } from './experience';
import { Reservation } from './reservation';

export enum NotificationType {
  SYSTEM = 'system',
  MESSAGE = 'message',
  RESERVATION = 'reservation',
  REVIEW = 'review',
  PAYMENT = 'payment',
  MARKETING = 'marketing',
}

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  createdAt: string;
  isRead: boolean;
  data?: NotificationData;
  userId: string;
}

export interface NotificationData {
  // Common fields
  redirectUrl?: string;
  
  // Message notification specific fields
  senderId?: string;
  senderName?: string;
  senderAvatar?: string;
  conversationId?: string;
  
  // Reservation notification specific fields
  reservationId?: string;
  reservationStatus?: string;
  experienceId?: string;
  experienceTitle?: string;
  attenderId?: string;
  attenderName?: string;
  
  // Review notification specific fields
  reviewId?: string;
  rating?: number;
  
  // Payment notification specific fields
  paymentId?: string;
  amount?: number;
  currency?: string;
  paymentStatus?: string;

  // Any additional custom data
  [key: string]: any;
}

export interface NotificationSettings {
  enablePush: boolean;
  enableEmail: boolean;
  enableInApp: boolean;
  muteAll: boolean;
  categories: {
    [key in NotificationType]: {
      push: boolean;
      email: boolean;
      inApp: boolean;
    };
  };
}

export interface NotificationFilter {
  type?: NotificationType[];
  read?: boolean;
  startDate?: string;
  endDate?: string;
}
