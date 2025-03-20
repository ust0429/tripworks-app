/**
 * 不正検知モジュールのインデックスファイル
 */
export * from './anomalyDetection';
export * from './deviceFingerprinting';
export * from './geoRiskAnalysis';
export * from './velocityChecks';

// 全体の不正検知スコアを計算する統合ユーティリティをここに追加
import { RiskScore, TransactionFeatures, detectAnomaly } from './anomalyDetection';
import { 
  DeviceFingerprint, 
  collectDeviceFingerprint, 
  generateDeviceId 
} from './deviceFingerprinting';
import { 
  GeoLocation, 
  GeoRiskResult, 
  analyzeGeoRisk, 
  getLocationFromIP, 
  getCurrentIP 
} from './geoRiskAnalysis';
import { 
  VelocityCheckResult, 
  checkTransactionVelocity, 
  getTransactionHistory, 
  calculateVelocityFraudScore 
} from './velocityChecks';

/**
 * 統合リスク評価結果
 */
export interface ConsolidatedRiskAssessment {
  overallScore: number; // 0-1（1が最高リスク）
  requiresManualReview: boolean;
  requiresAdditionalVerification: boolean;
  blockTransaction: boolean;
  detailedScores: {
    anomalyScore: number;
    geoRiskScore: number;
    velocityScore: number;
    deviceRiskScore: number;
  };
  reasons: string[];
  suggestedActions: string[];
}

/**
 * 不正検知の統合評価のための入力データ
 */
export interface FraudDetectionInput {
  transactionFeatures: TransactionFeatures;
  deviceFingerprint?: DeviceFingerprint;
  currentLocation?: GeoLocation;
  registrationLocation?: GeoLocation;
  userId?: string;
}

/**
 * 各種不正検知アルゴリズムを統合して評価
 * 
 * @param input 評価対象データ
 * @returns 統合リスク評価結果
 */
export async function evaluateRisk(
  input: FraudDetectionInput
): Promise<ConsolidatedRiskAssessment> {
  const reasons: string[] = [];
  const suggestedActions: string[] = [];
  
  // 1. 異常検知による評価
  const anomalyResult = detectAnomaly(input.transactionFeatures);
  
  // 2. 地理的リスク評価
  let geoRiskResult: GeoRiskResult | null = null;
  if (input.currentLocation) {
    geoRiskResult = analyzeGeoRisk(input.currentLocation, input.registrationLocation);
  }
  
  // 3. 速度チェック評価
  let velocityResult: VelocityCheckResult | null = null;
  if (input.userId) {
    const history = getTransactionHistory(input.userId);
    velocityResult = checkTransactionVelocity(
      input.userId,
      input.transactionFeatures.amount,
      input.transactionFeatures.paymentMethod,
      history
    );
  }
  
  // 4. デバイス評価スコア（簡易実装）
  let deviceRiskScore = 0;
  if (input.deviceFingerprint) {
    // デバイスフィンガープリントの前回値と比較するロジックが必要
    // ここでは簡易的に、デバイス情報が少ない場合にリスクを高める
    if (!input.deviceFingerprint.webglFingerprint) deviceRiskScore += 0.2;
    if (!input.deviceFingerprint.canvasFingerprint) deviceRiskScore += 0.2;
    if (!input.deviceFingerprint.audioFingerprint) deviceRiskScore += 0.1;
    if (!input.deviceFingerprint.platform) deviceRiskScore += 0.1;
  } else {
    // デバイス情報がない場合は高リスク
    deviceRiskScore = 0.8;
    reasons.push('デバイス情報が取得できていません');
    suggestedActions.push('ブラウザの設定を確認し、JavaScriptを有効にしてください');
  }
  
  // 異常検知の理由を追加
  reasons.push(...anomalyResult.reasons);
  
  // 地理リスクの理由を追加
  if (geoRiskResult && geoRiskResult.riskLevel !== 'low') {
    reasons.push(...geoRiskResult.reasons);
    
    if (geoRiskResult.riskLevel === 'high') {
      suggestedActions.push('通常利用地域からアクセスするか、アカウント確認を行ってください');
    }
  }
  
  // 速度チェックの理由を追加
  if (velocityResult && !velocityResult.allow) {
    reasons.push(...velocityResult.reasons);
    
    if (velocityResult.remainingCooldownSeconds > 0) {
      const minutes = Math.ceil(velocityResult.remainingCooldownSeconds / 60);
      suggestedActions.push(`しばらく時間を置いてから（約${minutes}分後に）再度お試しください`);
    }
  }
  
  // 各スコアを加重平均して総合評価
  const velocityScore = velocityResult ? calculateVelocityFraudScore(velocityResult) : 0;
  const geoScore = geoRiskResult ? geoRiskResult.score : 0;
  
  // 各要素の重み付け
  const weights = {
    anomaly: 0.4,
    geo: 0.2,
    velocity: 0.25,
    device: 0.15
  };
  
  // 総合スコアの計算
  const overallScore = 
    (anomalyResult.score * weights.anomaly) +
    (geoScore * weights.geo) +
    (velocityScore * weights.velocity) +
    (deviceRiskScore * weights.device);
  
  // 判断基準
  const requiresManualReview = overallScore >= 0.6;
  const requiresAdditionalVerification = overallScore >= 0.4;
  const blockTransaction = overallScore >= 0.8;
  
  // 総合評価に基づく追加アクション
  if (blockTransaction) {
    suggestedActions.push('サポートセンターにお問い合わせください');
  } else if (requiresAdditionalVerification) {
    suggestedActions.push('追加の本人確認を行ってください');
  }
  
  return {
    overallScore,
    requiresManualReview,
    requiresAdditionalVerification,
    blockTransaction,
    detailedScores: {
      anomalyScore: anomalyResult.score,
      geoRiskScore: geoScore,
      velocityScore,
      deviceRiskScore
    },
    reasons,
    suggestedActions
  };
}

