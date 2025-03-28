import express from 'express';
import * as admin from 'firebase-admin';
import { AuthenticatedRequest, verifyOwnership } from '../middleware/authMiddleware';

const router = express.Router();

// レビュー一覧の取得
router.get('/', async (req, res) => {
  try {
    const { experienceId, attenderId, userId, limit = 10 } = req.query;
    
    let reviewsRef = admin.firestore().collection('reviews');
    
    // フィルタリング
    if (experienceId) {
      reviewsRef = reviewsRef.where('experienceId', '==', experienceId);
    }
    
    if (attenderId) {
      reviewsRef = reviewsRef.where('attenderId', '==', attenderId);
    }
    
    if (userId) {
      reviewsRef = reviewsRef.where('userId', '==', userId);
    }
    
    // 並び替えとページネーション
    const snapshot = await reviewsRef
      .orderBy('createdAt', 'desc')
      .limit(Number(limit))
      .get();
    
    const reviews = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    res.status(200).json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

// 特定のレビュー取得
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const reviewDoc = await admin.firestore().collection('reviews').doc(id).get();
    
    if (!reviewDoc.exists) {
      return res.status(404).json({ error: 'Review not found' });
    }
    
    res.status(200).json({
      id: reviewDoc.id,
      ...reviewDoc.data()
    });
  } catch (error) {
    console.error('Error fetching review:', error);
    res.status(500).json({ error: 'Failed to fetch review' });
  }
});

