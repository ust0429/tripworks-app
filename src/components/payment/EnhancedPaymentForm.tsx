import React, { useState, useEffect, useCallback } from 'react';
import { ArrowRight, CheckCircle, AlertTriangle, Info, CreditCard, ShieldCheck, ShieldAlert } from 'lucide-react';
import { useLocale } from '../../contexts/LocaleContext';
import { usePayment } from '../../contexts/PaymentContext';
import { useFraudDetection } from '../security';
import { PaymentMethodType, PaymentFormErrors, PaymentData } from '../../types/payment';
import PaymentMethodSelector from './PaymentMethodSelector';
import CreditCardForm from './CreditCardForm';
import ApplePayButton from './ApplePayButton';
import GooglePayButton from './GooglePayButton';
import { RiskIndicator } from '../security';
import { processEnhancedPayment } from '../../services/EnhancedPaymentService';

interface EnhancedPaymentFormProps {
  totalAmount: number;
  onPaymentSubmit?: (paymentData: PaymentData) => Promise<void>;
  onCancel?: () => void;
  bookingId: string;
  userId?: string;
}

const EnhancedPaymentForm: React.FC<EnhancedPaymentFormProps> = ({
  totalAmount,
  onPaymentSubmit,
  onCancel,
  bookingId,
  userId
}) => {
  const { t, formatCurrency } = useLocale();
  const { isProcessing, paymentError, paymentSuccess, paymentMethod, setPaymentMethod } = usePayment();
  const { deviceId, collectDeviceInfo, showVerificationModal } = useFraudDetection();

  // 状態
  const [cardData, setCardData] = useState({
    cardNumber: '',
    cardholderName: '',
    expiryMonth: '',
    expiryYear: '',
    cvc: ''
  });
  const [errors, setErrors] = useState<PaymentFormErrors>({});
  const [fieldStatus, setFieldStatus] = useState<Record<string, 'valid' | 'invalid' | 'initial'>>({});
  const [riskScore, setRiskScore] = useState(0);
  const [securityMessage, setSecurityMessage] = useState<string | null>(null);
  const [deviceFingerprint, setDeviceFingerprint] = useState<{ deviceId: string; ipAddress: string } | null>(null);

  // 初期化時にデバイス情報を収集
  useEffect(() => {
    const initializeDeviceInfo = async () => {
      const info = await collectDeviceInfo();
      setDeviceFingerprint(info);
      
      // デモ用のランダムなリスクスコア（実際のアプリケーションでは、サーバーから取得）
      setRiskScore(Math.random() * 0.6); // 最大0.6のリスクスコア（ほとんどが低～中リスク）
    };
    
    initializeDeviceInfo();
  }, [collectDeviceInfo]);

  // フィールドブラーハンドラー
  const handleFieldBlur = useCallback((fieldName: string, value: string, formContext: any = {}) => {
    // フィールドの検証ロジック
    // ...

    // リスクスコアを更新（例：不審な値が入力された場合）
    if (fieldName === 'cardNumber' && value.replace(/\D/g, '').endsWith('1111')) {
      setRiskScore(prev => Math.min(0.8, prev + 0.2));
      setSecurityMessage('このカード番号は不審な取引に使用されています。追加の確認が必要になる場合があります。');
    }
  }, []);

  // 送信ハンドラー
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    // 安全でないデバイスからの取引と思われる場合は追加認証を要求
    if (riskScore >= 0.7) {
      const reasons = [
        '通常と異なる環境からの取引',
        '高額な取引'
      ];
      
      const verificationSuccess = await showVerificationModal('sms', 'high', reasons);
      if (!verificationSuccess) {
        setErrors({ general: '認証に失敗しました。もう一度お試しください。' });
        return;
      }
    } else if (riskScore >= 0.4) {
      // 中リスクの場合はCAPTCHA認証
      const verificationSuccess = await showVerificationModal('captcha', 'medium');
      if (!verificationSuccess) {
        setErrors({ general: '認証に失敗しました。もう一度お試しください。' });
        return;
      }
    }
    
    // 決済データの構築
    let paymentData: PaymentData;
    
    switch (paymentMethod) {
      case 'credit_card':
        paymentData = {
          amount: totalAmount,
          bookingId,
          paymentMethod,
          cardData
        };
        break;
      case 'apple_pay':
        paymentData = {
          amount: totalAmount,
          bookingId,
          paymentMethod: 'apple_pay'
        };
        break;
      case 'google_pay':
        paymentData = {
          amount: totalAmount,
          bookingId,
          paymentMethod: 'google_pay'
        };
        break;
      default:
        setErrors({ general: '決済方法を選択してください' });
        return;
    }
    
    try {
      // 拡張決済サービスで処理
      const result = await processEnhancedPayment(paymentData, {
        enableFraudDetection: true,
        enable3DSecure: paymentMethod === 'credit_card',
        collectDeviceInfo: true
      });
      
      if (!result.success) {
        // 特定のエラーに応じたハンドリング
        if (result.requiresAction === true && result.actionType === 'verification') {
          const verificationSuccess = await showVerificationModal('3ds', 'medium');
          if (!verificationSuccess) {
            setErrors({ general: '認証に失敗しました。もう一度お試しください。' });
            return;
          }
          
          // 認証成功後に再試行
          // ...
        } else {
          setErrors({ general: result.error || '決済処理中にエラーが発生しました' });
        }
        return;
      }
      
      // 成功ハンドリング
      if (onPaymentSubmit) {
        await onPaymentSubmit(paymentData);
      }
    } catch (error) {
      setErrors({ general: '決済処理中にエラーが発生しました' });
    }
  };

  // フォームの検証
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
    
    if (paymentMethod === 'credit_card') {
      // クレジットカードのバリデーション
      // ...
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // モバイル決済のハンドラー
  const handleMobilePaymentComplete = async (transactionId: string) => {
    // 決済完了処理
    // ...
  };
  
  const handleMobilePaymentError = (error: Error) => {
    setErrors({ general: `決済処理中にエラーが発生しました: ${error.message}` });
  };
  
  // リスクレベルに基づいて説明テキストを取得
  const getSecurityExplanation = () => {
    if (riskScore >= 0.7) {
      return '追加の認証が必要です。';
    } else if (riskScore >= 0.4) {
      return '取引を安全に処理するために追加の確認が必要になる場合があります。';
    } else {
      return '取引は安全に処理されます。';
    }
  };

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

      {/* セキュリティステータス */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-700">セキュリティステータス</h3>
          {riskScore < 0.4 ? (
            <span className="inline-flex items-center text-xs text-green-700">
              <ShieldCheck className="w-4 h-4 mr-1" />
              安全な取引
            </span>
          ) : (
            <span className="inline-flex items-center text-xs text-orange-700">
              <ShieldAlert className="w-4 h-4 mr-1" />
              確認が必要
            </span>
          )}
        </div>
        
        <RiskIndicator
          score={riskScore}
          showLabel={true}
          showDetails={securityMessage !== null}
          size="medium"
          className="mb-2"
        />
        
        {securityMessage && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md text-sm text-yellow-700 flex items-start">
            <AlertTriangle className="w-4 h-4 mt-0.5 mr-2 flex-shrink-0" />
            <p>{securityMessage}</p>
          </div>
        )}
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

      {/* 決済成功メッセージ */}
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
          
          {/* クレジットカードのフォーム */}
          {paymentMethod === 'credit_card' && (
            <>
              <div className="mb-4 flex items-center">
                <CreditCard className="w-5 h-5 text-blue-600 mr-2" />
                <h3 className="text-lg font-medium text-gray-800">
                  {t('payment.methods.creditCard')}
                </h3>
              </div>
              
              <CreditCardForm
                onDataChange={setCardData}
                errors={errors}
                disabled={isProcessing}
                onBlur={handleFieldBlur}
                fieldStatus={fieldStatus}
              />
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
              <p>カード情報は安全に処理され、暗号化されて送信されます。当サイトではカード情報を保存しません。{getSecurityExplanation()}</p>
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
                : 'bg-blue-600 hover:bg-blue-700'
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

      {/* デバイス情報フッター */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-500">デバイスID: {deviceFingerprint?.deviceId.slice(0, 12)}...</p>
          <p className="text-xs text-gray-500">詳細なセキュリティ保護付きの決済</p>
        </div>
      </div>
    </form>
  );
};

export default EnhancedPaymentForm;
