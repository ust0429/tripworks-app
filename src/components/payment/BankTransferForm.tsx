import React, { useState } from 'react';
import { Copy } from 'lucide-react';
import { BankTransferData, PaymentFormErrors } from '../../types/payment';

interface BankTransferFormProps {
  onDataChange: (data: BankTransferData) => void;
  errors: PaymentFormErrors;
  amount: number;
  disabled?: boolean;
  onBlur?: (fieldName: string, value: string, formContext: any) => void;
  fieldStatus?: Record<string, 'valid' | 'invalid' | 'initial'>;
}

const BankTransferForm: React.FC<BankTransferFormProps> = ({
  onDataChange,
  errors,
  amount,
  disabled = false,
  onBlur,
  fieldStatus = {}
}) => {
  const [formData, setFormData] = useState<BankTransferData>({
    customerName: '',
    customerEmail: ''
  });

  const [copySuccess, setCopySuccess] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (onBlur) {
      onBlur(name, value, formData);
    }
  };
  
  // 簡易バリデーション
  const performLightValidation = (fieldName: string, value: string) => {
    switch (fieldName) {
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
    }
  };

  // 口座情報
  const bankInfo = {
    bankName: 'echo銀行',
    branchName: '代々木支店',
    accountType: '普通',
    accountNumber: '1234567',
    accountName: 'カ）エコー'
  };

  // 振込人名の推奨フォーマット
  const transferNameFormat = `EC${Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, '0')}`;

  // 情報コピー機能
  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text).then(
      () => {
        setCopySuccess(`${field}をコピーしました`);
        setTimeout(() => setCopySuccess(null), 2000);
      },
      () => {
        setCopySuccess('コピーに失敗しました');
      }
    );
  };

  return (
    <div className="space-y-4 p-4 bg-white rounded-lg border">
      <div>
        <h3 className="text-lg font-medium">銀行振込情報</h3>
        <p className="text-sm text-gray-500 mt-1">
          下記の口座情報へお支払い期限までにお振込みください。
        </p>
      </div>

      <div className="bg-gray-50 p-4 rounded-md space-y-3">
        <h4 className="font-medium text-gray-700">振込先口座情報</h4>

        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-500">銀行名</p>
            <p className="font-medium">{bankInfo.bankName}</p>
          </div>
          <button
            type="button"
            onClick={() => copyToClipboard(bankInfo.bankName, '銀行名')}
            className="text-blue-600 hover:text-blue-800 p-1"
            aria-label="銀行名をコピー"
          >
            <Copy className="w-4 h-4" />
          </button>
        </div>

        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-500">支店名</p>
            <p className="font-medium">{bankInfo.branchName}</p>
          </div>
          <button
            type="button"
            onClick={() => copyToClipboard(bankInfo.branchName, '支店名')}
            className="text-blue-600 hover:text-blue-800 p-1"
            aria-label="支店名をコピー"
          >
            <Copy className="w-4 h-4" />
          </button>
        </div>

        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-500">口座種別</p>
            <p className="font-medium">{bankInfo.accountType}</p>
          </div>
          <button
            type="button"
            onClick={() => copyToClipboard(bankInfo.accountType, '口座種別')}
            className="text-blue-600 hover:text-blue-800 p-1"
            aria-label="口座種別をコピー"
          >
            <Copy className="w-4 h-4" />
          </button>
        </div>

        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-500">口座番号</p>
            <p className="font-medium">{bankInfo.accountNumber}</p>
          </div>
          <button
            type="button"
            onClick={() => copyToClipboard(bankInfo.accountNumber, '口座番号')}
            className="text-blue-600 hover:text-blue-800 p-1"
            aria-label="口座番号をコピー"
          >
            <Copy className="w-4 h-4" />
          </button>
        </div>

        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-500">口座名義</p>
            <p className="font-medium">{bankInfo.accountName}</p>
          </div>
          <button
            type="button"
            onClick={() => copyToClipboard(bankInfo.accountName, '口座名義')}
            className="text-blue-600 hover:text-blue-800 p-1"
            aria-label="口座名義をコピー"
          >
            <Copy className="w-4 h-4" />
          </button>
        </div>

        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-500">振込金額</p>
            <p className="font-medium">
              {amount.toLocaleString()}円（税込）
            </p>
          </div>
          <button
            type="button"
            onClick={() => copyToClipboard(`${amount.toLocaleString()}円`, '振込金額')}
            className="text-blue-600 hover:text-blue-800 p-1"
            aria-label="振込金額をコピー"
          >
            <Copy className="w-4 h-4" />
          </button>
        </div>

        <div className="pt-2">
          <p className="text-sm text-gray-500">振込人名（推奨）</p>
          <div className="flex items-center space-x-2 mt-1">
            <p className="font-medium">{transferNameFormat}</p>
            <button
              type="button"
              onClick={() => copyToClipboard(transferNameFormat, '振込人名')}
              className="text-blue-600 hover:text-blue-800 p-1"
              aria-label="振込人名をコピー"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            ※ お名前の前に上記の番号を付けていただくとお支払いの確認がスムーズです
          </p>
        </div>

        {copySuccess && (
          <div className="fixed bottom-4 right-4 bg-green-100 text-green-800 px-4 py-2 rounded-md shadow-lg">
            {copySuccess}
          </div>
        )}
      </div>

      <div className="space-y-4 mt-4">
        {/* お名前 */}
        <div className="space-y-2">
          <label htmlFor="customerName" className="block text-sm font-medium text-gray-700">
            振込予定者名
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
            placeholder={`例：${transferNameFormat} 山田太郎`}
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
          <p className="text-sm text-gray-500">入金確認後、こちらのメールアドレスに通知します</p>
        </div>
      </div>

      <div className="text-sm text-gray-700 rounded-md bg-gray-50 p-3 mt-4">
        <p className="font-medium">お支払い期限</p>
        <p className="mt-1">
          {new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('ja-JP', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}　まで
        </p>
        <p className="mt-2 text-xs text-gray-500">
          ※ お支払い期限を過ぎると予約は自動的にキャンセルとなります。
        </p>
      </div>
    </div>
  );
};

export default BankTransferForm;
