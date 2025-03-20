/**
 * トランザクション速度監視ユーティリティ
 * 
 * 短時間での複数取引など、不審な行動パターンを検出します。
 */

/**
 * 速度監視の設定
 */
export interface VelocityConfig {
  maxTransactionsPerHour: number;
  maxTransactionsPerDay: number;
  maxAmountPerDay: number;
  maxPaymentMethodsPerDay: number;
  cooldownPeriodMinutes: number;
}

/**
 * ユーザー取引履歴エントリ
 */
export interface TransactionHistoryEntry {
  userId: string;
  transactionId: string;
  timestamp: number;
  amount: number;
  paymentMethod: string;
  success: boolean;
}

/**
 * 速度チェックの結果
 */
export interface VelocityCheckResult {
  allow: boolean;
  reasons: string[];
  transactionsLastHour: number;
  transactionsLastDay: number;
  amountLastDay: number;
  uniquePaymentMethodsLastDay: number;
  remainingCooldownSeconds: number;
}

// デフォルト設定
const DEFAULT_VELOCITY_CONFIG: VelocityConfig = {
  maxTransactionsPerHour: 3,
  maxTransactionsPerDay: 10,
  maxAmountPerDay: 100000, // 100,000円
  maxPaymentMethodsPerDay: 3,
  cooldownPeriodMinutes: 5 // トランザクション間の最小間隔（分）
};

/**
 * 取引速度をチェックし、不審なパターンを検出
 * 
 * @param userId ユーザーID
 * @param amount 取引金額
 * @param paymentMethod 決済方法
 * @param history 過去の取引履歴
 * @param config 速度監視設定
 * @returns 速度チェック結果
 */
export function checkTransactionVelocity(
  userId: string,
  amount: number,
  paymentMethod: string,
  history: TransactionHistoryEntry[],
  config: VelocityConfig = DEFAULT_VELOCITY_CONFIG
): VelocityCheckResult {
  const now = Date.now();
  const oneHourAgo = now - (60 * 60 * 1000);
  const oneDayAgo = now - (24 * 60 * 60 * 1000);
  
  // このユーザーの過去の取引をフィルタリング
  const userHistory = history.filter(entry => entry.userId === userId && entry.success);
  
  // 直近1時間の取引数
  const transactionsLastHour = userHistory.filter(
    entry => entry.timestamp >= oneHourAgo
  ).length;
  
  // 直近24時間の取引数と合計金額
  const transactionsLastDay = userHistory.filter(
    entry => entry.timestamp >= oneDayAgo
  );
  
  const transactionsLastDayCount = transactionsLastDay.length;
  
  // 直近24時間の合計金額
  const amountLastDay = transactionsLastDay.reduce(
    (sum, entry) => sum + entry.amount, 0
  ) + amount; // 現在の取引金額も含める
  
  // 直近24時間のユニーク決済方法数
  const uniquePaymentMethodsLastDay = new Set(
    [...transactionsLastDay.map(entry => entry.paymentMethod), paymentMethod]
  ).size;
  
  // 最後の取引からの経過時間（秒）
  let remainingCooldownSeconds = 0;
  if (userHistory.length > 0) {
    const lastTransaction = userHistory.reduce(
      (latest, entry) => entry.timestamp > latest.timestamp ? entry : latest,
      userHistory[0]
    );
    
    const elapsedSeconds = (now - lastTransaction.timestamp) / 1000;
    const cooldownSeconds = config.cooldownPeriodMinutes * 60;
    
    if (elapsedSeconds < cooldownSeconds) {
      remainingCooldownSeconds = cooldownSeconds - elapsedSeconds;
    }
  }
  
  // 判定ロジック
  const reasons: string[] = [];
  
  if (transactionsLastHour >= config.maxTransactionsPerHour) {
    reasons.push(`1時間あたりの取引数上限(${config.maxTransactionsPerHour})を超過しています`);
  }
  
  if (transactionsLastDayCount >= config.maxTransactionsPerDay) {
    reasons.push(`24時間あたりの取引数上限(${config.maxTransactionsPerDay})を超過しています`);
  }
  
  if (amountLastDay > config.maxAmountPerDay) {
    reasons.push(`24時間あたりの取引金額上限(${config.maxAmountPerDay.toLocaleString()}円)を超過しています`);
  }
  
  if (uniquePaymentMethodsLastDay > config.maxPaymentMethodsPerDay) {
    reasons.push(`24時間あたりの決済方法数上限(${config.maxPaymentMethodsPerDay})を超過しています`);
  }
  
  if (remainingCooldownSeconds > 0) {
    const remainingMinutes = Math.ceil(remainingCooldownSeconds / 60);
    reasons.push(`前回の取引から${config.cooldownPeriodMinutes}分経過していません。あと約${remainingMinutes}分お待ちください`);
  }
  
  return {
    allow: reasons.length === 0,
    reasons,
    transactionsLastHour,
    transactionsLastDay: transactionsLastDayCount,
    amountLastDay,
    uniquePaymentMethodsLastDay,
    remainingCooldownSeconds
  };
}

