/**
 * Bookings Router
 * 
 * 予約関連のエンドポイントを定義します。
 */
import express from 'express';
import { AuthenticatedRequest, verifyAttender, verifyOwnership } from '../middleware/authMiddleware';
import * as admin from 'firebase-admin';

const router = express.Router();
const db = admin.firestore();

/**
 * ユーザーの予約一覧を取得
 * クエリパラメータで絞り込み可能:
 * - status: 予約のステータス
 * - from: この日付以降の予約
 * - to: この日付以前の予約
 */
router.get('/', async (req: AuthenticatedRequest, res) => {
  try {
    const { status, from, to } = req.query;
    const userId = req.user?.uid;
    
    if (!userId) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required'
      });
    }
    
    // クエリの基本設定
    let query: FirebaseFirestore.Query = db.collection('bookings')
      .where('userId', '==', userId);
    
    // フィルタリング条件の適用
    if (status) {
      query = query.where('status', '==', status);
    }
    
    // 日付でのフィルタリング
    // 日付の範囲検索は複合インデックスが必要な場合があります
    if (from) {
      query = query.where('date', '>=', from);
    }
    
    // 予約日でソート
    query = query.orderBy('date', 'asc');
    
    // 「to」フィルタはorderByの後に適用
    if (to) {
      query = query.where('date', '<=', to);
    }
    
    // クエリ実行
    const snapshot = await query.get();
    
    // レスポンスデータの整形
    const bookings = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    res.status(200).json(bookings);
  } catch (error) {
    console.error('予約一覧取得エラー:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to retrieve bookings'
    });
  }
});

/**
 * アテンダーの予約一覧を取得（アテンダー専用）
 */
router.get('/attender', verifyAttender, async (req: AuthenticatedRequest & { attender?: any }, res) => {
  try {
    const { status, from, to } = req.query;
    const attenderId = req.attender?.id;
    
    if (!attenderId) {
      return res.status(400).json({
        error: 'Bad request',
        message: 'Attender ID not found'
      });
    }
    
    // クエリの基本設定
    let query: FirebaseFirestore.Query = db.collection('bookings')
      .where('attenderId', '==', attenderId);
    
    // フィルタリング条件の適用
    if (status) {
      query = query.where('status', '==', status);
    }
    
    // 日付でのフィルタリング
    if (from) {
      query = query.where('date', '>=', from);
    }
    
    // 予約日でソート
    query = query.orderBy('date', 'asc');
    
    // 「to」フィルタはorderByの後に適用
    if (to) {
      query = query.where('date', '<=', to);
    }
    
    // クエリ実行
    const snapshot = await query.get();
    
    // レスポンスデータの整形
    const bookings = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    res.status(200).json(bookings);
  } catch (error) {
    console.error('アテンダー予約一覧取得エラー:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to retrieve attender bookings'
    });
  }
});

/**
 * 特定の予約の詳細を取得
 */
router.get('/:id', async (req: AuthenticatedRequest, res) => {
  try {
    const bookingId = req.params.id;
    const userId = req.user?.uid;
    
    if (!userId) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required'
      });
    }
    
    const doc = await db.collection('bookings').doc(bookingId).get();
    
    if (!doc.exists) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Booking not found'
      });
    }
    
    const bookingData = doc.data();
    
    // 自分の予約またはアテンダーとしての予約かチェック
    if (bookingData?.userId !== userId) {
      // アテンダーかどうかチェック
      const attenderSnapshot = await db.collection('attenders')
        .where('userId', '==', userId)
        .limit(1)
        .get();
      
      if (attenderSnapshot.empty || attenderSnapshot.docs[0].id !== bookingData?.attenderId) {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'You do not have permission to access this booking'
        });
      }
    }
    
    res.status(200).json({
      id: doc.id,
      ...bookingData
    });
  } catch (error) {
    console.error('予約詳細取得エラー:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to retrieve booking details'
    });
  }
});

/**
 * 新規予約を作成
 */
