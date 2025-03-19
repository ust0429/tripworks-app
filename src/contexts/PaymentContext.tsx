import React, { createContext, useContext, useState, ReactNode } from 'react';
import { PaymentMethodType, PaymentData, PaymentError } from '../components/PaymentForm';

// 決済サービスに必要な型定義
interface PaymentState {
  isProcessing: boolean;
  isComplete: boolean;
  isSuccess: boolean;
  bookingId: string | null;
  paymentMethod: PaymentMethodType | null;
  error: string | null;
  errors: PaymentError[];
}

interface PaymentResponse {
  success: boolean;
  bookingId?: string;
  error?: string;
}

interface PaymentContextType {
  paymentState: PaymentState;
  clearPaymentState: () => void;
  processPayment: (paymentData: PaymentData, amount: number) => Promise<PaymentResponse>;
}

// コンテキストの作成
const PaymentContext = createContext<PaymentContextType | undefined>(undefined);

// 決済ステータスの初期値
const initialPaymentState: PaymentState = {
  isProcessing: false,
  isComplete: false,
  isSuccess: false,
  bookingId: null,
  paymentMethod: null,
  error: null,
  errors: []
};

// プロバイダーコンポーネント
export const PaymentProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [paymentState, setPaymentState] = useState<PaymentState>(initialPaymentState);

  // 決済状態をリセット
  const clearPaymentState = () => {
    setPaymentState(initialPaymentState);
  };

  // モック決済処理（実際の実装ではAPIと連携）
  const processPayment = async (paymentData: PaymentData, amount: number): Promise<PaymentResponse> => {
    setPaymentState({
      ...initialPaymentState,
      isProcessing: true,
      paymentMethod: paymentData.method
    });

    // 決済処理をシミュレート
    try {
      // 実際の実装では、ここでAPIリクエストを行う
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // テスト用のランダム成功/失敗（本番では削除）
      // const isSuccess = Math.random() > 0.3; // 70%の確率で成功
      const isSuccess = true; // 開発中は常に成功させる

      if (isSuccess) {
        // 成功時の処理
        const bookingId = `ECH${Date.now().toString().slice(-8)}`;
        
        setPaymentState({
          isProcessing: false,
          isComplete: true,
          isSuccess: true,
          bookingId,
          paymentMethod: paymentData.method,
          error: null,
          errors: []
        });
        
        return {
          success: true,
          bookingId
        };
      } else {
        // 失敗時の処理
        const errorMessage = "決済処理に失敗しました。カード情報をご確認いただくか、別の決済方法をお試しください。";
        
        setPaymentState({
          isProcessing: false,
          isComplete: true,
          isSuccess: false,
          bookingId: null,
          paymentMethod: paymentData.method,
          error: errorMessage,
          errors: [{
            message: errorMessage,
            type: 'error'
          }]
        });
        
        return {
          success: false,
          error: errorMessage
        };
      }
    } catch (error) {
      // エラー処理
      const errorMessage = "ネットワークエラーが発生しました。通信状況をご確認の上、再度お試しください。";
      
      setPaymentState({
        isProcessing: false,
        isComplete: true,
        isSuccess: false,
        bookingId: null,
        paymentMethod: paymentData.method,
        error: errorMessage,
        errors: [{
          message: errorMessage,
          type: 'error'
        }]
      });
      
      return {
        success: false,
        error: errorMessage
      };
    }
  };

  return (
    <PaymentContext.Provider
      value={{
        paymentState,
        clearPaymentState,
        processPayment
      }}
    >
      {children}
    </PaymentContext.Provider>
  );
};

// カスタムフック
export const usePayment = (): PaymentContextType => {
  const context = useContext(PaymentContext);
  if (context === undefined) {
    throw new Error('usePayment must be used within a PaymentProvider');
  }
  return context;
};
