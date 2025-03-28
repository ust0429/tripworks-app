/**
 * エラーハンドリングミドルウェア
 * 
 * すべてのエラーを標準化された形式で処理します
 */
import { Request, Response, NextFunction } from 'express';

interface ErrorWithStatus extends Error {
  status?: number;
  code?: string;
}

/**
 * エラーハンドラーミドルウェア
 */
export const errorHandler = (
  err: ErrorWithStatus,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error('Error:', err);
  
  // デフォルトのエラー情報
  const statusCode = err.status || 500;
  const errorCode = err.code || 'INTERNAL_SERVER_ERROR';
  const errorMessage = err.message || '予期せぬエラーが発生しました';
  
  // 開発環境では詳細なエラー情報を返す
  const errorDetails = process.env.NODE_ENV === 'development' 
    ? {
        stack: err.stack,
        path: req.path,
        method: req.method,
        params: req.params,
        query: req.query,
        body: req.body,
      }
    : undefined;
  
  // エラーレスポンスを標準化
  res.status(statusCode).json({
    error: {
      code: errorCode,
      message: errorMessage,
      ...(errorDetails && { details: errorDetails })
    }
  });
};

// 非同期ルートハンドラのエラーをキャッチするためのユーティリティ関数
export const asyncHandler = (fn: Function) => (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default {
  errorHandler,
  asyncHandler
};