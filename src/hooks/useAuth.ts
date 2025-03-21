import { useCallback, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

/**
 * 認証情報を扱うカスタムフック
 */
export const useAuth = () => {
  // 実際の実装ではAuthContextからユーザー状態を取得
  // 仮の実装としてダミーのコンテキスト値を返す
  const mockContext = {
    user: {
      id: 'user-123',
      email: 'user@example.com',
      name: 'Echo User',
      isAttender: false
    },
    isAuthenticated: true,
    isLoading: false,
    login: async () => {},
    logout: async () => {},
    register: async () => {},
    getToken: async () => 'dummy-jwt-token',
    error: null
  };
  
  // 実際の実装ではこのコメントを解除
  // const auth = useContext(AuthContext);
  
  // 仮の実装として上記のモックを使用
  const auth = {
    ...mockContext,
    // 型エラーを修正するために引数を受け付けるように修正
    login: async (email: string, password: string) => {},
    register: async (userData: any) => {}
  };

  /**
   * 認証トークンを取得する
   * @returns 認証トークン
   */
  const getToken = useCallback(async () => {
    return auth.getToken();
  }, [auth]);

  /**
   * ログイン処理を行う
   * @param email メールアドレス
   * @param password パスワード
   */
  const login = useCallback(
    async (email: string, password: string) => {
      return auth.login(email, password);
    },
    [auth]
  );

  /**
   * ログアウト処理を行う
   */
  const logout = useCallback(async () => {
    return auth.logout();
  }, [auth]);

  /**
   * ユーザー登録を行う
   * @param userData 登録するユーザー情報
   */
  const register = useCallback(
    async (userData: any) => {
      return auth.register(userData);
    },
    [auth]
  );

  /**
   * アテンダーかどうかをチェックする
   */
  const isAttender = useCallback(() => {
    return auth.user?.isAttender || false;
  }, [auth]);

  return {
    user: auth.user,
    isAuthenticated: auth.isAuthenticated,
    isLoading: auth.isLoading,
    error: auth.error,
    isAttender,
    getToken,
    login,
    logout,
    register
  };
};
