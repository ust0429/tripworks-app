import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { processPayment } from '../utils/paymentUtils';
import { BookingData } from '../types/booking';
import { PaymentMethodType, PaymentData, PaymentResult } from '../types/payment';
import { maskCardNumber, formatCardNumberForDisplay } from '../utils/encryptionUtils';

// ナビゲーション用の関数型定義
type NavigateFunction = (path: string) => void;

interface PaymentContextProps {
  // 状態
  isProcessing: boolean;
  paymentError: string | null;
  paymentSuccess: boolean;
  paymentMethod: PaymentMethodType | null;
  transactionId: string | null;
  retryCount: number;
  // 3Dセキュア関連の状態
  requires3DSecure: boolean;
  threeDSecureUrl: string | null;
  threeDSecureId: string | null;
  is3DSecureProcessing: boolean;
  // データ
  bookingData: BookingData | null;
  securePaymentInfo: {
    cardLastFour?: string;
    maskedCardNumber?: string;
    formattedCardNumber?: string;
    token?: string;
  } | null;
  // アクション
  setBookingData: (data: BookingData) => void;
  setPaymentMethod: (method: PaymentMethodType) => void;
  processPaymentAction: (paymentData: PaymentData) => Promise<boolean>;
  complete3DSecureAuthentication: (success: boolean) => Promise<boolean>;
  cancel3DSecureAuthentication: () => void;
  retryPayment: () => Promise<boolean>;
  resetPaymentState: () => void;
  // ナビゲーション
  navigateToComplete: () => void;
  navigateToFailure: () => void;
}

const PaymentContext = createContext<PaymentContextProps | undefined>(undefined);

// セッションストレージのキー
const STORAGE_KEYS = {
  BOOKING_DATA: 'echo_booking_data',
  PAYMENT_METHOD: 'echo_payment_method',
  TRANSACTION_ID: 'echo_transaction_id',
  PAYMENT_SUCCESS: 'echo_payment_success',
  SECURE_PAYMENT_INFO: 'echo_secure_payment_info',
  REQUIRES_3D_SECURE: 'echo_requires_3d_secure',
  THREE_D_SECURE_URL: 'echo_3d_secure_url',
  THREE_D_SECURE_ID: 'echo_3d_secure_id',
  PENDING_PAYMENT_DATA: 'echo_pending_payment_data',
};

