import express from 'express';
import attenderRoutes from './attenders';
import reviewRoutes from './reviews';
import bookingRoutes from './bookings';
import { verifyAuth, requireRoles, verifyAttender } from '../middleware/authMiddleware';

const router = express.Router();

// ヘルスチェックエンドポイント - 認証不要
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Echo API is running' });
});

// 認証が必要なAPIルート
router.use('/attenders', verifyAuth, attenderRoutes);
router.use('/reviews', verifyAuth, reviewRoutes);
router.use('/bookings', verifyAuth, bookingRoutes);

// 管理者専用ルート
router.use('/admin', verifyAuth, requireRoles(['admin']), (req, res) => {
  res.status(200).json({ message: 'Admin API access granted' });
});

// アテンダー専用ルート
router.use('/attender-dashboard', verifyAuth, verifyAttender, (req, res) => {
  res.status(200).json({ 
    message: 'Attender API access granted',
    attender: (req as any).attender
  });
});

export default router;