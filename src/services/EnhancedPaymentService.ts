/**
 * 拡張決済サービス
 * 
 * 不正検知システムと3Dセキュア認証を統合した決済処理サービス
 */

import { 
  PaymentData, 
  PaymentResult, 
  CreditCardData,
  ThreeDSecureStatus
} from '../types/payment';
import { 
  initiate3DSecure, 
  check3DSecureStatus, 
  complete3DSecure, 
  show3DSecureModal 
} from './threeDSecureService';
import { 
  performPrePaymentFraudCheck, 
  storeFraudDetectionResult,
  reportSuspiciousTransaction,
  PaymentRequest
} from './FraudDetectionService';
import { 
  collectDeviceFingerprint, 
  generateDeviceId, 
  storeDeviceId 
} from '../utils/fraudDetection/deviceFingerprinting';
import { getCurrentIP } from '../utils/fraudDetection/geoRiskAnalysis';
import { TransactionFeatures } from '../utils/fraudDetection';

import { 
  // getUserProfile as getUser, 
  // updateUserProfile 
} from './UserService';

// かわりに独自のモック関数を定義
const getUser = (userId: string) => {
  // モックデータを返す
  return {
    id: userId,
    displayName: 'Mock User',
    email: 'mock@example.com',
    interests: [],
    isAttender: false,
    createdAt: new Date().toISOString(),
    transactionCount: 5,
    averageTransactionAmount: 2000,
    lastTransactionDate: new Date().toISOString(),
    usedPaymentMethods: ['credit_card', 'bank_transfer']
  };
};

// updateUserTransactionInfo関数のモック
const updateUserTransactionInfo = (userId: string, amount: number, paymentMethod: string) => {
  console.log(`ユーザー取引情報を更新: ユーザー=${userId}, 金額=${amount}, 決済方法=${paymentMethod}`);
};

/**
 * 拡張決済処理オプション
 */
export interface EnhancedPaymentOptions {
  enableFraudDetection: boolean;
  enable3DSecure: boolean;
  collectDeviceInfo: boolean;
  retryOnFailure: boolean;
  maxRetries: number;
}

// デフォルトのオプション
const DEFAULT_PAYMENT_OPTIONS: EnhancedPaymentOptions = {
  enableFraudDetection: true,
  enable3DSecure: true,
  collectDeviceInfo: true,
  retryOnFailure: true,
  maxRetries: 1
};

/**
 * 拡張決済処理
 * 
 * @param paymentData 決済データ
 * @param options 決済オプション
 * @returns 決済結果
 */
export async function processEnhancedPayment(
  paymentData: PaymentData,
  options: Partial<EnhancedPaymentOptions> = {}
): Promise<PaymentResult> {
  // オプションをデフォルト値とマージ
  const mergedOptions: EnhancedPaymentOptions = {
    ...DEFAULT_PAYMENT_OPTIONS,
    ...options
  };
  
  try {
    let deviceId: string | undefined;
    let ipAddress: string | undefined;
    
    // デバイス情報の収集
    if (mergedOptions.collectDeviceInfo) {
      try {
        const deviceFingerprint = await collectDeviceFingerprint();
        deviceId = await generateDeviceId(deviceFingerprint);
        ipAddress = await getCurrentIP();
        
        // デバイスIDを保存
        storeDeviceId(deviceId);
        
        // ユーザーIDが取引データにある場合、デバイスとユーザーを関連付け
        const userId = extractUserId(paymentData);
        if (userId) {
          // デバイスとユーザーを関連付け
          console.log('デバイスとユーザーを関連付け:', userId, deviceId);
        }
      } catch (error) {
        console.warn('デバイス情報の収集に失敗しました:', error);
      }
    }
    
    // 不正検知
    if (mergedOptions.enableFraudDetection) {
      const userId = extractUserId(paymentData);
      
      // 取引特徴の構築
      const now = new Date();
      // ユーザー情報を取得するモック関数を実装
      const user = getUser(userId);
      const transactionFeatures: TransactionFeatures = {
        amount: paymentData.amount,
        deviceId,
        ipAddress,
        transactionType: 'payment',
        paymentMethod: paymentData.paymentMethod,
        timeOfDay: now.getHours(),
        dayOfWeek: now.getDay(),
        userHistory: user ? {
          transactionCount: user.transactionCount,
          averageAmount: user.averageTransactionAmount,
          lastTransactionDate: user.lastTransactionDate,
          usedPaymentMethods: user.usedPaymentMethods
        } : undefined
      };
      
      // 不正検知チェックの実行
      const fraudCheckRequest: PaymentRequest = {
        userId: userId,
        amount: paymentData.amount,
        paymentMethod: paymentData.paymentMethod,
        deviceId,
        ipAddress
      };
      
      const fraudCheckResult = await performPrePaymentFraudCheck(fraudCheckRequest);
      
      // 取引がブロックされた場合
      if (!fraudCheckResult.allowed) {
        return {
          success: false,
          error: `セキュリティ上の理由により決済が拒否されました: ${fraudCheckResult.reasons.join(', ')}`,
          requiresAction: fraudCheckResult.requireAdditionalVerification,
          actionType: 'verification'
        } as PaymentResult;
      }
      
      // 追加検証が必要な場合の3Dセキュア認証への流れ
      if (fraudCheckResult.requireAdditionalVerification && 
          fraudCheckResult.challengeType === '3ds' && 
          mergedOptions.enable3DSecure && 
          paymentData.paymentMethod === 'credit_card' &&
          'cardData' in paymentData) {
        
        const threeDSecureResult = await process3DSecureAuthentication(
          paymentData.cardData,
          paymentData.amount
        );
        
        if (!threeDSecureResult.success) {
          return {
            success: false,
            error: '3Dセキュア認証に失敗しました',
            requiresAction: false
          } as PaymentResult;
        }
      }
    }
    
    // 決済処理の実行
    const result = await processPayment(paymentData, mergedOptions.retryOnFailure, mergedOptions.maxRetries);
    
    // 成功した場合、ユーザー情報を更新
    if (result.success) {
      const userId = extractUserId(paymentData);
      if (userId) {
        updateUserTransactionInfo(userId, paymentData.amount, paymentData.paymentMethod);
      }
    }
    
    return result;
  } catch (error) {
    console.error('決済処理中にエラーが発生しました:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '決済処理中に予期せぬエラーが発生しました',
      requiresAction: false
    } as PaymentResult;
  }
}

