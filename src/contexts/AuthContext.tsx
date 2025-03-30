import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import AuthService, { UserProfile } from '../services/AuthService';
import { firestore } from '../config/firebase';
import { doc, getDoc } from 'firebase/firestore';

// 拡張されたユーザー型
interface ExtendedUser extends FirebaseUser {
  id: string;  // uidのエイリアス
  name: string;  // displayNameのエイリアス
  photoUrl: string | null;  // photoURLのエイリアス
}

// モーダル表示の状態
export interface AuthModalState {
  showLogin: boolean;
  showSignup: boolean;
}

// 認証コンテキストの型定義
export interface AuthContextType {
  currentUser: FirebaseUser | null;
  userProfile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  modals?: AuthModalState; // モーダル表示状態を公開
  registerUser: (name: string, email: string, password: string) => Promise<void>;
  loginUser: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logoutUser: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  uploadProfileImage: (file: File) => Promise<string>;
  deleteAccount: () => Promise<void>;
  openLoginModal: () => void;
  openSignupModal: () => void;
  closeAuthModals: () => void;
  
  // 互換性のためのエイリアス
  user?: ExtendedUser | null; // currentUserのエイリアス
  logout?: () => Promise<void>; // logoutUserのエイリアス
  updateAuthUser?: (data: Partial<UserProfile>) => Promise<void>; // updateProfileのエイリアス
  login?: (email: string, password: string) => Promise<void>; // loginUserのエイリアス
  signup?: (name: string, email: string, password: string) => Promise<void>; // registerUserのエイリアス
}

// 初期コンテキスト値
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// この宣言は上に移動しました

// 認証プロバイダーのProps
interface AuthProviderProps {
  children: ReactNode;
}

