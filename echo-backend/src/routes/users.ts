/**
 * Users Router
 * 
 * ユーザー関連のエンドポイントを定義します。
 */
import express from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import * as admin from 'firebase-admin';

const router = express.Router();
const db = admin.firestore();

/**
 * 自分のプロフィール情報を取得
 */
router.get('/profile', async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user?.uid;
    
    if (!userId) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required'
      });
    }
    
    // Firestoreからユーザー情報を取得
    const userDoc = await db.collection('users').doc(userId).get();
    
    // Firebaseの認証情報も取得
    const userRecord = await admin.auth().getUser(userId);
    
    // レスポンスデータの作成
    const userData = {
      id: userId,
      email: userRecord.email,
      displayName: userRecord.displayName,
      photoURL: userRecord.photoURL,
      ...(userDoc.exists ? userDoc.data() : {}),
    };
    
    res.status(200).json(userData);
  } catch (error) {
    console.error('プロフィール取得エラー:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to retrieve user profile'
    });
  }
});

/**
 * プロフィール情報を更新
 */
router.put('/profile', async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user?.uid;
    
    if (!userId) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required'
      });
    }
    
    // リクエストボディから更新データを取得
    const { displayName, photoURL, ...firestoreData } = req.body;
    
    // Firebase Authentication情報を更新
    if (displayName !== undefined || photoURL !== undefined) {
      const authUpdateData: any = {};
      if (displayName !== undefined) authUpdateData.displayName = displayName;
      if (photoURL !== undefined) authUpdateData.photoURL = photoURL;
      
      await admin.auth().updateUser(userId, authUpdateData);
    }
    
    // Firestoreデータを更新
    const updateData = {
      ...firestoreData,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    await db.collection('users').doc(userId).set(updateData, { merge: true });
    
    res.status(200).json({
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('プロフィール更新エラー:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to update user profile'
    });
  }
});

/**
 * 自分のアテンダー情報を取得
 */
router.get('/me/attender', async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user?.uid;
    
    if (!userId) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required'
      });
    }
    
    // ユーザーのドキュメントからアテンダーIDを取得
    const userDoc = await db.collection('users').doc(userId).get();
    
    if (!userDoc.exists || !userDoc.data()?.attenderId) {
      // ユーザーがアテンダーではない場合は404を返す
      return res.status(404).json({
        error: 'Not found',
        message: 'User is not registered as an attender'
      });
    }
    
    const attenderId = userDoc.data()?.attenderId;
    
    // アテンダー情報を取得
    const attenderDoc = await db.collection('attenders').doc(attenderId).get();
    
    if (!attenderDoc.exists) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Attender not found'
      });
    }
    
    // レスポンスデータの作成
    const attenderData = {
      id: attenderDoc.id,
      ...attenderDoc.data()
    };
    
    res.status(200).json(attenderData);
  } catch (error) {
    console.error('アテンダー情報取得エラー:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to retrieve attender information'
    });
  }
});

export default router;
