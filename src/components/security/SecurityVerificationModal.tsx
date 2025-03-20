import React, { useState, useEffect } from 'react';
import { Shield, AlertTriangle, Check, X, RefreshCw, User, Phone, Mail, Lock } from 'lucide-react';
import { useLocale } from '../../contexts/LocaleContext';

interface SecurityVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerificationComplete: (success: boolean) => void;
  verificationMethod: 'sms' | 'email' | 'captcha' | '3ds' | undefined;
  riskLevel: 'low' | 'medium' | 'high';
  reasons?: string[];
}

const SecurityVerificationModal: React.FC<SecurityVerificationModalProps> = ({
  isOpen,
  onClose,
  onVerificationComplete,
  verificationMethod = 'sms',
  riskLevel = 'medium',
  reasons = []
}) => {
  const { t } = useLocale();
  const [verificationCode, setVerificationCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [countdown, setCountdown] = useState(0);
  
  // カウントダウンタイマー
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);
  
  // 確認コードを送信（モック実装）
  const sendVerificationCode = () => {
    setIsSubmitting(true);
    setError(null);
    
    // モック実装 - 実際にはAPIを呼び出す
    setTimeout(() => {
      setIsSubmitting(false);
      setCountdown(60); // 60秒のクールダウン
    }, 1500);
  };
  
  // 初回レンダリング時に確認コードを送信
  useEffect(() => {
    if (isOpen && verificationMethod !== '3ds' && verificationMethod !== 'captcha') {
      sendVerificationCode();
    }
  }, [isOpen, verificationMethod]);
  
  // 認証コードを検証（モック実装）
  const verifyCode = () => {
    if (!verificationCode.trim()) {
      setError('確認コードを入力してください');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    // モック実装 - 実際にはAPIを呼び出す
    setTimeout(() => {
      setIsSubmitting(false);
      
      // 認証コードが "1234" または "0000" の場合は成功
      if (verificationCode === '1234' || verificationCode === '0000') {
        setIsSuccess(true);
        setTimeout(() => {
          onVerificationComplete(true);
        }, 1500);
      } else {
        setError('確認コードが無効です。もう一度お試しください。');
      }
    }, 1500);
  };
  
  // CAPTCHA検証（モック実装）
  const verifyCaptcha = () => {
    setIsSubmitting(true);
    
    // モック実装 - 実際にはCAPTCHAサービスを使用
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      
      setTimeout(() => {
        onVerificationComplete(true);
      }, 1500);
    }, 2000);
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
        {/* ヘッダー */}
        <div className={`p-4 text-white flex items-center space-x-3 ${
          riskLevel === 'high' ? 'bg-red-600' : 
          riskLevel === 'medium' ? 'bg-orange-500' : 
          'bg-blue-600'
        }`}>
          <Shield className="w-6 h-6" />
          <h2 className="text-lg font-semibold">セキュリティ確認</h2>
          <button 
            onClick={onClose}
            className="ml-auto text-white hover:text-gray-200"
            disabled={isSubmitting}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* 本文 */}
        <div className="p-6">
          {!isSuccess ? (
            <>
              {/* 説明文 */}
              <div className="mb-6">
                <div className="flex items-start space-x-3 mb-3">
                  <AlertTriangle className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                    riskLevel === 'high' ? 'text-red-600' : 
                    riskLevel === 'medium' ? 'text-orange-500' : 
                    'text-blue-600'
                  }`} />
                  <p className="text-gray-700">
                    {verificationMethod === 'sms' && '安全のため、ご登録の電話番号に確認コードを送信しました。以下に入力してください。'}
                    {verificationMethod === 'email' && '安全のため、ご登録のメールアドレスに確認コードを送信しました。以下に入力してください。'}
                    {verificationMethod === 'captcha' && '安全のため、人間による操作かどうかの確認が必要です。'}
                    {verificationMethod === '3ds' && 'カード発行会社による本人認証が必要です。「認証を開始」ボタンをクリックしてください。'}
                  </p>
                </div>
                
                {reasons && reasons.length > 0 && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm text-gray-600">
                    <p className="font-medium mb-1">確認が必要な理由:</p>
                    <ul className="list-disc pl-5 space-y-1">
                      {reasons.map((reason, index) => (
                        <li key={index}>{reason}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              
              {/* 認証フォーム */}
              {verificationMethod === 'sms' && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SMSに送信された確認コード:
                  </label>
                  <div className="flex">
                    <div className="relative flex-grow">
                      <Phone className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                      <input
                        type="text"
                        maxLength={6}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        placeholder="確認コード"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                        disabled={isSubmitting}
                      />
                    </div>
                    <button
                      className="ml-2 px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                      onClick={sendVerificationCode}
                      disabled={isSubmitting || countdown > 0}
                    >
                      <RefreshCw className="w-4 h-4 mr-1" />
                      {countdown > 0 ? `${countdown}秒` : '再送信'}
                    </button>
                  </div>
                  {error && (
                    <p className="mt-2 text-sm text-red-600">{error}</p>
                  )}
                </div>
              )}
              
              {verificationMethod === 'email' && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    メールに送信された確認コード:
                  </label>
                  <div className="flex">
                    <div className="relative flex-grow">
                      <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                      <input
                        type="text"
                        maxLength={6}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        placeholder="確認コード"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                        disabled={isSubmitting}
                      />
                    </div>
                    <button
                      className="ml-2 px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                      onClick={sendVerificationCode}
                      disabled={isSubmitting || countdown > 0}
                    >
                      <RefreshCw className="w-4 h-4 mr-1" />
                      {countdown > 0 ? `${countdown}秒` : '再送信'}
                    </button>
                  </div>
                  {error && (
                    <p className="mt-2 text-sm text-red-600">{error}</p>
                  )}
                </div>
              )}
              
              {verificationMethod === 'captcha' && (
                <div className="mb-6 border border-gray-300 rounded-md p-4">
                  {/* CAPTCHA表示エリア（実際にはサードパーティのCAPTCHAサービスを使用） */}
                  <div className="flex items-center justify-center h-32 bg-gray-100 rounded mb-4">
                    <div className="text-center">
                      <p className="text-gray-500 mb-2">CAPTCHA表示エリア</p>
                      <p className="text-xs text-gray-400">（デモ環境のため、「確認」ボタンをクリックするとCAPTCHA認証が成功します）</p>
                    </div>
                  </div>
                </div>
              )}
              
              {verificationMethod === '3ds' && (
                <div className="mb-6 text-center">
                  <div className="rounded-md border border-gray-300 p-4 mb-4">
                    <Lock className="mx-auto w-12 h-12 text-blue-600 mb-2" />
                    <p className="text-gray-700 mb-2">カード発行会社のウェブサイトに接続して本人認証を行います。</p>
                    <p className="text-sm text-gray-500">（デモ環境のため、「認証を開始」ボタンをクリックすると認証が成功します）</p>
                  </div>
                </div>
              )}
              
              {/* ボタン */}
              <div className="flex space-x-3">
                <button
                  className="flex-1 bg-gray-200 py-2 rounded-md text-gray-800 font-medium hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={onClose}
                  disabled={isSubmitting}
                >
                  キャンセル
                </button>
                <button
                  className={`flex-1 py-2 rounded-md text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center ${
                    riskLevel === 'high' ? 'bg-red-600 hover:bg-red-700' : 
                    riskLevel === 'medium' ? 'bg-orange-500 hover:bg-orange-600' : 
                    'bg-blue-600 hover:bg-blue-700'
                  }`}
                  onClick={
                    verificationMethod === 'captcha' ? verifyCaptcha :
                    verificationMethod === '3ds' ? verifyCaptcha :
                    verifyCode
                  }
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                      処理中...
                    </>
                  ) : (
                    verificationMethod === '3ds' ? '認証を開始' : '確認'
                  )}
                </button>
              </div>
            </>
          ) : (
            // 成功時の表示
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">認証成功</h3>
              <p className="text-gray-600 mb-6">
                セキュリティ確認が完了しました。続けて取引を進めることができます。
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SecurityVerificationModal;
