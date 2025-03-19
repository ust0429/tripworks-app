import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { processPayment } from '../utils/paymentUtils';
import { BookingData } from '../types/booking';
import { PaymentMethodType } from '../types/payment';

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
  // データ
  bookingData: BookingData | null;
  // アクション
  setBookingData: (data: BookingData) => void;
  setPaymentMethod: (method: PaymentMethodType) => void;
  processPaymentAction: (paymentData: any) => Promise<boolean>;
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

  // セッションからの状態復元
  useEffect(() => {
    try {
      // ブラウザ環境でのみ実行
      if (typeof window !== 'undefined') {
        const storedBookingData = sessionStorage.getItem(STORAGE_KEYS.BOOKING_DATA);
        const storedPaymentMethod = sessionStorage.getItem(STORAGE_KEYS.PAYMENT_METHOD);
        const storedTransactionId = sessionStorage.getItem(STORAGE_KEYS.TRANSACTION_ID);
        const storedPaymentSuccess = sessionStorage.getItem(STORAGE_KEYS.PAYMENT_SUCCESS);

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
      }
    } catch (error) {
      console.error('セッションへの状態保存に失敗しました:', error);
    }
  }, [bookingData, paymentMethod, transactionId, paymentSuccess]);

  // 決済処理アクション
  const processPaymentAction = useCallback(async (paymentData: any): Promise<boolean> => {
    // 既に処理中の場合は重複実行を防ぐ
    if (isProcessing) {
      return false;
    }

    setIsProcessing(true);
    setPaymentError(null);

    try {
      const result = await processPayment(paymentData);
      
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

  // 再試行処理
  const retryPayment = useCallback(async (): Promise<boolean> => {
    setRetryCount(prev => prev + 1);
    
    // 最後に試行したPaymentDataがないため、再試行できない
    if (!bookingData || !paymentMethod) {
      setPaymentError('再試行に必要な情報がありません。最初からやり直してください。');
      return false;
    }
    
    // 基本的な支払いデータを再構築
    const retryPaymentData = {
      amount: bookingData.totalAmount,
      bookingId: bookingData.id,
      paymentMethod: paymentMethod,
      // 他の必要なデータはUIから再入力してもらう必要がある
    };
    
    return await processPaymentAction(retryPaymentData);
  }, [bookingData, paymentMethod, processPaymentAction]);

  // 状態リセット
  const resetPaymentState = useCallback(() => {
    setIsProcessing(false);
    setPaymentError(null);
    setPaymentSuccess(false);
    setTransactionId(null);
    setRetryCount(0);
    // bookingDataとpaymentMethodは保持（ユーザーの再入力の手間を省く）
  }, []);

  // 決済完了画面へのナビゲーション
  // waitForPromiseをtrueにすることで、実際にナビゲーションする前に決済処理の完了を待つ
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
    bookingData,
    setBookingData,
    setPaymentMethod,
    processPaymentAction,
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
