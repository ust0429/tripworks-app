import React, { useState, createContext, useContext, ReactNode, useEffect } from 'react';
import { X, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult, updateProfile } from 'firebase/auth';
import { auth } from './config/firebaseConfig';

// 認証コンテキストの型定義
interface AuthContextType {
  isAuthenticated: boolean;
  user: UserType | null;
  currentUser: CurrentUserType | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  logout: () => void;
  openLoginModal: () => void;
  openSignupModal: () => void;
  updateAuthUser: (userData: Partial<UserType>) => void;
}

// ユーザーの型定義
interface UserType {
  id: string;
  name: string;
  email: string;
  profileImage?: string | null;
  isAttender?: boolean;
}

// 現在のユーザー情報の拡張型定義
interface CurrentUserType {
  id: string;
  name: string;
  email: string;
  photoUrl?: string | null;
  type?: 'user' | 'attender' | 'admin';
}

// 認証コンテキストを作成
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 認証プロバイダーコンポーネント
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<UserType | null>(null);
  const [currentUser, setCurrentUser] = useState<CurrentUserType | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);

  // 初期化時に認証状態を確認
  useEffect(() => {
    // Firebaseの認証状態を監視
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // ユーザーがログインしている場合
        const userData: UserType = {
          id: firebaseUser.uid,
          name: firebaseUser.displayName || 'ユーザー',
          email: firebaseUser.email || '',
          profileImage: firebaseUser.photoURL
        };
        
        const currentUserData: CurrentUserType = {
          id: firebaseUser.uid,
          name: firebaseUser.displayName || 'ユーザー',
          email: firebaseUser.email || '',
          photoUrl: firebaseUser.photoURL,
          type: 'user' as const
        };
        
        // ユーザー情報をlocalStorageに保存
        localStorage.setItem('echo_user', JSON.stringify(userData));
        localStorage.setItem('echo_currentUser', JSON.stringify(currentUserData));
        
        setUser(userData);
        setCurrentUser(currentUserData);
        setIsAuthenticated(true);
      } else {
        // ユーザーがログアウトしている場合
        // localStorage から認証情報を読み込んでみる（オフライン対応）
        const storedUser = localStorage.getItem('echo_user');
        const storedCurrentUser = localStorage.getItem('echo_currentUser');
        
        if (storedUser && storedCurrentUser) {
          try {
            const parsedUser = JSON.parse(storedUser);
            const parsedCurrentUser = JSON.parse(storedCurrentUser);
            
            setUser(parsedUser);
            setCurrentUser(parsedCurrentUser);
            setIsAuthenticated(true);
          } catch (error) {
            console.error('Failed to parse stored auth data:', error);
            // 解析エラーが発生した場合は認証情報をクリア
            localStorage.removeItem('echo_user');
            localStorage.removeItem('echo_currentUser');
            setUser(null);
            setCurrentUser(null);
            setIsAuthenticated(false);
          }
        } else {
          setUser(null);
          setCurrentUser(null);
          setIsAuthenticated(false);
        }
      }
    });
    
    // クリーンアップ関数
    return () => unsubscribe();
  }, []);

  // Google認証プロバイダーを初期化
  const googleProvider = new GoogleAuthProvider();
  googleProvider.addScope('profile');
  googleProvider.addScope('email');
  
  // 新しいOAuthクライアントIDがあれば設定
  if ((window as any).GOOGLE_OAUTH_CLIENT_ID) {
    googleProvider.setCustomParameters({
      'client_id': (window as any).GOOGLE_OAUTH_CLIENT_ID
    });
  }

  // Googleでログイン処理
  const loginWithGoogle = async (): Promise<boolean> => {
    try {
      console.log('Starting Google sign-in process');
      // Googleポップアップでサインイン
      const result = await signInWithPopup(auth, googleProvider);
      
      // リザルト確認用ログ
      console.log('Google sign-in successful:', result);
      
      const user = result.user;
      
      if (user) {
        // ユーザー情報を作成
        const userData: UserType = {
          id: user.uid,
          name: user.displayName || 'Googleユーザー',
          email: user.email || '',
          profileImage: user.photoURL
        };
        
        const currentUserData: CurrentUserType = {
          id: user.uid,
          name: user.displayName || 'Googleユーザー',
          email: user.email || '',
          photoUrl: user.photoURL,
          type: 'user' as const
        };
        
        // ユーザー情報をlocalStorageに保存
        localStorage.setItem('echo_user', JSON.stringify(userData));
        localStorage.setItem('echo_currentUser', JSON.stringify(currentUserData));
        
        setUser(userData);
        setCurrentUser(currentUserData);
        setIsAuthenticated(true);
        setShowLoginModal(false);
        setShowSignupModal(false);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Google login error:', error);
      // エラーの詳細情報をコンソールに表示
      if (error instanceof Error) {
        console.error('Error details:', {
          name: error.name,
          message: error.message,
          stack: error.stack,
          code: (error as any).code || 'unknown'
        });
      }
      
      // エラーを再スローしてコンポーネントで処理できるようにする
      throw error;
    }
  };

  // ログイン処理（Firebase認証）
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Firebaseの認証を使用
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      if (firebaseUser) {
        const userData: UserType = {
          id: firebaseUser.uid,
          name: firebaseUser.displayName || 'ユーザー',
          email: firebaseUser.email || '',
          profileImage: firebaseUser.photoURL
        };
        
        const currentUserData: CurrentUserType = {
          id: firebaseUser.uid,
          name: firebaseUser.displayName || 'ユーザー',
          email: firebaseUser.email || '',
          photoUrl: firebaseUser.photoURL,
          type: 'user' as const
        };
        
        // ユーザー情報をlocalStorageに保存
        localStorage.setItem('echo_user', JSON.stringify(userData));
        localStorage.setItem('echo_currentUser', JSON.stringify(currentUserData));
        
        setUser(userData);
        setCurrentUser(currentUserData);
        setIsAuthenticated(true);
        setShowLoginModal(false);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };
  
  // テスト用アカウントの場合はモック認証を許可
  const mockLogin = async (email: string, password: string): Promise<boolean> => {
    // テスト用アカウント
    if (email === 'test@example.com' && password === 'password') {
      const userData: UserType = {
        id: 'mock-1',
        name: 'テストユーザー',
        email: email,
        profileImage: null
      };
      
      const currentUserData: CurrentUserType = {
        id: 'mock-1',
        name: 'テストユーザー',
        email: email,
        photoUrl: null,
        type: 'user' as const
      };
      
      // ユーザー情報をlocalStorageに保存
      localStorage.setItem('echo_user', JSON.stringify(userData));
      localStorage.setItem('echo_currentUser', JSON.stringify(currentUserData));
      
      setUser(userData);
      setCurrentUser(currentUserData);
      setIsAuthenticated(true);
      setShowLoginModal(false);
      return true;
    }
    return false;
  };

  // サインアップ処理（Firebase認証）
  const signup = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      // Firebaseの認証を使用
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      // Firebaseユーザー情報を更新
      try {
        await updateProfile(firebaseUser, {
          displayName: name
        });
        console.log('Profile updated successfully');
      } catch (profileError) {
        console.error('Error updating profile:', profileError);
        // プロフィール更新失敗はクリティカルではないので処理を続行
      }
      
      if (firebaseUser) {
        const userData: UserType = {
          id: firebaseUser.uid,
          name: name, // 入力された名前を使用
          email: email,
          profileImage: null
        };
        
        const currentUserData: CurrentUserType = {
          id: firebaseUser.uid,
          name: name,
          email: email,
          photoUrl: null,
          type: 'user' as const
        };
        
        // ユーザー情報をlocalStorageに保存
        localStorage.setItem('echo_user', JSON.stringify(userData));
        localStorage.setItem('echo_currentUser', JSON.stringify(currentUserData));
        
        setUser(userData);
        setCurrentUser(currentUserData);
        setIsAuthenticated(true);
        setShowSignupModal(false);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Signup error:', error);
      return false;
    }
  };

  // ログアウト処理
  const logout = async () => {
    try {
      // Firebaseのログアウトを実行
      await signOut(auth);
      
      // localStorageから認証情報を削除
      localStorage.removeItem('echo_user');
      localStorage.removeItem('echo_currentUser');
      
      setUser(null);
      setCurrentUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // 認証ユーザー情報の更新
  const updateAuthUser = (userData: Partial<UserType>) => {
    if (!user) return;
    
    const updatedUser = { ...user, ...userData };
    
    // ローカルストレージに更新した情報を保存
    localStorage.setItem('echo_user', JSON.stringify(updatedUser));
    
    // 他のユーザー情報も更新が必要な場合はここで実装
    if (currentUser) {
      const updatedCurrentUser = { ...currentUser };
      
      // isAttenderが更新された場合、typeも更新する
      if (userData.isAttender !== undefined) {
        updatedCurrentUser.type = userData.isAttender ? 'attender' : 'user';
      }
      
      // ローカルストレージに現在のユーザー情報も更新
      localStorage.setItem('echo_currentUser', JSON.stringify(updatedCurrentUser));
      setCurrentUser(updatedCurrentUser);
    }
    
    setUser(updatedUser);
  };

  // モーダルを開く関数
  const openLoginModal = () => {
    setShowSignupModal(false);
    setShowLoginModal(true);
  };

  const openSignupModal = () => {
    setShowLoginModal(false);
    setShowSignupModal(true);
  };

  // Firebase redirectの結果を取得（ページロード時）
  useEffect(() => {
    const handleRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result && result.user) {
          // リダイレクト後のユーザー情報を処理
          const userData: UserType = {
            id: result.user.uid,
            name: result.user.displayName || 'Googleユーザー',
            email: result.user.email || '',
            profileImage: result.user.photoURL
          };
          
          const currentUserData: CurrentUserType = {
            id: result.user.uid,
            name: result.user.displayName || 'Googleユーザー',
            email: result.user.email || '',
            photoUrl: result.user.photoURL,
            type: 'user' as const
          };
          
          localStorage.setItem('echo_user', JSON.stringify(userData));
          localStorage.setItem('echo_currentUser', JSON.stringify(currentUserData));
          
          setUser(userData);
          setCurrentUser(currentUserData);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Error handling redirect result:', error);
      }
    };

    handleRedirectResult();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        currentUser,
        login,
        signup,
        loginWithGoogle,
        logout,
        openLoginModal,
        openSignupModal,
        updateAuthUser
      }}
    >
      {children}
      {showLoginModal && <LoginModal onClose={() => setShowLoginModal(false)} onSignupClick={openSignupModal} />}
      {showSignupModal && <SignupModal onClose={() => setShowSignupModal(false)} onLoginClick={openLoginModal} />}
    </AuthContext.Provider>
  );
};

