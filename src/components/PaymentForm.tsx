import React, { useState } from 'react';
import { 
  CreditCard, 
  Store, 
  Building2, 
  AlertCircle, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp, 
  Calendar 
} from 'lucide-react';

// 決済方法の型定義
export type PaymentMethodType = 'credit_card' | 'convenience' | 'bank_transfer' | 'qr_code';

// 決済エラーの型定義
export interface PaymentError {
  field?: string;
  message: string;
  type: 'error' | 'warning';
}

interface PaymentFormProps {
  totalAmount: number;
  onPaymentSubmit: (paymentData: PaymentData) => Promise<void>;
  onCancel: () => void;
}

export interface PaymentData {
  method: PaymentMethodType;
  cardDetails?: {
    number: string;
    name: string;
    expiry: string;
    cvc: string;
  };
  saveCard?: boolean;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ 
  totalAmount, 
  onPaymentSubmit, 
  onCancel 
}) => {
  // 状態管理
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('credit_card');
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCvc] = useState('');
  const [saveCard, setSaveCard] = useState(false);
  const [errors, setErrors] = useState<PaymentError[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showDetails, setShowDetails] = useState<PaymentMethodType | null>('credit_card');

  // カード番号の書式設定（4桁ごとにスペース）
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts: string[] = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  // 有効期限の書式設定（MM/YY）
  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    
    if (v.length >= 2) {
      return `${v.substring(0, 2)}/${v.substring(2, 4)}`;
    }
    
    return v;
  };

  // 決済方法の切り替え
  const handleMethodChange = (method: PaymentMethodType) => {
    setPaymentMethod(method);
    setShowDetails(method);
    setErrors([]);
  };

  // 入力検証
  const validateForm = (): boolean => {
    const newErrors: PaymentError[] = [];

    if (paymentMethod === 'credit_card') {
      // カード番号のバリデーション（基本的な長さと数字のみチェック）
      if (cardNumber.replace(/\s/g, '').length < 16) {
        newErrors.push({
          field: 'cardNumber',
          message: 'カード番号が正しくありません',
          type: 'error'
        });
      }

      // 名義人のバリデーション（空欄チェック）
      if (cardName.trim() === '') {
        newErrors.push({
          field: 'cardName',
          message: 'カード名義を入力してください',
          type: 'error'
        });
      }

      // 有効期限のバリデーション
      if (!cardExpiry.match(/^\d{2}\/\d{2}$/)) {
        newErrors.push({
          field: 'cardExpiry',
          message: '有効期限が正しくありません',
          type: 'error'
        });
      } else {
        const [month, year] = cardExpiry.split('/');
        const currentYear = new Date().getFullYear() % 100;
        const currentMonth = new Date().getMonth() + 1;
        
        if (parseInt(year) < currentYear || 
           (parseInt(year) === currentYear && parseInt(month) < currentMonth) ||
           parseInt(month) > 12 || parseInt(month) < 1) {
          newErrors.push({
            field: 'cardExpiry',
            message: '有効期限が過ぎています',
            type: 'error'
          });
        }
      }

      // セキュリティコードのバリデーション
      if (!cardCvc.match(/^\d{3,4}$/)) {
        newErrors.push({
          field: 'cardCvc',
          message: 'セキュリティコードが正しくありません',
          type: 'error'
        });
      }
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  // 決済実行
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsProcessing(true);

    try {
      const paymentData: PaymentData = {
        method: paymentMethod,
      };

      if (paymentMethod === 'credit_card') {
        paymentData.cardDetails = {
          number: cardNumber.replace(/\s/g, ''),
          name: cardName,
          expiry: cardExpiry,
          cvc: cardCvc,
        };
        paymentData.saveCard = saveCard;
      }

      await onPaymentSubmit(paymentData);
    } catch (error) {
      console.error('決済処理エラー:', error);
      setErrors([{
        message: '決済処理中にエラーが発生しました。もう一度お試しください。',
        type: 'error'
      }]);
    } finally {
      setIsProcessing(false);
    }
  };

  // 決済方法の詳細表示を切り替え
  const toggleMethodDetails = (method: PaymentMethodType) => {
    setShowDetails(showDetails === method ? null : method);
  };

  // 各決済方法のコンポーネント
  const renderPaymentMethodDetails = () => {
    switch (paymentMethod) {
      case 'credit_card':
        return showDetails === 'credit_card' ? (
          <div className="mt-4 space-y-4">
            <div>
              <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-1">
                カード番号
              </label>
              <input
                id="cardNumber"
                type="text"
                value={cardNumber}
                onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                maxLength={19}
                placeholder="0000 0000 0000 0000"
                className={`w-full p-3 border rounded-lg ${
                  errors.some(e => e.field === 'cardNumber') ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.some(e => e.field === 'cardNumber') && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.find(e => e.field === 'cardNumber')?.message}
                </p>
              )}
            </div>
            
            <div>
              <label htmlFor="cardName" className="block text-sm font-medium text-gray-700 mb-1">
                カード名義
              </label>
              <input
                id="cardName"
                type="text"
                value={cardName}
                onChange={(e) => setCardName(e.target.value.toUpperCase())}
                placeholder="TARO YAMADA"
                className={`w-full p-3 border rounded-lg ${
                  errors.some(e => e.field === 'cardName') ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.some(e => e.field === 'cardName') && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.find(e => e.field === 'cardName')?.message}
                </p>
              )}
            </div>
            
            <div className="flex space-x-4">
              <div className="flex-1">
                <label htmlFor="cardExpiry" className="block text-sm font-medium text-gray-700 mb-1">
                  有効期限
                </label>
                <div className="relative">
                  <input
                    id="cardExpiry"
                    type="text"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                    placeholder="MM/YY"
                    maxLength={5}
                    className={`w-full p-3 border rounded-lg ${
                      errors.some(e => e.field === 'cardExpiry') ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  <Calendar className="absolute right-3 top-3 text-gray-400" size={18} />
                </div>
                {errors.some(e => e.field === 'cardExpiry') && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.find(e => e.field === 'cardExpiry')?.message}
                  </p>
                )}
              </div>
              
              <div className="flex-1">
                <label htmlFor="cvc" className="block text-sm font-medium text-gray-700 mb-1">
                  セキュリティコード
                </label>
                <input
                  id="cvc"
                  type="text"
                  value={cardCvc}
                  onChange={(e) => setCvc(e.target.value.replace(/\D/g, '').substring(0, 4))}
                  placeholder="123"
                  maxLength={4}
                  className={`w-full p-3 border rounded-lg ${
                    errors.some(e => e.field === 'cardCvc') ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.some(e => e.field === 'cardCvc') && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.find(e => e.field === 'cardCvc')?.message}
                  </p>
                )}
              </div>
            </div>
            
            <div className="mt-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={saveCard}
                  onChange={() => setSaveCard(!saveCard)}
                  className="mr-2 h-4 w-4"
                />
                <span className="text-sm text-gray-700">
                  次回のために支払い情報を保存する
                </span>
              </label>
            </div>
          </div>
        ) : null;
        
      case 'convenience':
        return showDetails === 'convenience' ? (
          <div className="mt-4 space-y-4 bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-700">
              決済確定後、コンビニ支払いに必要な情報をメールでお送りします。
            </p>
            <p className="text-gray-700">
              以下のコンビニでお支払いいただけます：
            </p>
            <div className="flex flex-wrap gap-2 mt-2">
              <div className="bg-white p-2 rounded border border-gray-200 text-xs">セブン-イレブン</div>
              <div className="bg-white p-2 rounded border border-gray-200 text-xs">ローソン</div>
              <div className="bg-white p-2 rounded border border-gray-200 text-xs">ファミリーマート</div>
              <div className="bg-white p-2 rounded border border-gray-200 text-xs">ミニストップ</div>
              <div className="bg-white p-2 rounded border border-gray-200 text-xs">デイリーヤマザキ</div>
            </div>
            <div className="text-sm bg-yellow-50 border border-yellow-100 rounded p-3 flex items-start">
              <AlertCircle size={16} className="text-yellow-500 mt-0.5 mr-2 flex-shrink-0" />
              <p className="text-yellow-700">
                お支払い期限は予約確定から3日以内です。期限を過ぎると予約はキャンセルされます。
              </p>
            </div>
          </div>
        ) : null;
          
      case 'bank_transfer':
        return showDetails === 'bank_transfer' ? (
          <div className="mt-4 space-y-4 bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-700">
              決済確定後、振込先の情報をメールでお送りします。
            </p>
            <div className="mt-2 space-y-2">
              <p className="text-sm font-medium">振込先情報</p>
              <div className="grid grid-cols-3 text-sm">
                <span className="text-gray-500">銀行名</span>
                <span className="col-span-2">echo銀行</span>
              </div>
              <div className="grid grid-cols-3 text-sm">
                <span className="text-gray-500">支店名</span>
                <span className="col-span-2">体験支店</span>
              </div>
              <div className="grid grid-cols-3 text-sm">
                <span className="text-gray-500">口座種別</span>
                <span className="col-span-2">普通</span>
              </div>
              <div className="grid grid-cols-3 text-sm">
                <span className="text-gray-500">口座番号</span>
                <span className="col-span-2">予約確定後にメールでお知らせします</span>
              </div>
              <div className="grid grid-cols-3 text-sm">
                <span className="text-gray-500">口座名義</span>
                <span className="col-span-2">(カ) エコー</span>
              </div>
            </div>
            <div className="text-sm bg-yellow-50 border border-yellow-100 rounded p-3 flex items-start">
              <AlertCircle size={16} className="text-yellow-500 mt-0.5 mr-2 flex-shrink-0" />
              <p className="text-yellow-700">
                お振込期限は予約確定から3日以内です。期限を過ぎると予約はキャンセルされます。振込手数料はお客様負担となります。
              </p>
            </div>
          </div>
        ) : null;

      case 'qr_code':
        return showDetails === 'qr_code' ? (
          <div className="mt-4 space-y-4 bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-700">
              決済確定後、QRコード決済に必要な情報を表示します。
            </p>
            <div className="flex flex-wrap gap-2 mt-2">
              <div className="bg-white p-2 rounded border border-gray-200 text-xs">PayPay</div>
              <div className="bg-white p-2 rounded border border-gray-200 text-xs">LINE Pay</div>
              <div className="bg-white p-2 rounded border border-gray-200 text-xs">メルペイ</div>
              <div className="bg-white p-2 rounded border border-gray-200 text-xs">楽天ペイ</div>
              <div className="bg-white p-2 rounded border border-gray-200 text-xs">au PAY</div>
              <div className="bg-white p-2 rounded border border-gray-200 text-xs">d払い</div>
            </div>
            <div className="text-sm bg-blue-50 border border-blue-100 rounded p-3 flex items-start">
              <CheckCircle2 size={16} className="text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
              <p className="text-blue-700">
                決済は即時反映されます。アプリに戻って決済を完了してください。
              </p>
            </div>
          </div>
        ) : null;

      default:
        return null;
    }
  };

  return (
    <div>
      <h2 className="text-lg font-bold mb-4">お支払い方法</h2>
      
      {/* 全体のエラーメッセージ */}
      {errors.some(e => !e.field) && (
        <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg flex items-start text-sm">
          <AlertCircle size={18} className="text-red-500 mr-2 mt-0.5 flex-shrink-0" />
          <p className="text-red-700">
            {errors.find(e => !e.field)?.message}
          </p>
        </div>
      )}
      
      {/* 決済方法選択 */}
      <div className="space-y-3">
        <div 
          className={`border ${paymentMethod === 'credit_card' ? 'border-black bg-gray-50' : 'border-gray-300'} rounded-lg overflow-hidden`}
        >
          <button
            type="button"
            onClick={() => handleMethodChange('credit_card')}
            className="flex items-center justify-between w-full p-4"
          >
            <div className="flex items-center">
              <input
                type="radio"
                checked={paymentMethod === 'credit_card'}
                onChange={() => handleMethodChange('credit_card')}
                className="mr-3"
              />
              <CreditCard size={20} className="text-gray-600 mr-3" />
              <span>クレジットカード</span>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                toggleMethodDetails('credit_card');
              }}
              className="text-gray-500"
            >
              {showDetails === 'credit_card' ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
          </button>
          {renderPaymentMethodDetails()}
        </div>
        
        <div 
          className={`border ${paymentMethod === 'convenience' ? 'border-black bg-gray-50' : 'border-gray-300'} rounded-lg overflow-hidden`}
        >
          <button
            type="button"
            onClick={() => handleMethodChange('convenience')}
            className="flex items-center justify-between w-full p-4"
          >
            <div className="flex items-center">
              <input
                type="radio"
                checked={paymentMethod === 'convenience'}
                onChange={() => handleMethodChange('convenience')}
                className="mr-3"
              />
              <Store size={20} className="text-gray-600 mr-3" />
              <span>コンビニ決済</span>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                toggleMethodDetails('convenience');
              }}
              className="text-gray-500"
            >
              {showDetails === 'convenience' ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
          </button>
          {renderPaymentMethodDetails()}
        </div>
        
        <div 
          className={`border ${paymentMethod === 'bank_transfer' ? 'border-black bg-gray-50' : 'border-gray-300'} rounded-lg overflow-hidden`}
        >
          <button
            type="button"
            onClick={() => handleMethodChange('bank_transfer')}
            className="flex items-center justify-between w-full p-4"
          >
            <div className="flex items-center">
              <input
                type="radio"
                checked={paymentMethod === 'bank_transfer'}
                onChange={() => handleMethodChange('bank_transfer')}
                className="mr-3"
              />
              <Building2 size={20} className="text-gray-600 mr-3" />
              <span>銀行振込</span>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                toggleMethodDetails('bank_transfer');
              }}
              className="text-gray-500"
            >
              {showDetails === 'bank_transfer' ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
          </button>
          {renderPaymentMethodDetails()}
        </div>
        
        <div 
          className={`border ${paymentMethod === 'qr_code' ? 'border-black bg-gray-50' : 'border-gray-300'} rounded-lg overflow-hidden`}
        >
          <button
            type="button"
            onClick={() => handleMethodChange('qr_code')}
            className="flex items-center justify-between w-full p-4"
          >
            <div className="flex items-center">
              <input
                type="radio"
                checked={paymentMethod === 'qr_code'}
                onChange={() => handleMethodChange('qr_code')}
                className="mr-3"
              />
              <svg className="text-gray-600 mr-3" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 11V3H11V11H3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M21 11V3H13V11H21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M21 21V13H13V21H21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M3 21V13H11V21H3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>QRコード決済</span>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                toggleMethodDetails('qr_code');
              }}
              className="text-gray-500"
            >
              {showDetails === 'qr_code' ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
          </button>
          {renderPaymentMethodDetails()}
        </div>
      </div>
      
      {/* 操作ボタン */}
      <div className="mt-6 flex space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-3 border border-gray-300 rounded-lg font-medium"
          disabled={isProcessing}
        >
          キャンセル
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          className="flex-1 py-3 bg-black text-white rounded-lg font-medium"
          disabled={isProcessing}
        >
          {isProcessing ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              処理中...
            </span>
          ) : (
            `¥${totalAmount.toLocaleString()}を支払う`
          )}
        </button>
      </div>
    </div>
  );
};

export default PaymentForm;