// 認証プロバイダーコンポーネント
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [modals, setModals] = useState<AuthModalState>({
    showLogin: false,
    showSignup: false
  });

  // Firebase Authの状態監視
  useEffect(() => {
    const unsubscribe = AuthService.setupAuthListener(async (user) => {
      setCurrentUser(user);
      setIsLoading(true);
      
      try {
        if (user) {
          // ユーザーがログインしている場合、プロフィール情報を取得
          const profile = await AuthService.getUserProfile(user.uid);
          setUserProfile(profile);
        } else {
          setUserProfile(null);
        }
      } catch (err) {
        console.error('ユーザープロフィール取得エラー:', err);
        setError('ユーザー情報の取得に失敗しました');
      } finally {
        setIsLoading(false);
      }
    });
    
    // クリーンアップ関数
    return () => unsubscribe();
  }, []);

  // 新規ユーザー登録
  const registerUser = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const profile = await AuthService.registerWithEmailPassword(email, password, name);
      setUserProfile(profile);
      closeAuthModals();
    } catch (err: any) {
      console.error('ユーザー登録エラー:', err);
      // Firebase Auth エラーメッセージの日本語化
      if (err.code === 'auth/email-already-in-use') {
        setError('このメールアドレスは既に使用されています');
      } else if (err.code === 'auth/invalid-email') {
        setError('無効なメールアドレスです');
      } else if (err.code === 'auth/weak-password') {
        setError('パスワードが弱すぎます。6文字以上のパスワードを設定してください');
      } else {
        setError('アカウント作成中にエラーが発生しました');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // メールアドレスとパスワードでログイン
  const loginUser = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const userCredential = await AuthService.loginWithEmailPassword(email, password);
      const profile = await AuthService.getUserProfile(userCredential.user.uid);
      setUserProfile(profile);
      closeAuthModals();
    } catch (err: any) {
      console.error('ログインエラー:', err);
      // Firebase Auth エラーメッセージの日本語化
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError('メールアドレスまたはパスワードが正しくありません');
      } else if (err.code === 'auth/invalid-email') {
        setError('無効なメールアドレスです');
      } else if (err.code === 'auth/user-disabled') {
        setError('このアカウントは無効になっています');
      } else if (err.code === 'auth/too-many-requests') {
        setError('ログイン試行回数が多すぎます。しばらく時間をおいてお試しください');
      } else {
        setError('ログイン中にエラーが発生しました');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Googleアカウントでログイン
  const loginWithGoogle = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const userCredential = await AuthService.loginWithGoogle();
      const profile = await AuthService.getUserProfile(userCredential.user.uid);
      setUserProfile(profile);
      closeAuthModals();
    } catch (err: any) {
      console.error('Googleログインエラー:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        setError('ログインがキャンセルされました');
      } else {
        setError('Googleログイン中にエラーが発生しました');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ログアウト
  const logoutUser = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      await AuthService.logout();
      setUserProfile(null);
    } catch (err) {
      console.error('ログアウトエラー:', err);
      setError('ログアウト中にエラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  // パスワードリセットメールの送信
  const resetPassword = async (email: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await AuthService.sendPasswordReset(email);
    } catch (err: any) {
      console.error('パスワードリセットエラー:', err);
      if (err.code === 'auth/user-not-found') {
        setError('このメールアドレスに登録されたユーザーがいません');
      } else if (err.code === 'auth/invalid-email') {
        setError('無効なメールアドレスです');
      } else {
        setError('パスワードリセットメールの送信中にエラーが発生しました');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // プロフィール更新
  const updateProfile = async (data: Partial<UserProfile>) => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (!currentUser) {
        throw new Error('ユーザーがログインしていません');
      }
      
      await AuthService.updateUserProfile(currentUser.uid, data);
      
      // 更新後のプロフィールを再取得
      const updatedProfile = await AuthService.getUserProfile(currentUser.uid);
      setUserProfile(updatedProfile);
    } catch (err) {
      console.error('プロフィール更新エラー:', err);
      setError('プロフィールの更新中にエラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  // プロフィール画像のアップロード
  const uploadProfileImage = async (file: File): Promise<string> => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (!currentUser) {
        throw new Error('ユーザーがログインしていません');
      }
      
      const downloadURL = await AuthService.uploadProfileImage(file, currentUser.uid);
      
      // ユーザープロフィールを更新
      if (userProfile) {
        setUserProfile({
          ...userProfile,
          photoURL: downloadURL
        });
      }
      
      return downloadURL;
    } catch (err) {
      console.error('画像アップロードエラー:', err);
      setError('プロフィール画像のアップロード中にエラーが発生しました');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // アカウント削除
  const deleteAccount = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      await AuthService.deleteUserAccount();
      setUserProfile(null);
    } catch (err) {
      console.error('アカウント削除エラー:', err);
      setError('アカウントの削除中にエラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  // モーダル表示関数
  const openLoginModal = () => {
    console.log('Opening login modal - AuthContext');
    // さらに明示的に状態をデバッグ出力
    console.log('Modal state before:', modals);
    setModals({ showLogin: true, showSignup: false });
    // 状態が更新されたことを確認するためにタイムアウトを追加
    setTimeout(() => {
      console.log('Modal state after timeout:', { ...modals });
    }, 100);
  };

  const openSignupModal = () => {
    console.log('Opening signup modal - AuthContext');
    console.log('Modal state before:', modals);
    setModals({ showLogin: false, showSignup: true });
    setTimeout(() => {
      console.log('Modal state after timeout:', { ...modals });
    }, 100);
  };

  const closeAuthModals = () => {
    console.log('Closing auth modals - AuthContext');
    console.log('Modal state before:', modals);
    setModals({ showLogin: false, showSignup: false });
    setTimeout(() => {
      console.log('Modal state after timeout:', { ...modals });
    }, 100);
  };

  // コンテキスト値
  const value: AuthContextType = {
    currentUser,
    userProfile,
    isLoading,
    error,
    isAuthenticated: !!currentUser,
    modals, // モーダル表示状態を追加
    registerUser,
    loginUser,
    loginWithGoogle,
    logoutUser,
    resetPassword,
    updateProfile,
    uploadProfileImage,
    deleteAccount,
    openLoginModal,
    openSignupModal,
    closeAuthModals,
    
    // 互換性のためのエイリアス
    user: currentUser ? {
      ...currentUser,
      id: currentUser.uid,
      name: currentUser.displayName || 'ユーザー',  // nullの場合はデフォルト値
      photoUrl: currentUser.photoURL,
    } : null,
    logout: logoutUser,
    updateAuthUser: updateProfile,
    login: loginUser,
    signup: registerUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// カスタムフック
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};