/**
 * 取引履歴をローカルストレージに保存
 * 
 * 実際の実装では、サーバー側でこの処理を行います。
 * これはクライアント側での簡易実装です。
 * 
 * @param entry 取引履歴エントリ
 */
export function storeTransactionHistory(entry: TransactionHistoryEntry): void {
  try {
    // 既存の履歴を取得
    const historyJson = localStorage.getItem('echo_transaction_history');
    const history: TransactionHistoryEntry[] = historyJson ? JSON.parse(historyJson) : [];
    
    // 新しいエントリを追加
    history.push(entry);
    
    // 古いエントリを削除（過去30日のみ保持）
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    const filteredHistory = history.filter(entry => entry.timestamp >= thirtyDaysAgo);
    
    // 更新した履歴を保存
    localStorage.setItem('echo_transaction_history', JSON.stringify(filteredHistory));
  } catch (e) {
    console.error('取引履歴の保存に失敗:', e);
  }
}

/**
 * 保存された取引履歴を取得
 * 
 * 実際の実装では、サーバー側からこのデータを取得します。
 * これはクライアント側での簡易実装です。
 * 
 * @param userId 特定のユーザーIDでフィルタリングする場合（省略可）
 * @returns 取引履歴
 */
export function getTransactionHistory(userId?: string): TransactionHistoryEntry[] {
  try {
    const historyJson = localStorage.getItem('echo_transaction_history');
    if (!historyJson) return [];
    
    const history: TransactionHistoryEntry[] = JSON.parse(historyJson);
    
    // ユーザーIDが指定された場合、そのユーザーの履歴のみ返す
    if (userId) {
      return history.filter(entry => entry.userId === userId);
    }
    
    return history;
  } catch (e) {
    console.error('取引履歴の取得に失敗:', e);
    return [];
  }
}

/**
 * 取引ベロシティから不正スコアを計算
 * 
 * @param velocityResult 速度チェック結果
 * @returns 不正スコア (0-1)
 */
export function calculateVelocityFraudScore(velocityResult: VelocityCheckResult): number {
  if (velocityResult.allow) return 0;
  
  let score = 0;
  
  // 1時間あたりの取引数による評価
  if (velocityResult.transactionsLastHour > DEFAULT_VELOCITY_CONFIG.maxTransactionsPerHour) {
    const excess = velocityResult.transactionsLastHour - DEFAULT_VELOCITY_CONFIG.maxTransactionsPerHour;
    score += 0.2 * Math.min(excess / 2, 1);
  }
  
  // 24時間あたりの取引数による評価
  if (velocityResult.transactionsLastDay > DEFAULT_VELOCITY_CONFIG.maxTransactionsPerDay) {
    const excess = velocityResult.transactionsLastDay - DEFAULT_VELOCITY_CONFIG.maxTransactionsPerDay;
    score += 0.2 * Math.min(excess / 5, 1);
  }
  
  // 24時間あたりの金額による評価
  if (velocityResult.amountLastDay > DEFAULT_VELOCITY_CONFIG.maxAmountPerDay) {
    const excessRatio = velocityResult.amountLastDay / DEFAULT_VELOCITY_CONFIG.maxAmountPerDay;
    score += 0.3 * Math.min(excessRatio - 1, 1);
  }
  
  // 決済方法数による評価
  if (velocityResult.uniquePaymentMethodsLastDay > DEFAULT_VELOCITY_CONFIG.maxPaymentMethodsPerDay) {
    const excess = velocityResult.uniquePaymentMethodsLastDay - DEFAULT_VELOCITY_CONFIG.maxPaymentMethodsPerDay;
    score += 0.2 * Math.min(excess, 1);
  }
  
  // クールダウン違反による評価
  if (velocityResult.remainingCooldownSeconds > 0) {
    const severityRatio = velocityResult.remainingCooldownSeconds / (DEFAULT_VELOCITY_CONFIG.cooldownPeriodMinutes * 60);
    score += 0.1 * Math.min(severityRatio, 1);
  }
  
  return Math.min(score, 1);
}
