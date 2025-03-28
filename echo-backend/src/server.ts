/**
 * Echo アプリケーションのサーバー
 */
import app from './app';

// ポート設定
const port = process.env.PORT || 8080;

// サーバー起動
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
