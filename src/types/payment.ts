import { Timestamp } from 'firebase/firestore';

// 決済情報
export interface Payment {
  id: string;
  userId: string;
  bookingId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paymentMethodId: string;
  paymentIntentId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  metadata?: Record<string, any>;
}

// 決済ステータス
export type PaymentStatus = 'pending' | 'processing' | 'succeeded' | 'failed' | 'refunded' | 'canceled';

// 保存された決済方法
export interface PaymentMethod {
  id: string;
  userId: string;
  type: PaymentMethodType;
  details: PaymentMethodDetails;
  isDefault: boolean;
  createdAt: Timestamp;
}

// 決済方法タイプ
export type PaymentMethodType = 'card' | 'bank_account' | 'wallet';

// 決済方法詳細
export interface PaymentMethodDetails {
  brand?: string;
  last4?: string;
  expMonth?: number;
  expYear?: number;
  bankName?: string;
  walletType?: string;
}

// 取引履歴
export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  currency: string;
  status: TransactionStatus;
  relatedId: string; // paymentId または payoutId
  description: string;
  createdAt: Timestamp;
}

// 取引タイプ
export type TransactionType = 'payment' | 'refund' | 'payout';

// 取引ステータス
export type TransactionStatus = 'pending' | 'completed' | 'failed';

// アテンダーへの支払い情報
export interface Payout {
  id: string;
  attenderId: string;
  amount: number;
  currency: string;
  status: PayoutStatus;
  destinationId: string;
  stripeTransferId?: string;
  createdAt: Timestamp;
  paidAt?: Timestamp;
  bookingIds: string[]; // 関連する予約 ID
}

// 支払いステータス
export type PayoutStatus = 'pending' | 'processing' | 'paid' | 'failed';

// 決済フォームの入力値
export interface PaymentFormInputs {
  cardholderName: string;
  saveCard: boolean;
}

// 決済サマリー情報
export interface CheckoutSummary {
  subtotal: number;
  tax: number;
  serviceFee: number;
  total: number;
  currency: string;
}

// 決済結果
export interface PaymentResult {
  success: boolean;
  message: string;
  paymentId?: string;
  transactionId?: string;
  bookingId?: string;
  redirectUrl?: string;
}
