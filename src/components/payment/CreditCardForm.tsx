import React, { useState, useEffect } from 'react';
import { CreditCardData, PaymentFormErrors } from '../../types/payment';
import { validateCardNumber, validateExpiryDate, validateCVC, detectCardType, formatCardNumber } from '../../utils/paymentUtils';

interface CreditCardFormProps {
  onDataChange: (data: CreditCardData) => void;
  errors: PaymentFormErrors;
  disabled?: boolean;
}

const CreditCardForm: React.FC<CreditCardFormProps> = ({ 
  onDataChange, 
  errors, 
  disabled = false 
}) => {
  const [formData, setFormData] = useState<CreditCardData>({
    cardNumber: '',
    cardholderName: '',
    expiryMonth: '',
    expiryYear: '',
    cvc: ''
  });

  const [cardType, setCardType] = useState<string>('unknown');
  const [formattedCardNumber, setFormattedCardNumber] = useState<string>('');

  // 入力変更時の処理
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // カード番号の場合は特別処理
    if (name === 'cardNumber') {
      // 数字とスペースのみ許可
      const filteredValue = value.replace(/[^\d\s]/g, '');
      // フォーマット
      const formatted = formatCardNumber(filteredValue.replace(/\s/g, ''));
      setFormattedCardNumber(formatted);
      
      // 内部データはスペースなしで保存
      const newFormData = {
        ...formData,
        [name]: filteredValue.replace(/\s/g, '')
      };
      setFormData(newFormData);
      
      // カード種類の検出
      const detectedType = detectCardType(newFormData.cardNumber);
      setCardType(detectedType);
      
      onDataChange(newFormData);
    } else {
      const newFormData = { ...formData, [name]: value };
      setFormData(newFormData);
      onDataChange(newFormData);
    }
  };

  // カード会社のロゴマップ
  const cardLogos: Record<string, string> = {
    visa: '💳 Visa',
    mastercard: '💳 Mastercard',
    amex: '💳 American Express',
    jcb: '💳 JCB',
    discover: '💳 Discover',
    diners: '💳 Diners Club',
    unknown: '💳'
  };

  // 有効期限の月と年の選択肢を生成
  const currentYear = new Date().getFullYear();
  const monthOptions = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    return (
      <option key={month} value={month.toString().padStart(2, '0')}>
        {month.toString().padStart(2, '0')}
      </option>
    );
  });

  const yearOptions = Array.from({ length: 11 }, (_, i) => {
    const year = currentYear + i;
    return (
      <option key={year} value={year.toString().slice(-2)}>
        {year}
      </option>
    );
  });

  // 外部からのカード情報復元の対応
  useEffect(() => {
    if (formData.cardNumber) {
      setFormattedCardNumber(formatCardNumber(formData.cardNumber));
      setCardType(detectCardType(formData.cardNumber));
    }
  }, []);

  return (
    <div className="space-y-4 p-4 bg-white rounded-lg border">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">クレジットカード情報</h3>
        <div className="text-right text-sm font-medium text-gray-500">
          {cardLogos[cardType]}
        </div>
      </div>

      <div className="space-y-4">
        {/* カード番号 */}
        <div className="space-y-2">
          <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700">
            カード番号
          </label>
          <input
            type="text"
            id="cardNumber"
            name="cardNumber"
            value={formattedCardNumber}
            onChange={handleChange}
            maxLength={25} // カード会社によるフォーマットの違いを考慮
            disabled={disabled}
            autoComplete="cc-number"
            className={`mt-1 block w-full border ${
              errors.cardNumber ? 'border-red-500' : 'border-gray-300'
            } rounded-md shadow-sm px-3 py-2 focus:outline-none ${
              disabled ? 'bg-gray-100' : 'focus:ring-blue-500 focus:border-blue-500'
            }`}
            placeholder="1234 5678 9012 3456"
            aria-invalid={!!errors.cardNumber}
            aria-describedby={errors.cardNumber ? 'cardNumber-error' : undefined}
          />
          {errors.cardNumber && (
            <p id="cardNumber-error" className="mt-1 text-sm text-red-600">
              {errors.cardNumber}
            </p>
          )}
        </div>

        {/* カード名義 */}
        <div className="space-y-2">
          <label htmlFor="cardholderName" className="block text-sm font-medium text-gray-700">
            カード名義（ローマ字）
          </label>
          <input
            type="text"
            id="cardholderName"
            name="cardholderName"
            value={formData.cardholderName}
            onChange={handleChange}
            disabled={disabled}
            autoComplete="cc-name"
            className={`mt-1 block w-full border ${
              errors.cardholderName ? 'border-red-500' : 'border-gray-300'
            } rounded-md shadow-sm px-3 py-2 focus:outline-none ${
              disabled ? 'bg-gray-100' : 'focus:ring-blue-500 focus:border-blue-500'
            }`}
            placeholder="TARO YAMADA"
            aria-invalid={!!errors.cardholderName}
            aria-describedby={errors.cardholderName ? 'cardholderName-error' : undefined}
          />
          {errors.cardholderName && (
            <p id="cardholderName-error" className="mt-1 text-sm text-red-600">
              {errors.cardholderName}
            </p>
          )}
        </div>

        {/* 有効期限とCVC */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="expiryMonth" className="block text-sm font-medium text-gray-700">
              有効期限
            </label>
            <div className="flex space-x-2">
              <select
                id="expiryMonth"
                name="expiryMonth"
                value={formData.expiryMonth}
                onChange={handleChange}
                disabled={disabled}
                aria-label="有効期限（月）"
                autoComplete="cc-exp-month"
                className={`mt-1 block w-full border ${
                  errors.expiryMonth ? 'border-red-500' : 'border-gray-300'
                } rounded-md shadow-sm px-3 py-2 focus:outline-none ${
                  disabled ? 'bg-gray-100' : 'focus:ring-blue-500 focus:border-blue-500'
                }`}
                aria-invalid={!!errors.expiryMonth}
              >
                <option value="">月</option>
                {monthOptions}
              </select>
              <span className="self-center">/</span>
              <select
                id="expiryYear"
                name="expiryYear"
                value={formData.expiryYear}
                onChange={handleChange}
                disabled={disabled}
                aria-label="有効期限（年）"
                autoComplete="cc-exp-year"
                className={`mt-1 block w-full border ${
                  errors.expiryYear ? 'border-red-500' : 'border-gray-300'
                } rounded-md shadow-sm px-3 py-2 focus:outline-none ${
                  disabled ? 'bg-gray-100' : 'focus:ring-blue-500 focus:border-blue-500'
                }`}
                aria-invalid={!!errors.expiryYear}
              >
                <option value="">年</option>
                {yearOptions}
              </select>
            </div>
            {(errors.expiryMonth || errors.expiryYear) && (
              <p id="expiry-error" className="mt-1 text-sm text-red-600">
                {errors.expiryMonth || errors.expiryYear}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="cvc" className="block text-sm font-medium text-gray-700">
              セキュリティコード
            </label>
            <input
              type="text"
              id="cvc"
              name="cvc"
              value={formData.cvc}
              onChange={handleChange}
              maxLength={cardType === 'amex' ? 4 : 3}
              disabled={disabled}
              autoComplete="cc-csc"
              className={`mt-1 block w-full border ${
                errors.cvc ? 'border-red-500' : 'border-gray-300'
              } rounded-md shadow-sm px-3 py-2 focus:outline-none ${
                disabled ? 'bg-gray-100' : 'focus:ring-blue-500 focus:border-blue-500'
              }`}
              placeholder={cardType === 'amex' ? '4桁' : '3桁'}
              aria-invalid={!!errors.cvc}
              aria-describedby={errors.cvc ? 'cvc-error' : undefined}
            />
            {errors.cvc && (
              <p id="cvc-error" className="mt-1 text-sm text-red-600">
                {errors.cvc}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="text-sm text-gray-500 mt-4">
        ※ 決済情報は安全に処理され、サーバーには保存されません。
      </div>
    </div>
  );
};

export default CreditCardForm;