// 認証コンテキストを使用するためのカスタムフック
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// ログインモーダルコンポーネント
interface LoginModalProps {
  onClose: () => void;
  onSignupClick: () => void;
}

const LoginModal = ({ onClose, onSignupClick }: LoginModalProps) => {
  const { login, loginWithGoogle } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('メールアドレスとパスワードを入力してください');
      return;
    }
    
    setIsLoading(true);
    try {
      const success = await login(email, password);
      if (!success) {
        setError('メールアドレスまたはパスワードが正しくありません');
      }
    } catch (err) {
      setError('ログイン中にエラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-md p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold">ログイン</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>
        
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              メールアドレス
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail size={18} className="text-gray-400" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-gray-500 focus:border-gray-500"
                placeholder="your-email@example.com"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              パスワード
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock size={18} className="text-gray-400" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-gray-500 focus:border-gray-500"
                placeholder="••••••••"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                ログイン情報を保存
              </label>
            </div>
            <div className="text-sm">
              <a href="#" className="text-black hover:underline">
                パスワードを忘れた？
              </a>
            </div>
          </div>
          
          <button
            type="submit"
            className="w-full bg-black text-white py-2 rounded-lg font-medium hover:bg-gray-800 transition duration-200 flex items-center justify-center"
            disabled={isLoading}
          >
            {isLoading ? 'ログイン中...' : 'ログイン'}
          </button>
        </form>
        
        <div className="mt-4 text-center text-sm">
          <span className="text-gray-600">アカウントをお持ちでない方は</span>
          <button 
            onClick={onSignupClick}
            className="text-black ml-1 font-medium hover:underline"
          >
            新規登録
          </button>
        </div>
        
        <div className="relative mt-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">または</span>
          </div>
        </div>
        
        <div className="mt-6 grid grid-cols-1 gap-3">
          <button 
            onClick={(e) => {
              e.preventDefault();
              setIsLoading(true);
              setError('');
              loginWithGoogle()
                .then(success => {
                  if (!success) {
                    setError('Googleログインに失敗しました。別の方法でお試しください。');
                  }
                })
                .catch((err) => {
                  console.error('Login error in component:', err);
                  if (err.code === 'auth/cancelled-popup-request') {
                    setError('ログインがキャンセルされました');
                  } else if (err.code === 'auth/popup-blocked') {
                    setError('ポップアップがブロックされました。ブラウザの設定を確認してください。');
                  } else if (err.code === 'auth/popup-closed-by-user') {
                    setError('ログイン画面が閉じられました');
                  } else if (err.code === 'auth/api-key-not-valid') {
                    setError('認証サービスの構成に問題があります。サポートにお問い合わせください。');
                  } else {
                    setError('Googleログイン中にエラーが発生しました');
                  }
                })
                .finally(() => {
                  setIsLoading(false);
                });
            }}
            className="w-full py-2 px-4 border border-gray-300 rounded-lg font-medium text-sm text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="18px" height="18px">
              <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
              <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
              <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
              <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
            </svg>
            Googleで続ける
          </button>
        </div>
      </div>
    </div>
  );
};

