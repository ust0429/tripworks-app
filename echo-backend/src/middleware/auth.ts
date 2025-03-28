import { Request, Response, NextFunction } from 'express';
import * as admin from 'firebase-admin';

// リクエストにuidを追加するための型拡張
declare global {
  namespace Express {
    interface Request {
      uid?: string;
    }
  }
}

/**
 * Firebaseの認証トークンを検証するミドルウェア
 */
export const verifyToken = async (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'Authorization header is required' });
  }

  // Bearer トークンから実際のトークンを抽出
  const token = authHeader.split('Bearer ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Token is missing or invalid format' });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.uid = decodedToken.uid; // ユーザーIDをリクエストオブジェクトに追加
    next();
  } catch (error) {
    console.error('Error verifying token:', error);
    return res.status(403).json({ error: 'Invalid token' });
  }
};

/**
 * ユーザーが管理者であることを確認するミドルウェア
 * 注: 先にverifyTokenミドルウェアを適用する必要があります
 */
export const isAdmin = async (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  try {
    if (!req.uid) {
      return res.status(403).json({ error: 'Unauthorized access' });
    }

    // ユーザードキュメントを取得
    const userDoc = await admin.firestore().collection('users').doc(req.uid).get();
    
    if (!userDoc.exists) {
      return res.status(403).json({ error: 'User not found' });
    }
    
    const userData = userDoc.data();
    
    // 管理者権限をチェック
    if (userData?.isAdmin !== true) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    next();
  } catch (error) {
    console.error('Error checking admin status:', error);
    return res.status(500).json({ error: 'Failed to verify admin status' });
  }
};

/**
 * アテンダーであることを確認するミドルウェア
 * 注: 先にverifyTokenミドルウェアを適用する必要があります
 */
export const isAttender = async (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  try {
    if (!req.uid) {
      return res.status(403).json({ error: 'Unauthorized access' });
    }

    // アテンダードキュメントを取得
    const attenderQuery = await admin.firestore()
      .collection('attenders')
      .where('userId', '==', req.uid)
      .limit(1)
      .get();
    
    if (attenderQuery.empty) {
      return res.status(403).json({ error: 'Attender access required' });
    }
    
    next();
  } catch (error) {
    console.error('Error checking attender status:', error);
    return res.status(500).json({ error: 'Failed to verify attender status' });
  }
};

/**
 * 特定のアテンダーであることを確認するミドルウェア
 * 注: 先にverifyTokenミドルウェアを適用する必要があります
 */
export const isSpecificAttender = (attenderId: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.uid) {
        return res.status(403).json({ error: 'Unauthorized access' });
      }

      // アテンダードキュメントを取得
      const attenderDoc = await admin.firestore()
        .collection('attenders')
        .doc(attenderId)
        .get();
      
      if (!attenderDoc.exists) {
        return res.status(404).json({ error: 'Attender not found' });
      }
      
      const attenderData = attenderDoc.data();
      
      // ユーザーIDが一致するかチェック
      if (attenderData?.userId !== req.uid) {
        return res.status(403).json({ error: 'You do not have permission to access this resource' });
      }
      
      next();
    } catch (error) {
      console.error('Error checking attender ownership:', error);
      return res.status(500).json({ error: 'Failed to verify attender ownership' });
    }
  };
};