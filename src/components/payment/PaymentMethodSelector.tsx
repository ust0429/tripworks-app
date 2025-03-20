import React, { useEffect, useState } from 'react';
import { CreditCard, Store, Building2, QrCode, Smartphone } from 'lucide-react';
import { PaymentMethodType } from '../../types/payment';
import { useLocale } from '../../contexts/LocaleContext';

interface PaymentMethodSelectorProps {
  selectedMethod: PaymentMethodType | null;
  onSelectMethod: (method: PaymentMethodType) => void;
  disabled?: boolean;
}

const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  selectedMethod,
  onSelectMethod,
  disabled = false
}) => {
  const { t } = useLocale();
  const [isApplePayAvailable, setIsApplePayAvailable] = useState(false);
  const [isGooglePayAvailable, setIsGooglePayAvailable] = useState(false);

  // Apple Pay と Google Pay が利用可能かチェック
  useEffect(() => {
    // Apple Pay のチェック
    if (window.navigator.userAgent.indexOf('iPhone') > -1 || 
        window.navigator.userAgent.indexOf('iPad') > -1 || 
        window.navigator.userAgent.indexOf('Mac') > -1) {
      // @ts-ignore
      if (window.ApplePaySession && window.ApplePaySession.canMakePayments()) {
        setIsApplePayAvailable(true);
      }
    }
    
    // Google Pay のチェック
    if (window.navigator.userAgent.indexOf('Android') > -1 || 
        window.navigator.userAgent.indexOf('Chrome') > -1) {
      setIsGooglePayAvailable(true); // 簡易的な判定（実際には JS API で詳細にチェック）
    }
  }, []);

  const standardMethods = [
    {
      id: 'credit_card' as PaymentMethodType,
      name: t('payment.methods.creditCard'),
      icon: <CreditCard className="w-5 h-5" />
    },
    {
      id: 'convenience' as PaymentMethodType,
      name: 'コンビニ支払い',
      icon: <Store className="w-5 h-5" />
    },
    {
      id: 'bank_transfer' as PaymentMethodType,
      name: '銀行振込',
      icon: <Building2 className="w-5 h-5" />
    },
    {
      id: 'qr_code' as PaymentMethodType,
      name: 'QRコード決済',
      icon: <QrCode className="w-5 h-5" />
    }
  ];
  
  // モバイル決済方法を条件に応じて追加
  const mobileMethods = [];
  
  if (isApplePayAvailable) {
    mobileMethods.push({
      id: 'apple_pay' as PaymentMethodType,
      name: t('payment.methods.applePay'),
      icon: (
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" className="w-5 h-5">
          <path d="M17.6 13.5c-.1-.3-.1-.6-.3-.8-.2-.3-.5-.5-.8-.5-.2 0-.4 0-.6.1-.2.1-.3.2-.5.2-.1.1-.3.1-.4.1-.1 0-.3 0-.4-.1-.1-.1-.3-.1-.4-.2-.1-.1-.3-.1-.6-.1-.3 0-.6.1-.8.3-.1.2-.3.3-.4.5-.1.2-.1.5-.1.8s.1.6.2.9c.1.3.3.5.4.7.2.2.4.3.6.5.2.1.5.1.7.1.2 0 .4 0 .5-.1.1-.1.3-.1.4-.2.1-.1.3-.1.4-.2.1 0 .3-.1.4-.1.1 0 .3 0 .4.1.1.1.3.1.4.2.1.1.3.1.4.1.3 0 .5-.1.7-.2.2-.1.4-.3.6-.5.1-.2.2-.3.4-.6.1-.2.2-.4.2-.6-.2-.1-.4-.3-.5-.5zm-.9-5.1c.4-.5.7-1.1.7-1.7 0-.1 0-.2-.1-.2-.4.2-.8.4-1.1.7-.4.4-.7.9-.6 1.5 0 .1 0 .2.1.2.1 0 .2.1.3.1.2-.1.5-.3.7-.6z" />
        </svg>
      )
    });
  }
  
  if (isGooglePayAvailable) {
    mobileMethods.push({
      id: 'google_pay' as PaymentMethodType,
      name: t('payment.methods.googlePay'),
      icon: (
        <svg viewBox="0 0 24 24" width="20" height="20" className="w-5 h-5">
          <path d="M12 22.5c-.5 0-.9-.1-1.3-.4L3.4 18c-.7-.4-1.1-1.1-1.1-2V8c0-.8.4-1.6 1.1-2l7.3-4.2c.8-.5 1.8-.5 2.6 0L20.6 6c.7.4 1.1 1.2 1.1 2v8c0 .8-.4 1.6-1.1 2l-7.3 4.2c-.4.2-.8.3-1.3.3z" fill="#5f6368" />
          <path d="M10.5 7.7C9.6 7.7 9 8.3 9 9c0 .7.7 1.3 1.5 1.3S12 9.7 12 9c0-.7-.6-1.3-1.5-1.3zm3 0c-.9 0-1.5.6-1.5 1.3 0 .7.7 1.3 1.5 1.3S15 9.7 15 9c0-.7-.6-1.3-1.5-1.3zm-6 4c-.9 0-1.5.6-1.5 1.3 0 .7.7 1.3 1.5 1.3S9 13.7 9 13c0-.7-.6-1.3-1.5-1.3zm6 0c-.9 0-1.5.6-1.5 1.3 0 .7.7 1.3 1.5 1.3S15 13.7 15 13c0-.7-.6-1.3-1.5-1.3zm3 0c-.9 0-1.5.6-1.5 1.3 0 .7.7 1.3 1.5 1.3S18 13.7 18 13c0-.7-.6-1.3-1.5-1.3z" fill="#4285f4" />
        </svg>
      )
    });
  }
  
  // すべての決済方法を結合
  const methods = [
    ...(mobileMethods.length > 0 ? [...mobileMethods, { id: 'divider', name: '', icon: null }] : []),
    ...standardMethods
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {methods.map((method) => {
          // 区切り線を表示
          if (method.id === 'divider') {
            return (
              <div key="divider" className="col-span-1 md:col-span-2 border-t my-3" />
            );
          }
          
          return (
            <button
              key={method.id}
              type="button"
              disabled={disabled}
              onClick={() => onSelectMethod(method.id as PaymentMethodType)}
              className={`flex items-center p-4 border rounded-lg transition-all ${
                selectedMethod === method.id
                  ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-sm ring-2 ring-blue-200'
                  : 'bg-white border-gray-200 hover:bg-gray-50'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              aria-pressed={selectedMethod === method.id}
            >
              <div className={`mr-3 ${selectedMethod === method.id ? 'text-blue-600' : 'text-gray-600'}`}>
                {method.icon}
              </div>
              <div>
                <span className="font-medium">{method.name}</span>
                {selectedMethod === method.id && (
                  <div className="text-xs text-blue-600 mt-0.5">
                    {t('common.selected')}
                  </div>
                )}
              </div>
              {selectedMethod === method.id && (
                <div className="ml-auto">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default PaymentMethodSelector;
