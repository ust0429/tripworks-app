import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ArrowRight, CheckCircle, AlertTriangle, Info, CreditCard, Store, Building, QrCode, Smartphone } from 'lucide-react';
import { usePayment } from '../../contexts/PaymentContext';
import { useLocale } from '../../contexts/LocaleContext';
import { PaymentMethodType, PaymentFormErrors, PaymentData } from '../../types/payment';
import { validateCardNumber, validateExpiryDate, validateCVC, detectCardType } from '../../utils/paymentUtils';

// 各決済方法のコンポーネント
import PaymentMethodSelector from './PaymentMethodSelector';
import CreditCardForm from './CreditCardForm';
import ConvenienceStoreForm from './ConvenienceStoreForm';
import BankTransferForm from './BankTransferForm';
import QRCodeForm from './QRCodeForm';
import ApplePayButton from './ApplePayButton';
import GooglePayButton from './GooglePayButton';

// PaymentFormのprops型定義
interface PaymentFormProps {
  totalAmount: number;
  onPaymentSubmit?: (paymentData: PaymentData) => Promise<void>;
  onCancel?: () => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ totalAmount, onPaymentSubmit, onCancel }) => {
  const { t, formatCurrency } = useLocale();
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
  
  // フィールドごとのバリデーション状態
  const [fieldStatus, setFieldStatus] = useState<Record<string, 'valid' | 'invalid' | 'initial'>>({});
  
  // 触れたフィールドを追跡
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});

  // 特定のフィールドをバリデーション
  const validateField = useCallback((fieldName: string, value: string, formContext: any = {}): string | null => {
    // 現在選択されている決済方法を参照
    const currentPaymentMethod = formContext.paymentMethod || paymentMethod;
    
    // フィールドが決済方法に関連していない場合はスキップ
    if (currentPaymentMethod === 'credit_card' && !['cardNumber', 'cardholderName', 'expiryMonth', 'expiryYear', 'cvc'].includes(fieldName)) {
      return null;
    }
    if (currentPaymentMethod === 'convenience' && !['storeType', 'customerName', 'customerEmail', 'customerPhone'].includes(fieldName)) {
      return null;
    }
    if (currentPaymentMethod === 'bank_transfer' && !['customerName', 'customerEmail'].includes(fieldName)) {
      return null;
    }
    if (currentPaymentMethod === 'qr_code' && !['providerType', 'customerEmail', 'customerPhone'].includes(fieldName)) {
      return null;
    }
    
    // 共通のバリデーション
    if (!value && fieldName !== 'customerPhone') {
      return `この項目は必須です`;
    }

    // フィールド固有のバリデーション
    switch (fieldName) {
      case 'cardNumber':
        if (!validateCardNumber(value)) {
          return '有効なカード番号を入力してください';
        }
        break;
      case 'expiryMonth':
      case 'expiryYear':
        const month = fieldName === 'expiryMonth' ? value : formContext.expiryMonth || cardData.expiryMonth;
        const year = fieldName === 'expiryYear' ? value : formContext.expiryYear || cardData.expiryYear;
        if (month && year && !validateExpiryDate(month, year)) {
          return '有効期限が無効です';
        }
        break;
      case 'cvc':
        const cardTypeContext = formContext.cardType || detectCardType(formContext.cardNumber || cardData.cardNumber);
        if (!validateCVC(value, cardTypeContext)) {
          return '有効なセキュリティコードを入力してください';
        }
        break;
      case 'customerEmail':
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return '有効なメールアドレスを入力してください';
        }
        break;
      case 'customerPhone':
        // 電話番号は空でもよい場合もある（QR決済など）
        if (value && !/^[0-9]{10,11}$/.test(value.replace(/[^0-9]/g, ''))) {
          return '有効な電話番号を入力してください';
        }
        break;
    }
    
    return null;
  }, [paymentMethod, cardData]);

  // 触れたフィールドをマーク
  const handleFieldBlur = useCallback((fieldName: string, value: string, formContext: any = {}) => {
    setTouchedFields(prev => ({ ...prev, [fieldName]: true }));
    
    // フィールドのバリデーション実行
    const error = validateField(fieldName, value, formContext);
    
    // エラー状態を更新
    setErrors(prev => ({
      ...prev,
      [fieldName]: error || undefined
    }));
    
    // フィールドのステータスを更新
    setFieldStatus(prev => ({
      ...prev,
      [fieldName]: error ? 'invalid' : 'valid'
    }));
  }, [validateField]);
  
  // 選択された決済方法に応じたバリデーション
  const validateForm = (): boolean => {
    const newErrors: PaymentFormErrors = {};

    if (!paymentMethod) {
      newErrors.general = '決済方法を選択してください';
      setErrors(newErrors);
      return false;
    }
    
    // Apple PayとGoogle Payは別のフローなのでスキップ
    if (paymentMethod === 'apple_pay' || paymentMethod === 'google_pay') {
      return true;
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
      case 'apple_pay':
      case 'google_pay':
        // こちらは別のフローで処理されるため、ここでは何もしない
        return;
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

  // 決済方法が変更されたらエラーと状態をリセット
  useEffect(() => {
    setErrors({});
    setFieldStatus({});
    setTouchedFields({});
  }, [paymentMethod]);
  
  // Apple PayまたはGoogle Payの処理完了時のハンドラー
  const handleMobilePaymentComplete = useCallback(async (transactionId: string) => {
    // bookingIdの取得（コンテキストもしくは仮 ID）
    const bookingId = bookingData ? bookingData.id : `temp-${Date.now()}`;
    
    try {
      if (paymentMethod === 'apple_pay' || paymentMethod === 'google_pay') {
        const paymentData = {
          amount: totalAmount,
          bookingId: bookingId,
          paymentMethod: paymentMethod
        };
        
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
      }
    } catch (error) {
      setErrors({ general: '決済処理中にエラーが発生しました' });
    }
  }, [paymentMethod, totalAmount, bookingData, onPaymentSubmit, processPaymentAction]);
  
  // Apple PayまたはGoogle Payのエラー時のハンドラー
  const handleMobilePaymentError = useCallback((error: Error) => {
    setErrors({ general: `決済処理中にエラーが発生しました: ${error.message}` });
  }, []);
  
  
  // フォームの完了度を計算（プログレスバー用）
  const formCompleteness = useMemo(() => {
    if (!paymentMethod) return 0;
    
    // モバイル決済は完了度100%とする
    if (paymentMethod === 'apple_pay' || paymentMethod === 'google_pay') {
      return 100;
    }
    
    let requiredFields: string[] = [];
    let validFieldCount = 0;
    
    // 決済方法に基づいて必要なフィールドを設定
    switch (paymentMethod) {
      case 'credit_card':
        requiredFields = ['cardNumber', 'cardholderName', 'expiryMonth', 'expiryYear', 'cvc'];
        break;
      case 'convenience':
        requiredFields = ['storeType', 'customerName', 'customerEmail', 'customerPhone'];
        break;
      case 'bank_transfer':
        requiredFields = ['customerName', 'customerEmail'];
        break;
      case 'qr_code':
        requiredFields = ['providerType', 'customerEmail'];
        break;
    }
    
    // 有効なフィールドをカウント
    requiredFields.forEach(field => {
      if (fieldStatus[field] === 'valid') {
        validFieldCount++;
      }
    });
    
    // 決済方法の選択自体も1ステップとしてカウント
    return requiredFields.length > 0 ? (validFieldCount / requiredFields.length) * 100 : 0;
  }, [paymentMethod, fieldStatus]);

  // 予約データがない場合でも、totalAmountが渡されていれば処理を継続

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 総額表示 */}
      <div className="bg-blue-50 p-4 rounded-md mb-6">
        <div className="flex justify-between items-center">
          <p className="text-gray-700">お支払い総額（税込）</p>
          <p className="text-xl font-bold text-blue-800">
            {formatCurrency(totalAmount)}
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
      <div className="mb-2">
        <p className="text-sm font-medium text-gray-700 mb-3">お支払い方法を選択してください</p>
        <PaymentMethodSelector
          selectedMethod={paymentMethod}
          onSelectMethod={setPaymentMethod}
          disabled={isProcessing}
        />
      </div>
      
      {/* プログレスバー */}
      {paymentMethod && paymentMethod !== 'apple_pay' && paymentMethod !== 'google_pay' && (
        <div className="mt-4 mb-2 animate-fade-in-up">
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${formCompleteness}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 mt-1 text-right">
            {formCompleteness < 100 
              ? 'フォームの入力を完了してください' 
              : '入力完了！確定ボタンを押してください'}
          </p>
        </div>
      )}

      {/* 選択された決済方法のフォーム */}
      {paymentMethod && (
        <div className="mt-6 relative animate-fade-in-up">
          {/* Apple PayとGoogle Payのボタン */}
          {paymentMethod === 'apple_pay' && (
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-800 mb-4">
                Apple Payで支払う
              </h3>
              <ApplePayButton
                amount={totalAmount}
                onPaymentComplete={handleMobilePaymentComplete}
                onPaymentError={handleMobilePaymentError}
              />
              <p className="text-sm text-gray-600 mt-2">
                Apple Payボタンをタップすると、支払いフローが開始されます。
              </p>
            </div>
          )}
          
          {paymentMethod === 'google_pay' && (
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-800 mb-4">
                Google Payで支払う
              </h3>
              <GooglePayButton
                amount={totalAmount}
                onPaymentComplete={handleMobilePaymentComplete}
                onPaymentError={handleMobilePaymentError}
              />
              <p className="text-sm text-gray-600 mt-2">
                Google Payボタンをタップすると、支払いフローが開始されます。
              </p>
            </div>
          )}
          
          {/* 通常の決済方法のフォーム */}
          {(paymentMethod !== 'apple_pay' && paymentMethod !== 'google_pay') && (
            <>
              {/* 決済方法のアイコンとタイトル */}
              <div className="mb-4 flex items-center">
                {paymentMethod === 'credit_card' && <CreditCard className="w-5 h-5 text-blue-600 mr-2" />}
                {paymentMethod === 'convenience' && <Store className="w-5 h-5 text-blue-600 mr-2" />}
                {paymentMethod === 'bank_transfer' && <Building className="w-5 h-5 text-blue-600 mr-2" />}
                {paymentMethod === 'qr_code' && <QrCode className="w-5 h-5 text-blue-600 mr-2" />}
                <h3 className="text-lg font-medium text-gray-800">
                  {paymentMethod === 'credit_card' && t('payment.methods.creditCard')}
                  {paymentMethod === 'convenience' && 'コンビニ支払い情報'}
                  {paymentMethod === 'bank_transfer' && '銀行振込情報'}
                  {paymentMethod === 'qr_code' && 'QRコード決済情報'}
                </h3>
              </div>
              
              {paymentMethod === 'credit_card' && (
                <CreditCardForm
                  onDataChange={setCardData}
                  errors={errors}
                  disabled={isProcessing}
                  onBlur={handleFieldBlur}
                  fieldStatus={fieldStatus}
                />
              )}

              {paymentMethod === 'convenience' && (
                <ConvenienceStoreForm
                  onDataChange={setConvenienceData}
                  errors={errors}
                  disabled={isProcessing}
                  onBlur={handleFieldBlur}
                  fieldStatus={fieldStatus}
                />
              )}

              {paymentMethod === 'bank_transfer' && (
                <BankTransferForm
                  onDataChange={setBankData}
                  errors={errors}
                  amount={totalAmount}
                  disabled={isProcessing}
                  onBlur={handleFieldBlur}
                  fieldStatus={fieldStatus}
                />
              )}

              {paymentMethod === 'qr_code' && (
                <QRCodeForm
                  onDataChange={setQrData}
                  errors={errors}
                  disabled={isProcessing}
                  onBlur={handleFieldBlur}
                  fieldStatus={fieldStatus}
                />
              )}
            </>
          )}
        </div>
      )}

      {/* ヘルプテキスト */}
      {paymentMethod && (
        <div className="mt-4 p-3 bg-blue-50 rounded-md flex items-start space-x-3 animate-fade-in-up">
          <Info className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
          <div className="text-sm text-blue-800">
            {paymentMethod === 'credit_card' && (
              <p>カード情報は安全に処理され、暗号化されて送信されます。当サイトではカード情報を保存しません。</p>
            )}
            {paymentMethod === 'convenience' && (
              <p>お支払い情報が登録されると、お支払い番号と詳細手順がメールで送信されます。コンビニでのお支払いは5日以内にお願いします。</p>
            )}
            {paymentMethod === 'bank_transfer' && (
              <p>振込先の口座情報はメールでお送りします。お振込の際は、必ず振込名義人を入力いただいた名前と同じにしてください。</p>
            )}
            {paymentMethod === 'qr_code' && (
              <p>決済確定後、QRコードが表示されます。スマートフォンでスキャンして決済を完了してください。有効期限は30分です。</p>
            )}
            {paymentMethod === 'apple_pay' && (
              <p>Apple Payを使用すると、安全かつ簡単にお支払いができます。Touch IDまたはFace IDで認証します。</p>
            )}
            {paymentMethod === 'google_pay' && (
              <p>Google Payを使用すると、安全かつ簡単にお支払いができます。指紋認証またはパスコードで認証します。</p>
            )}
          </div>
        </div>
      )}
      
      {/* 送信ボタン - モバイル決済の場合は非表示 */}
      {paymentMethod && paymentMethod !== 'apple_pay' && paymentMethod !== 'google_pay' && (
        <div className="mt-8">
          <button
            type="submit"
            disabled={isProcessing || paymentSuccess}
            className={`w-full flex items-center justify-center space-x-2 px-6 py-3 rounded-md text-white font-medium transition-all ${
              isProcessing || paymentSuccess
                ? 'bg-gray-400 cursor-not-allowed'
                : formCompleteness >= 100 ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            <span>
              {isProcessing
                ? t('payment.processingPayment')
                : paymentSuccess
                ? t('payment.paymentSuccess')
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
      )}

      {/* 注意事項 */}
      <div className="mt-6 text-sm text-gray-600 space-y-2 border-t pt-4">
        <p>※ 決済処理完了後、予約確認メールをお送りします。</p>
        <p>※ 決済に関するお問い合わせは、予約番号をお伝えください。</p>
        <p>※ 決済情報は安全に処理され、サーバーには保存されません。</p>
        <p className="mt-2 text-xs text-gray-500">当サイトはSSL暗号化通信で決済情報を保護しています。お支払い情報は決済代行会社によって安全に処理されます。</p>
      </div>
    </form>
  );
};

export default PaymentForm;