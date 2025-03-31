// /echo-backend/src/index.js または app.js
const express = require("express");
const cors = require("cors");
const app = express();

// 許可するオリジンの設定
const allowedOrigins = [
  "http://localhost:3000", // 開発環境
  "https://echo-app.com", // 本番環境
];

// CORS オプションの設定
const corsOptions = {
  origin: function (origin, callback) {
    // origin が undefined の場合は同一オリジンからのリクエスト
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("CORS policy: Origin not allowed"));
    }
  },
  credentials: true, // クッキーを含むリクエストを許可
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
};

// CORS ミドルウェアを適用
app.use(cors(corsOptions));

// その他のミドルウェアやルートの設定
app.use(express.json());
// ...
