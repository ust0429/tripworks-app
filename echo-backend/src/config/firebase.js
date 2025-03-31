// /echo-backend/src/config/firebase.js
const admin = require("firebase-admin");
const path = require("path");
const fs = require("fs");

// 環境変数から取得するか、デフォルトパスを使用
const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || 
                          path.join(__dirname, "../../config/echo-app-staging-de2e41155ae3.json");

// ファイルの存在確認
if (!fs.existsSync(serviceAccountPath)) {
  console.error(`Firebase サービスアカウントファイルが見つかりません: ${serviceAccountPath}`);
  process.exit(1);
}

const serviceAccount = require(serviceAccountPath);

// Firebase Admin の初期化
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIREBASE_DATABASE_URL || `https://${serviceAccount.project_id}.firebaseio.com`,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || `${serviceAccount.project_id}.appspot.com`,
});

module.exports = {
  admin,
  firestore: admin.firestore(),
  auth: admin.auth(),
  storage: admin.storage(),
};
