import React, { useState, useEffect } from 'react';
import { useLocale } from '../../contexts/LocaleContext';

interface GooglePayButtonProps {
  amount: number;
  onPaymentComplete: (transactionId: string) => void;
  onPaymentError: (error: Error) => void;
}

const GooglePayButton: React.FC<GooglePayButtonProps> = ({ amount, onPaymentComplete, onPaymentError }) => {
  const { t, currency } = useLocale();
  const [isGooglePayAvailable, setIsGooglePayAvailable] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [googlePayClient, setGooglePayClient] = useState<any>(null);

  // Google Pay APIの設定
  const googlePayBaseConfiguration = {
    apiVersion: 2,
    apiVersionMinor: 0,
    allowedPaymentMethods: [{
      type: 'CARD',
      parameters: {
        allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
        allowedCardNetworks: ['MASTERCARD', 'VISA', 'JCB', 'AMEX']
      },
      tokenizationSpecification: {
        type: 'PAYMENT_GATEWAY',
        parameters: {
          gateway: 'echo',
          gatewayMerchantId: 'echo_merchant_id'
        }
      }
    }]
  };

  // Google Pay が利用可能かチェック
  useEffect(() => {
    // Google Pay API スクリプトを動的に読み込み
    if (!document.querySelector('#google-pay-script')) {
      const script = document.createElement('script');
      script.id = 'google-pay-script';
      script.src = 'https://pay.google.com/gp/p/js/pay.js';
      script.async = true;
      script.onload = () => initializeGooglePay();
      document.body.appendChild(script);
    } else {
      initializeGooglePay();
    }
  }, []);

  const initializeGooglePay = () => {
    // @ts-ignore - Google Pay API
    if (window.google && window.google.payments && window.google.payments.api) {
      // @ts-ignore - Google Pay API
      const client = new window.google.payments.api.PaymentsClient({
        environment: 'TEST' // 本番環境では 'PRODUCTION'
      });
      
      setGooglePayClient(client);
      
      client.isReadyToPay(googlePayBaseConfiguration)
        .then((response: any) => {
          if (response.result) {
            setIsGooglePayAvailable(true);
          }
        })
        .catch((err: Error) => {
          console.error('Google Pay availability check failed:', err);
        });
    }
  };

  const handleGooglePayClick = () => {
    if (!isGooglePayAvailable || !googlePayClient) return;
    
    setIsLoading(true);

    const paymentDataRequest = {
      ...googlePayBaseConfiguration,
      merchantInfo: {
        merchantId: 'echo_merchant_id',
        merchantName: 'echo'
      },
      transactionInfo: {
        totalPriceStatus: 'FINAL',
        totalPrice: amount.toString(),
        currencyCode: currency,
        countryCode: currency === 'JPY' ? 'JP' : 'US'
      }
    };

    googlePayClient.loadPaymentData(paymentDataRequest)
      .then((paymentData: any) => {
        // 支払い情報を処理
        console.log('Google Pay payment success:', paymentData);
        
        // 通常はここでバックエンドへ送信して処理
        const mockTransactionId = 'gp_' + Math.random().toString(36).substr(2, 9);
        onPaymentComplete(mockTransactionId);
      })
      .catch((err: Error) => {
        if (err.toString().includes('closed')) {
          console.log('Google Pay payment cancelled');
        } else {
          console.error('Google Pay payment failed:', err);
          onPaymentError(err);
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  if (!isGooglePayAvailable) {
    return null;
  }

  return (
    <button
      onClick={handleGooglePayClick}
      disabled={isLoading}
      className="w-full py-3 bg-white text-black border border-gray-300 font-medium rounded-md shadow-sm flex items-center justify-center space-x-2"
    >
      <svg viewBox="0 0 24 24" width="24" height="24">
        <path d="M12 22.5c-.5 0-.9-.1-1.3-.4L3.4 18c-.7-.4-1.1-1.1-1.1-2V8c0-.8.4-1.6 1.1-2l7.3-4.2c.8-.5 1.8-.5 2.6 0L20.6 6c.7.4 1.1 1.2 1.1 2v8c0 .8-.4 1.6-1.1 2l-7.3 4.2c-.4.2-.8.3-1.3.3z" fill="#5f6368" />
        <path d="M10.5 7.7C9.6 7.7 9 8.3 9 9c0 .7.7 1.3 1.5 1.3S12 9.7 12 9c0-.7-.6-1.3-1.5-1.3zm3 0c-.9 0-1.5.6-1.5 1.3 0 .7.7 1.3 1.5 1.3S15 9.7 15 9c0-.7-.6-1.3-1.5-1.3zm-6 4c-.9 0-1.5.6-1.5 1.3 0 .7.7 1.3 1.5 1.3S9 13.7 9 13c0-.7-.6-1.3-1.5-1.3zm6 0c-.9 0-1.5.6-1.5 1.3 0 .7.7 1.3 1.5 1.3S15 13.7 15 13c0-.7-.6-1.3-1.5-1.3zm3 0c-.9 0-1.5.6-1.5 1.3 0 .7.7 1.3 1.5 1.3S18 13.7 18 13c0-.7-.6-1.3-1.5-1.3z" fill="#4285f4" />
      </svg>
      <span>{isLoading ? t('payment.processingPayment') : 'Google Pay'}</span>
    </button>
  );
};

export default GooglePayButton;