// レビュー投稿
router.post('/', async (req: AuthenticatedRequest, res) => {
  try {
    // 現在のユーザーID取得
    const userId = req.user?.uid;
    
    if (!userId) {
      return res.status(401).json({ error: 'User ID is required' });
    }
    
    const { experienceId, attenderId, rating, comment, photos } = req.body;
    
    // 必須フィールドのバリデーション
    if (!experienceId || !attenderId || !rating || !comment) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // レーティングの範囲チェック（1-5）
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }
    
    // 予約の確認 - ユーザーが実際に体験に参加したかを確認
    const bookingsRef = admin.firestore().collection('bookings')
      .where('userId', '==', userId)
      .where('experienceId', '==', experienceId)
      .where('attenderId', '==', attenderId)
      .where('status', '==', 'completed')
      .limit(1);
    
    const bookingsSnapshot = await bookingsRef.get();
    
    if (bookingsSnapshot.empty) {
      return res.status(403).json({ 
        error: 'Not eligible to review',
        message: 'You can only review experiences that you have completed'
      });
    }
    
    // ユーザー情報を取得して表示名や写真URLを含める
    const userDoc = await admin.firestore().collection('users').doc(userId).get();
    const userData = userDoc.data() || {};
    
    // レビューデータ作成
    const reviewData = {
      userId,
      experienceId,
      attenderId,
      rating,
      comment,
      photos: photos || [],
      helpfulCount: 0,
      replyCount: 0,
      userDisplayName: userData.displayName || 'Anonymous',
      userPhotoUrl: userData.photoURL || '',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    // データベースに保存
    const newReviewRef = await admin.firestore().collection('reviews').add(reviewData);
    
    // アテンダーの評価平均を更新
    const attenderRef = admin.firestore().collection('attenders').doc(attenderId);
    await admin.firestore().runTransaction(async (transaction) => {
      const attenderDoc = await transaction.get(attenderRef);
      
      if (!attenderDoc.exists) {
        throw new Error('Attender does not exist');
      }
      
      const attenderData = attenderDoc.data() || {};
      const currentRatingSum = (attenderData.ratingSum || 0);
      const currentRatingCount = (attenderData.ratingCount || 0);
      
      const newRatingSum = currentRatingSum + rating;
      const newRatingCount = currentRatingCount + 1;
      const newAverageRating = newRatingSum / newRatingCount;
      
      transaction.update(attenderRef, {
        ratingSum: newRatingSum,
        ratingCount: newRatingCount,
        averageRating: newAverageRating,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    });
    
    // アテンダーへの通知
    await admin.firestore().collection('notifications').add({
      userId: attenderId,
      type: 'new_review',
      title: '新しいレビューがあります',
      message: `${userData.displayName || 'ユーザー'}さんからレビューが投稿されました。`,
      reviewId: newReviewRef.id,
      isRead: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    res.status(201).json({ 
      id: newReviewRef.id,
      message: 'Review submitted successfully'
    });
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({ error: 'Failed to create review' });
  }
});

// レビュー更新
router.put('/:id', verifyOwnership('review'), async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment, photos } = req.body;
    
    // 必須フィールドの検証
    if (!rating || !comment) {
      return res.status(400).json({ error: 'Rating and comment are required' });
    }
    
    // レーティングの範囲チェック（1-5）
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }
    
    // レビュー取得
    const reviewRef = admin.firestore().collection('reviews').doc(id);
    const reviewDoc = await reviewRef.get();
    
    if (!reviewDoc.exists) {
      return res.status(404).json({ error: 'Review not found' });
    }
    
    const reviewData = reviewDoc.data();
    const attenderId = reviewData?.attenderId;
    const oldRating = reviewData?.rating || 0;
    
    // 更新データ
    const updateData = {
      rating,
      comment,
      photos: photos || reviewData?.photos || [],
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    // トランザクションで更新
    await admin.firestore().runTransaction(async transaction => {
      // レビュー更新
      transaction.update(reviewRef, updateData);
      
      // アテンダーの評価を更新
      if (rating !== oldRating && attenderId) {
        const attenderRef = admin.firestore().collection('attenders').doc(attenderId);
        const attenderDoc = await transaction.get(attenderRef);
        
        if (attenderDoc.exists) {
          const attenderData = attenderDoc.data() || {};
          const ratingSum = attenderData.ratingSum || 0;
          const ratingCount = attenderData.ratingCount || 0;
          
          // 古い評価を引いて、新しい評価を加える
          const newRatingSum = ratingSum - oldRating + rating;
          const newAverageRating = ratingCount > 0 ? newRatingSum / ratingCount : 0;
          
          transaction.update(attenderRef, {
            ratingSum: newRatingSum,
            averageRating: newAverageRating,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          });
        }
      }
    });
    
    res.status(200).json({
      id,
      message: 'Review updated successfully'
    });
  } catch (error) {
    console.error('Error updating review:', error);
    res.status(500).json({ error: 'Failed to update review' });
  }
});

// レビュー削除
router.delete('/:id', verifyOwnership('review'), async (req, res) => {
  try {
    const { id } = req.params;
    
    // レビュー取得
    const reviewRef = admin.firestore().collection('reviews').doc(id);
    const reviewDoc = await reviewRef.get();
    
    if (!reviewDoc.exists) {
      return res.status(404).json({ error: 'Review not found' });
    }
    
    const reviewData = reviewDoc.data();
    const attenderId = reviewData?.attenderId;
    const rating = reviewData?.rating || 0;
    
    // トランザクションで削除処理
    await admin.firestore().runTransaction(async transaction => {
      // レビュー削除
      transaction.delete(reviewRef);
      
      // アテンダーの評価を更新
      if (attenderId) {
        const attenderRef = admin.firestore().collection('attenders').doc(attenderId);
        const attenderDoc = await transaction.get(attenderRef);
        
        if (attenderDoc.exists) {
          const attenderData = attenderDoc.data() || {};
          const ratingSum = attenderData.ratingSum || 0;
          const ratingCount = attenderData.ratingCount || 0;
          
          if (ratingCount > 1) {
            // 評価を引いて、カウントを減らす
            const newRatingSum = ratingSum - rating;
            const newRatingCount = ratingCount - 1;
            const newAverageRating = newRatingSum / newRatingCount;
            
            transaction.update(attenderRef, {
              ratingSum: newRatingSum,
              ratingCount: newRatingCount,
              averageRating: newAverageRating,
              updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });
          } else {
            // レビューが1つだけの場合はゼロにリセット
            transaction.update(attenderRef, {
              ratingSum: 0,
              ratingCount: 0,
              averageRating: 0,
              updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });
          }
        }
      }
    });
    
    res.status(200).json({
      message: 'Review deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ error: 'Failed to delete review' });
  }
});

// 「役に立った」とマークする
router.post('/:id/helpful', async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    
    // 現在のユーザーID取得
    const userId = req.user?.uid;
    
    if (!userId) {
      return res.status(401).json({ error: 'User ID is required' });
    }
    
    const reviewRef = admin.firestore().collection('reviews').doc(id);
    const reviewDoc = await reviewRef.get();
    
    if (!reviewDoc.exists) {
      return res.status(404).json({ error: 'Review not found' });
    }
    
    const reviewData = reviewDoc.data();
    
    // 自分のレビューには「役に立った」をつけられないようにする
    if (reviewData?.userId === userId) {
      return res.status(400).json({ 
        error: 'Cannot mark own review',
        message: 'You cannot mark your own review as helpful'
      });
    }
    
    // 既に「役に立った」をつけているかチェック
    const helpfulUserRef = admin.firestore()
      .collection('reviewHelpful')
      .where('reviewId', '==', id)
      .where('userId', '==', userId);
    
    const helpfulSnapshot = await helpfulUserRef.get();
    
    if (!helpfulSnapshot.empty) {
      return res.status(400).json({ 
        error: 'Already marked',
        message: 'You have already marked this review as helpful'
      });
    }
    
    // 「役に立った」記録を作成
    await admin.firestore().collection('reviewHelpful').add({
      reviewId: id,
      userId,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    // レビューの「役に立った」カウントを増やす
    await reviewRef.update({
      helpfulCount: admin.firestore.FieldValue.increment(1),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    res.status(200).json({ message: 'Review marked as helpful' });
  } catch (error) {
    console.error('Error marking review as helpful:', error);
    res.status(500).json({ error: 'Failed to mark review as helpful' });
  }
});

export default router;