router.post('/', async (req: AuthenticatedRequest, res) => {
  try {
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
    
    const userId = req.user?.uid;
    
    if (!userId) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required'
      });
    }
    
    // 必須項目の検証
    if (!attenderId) {
      return res.status(400).json({
        error: 'Bad request',
        message: 'attenderId is required'
      });
    }
    
    if (!experienceId) {
      return res.status(400).json({
        error: 'Bad request',
        message: 'experienceId is required'
      });
    }
    
    if (!date) {
      return res.status(400).json({
        error: 'Bad request',
        message: 'date is required'
      });
    }
    
    if (!time) {
      return res.status(400).json({
        error: 'Bad request',
        message: 'time is required'
      });
    }
    
    if (!duration) {
      return res.status(400).json({
        error: 'Bad request',
        message: 'duration is required'
      });
    }
    
    if (!location) {
      return res.status(400).json({
        error: 'Bad request',
        message: 'location is required'
      });
    }
    
    if (price === undefined) {
      return res.status(400).json({
        error: 'Bad request',
        message: 'price is required'
      });
    }
    
    // アテンダーと体験の情報を取得
    const attenderDoc = await db.collection('attenders').doc(attenderId).get();
    const experienceDoc = await db.collection('experiences').doc(experienceId).get();
    
    if (!attenderDoc.exists) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Attender not found'
      });
    }
    
    if (!experienceDoc.exists) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Experience not found'
      });
    }
    
    const experienceData = experienceDoc.data();
    
    // 新規予約データの作成
    const bookingData = {
      userId,
      attenderId,
      experienceId,
      title: experienceData?.title || '体験',
      description: experienceData?.description || '詳細説明',
      date,
      time,
      duration,
      location,
      price: Number(price),
      status: 'pending',
      paymentStatus: 'pending',
      notes: notes || '',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    // Firestoreに保存
    const docRef = await db.collection('bookings').add(bookingData);
    
    // アテンダーに通知を送信（実装例）
    await sendBookingNotification(attenderId, userId, docRef.id);
    
    res.status(201).json({
      id: docRef.id,
      message: 'Booking created successfully'
    });
  } catch (error) {
    console.error('予約作成エラー:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to create booking'
    });
  }
});

/**
 * 予約のステータスを更新
 */
router.patch('/:id/status', async (req: AuthenticatedRequest, res) => {
  try {
    const bookingId = req.params.id;
    const { status, cancelReason } = req.body;
    const userId = req.user?.uid;
    
    if (!userId) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required'
      });
    }
    
    if (!status) {
      return res.status(400).json({
        error: 'Bad request',
        message: 'status is required'
      });
    }
    
    // 許可されたステータス値をチェック
    const allowedStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        error: 'Bad request',
        message: `status must be one of: ${allowedStatuses.join(', ')}`
      });
    }
    
    // 予約情報を取得
    const bookingDoc = await db.collection('bookings').doc(bookingId).get();
    
    if (!bookingDoc.exists) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Booking not found'
      });
    }
    
    const bookingData = bookingDoc.data();
    
    // 権限チェック
    // 1. キャンセルはユーザーが行う場合とアテンダーが行う場合がある
    // 2. 確認と完了はアテンダーのみ可能
    const isUser = bookingData?.userId === userId;
    const isAttender = await checkIfUserIsAttender(userId, bookingData?.attenderId);
    
    // キャンセル処理
    if (status === 'cancelled') {
      if (!isUser && !isAttender) {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'You do not have permission to cancel this booking'
        });
      }
      
      // キャンセル理由は必須
      if (!cancelReason) {
        return res.status(400).json({
          error: 'Bad request',
          message: 'cancelReason is required for cancellation'
        });
      }
    }
    // 確認・完了処理
    else if (status === 'confirmed' || status === 'completed') {
      if (!isAttender) {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'Only the attender can confirm or complete bookings'
        });
      }
    }
    
    // 現在の予約状態をチェック
    // 完了済みの予約はステータス変更不可
    if (bookingData?.status === 'completed') {
      return res.status(400).json({
        error: 'Bad request',
        message: 'Cannot change status of a completed booking'
      });
    }
    
    // キャンセル済みの予約は確認・完了に変更不可
    if (bookingData?.status === 'cancelled' && (status === 'confirmed' || status === 'completed')) {
      return res.status(400).json({
        error: 'Bad request',
        message: 'Cannot confirm or complete a cancelled booking'
      });
    }
    
    // 確認済みでない予約は完了に変更不可
    if (bookingData?.status !== 'confirmed' && status === 'completed') {
      return res.status(400).json({
        error: 'Bad request',
        message: 'Booking must be confirmed before it can be completed'
      });
    }
    
    // 更新データの作成
    const updateData: Record<string, any> = {
      status,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    // キャンセル理由を追加（キャンセルの場合）
    if (status === 'cancelled' && cancelReason) {
      updateData.cancelReason = cancelReason;
    }
    
    // Firestoreを更新
    await db.collection('bookings').doc(bookingId).update(updateData);
    
    // ステータス変更通知を送信
    await sendStatusChangeNotification(bookingId, status, isAttender ? 'attender' : 'user');
    
    res.status(200).json({
      id: bookingId,
      status,
      message: 'Booking status updated successfully'
    });
  } catch (error) {
    console.error('予約ステータス更新エラー:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to update booking status'
    });
  }
});

