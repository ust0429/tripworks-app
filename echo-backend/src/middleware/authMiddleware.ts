/**
 * Firebase Authentication ミドルウェア
 * 
 * APIエンドポイントで認証を検証するためのExpressミドルウェア
 */
import { Request, Response, NextFunction } from 'express';
import * as admin from 'firebase-admin';

/**
 * 認証済みリクエスト用の拡張Request型
 */
export interface AuthenticatedRequest extends Request {
  user?: {
    uid: string;
    email?: string;
    role?: string;
  };
}

/**
 * Firebase認証トークンを検証して、ユーザー情報をrequestに追加するミドルウェア
 */
export function verifyAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'No authorization token provided' });
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ error: 'Invalid authorization header format' });
  }

  const token = parts[1];
  
  admin.auth().verifyIdToken(token)
    .then((decodedToken) => {
      req.user = {
        uid: decodedToken.uid,
        email: decodedToken.email,
        role: decodedToken.role
      };
      next();
    })
    .catch((error) => {
      console.error('Token verification failed:', error);
      res.status(401).json({ error: 'Invalid or expired token' });
    });
}

/**
 * 特定の役割を持つユーザーのみアクセスを許可するミドルウェア
 * 
 * @param roles 許可する役割の配列
 */
export function requireRoles(roles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const userRole = req.user.role || 'user';
    
    if (!roles.includes(userRole)) {
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        message: `This action requires one of the following roles: ${roles.join(', ')}`
      });
    }

    next();
  };
}

/**
 * アテンダー専用のアクセス検証ミドルウェア
 * ユーザーがアテンダーであるかをFirestoreで確認
 */
export async function verifyAttender(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const userId = req.user.uid;
    
    // Firestoreでアテンダー情報を検索
    const attendersRef = admin.firestore().collection('attenders');
    const snapshot = await attendersRef.where('userId', '==', userId).limit(1).get();
    
    if (snapshot.empty) {
      return res.status(403).json({ 
        error: 'Not an attender',
        message: 'This action requires attender privileges'
      });
    }

    // アテンダー情報をリクエストに追加
    const attenderDoc = snapshot.docs[0];
    (req as any).attender = {
      id: attenderDoc.id,
      ...attenderDoc.data()
    };

    next();
  } catch (error) {
    console.error('Attender verification failed:', error);
    res.status(500).json({ error: 'Failed to verify attender status' });
  }
}

/**
 * リソースの所有者を検証するミドルウェア
 * 特定のリソースに対して、所有者またはアドミンだけがアクセスできるようにする
 */
export function verifyOwnership(resourceType: string) {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const userId = req.user.uid;
      const resourceId = req.params.id;
      
      if (!resourceId) {
        return res.status(400).json({ error: 'Resource ID is required' });
      }
      
      // ユーザーがアドミンかどうか確認
      const userDoc = await admin.firestore().collection('users').doc(userId).get();
      const userData = userDoc.data();
      const isAdmin = userData?.role === 'admin';
      
      if (isAdmin) {
        // アドミンの場合は直接アクセスを許可
        return next();
      }
      
      // リソースタイプに基づいてコレクションを選択
      let collection: string;
      let ownerField: string = 'userId'; // デフォルトの所有者フィールド
      
      switch (resourceType) {
        case 'booking':
          collection = 'bookings';
          break;
        case 'review':
          collection = 'reviews';
          break;
        case 'experience':
          collection = 'experiences';
          break;
        case 'attender':
          collection = 'attenders';
          break;
        default:
          return res.status(400).json({ error: 'Invalid resource type' });
      }
      
      // リソースを取得
      const resourceDoc = await admin.firestore().collection(collection).doc(resourceId).get();
      
      if (!resourceDoc.exists) {
        return res.status(404).json({ error: `${resourceType} not found` });
      }
      
      const resourceData = resourceDoc.data();
      
      // 所有者を確認
      if (resourceData?.[ownerField] !== userId) {
        return res.status(403).json({ 
          error: 'Access denied',
          message: `You do not have permission to access this ${resourceType}`
        });
      }
      
      next();
    } catch (error) {
      console.error('Ownership verification failed:', error);
      res.status(500).json({ error: 'Failed to verify resource ownership' });
    }
  };
}

export default {
  verifyAuth,
  requireRoles,
  verifyAttender,
  verifyOwnership
};