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
      <h3 className="text-lg font-medium">お支払い方法を選択</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {methods.map((method) => (
          <button
            key={method.id}
            type="button"
            disabled={disabled}
            onClick={() => onSelectMethod(method.id)}
            className={`flex items-center p-4 border rounded-lg transition-colors ${
              selectedMethod === method.id
                ? 'bg-blue-50 border-blue-500 text-blue-700'
                : 'bg-white border-gray-200 hover:bg-gray-50'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            aria-pressed={selectedMethod === method.id}
          >
            <div className="mr-3">{method.icon}</div>
            <span className="font-medium">{method.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default PaymentMethodSelector;