/**
 * ユーザーがアテンダーかどうかを確認する関数
 */
async function checkIfUserIsAttender(userId: string, attenderId: string): Promise<boolean> {
  try {
    const attenderSnapshot = await db.collection('attenders')
      .where('userId', '==', userId)
      .limit(1)
      .get();
    
    if (attenderSnapshot.empty) {
      return false;
    }
    
    // ユーザーがアテンダーであり、かつ該当の予約のアテンダーであるかチェック
    return attenderSnapshot.docs[0].id === attenderId;
  } catch (error) {
    console.error('アテンダー確認エラー:', error);
    return false;
  }
}

/**
 * 予約通知を送信する関数
 */
async function sendBookingNotification(attenderId: string, userId: string, bookingId: string): Promise<void> {
  try {
    // アテンダーの情報を取得
    const attenderDoc = await db.collection('attenders').doc(attenderId).get();
    const attenderData = attenderDoc.data();
    
    if (!attenderData) {
      return;
    }
    
    const attenderUserId = attenderData.userId;
    
    // 通知データを作成
    const notificationData = {
      type: 'new_booking',
      userId: attenderUserId,
      bookingId,
      senderId: userId,
      title: '新しい予約リクエスト',
      message: '新しい予約リクエストが届きました。確認してください。',
      isRead: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    // 通知をFirestoreに保存
    await db.collection('notifications').add(notificationData);
    
    // FCM通知の送信（実装例）
    // ここにFCM通知の送信処理を追加
  } catch (error) {
    console.error('予約通知送信エラー:', error);
  }
}

/**
 * ステータス変更通知を送信する関数
 */
async function sendStatusChangeNotification(bookingId: string, status: string, initiator: 'user' | 'attender'): Promise<void> {
  try {
    // 予約情報を取得
    const bookingDoc = await db.collection('bookings').doc(bookingId).get();
    const bookingData = bookingDoc.data();
    
    if (!bookingData) {
      return;
    }
    
    // 通知先のユーザーID
    const recipientId = initiator === 'user' 
      ? await getAttenderUserId(bookingData.attenderId) 
      : bookingData.userId;
    
    if (!recipientId) {
      return;
    }
    
    // ステータスに応じたメッセージを設定
    let title = '';
    let message = '';
    
    switch (status) {
      case 'confirmed':
        title = '予約が確定しました';
        message = `予約ID: ${bookingId} が確定されました。`;
        break;
      case 'completed':
        title = '予約が完了しました';
        message = `予約ID: ${bookingId} が完了しました。レビューを投稿してください。`;
        break;
      case 'cancelled':
        title = '予約がキャンセルされました';
        message = `予約ID: ${bookingId} がキャンセルされました。理由: ${bookingData.cancelReason || '理由なし'}`;
        break;
      default:
        title = '予約ステータスが更新されました';
        message = `予約ID: ${bookingId} のステータスが ${status} に更新されました。`;
    }
    
    // 通知データを作成
    const notificationData = {
      type: 'booking_status_change',
      userId: recipientId,
      bookingId,
      senderId: initiator === 'user' ? bookingData.userId : await getAttenderUserId(bookingData.attenderId),
      title,
      message,
      isRead: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    // 通知をFirestoreに保存
    await db.collection('notifications').add(notificationData);
    
    // FCM通知の送信（実装例）
    // ここにFCM通知の送信処理を追加
  } catch (error) {
    console.error('ステータス変更通知送信エラー:', error);
  }
}

/**
 * アテンダーのユーザーIDを取得する関数
 */
async function getAttenderUserId(attenderId: string): Promise<string | null> {
  try {
    const attenderDoc = await db.collection('attenders').doc(attenderId).get();
    const attenderData = attenderDoc.data();
    
    if (!attenderData) {
      return null;
    }
    
    return attenderData.userId;
  } catch (error) {
    console.error('アテンダーユーザーID取得エラー:', error);
    return null;
  }
}

export default router;