// サインアップモーダルコンポーネント
interface SignupModalProps {
  onClose: () => void;
  onLoginClick: () => void;
}

const SignupModal = ({ onClose, onLoginClick }: SignupModalProps) => {
  const { signup, loginWithGoogle } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!name || !email || !password || !confirmPassword) {
      setError('すべての項目を入力してください');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('パスワードが一致しません');
      return;
    }
    
    if (password.length < 8) {
      setError('パスワードは8文字以上必要です');
      return;
    }
    
    setIsLoading(true);
    try {
      const success = await signup(name, email, password);
      if (!success) {
        setError('アカウント作成中にエラーが発生しました');
      }
    } catch (err) {
      setError('アカウント作成中にエラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-md p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold">新規アカウント登録</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>
        
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              お名前
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User size={18} className="text-gray-400" />
              </div>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-gray-500 focus:border-gray-500"
                placeholder="山田 太郎"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              メールアドレス
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail size={18} className="text-gray-400" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-gray-500 focus:border-gray-500"
                placeholder="your-email@example.com"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              パスワード
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock size={18} className="text-gray-400" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-gray-500 focus:border-gray-500"
                placeholder="8文字以上"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              パスワード（確認）
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock size={18} className="text-gray-400" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-gray-500 focus:border-gray-500"
                placeholder="パスワードを再入力"
              />
            </div>
          </div>
          
          <div className="flex items-center">
            <input
              id="terms"
              name="terms"
              type="checkbox"
              className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
            />
            <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
              <span>利用規約</span>
              <a href="#" className="text-black hover:underline"> およびプライバシーポリシー</a>
              <span>に同意します</span>
            </label>
          </div>
          
          <button
            type="submit"
            className="w-full bg-black text-white py-2 rounded-lg font-medium hover:bg-gray-800 transition duration-200 flex items-center justify-center"
            disabled={isLoading}
          >
            {isLoading ? '登録中...' : 'アカウント作成'}
          </button>
        </form>
        
        <div className="mt-4 text-center text-sm">
          <span className="text-gray-600">すでにアカウントをお持ちの方は</span>
          <button 
            onClick={onLoginClick}
            className="text-black ml-1 font-medium hover:underline"
          >
            ログイン
          </button>
        </div>

        <div className="relative mt-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">または</span>
          </div>
        </div>
        
        <div className="mt-6 grid grid-cols-1 gap-3">
          <button 
            onClick={(e) => {
              e.preventDefault();
              setIsLoading(true);
              setError('');
              loginWithGoogle()
                .then(success => {
                  if (!success) {
                    setError('Googleログインに失敗しました。別の方法でお試しください。');
                  }
                })
                .catch((err) => {
                  console.error('Login error in component:', err);
                  if (err.code === 'auth/cancelled-popup-request') {
                    setError('ログインがキャンセルされました');
                  } else if (err.code === 'auth/popup-blocked') {
                    setError('ポップアップがブロックされました。ブラウザの設定を確認してください。');
                  } else if (err.code === 'auth/popup-closed-by-user') {
                    setError('ログイン画面が閉じられました');
                  } else if (err.code === 'auth/api-key-not-valid') {
                    setError('認証サービスの構成に問題があります。サポートにお問い合わせください。');
                  } else {
                    setError('Googleログイン中にエラーが発生しました');
                  }
                })
                .finally(() => {
                  setIsLoading(false);
                });
            }}
            className="w-full py-2 px-4 border border-gray-300 rounded-lg font-medium text-sm text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="18px" height="18px">
              <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
              <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
              <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
              <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
            </svg>
            Googleで登録
          </button>
        </div>
      </div>
    </div>
  );
};

export { LoginModal, SignupModal };