/**
 * 開発者向けツール
 * 
 * ブラウザコンソールから利用できる診断とデバッグ用ツール群
 */

import { isDevelopment, isDebugMode } from '../config/env';
import environmentManager, { EnvironmentType } from './environmentManager';
import apiCache from './cache/apiCache';

// 診断情報収集用のインターフェース
interface DiagnosticInfo {
  timestamp: string;
  environment: {
    nodeEnv: string;
    debugMode: boolean;
    currentConfig: any;
  };
  browser: {
    userAgent: string;
    language: string;
    online: boolean;
    storage: {
      localStorage: boolean;
      sessionStorage: boolean;
      indexedDB: boolean;
    };
  };
  network: {
    type?: string;
    downlink?: number;
    rtt?: number;
    effectiveType?: string;
  };
  performance: {
    memory?: {
      jsHeapSizeLimit?: number;
      totalJSHeapSize?: number;
      usedJSHeapSize?: number;
    };
    timing?: any;
  };
  apiCache?: any;
}

/**
 * 診断情報を収集
 */
async function collectDiagnostics(): Promise<DiagnosticInfo> {
  const diagInfo: DiagnosticInfo = {
    timestamp: new Date().toISOString(),
    environment: {
      nodeEnv: process.env.NODE_ENV || 'unknown',
      debugMode: isDebugMode(),
      currentConfig: environmentManager.getEnvironmentConfig()
    },
    browser: {
      userAgent: navigator.userAgent,
      language: navigator.language,
      online: navigator.onLine,
      storage: {
        localStorage: isLocalStorageAvailable(),
        sessionStorage: isSessionStorageAvailable(),
        indexedDB: isIndexedDBAvailable()
      }
    },
    network: {},
    performance: {}
  };

  // ネットワーク情報
  if ('connection' in navigator) {
    const conn = (navigator as any).connection;
    if (conn) {
      diagInfo.network = {
        type: conn.type,
        downlink: conn.downlink,
        rtt: conn.rtt,
        effectiveType: conn.effectiveType
      };
    }
  }

  // パフォーマンス情報
  if (window.performance) {
    // メモリ情報（Chrome限定）
    const perfMemory = (performance as any).memory;
    if (perfMemory) {
      diagInfo.performance.memory = {
        jsHeapSizeLimit: perfMemory.jsHeapSizeLimit,
        totalJSHeapSize: perfMemory.totalJSHeapSize,
        usedJSHeapSize: perfMemory.usedJSHeapSize
      };
    }

    // タイミング情報
    diagInfo.performance.timing = {};
    const timing = performance.timing;
    if (timing) {
      // ブラウザが提供するパフォーマンスメトリクスを収集
      const navigationStart = timing.navigationStart;
      diagInfo.performance.timing = {
        total: timing.loadEventEnd - navigationStart,
        dns: timing.domainLookupEnd - timing.domainLookupStart,
        tcp: timing.connectEnd - timing.connectStart,
        request: timing.responseStart - timing.requestStart,
        response: timing.responseEnd - timing.responseStart,
        dom: timing.domComplete - timing.domLoading,
        interactive: timing.domInteractive - navigationStart,
        contentLoaded: timing.domContentLoadedEventEnd - navigationStart,
        load: timing.loadEventEnd - navigationStart
      };
    }
  }

  // APIキャッシュ情報
  try {
    diagInfo.apiCache = await apiCache.getCacheStats();
  } catch (error) {
    console.error('APIキャッシュ統計取得エラー:', error);
  }

  return diagInfo;
}

/**
 * localStorage が利用可能かチェック
 */
