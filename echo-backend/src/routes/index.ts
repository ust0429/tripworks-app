/**
 * API Routes
 * 
 * アプリケーションのAPI経路を定義します。
 */
import express from 'express';
import { verifyAuth, requireRoles, verifyAttender } from '../middleware/authMiddleware';

// ルーターの初期化
const router = express.Router();

// 認証が必要なルートグループ
// 認証が必要なルートにはすべてverifyAuthミドルウェアを適用
router.use('/attenders', verifyAuth);
router.use('/bookings', verifyAuth);
router.use('/reviews', verifyAuth);
router.use('/users/profile', verifyAuth);
router.use('/uploads', verifyAuth);

// 特定の役割が必要なルートグループ
// 管理者専用ルート
router.use('/admin', verifyAuth, requireRoles(['admin']));

// アテンダー専用ルート
// アテンダーが提供する体験の管理など
router.use('/attenders/:id/experiences', verifyAuth, verifyAttender);

// 個別のルーターをインポート
// ユーザールーターはまだ実装されていません
import attenderRoutes from './attenders';
import bookingRoutes from './bookings';
import reviewRoutes from './reviews';
import userRoutes from './users';
import uploadRoutes from './uploads';

// ルーターをマウント
router.use('/attenders', attenderRoutes);
router.use('/bookings', bookingRoutes);
router.use('/reviews', reviewRoutes);
router.use('/users', userRoutes);
router.use('/uploads', uploadRoutes);

// ヘルスチェックエンドポイント
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// バージョン情報
router.get('/version', (req, res) => {
  res.status(200).json({
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

export default router;
