/**
 * ファイルアップロードAPI
 * 
 * ファイルアップロード関連のAPIエンドポイントを定義します。
 * Firebase Storageと連携して、ファイルのアップロードおよび管理を行います。
 */
import express, { Request, Response } from 'express';
import { admin, db } from '../config/firebase';
import { verifyAuth } from '../middleware/authMiddleware';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { format } from 'date-fns';

const router = express.Router();

// アップロードディレクトリ設定
enum UploadDirectory {
  PROFILES = 'profiles',
  REVIEWS = 'reviews',
  EXPERIENCES = 'experiences',
}

// メモリストレージを使用（Cloud Storageへの転送用）
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    // 許可するファイルタイプ
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('不正なファイル形式です。JPEG, PNG, GIF のみ許可されています。'));
    }
  },
});

/**
 * 安全なファイル名を生成
 */
function generateSafeFileName(originalname: string): string {
  const date = format(new Date(), 'yyyyMMdd');
  const uuid = uuidv4();
  const ext = path.extname(originalname).toLowerCase();
  return `${date}_${uuid}${ext}`;
}

/**
 * ファイルをFirebase Storageにアップロード
 */
async function uploadToFirebaseStorage(
  file: Express.Multer.File,
  directory: UploadDirectory,
  userId: string
): Promise<{ url: string; path: string }> {
  // Cloud Storageバケットの取得
  const bucket = admin.storage().bucket();
  
  // 安全なファイル名の生成
  const fileName = generateSafeFileName(file.originalname);
  
  // ストレージパスの構築
  const storagePath = `${directory}/${userId}/${fileName}`;
  
  // ファイルオブジェクトの作成
  const fileObject = bucket.file(storagePath);
  
  // メタデータの設定
  const metadata = {
    contentType: file.mimetype,
    metadata: {
      firebaseStorageDownloadTokens: uuidv4(),
    },
  };
  
  // ファイルのアップロード
  await fileObject.save(file.buffer, {
    metadata,
    contentType: file.mimetype,
    public: true,
  });
  
  // 公開URLの取得
  const publicUrl = `https://storage.googleapis.com/${bucket.name}/${storagePath}`;
  
  return {
    url: publicUrl,
    path: storagePath
  };
}

/**
 * プロフィール画像アップロードエンドポイント
 */
router.post('/profile', verifyAuth, upload.single('file'), async (req: Request, res: Response) => {
  try {
    const userId = req.user?.uid;
    
    if (!userId) {
      return res.status(401).json({ success: false, error: '認証が必要です' });
    }
    
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'ファイルがアップロードされていません' });
    }
    
    const { url, path } = await uploadToFirebaseStorage(
      req.file,
      UploadDirectory.PROFILES,
      userId
    );
    
    // ユーザープロフィールの更新
    await db.collection('users').doc(userId).update({
      profilePhotoUrl: url,
      profilePhotoPath: path,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    
    return res.status(200).json({
      success: true,
      data: { url, path }
    });
  } catch (error) {
    console.error('プロフィール画像アップロードエラー:', error);
    return res.status(500).json({
      success: false,
      error: '画像のアップロード中にエラーが発生しました'
    });
  }
});

/**
 * レビュー画像アップロードエンドポイント
 */
router.post('/review', verifyAuth, upload.single('file'), async (req: Request, res: Response) => {
  try {
    const userId = req.user?.uid;
    
    if (!userId) {
      return res.status(401).json({ success: false, error: '認証が必要です' });
    }
    
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'ファイルがアップロードされていません' });
    }
    
    const { url, path } = await uploadToFirebaseStorage(
      req.file,
      UploadDirectory.REVIEWS,
      userId
    );
    
    return res.status(200).json({
      success: true,
      data: { url, path }
    });
  } catch (error) {
    console.error('レビュー画像アップロードエラー:', error);
    return res.status(500).json({
      success: false,
      error: '画像のアップロード中にエラーが発生しました'
    });
  }
});

/**
 * 体験画像アップロードエンドポイント
 */
router.post('/experience', verifyAuth, upload.single('file'), async (req: Request, res: Response) => {
  try {
    const userId = req.user?.uid;
    
    if (!userId) {
      return res.status(401).json({ success: false, error: '認証が必要です' });
    }
    
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'ファイルがアップロードされていません' });
    }
    
    // アテンダーIDの検証
    const attenderSnapshot = await db.collection('attenders')
      .where('userId', '==', userId)
      .limit(1)
      .get();
    
    if (attenderSnapshot.empty) {
      return res.status(403).json({
        success: false,
        error: 'アテンダー権限がありません'
      });
    }
    
    const attenderId = attenderSnapshot.docs[0].id;
    
    const { url, path } = await uploadToFirebaseStorage(
      req.file,
      UploadDirectory.EXPERIENCES,
      attenderId
    );
    
    return res.status(200).json({
      success: true,
      data: { url, path }
    });
  } catch (error) {
    console.error('体験画像アップロードエラー:', error);
    return res.status(500).json({
      success: false,
      error: '画像のアップロード中にエラーが発生しました'
    });
  }
});

/**
 * 複数画像アップロードエンドポイント（レビュー用）
 */
router.post('/reviews/multiple', verifyAuth, upload.array('files', 5), async (req: Request, res: Response) => {
  try {
    const userId = req.user?.uid;
    
    if (!userId) {
      return res.status(401).json({ success: false, error: '認証が必要です' });
    }
    
    const files = req.files as Express.Multer.File[];
    
    if (!files || files.length === 0) {
      return res.status(400).json({ success: false, error: 'ファイルがアップロードされていません' });
    }
    
    const uploadResults = await Promise.all(
      files.map(file => uploadToFirebaseStorage(file, UploadDirectory.REVIEWS, userId))
    );
    
    return res.status(200).json({
      success: true,
      data: uploadResults
    });
  } catch (error) {
    console.error('複数画像アップロードエラー:', error);
    return res.status(500).json({
      success: false,
      error: '画像のアップロード中にエラーが発生しました'
    });
  }
});

/**
 * 複数画像アップロードエンドポイント（体験用）
 */
router.post('/experiences/multiple', verifyAuth, upload.array('files', 10), async (req: Request, res: Response) => {
  try {
    const userId = req.user?.uid;
    
    if (!userId) {
      return res.status(401).json({ success: false, error: '認証が必要です' });
    }
    
    // アテンダーIDの検証
    const attenderSnapshot = await db.collection('attenders')
      .where('userId', '==', userId)
      .limit(1)
      .get();
    
    if (attenderSnapshot.empty) {
      return res.status(403).json({
        success: false,
        error: 'アテンダー権限がありません'
      });
    }
    
    const attenderId = attenderSnapshot.docs[0].id;
    
    const files = req.files as Express.Multer.File[];
    
    if (!files || files.length === 0) {
      return res.status(400).json({ success: false, error: 'ファイルがアップロードされていません' });
    }
    
    const uploadResults = await Promise.all(
      files.map(file => uploadToFirebaseStorage(file, UploadDirectory.EXPERIENCES, attenderId))
    );
    
    return res.status(200).json({
      success: true,
      data: uploadResults
    });
  } catch (error) {
    console.error('複数画像アップロードエラー:', error);
    return res.status(500).json({
      success: false,
      error: '画像のアップロード中にエラーが発生しました'
    });
  }
});

export default router;
