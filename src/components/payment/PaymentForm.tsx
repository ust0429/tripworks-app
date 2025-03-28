import React, { useState } from 'react';
import { CreditCard, CheckCircle, AlertCircle } from 'lucide-react';
import { PaymentFormInputs } from '../../types/payment';
import { usePayment } from '../../contexts/PaymentContext';

interface PaymentFormProps {
  onComplete: (paymentMethodId: string) => void;
  onCancel: () => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ onComplete, onCancel }) => {
  const { addPaymentMethod, isLoading, error } = usePayment();
  const [cardError, setCardError] = useState<string | null>(null);
  const [cardComplete, setCardComplete] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    cardholderName: '',
    saveCard: true
  });
  const [formErrors, setFormErrors] = useState({
    cardholderName: ''
  });
  
  // カードエレメントの状態変更ハンドラ（実際にはStripe Elements との統合が必要）
  const handleCardElementChange = (event: any) => {
    setCardComplete(event.complete);
    setCardError(event.error ? event.error.message : null);
  };
  
  // 入力フィールドの変更ハンドラ
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    
    // バリデーション
    if (name === 'cardholderName' && !value.trim()) {
      setFormErrors({
        ...formErrors,
        cardholderName: 'カード名義は必須です'
      });
    } else {
      setFormErrors({
        ...formErrors,
        cardholderName: ''
      });
    }
  };
  
  // フォーム送信処理
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // バリデーション
    if (!formData.cardholderName.trim()) {
      setFormErrors({
        ...formErrors,
        cardholderName: 'カード名義は必須です'
      });
      return;
    }
    
    try {
      // 実際にはここでStripeのcreatePaymentMethodを呼び出します
      // このサンプルでは直接PaymentMethodを作成します
      
      const paymentMethodDetails = {
        brand: 'visa',
        last4: '4242',
        expMonth: 12,
        expYear: 2030
      };
      
      const paymentMethodId = await addPaymentMethod(
        'card',
        paymentMethodDetails,
        formData.saveCard
      );
      
      onComplete(paymentMethodId);
    } catch (err) {
      console.error('Payment submission failed', err);
      setCardError('支払い方法の登録に失敗しました。もう一度お試しください。');
    }
  };
  
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <h3 className="text-lg font-bold mb-4">クレジットカード情報</h3>
      
      <form onSubmit={handleSubmit}>
        {/* カード所有者名フィールド */}
        <div className="mb-4">
          <label htmlFor="cardholderName" className="block text-sm font-medium text-gray-700 mb-1">
            カード名義
          </label>
          <input
            id="cardholderName"
            name="cardholderName"
            type="text"
            className={`w-full p-3 border ${formErrors.cardholderName ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-gray-500 focus:border-gray-500`}
            placeholder="TARO YAMADA"
            value={formData.cardholderName}
            onChange={handleInputChange}
          />
          {formErrors.cardholderName && (
            <p className="mt-1 text-xs text-red-500">{formErrors.cardholderName}</p>
          )}
        </div>
        
        {/* Stripeカード要素（実際にはStripe Elements との統合が必要） */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            カード情報
          </label>
          <div className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 h-12 flex items-center">
            <CreditCard size={20} className="text-gray-400 mr-2" />
            <span className="text-gray-500">**** **** **** 4242</span>
          </div>
          {cardError && (
            <p className="mt-1 text-xs text-red-500">{cardError}</p>
          )}
        </div>
        
        {/* カード保存チェックボックス */}
        <div className="mb-6">
          <div className="flex items-center">
            <input
              id="saveCard"
              name="saveCard"
              type="checkbox"
              className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
              checked={formData.saveCard}
              onChange={handleInputChange}
            />
            <label htmlFor="saveCard" className="ml-2 block text-sm text-gray-700">
              このカードを保存する
            </label>
          </div>
        </div>
        
        {/* エラーメッセージ */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start">
            <AlertCircle size={20} className="text-red-500 mr-2 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}
        
        {/* 成功メッセージ（テスト用） */}
        {cardComplete && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-start">
            <CheckCircle size={20} className="text-green-500 mr-2 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-green-700">カード情報の入力が完了しました</p>
          </div>
        )}
        
        {/* ボタン */}
        <div className="flex space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-3 border border-gray-300 rounded-lg font-medium"
            disabled={isLoading}
          >
            キャンセル
          </button>
          <button
            type="submit"
            className="flex-1 py-3 bg-black text-white rounded-lg font-medium disabled:bg-gray-400"
            disabled={isLoading || !cardComplete}
          >
            {isLoading ? '処理中...' : '支払いを確定'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PaymentForm;
