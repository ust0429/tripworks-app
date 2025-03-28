/**
 * Reviews Router
 * 
 * レビュー関連のエンドポイントを定義します。
 */
import express from 'express';
import { AuthenticatedRequest, verifyOwnership } from '../middleware/authMiddleware';
import * as admin from 'firebase-admin';

const router = express.Router();
const db = admin.firestore();

/**
 * レビュー一覧を取得
 * クエリパラメータで絞り込み可能:
 * - attenderId: アテンダーID
 * - experienceId: 体験ID
 * - userId: ユーザーID（自分のレビューのみ）
 * - limit: 取得件数（デフォルト10件）
 */
router.get('/', async (req: AuthenticatedRequest, res) => {
  try {
    const { attenderId, experienceId, limit = 10 } = req.query;
    const userId = req.user?.uid;

    // クエリの基本設定
    let query: FirebaseFirestore.Query = db.collection('reviews');

    // フィルタリング条件の適用
    if (attenderId) {
      query = query.where('attenderId', '==', attenderId);
    }

    if (experienceId) {
      query = query.where('experienceId', '==', experienceId);
    }

    // ユーザーIDが指定された場合は、自分のレビューのみ取得
    if (req.query.userId) {
      // 他のユーザーのIDは指定できない（セキュリティ対策）
      if (req.query.userId !== userId) {
        return res.status(403).json({
          error: 'Access denied',
          message: 'You can only retrieve your own reviews when filtering by userId'
        });
      }
      query = query.where('userId', '==', userId);
    }

    // 最新順に並べ替え
    query = query.orderBy('createdAt', 'desc');

    // 件数制限
    query = query.limit(Number(limit));

    // クエリ実行
    const snapshot = await query.get();

    // レスポンスデータの整形
    const reviews = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.status(200).json(reviews);
  } catch (error) {
    console.error('レビュー一覧取得エラー:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to retrieve reviews'
    });
  }
});

/**
 * 特定のレビューの詳細を取得
 */
router.get('/:id', async (req, res) => {
  try {
    const reviewId = req.params.id;
    
    const doc = await db.collection('reviews').doc(reviewId).get();
    
    if (!doc.exists) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Review not found'
      });
    }
    
    res.status(200).json({
      id: doc.id,
      ...doc.data()
    });
  } catch (error) {
    console.error('レビュー詳細取得エラー:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to retrieve review details'
    });
  }
});

/**
 * 新規レビューを投稿
 */
router.post('/', async (req: AuthenticatedRequest, res) => {
  try {
    const { attenderId, experienceId, rating, comment, photos } = req.body;
    const userId = req.user?.uid;
    
    // 必須項目の検証
    if (!attenderId) {
      return res.status(400).json({
        error: 'Bad request',
        message: 'attenderId is required'
      });
    }
    
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        error: 'Bad request',
        message: 'rating must be between 1 and 5'
      });
    }
    
    if (!comment || comment.trim().length === 0) {
      return res.status(400).json({
        error: 'Bad request',
        message: 'comment is required'
      });
    }
    
    // ユーザー情報の取得
    const userDoc = await admin.auth().getUser(userId!);
    
    // 新規レビューデータの作成
    const reviewData = {
      userId,
      attenderId,
      experienceId: experienceId || null,
      rating,
      comment,
      photos: photos || [],
      helpfulCount: 0,
      replyCount: 0,
      userDisplayName: userDoc.displayName || '匿名ユーザー',
      userPhotoUrl: userDoc.photoURL || null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    // Firestoreに保存
    const docRef = await db.collection('reviews').add(reviewData);
    
    // アテンダーの評価平均を更新
    await updateAttenderRating(attenderId);
    
    // 体験の評価平均を更新（体験IDがある場合）
    if (experienceId) {
      await updateExperienceRating(experienceId);
    }
    
    res.status(201).json({
      id: docRef.id,
      message: 'Review created successfully'
    });
  } catch (error) {
    console.error('レビュー作成エラー:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to create review'
    });
  }
});

/**
 * レビューを更新
 */
router.put('/:id', verifyOwnership('review'), async (req: AuthenticatedRequest, res) => {
  try {
    const reviewId = req.params.id;
    const { rating, comment, photos } = req.body;
    
    // 更新データの検証
    const updateData: Record<string, any> = {
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    if (rating !== undefined) {
      if (rating < 1 || rating > 5) {
        return res.status(400).json({
          error: 'Bad request',
          message: 'rating must be between 1 and 5'
        });
      }
      updateData.rating = rating;
    }
    
    if (comment !== undefined) {
      if (comment.trim().length === 0) {
        return res.status(400).json({
          error: 'Bad request',
          message: 'comment cannot be empty'
        });
      }
      updateData.comment = comment;
    }
    
    if (photos !== undefined) {
      updateData.photos = photos;
    }
    
    // レビューの更新
    await db.collection('reviews').doc(reviewId).update(updateData);
    
    // レビュー情報を取得
    const updatedDoc = await db.collection('reviews').doc(reviewId).get();
    const reviewData = updatedDoc.data();
    
    // アテンダーの評価平均を更新
    if (reviewData && reviewData.attenderId) {
      await updateAttenderRating(reviewData.attenderId);
    }
    
    // 体験の評価平均を更新
    if (reviewData && reviewData.experienceId) {
      await updateExperienceRating(reviewData.experienceId);
    }
    
    res.status(200).json({
      id: reviewId,
      message: 'Review updated successfully'
    });
  } catch (error) {
    console.error('レビュー更新エラー:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to update review'
    });
  }
});

