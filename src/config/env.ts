/**
 * 環境変数の設定
 * 
 * 環境ごとに異なる設定値を管理します。
 * NODE_ENVの値に基づいて適切な環境設定を返します。
 */

// 環境タイプの定義
type Environment = 'development' | 'staging' | 'production';

// 現在の環境を取得
const currentEnv: Environment = 
  (process.env.REACT_APP_ENV as Environment) || 
  (process.env.NODE_ENV === 'production' ? 'production' : 'development');

// 環境設定の型定義
interface EnvironmentConfig {
  apiBaseUrl: string;
  wsBaseUrl: string;
  uploadUrl: string;
  paymentGatewayUrl: string;
  firebaseConfig: {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
    measurementId?: string;
  };
  appVersion: string;
  debug: boolean;
}

// 環境ごとの設定値
const configs: Record<Environment, EnvironmentConfig> = {
  development: {
    apiBaseUrl: 'http://localhost:3001/api',
    wsBaseUrl: 'ws://localhost:3001',
    uploadUrl: 'http://localhost:3001/uploads',
    paymentGatewayUrl: 'https://dev-payment.echo-app.example.com',
    firebaseConfig: {
      apiKey: "AIzaSyDEVELOPMENT_KEY",
      authDomain: "echo-dev.firebaseapp.com",
      projectId: "echo-dev",
      storageBucket: "echo-dev.appspot.com",
      messagingSenderId: "111111111111",
      appId: "1:111111111111:web:dev111111111111"
    },
    appVersion: '0.1.0-dev',
    debug: true
  },
  staging: {
    apiBaseUrl: 'https://staging-api.echo-app.example.com',
    wsBaseUrl: 'wss://staging-ws.echo-app.example.com',
    uploadUrl: 'https://staging-uploads.echo-app.example.com',
    paymentGatewayUrl: 'https://staging-payment.echo-app.example.com',
    firebaseConfig: {
      apiKey: "AIzaSySTAGING_KEY",
      authDomain: "echo-staging.firebaseapp.com",
      projectId: "echo-staging",
      storageBucket: "echo-staging.appspot.com",
      messagingSenderId: "222222222222",
      appId: "1:222222222222:web:staging222222222222"
    },
    appVersion: '0.1.0-staging',
    debug: true
  },
  production: {
    apiBaseUrl: 'https://api.echo-app.example.com',
    wsBaseUrl: 'wss://ws.echo-app.example.com',
    uploadUrl: 'https://uploads.echo-app.example.com',
    paymentGatewayUrl: 'https://payment.echo-app.example.com',
    firebaseConfig: {
      apiKey: "AIzaSyPRODUCTION_KEY",
      authDomain: "echo-prod.firebaseapp.com",
      projectId: "echo-prod",
      storageBucket: "echo-prod.appspot.com",
      messagingSenderId: "333333333333",
      appId: "1:333333333333:web:prod333333333333",
      measurementId: "G-PROD333333333333"
    },
    appVersion: '0.1.0',
    debug: false
  }
};

// 現在の環境の設定を取得
export const env = configs[currentEnv];

// 環境の種類を取得
export const getEnvironment = (): Environment => currentEnv;

// 開発環境かどうかをチェック
export const isDevelopment = (): boolean => currentEnv === 'development';

// 本番環境かどうかをチェック
export const isProduction = (): boolean => currentEnv === 'production';

// ステージング環境かどうかをチェック
export const isStaging = (): boolean => currentEnv === 'staging';

export default env;
