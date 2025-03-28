/**
 * エラーハンドリングミドルウェア
 * 
 * アプリケーション全体のエラーハンドリングを提供します。
 */
import { Request, Response, NextFunction } from 'express';

/**
 * 404エラーハンドラー
 * 存在しないルートへのアクセス時に呼び出されます。
 */
export function notFoundHandler(req: Request, res: Response, next: NextFunction): void {
  res.status(404).json({
    error: 'Not Found',
    message: `The requested resource at ${req.originalUrl} was not found`,
  });
}

/**
 * カスタムエラークラス
 * APIエラーの標準形式を提供します。
 */
export class ApiError extends Error {
  statusCode: number;
  details?: any;

  constructor(message: string, statusCode: number = 500, details?: any) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.details = details;
    
    // Errorクラスを正しく継承するためのES2015対応
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

/**
 * グローバルエラーハンドラー
 * すべての未処理エラーを処理します。
 */
export function globalErrorHandler(
  err: Error | ApiError, 
  req: Request, 
  res: Response, 
  next: NextFunction
): void {
  console.error('Error:', err);
  
  // エラーがApiErrorインスタンスの場合
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      error: err.name,
      message: err.message,
      ...(err.details && { details: err.details }),
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
  }
  
  // Firebase Admin SDK認証エラーの処理
  if (err.name === 'FirebaseAuthError') {
    return res.status(401).json({
      error: 'Authentication Error',
      message: 'Invalid or expired authentication token',
      ...(process.env.NODE_ENV === 'development' && { details: err.message }),
    });
  }
  
  // Firebase Firestore エラーの処理
  if (err.name === 'FirestoreError') {
    return res.status(500).json({
      error: 'Database Error',
      message: 'An error occurred while accessing the database',
      ...(process.env.NODE_ENV === 'development' && { details: err.message }),
    });
  }
  
  // その他のエラーの処理
  const statusCode = 500;  // デフォルトは500 Internal Server Error
  
  return res.status(statusCode).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production' 
      ? 'An unexpected error occurred' 
      : err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}

export default {
  notFoundHandler,
  globalErrorHandler,
  ApiError
};