/**
 * レビューを削除
 */
router.delete('/:id', verifyOwnership('review'), async (req, res) => {
  try {
    const reviewId = req.params.id;
    
    // レビュー情報を取得（削除前に取得しておく）
    const reviewDoc = await db.collection('reviews').doc(reviewId).get();
    const reviewData = reviewDoc.data();
    
    // レビューを削除
    await db.collection('reviews').doc(reviewId).delete();
    
    // アテンダーの評価平均を更新
    if (reviewData && reviewData.attenderId) {
      await updateAttenderRating(reviewData.attenderId);
    }
    
    // 体験の評価平均を更新
    if (reviewData && reviewData.experienceId) {
      await updateExperienceRating(reviewData.experienceId);
    }
    
    res.status(200).json({
      message: 'Review deleted successfully'
    });
  } catch (error) {
    console.error('レビュー削除エラー:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to delete review'
    });
  }
});

/**
 * レビューに「役に立った」を追加
 */
router.post('/:id/helpful', async (req: AuthenticatedRequest, res) => {
  try {
    const reviewId = req.params.id;
    const userId = req.user?.uid;
    
    if (!userId) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required'
      });
    }
    
    // レビューの存在確認
    const reviewDoc = await db.collection('reviews').doc(reviewId).get();
    
    if (!reviewDoc.exists) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Review not found'
      });
    }
    
    const reviewData = reviewDoc.data();
    
    // 自分のレビューには「役に立った」をつけられないようにする
    if (reviewData?.userId === userId) {
      return res.status(400).json({
        error: 'Bad request',
        message: 'Cannot mark your own review as helpful'
      });
    }
    
    // すでに「役に立った」をつけたかをチェック
    const helpfulDoc = await db.collection('helpful_marks')
      .where('reviewId', '==', reviewId)
      .where('userId', '==', userId)
      .limit(1)
      .get();
    
    if (!helpfulDoc.empty) {
      return res.status(400).json({
        error: 'Bad request',
        message: 'You have already marked this review as helpful'
      });
    }
    
    // トランザクションで「役に立った」を追加
    await db.runTransaction(async (transaction) => {
      // 「役に立った」マークを記録
      const helpfulMarkRef = db.collection('helpful_marks').doc();
      transaction.set(helpfulMarkRef, {
        reviewId,
        userId,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      // レビューの「役に立った」カウントを増やす
      transaction.update(reviewDoc.ref, {
        helpfulCount: admin.firestore.FieldValue.increment(1),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    });
    
    res.status(200).json({
      message: 'Marked as helpful successfully'
    });
  } catch (error) {
    console.error('「役に立った」追加エラー:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to mark review as helpful'
    });
  }
});

/**
 * アテンダーの評価平均を更新する関数
 */
async function updateAttenderRating(attenderId: string): Promise<void> {
  // アテンダーのレビューを取得
  const reviewsSnapshot = await db.collection('reviews')
    .where('attenderId', '==', attenderId)
    .get();
  
  // レビューがない場合は何もしない
  if (reviewsSnapshot.empty) {
    return;
  }
  
  // 評価の合計と数を計算
  let totalRating = 0;
  const reviews = reviewsSnapshot.docs;
  
  reviews.forEach(doc => {
    const data = doc.data();
    totalRating += data.rating || 0;
  });
  
  // 平均評価を計算
  const averageRating = totalRating / reviews.length;
  
  // アテンダーの評価を更新
  await db.collection('attenders').doc(attenderId).update({
    averageRating,
    reviewCount: reviews.length,
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  });
}

/**
 * 体験の評価平均を更新する関数
 */
async function updateExperienceRating(experienceId: string): Promise<void> {
  // 体験のレビューを取得
  const reviewsSnapshot = await db.collection('reviews')
    .where('experienceId', '==', experienceId)
    .get();
  
  // レビューがない場合は何もしない
  if (reviewsSnapshot.empty) {
    return;
  }
  
  // 評価の合計と数を計算
  let totalRating = 0;
  const reviews = reviewsSnapshot.docs;
  
  reviews.forEach(doc => {
    const data = doc.data();
    totalRating += data.rating || 0;
  });
  
  // 平均評価を計算
  const averageRating = totalRating / reviews.length;
  
  // 体験の評価を更新
  await db.collection('experiences').doc(experienceId).update({
    averageRating,
    reviewCount: reviews.length,
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  });
}

export default router;
