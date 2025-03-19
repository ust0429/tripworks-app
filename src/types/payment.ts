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
  testMode?: 'success' | 'fail'; // テスト用のモード
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
  // 3Dセキュア関連の追加フィールド
  requires3DSecure?: boolean;
  threeDSecureUrl?: string;
  threeDSecureId?: string;
}

// 3Dセキュアの状態
export type ThreeDSecureStatus = 'pending' | 'success' | 'failed' | 'canceled';

// 3Dセキュア情報
export interface ThreeDSecureData {
  id: string;
  status: ThreeDSecureStatus;
  authenticationUrl?: string;
  fingerprint?: string;
  clientMetadata?: ThreeDSecureClientMetadata;
}

// 3Dセキュアクライアントメタデータ
export interface ThreeDSecureClientMetadata {
  browserInfo: {
    acceptHeader: string;
    browserLanguage: string;
    screenHeight: number;
    screenWidth: number;
    timeZone: number;
    userAgent: string;
    javaEnabled: boolean;
    colorDepth: number;
  };
  deviceInfo?: {
    deviceChannel: string; // ブラウザ、モバイルアプリなど
    ipAddress?: string;
    deviceId?: string;
  };
}
