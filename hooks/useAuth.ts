/**
 * 認証コンテキストを扱うカスタムフック
 */
import { useContext } from 'react';
import { AuthContext } from '../src/contexts/AuthContext';

/**
 * 認証情報へのアクセスを提供するカスタムフック
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

export default useAuth;
