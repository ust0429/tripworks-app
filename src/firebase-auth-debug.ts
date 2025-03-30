/**
 * Firebase Auth デバッグヘルパー
 * 認証関連の問題を診断するためのユーティリティ
 */
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { app } from './config/firebase';

// 認証状態の変更をリッスン
const auth = getAuth(app);

console.log('Firebase Auth Debug Helper Initialized');
console.log('Current auth object:', auth ? 'Auth object exists' : 'Auth object is null or undefined');

// 認証状態の変更を監視
onAuthStateChanged(auth, (user) => {
  if (user) {
    // ユーザーがログインしている
    console.log('Authentication state changed: User signed in');
    console.log('User info:', {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      emailVerified: user.emailVerified,
      providerId: user.providerId,
    });
  } else {
    // ユーザーがログアウトしている
    console.log('Authentication state changed: User signed out');
  }
});

// Auth状態を確認する関数
export const checkAuthState = () => {
  const currentUser = auth.currentUser;
  if (currentUser) {
    console.log('Current auth state: User is signed in');
    console.log('Current user:', {
      uid: currentUser.uid,
      email: currentUser.email,
      displayName: currentUser.displayName,
    });
  } else {
    console.log('Current auth state: No user is signed in');
  }
};

// 認証エラーのコード変換
export const translateAuthError = (errorCode: string): string => {
  const errorMessages: Record<string, string> = {
    'auth/invalid-email': 'メールアドレスの形式が正しくありません',
    'auth/user-disabled': 'このユーザーアカウントは無効化されています',
    'auth/user-not-found': 'メールアドレスが見つかりません',
    'auth/wrong-password': 'パスワードが間違っています',
    'auth/email-already-in-use': 'このメールアドレスは既に使用されています',
    'auth/weak-password': 'パスワードは6文字以上である必要があります',
    'auth/operation-not-allowed': 'この操作は許可されていません',
    'auth/popup-closed-by-user': 'ポップアップが閉じられました。もう一度お試しください',
    'auth/popup-blocked': 'ポップアップがブロックされました。ポップアップを許可して再度お試しください',
    'auth/account-exists-with-different-credential': 'このメールアドレスは既に別の認証方法で登録されています',
    'auth/network-request-failed': 'ネットワークエラーが発生しました。インターネット接続を確認してください',
    'auth/timeout': 'タイムアウトが発生しました。後でもう一度お試しください',
    'auth/too-many-requests': 'ログイン試行回数が多すぎます。しばらく時間をおいてお試しください',
  };

  return errorMessages[errorCode] || 'エラーが発生しました。もう一度お試しください';
};

// デバッグ用エクスポート
export default {
  checkAuthState,
  translateAuthError,
};