export const PaymentProvider: React.FC<{ children: React.ReactNode; navigate?: NavigateFunction }> = ({ children, navigate }) => {
  // カスタムのナビゲーション関数（デフォルトは何もしない）
  const navigateImpl = navigate || ((path: string) => {
    console.warn(`Navigation to ${path} was attempted, but no navigate function was provided to PaymentProvider.`);
  });

  // 状態管理
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState<boolean>(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType | null>(null);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState<number>(0);
  const [bookingData, setBookingData] = useState<BookingData | null>(null);
  
  // 3Dセキュア関連の状態
  const [requires3DSecure, setRequires3DSecure] = useState<boolean>(false);
  const [threeDSecureUrl, setThreeDSecureUrl] = useState<string | null>(null);
  const [threeDSecureId, setThreeDSecureId] = useState<string | null>(null);
  const [is3DSecureProcessing, setIs3DSecureProcessing] = useState<boolean>(false);
  const [pendingPaymentData, setPendingPaymentData] = useState<PaymentData | null>(null);
  
  const [securePaymentInfo, setSecurePaymentInfo] = useState<{
    cardLastFour?: string;
    maskedCardNumber?: string;
    formattedCardNumber?: string;
    token?: string;
  } | null>(null);

  // セッションからの状態復元
  useEffect(() => {
    try {
      // ブラウザ環境でのみ実行
      if (typeof window !== 'undefined') {
        const storedBookingData = sessionStorage.getItem(STORAGE_KEYS.BOOKING_DATA);
        const storedPaymentMethod = sessionStorage.getItem(STORAGE_KEYS.PAYMENT_METHOD);
        const storedTransactionId = sessionStorage.getItem(STORAGE_KEYS.TRANSACTION_ID);
        const storedPaymentSuccess = sessionStorage.getItem(STORAGE_KEYS.PAYMENT_SUCCESS);
        const storedSecurePaymentInfo = sessionStorage.getItem(STORAGE_KEYS.SECURE_PAYMENT_INFO);

        // 3Dセキュア関連の状態を取得
        const storedRequires3DSecure = sessionStorage.getItem(STORAGE_KEYS.REQUIRES_3D_SECURE);
        const storedThreeDSecureUrl = sessionStorage.getItem(STORAGE_KEYS.THREE_D_SECURE_URL);
        const storedThreeDSecureId = sessionStorage.getItem(STORAGE_KEYS.THREE_D_SECURE_ID);
        const storedPendingPaymentData = sessionStorage.getItem(STORAGE_KEYS.PENDING_PAYMENT_DATA);

        if (storedBookingData) {
          setBookingData(JSON.parse(storedBookingData));
        }
        
        if (storedPaymentMethod) {
          setPaymentMethod(storedPaymentMethod as PaymentMethodType);
        }
        
        if (storedTransactionId) {
          setTransactionId(storedTransactionId);
        }
        
        if (storedPaymentSuccess) {
          setPaymentSuccess(storedPaymentSuccess === 'true');
        }

        if (storedSecurePaymentInfo) {
          setSecurePaymentInfo(JSON.parse(storedSecurePaymentInfo));
        }

        // 3Dセキュア関連の状態を設定
        if (storedRequires3DSecure) {
          setRequires3DSecure(storedRequires3DSecure === 'true');
        }
        
        if (storedThreeDSecureUrl) {
          setThreeDSecureUrl(storedThreeDSecureUrl);
        }
        
        if (storedThreeDSecureId) {
          setThreeDSecureId(storedThreeDSecureId);
        }

        if (storedPendingPaymentData) {
          setPendingPaymentData(JSON.parse(storedPendingPaymentData));
        }
      }
    } catch (error) {
      console.error('セッションからの状態復元に失敗しました:', error);
    }
  }, []);

  // 状態変更時のセッション保存
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        if (bookingData) {
          sessionStorage.setItem(STORAGE_KEYS.BOOKING_DATA, JSON.stringify(bookingData));
        }
        
        if (paymentMethod) {
          sessionStorage.setItem(STORAGE_KEYS.PAYMENT_METHOD, paymentMethod);
        }
        
        if (transactionId) {
          sessionStorage.setItem(STORAGE_KEYS.TRANSACTION_ID, transactionId);
        }
        
        sessionStorage.setItem(STORAGE_KEYS.PAYMENT_SUCCESS, String(paymentSuccess));

        if (securePaymentInfo) {
          sessionStorage.setItem(STORAGE_KEYS.SECURE_PAYMENT_INFO, JSON.stringify(securePaymentInfo));
        } else {
          sessionStorage.removeItem(STORAGE_KEYS.SECURE_PAYMENT_INFO);
        }
        
        // 3Dセキュア関連の状態を保存
        sessionStorage.setItem(STORAGE_KEYS.REQUIRES_3D_SECURE, String(requires3DSecure));
        
        if (threeDSecureUrl) {
          sessionStorage.setItem(STORAGE_KEYS.THREE_D_SECURE_URL, threeDSecureUrl);
        } else {
          sessionStorage.removeItem(STORAGE_KEYS.THREE_D_SECURE_URL);
        }
        
        if (threeDSecureId) {
          sessionStorage.setItem(STORAGE_KEYS.THREE_D_SECURE_ID, threeDSecureId);
        } else {
          sessionStorage.removeItem(STORAGE_KEYS.THREE_D_SECURE_ID);
        }
        
        if (pendingPaymentData) {
          sessionStorage.setItem(STORAGE_KEYS.PENDING_PAYMENT_DATA, JSON.stringify(pendingPaymentData));
        } else {
          sessionStorage.removeItem(STORAGE_KEYS.PENDING_PAYMENT_DATA);
        }
      }
    } catch (error) {
      console.error('セッションへの状態保存に失敗しました:', error);
    }
  }, [bookingData, paymentMethod, transactionId, paymentSuccess, securePaymentInfo, 
      requires3DSecure, threeDSecureUrl, threeDSecureId, pendingPaymentData]);

  // 3Dセキュア状態のリセット
  const resetThreeDSecureState = useCallback(() => {
    setRequires3DSecure(false);
    setThreeDSecureUrl(null);
    setThreeDSecureId(null);
    setIs3DSecureProcessing(false);
    setPendingPaymentData(null);
  }, []);

  // 決済処理アクション
  const processPaymentAction = useCallback(async (paymentData: PaymentData): Promise<boolean> => {
    // 既に処理中の場合は重複実行を防ぐ
    if (isProcessing) {
      return false;
    }

    setIsProcessing(true);
    setPaymentError(null);

    try {
      // クレジットカード決済の場合は安全な表示用情報を保存
      if (paymentData.paymentMethod === 'credit_card' && paymentData.cardData) {
        // カード番号のマスキング処理
        const maskedNumber = maskCardNumber(paymentData.cardData.cardNumber);
        const formattedForDisplay = formatCardNumberForDisplay(paymentData.cardData.cardNumber);
        const lastFour = paymentData.cardData.cardNumber.replace(/\\D/g, '').slice(-4);
        
        // セキュアな情報を設定
        setSecurePaymentInfo({
          cardLastFour: lastFour,
          maskedCardNumber: maskedNumber,
          formattedCardNumber: formattedForDisplay
        });
      }

      const result = await processPayment(paymentData);
      
      // 3Dセキュア認証が必要な場合
      if (result.requires3DSecure && result.threeDSecureUrl) {
        setRequires3DSecure(true);
        setThreeDSecureUrl(result.threeDSecureUrl);
        
        if (result.threeDSecureId) {
          setThreeDSecureId(result.threeDSecureId);
        }
        
        // 保留中の支払いデータを保存
        setPendingPaymentData(paymentData);
        
        // 3Dセキュア処理に移行したことを示す
        setIs3DSecureProcessing(true);
        setIsProcessing(false);
        
        return false; // 3Dセキュアの完了を待つ必要があるのでここでは完了とみなさない
      }
      
      if (result.success) {
        setPaymentSuccess(true);
        if (result.transactionId) {
          setTransactionId(result.transactionId);
        }
        setIsProcessing(false);
        return true;
      } else {
        setPaymentError(result.error || '決済処理中にエラーが発生しました');
        setPaymentSuccess(false);
        setIsProcessing(false);
        return false;
      }
    } catch (error) {
      setPaymentError('予期せぬエラーが発生しました。時間をおいて再試行してください。');
      setPaymentSuccess(false);
      setIsProcessing(false);
      return false;
    }
  }, [isProcessing]);

  // 3Dセキュア認証完了処理
  const complete3DSecureAuthentication = useCallback(async (success: boolean): Promise<boolean> => {
    // 3Dセキュア処理中でない場合は何もしない
    if (!is3DSecureProcessing || !pendingPaymentData) {
      return false;
    }
    
    setIsProcessing(true);
    
    try {
      // 認証成功の場合、保留中の支払いデータで決済を続行
      if (success) {
        // 通常はここで、実際の3Dセキュアのトークンを使用してAPIで処理する
        // モックとして単純に待機をシミュレート
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 決済成功済みと記録
        setPaymentSuccess(true);
        setTransactionId(`3DS-${Date.now()}-${Math.floor(Math.random() * 1000)}`);
        
        // 3Dセキュア関連状態をリセット
        resetThreeDSecureState();
        
        setIsProcessing(false);
        return true;
      } else {
        // 認証失敗またはキャンセルの場合
        setPaymentError('3Dセキュア認証が完了しませんでした。別の決済方法をお試しください。');
        
        // 3Dセキュア関連状態をリセット
        resetThreeDSecureState();
        
        setIsProcessing(false);
        return false;
      }
    } catch (error) {
      setPaymentError('認証処理中にエラーが発生しました。時間をおいて再試行してください。');
      resetThreeDSecureState();
      setIsProcessing(false);
      return false;
    }
  }, [is3DSecureProcessing, pendingPaymentData, resetThreeDSecureState]);
  
  // 3Dセキュア認証のキャンセル
  const cancel3DSecureAuthentication = useCallback(() => {
    // 3Dセキュア関連状態をリセット
    resetThreeDSecureState();
    
    // エラー状態を設定
    setPaymentError('認証がキャンセルされました。');
  }, [resetThreeDSecureState]);

  // 再試行処理
  const retryPayment = useCallback(async (): Promise<boolean> => {
    setRetryCount(prev => prev + 1);
    
    // 最後に試行したPaymentDataがないため、再試行できない
    if (!bookingData || !paymentMethod) {
      setPaymentError('再試行に必要な情報がありません。最初からやり直してください。');
      return false;
    }
    
    // 基本的な支払いデータを再構築
    let retryPaymentData: PaymentData;

    // 支払い方法に応じた必要データを渡す
    switch (paymentMethod) {
      case 'qr_code':
        retryPaymentData = {
          amount: bookingData.price,
          bookingId: bookingData.id,
          paymentMethod: paymentMethod,
          qrData: {
            providerType: 'paypay', // デフォルト値を設定するか、UIから入力してもらう
            customerEmail: 'retry@example.com' // デフォルト値を設定するか、UIから入力してもらう
          }
        };
        break;
      case 'credit_card':
        retryPaymentData = {
          amount: bookingData.price,
          bookingId: bookingData.id,
          paymentMethod: paymentMethod,
          cardData: {
            cardNumber: '', // UIから再入力必要
            cardholderName: '',
            expiryMonth: '',
            expiryYear: '',
            cvc: ''
          }
        };
        break;
      case 'convenience':
        retryPaymentData = {
          amount: bookingData.price,
          bookingId: bookingData.id,
          paymentMethod: paymentMethod,
          convenienceData: {
            storeType: 'seven', // デフォルト値を設定するか、UIから入力してもらう
            customerName: '',
            customerEmail: '',
            customerPhone: ''
          }
        };
        break;
      case 'bank_transfer':
        retryPaymentData = {
          amount: bookingData.price,
          bookingId: bookingData.id,
          paymentMethod: paymentMethod,
          bankData: {
            customerName: '',
            customerEmail: ''
          }
        };
        break;
      default:
        setPaymentError('不明な支払い方法です。');
        return false;
    }
    
    // 実際の実装では、ここでUIを表示してユーザーに必要な情報を入力してもらうべき
    return await processPaymentAction(retryPaymentData);
  }, [bookingData, paymentMethod, processPaymentAction]);

  // 状態リセット
  const resetPaymentState = useCallback(() => {
    setIsProcessing(false);
    setPaymentError(null);
    setPaymentSuccess(false);
    setTransactionId(null);
    setRetryCount(0);
    resetThreeDSecureState();
    // bookingDataとpaymentMethodは保持（ユーザーの再入力の手間を省く）
  }, [resetThreeDSecureState]);

  // 決済完了画面へのナビゲーション
  const navigateToComplete = useCallback(() => {
    if (isProcessing) {
      // 処理中の場合は何もしない
      return;
    }
    navigateImpl('/payment/complete');
  }, [navigateImpl, isProcessing]);

  // 決済失敗画面へのナビゲーション
  const navigateToFailure = useCallback(() => {
    if (isProcessing) {
      // 処理中の場合は何もしない
      return;
    }
    navigateImpl('/payment/failure');
  }, [navigateImpl, isProcessing]);

  const value = {
    isProcessing,
    paymentError,
    paymentSuccess,
    paymentMethod,
    transactionId,
    retryCount,
    requires3DSecure,
    threeDSecureUrl,
    threeDSecureId,
    is3DSecureProcessing,
    bookingData,
    securePaymentInfo,
    setBookingData,
    setPaymentMethod,
    processPaymentAction,
    complete3DSecureAuthentication,
    cancel3DSecureAuthentication,
    retryPayment,
    resetPaymentState,
    navigateToComplete,
    navigateToFailure,
  };

  return <PaymentContext.Provider value={value}>{children}</PaymentContext.Provider>;
};

export const usePayment = () => {
  const context = useContext(PaymentContext);
  if (context === undefined) {
    throw new Error('usePayment must be used within a PaymentProvider');
  }
  // BookingConfirmationScreen.tsx との互換性のために、古い状態と関数名を維持
  return {
    ...context,
    paymentState: {
      isSuccess: context.paymentSuccess,
      error: context.paymentError,
      bookingId: context.bookingData?.id,
      paymentMethod: context.paymentMethod
    },
    processPayment: context.processPaymentAction,
    clearPaymentState: context.resetPaymentState
  };
};
