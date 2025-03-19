/**
 * 決済セキュリティサービス
 * カード情報のトークン化とセキュアな送信を処理
 */

import { CreditCardData } from '../types/payment';
import {
  encryptWithPublicKey,
  generateRandomToken,
  hashData,
  maskCardNumber,
  formatCardNumberForDisplay
} from '../utils/encryptionUtils';

// テスト用の公開鍵（実際の実装では環境変数や設定から取得）
const TEST_PUBLIC_KEY = `
-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAvWpIQFvXQ+f9NMRLaWTR
auFgzA4jMYq4FVrewXTLOxx1XB+Y0JiQxCaXzXKcgJFQU3eaYwYpAonG1rXfQcxr
0XO3yOo4rQ8mqj9GYpkLJLyVX3aP+Mef9J5nBEjwB2NaOLs2sDGlJN0ecLmOViOS
IvwY6E8vvWdwQPKyONvlCp/YbPdHvdFaGweMTxjxy1wyPN3R895hZB27jHBZwYXj
kMEXpUaNxD1PJZjUFRFkQ2TFkjJpIBaqgCKxfJn5iDODMIVmOLPTyDOEG9RG7AUb
6JB8izLI5XG6QEgPUJ7XhG+cDQTylbAYKGHwKIh7EQmKYFLJWx9wUHZTJ7I8lS1V
EQIDAQAB
-----END PUBLIC KEY-----
`;

/**
 * カード情報のトークン化
 * @param cardData カード情報
 * @returns トークン化されたカード情報
 */
export const tokenizeCardData = async (cardData: CreditCardData): Promise<{
  token: string;
  maskedCardNumber: string;
  lastFourDigits: string;
  expiryMonth: string;
  expiryYear: string;
  cardholderName: string;
}> => {
  try {
    // カード情報のJSONシリアライズ
    const cardDataJson = JSON.stringify({
      number: cardData.cardNumber,
      expiryMonth: cardData.expiryMonth,
      expiryYear: cardData.expiryYear,
      cvc: cardData.cvc,
      timestamp: new Date().toISOString(),
      nonce: generateRandomToken(16)
    });

    // カード情報の暗号化（実際の実装ではサーバーの公開鍵で暗号化）
    const encryptedData = await encryptWithPublicKey(cardDataJson, TEST_PUBLIC_KEY);
    
    // カード番号のハッシュ化（フィンガープリント）
    const cardNumberHash = await hashData(cardData.cardNumber);
    
    // トークンの生成（ハッシュとランダム値の組み合わせ）
    const randomPart = generateRandomToken(16);
    const token = `token_${cardNumberHash.substring(0, 8)}_${randomPart}`;
    
    // マスクされたカード番号の生成
    const maskedCardNumber = maskCardNumber(cardData.cardNumber);
    
    // 最後の4桁
    const lastFourDigits = cardData.cardNumber.replace(/\D/g, '').slice(-4);
    
    return {
      token,
      maskedCardNumber,
      lastFourDigits,
      expiryMonth: cardData.expiryMonth,
      expiryYear: cardData.expiryYear,
      cardholderName: cardData.cardholderName
    };
  } catch (error) {
    console.error('カード情報のトークン化に失敗しました:', error);
    throw new Error('カード情報の処理中にエラーが発生しました');
  }
};

/**
 * セキュアな決済リクエストの作成
 * @param paymentData 決済データ
 * @param cardToken カードトークン
 * @returns セキュアな決済リクエストデータ
 */
export const createSecurePaymentRequest = async (
  paymentData: any,
  cardToken: string
): Promise<any> => {
  // 決済リクエストに署名などを追加してセキュリティを強化
  const requestId = generateRandomToken();
  const timestamp = new Date().toISOString();
  
  // リクエストデータの署名用文字列
  const signatureString = `${requestId}|${timestamp}|${paymentData.bookingId}|${paymentData.amount}|${cardToken}`;
  
  // 署名の生成（実際の実装では秘密鍵を使用）
  const signature = await hashData(signatureString);
  
  return {
    requestId,
    timestamp,
    bookingId: paymentData.bookingId,
    amount: paymentData.amount,
    cardToken,
    signature
  };
};

/**
 * PCI DSS準拠のための決済データ処理
 * @param paymentData 決済データ
 * @returns PCI DSS準拠の決済データ
 */
export const processPCICompliantPayment = async (paymentData: any): Promise<any> => {
  // クレジットカード決済の場合のみトークン化
  if (paymentData.paymentMethod === 'credit_card') {
    try {
      // カード情報をトークン化
      const tokenizedCard = await tokenizeCardData(paymentData.cardData);
      
      // セキュアな決済リクエスト作成
      const secureRequest = await createSecurePaymentRequest(paymentData, tokenizedCard.token);
      
      // 安全な表示用データ（UI表示用）
      const uiDisplayData = {
        cardType: paymentData.cardData.cardType || 'unknown',
        lastFourDigits: tokenizedCard.lastFourDigits,
        expiryMonth: tokenizedCard.expiryMonth,
        expiryYear: tokenizedCard.expiryYear,
        cardholderName: tokenizedCard.cardholderName,
        displayCardNumber: formatCardNumberForDisplay(paymentData.cardData.cardNumber)
      };
      
      // PCI DSS準拠のリクエストデータ
      return {
        ...secureRequest,
        paymentMethod: paymentData.paymentMethod,
        uiDisplayData,
        // 元の決済データから機密情報を削除
        originalData: {
          bookingId: paymentData.bookingId,
          amount: paymentData.amount,
          paymentMethod: paymentData.paymentMethod
        }
      };
    } catch (error) {
      console.error('PCI準拠の決済処理に失敗しました:', error);
      throw new Error('決済情報の処理中にエラーが発生しました');
    }
  } else {
    // クレジットカード以外の決済方法はそのまま返す
    return paymentData;
  }
};
