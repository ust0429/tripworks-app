import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthComponents';
import {
  PaymentMethod,
  Payment,
  Transaction,
  PaymentResult,
  CheckoutSummary
} from '../types/payment';
import {
  getUserPaymentMethods,
  savePaymentMethod,
  setDefaultPaymentMethod,
  deletePaymentMethod,
  getUserPayments,
  getUserTransactions,
  createPayment,
  confirmPayment,
  calculateCheckoutSummary
} from '../services/payment';

// コンテキストの型定義
interface PaymentContextType {
  // 状態
  paymentMethods: PaymentMethod[];
  payments: Payment[];
  transactions: Transaction[];
  isLoading: boolean;
  error: string | null;
  checkoutSummary: CheckoutSummary | null;
  
  // 支払い方法関連
  addPaymentMethod: (type: string, details: Record<string, any>, isDefault: boolean) => Promise<string>;
  updateDefaultPaymentMethod: (paymentMethodId: string) => Promise<boolean>;
  removePaymentMethod: (paymentMethodId: string) => Promise<boolean>;
  
  // 取引関連
  loadPayments: () => Promise<void>;
  loadTransactions: () => Promise<void>;
  
  // 決済処理
  calculateTotal: (subtotal: number, taxRate?: number, serviceFeeRate?: number) => CheckoutSummary;
  processPayment: (
    bookingId: string,
    amount: number,
    paymentMethodId: string,
    metadata?: Record<string, any>
  ) => Promise<PaymentResult>;
  
  // リフレッシュ
  refreshPaymentMethods: () => Promise<void>;
}

// コンテキストの作成
const PaymentContext = createContext<PaymentContextType | undefined>(undefined);

// コンテキストのフック
export const usePayment = (): PaymentContextType => {
  const context = useContext(PaymentContext);
  if (!context) {
    throw new Error('usePayment must be used within a PaymentProvider');
  }
  return context;
};

// プロバイダーコンポーネント
export const PaymentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 状態の定義
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [checkoutSummary, setCheckoutSummary] = useState<CheckoutSummary | null>(null);
  
  // 認証情報を取得
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // 支払い方法の読み込み
  const loadPaymentMethods = useCallback(async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const methods = await getUserPaymentMethods(user.uid);
      setPaymentMethods(methods);
    } catch (err) {
      console.error('Failed to load payment methods', err);
      setError('支払い方法の読み込みに失敗しました');
    } finally {
      setIsLoading(false);
    }
  }, [user]);
  
  // 支払い履歴の読み込み
  const loadPayments = useCallback(async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const userPayments = await getUserPayments(user.uid);
      setPayments(userPayments);
    } catch (err) {
      console.error('Failed to load payments', err);
      setError('支払い履歴の読み込みに失敗しました');
    } finally {
      setIsLoading(false);
    }
  }, [user]);
  
  // 取引履歴の読み込み
  const loadTransactions = useCallback(async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const userTransactions = await getUserTransactions(user.uid);
      setTransactions(userTransactions);
    } catch (err) {
      console.error('Failed to load transactions', err);
      setError('取引履歴の読み込みに失敗しました');
    } finally {
      setIsLoading(false);
    }
  }, [user]);
  
  // 支払い方法の追加
  const addPaymentMethod = useCallback(async (
    type: string,
    details: Record<string, any>,
    isDefault: boolean = false
  ): Promise<string> => {
    if (!user) throw new Error('ユーザーがログインしていません');
    
    setIsLoading(true);
    setError(null);
    
    try {
      const paymentMethodId = await savePaymentMethod(user.uid, type, details, isDefault);
      await loadPaymentMethods();
      return paymentMethodId;
    } catch (err) {
      console.error('Failed to add payment method', err);
      setError('支払い方法の追加に失敗しました');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [user, loadPaymentMethods]);
  
  // デフォルト支払い方法の更新
  const updateDefaultPaymentMethod = useCallback(async (paymentMethodId: string): Promise<boolean> => {
    if (!user) throw new Error('ユーザーがログインしていません');
    
    setIsLoading(true);
    setError(null);
    
    try {
      const success = await setDefaultPaymentMethod(user.uid, paymentMethodId);
      if (success) {
        await loadPaymentMethods();
      }
      return success;
    } catch (err) {
      console.error('Failed to update default payment method', err);
      setError('デフォルト支払い方法の更新に失敗しました');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user, loadPaymentMethods]);
  
  // 支払い方法の削除
  const removePaymentMethod = useCallback(async (paymentMethodId: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const success = await deletePaymentMethod(paymentMethodId);
      if (success) {
        await loadPaymentMethods();
      }
      return success;
    } catch (err) {
      console.error('Failed to remove payment method', err);
      setError('支払い方法の削除に失敗しました');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [loadPaymentMethods]);
  
  // 合計金額の計算
  const calculateTotal = useCallback((
    subtotal: number,
    taxRate: number = 0.1,
    serviceFeeRate: number = 0.05
  ): CheckoutSummary => {
    const summary = calculateCheckoutSummary(subtotal, taxRate, serviceFeeRate);
    setCheckoutSummary(summary);
    return summary;
  }, []);
  
  // 決済処理
  const processPayment = useCallback(async (
    bookingId: string,
    amount: number,
    paymentMethodId: string,
    metadata?: Record<string, any>
  ): Promise<PaymentResult> => {
    if (!user) throw new Error('ユーザーがログインしていません');
    
    setIsLoading(true);
    setError(null);
    
    try {
      // 支払いの作成
      const paymentId = await createPayment(
        user.uid,
        bookingId,
        amount,
        'JPY',
        paymentMethodId,
        metadata
      );
      
      // 支払いの確定
      const result = await confirmPayment(paymentId);
      
      // 成功時は支払い履歴を更新
      if (result.success) {
        await loadPayments();
        await loadTransactions();
      }
      
      return result;
    } catch (err) {
      console.error('Failed to process payment', err);
      setError('支払い処理に失敗しました');
      
      return {
        success: false,
        message: '支払い処理中にエラーが発生しました',
        bookingId
      };
    } finally {
      setIsLoading(false);
    }
  }, [user, loadPayments, loadTransactions]);
  
  // 支払い方法のリフレッシュ
  const refreshPaymentMethods = useCallback(async () => {
    await loadPaymentMethods();
  }, [loadPaymentMethods]);
  
  // 初期化時にデータを読み込む
  useEffect(() => {
    if (user) {
      loadPaymentMethods();
    } else {
      setPaymentMethods([]);
      setPayments([]);
      setTransactions([]);
    }
  }, [user, loadPaymentMethods]);
  
  // コンテキスト値の作成
  const value: PaymentContextType = {
    // 状態
    paymentMethods,
    payments,
    transactions,
    isLoading,
    error,
    checkoutSummary,
    
    // 支払い方法関連
    addPaymentMethod,
    updateDefaultPaymentMethod,
    removePaymentMethod,
    
    // 取引関連
    loadPayments,
    loadTransactions,
    
    // 決済処理
    calculateTotal,
    processPayment,
    
    // リフレッシュ
    refreshPaymentMethods
  };
  
  return (
    <PaymentContext.Provider value={value}>
      {children}
    </PaymentContext.Provider>
  );
};