/**
 * デバイス情報と現在位置を含めた取引リスク評価
 * 
 * @param userId ユーザーID
 * @param transactionFeatures 取引特徴
 * @returns リスク評価結果
 */
export async function evaluateTransactionRisk(
  userId: string,
  transactionFeatures: TransactionFeatures
): Promise<ConsolidatedRiskAssessment> {
  // デバイス情報の収集
  const deviceFingerprint = await collectDeviceFingerprint();
  
  // 位置情報の取得
  const ipAddress = await getCurrentIP();
  const currentLocation = await getLocationFromIP(ipAddress);
  
  // 登録時の位置情報（実際にはDBから取得）
  const mockRegistrationLocation: GeoLocation = {
    country: 'JP',
    region: 'Tokyo',
    city: 'Shinjuku',
    latitude: 35.6895,
    longitude: 139.6917,
    timezone: 'Asia/Tokyo'
  };
  
  // リスク評価の実行
  return evaluateRisk({
    transactionFeatures,
    deviceFingerprint,
    currentLocation,
    registrationLocation: mockRegistrationLocation,
    userId
  });
}

/**
 * 不正検知結果を処理するためのヘルパー関数
 * 
 * @param assessment リスク評価結果
 * @returns 次のアクションの推奨
 */
export function handleFraudDetectionResult(
  assessment: ConsolidatedRiskAssessment
): {
  allowTransaction: boolean;
  requireChallenge: boolean;
  message: string;
  redirectUrl?: string;
} {
  if (assessment.blockTransaction) {
    return {
      allowTransaction: false,
      requireChallenge: false,
      message: 'セキュリティ上の理由により、この取引は処理できません。サポートにお問い合わせください。',
      redirectUrl: '/support/contact'
    };
  }
  
  if (assessment.requiresAdditionalVerification) {
    return {
      allowTransaction: true,
      requireChallenge: true,
      message: '安全のため、追加認証が必要です。',
      redirectUrl: '/verification'
    };
  }
  
  return {
    allowTransaction: true,
    requireChallenge: false,
    message: '取引を続行します。'
  };
}
