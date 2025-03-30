/**
 * 認証デバッグ用のヘルパーコンポーネント
 * 認証関連の問題を診断するための補助ツール
 */

import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { checkAuthState } from '../../firebase-auth-debug';

const AuthDebugHelper: React.FC = () => {
  const auth = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [debugInfo, setDebugInfo] = useState<Record<string, any>>({});

  // デバッグ情報を収集
  const collectDebugInfo = () => {
    const info: Record<string, any> = {
      isAuthenticated: auth.isAuthenticated,
      isLoading: auth.isLoading,
      hasError: !!auth.error,
      errorMessage: auth.error,
      hasUser: !!auth.currentUser,
      hasUserProfile: !!auth.userProfile,
      modalState: auth.modals,
      openLoginModalFn: !!auth.openLoginModal ? 'Function exists' : 'Missing',
      openSignupModalFn: !!auth.openSignupModal ? 'Function exists' : 'Missing',
      closeAuthModalsFn: !!auth.closeAuthModals ? 'Function exists' : 'Missing',
    };

    if (auth.currentUser) {
      info.userInfo = {
        uid: auth.currentUser.uid,
        email: auth.currentUser.email,
        displayName: auth.currentUser.displayName,
        emailVerified: auth.currentUser.emailVerified,
      };
    }

    // Firebase Auth状態を確認
    checkAuthState();
    
    setDebugInfo(info);
  };

  // モーダルを開く
  const testOpenLoginModal = () => {
    console.log('Testing openLoginModal...');
    if (auth.openLoginModal) {
      auth.openLoginModal();
    } else {
      console.error('openLoginModal function not found');
    }
  };

  const testOpenSignupModal = () => {
    console.log('Testing openSignupModal...');
    if (auth.openSignupModal) {
      auth.openSignupModal();
    } else {
      console.error('openSignupModal function not found');
    }
  };

  // モーダルを閉じる
  const testCloseModals = () => {
    console.log('Testing closeAuthModals...');
    if (auth.closeAuthModals) {
      auth.closeAuthModals();
    } else {
      console.error('closeAuthModals function not found');
    }
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-20 right-4 z-50">
        <button
          className="bg-gray-800 text-white rounded-full p-2 shadow-lg"
          onClick={() => setIsOpen(true)}
        >
          🔧
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-20 right-4 z-50 bg-white rounded-lg shadow-xl p-4 w-80 max-h-96 overflow-auto border border-gray-300">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold">Auth Debug</h3>
        <button
          className="text-gray-500 hover:text-gray-700"
          onClick={() => setIsOpen(false)}
        >
          ✕
        </button>
      </div>

      <div className="space-y-2">
        <button
          className="bg-blue-500 text-white rounded px-2 py-1 text-sm w-full"
          onClick={collectDebugInfo}
        >
          Check Auth State
        </button>

        <div className="flex space-x-2">
          <button
            className="bg-green-500 text-white rounded px-2 py-1 text-sm flex-1"
            onClick={testOpenLoginModal}
          >
            Test Login Modal
          </button>
          <button
            className="bg-yellow-500 text-white rounded px-2 py-1 text-sm flex-1"
            onClick={testOpenSignupModal}
          >
            Test Signup Modal
          </button>
        </div>

        <button
          className="bg-red-500 text-white rounded px-2 py-1 text-sm w-full"
          onClick={testCloseModals}
        >
          Test Close Modals
        </button>

        {Object.keys(debugInfo).length > 0 && (
          <div className="mt-4 text-xs">
            <div className="font-bold mb-1">Debug Info:</div>
            <pre className="bg-gray-100 p-2 rounded overflow-auto max-h-40">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthDebugHelper;
