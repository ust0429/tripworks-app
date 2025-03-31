/**
 * 認証コンテキスト
 * 
 * ユーザーの認証状態とAPIとの連携を管理します。
 */
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import apiClient, { getAuthToken } from '../utils/apiClientEnhanced';
import { ENDPOINTS } from '../config/api';

// ユーザープロフィール型定義
interface UserProfile {
  id: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  isAttender: boolean;
  attenderId?: string;
  createdAt: string;
  lastLoginAt: string;
}

// 認証コンテキストの型定義
interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  userProfile: UserProfile | null;
  error: string | null;
  refreshProfile: () => Promise<void>;
}

// コンテキストの作成
const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: true,
  user: null,
  userProfile: null,
  error: null,
  refreshProfile: async () => {}
});

// 認証コンテキストプロバイダーコンポーネント
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // ユーザープロフィール情報の取得
  const fetchUserProfile = async (userId: string): Promise<UserProfile | null> => {
    try {
      console.log(`ユーザープロフィールを取得中... ユーザーID: ${userId}`);
      
      // API経由でプロフィール情報を取得
      const response = await apiClient.get(`${ENDPOINTS.USER.PROFILE}`);
      
      if (response.success && response.data) {
        console.log('ユーザープロフィール取得成功:', response.data);
        return response.data;
      } else {
        console.error('ユーザープロフィール取得エラー:', response.error);
        setError('プロフィール情報の取得に失敗しました');
        return null;
      }
    } catch (err) {
      console.error('ユーザープロフィール取得中に例外が発生:', err);
      setError('プロフィール情報の取得中にエラーが発生しました');
      return null;
    }
  };

  // プロフィール情報の再取得
  const refreshProfile = async (): Promise<void> => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const profile = await fetchUserProfile(user.uid);
      if (profile) {
        setUserProfile(profile);
      }
    } catch (err) {
      console.error('プロフィール再取得エラー:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // 認証状態の監視
  useEffect(() => {
    const auth = getAuth();
    
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      try {
        console.log('認証状態が変更されました:', authUser ? `ユーザーID: ${authUser.uid}` : '未認証');
        
        setUser(authUser);
        
        if (authUser) {
          // 認証ユーザーのプロフィール情報を取得
          const profile = await fetchUserProfile(authUser.uid);
          setUserProfile(profile);
          setIsAuthenticated(true);
        } else {
          // 未認証状態
          setUserProfile(null);
          setIsAuthenticated(false);
        }
      } catch (err) {
        console.error('認証状態処理エラー:', err);
        setError('認証情報の処理中にエラーが発生しました');
      } finally {
        setIsLoading(false);
      }
    });
    
    // クリーンアップ関数
    return () => unsubscribe();
  }, []);

  // 認証状態
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // コンテキスト値
  const value: AuthContextType = {
    isAuthenticated,
    isLoading,
    user,
    userProfile,
    error,
    refreshProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// カスタムフック
export const useAuth = () => useContext(AuthContext);

export default AuthContext;
