/**
 * サービス設定
 * 
 * モックサービスと実APIサービスの切り替え設定
 */

import { useMockData } from './env';

// サービス種別
export type ServiceType = 'mock' | 'api';

// サービス設定
export interface ServiceConfiguration {
  // サービスタイプ（mock / api）
  type: ServiceType;
  
  // キャッシュ設定
  cache: {
    // キャッシュ有効化
    enabled: boolean;
    // キャッシュ有効期間（ミリ秒）
    ttl: number;
  };
  
  // ネットワーク設定
  network: {
    // タイムアウト（ミリ秒）
    timeout: number;
    // 再試行設定
    retry: {
      // 最大再試行回数
      maxAttempts: number;
      // 再試行間隔（ミリ秒）
      interval: number;
    };
  };
  
  // ログ設定
  logging: {
    // リクエストのログ出力
    request: boolean;
    // レスポンスのログ出力
    response: boolean;
    // エラーのログ出力
    error: boolean;
  };
}

// 開発環境の設定
const DEVELOPMENT_CONFIG: ServiceConfiguration = {
  type: useMockData() ? 'mock' : 'api',
  cache: {
    enabled: true,
    ttl: 5 * 60 * 1000 // 5分
  },
  network: {
    timeout: 10000, // 10秒
    retry: {
      maxAttempts: 2,
      interval: 1000 // 1秒
    }
  },
  logging: {
    request: true,
    response: true,
    error: true
  }
};

// 本番環境の設定
const PRODUCTION_CONFIG: ServiceConfiguration = {
  type: 'api', // 本番環境は常に実APIを使用
  cache: {
    enabled: true,
    ttl: 3 * 60 * 1000 // 3分
  },
  network: {
    timeout: 30000, // 30秒
    retry: {
      maxAttempts: 3,
      interval: 2000 // 2秒
    }
  },
  logging: {
    request: false,
    response: false,
    error: true
  }
};

// 環境に応じた設定を取得
export function getServiceConfig(): ServiceConfiguration {
  if (process.env.NODE_ENV === 'production') {
    return PRODUCTION_CONFIG;
  }
  return DEVELOPMENT_CONFIG;
}

// 現在のサービスタイプを取得
export function getCurrentServiceType(): ServiceType {
  return getServiceConfig().type;
}

// モックサービスを使用するかどうかを判定
export function isUsingMockService(): boolean {
  return getCurrentServiceType() === 'mock';
}

// エクスポート
export default {
  getServiceConfig,
  getCurrentServiceType,
  isUsingMockService
};
