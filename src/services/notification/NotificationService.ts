import { 
  collection, 
  query, 
  where,
  doc, 
  getDocs, 
  updateDoc, 
  orderBy, 
  limit,
  writeBatch,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Notification } from '../../types';

/**
 * 指定されたユーザーの通知を既読にマークする
 * @param notificationId 通知ID
 * @returns 成功したかどうか
 */
export async function markAsRead(notificationId: string): Promise<boolean> {
  try {
    const notificationRef = doc(db, 'notifications', notificationId);
    await updateDoc(notificationRef, {
      isRead: true,
      readAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error('Failed to mark notification as read', error);
    return false;
  }
}

/**
 * 指定されたユーザーのすべての通知を既読にマークする
 * @param userId ユーザーID
 * @returns 成功したかどうか
 */
export async function markAllAsRead(userId: string): Promise<boolean> {
  try {
    const batch = writeBatch(db);
    const notificationsRef = collection(db, 'notifications');
    const q = query(
      notificationsRef,
      where('userId', '==', userId),
      where('isRead', '==', false)
    );
    
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach(doc => {
      batch.update(doc.ref, {
        isRead: true,
        readAt: serverTimestamp()
      });
    });
    
    await batch.commit();
    return true;
  } catch (error) {
    console.error('Failed to mark all notifications as read', error);
    return false;
  }
}

/**
 * 指定されたユーザーの通知をフェッチする（非リアルタイム）
 * @param userId ユーザーID
 * @param count 取得する通知の数
 * @param onlyUnread 未読通知のみを取得するかどうか
 * @returns 通知の配列
 */
export async function fetchNotifications(
  userId: string, 
  count: number = 20, 
  onlyUnread: boolean = false
): Promise<Notification[]> {
  try {
    const notificationsRef = collection(db, 'notifications');
    let queryConstraints = [
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(count)
    ];
    
    if (onlyUnread) {
      queryConstraints = [
        where('userId', '==', userId),
        where('isRead', '==', false),
        orderBy('createdAt', 'desc'),
        limit(count)
      ];
    }
    
    const q = query(notificationsRef, ...queryConstraints);
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Notification[];
  } catch (error) {
    console.error('Failed to fetch notifications', error);
    return [];
  }
}

/**
 * 未読通知のカウントを取得する
 * @param userId ユーザーID
 * @returns 未読通知の数
 */
export async function getUnreadCount(userId: string): Promise<number> {
  try {
    const notificationsRef = collection(db, 'notifications');
    const q = query(
      notificationsRef,
      where('userId', '==', userId),
      where('isRead', '==', false)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.size;
  } catch (error) {
    console.error('Failed to get unread count', error);
    return 0;
  }
}
