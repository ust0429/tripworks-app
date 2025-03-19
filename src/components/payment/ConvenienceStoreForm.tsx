import React, { useState } from 'react';
import { ConvenienceStoreData, PaymentFormErrors } from '../../types/payment';
import { CONVENIENCE_STORES } from '../../utils/paymentUtils';

interface ConvenienceStoreFormProps {
  onDataChange: (data: ConvenienceStoreData) => void;
  errors: PaymentFormErrors;
  disabled?: boolean;
  onBlur?: (fieldName: string, value: string, formContext: any) => void;
  fieldStatus?: Record<string, 'valid' | 'invalid' | 'initial'>;
}

const ConvenienceStoreForm: React.FC<ConvenienceStoreFormProps> = ({
  onDataChange,
  errors,
  disabled = false,
  onBlur,
  fieldStatus = {}
}) => {
  const [formData, setFormData] = useState<ConvenienceStoreData>({
    storeType: '',
    customerName: '',
    customerEmail: '',
    customerPhone: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const newFormData = { ...formData, [name]: value };
    setFormData(newFormData);
    onDataChange(newFormData);
    
    // リアルタイムバリデーション（簡易的な検証をフィールド変更時に行う）
    if (value.trim() !== '') {
      performLightValidation(name, value);
    }
  };
  
  // フィールドからフォーカスが外れた時の処理
  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (onBlur) {
      onBlur(name, value, formData);
    }
  };
  
  // 簡易バリデーション
  const performLightValidation = (fieldName: string, value: string) => {
    // フィールド固有の基本検証
    switch (fieldName) {
      case 'storeType':
        if (value && onBlur) {
          onBlur(fieldName, value, formData);
        }
        break;
      case 'customerName':
        if (value.trim().length >= 2 && onBlur) {
          onBlur(fieldName, value, formData);
        }
        break;
      case 'customerEmail':
        if (value.includes('@') && value.includes('.') && onBlur) {
          onBlur(fieldName, value, formData);
        }
        break;
      case 'customerPhone':
        // 電話番号形式の簡易チェック
        if (value.replace(/[^0-9]/g, '').length >= 10 && onBlur) {
          onBlur(fieldName, value, formData);
        }
        break;
    }
  };

  return (
    <div className="space-y-4 p-4 bg-white rounded-lg border">
      <div>
        <h3 className="text-lg font-medium">コンビニ支払い情報</h3>
        <p className="text-sm text-gray-500 mt-1">
          支払い情報を入力すると、お支払い番号が発行されます。選択したコンビニで期限内にお支払いください。
        </p>
      </div>

      <div className="space-y-4">
        {/* コンビニ選択 */}
        <div className="space-y-2">
          <label htmlFor="storeType" className="block text-sm font-medium text-gray-700">
            お支払いコンビニ
          </label>
          <select
            id="storeType"
            name="storeType"
            value={formData.storeType}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={disabled}
            className={`mt-1 block w-full border ${
              errors.storeType ? 'border-red-500' : fieldStatus.storeType === 'valid' ? 'border-green-500' : 'border-gray-300'
            } rounded-md shadow-sm px-3 py-2 focus:outline-none ${fieldStatus.storeType === 'valid' ? 'bg-green-50' : ''} ${
              disabled ? 'bg-gray-100' : 'focus:ring-blue-500 focus:border-blue-500'
            }`}
            aria-invalid={!!errors.storeType}
            aria-describedby={errors.storeType ? 'storeType-error' : undefined}
          >
            <option value="">コンビニを選択</option>
            {CONVENIENCE_STORES.map((store) => (
              <option key={store.id} value={store.id}>
                {store.name}
              </option>
            ))}
          </select>
          {errors.storeType && (
            <p id="storeType-error" className="mt-1 text-sm text-red-600">
              {errors.storeType}
            </p>
          )}
        </div>

        {/* お名前 */}
        <div className="space-y-2">
          <label htmlFor="customerName" className="block text-sm font-medium text-gray-700">
            お名前（漢字）
          </label>
          <input
            type="text"
            id="customerName"
            name="customerName"
            value={formData.customerName}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={disabled}
            className={`mt-1 block w-full border ${
              errors.customerName ? 'border-red-500' : fieldStatus.customerName === 'valid' ? 'border-green-500' : 'border-gray-300'
            } rounded-md shadow-sm px-3 py-2 focus:outline-none ${fieldStatus.customerName === 'valid' ? 'bg-green-50' : ''} ${
              disabled ? 'bg-gray-100' : 'focus:ring-blue-500 focus:border-blue-500'
            }`}
            placeholder="例：山田 太郎"
            aria-invalid={!!errors.customerName}
            aria-describedby={errors.customerName ? 'customerName-error' : undefined}
          />
          {errors.customerName && (
            <p id="customerName-error" className="mt-1 text-sm text-red-600">
              {errors.customerName}
            </p>
          )}
        </div>

        {/* メールアドレス */}
        <div className="space-y-2">
          <label htmlFor="customerEmail" className="block text-sm font-medium text-gray-700">
            メールアドレス
          </label>
          <input
            type="email"
            id="customerEmail"
            name="customerEmail"
            value={formData.customerEmail}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={disabled}
            className={`mt-1 block w-full border ${
              errors.customerEmail ? 'border-red-500' : fieldStatus.customerEmail === 'valid' ? 'border-green-500' : 'border-gray-300'
            } rounded-md shadow-sm px-3 py-2 focus:outline-none ${fieldStatus.customerEmail === 'valid' ? 'bg-green-50' : ''} ${
              disabled ? 'bg-gray-100' : 'focus:ring-blue-500 focus:border-blue-500'
            }`}
            placeholder="例：example@example.com"
            aria-invalid={!!errors.customerEmail}
            aria-describedby={errors.customerEmail ? 'customerEmail-error' : undefined}
          />
          {errors.customerEmail && (
            <p id="customerEmail-error" className="mt-1 text-sm text-red-600">
              {errors.customerEmail}
            </p>
          )}
          <p className="text-sm text-gray-500">お支払い情報をこちらのメールアドレスに送信します</p>
        </div>

        {/* 電話番号 */}
        <div className="space-y-2">
          <label htmlFor="customerPhone" className="block text-sm font-medium text-gray-700">
            電話番号
          </label>
          <input
            type="tel"
            id="customerPhone"
            name="customerPhone"
            value={formData.customerPhone}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={disabled}
            className={`mt-1 block w-full border ${
              errors.customerPhone ? 'border-red-500' : fieldStatus.customerPhone === 'valid' ? 'border-green-500' : 'border-gray-300'
            } rounded-md shadow-sm px-3 py-2 focus:outline-none ${fieldStatus.customerPhone === 'valid' ? 'bg-green-50' : ''} ${
              disabled ? 'bg-gray-100' : 'focus:ring-blue-500 focus:border-blue-500'
            }`}
            placeholder="例：09012345678"
            aria-invalid={!!errors.customerPhone}
            aria-describedby={errors.customerPhone ? 'customerPhone-error' : undefined}
          />
          {errors.customerPhone && (
            <p id="customerPhone-error" className="mt-1 text-sm text-red-600">
              {errors.customerPhone}
            </p>
          )}
        </div>
      </div>

      <div className="text-sm text-gray-700 rounded-md bg-gray-50 p-3 mt-4">
        <p className="font-medium">お支払い期限</p>
        <p className="mt-1">
          {new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('ja-JP', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}　まで
        </p>
        <p className="mt-2 text-xs text-gray-500">
          ※ お支払い期限を過ぎると予約は自動的にキャンセルとなります。
        </p>
      </div>
    </div>
  );
};

export default ConvenienceStoreForm;
