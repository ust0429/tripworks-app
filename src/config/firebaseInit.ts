/**
 * Firebase初期化ファイル
 * アプリケーション起動時に最初に読み込まれる必要があります
 */

import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

console.log("Firebase initialization started");

// 環境変数から読み込み、正確に設定されていない場合は直接値を使用
const apiKey = process.env.REACT_APP_FIREBASE_API_KEY || 'AIzaSyDJq7WffFBEjxQJa1Z0fOHAqRV3QmWo9EI';
const authDomain = process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || 'echo-app-demo.firebaseapp.com';
const projectId = process.env.REACT_APP_FIREBASE_PROJECT_ID || 'echo-app-demo';
const storageBucket = process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || 'echo-app-demo.appspot.com';
const messagingSenderId = process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || '365427715876';
const appId = process.env.REACT_APP_FIREBASE_APP_ID || '1:365427715876:web:dcf45db3c5d8a4ce1b3fd2';

// Firebase設定
const firebaseConfig = {
  apiKey,
  authDomain,
  projectId,
  storageBucket,
  messagingSenderId,
  appId
};

// デバッグ用に環境変数を出力
console.log("Firebase Config:", { 
  apiKey: apiKey ? "[Set]" : "[NOT SET]",
  authDomain: authDomain ? "[Set]" : "[NOT SET]",
  projectId: projectId ? "[Set]" : "[NOT SET]",
  storageBucket: storageBucket ? "[Set]" : "[NOT SET]",
  messagingSenderId: messagingSenderId ? "[Set]" : "[NOT SET]",
  appId: appId ? "[Set]" : "[NOT SET]"
});

// すでに初期化されているかチェック
const existingApps = getApps();
const app = existingApps.length > 0 
  ? existingApps[0] 
  : initializeApp(firebaseConfig);

// 各サービスを初期化
const auth = getAuth(app);
const firestore = getFirestore(app);
const storage = getStorage(app);

console.log("Firebase initialization completed");

export { app, auth, firestore, storage };
export default app;
