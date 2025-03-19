/**
 * 決済関連の型定義
 */

// 決済方法の種類
export type PaymentMethodType = 'credit_card' | 'convenience' | 'bank_transfer' | 'qr_code';

// クレジットカード情報
export interface CreditCardData {
  cardNumber: string;
  cardholderName: string;
  expiryMonth: string;
  expiryYear: string;
  cvc: string;
}

// コンビニ決済情報
export interface ConvenienceStoreData {
  storeType: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
}

// 銀行振込情報
export interface BankTransferData {
  customerName: string;
  customerEmail: string;
}

// QRコード決済情報
export interface QRCodeData {
  providerType: string;
  customerEmail: string;
  customerPhone?: string;
}

// 決済データの統合型
export type PaymentData = {
  amount: number;
  bookingId: string;
  paymentMethod: PaymentMethodType;
} & (
  | { paymentMethod: 'credit_card'; cardData: CreditCardData }
  | { paymentMethod: 'convenience'; convenienceData: ConvenienceStoreData }
  | { paymentMethod: 'bank_transfer'; bankData: BankTransferData }
  | { paymentMethod: 'qr_code'; qrData: QRCodeData }
);

// フォームエラーの型
export interface PaymentFormErrors {
  cardNumber?: string;
  cardholderName?: string;
  expiryMonth?: string;
  expiryYear?: string;
  cvc?: string;
  storeType?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  providerType?: string;
  general?: string;
}

// 決済結果の型
export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  error?: string;
  receiptUrl?: string;
}
