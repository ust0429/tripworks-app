/**
 * Firebase Configuration
 *
 * This file initializes Firebase services for use throughout the application.
 */
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Firebase configuration
// 注意: 本番環境では環境変数を使用することをお勧めします
const firebaseConfig = {
  apiKey: "AIzaSyCX09uglZ0ZFd7-VjRepwl1NMN4DBUWZeM",
  authDomain: "echo-app-staging.firebaseapp.com",
  projectId: "echo-app-staging",
  storageBucket: "echo-app-staging.firebasestorage.app",
  messagingSenderId: "188769376173",
  appId: "1:188769376173:web:bc67c0e82d2c68ec1bb324",
  measurementId: "G-WSF2N49KNV",
};

// 開発環境用に設定ファイルから値を読み込み
if (process.env.NODE_ENV === "development") {
  // ステージング環境の設定を使用
  firebaseConfig.apiKey = "AIzaSyCX09uglZ0ZFd7-VjRepwl1NMN4DBUWZeM";
  firebaseConfig.authDomain = "echo-app-staging.firebaseapp.com";
  firebaseConfig.projectId = "echo-app-staging";
  firebaseConfig.storageBucket = "echo-app-staging.firebasestorage.app";
  firebaseConfig.messagingSenderId = "188769376173";
  firebaseConfig.appId = "1:188769376173:web:bc67c0e82d2c68ec1bb324";
  firebaseConfig.measurementId = "G-WSF2N49KNV";
  
  // 新しく取得した Google OAuth クライアント ID
  (window as any).GOOGLE_OAUTH_CLIENT_ID = "188769376173-3ohb9uq5n88ui3vkp8bptg7cani5vkh0.apps.googleusercontent.com";
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Firebase services
export const auth = getAuth(app);
export default app;
