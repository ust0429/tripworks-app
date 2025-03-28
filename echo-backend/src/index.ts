import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import * as admin from 'firebase-admin';
import dotenv from 'dotenv';
import routes from './routes';
import { errorHandler } from './middleware/errorHandler';

// 環境変数の読み込み
dotenv.config();

// Firebaseの初期化
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`
});

const app = express();
const port = process.env.PORT || 8080;

// ミドルウェア
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// リクエストロギング（開発環境のみ）
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
  });
}

// ヘルスチェックエンドポイント
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Echo API is running',
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'production'
  });
});

// APIルート
app.use('/api', routes);

// エラーハンドラー（すべてのルートの後に配置）
app.use(errorHandler);

// 404エラー処理
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Not found',
    message: `The requested resource '${req.path}' was not found`
  });
});

// サーバー起動
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'production'}`);
  console.log(`Version: ${process.env.npm_package_version || '1.0.0'}`);
});