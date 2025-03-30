// Firebase初期化を最初にインポート
import './config/firebaseInit';
// デバッグ用
import './firebase-debug';
// Firebase認証デバッグ
import './firebase-auth-debug';

import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);