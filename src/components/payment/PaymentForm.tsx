import React, { useState, useEffect } from 'react';
import { ArrowRight, CheckCircle, AlertTriangle } from 'lucide-react';
import { usePayment } from '../../contexts/PaymentContext';
import { PaymentMethodType, PaymentFormErrors, PaymentData } from '../../types/payment';
import { validateCardNumber, validateExpiryDate, validateCVC } from '../../utils/paymentUtils';

// 各決済方法のコンポーネント
import PaymentMethodSelector from './PaymentMethodSelector';
import CreditCardForm from './CreditCardForm';
import ConvenienceStoreForm from './ConvenienceStoreForm';
import BankTransferForm from './BankTransferForm';
import QRCodeForm from './QRCodeForm';

// PaymentFormのprops型定義
interface PaymentFormProps {
  totalAmount: number;
  onPaymentSubmit?: (paymentData: PaymentData) => Promise<void>;
  onCancel?: () => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ totalAmount, onPaymentSubmit, onCancel }) => {
  const {
    isProcessing,
    paymentError,
    paymentSuccess,
    paymentMethod,
    setPaymentMethod,
    processPaymentAction,
    bookingData
  } = usePayment();

  // フォームデータの状態
  const [cardData, setCardData] = useState({
    cardNumber: '',
    cardholderName: '',
    expiryMonth: '',
    expiryYear: '',
    cvc: ''
  });

  const [convenienceData, setConvenienceData] = useState({
    storeType: '',
    customerName: '',
    customerEmail: '',
    customerPhone: ''
  });

  const [bankData, setBankData] = useState({
    customerName: '',
    customerEmail: ''
  });

  const [qrData, setQrData] = useState({
    providerType: '',
    customerEmail: '',
    customerPhone: ''
  });

  // バリデーションエラー
  const [errors, setErrors] = useState<PaymentFormErrors>({});

  // 選択された決済方法に応じたバリデーション
  const validateForm = (): boolean => {
    const newErrors: PaymentFormErrors = {};

    if (!paymentMethod) {
      newErrors.general = '決済方法を選択してください';
      setErrors(newErrors);
      return false;
    }

    switch (paymentMethod) {
      case 'credit_card':
        // カード番号の検証
        if (!cardData.cardNumber.trim()) {
          newErrors.cardNumber = 'カード番号を入力してください';
        } else if (!validateCardNumber(cardData.cardNumber)) {
          newErrors.cardNumber = '有効なカード番号を入力してください';
        }

        // カード名義の検証
        if (!cardData.cardholderName.trim()) {
          newErrors.cardholderName = 'カード名義を入力してください';
        }

        // 有効期限の検証
        if (!cardData.expiryMonth || !cardData.expiryYear) {
          newErrors.expiryMonth = '有効期限を選択してください';
        } else if (!validateExpiryDate(cardData.expiryMonth, cardData.expiryYear)) {
          newErrors.expiryMonth = '有効な有効期限を選択してください';
        }

        // CVCの検証
        if (!cardData.cvc.trim()) {
          newErrors.cvc = 'セキュリティコードを入力してください';
        } else if (!validateCVC(cardData.cvc, 'unknown')) {
          // ここでは簡易的に'unknown'としていますが、実際にはカード種類に応じた検証が必要
          newErrors.cvc = '有効なセキュリティコードを入力してください';
        }
        break;

      case 'convenience':
        // コンビニ選択の検証
        if (!convenienceData.storeType) {
          newErrors.storeType = 'コンビニを選択してください';
        }

        // 氏名の検証
        if (!convenienceData.customerName.trim()) {
          newErrors.customerName = 'お名前を入力してください';
        }

        // メールアドレスの検証
        if (!convenienceData.customerEmail.trim()) {
          newErrors.customerEmail = 'メールアドレスを入力してください';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(convenienceData.customerEmail)) {
          newErrors.customerEmail = '有効なメールアドレスを入力してください';
        }

        // 電話番号の検証
        if (!convenienceData.customerPhone.trim()) {
          newErrors.customerPhone = '電話番号を入力してください';
        } else if (!/^[0-9]{10,11}$/.test(convenienceData.customerPhone.replace(/[^0-9]/g, ''))) {
          newErrors.customerPhone = '有効な電話番号を入力してください';
        }
        break;

      case 'bank_transfer':
        // 振込予定者名の検証
        if (!bankData.customerName.trim()) {
          newErrors.customerName = '振込予定者名を入力してください';
        }

        // メールアドレスの検証
        if (!bankData.customerEmail.trim()) {
          newErrors.customerEmail = 'メールアドレスを入力してください';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(bankData.customerEmail)) {
          newErrors.customerEmail = '有効なメールアドレスを入力してください';
        }
        break;

      case 'qr_code':
        // QR決済サービス選択の検証
        if (!qrData.providerType) {
          newErrors.providerType = '決済サービスを選択してください';
        }

        // メールアドレスの検証
        if (!qrData.customerEmail.trim()) {
          newErrors.customerEmail = 'メールアドレスを入力してください';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(qrData.customerEmail)) {
          newErrors.customerEmail = '有効なメールアドレスを入力してください';
        }

        // 電話番号の検証（任意）
        if (qrData.customerPhone && !/^[0-9]{10,11}$/.test(qrData.customerPhone.replace(/[^0-9]/g, ''))) {
          newErrors.customerPhone = '有効な電話番号を入力してください';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 決済処理実行
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // bookingIdの取得（コンテキストもしくは仮ID）
    const bookingId = bookingData ? bookingData.id : `temp-${Date.now()}`;

    let paymentData;

    switch (paymentMethod) {
      case 'credit_card':
        paymentData = {
          amount: totalAmount,
          bookingId: bookingId,
          paymentMethod,
          cardData
        };
        break;
      case 'convenience':
        paymentData = {
          amount: totalAmount,
          bookingId: bookingId,
          paymentMethod,
          convenienceData
        };
        break;
      case 'bank_transfer':
        paymentData = {
          amount: totalAmount,
          bookingId: bookingId,
          paymentMethod,
          bankData
        };
        break;
      case 'qr_code':
        paymentData = {
          amount: totalAmount,
          bookingId: bookingId,
          paymentMethod,
          qrData
        };
        break;
      default:
        setErrors({ general: '決済方法を選択してください' });
        return;
    }

    try {
      // 外部から渡されたsubmitハンドラーがあれば使用、なければ内部のハンドラーを使用
      if (onPaymentSubmit) {
        await onPaymentSubmit(paymentData);
      } else if (processPaymentAction) {
        const success = await processPaymentAction(paymentData);
        if (success) {
          // 決済成功の場合は完了画面へ自動遷移
          // navigateToCompleteはPaymentContext内で処理
        }
      }
    } catch (error) {
      setErrors({ general: '決済処理中にエラーが発生しました' });
    }
  };

  // 決済方法が変更されたらエラーをリセット
  useEffect(() => {
    setErrors({});
  }, [paymentMethod]);

  // 予約データがない場合でも、totalAmountが渡されていれば処理を継続

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 総額表示 */}
      <div className="bg-blue-50 p-4 rounded-md mb-6">
        <div className="flex justify-between items-center">
          <p className="text-gray-700">お支払い総額（税込）</p>
          <p className="text-xl font-bold text-blue-800">
            {totalAmount.toLocaleString()}円
          </p>
        </div>
      </div>

      {/* エラーメッセージ */}
      {(paymentError || errors.general) && (
        <div className="p-4 bg-red-50 rounded-md flex items-start space-x-2">
          <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
          <div>
            <p className="text-red-700">{paymentError || errors.general}</p>
            <p className="text-sm text-red-600 mt-1">
              情報を確認して再度お試しください。問題が解決しない場合はサポートにお問い合わせください。
            </p>
          </div>
        </div>
      )}

      {/* 決済成功メッセージ（自動遷移前の一時表示） */}
      {paymentSuccess && (
        <div className="p-4 bg-green-50 rounded-md flex items-start space-x-2">
          <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
          <div>
            <p className="text-green-700">決済が完了しました！</p>
            <p className="text-sm text-green-600 mt-1">
              ご予約の詳細は登録されたメールアドレスに送信されます。
            </p>
          </div>
        </div>
      )}

      {/* 決済方法選択 */}
      <PaymentMethodSelector
        selectedMethod={paymentMethod}
        onSelectMethod={setPaymentMethod}
        disabled={isProcessing}
      />

      {/* 選択された決済方法のフォーム */}
      {paymentMethod && (
        <div className="mt-6">
          {paymentMethod === 'credit_card' && (
            <CreditCardForm
              onDataChange={setCardData}
              errors={errors}
              disabled={isProcessing}
            />
          )}

          {paymentMethod === 'convenience' && (
            <ConvenienceStoreForm
              onDataChange={setConvenienceData}
              errors={errors}
              disabled={isProcessing}
            />
          )}

          {paymentMethod === 'bank_transfer' && (
            <BankTransferForm
              onDataChange={setBankData}
              errors={errors}
              amount={totalAmount}
              disabled={isProcessing}
            />
          )}

          {paymentMethod === 'qr_code' && (
            <QRCodeForm
              onDataChange={setQrData}
              errors={errors}
              disabled={isProcessing}
            />
          )}
        </div>
      )}

      {/* 送信ボタン */}
      <div className="mt-8">
        <button
          type="submit"
          disabled={isProcessing || paymentSuccess}
          className={`w-full flex items-center justify-center space-x-2 px-6 py-3 rounded-md text-white font-medium ${
            isProcessing || paymentSuccess
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          <span>
            {isProcessing
              ? '処理中...'
              : paymentSuccess
              ? '完了しました'
              : '決済を確定する'}
          </span>
          {!isProcessing && !paymentSuccess && <ArrowRight className="w-5 h-5" />}
        </button>
        {isProcessing && (
          <p className="text-center text-sm text-gray-500 mt-2">
            決済処理中です。このページを閉じないでください...
          </p>
        )}
      </div>

      {/* 注意事項 */}
      <div className="mt-6 text-sm text-gray-600 space-y-2">
        <p>※ 決済処理完了後、予約確認メールをお送りします。</p>
        <p>※ 決済に関するお問い合わせは、予約番号をお伝えください。</p>
        <p>※ 決済情報は安全に処理され、サーバーには保存されません。</p>
      </div>
    </form>
  );
};

export default PaymentForm;
