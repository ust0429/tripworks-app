import React from 'react';
import { CreditCard, Store, Building2, QrCode } from 'lucide-react';
import { PaymentMethodType } from '../../types/payment';

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
  const methods: { id: PaymentMethodType; name: string; icon: React.ReactNode }[] = [
    {
      id: 'credit_card',
      name: 'クレジットカード',
      icon: <CreditCard className="w-5 h-5" />
    },
    {
      id: 'convenience',
      name: 'コンビニ支払い',
      icon: <Store className="w-5 h-5" />
    },
    {
      id: 'bank_transfer',
      name: '銀行振込',
      icon: <Building2 className="w-5 h-5" />
    },
    {
      id: 'qr_code',
      name: 'QRコード決済',
      icon: <QrCode className="w-5 h-5" />
    }
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {methods.map((method) => (
          <button
            key={method.id}
            type="button"
            disabled={disabled}
            onClick={() => onSelectMethod(method.id)}
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
                  選択中
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
        ))}
      </div>
    </div>
  );
};

export default PaymentMethodSelector;
