import React, { useEffect, useState } from 'react';
import { usePayment } from '../../contexts/PaymentContext';
import ThreeDSecureModal from './ThreeDSecureModal';
import { Spinner } from '../common/Spinner';

/**
 * 3Dセキュア認証ページ
 * 決済処理中に3Dセキュア認証が必要な場合に表示される
 */
const ThreeDSecurePage: React.FC = () => {
  const { 
    requires3DSecure,
    threeDSecureUrl,
    is3DSecureProcessing,
    complete3DSecureAuthentication,
    cancel3DSecureAuthentication,
    navigateToComplete,
    navigateToFailure,
    paymentError,
    paymentSuccess,
    isProcessing
  } = usePayment();

  const [showRetry, setShowRetry] = useState(false);

  useEffect(() => {
    // 3Dセキュア認証が不要または既に完了している場合は適切な画面にリダイレクト
    if (!requires3DSecure && !is3DSecureProcessing) {
      if (paymentSuccess) {
        navigateToComplete();
      } else if (paymentError) {
        navigateToFailure();
      }
    }
  }, [requires3DSecure, is3DSecureProcessing, paymentSuccess, paymentError, navigateToComplete, navigateToFailure]);

  // 認証失敗時に再試行表示を有効にするタイマー
  useEffect(() => {
    if (paymentError) {
      const timer = setTimeout(() => {
        setShowRetry(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [paymentError]);

  // 認証完了ハンドラー
  const handleAuthenticationComplete = async (success: boolean) => {
    const result = await complete3DSecureAuthentication(success);
    if (result) {
      // 認証成功時は自動的に完了画面に移動
      navigateToComplete();
    } else {
      // 失敗時はこのページにとどまり、エラーを表示
      setShowRetry(true);
    }
  };

  // 認証キャンセルハンドラー
  const handleCancel = () => {
    cancel3DSecureAuthentication();
    navigateToFailure();
  };

  // 認証再試行ハンドラー
  const handleRetry = () => {
    window.location.reload(); // 簡易実装として、ページをリロード
  };

  // ローディング中の表示
  if (isProcessing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">決済処理中</h1>
            <p className="mt-2 text-gray-600">処理が完了するまでお待ちください。</p>
          </div>
          <div className="flex justify-center">
            <Spinner size="large" />
          </div>
        </div>
      </div>
    );
  }

  // エラー表示
  if (paymentError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-block rounded-full p-3 bg-red-100 mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-10 w-10 text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">認証エラー</h1>
            <p className="mt-2 text-red-600">{paymentError}</p>
          </div>
          {showRetry && (
            <div className="flex justify-center space-x-4">
              <button
                onClick={handleRetry}
                className="py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md shadow-sm"
              >
                再試行する
              </button>
              <button
                onClick={() => navigateToFailure()}
                className="py-2 px-4 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md shadow-sm"
              >
                戻る
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // 3Dセキュア認証モーダル
  if (requires3DSecure && threeDSecureUrl) {
    return (
      <ThreeDSecureModal
        authUrl={threeDSecureUrl}
        onComplete={handleAuthenticationComplete}
        onCancel={handleCancel}
      />
    );
  }

  // 通常はここに到達しないが、念のためフォールバック表示
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">決済処理中</h1>
          <p className="mt-2 text-gray-600">しばらくお待ちください...</p>
        </div>
        <div className="flex justify-center">
          <Spinner size="medium" />
        </div>
      </div>
    </div>
  );
};

export default ThreeDSecurePage;
