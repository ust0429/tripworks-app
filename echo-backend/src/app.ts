/**
 * Echo アプリケーションのバックエンド
 */
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import * as admin from 'firebase-admin';
import dotenv from 'dotenv';

// 環境変数の読み込み
dotenv.config();

// ルーターのインポート
import apiRoutes from './routes';
import { notFoundHandler, globalErrorHandler } from './middleware/errorMiddleware';

// Firebase Admin SDKの初期化
try {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(), // GOOGLE_APPLICATION_CREDENTIALS環境変数を使用
  });
  console.log('Firebase Admin SDK initialized successfully');
} catch (error) {
  console.error('Error initializing Firebase Admin SDK:', error);
  // 重大なエラーの場合はプロセスを終了
  process.exit(1);
}

// Expressアプリケーションの作成
const app = express();

// ミドルウェアの設定
// セキュリティヘッダーの追加
app.use(helmet());

// CORSの設定
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// リクエストボディのパース
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 応答圧縮
app.use(compression());

// リクエストログ
const morganFormat = process.env.NODE_ENV === 'production' ? 'combined' : 'dev';
app.use(morgan(morganFormat));

// APIルートの設定
app.use('/api', apiRoutes);

// 404ハンドラー
app.use(notFoundHandler);

// グローバルエラーハンドラー
app.use(globalErrorHandler);

export default app;
