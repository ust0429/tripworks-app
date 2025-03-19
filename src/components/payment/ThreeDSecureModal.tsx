import React, { useEffect, useRef, useState } from 'react';
import { ThreeDSecureStatus } from '../../types/payment';
import { create3DSecureIframe } from '../../services/threeDSecureService';

interface ThreeDSecureModalProps {
  authUrl: string;
  onComplete: (success: boolean) => void;
  onCancel: () => void;
}

/**
 * 3Dセキュア認証モーダルコンポーネント
 * カード発行会社の認証画面をiframeで表示
 */
const ThreeDSecureModal: React.FC<ThreeDSecureModalProps> = ({
  authUrl,
  onComplete,
  onCancel
}) => {
  const [status, setStatus] = useState<ThreeDSecureStatus>('pending');
  const [isLoading, setIsLoading] = useState(true);
  const iframeContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // ページのスクロールを無効化
    document.body.style.overflow = 'hidden';
    
    // 認証iframe作成
    const iframe = create3DSecureIframe(authUrl, (result) => {
      setStatus(result.success ? 'success' : 'failed');
      // 少し遅延してから完了処理を実行（視覚的フィードバックのため）
      setTimeout(() => {
        onComplete(result.success);
      }, 800);
    });
    
    // iframe読み込み完了時
    iframe.onload = () => {
      setIsLoading(false);
    };
    
    // iframe追加
    if (iframeContainerRef.current) {
      iframeContainerRef.current.appendChild(iframe);
    }
    
    // タイムアウト設定（5分）
    const timeoutId = setTimeout(() => {
      if (status === 'pending') {
        setStatus('failed');
        onComplete(false);
      }
    }, 5 * 60 * 1000);
    
    // クリーンアップ
    return () => {
      document.body.style.overflow = '';
      clearTimeout(timeoutId);
    };
  }, [authUrl, onComplete, status]);
  
  // キャンセルの確認
  const handleCancel = () => {
    // 認証が進行中の場合のみ確認ダイアログを表示
    if (status === 'pending') {
      if (window.confirm('認証をキャンセルしますか？支払いは完了しません。')) {
        setStatus('canceled');
        onCancel();
      }
    } else {
      onCancel();
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] flex flex-col">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-lg font-semibold">カード発行会社による認証</h2>
          <button
            onClick={handleCancel}
            className="text-gray-500 hover:text-gray-700"
            aria-label="閉じる"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        
        <div className="p-4">
          <p className="mb-4 text-sm text-gray-600">
            お使いのカードは本人認証サービス（3Dセキュア）に対応しています。
            カード発行会社の認証ページで手続きを完了してください。
          </p>
          
          {status === 'pending' && (
            <div className="bg-blue-50 p-3 rounded mb-4 text-sm">
              <p className="font-medium text-blue-800">セキュリティ通知</p>
              <p className="text-blue-700 mt-1">
                この認証は、不正利用防止のためカード発行会社によって実施されます。
                認証情報はechoには送信されません。
              </p>
            </div>
          )}
          
          {status === 'success' && (
            <div className="bg-green-50 p-3 rounded mb-4 text-sm">
              <p className="font-medium text-green-800">認証成功</p>
              <p className="text-green-700 mt-1">
                認証が完了しました。決済処理を続行します。
              </p>
            </div>
          )}
          
          {status === 'failed' && (
            <div className="bg-red-50 p-3 rounded mb-4 text-sm">
              <p className="font-medium text-red-800">認証失敗</p>
              <p className="text-red-700 mt-1">
                認証が完了できませんでした。もう一度お試しいただくか、
                別の支払い方法をお選びください。
              </p>
            </div>
          )}
        </div>
        
        <div className="flex-1 overflow-hidden relative">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              <span className="ml-3 text-gray-600">認証ページを読み込み中...</span>
            </div>
          )}
          <div 
            ref={iframeContainerRef} 
            className="w-full h-full min-h-[350px]"
          ></div>
        </div>
        
        <div className="p-4 border-t">
          {status === 'pending' && (
            <p className="text-xs text-gray-500">
              ※認証が完了しない場合は「閉じる」ボタンを押して、
              別の支払い方法をお試しください。
            </p>
          )}
          
          {(status === 'success' || status === 'failed') && (
            <button
              onClick={() => onComplete(status === 'success')}
              className={`w-full py-2 px-4 rounded ${
                status === 'success'
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
              }`}
            >
              {status === 'success' ? '続ける' : '閉じる'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ThreeDSecureModal;
