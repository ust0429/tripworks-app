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
 * リソース所有権を検証するミドルウェア
 * 
 * @param resourceType リソースタイプ（'review', 'booking'など）
 * @param idParamName URLパラメータ内のリソースID名
 */
export function verifyOwnership(resourceType: string, idParamName: string = 'id') {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const userId = req.user.uid;
      const resourceId = req.params[idParamName];
      
      if (!resourceId) {
        return res.status(400).json({ error: `Resource ID parameter '${idParamName}' is missing` });
      }
      
      // リソースタイプに応じたコレクション名を取得
      let collectionName: string;
      switch (resourceType) {
        case 'review':
          collectionName = 'reviews';
          break;
        case 'booking':
          collectionName = 'bookings';
          break;
        default:
          collectionName = resourceType + 's'; // 単純な複数形
      }
      
      // Firestoreでリソースを検索
      const resourceRef = admin.firestore().collection(collectionName).doc(resourceId);
      const doc = await resourceRef.get();
      
      if (!doc.exists) {
        return res.status(404).json({ error: `${resourceType} not found` });
      }
      
      const data = doc.data();
      
      // リソースの所有者を確認
      if (data?.userId !== userId) {
        return res.status(403).json({ 
          error: 'Access denied',
          message: `You do not have permission to access this ${resourceType}`
        });
      }
      
      next();
    } catch (error) {
      console.error(`Ownership verification failed for ${resourceType}:`, error);
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
