/**
 * 通知サービス
 * 
 * 未実装のため、一時的にモックサービスを提供
 */

import { logApiRequest, logApiResponse } from '../../utils/apiClient';

// 通知の種類
export type NotificationType = 
  | 'booking_created'
  | 'booking_confirmed'
  | 'booking_canceled'
  | 'booking_completed'
  | 'payment_received'
  | 'payment_refunded'
  | 'message_received'
  | 'review_received'
  | 'system';

// 通知の優先度
export type NotificationPriority = 'high' | 'normal' | 'low';

// 通知の読み取り状態
export type NotificationReadStatus = 'read' | 'unread';

// 通知情報の型
export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  priority: NotificationPriority;
  status: NotificationReadStatus;
  createdAt: string;
  expiresAt?: string;
}

// 通知作成リクエストの型
export interface CreateNotificationRequest {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  priority?: NotificationPriority;
  expiresAt?: string;
}

/**
 * 通知を作成する
 * @param data 通知データ
 * @returns 作成された通知情報
 */
const createNotification = async (data: CreateNotificationRequest): Promise<Notification> => {
  try {
    logApiRequest('POST', '/api/notifications', data);
    
    // モックの通知処理
    const mockNotification: Notification = {
      id: `notification_${Date.now()}`,
      userId: data.userId,
      type: data.type,
      title: data.title,
      message: data.message,
      data: data.data,
      priority: data.priority || 'normal',
      status: 'unread',
      createdAt: new Date().toISOString(),
      expiresAt: data.expiresAt
    };
    
    const mockResponse = {
      success: true,
      data: mockNotification,
      status: 200,
      headers: new Headers()
    };
    
    logApiResponse('POST', '/api/notifications', mockResponse);
    
    return mockNotification;
  } catch (error) {
    console.error('通知作成エラー:', error);
    throw error;
  }
};

/**
 * ユーザーの通知一覧を取得する
 * @param userId ユーザーID
 * @param limit 取得上限数（デフォルト20）
 * @param offset オフセット（デフォルト0）
 * @param status 読み取り状態でフィルタリング（省略時は全て）
 * @returns 通知一覧
 */
const getUserNotifications = async (
  userId: string,
  limit: number = 20,
  offset: number = 0,
  status?: NotificationReadStatus
): Promise<Notification[]> => {
  try {
    const params = { limit, offset, status };
    logApiRequest('GET', `/api/users/${userId}/notifications`, params);
    
    // モックの通知一覧
    const mockNotifications: Notification[] = Array.from({ length: 5 }, (_, i) => ({
      id: `notification_${Date.now()}_${i}`,
      userId,
      type: ['booking_created', 'message_received', 'system', 'review_received', 'payment_received'][i] as NotificationType,
      title: `通知タイトル ${i + 1}`,
      message: `これはテスト通知メッセージです。${i + 1}`,
      priority: ['normal', 'high', 'normal', 'low', 'normal'][i] as NotificationPriority,
      status: i < 2 ? 'unread' : 'read',
      createdAt: new Date(Date.now() - i * 3600000).toISOString() // 1時間ごとに過去の通知
    }));
    
    const filteredNotifications = status 
      ? mockNotifications.filter(n => n.status === status)
      : mockNotifications;
    
    const mockResponse = {
      success: true,
      data: filteredNotifications,
      status: 200,
      headers: new Headers()
    };
    
    logApiResponse('GET', `/api/users/${userId}/notifications`, mockResponse);
    
    return filteredNotifications;
  } catch (error) {
    console.error('通知一覧取得エラー:', error);
    throw error;
  }
};

/**
 * 通知を既読にする
 * @param notificationId 通知ID
 * @returns 更新された通知情報
 */
const markNotificationAsRead = async (notificationId: string): Promise<Notification> => {
  try {
    logApiRequest('PATCH', `/api/notifications/${notificationId}/read`, {});
    
    // モックの通知情報
    const mockNotification: Notification = {
      id: notificationId,
      userId: 'user_12345',
      type: 'system',
      title: 'テスト通知',
      message: 'これはテスト通知です',
      priority: 'normal',
      status: 'read', // 既読に変更
      createdAt: new Date().toISOString()
    };
    
    const mockResponse = {
      success: true,
      data: mockNotification,
      status: 200,
      headers: new Headers()
    };
    
    logApiResponse('PATCH', `/api/notifications/${notificationId}/read`, mockResponse);
    
    return mockNotification;
  } catch (error) {
    console.error('通知既読設定エラー:', error);
    throw error;
  }
};

/**
 * 全ての通知を既読にする
 * @param userId ユーザーID
 * @returns 処理結果
 */
const markAllNotificationsAsRead = async (userId: string): Promise<{ success: boolean; count: number }> => {
  try {
    logApiRequest('PATCH', `/api/users/${userId}/notifications/read-all`, {});
    
    const mockResponse = {
      success: true,
      data: {
        success: true,
        count: 5
      },
      status: 200,
      headers: new Headers()
    };
    
    logApiResponse('PATCH', `/api/users/${userId}/notifications/read-all`, mockResponse);
    
    return { success: true, count: 5 };
  } catch (error) {
    console.error('全通知既読設定エラー:', error);
    throw error;
  }
};

/**
 * 通知を削除する
 * @param notificationId 通知ID
 * @returns 処理結果
 */
const deleteNotification = async (notificationId: string): Promise<{ success: boolean }> => {
  try {
    logApiRequest('DELETE', `/api/notifications/${notificationId}`, {});
    
    const mockResponse = {
      success: true,
      data: { success: true },
      status: 200,
      headers: new Headers()
    };
    
    logApiResponse('DELETE', `/api/notifications/${notificationId}`, mockResponse);
    
    return { success: true };
  } catch (error) {
    console.error('通知削除エラー:', error);
    throw error;
  }
};

export default {
  createNotification,
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification
};
