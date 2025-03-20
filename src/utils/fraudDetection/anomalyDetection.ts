/**
 * 機械学習に基づく異常検知ユーティリティ
 * 
 * 本番環境では、実際のデータに基づいた訓練モデルを使用します。
 * このファイルはフロントエンドでの不正検知のための基本実装です。
 */

// 閾値 - 実環境では学習モデルと組み合わせて設定
const RISK_THRESHOLD = 0.7; 

/**
 * 取引の特徴量を表す型
 */
export interface TransactionFeatures {
  amount: number;
  deviceId?: string;
  ipAddress?: string;
  userHistory?: {
    transactionCount?: number;
    averageAmount?: number;
    lastTransactionDate?: string;
    usedPaymentMethods?: string[];
  };
  geoData?: {
    country?: string;
    city?: string;
    distanceFromRegistration?: number; // km単位
  };
  deviceFingerprint?: {
    browser?: string;
    platform?: string;
    language?: string;
    screenResolution?: string;
    timezone?: string;
    userAgent?: string;
    webglFingerprint?: string;
    canvasFingerprint?: string;
  };
  transactionType: string;
  productCategory?: string;
  paymentMethod: string;
  timeOfDay?: number; // 0-23
  dayOfWeek?: number; // 0-6 (0は日曜日)
  velocity?: {
    transactionsLastHour?: number;
    transactionsLastDay?: number;
    paymentMethodChanges?: number;
  };
}

/**
 * リスクスコアの結果
 */
export interface RiskScore {
  score: number; // 0-1 (1が最高リスク)
  reasons: string[];
  requiresAdditionalVerification: boolean;
  blockTransaction: boolean;
}

/**
 * 異常検知用モックデータ
 */
const mockAnomalyData = {
  maximumUsualAmount: 50000, // 通常の最大金額(円)
  unusualTimeRanges: [0, 5], // 異常とみなす時間帯(0-5時)
  highRiskCountries: ['XX', 'YY', 'ZZ'], // 高リスク国コード
  knownFraudPatterns: [
    // IPアドレスとデバイスIDの組み合わせが異なる場合は不審
    (features: TransactionFeatures) => {
      if (features.deviceId && features.ipAddress) {
        // ここでは簡易実装。実際には履歴データとの比較が必要
        return Math.random() < 0.1; // 10%の確率でパターンマッチ
      }
      return false;
    },
    // 短時間での複数回の取引
    (features: TransactionFeatures) => {
      if (features.velocity?.transactionsLastHour && features.velocity.transactionsLastHour > 3) {
        return true;
      }
      return false;
    },
    // 通常と異なる金額の取引
    (features: TransactionFeatures) => {
      if (features.userHistory?.averageAmount && 
          features.amount > features.userHistory.averageAmount * 5) {
        return true;
      }
      return false;
    }
  ]
};

/**
 * 不正検知アルゴリズム - 機械学習モデルの代わりに簡易ルールベースの実装
 * 
 * @param features 取引の特徴量
 * @returns リスクスコアと理由
 */
export function detectAnomaly(features: TransactionFeatures): RiskScore {
  const reasons: string[] = [];
  let score = 0;
  
  // 基本チェック - 金額
  if (features.amount > mockAnomalyData.maximumUsualAmount) {
    reasons.push('通常よりも高額な取引');
    score += 0.3;
  }
  
  // 時間帯チェック
  if (features.timeOfDay !== undefined && 
      (features.timeOfDay >= mockAnomalyData.unusualTimeRanges[0] && 
       features.timeOfDay <= mockAnomalyData.unusualTimeRanges[1])) {
    reasons.push('通常とは異なる時間帯の取引');
    score += 0.2;
  }
  
  // 地域チェック
  if (features.geoData?.country && 
      mockAnomalyData.highRiskCountries.includes(features.geoData.country)) {
    reasons.push('高リスク地域からの取引');
    score += 0.4;
  }
  
  // 距離チェック
  if (features.geoData?.distanceFromRegistration && 
      features.geoData.distanceFromRegistration > 500) {
    reasons.push('登録地から離れた場所からの取引');
    score += 0.2;
  }
  
  // 履歴チェック
  if (!features.userHistory || features.userHistory.transactionCount === 0) {
    reasons.push('過去の取引履歴がない');
    score += 0.2;
  }
  
  // デバイスチェック
  if (!features.deviceId) {
    reasons.push('デバイスIDが取得できていない');
    score += 0.3;
  }

  // 速度チェック
  if (features.velocity?.transactionsLastHour && features.velocity.transactionsLastHour > 2) {
    reasons.push('短時間に複数の取引');
    score += 0.3 * Math.min(features.velocity.transactionsLastHour / 2, 1);
  }
  
  // 学習済みパターンチェック
  for (const patternDetector of mockAnomalyData.knownFraudPatterns) {
    if (patternDetector(features)) {
      reasons.push('既知の不正パターンに一致');
      score += 0.4;
    }
  }
  
  // スコアの正規化 (0-1の範囲に収める)
  score = Math.min(score, 1);
  
  // 結果の組み立て
  return {
    score,
    reasons,
    requiresAdditionalVerification: score >= RISK_THRESHOLD * 0.7,
    blockTransaction: score >= RISK_THRESHOLD
  };
}

/**
 * 追加検証が必要かどうかを判断
 * 
 * @param score リスクスコア
 * @returns 追加検証が必要かどうか
 */
export function requiresAdditionalVerification(score: number): boolean {
  return score >= RISK_THRESHOLD * 0.7;
}

/**
 * 取引をブロックすべきかどうかを判断
 * 
 * @param score リスクスコア
 * @returns ブロックすべきかどうか
 */
export function shouldBlockTransaction(score: number): boolean {
  return score >= RISK_THRESHOLD;
}
