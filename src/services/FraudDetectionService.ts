/**
 * 不正検知サービス
 * 
 * 決済処理前に不正検知を実行し、結果に応じたアクションを提供します。
 */

import { 
  evaluateTransactionRisk,
  handleFraudDetectionResult,
  TransactionFeatures,
  ConsolidatedRiskAssessment
} from '../utils/fraudDetection';
import { getUser } from './UserService'; // 仮想のユーザーサービス

/**
 * 決済のための不正検知結果
 */
export interface FraudDetectionResult {
  allowed: boolean;
  requireAdditionalVerification: boolean;
  requireManualReview: boolean;
  redirectUrl?: string;
  challengeType?: 'sms' | 'email' | 'captcha' | '3ds';
  reasons: string[];
  suggestedActions: string[];
  riskScore: number;
}

/**
 * 決済リクエストのための入力データ
 */
export interface PaymentRequest {
  userId: string;
  amount: number;
  paymentMethod: string;
  productId?: string;
  currency?: string;
  deviceId?: string;
  ipAddress?: string;
}

/**
 * 決済前の不正検知チェック
 * 
 * @param paymentRequest 決済リクエスト
 * @returns 不正検知結果
 */
export async function performPrePaymentFraudCheck(
  paymentRequest: PaymentRequest
): Promise<FraudDetectionResult> {
  try {
    // ユーザー情報の取得（実際の実装ではAPI/DBから取得）
    const user = getUser(paymentRequest.userId);

    if (!user) {
      return {
        allowed: false,
        requireAdditionalVerification: false,
        requireManualReview: true,
        reasons: ['ユーザー情報が見つかりません'],
        suggestedActions: ['アカウント認証をやり直してください'],
        riskScore: 1.0
      };
    }

    // 取引特徴の構築
    const now = new Date();
    const transactionFeatures: TransactionFeatures = {
      amount: paymentRequest.amount,
      deviceId: paymentRequest.deviceId,
      ipAddress: paymentRequest.ipAddress,
      transactionType: 'payment',
      paymentMethod: paymentRequest.paymentMethod,
      timeOfDay: now.getHours(),
      dayOfWeek: now.getDay(),
      userHistory: {
        transactionCount: user.transactionCount || 0,
        averageAmount: user.averageTransactionAmount || 0,
        lastTransactionDate: user.lastTransactionDate,
        usedPaymentMethods: user.usedPaymentMethods || []
      }
    };

    // リスク評価の実行
    const riskAssessment = await evaluateTransactionRisk(
      paymentRequest.userId,
      transactionFeatures
    );

    // 結果の処理
    const nextAction = handleFraudDetectionResult(riskAssessment);

    // チャレンジタイプの決定
    let challengeType: 'sms' | 'email' | 'captcha' | '3ds' | undefined;
    
    if (nextAction.requireChallenge) {
      // 決済方法に基づいてチャレンジタイプを決定
      if (paymentRequest.paymentMethod.includes('credit_card')) {
        challengeType = '3ds';
      } else if (user.phoneVerified) {
        challengeType = 'sms';
      } else if (user.emailVerified) {
        challengeType = 'email';
      } else {
        challengeType = 'captcha';
      }
    }

    return {
      allowed: nextAction.allowTransaction,
      requireAdditionalVerification: nextAction.requireChallenge,
      requireManualReview: riskAssessment.requiresManualReview,
      redirectUrl: nextAction.redirectUrl,
      challengeType,
      reasons: riskAssessment.reasons,
      suggestedActions: riskAssessment.suggestedActions,
      riskScore: riskAssessment.overallScore
    };
  } catch (error) {
    console.error('不正検知処理中にエラーが発生しました:', error);
    
    // エラー時のフォールバック（安全側に倒す）
    return {
      allowed: false,
      requireAdditionalVerification: true,
      requireManualReview: true,
      reasons: ['不正検知処理中にエラーが発生しました'],
      suggestedActions: ['しばらく時間をおいて再度お試しください', 'サポートにお問い合わせください'],
      riskScore: 0.7
    };
  }
}

/**
 * 不審な取引を管理側に報告
 * 
 * @param assessment リスク評価結果
 * @param paymentRequest 決済リクエスト
 */
export function reportSuspiciousTransaction(
  assessment: ConsolidatedRiskAssessment,
  paymentRequest: PaymentRequest
): void {
  if (assessment.requiresManualReview) {
    // 実際の実装では、管理システムへの通知や内部APIの呼び出しを行う
    console.warn('不審な取引が検出されました:', {
      userId: paymentRequest.userId,
      amount: paymentRequest.amount,
      paymentMethod: paymentRequest.paymentMethod,
      riskScore: assessment.overallScore,
      reasons: assessment.reasons
    });
    
    // 高リスクの場合はリアルタイム通知
    if (assessment.blockTransaction) {
      // 例: 管理者向けSlack通知、管理ダッシュボードへのアラート送信など
      console.error('高リスク取引のためブロックされました:', paymentRequest);
    }
  }
}

/**
 * 不正検知結果を保存
 * 
 * @param userId ユーザーID
 * @param riskAssessment リスク評価結果
 */
export function storeFraudDetectionResult(
  userId: string,
  riskAssessment: ConsolidatedRiskAssessment
): void {
  try {
    // 実際の実装では、DBやログシステムに保存
    const results = JSON.parse(localStorage.getItem('echo_fraud_detection_results') || '{}');
    
    // ユーザーIDでグループ化
    if (!results[userId]) {
      results[userId] = [];
    }
    
    // 結果の保存（最大10件まで）
    results[userId].unshift({
      timestamp: Date.now(),
      overallScore: riskAssessment.overallScore,
      detailedScores: riskAssessment.detailedScores,
      reasons: riskAssessment.reasons,
      requiresAdditionalVerification: riskAssessment.requiresAdditionalVerification,
      blockTransaction: riskAssessment.blockTransaction
    });
    
    // 最大10件に制限
    if (results[userId].length > 10) {
      results[userId] = results[userId].slice(0, 10);
    }
    
    localStorage.setItem('echo_fraud_detection_results', JSON.stringify(results));
  } catch (error) {
    console.error('不正検知結果の保存に失敗しました:', error);
  }
}

/**
 * ユーザーの過去の不正検知結果を取得
 * 
 * @param userId ユーザーID
 * @returns 不正検知結果履歴
 */
export function getUserFraudDetectionHistory(userId: string): any[] {
  try {
    const results = JSON.parse(localStorage.getItem('echo_fraud_detection_results') || '{}');
    return results[userId] || [];
  } catch (error) {
    console.error('不正検知履歴の取得に失敗しました:', error);
    return [];
  }
}
