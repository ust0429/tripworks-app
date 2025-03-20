import React, { useState, useEffect } from 'react';
import { useLocale } from '../../contexts/LocaleContext';

// Apple Pay の型定義は src/types/applepay.d.ts で行っています

interface ApplePayButtonProps {
  amount: number | string;
  onPaymentComplete: (transactionId: string) => void;
  onPaymentError: (error: Error) => void;
}

const ApplePayButton: React.FC<ApplePayButtonProps> = ({ amount, onPaymentComplete, onPaymentError }) => {
  // 金額を文字列に変換して確実に型を合わせる
  const amountString = typeof amount === 'number' ? amount.toString() : amount;
  const { t, formatCurrency, currency } = useLocale();
  const [isApplePayAvailable, setIsApplePayAvailable] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Apple Pay が利用可能かチェック
  useEffect(() => {
    const checkApplePayAvailability = () => {
      // @ts-ignore - Apple Pay API
      if (window.ApplePaySession && window.ApplePaySession.canMakePayments()) {
        setIsApplePayAvailable(true);
      } else {
        setIsApplePayAvailable(false);
      }
    };

    checkApplePayAvailability();
  }, []);

  const handleApplePayClick = async () => {
    if (!isApplePayAvailable) return;
    
    setIsLoading(true);

    try {
      // @ts-ignore - Apple Pay API
      const session = new window.ApplePaySession(3, {
        countryCode: currency === 'JPY' ? 'JP' : 'US',
        currencyCode: currency,
        supportedNetworks: ['visa', 'masterCard', 'amex', 'jcb'],
        merchantCapabilities: ['supports3DS'],
        total: {
          label: 'echo',
          amount: amountString,
          type: 'final' // Apple PayのLineItem型に必要な型プロパティ
        }
      });

      // セッションイベントハンドラを設定
      session.onvalidatemerchant = async (event: any) => { // 型をanyに変更
        // 通常はここでバックエンドAPIを呼び出して検証
        try {
          // モックデータ - 実際のAPIレスポンスに置き換える
          const mockMerchantSession = {
            merchantIdentifier: 'merchant.com.echo',
            displayName: 'echo',
            initiative: 'web',
            initiativeContext: window.location.hostname
          };
          
          session.completeMerchantValidation(mockMerchantSession);
        } catch (error) {
          console.error('Merchant validation failed:', error);
          session.abort();
          onPaymentError(new Error('Merchant validation failed'));
        }
      };

      session.onpaymentauthorized = (event: any) => { // 型をanyに変更
        // 決済処理完了後の処理
        // モック - 実際はここでサーバーサイドの決済処理結果を受け取る
        // STATUS_SUCCESSが存在することを確認してから使用
        // STATUS_SUCCESSの値を安全に取得
        const status = window.ApplePaySession?.STATUS_SUCCESS || 0;
        
        // ApplePaySession.STATUS_SUCCESSを使用
        // @ts-ignore - Apple Pay API
        session.completePayment(status);
        
        // 決済完了通知
        const mockTransactionId = 'ap_' + Math.random().toString(36).substr(2, 9);
        onPaymentComplete(mockTransactionId);
      };

      session.oncancel = () => {
        console.log('Apple Pay payment cancelled');
        setIsLoading(false);
      };

      // セッション開始
      session.begin();
    } catch (error) {
      console.error('Apple Pay error:', error);
      setIsLoading(false);
      onPaymentError(error as Error);
    }
  };

  if (!isApplePayAvailable) {
    return null;
  }

  return (
    <button
      onClick={handleApplePayClick}
      disabled={isLoading}
      className="w-full py-3 bg-black text-white font-medium rounded-md shadow-sm flex items-center justify-center space-x-2"
      style={{ WebkitAppearance: 'none' }}
    >
      <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
        <path d="M17.6 13.5c-.1-.3-.1-.6-.3-.8-.2-.3-.5-.5-.8-.5-.2 0-.4 0-.6.1-.2.1-.3.2-.5.2-.1.1-.3.1-.4.1-.1 0-.3 0-.4-.1-.1-.1-.3-.1-.4-.2-.1-.1-.3-.1-.6-.1-.3 0-.6.1-.8.3-.1.2-.3.3-.4.5-.1.2-.1.5-.1.8s.1.6.2.9c.1.3.3.5.4.7.2.2.4.3.6.5.2.1.5.1.7.1.2 0 .4 0 .5-.1.1-.1.3-.1.4-.2.1-.1.3-.1.4-.2.1 0 .3-.1.4-.1.1 0 .3 0 .4.1.1.1.3.1.4.2.1.1.3.1.4.1.3 0 .5-.1.7-.2.2-.1.4-.3.6-.5.1-.2.2-.3.4-.6.1-.2.2-.4.2-.6-.2-.1-.4-.3-.5-.5zm-.9-5.1c.4-.5.7-1.1.7-1.7 0-.1 0-.2-.1-.2-.4.2-.8.4-1.1.7-.4.4-.7.9-.6 1.5 0 .1 0 .2.1.2.1 0 .2.1.3.1.2-.1.5-.3.7-.6zM7.8 16h2.2l1.2 3h2.5l-1.3-3.5c.7-.4 1.5-1.2 1.5-2.6 0-1.9-1.2-3-3.4-3H7v9h.8v-2.9zm2.2-5.4h1.5c1.2 0 1.9.5 1.9 1.5s-.8 1.5-1.8 1.5H10V10.6z" />
      </svg>
      <span>{isLoading ? t('payment.processingPayment') : 'Apple Pay'}</span>
    </button>
  );
};

export default ApplePayButton;
