/**
 * ユーザーサービス
 * 
 * ユーザー情報の取得と管理のためのサービス。
 * 実際の実装では、APIやDBとの連携が必要。
 */

/**
 * ユーザー情報の型定義
 */
export interface User {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  address?: {
    country: string;
    region?: string;
    city?: string;
    postalCode?: string;
    streetAddress?: string;
  };
  registrationDate: string;
  lastLoginDate?: string;
  status: 'active' | 'suspended' | 'deactivated';
  emailVerified: boolean;
  phoneVerified: boolean;
  transactionCount: number;
  averageTransactionAmount: number;
  lastTransactionDate?: string;
  usedPaymentMethods: string[];
  riskProfile?: {
    score: number;
    level: 'low' | 'medium' | 'high';
    lastUpdated: string;
  };
  deviceIds?: string[];
  ipAddresses?: string[];
}

// モックユーザーデータ（実際の実装ではDBから取得）
const MOCK_USERS: Record<string, User> = {
  'user_123': {
    id: 'user_123',
    name: '山田 太郎',
    email: 'yamada@example.com',
    phoneNumber: '080-1234-5678',
    address: {
      country: 'JP',
      region: 'Tokyo',
      city: 'Shinjuku',
      postalCode: '160-0022',
      streetAddress: '新宿区新宿 1-1-1'
    },
    registrationDate: '2023-01-15T09:30:00Z',
    lastLoginDate: '2025-03-19T15:45:00Z',
    status: 'active',
    emailVerified: true,
    phoneVerified: true,
    transactionCount: 12,
    averageTransactionAmount: 15000,
    lastTransactionDate: '2025-03-15T10:20:00Z',
    usedPaymentMethods: ['credit_card', 'convenience'],
    riskProfile: {
      score: 0.12,
      level: 'low',
      lastUpdated: '2025-03-15T10:25:00Z'
    },
    deviceIds: ['device_abc123', 'device_def456'],
    ipAddresses: ['192.168.1.1', '10.0.0.1']
  },
  'user_456': {
    id: 'user_456',
    name: '鈴木 花子',
    email: 'suzuki@example.com',
    phoneNumber: '090-8765-4321',
    address: {
      country: 'JP',
      region: 'Osaka',
      city: 'Osaka',
      postalCode: '530-0001',
      streetAddress: '大阪市北区梅田 2-2-2'
    },
    registrationDate: '2023-05-20T14:20:00Z',
    lastLoginDate: '2025-03-18T09:15:00Z',
    status: 'active',
    emailVerified: true,
    phoneVerified: true,
    transactionCount: 5,
    averageTransactionAmount: 8000,
    lastTransactionDate: '2025-03-10T18:30:00Z',
    usedPaymentMethods: ['credit_card', 'qr_code'],
    riskProfile: {
      score: 0.08,
      level: 'low',
      lastUpdated: '2025-03-10T18:35:00Z'
    },
    deviceIds: ['device_ghi789'],
    ipAddresses: ['172.16.0.1']
  }
};

/**
 * ユーザー情報を取得
 * 
 * @param userId ユーザーID
 * @returns ユーザー情報（存在しない場合はnull）
 */
export function getUser(userId: string): User | null {
  // モックデータから取得（実際の実装ではAPI/DBから取得）
  return MOCK_USERS[userId] || null;
}

/**
 * ユーザーの取引情報を更新
 * 
 * @param userId ユーザーID
 * @param transactionAmount 取引金額
 * @param paymentMethod 決済方法
 */
export function updateUserTransactionInfo(
  userId: string,
  transactionAmount: number,
  paymentMethod: string
): void {
  const user = MOCK_USERS[userId];
  if (!user) return;
  
  // 取引回数を更新
  user.transactionCount += 1;
  
  // 平均取引金額を更新
  const totalAmount = user.averageTransactionAmount * (user.transactionCount - 1) + transactionAmount;
  user.averageTransactionAmount = totalAmount / user.transactionCount;
  
  // 最終取引日時を更新
  user.lastTransactionDate = new Date().toISOString();
  
  // 利用決済方法を更新（重複なし）
  if (!user.usedPaymentMethods.includes(paymentMethod)) {
    user.usedPaymentMethods.push(paymentMethod);
  }
}

/**
 * ユーザーのリスクプロファイルを更新
 * 
 * @param userId ユーザーID
 * @param riskScore リスクスコア（0-1）
 */
export function updateUserRiskProfile(userId: string, riskScore: number): void {
  const user = MOCK_USERS[userId];
  if (!user) return;
  
  // リスクレベルの決定
  let riskLevel: 'low' | 'medium' | 'high';
  if (riskScore <= 0.3) {
    riskLevel = 'low';
  } else if (riskScore <= 0.7) {
    riskLevel = 'medium';
  } else {
    riskLevel = 'high';
  }
  
  // リスクプロファイルの更新
  user.riskProfile = {
    score: riskScore,
    level: riskLevel,
    lastUpdated: new Date().toISOString()
  };
}

/**
 * ユーザーのデバイスIDを関連付け
 * 
 * @param userId ユーザーID
 * @param deviceId デバイスID
 */
export function associateDeviceWithUser(userId: string, deviceId: string): void {
  const user = MOCK_USERS[userId];
  if (!user) return;
  
  if (!user.deviceIds) {
    user.deviceIds = [];
  }
  
  // 重複がなければ追加
  if (!user.deviceIds.includes(deviceId)) {
    user.deviceIds.push(deviceId);
  }
}

/**
 * ユーザーのIPアドレスを関連付け
 * 
 * @param userId ユーザーID
 * @param ipAddress IPアドレス
 */
export function associateIPWithUser(userId: string, ipAddress: string): void {
  const user = MOCK_USERS[userId];
  if (!user) return;
  
  if (!user.ipAddresses) {
    user.ipAddresses = [];
  }
  
  // 重複がなければ追加
  if (!user.ipAddresses.includes(ipAddress)) {
    user.ipAddresses.push(ipAddress);
  }
}
