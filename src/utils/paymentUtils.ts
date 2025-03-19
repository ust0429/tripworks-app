import { PaymentMethodType } from '../types/payment';

/**
 * カード番号のLuhnアルゴリズムによる検証
 * @param cardNumber カード番号（空白なし）
 * @returns 有効な場合はtrue、無効な場合はfalse
 */
export const validateCardNumber = (cardNumber: string): boolean => {
  // 数字以外の文字を削除
  const digitsOnly = cardNumber.replace(/\D/g, '');
  
  if (digitsOnly.length < 13 || digitsOnly.length > 19) {
    return false;
  }
  
  // カード会社ごとのプレフィックスと桁数の検証
  const cardType = detectCardType(digitsOnly);
  if (!validateCardByType(digitsOnly, cardType)) {
    return false;
  }
  
  // Luhnアルゴリズムによる検証
  let sum = 0;
  let shouldDouble = false;
  
  // 右から左へ処理
  for (let i = digitsOnly.length - 1; i >= 0; i--) {
    let digit = parseInt(digitsOnly.charAt(i));
    
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  
  return sum % 10 === 0;
};

/**
 * カード種類の検出
 * @param cardNumber カード番号
 * @returns カード種類の文字列
 */
export const detectCardType = (cardNumber: string): string => {
  const digitsOnly = cardNumber.replace(/\D/g, '');
  
  // Visa
  if (/^4/.test(digitsOnly)) {
    return 'visa';
  }
  
  // Mastercard
  if (/^5[1-5]/.test(digitsOnly) || /^2[2-7]/.test(digitsOnly)) {
    return 'mastercard';
  }
  
  // American Express
  if (/^3[47]/.test(digitsOnly)) {
    return 'amex';
  }
  
  // JCB
  if (/^35/.test(digitsOnly)) {
    return 'jcb';
  }
  
  // Discover
  if (/^6(?:011|5)/.test(digitsOnly)) {
    return 'discover';
  }
  
  // Diners Club
  if (/^3(?:0[0-5]|[68])/.test(digitsOnly)) {
    return 'diners';
  }
  
  return 'unknown';
};

/**
 * カード会社ごとの詳細バリデーション
 * @param cardNumber カード番号
 * @param cardType カード種類
 * @returns 有効な場合はtrue、無効な場合はfalse
 */
export const validateCardByType = (cardNumber: string, cardType: string): boolean => {
  const number = cardNumber.replace(/\D/g, '');
  
  switch (cardType) {
    case 'visa':
      // Visaは13桁または16桁
      return /^4/.test(number) && (number.length === 13 || number.length === 16);
      
    case 'mastercard':
      // Mastercardは16桁で、51-55または2221-2720で始まる
      return (/^5[1-5]/.test(number) || /^2[2-7]/.test(number)) && number.length === 16;
      
    case 'amex':
      // American Expressは15桁で、34または37で始まる
      return /^3[47]/.test(number) && number.length === 15;
      
    case 'jcb':
      // JCBは16桁で、35で始まる
      return /^35/.test(number) && number.length === 16;
      
    case 'discover':
      // Discoverは16桁で、6011または65で始まる
      return /^6(?:011|5)/.test(number) && number.length === 16;
      
    case 'diners':
      // Diners Clubは14桁で、300-305、36、または38で始まる
      return /^3(?:0[0-5]|[68])/.test(number) && number.length === 14;
      
    default:
      // 不明なカード種類の場合、一般的な検証のみ
      return number.length >= 13 && number.length <= 19;
  }
};

/**
 * カード有効期限の検証
 * @param month 月（1-12）
 * @param year 年（下2桁または4桁）
 * @returns 有効な場合はtrue、無効な場合はfalse
 */
export const validateExpiryDate = (month: string, year: string): boolean => {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1; // JavaScriptの月は0始まり
  const currentYear = currentDate.getFullYear();
  
  // 年を4桁に正規化
  let fullYear = parseInt(year);
  if (fullYear < 100) {
    fullYear += 2000;
  }
  
  // 月を数値に変換
  const numMonth = parseInt(month);
  
  // 基本的な値の範囲チェック
  if (numMonth < 1 || numMonth > 12) {
    return false;
  }
  
  // 期限切れのチェック
  if (fullYear < currentYear || (fullYear === currentYear && numMonth < currentMonth)) {
    return false;
  }
  
  // 遠すぎる未来の日付は無効と見なす（10年以上先）
  if (fullYear > currentYear + 10) {
    return false;
  }
  
  return true;
};

/**
 * CVCコードの検証
 * @param cvc CVCコード
 * @param cardType カード種類
 * @returns 有効な場合はtrue、無効な場合はfalse
 */
export const validateCVC = (cvc: string, cardType: string): boolean => {
  const cvcValue = cvc.trim();
  
  // 数字のみであることを確認
  if (!/^\d+$/.test(cvcValue)) {
    return false;
  }
  
  // American Expressは4桁、その他は3桁
  if (cardType === 'amex') {
    return cvcValue.length === 4;
  } else {
    return cvcValue.length === 3;
  }
};

/**
 * カード番号のフォーマット（表示用）
 * @param cardNumber カード番号
 * @returns フォーマットされたカード番号
 */
export const formatCardNumber = (cardNumber: string): string => {
  const digitsOnly = cardNumber.replace(/\D/g, '');
  const cardType = detectCardType(digitsOnly);
  
  if (cardType === 'amex') {
    // American Express: XXXX XXXXXX XXXXX
    return digitsOnly.replace(/^(\d{4})(\d{6})(\d{5})$/, '$1 $2 $3');
  } else {
    // その他のカード: XXXX XXXX XXXX XXXX
    return digitsOnly.replace(/(\d{4})(?=\d)/g, '$1 ');
  }
};

/**
 * 決済方法に基づく表示名を取得
 * @param method 決済方法タイプ
 * @returns 表示用の名前
 */
export const getPaymentMethodName = (method: PaymentMethodType): string => {
  switch (method) {
    case 'credit_card':
      return 'クレジットカード';
    case 'convenience':
      return 'コンビニ支払い';
    case 'bank_transfer':
      return '銀行振込';
    case 'qr_code':
      return 'QRコード決済';
    default:
      return '未選択';
  }
};

/**
 * コンビニ支払いのリスト
 */
export const CONVENIENCE_STORES = [
  { id: 'seven', name: 'セブンイレブン' },
  { id: 'lawson', name: 'ローソン' },
  { id: 'familymart', name: 'ファミリーマート' },
  { id: 'ministop', name: 'ミニストップ' },
  { id: 'dailyyamazaki', name: 'デイリーヤマザキ' }
];

/**
 * QRコード決済のリスト
 */
export const QR_PAYMENT_METHODS = [
  { id: 'paypay', name: 'PayPay' },
  { id: 'linepay', name: 'LINE Pay' },
  { id: 'rakutenpay', name: '楽天ペイ' },
  { id: 'aupay', name: 'au PAY' },
  { id: 'dpay', name: 'd払い' }
];

/**
 * 非同期決済処理をシミュレート（モック）
 * @param paymentData 決済データ
 * @returns 決済結果のPromise
 */
export const processPayment = async (
  paymentData: any
): Promise<{ success: boolean; transactionId?: string; error?: string }> => {
  // テスト用の固定失敗パターン（実際のAPIでは使用しない）
  if (paymentData.testMode && paymentData.testMode === 'fail') {
    await new Promise(resolve => setTimeout(resolve, 2000)); // 遅延をシミュレート
    return {
      success: false,
      error: 'テスト用エラー: 決済に失敗しました'
    };
  }
  
  // 成功パターン
  await new Promise(resolve => setTimeout(resolve, 1500)); // 遅延をシミュレート
  return {
    success: true,
    transactionId: `ECHO-${Date.now()}-${Math.floor(Math.random() * 1000)}`
  };
};
