import React, { useEffect, useState } from 'react';
import LoginModal from './LoginModal';
import SignupModal from './SignupModal';
import PasswordResetModal from './PasswordResetModal';
import { useAuth } from '../../contexts/AuthContext';

const AuthModals: React.FC = () => {
  const { isAuthenticated, closeAuthModals } = useAuth();
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  
  // AuthContextから直接モーダル表示状態を取得
  const contextAuth = useAuth();
  // デバッグ用
  const forceShowLogin = localStorage.getItem('debug_show_login') === 'true';
  const forceShowSignup = localStorage.getItem('debug_show_signup') === 'true';
  
  // モーダル表示状態を確実にチェック
  const showLoginModal = contextAuth.modals?.showLogin || forceShowLogin;
  const showSignupModal = contextAuth.modals?.showSignup || forceShowSignup;

  // 明示的にモーダル表示状態をログ出力
  console.log('Modal rendering state:', { showLoginModal, showSignupModal, modalsFromContext: contextAuth.modals });

  // 認証状態が変更されたときにモーダルを閉じる
  useEffect(() => {
    if (isAuthenticated) {
      closeAuthModals();
      setShowPasswordReset(false);
    }
  }, [isAuthenticated, closeAuthModals]);

  // すべてのモーダルを閉じる
  const closeAllModals = () => {
    closeAuthModals();
    setShowPasswordReset(false);
  };

  // ログインモーダルを開く
  const openLoginModal = () => {
    contextAuth.openLoginModal();
    setShowPasswordReset(false);
  };

  // 新規登録モーダルを開く
  const openSignupModal = () => {
    contextAuth.openSignupModal();
    setShowPasswordReset(false);
  };

  // パスワードリセットモーダルを開く
  const openPasswordResetModal = () => {
    // AuthContextのモーダル状態をクリア
    contextAuth.closeAuthModals();
    // パスワードリセットモーダルを表示
    setShowPasswordReset(true);
  };

  return (
    <>
      {showLoginModal && (
        <LoginModal
          onClose={closeAllModals}
          onSignupClick={openSignupModal}
          onForgotPasswordClick={openPasswordResetModal}
        />
      )}
      
      {showSignupModal && (
        <SignupModal
          onClose={closeAllModals}
          onLoginClick={openLoginModal}
        />
      )}
      
      {showPasswordReset && (
        <PasswordResetModal
          onClose={closeAllModals}
          onBackToLogin={openLoginModal}
        />
      )}
    </>
  );
};

export default AuthModals;
