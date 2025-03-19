import React, { useState } from 'react';
import { QRCodeData, PaymentFormErrors } from '../../types/payment';
import { QR_PAYMENT_METHODS } from '../../utils/paymentUtils';

interface QRCodeFormProps {
  onDataChange: (data: any) => void;
  errors: PaymentFormErrors;
  disabled?: boolean;
  onBlur?: (fieldName: string, value: string, formContext: any) => void;
  fieldStatus?: Record<string, 'valid' | 'invalid' | 'initial'>;
}

const QRCodeForm: React.FC<QRCodeFormProps> = ({
  onDataChange,
  errors,
  disabled = false,
  onBlur,
  fieldStatus = {}
}) => {
  const [formData, setFormData] = useState<QRCodeData>({
    providerType: '',
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
    switch (fieldName) {
      case 'providerType':
        if (value && onBlur) {
          onBlur(fieldName, value, formData);
        }
        break;
      case 'customerEmail':
        if (value.includes('@') && value.includes('.') && onBlur) {
          onBlur(fieldName, value, formData);
        }
        break;
      case 'customerPhone':
        // 電話番号は任意なので、入力された場合のみバリデーション
        if (value && value.replace(/[^0-9]/g, '').length >= 10 && onBlur) {
          onBlur(fieldName, value, formData);
        } else if (!value && onBlur) {
          // 空の場合もvalidとして扱う（任意項目）
          onBlur(fieldName, value, formData);
        }
        break;
    }
  };

  // QRコードのプレースホルダー画像URL
  const qrPlaceholderUrl = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="150" height="150" viewBox="0 0 150 150"><rect width="150" height="150" fill="none" stroke="%23ccc" stroke-width="2"/><text x="75" y="75" font-family="Arial" font-size="14" text-anchor="middle" fill="%23999">QRコード</text><text x="75" y="95" font-family="Arial" font-size="14" text-anchor="middle" fill="%23999">表示エリア</text></svg>';
  
  return (
    <div className="space-y-4 p-4 bg-white rounded-lg border">
      <div>
        <h3 className="text-lg font-medium">QRコード決済</h3>
        <p className="text-sm text-gray-500 mt-1">
          お好みのQRコード決済サービスを選択し、支払い情報を入力してください。
        </p>
      </div>

      <div className="space-y-4">
        {/* QR決済サービス選択 */}
        <div className="space-y-2">
          <label htmlFor="providerType" className="block text-sm font-medium text-gray-700">
            QRコード決済サービス
          </label>
          <select
            id="providerType"
            name="providerType"
            value={formData.providerType}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={disabled}
            className={`mt-1 block w-full border ${
              errors.providerType ? 'border-red-500' : fieldStatus.providerType === 'valid' ? 'border-green-500' : 'border-gray-300'
            } rounded-md shadow-sm px-3 py-2 focus:outline-none ${fieldStatus.providerType === 'valid' ? 'bg-green-50' : ''} ${
              disabled ? 'bg-gray-100' : 'focus:ring-blue-500 focus:border-blue-500'
            }`}
            aria-invalid={!!errors.providerType}
            aria-describedby={errors.providerType ? 'providerType-error' : undefined}
          >
            <option value="">決済サービスを選択</option>
            {QR_PAYMENT_METHODS.map((method) => (
              <option key={method.id} value={method.id}>
                {method.name}
              </option>
            ))}
          </select>
          {errors.providerType && (
            <p id="providerType-error" className="mt-1 text-sm text-red-600">
              {errors.providerType}
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
          <p className="text-sm text-gray-500">QRコード情報をこちらのメールアドレスに送信します</p>
        </div>

        {/* 電話番号（オプション） */}
        <div className="space-y-2">
          <label htmlFor="customerPhone" className="block text-sm font-medium text-gray-700">
            電話番号（任意）
          </label>
          <input
            type="tel"
            id="customerPhone"
            name="customerPhone"
            value={formData.customerPhone || ''}
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

      {/* QRコード表示エリア（決済サービス選択後） */}
      {formData.providerType && (
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-700 mb-3">
            以下のQRコードを{QR_PAYMENT_METHODS.find(m => m.id === formData.providerType)?.name || '選択したサービス'}アプリでスキャンしてください
          </p>
          <div className="inline-block p-4 bg-white border rounded-lg">
            <img src={qrPlaceholderUrl} alt="QRコード" className="w-40 h-40" />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            ※ 実際のQRコードは決済開始時に生成されます
          </p>
        </div>
      )}

      <div className="text-sm text-gray-700 rounded-md bg-gray-50 p-3 mt-4">
        <p className="font-medium">お支払い期限</p>
        <p className="mt-1">
          {new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toLocaleDateString('ja-JP', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}　まで
        </p>
        <p className="mt-2 text-xs text-gray-500">
          ※ QRコードの有効期限は24時間です。期限を過ぎると予約は自動的にキャンセルとなります。
        </p>
      </div>
    </div>
  );
};

export default QRCodeForm;
