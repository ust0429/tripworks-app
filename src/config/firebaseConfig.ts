/**
 * Firebase Configuration
 *
 * This file initializes Firebase services for use throughout the application.
 */
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Firebase configuration
// 環境変数から設定値を読み込む
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
};

// 環境変数が設定されていない場合のバックアップ対策
if (!firebaseConfig.apiKey && process.env.NODE_ENV === "development") {
  console.warn("環境変数からFirebase設定が読み込めません。デフォルトの開発設定を使用します。");
  
  // 開発環境用のバックアップ値
  firebaseConfig.apiKey = "AIzaSyCX09uglZ0ZFd7-VjRepwl1NMN4DBUWZeM";
  firebaseConfig.authDomain = "echo-app-staging.firebaseapp.com";
  firebaseConfig.projectId = "echo-app-staging";
  firebaseConfig.storageBucket = "echo-app-staging.firebasestorage.app";
  firebaseConfig.messagingSenderId = "188769376173";
  firebaseConfig.appId = "1:188769376173:web:bc67c0e82d2c68ec1bb324";
  firebaseConfig.measurementId = "G-WSF2N49KNV";
}

// Google OAuth クライアント ID
if (process.env.REACT_APP_GOOGLE_CLIENT_ID) {
  (window as any).GOOGLE_OAUTH_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;
} else if (process.env.NODE_ENV === "development") {
  (window as any).GOOGLE_OAUTH_CLIENT_ID = "188769376173-3ohb9uq5n88ui3vkp8bptg7cani5vkh0.apps.googleusercontent.com";
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Firebase services
export const auth = getAuth(app);
export default app;
