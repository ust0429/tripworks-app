import express from 'express';
import * as admin from 'firebase-admin';
import { AuthenticatedRequest, verifyOwnership, verifyAttender } from '../middleware/authMiddleware';

const router = express.Router();

// 予約一覧の取得
router.get('/', async (req: AuthenticatedRequest, res) => {
  try {
    // 現在のユーザーID取得
    const userId = req.user?.uid;
    
    if (!userId) {
      return res.status(401).json({ error: 'User ID is required' });
    }
    
    // クエリパラメータ
    const { attenderId, status } = req.query;
    
    let bookingsRef = admin.firestore().collection('bookings');
    
    // 基本的にはユーザー自身の予約だけを取得
    bookingsRef = bookingsRef.where('userId', '==', userId);
    
    // 追加のフィルタリング
    if (attenderId) {
      bookingsRef = bookingsRef.where('attenderId', '==', attenderId);
    }
    
    if (status) {
      bookingsRef = bookingsRef.where('status', '==', status);
    }
    
    const snapshot = await bookingsRef
      .orderBy('createdAt', 'desc')
      .get();
    
    const bookings = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    res.status(200).json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// アテンダーの予約一覧取得（アテンダー専用）
router.get('/attender', verifyAttender, async (req: AuthenticatedRequest, res) => {
  try {
    const attender = (req as any).attender;
    
    // クエリパラメータ
    const { status } = req.query;
    
    let bookingsRef = admin.firestore().collection('bookings')
      .where('attenderId', '==', attender.id);
    
    // 追加のフィルタリング
    if (status) {
      bookingsRef = bookingsRef.where('status', '==', status);
    }
    
    const snapshot = await bookingsRef
      .orderBy('createdAt', 'desc')
      .get();
    
    const bookings = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    res.status(200).json(bookings);
  } catch (error) {
    console.error('Error fetching attender bookings:', error);
    res.status(500).json({ error: 'Failed to fetch attender bookings' });
  }
});

// 特定の予約取得
router.get('/:id', verifyOwnership('booking'), async (req, res) => {
  try {
    const { id } = req.params;
    const bookingDoc = await admin.firestore().collection('bookings').doc(id).get();
    
    if (!bookingDoc.exists) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    res.status(200).json({
      id: bookingDoc.id,
      ...bookingDoc.data()
    });
  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(500).json({ error: 'Failed to fetch booking' });
  }
});

// 予約作成
router.post('/', async (req: AuthenticatedRequest, res) => {
  try {
    // 現在のユーザーID取得
    const userId = req.user?.uid;
    
    if (!userId) {
      return res.status(401).json({ error: 'User ID is required' });
    }
    
    const {
      attenderId,
      experienceId,
      date,
      time,
      duration,
      price,
      location,
      notes
    } = req.body;
    
    // 必須フィールドの検証
    if (!attenderId || !experienceId || !date || !time || !duration || !price || !location) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // 体験情報の取得（タイトルと説明のため）
    const experienceDoc = await admin.firestore().collection('experiences').doc(experienceId).get();
    
    if (!experienceDoc.exists) {
      return res.status(404).json({ error: 'Experience not found' });
    }
    
    const experienceData = experienceDoc.data();
    
    // 予約データの作成
    const bookingData = {
      userId,
      attenderId,
      experienceId,
      title: experienceData?.title || 'Experience',
      description: experienceData?.description || '',
      date,
      time,
      duration,
      price,
      location,
      notes: notes || '',
      status: 'pending', // pending, confirmed, completed, cancelled
      paymentStatus: 'pending', // pending, paid, refunded
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    // データベースに保存
    const newBookingRef = await admin.firestore().collection('bookings').add(bookingData);
    
    // 通知を作成
    await admin.firestore().collection('notifications').add({
      userId,
      type: 'booking_created',
      title: '予約が作成されました',
      message: `${date} ${time}の予約が作成されました。アテンダーの確認をお待ちください。`,
      bookingId: newBookingRef.id,
      isRead: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    // アテンダーへの通知も作成
    await admin.firestore().collection('notifications').add({
      userId: attenderId,
      type: 'booking_received',
      title: '新しい予約リクエスト',
      message: `${date} ${time}に新しい予約リクエストがあります。確認してください。`,
      bookingId: newBookingRef.id,
      isRead: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    res.status(201).json({ 
      id: newBookingRef.id,
      message: 'Booking created successfully'
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ error: 'Failed to create booking' });
  }
});

// 予約ステータス更新
router.patch('/:id/status', verifyOwnership('booking'), async (req, res) => {
  try {
    const { id } = req.params;
    const { status, cancelReason } = req.body;
    
    if (!status || !['pending', 'confirmed', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    
    // 予約確認
    const bookingRef = admin.firestore().collection('bookings').doc(id);
    const bookingDoc = await bookingRef.get();
    
    if (!bookingDoc.exists) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    const bookingData = bookingDoc.data();
    
    // ステータス更新データ
    const updateData: any = {
      status,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    // キャンセルの場合は理由も記録
    if (status === 'cancelled' && cancelReason) {
      updateData.cancelReason = cancelReason;
    }
    
    // 予約ステータス更新
    await bookingRef.update(updateData);
    
    // 通知作成
    let notificationMessage = '';
    switch (status) {
      case 'confirmed':
        notificationMessage = '予約が確定しました。当日をお楽しみに！';
        break;
      case 'completed':
        notificationMessage = '予約が完了しました。体験はいかがでしたか？レビューを投稿しましょう。';
        break;
      case 'cancelled':
        notificationMessage = `予約がキャンセルされました。${cancelReason ? `理由: ${cancelReason}` : ''}`;
        break;
      default:
        notificationMessage = '予約のステータスが更新されました。';
    }
    
    // ユーザーへの通知
    await admin.firestore().collection('notifications').add({
      userId: bookingData?.userId,
      type: `booking_${status}`,
      title: `予約が${status === 'confirmed' ? '確定' : status === 'completed' ? '完了' : 'キャンセル'}されました`,
      message: notificationMessage,
      bookingId: id,
      isRead: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    res.status(200).json({ 
      message: `Booking status updated to ${status}`,
      id 
    });
  } catch (error) {
    console.error('Error updating booking status:', error);
    res.status(500).json({ error: 'Failed to update booking status' });
  }
});

export default router;