/**
 * 基本的な決済処理（リトライロジック含む）
 * 
 * @param paymentData 決済データ
 * @param retryOnFailure 失敗時にリトライするか
 * @param maxRetries 最大リトライ回数
 * @returns 決済結果
 */
async function processPayment(
  paymentData: PaymentData,
  retryOnFailure: boolean,
  maxRetries: number
): Promise<PaymentResult> {
  let retries = 0;
  let lastError: Error | undefined;
  
  while (retries <= maxRetries) {
    try {
      // 実際の決済処理（本番環境では決済ゲートウェイAPIの呼び出し）
      // モックの結果を返す
      const result = await mockPaymentProcessing(paymentData);
      
      if (result.success) {
        return result;
      }
      
      // リトライしない、または最大リトライ回数に達した場合
      if (!retryOnFailure || retries >= maxRetries) {
        return result;
      }
      
      // 一時的なエラーの場合のみリトライ
      if (result.error && !isTemporaryError(result.error)) {
        return result;
      }
      
      // リトライ前に少し待機
      await new Promise(resolve => setTimeout(resolve, 1000 * (retries + 1)));
      retries++;
      
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      
      // リトライしない、または最大リトライ回数に達した場合
      if (!retryOnFailure || retries >= maxRetries) {
        break;
      }
      
      // リトライ前に少し待機
      await new Promise(resolve => setTimeout(resolve, 1000 * (retries + 1)));
      retries++;
    }
  }
  
  // すべてのリトライが失敗した場合
  return {
    success: false,
    error: lastError?.message || '決済処理に失敗しました',
    requiresAction: false
  } as PaymentResult;
}

/**
 * 3Dセキュア認証処理
 * 
 * @param cardData クレジットカード情報
 * @param amount 金額
 * @returns 認証結果
 */
async function process3DSecureAuthentication(
  cardData: CreditCardData,
  amount: number
): Promise<{ success: boolean; transactionId?: string }> {
  try {
    // 3Dセキュア認証を初期化
    const threeDSecureData = await initiate3DSecure(
      cardData,
      amount,
      `order-${Date.now()}`
    );
    
    // 認証が不要（フリクションレス認証）の場合
    if (threeDSecureData.status === 'success') {
      return {
        success: true,
        transactionId: threeDSecureData.id
      };
    }
    
    // 認証URLがない場合はエラー
    if (!threeDSecureData.authenticationUrl) {
      throw new Error('3Dセキュア認証URLが取得できませんでした');
    }
    
    // 認証モーダルを表示
    const authResult = await show3DSecureModal(threeDSecureData.authenticationUrl);
    
    if (!authResult) {
      return { success: false };
    }
    
    // 認証完了処理
    const completeResult = await complete3DSecure(
      threeDSecureData.id,
      {} // 実際の実装では、コールバックパラメータを使用
    );
    
    return {
      success: completeResult.success,
      transactionId: completeResult.transactionId
    };
  } catch (error) {
    console.error('3Dセキュア認証中にエラーが発生しました:', error);
    return { success: false };
  }
}

/**
 * 一時的なエラーかどうかを判断
 * 
 * @param errorMessage エラーメッセージ
 * @returns 一時的なエラーかどうか
 */
function isTemporaryError(errorMessage: string): boolean {
  const temporaryErrorPatterns = [
    'timeout',
    'タイムアウト',
    'network',
    'ネットワーク',
    'temporary',
    '一時的',
    'retry',
    'リトライ',
    'unavailable',
    '利用できません'
  ];
  
  return temporaryErrorPatterns.some(pattern => 
    errorMessage.toLowerCase().includes(pattern.toLowerCase())
  );
}

/**
 * 決済データからユーザーIDを抽出
 * 
 * @param paymentData 決済データ
 * @returns ユーザーID
 */
function extractUserId(paymentData: PaymentData): string {
  // 実際の実装では、適切なプロパティからユーザーIDを取得
  // このモック実装では bookingId を使用
  return `user_${paymentData.bookingId.split('-')[0]}`;
}

/**
 * モック決済処理
 * 
 * @param paymentData 決済データ
 * @returns 決済結果
 */
async function mockPaymentProcessing(paymentData: PaymentData): Promise<PaymentResult> {
  // 処理時間をシミュレート
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
  
  // 90%の確率で成功
  const isSuccess = Math.random() < 0.9;
  
  if (isSuccess) {
    return {
      success: true,
      transactionId: `tx-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      receiptUrl: `https://echo.example.com/receipts/${Date.now()}`
    };
  }
  
  // ランダムなエラーを生成
  const errorTypes = [
    'カード情報が無効です',
    'ネットワークエラーが発生しました。しばらくしてからお試しください',
    'カードの利用限度額を超えています',
    '決済サービスが一時的に利用できません'
  ];
  
  return {
    success: false,
    error: errorTypes[Math.floor(Math.random() * errorTypes.length)],
    requiresAction: false
  } as PaymentResult;
}
