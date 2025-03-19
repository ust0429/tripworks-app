import { PaymentMethodType } from '../components/PaymentForm';

/**
 * カード番号のバリデーション (Luhnアルゴリズム)
 * @param cardNumber カード番号（スペースなし）
 * @returns 有効なカード番号かどうか
 */
export const validateCardNumber = (cardNumber: string): boolean => {
  if (!cardNumber) return false;
  
  // 空白を削除
  const trimmedNumber = cardNumber.replace(/\s+/g, '');
  
  // 数字のみかチェック
  if (!/^\d+$/.test(trimmedNumber)) return false;
  
  // 長さチェック (13-19桁)
  if (trimmedNumber.length < 13 || trimmedNumber.length > 19) return false;
  
  // Luhnアルゴリズムによる検証
  let sum = 0;
  let shouldDouble = false;
  
  // 右から左へ処理
  for (let i = trimmedNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(trimmedNumber.charAt(i));
    
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  
  return sum % 10 === 0;
};

/**
 * カード発行会社の判定
 * @param cardNumber カード番号（スペースあり/なし）
 * @returns カード発行会社名または "Unknown"
 */
export const detectCardType = (cardNumber: string): string => {
  const trimmedNumber = cardNumber.replace(/\s+/g, '');
  
  // Visa
  if (/^4/.test(trimmedNumber)) {
    return 'Visa';
  }
  
  // Mastercard
  if (/^5[1-5]/.test(trimmedNumber) || /^2[2-7]/.test(trimmedNumber)) {
    return 'Mastercard';
  }
  
  // American Express
  if (/^3[47]/.test(trimmedNumber)) {
    return 'American Express';
  }
  
  // JCB
  if (/^35/.test(trimmedNumber)) {
    return 'JCB';
  }
  
  // Diners Club
  if (/^3(?:0[0-5]|[68])/.test(trimmedNumber)) {
    return 'Diners Club';
  }
  
  // Discover
  if (/^6(?:011|5)/.test(trimmedNumber)) {
    return 'Discover';
  }
  
  return 'Unknown';
};

/**
 * 有効期限のバリデーション
 * @param expiryMonth 有効期限の月 (1-12)
 * @param expiryYear 有効期限の年（下2桁または4桁）
 * @returns 有効期限が有効かどうか
 */
export const validateExpiry = (expiryMonth: string, expiryYear: string): boolean => {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1; // 0-11 -> 1-12
  const currentYear = currentDate.getFullYear();
  
  // 文字列を数値に変換
  let month = parseInt(expiryMonth, 10);
  let year = parseInt(expiryYear, 10);
  
  // 年が2桁の場合は21世紀として解釈
  if (year < 100) {
    year += 2000;
  }
  
  // 月のバリデーション
  if (isNaN(month) || month < 1 || month > 12) {
    return false;
  }
  
  // 年のバリデーション
  if (isNaN(year)) {
    return false;
  }
  
  // 有効期限が現在の日付より前かチェック
  if (year < currentYear || (year === currentYear && month < currentMonth)) {
    return false;
  }
  
  return true;
};

/**
 * カード番号のフォーマット（4桁ごとに空白を挿入）
 * @param cardNumber フォーマットする前のカード番号
 * @returns フォーマットされたカード番号
 */
export const formatCardNumber = (cardNumber: string): string => {
  if (!cardNumber) return '';
  
  const trimmedNumber = cardNumber.replace(/\s+/g, '');
  const cardType = detectCardType(trimmedNumber);
  
  // AMEXは4-6-5形式でグループ化
  if (cardType === 'American Express') {
    const groups = trimmedNumber.match(/(\d{1,4})(\d{1,6})?(\d{1,5})?/);
    if (!groups) return trimmedNumber;
    
    return [groups[1], groups[2], groups[3]].filter(Boolean).join(' ');
  }
  
  // その他のカードは4桁ごと
  const groups = trimmedNumber.match(/(\d{1,4})(\d{1,4})?(\d{1,4})?(\d{1,4})?(\d{1,3})?/);
  if (!groups) return trimmedNumber;
  
  return [groups[1], groups[2], groups[3], groups[4], groups[5]].filter(Boolean).join(' ');
};

/**
 * 決済方法名の取得
 * @param method 決済方法のコード
 * @returns 日本語の決済方法名
 */
export const getPaymentMethodName = (method?: PaymentMethodType): string => {
  switch (method) {
    case 'credit_card': return 'クレジットカード';
    case 'convenience': return 'コンビニ決済';
    case 'bank_transfer': return '銀行振込';
    case 'qr_code': return 'QRコード決済';
    default: return '不明';
  }
};

/**
 * 決済期限の計算
 * @param method 決済方法
 * @returns 決済期限の日時（Date）
 */
export const calculatePaymentDeadline = (method: PaymentMethodType): Date => {
  const now = new Date();
  
  switch (method) {
    case 'credit_card': 
      // クレジットカードは即時決済なので期限なし（念のため30分後を返す）
      return new Date(now.getTime() + 30 * 60 * 1000);
    case 'convenience':
    case 'bank_transfer':
      // コンビニ・銀行振込は3日後
      return new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    case 'qr_code':
      // QRコード決済は1時間
      return new Date(now.getTime() + 60 * 60 * 1000);
    default:
      // デフォルトは1日
      return new Date(now.getTime() + 24 * 60 * 60 * 1000);
  }
};

/**
 * 支払いステータスの表示テキスト取得
 * @param status 支払いステータス
 * @returns 日本語のステータステキスト
 */
export const getPaymentStatusText = (status: 'paid' | 'pending' | 'failed' | undefined): string => {
  switch (status) {
    case 'paid': return '支払い完了';
    case 'pending': return '支払い待ち';
    case 'failed': return '支払い失敗';
    default: return '未決済';
  }
};
