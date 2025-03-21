import React, { createContext, useState, useEffect } from 'react';

// 認証ユーザー情報の型
interface User {
  id: string;
  email: string;
  name: string;
  isAttender: boolean;
}

// 認証コンテキストの型
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (userData: any) => Promise<void>;
  getToken: () => Promise<string | null>;
}

// 初期値
const defaultAuthContext: AuthContextType = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  login: async () => {},
  logout: async () => {},
  register: async () => {},
  getToken: async () => null
};

// コンテキストの作成
export const AuthContext = createContext<AuthContextType>(defaultAuthContext);

// AuthProvider Props
interface AuthProviderProps {
  children: React.ReactNode;
}

/**
 * 認証情報を提供するコンテキストプロバイダー
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 初期認証状態の確認
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // ローカルストレージやクッキーから認証情報を確認
        const token = localStorage.getItem('auth_token');
        
        if (token) {
          // トークンの検証（実際の実装ではAPIリクエストでトークンを検証）
          // ここでは仮実装としてダミーユーザー情報を設定
          setUser({
            id: 'user-123',
            email: 'user@example.com',
            name: 'Echo User',
            isAttender: false
          });
          setIsAuthenticated(true);
        }
      } catch (err) {
        console.error('Auth check failed:', err);
        setError('認証情報の確認中にエラーが発生しました');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  /**
   * ログイン処理
   */
  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // 実際の実装ではAPI呼び出しでログイン処理
      // ここでは仮実装としてダミーユーザー情報を設定
      const mockUser = {
        id: 'user-123',
        email,
        name: 'Echo User',
        isAttender: false
      };
      
      // 仮のトークンをローカルストレージに保存
      localStorage.setItem('auth_token', 'dummy-jwt-token');
      
      setUser(mockUser);
      setIsAuthenticated(true);
    } catch (err: any) {
      console.error('Login failed:', err);
      setError(err.message || 'ログインに失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * ログアウト処理
   */
  const logout = async () => {
    try {
      setIsLoading(true);
      
      // 認証情報の削除
      localStorage.removeItem('auth_token');
      
      setUser(null);
      setIsAuthenticated(false);
    } catch (err: any) {
      console.error('Logout failed:', err);
      setError(err.message || 'ログアウト中にエラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * ユーザー登録処理
   */
  const register = async (userData: any) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // 実際の実装ではAPI呼び出しでユーザー登録処理
      // ここでは仮実装としてダミーユーザー情報を設定
      const mockUser = {
        id: 'user-' + Date.now(),
        email: userData.email,
        name: userData.name,
        isAttender: false
      };
      
      // 仮のトークンをローカルストレージに保存
      localStorage.setItem('auth_token', 'dummy-jwt-token');
      
      setUser(mockUser);
      setIsAuthenticated(true);
    } catch (err: any) {
      console.error('Registration failed:', err);
      setError(err.message || 'ユーザー登録に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 認証トークンを取得
   */
  const getToken = async (): Promise<string | null> => {
    return localStorage.getItem('auth_token');
  };

  // コンテキスト値の設定
  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    register,
    getToken
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