function isLocalStorageAvailable(): boolean {
  try {
    const test = '__test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * sessionStorage が利用可能かチェック
 */
function isSessionStorageAvailable(): boolean {
  try {
    const test = '__test__';
    sessionStorage.setItem(test, test);
    sessionStorage.removeItem(test);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * indexedDB が利用可能かチェック
 */
function isIndexedDBAvailable(): boolean {
  return !!window.indexedDB;
}

/**
 * APIリクエストのテスト
 */
async function testApiConnection(url?: string): Promise<void> {
  const testUrl = url || `${environmentManager.getEnvironmentConfig().apiBaseUrl}/health`;
  console.log(`🔍 APIエンドポイントをテスト中: ${testUrl}`);

  try {
    const startTime = performance.now();
    const response = await fetch(testUrl, { method: 'GET' });
    const endTime = performance.now();
    const duration = endTime - startTime;

    if (response.ok) {
      console.log(`✅ API接続成功 (${duration.toFixed(2)}ms)`);
      console.log('📊 レスポンスステータス:', response.status);
      
      try {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json();
          console.log('📄 レスポンスデータ:', data);
        } else {
          const text = await response.text();
          console.log('📄 レスポンステキスト:', text.substring(0, 500) + (text.length > 500 ? '...' : ''));
        }
      } catch (error) {
        console.log('📄 レスポンスのパースに失敗:', error);
      }
    } else {
      console.error(`❌ API接続エラー: ${response.status} ${response.statusText}`);
    }
    
    console.log('📋 レスポンスヘッダー:');
    response.headers.forEach((value, key) => {
      console.log(`   ${key}: ${value}`);
    });
  } catch (error) {
    console.error('❌ API接続テストエラー:', error);
  }
}

/**
 * ネットワーク状態の監視を開始
 */
function monitorNetworkStatus(): void {
  const updateStatus = () => {
    const isOnline = navigator.onLine;
    console.log(`🌐 ネットワーク状態: ${isOnline ? 'オンライン' : 'オフライン'}`);
    return isOnline;
  };

  // 初期状態を表示
  updateStatus();

  // イベントリスナー設定
  window.addEventListener('online', () => {
    console.log('🌐 ネットワーク接続が復帰しました');
    // オフラインキューの処理を実行（ここではアラートのみ）
    const queuedRequests = apiCache.getQueuedRequests();
    queuedRequests.then(requests => {
      if (requests.length > 0) {
        console.log(`📤 保留中のリクエスト: ${requests.length}件`);
      }
    });
  });

  window.addEventListener('offline', () => {
    console.log('🌐 ネットワーク接続が切断されました');
  });
}

/**
 * ファイルアップロードのテスト
 */
function testFileUpload(fileType: string = 'image'): void {
  // ファイルの種類に応じたMIMEタイプを設定
  let mimeType = 'image/jpeg';
  let extension = 'jpg';
  const size = 1024 * 100; // 100KB

  if (fileType.toLowerCase() === 'pdf') {
    mimeType = 'application/pdf';
    extension = 'pdf';
  } else if (fileType.toLowerCase() === 'text') {
    mimeType = 'text/plain';
    extension = 'txt';
  }

  // テスト用のファイルを生成
  const fileName = `test-upload-${Date.now()}.${extension}`;
  
  // ファイルオブジェクトの作成（中身はランダムデータ）
  const blob = new Blob([new Uint8Array(size).map(() => Math.floor(Math.random() * 256))], { type: mimeType });
  const file = new File([blob], fileName, { type: mimeType });

  console.log(`📤 テスト用ファイルを作成しました: ${fileName} (${(file.size / 1024).toFixed(2)} KB)`);
  console.log('📋 ファイル情報:', {
    name: file.name,
    size: file.size,
    type: file.type,
    lastModified: new Date(file.lastModified)
  });

  // アップロードシミュレーションのアラート
  console.log('⚠️ 注意: これは実際のアップロード機能テスト用のファイルです。実際のアップロードを行うには、apiClient.uploadFile()を使用してください。');
}

/**
 * データストレージの確認
 */
async function checkStorage(): Promise<void> {
  console.log('🔍 ストレージ状態確認中...');

  // LocalStorage
  try {
    const lsKeys = Object.keys(localStorage);
    const lsSize = calculateStorageSize(localStorage);
    console.log(`📦 LocalStorage: ${lsKeys.length}アイテム (約${formatBytes(lsSize)})`);
    
    // Echo関連のアイテムのみ表示
    const echoKeys = lsKeys.filter(key => key.startsWith('echo_'));
    if (echoKeys.length > 0) {
      console.log('📋 Echo関連アイテム:');
      echoKeys.forEach(key => {
        try {
          const value = localStorage.getItem(key);
          console.log(`   ${key}: ${formatStorageValue(value)}`);
        } catch (error) {
          console.log(`   ${key}: [取得エラー]`);
        }
      });
    }
  } catch (error) {
    console.error('❌ LocalStorage確認エラー:', error);
  }

  // SessionStorage
  try {
    const ssKeys = Object.keys(sessionStorage);
    const ssSize = calculateStorageSize(sessionStorage);
    console.log(`📦 SessionStorage: ${ssKeys.length}アイテム (約${formatBytes(ssSize)})`);
  } catch (error) {
    console.error('❌ SessionStorage確認エラー:', error);
  }

  // IndexedDB (APIキャッシュ)
  try {
    const stats = await apiCache.getCacheStats();
    console.log('📦 IndexedDB (APIキャッシュ):', stats);
    console.log(`   📊 キャッシュアイテム数: ${stats.totalItems}`);
    console.log(`   📊 推定サイズ: ${formatBytes(stats.totalSize)}`);
    if (stats.oldestItem) {
      console.log(`   📊 最古のアイテム: ${stats.oldestItem.toLocaleString()}`);
    }
    if (stats.newestItem) {
      console.log(`   📊 最新のアイテム: ${stats.newestItem.toLocaleString()}`);
    }
    console.log(`   📊 24時間以内に期限切れになるアイテム: ${stats.expiringItems}`);
  } catch (error) {
    console.error('❌ IndexedDB確認エラー:', error);
  }
}

/**
 * ストレージのサイズを計算
 */
function calculateStorageSize(storage: Storage): number {
  let size = 0;
  for (let i = 0; i < storage.length; i++) {
    const key = storage.key(i);
    if (key) {
      const value = storage.getItem(key);
      if (value) {
        size += key.length + value.length;
      }
    }
  }
  return size * 2; // UTF-16エンコードの文字は2バイト
}

/**
 * バイト数を読みやすい形式にフォーマット
 */
function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * ストレージの値を表示用にフォーマット
 */
function formatStorageValue(value: string | null): string {
  if (!value) return '[null]';
  
  // JSONの場合は省略表示
  if (value.startsWith('{') || value.startsWith('[')) {
    try {
      const parsed = JSON.parse(value);
      return JSON.stringify(parsed).substring(0, 50) + (JSON.stringify(parsed).length > 50 ? '...' : '');
    } catch {
      // JSONではない場合はそのまま
    }
  }
  
  // 長いテキストの場合は省略
  if (value.length > 50) {
    return value.substring(0, 47) + '...';
  }
  
  return value;
}

/**
 * アテンダープロフィール完成度チェックのテスト
 */
function testProfileCompletionScore(): void {
  // モックプロフィールを作成
  const mockProfile = {
    id: 'att_test_123',
    name: 'テスト アテンダー',
    bio: 'これはテスト用のバイオグラフィーです。',
    location: '東京都渋谷区',
    specialties: ['ローカルフード', '裏路地探索', '伝統工芸'],
    profilePhoto: 'https://example.com/photo.jpg',
    experienceSamples: [
      {
        id: 'exp_1',
        title: '渋谷裏路地フードツアー',
        description: '渋谷の知る人ぞ知る名店を巡ります。',
        category: 'フード',
        estimatedDuration: 180,
        price: 5000,
        images: ['https://example.com/exp1.jpg']
      }
    ],
    languages: [
      { language: '日本語', proficiency: 'native' },
      { language: '英語', proficiency: 'intermediate' }
    ],
    isLocalResident: true,
    isMigrant: false,
    expertise: [
      {
        category: '料理',
        subcategories: ['伝統和食', 'ストリートフード'],
        yearsOfExperience: 5,
        description: '地元の食材を使った料理を得意としています。'
      }
    ],
    availableTimes: [
      {
        dayOfWeek: 1,
        startTime: '10:00',
        endTime: '18:00',
        isAvailable: true
      },
      {
        dayOfWeek: 2,
        startTime: '10:00',
        endTime: '18:00',
        isAvailable: true
      }
    ],
    averageRating: 4.8,
    reviewCount: 12,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  console.log('📋 テスト用アテンダープロフィール:', mockProfile);
  
  // プロフィール完成度のチェック
  // この部分は実際にはプロフィール完成度計算関数の呼び出しになります
  // 実装例: const score = calculateProfileCompletionScore(mockProfile);
  const mockScore = {
    total: 85,
    sections: {
      basicInfo: 100,
      specialties: 80,
      experiences: 90,
      languages: 100,
      expertise: 70,
      availability: 60
    },
    recommendations: [
      '利用可能時間をもっと追加すると、マッチング率が上がります。',
      '専門分野の説明をより詳細にしましょう。'
    ]
  };
  
  console.log('📊 プロフィール完成度スコア:', mockScore);
  console.log('💡 改善のためのおすすめ:');
  mockScore.recommendations.forEach((rec, i) => {
    console.log(`   ${i + 1}. ${rec}`);
  });
}

// グローバルな参照用のツール群を定義（開発環境のみ）
if (isDevelopment() || isDebugMode()) {
  // グローバルオブジェクトの初期化
  (window as any).echoDevTools = {
    // 診断情報
    diagnose: async () => {
      console.log('🔍 診断情報を収集中...');
      const info = await collectDiagnostics();
      console.log('📊 診断情報:', info);
      return info;
    },
    
    // API接続テスト
    testApi: testApiConnection,
    
    // ネットワーク監視
    monitorNetwork: monitorNetworkStatus,
    
    // ストレージチェック
    checkStorage,
    
    // ファイルアップロードテスト
    testUpload: testFileUpload,
    
    // アテンダープロフィールテスト
    testProfileScore: testProfileCompletionScore,
    
    // 環境管理ツール
    env: {
      getConfig: environmentManager.getEnvironmentConfig,
      setEnvironment: environmentManager.setEnvironmentType,
      setUseMock: environmentManager.setUseMockData,
      setUseCache: environmentManager.setUseCache,
      resetToDefault: environmentManager.resetToDefault
    },
    
    // キャッシュ管理ツール
    cache: {
      getStats: apiCache.getCacheStats,
      clear: async () => {
        await apiCache.invalidateCache(/./);
        console.log('🧹 APIキャッシュをクリアしました');
      },
      invalidate: apiCache.invalidateCache
    }
  };
  
  console.log('🛠️ Echo開発者ツールが利用可能です。window.echoDevTools で利用できます。');
}

export default {
  collectDiagnostics,
  testApiConnection,
  monitorNetworkStatus,
  checkStorage,
  testFileUpload,
  testProfileCompletionScore
};
