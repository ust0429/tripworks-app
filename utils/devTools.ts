/**
 * 開発者ツール
 * 
 * 開発およびデバッグ用のユーティリティ関数を提供します。
 * ブラウザコンソールからアクセス可能な関数セットです。
 */

import { isDevelopment } from '../config/env';
import apiClientComplete from './apiClientComplete';
import environmentManager from './environmentManager';
import apiCache from './apiCache';

// 開発者ツールのインターフェース
interface EchoDevTools {
  // 環境管理
  switchEnvironment: (env: 'development' | 'staging' | 'production') => void;
  getCurrentEnvironment: () => string;
  setMockMode: (useMock: boolean) => void;
  
  // APIテスト
  testApi: (endpoint: string, method?: string, data?: any) => Promise<any>;
  clearApiCache: (pattern?: string) => Promise<void>;
  showCachedResources: () => Promise<void>;
  
  // アテンダープロフィール
  testProfileScore: () => void;
  simulateProfileImprovements: () => void;
  
  // 画像アップロード
  test: {
    newUpload: (attenderId: string) => Promise<void>;
    apiConnection: () => Promise<void>;
    cache: () => Promise<void>;
    offline: () => Promise<void>;
  };
  
  // ヘルパー関数
  helpers: {
    fetchDummyImage: () => Promise<File>;
    generateTestData: (type: string) => any;
    testProfileScore: () => void;
    testApi: () => Promise<void>;
    testNewUpload: (attenderId: string) => Promise<void>;
  };
  
  // ストレージ管理
  checkStorage: () => void;
  clearStorage: () => void;
  
  // 診断
  diagnose: () => void;
  checkConnection: () => Promise<boolean>;
  
  // モードと設定
  setDevMode: (isDevMode: boolean) => void;
  setDebugMode: (isDebugMode: boolean) => void;
  setUseMock: (useMock: boolean) => void;
}

/**
 * 開発者ツールの初期化
 */
export const initDevTools = (): void => {
  if (!isDevelopment() && typeof window !== 'undefined') {
    return;
  }
  
  // 開発者ツールオブジェクト
  const echoDevTools: EchoDevTools = {
    // 環境管理
    switchEnvironment: (env) => {
      environmentManager.switchEnvironment(env);
      console.log(`環境を切り替えました: ${env}`);
    },
    
    getCurrentEnvironment: () => {
      const env = environmentManager.getCurrentEnvironment();
      console.log(`現在の環境: ${env}`);
      return env;
    },
    
    setMockMode: (useMock) => {
      environmentManager.updateSettings({ useMockData: useMock });
      console.log(`モックデータモードを ${useMock ? '有効' : '無効'} にしました`);
    },
    
    // APIテスト
    testApi: async (endpoint, method = 'GET', data = null) => {
      try {
        console.log(`APIリクエストをテスト中: ${method} ${endpoint}`);
        let response;
        
        switch (method.toUpperCase()) {
          case 'GET':
            response = await apiClientComplete.get(endpoint);
            break;
          case 'POST':
            response = await apiClientComplete.post(endpoint, data);
            break;
          case 'PUT':
            response = await apiClientComplete.put(endpoint, data);
            break;
          case 'PATCH':
            response = await apiClientComplete.patch(endpoint, data);
            break;
          case 'DELETE':
            response = await apiClientComplete.delete(endpoint);
            break;
          default:
            throw new Error(`未対応のHTTPメソッド: ${method}`);
        }
        
        console.log('APIレスポンス:', response);
        return response;
      } catch (error) {
        console.error('APIテストエラー:', error);
        throw error;
      }
    },
    
    clearApiCache: async (pattern) => {
      await apiClientComplete.clearCache(pattern);
      console.log('APIキャッシュをクリアしました' + (pattern ? ` (パターン: ${pattern})` : ''));
    },
    
    showCachedResources: async () => {
      const resources = await apiClientComplete.getCachedResources();
      console.log('キャッシュされているリソース:', resources);
    },
    
    // アテンダープロフィール
    testProfileScore: () => {
      console.log('プロフィールスコア計算機能をテストします');
      // 実際のテスト関数はヘルパーから呼び出す
      echoDevTools.helpers.testProfileScore();
    },
    
    simulateProfileImprovements: () => {
      console.log('プロフィール改善シミュレーションを開始します');
      // ここでプロフィール改善をシミュレート
      const simulateImprovements = () => {
        const mockProfile = {
          name: 'テストユーザー',
          bio: '短い自己紹介',
          specialties: ['テスト'],
          languages: [{ language: 'ja', proficiency: 'native' }],
          // 他の必要なフィールド
        };
        
        console.log('現在のプロフィール完成度: 35%');
        
        console.log('Step 1: 自己紹介を充実させています...');
        setTimeout(() => {
          mockProfile.bio = 'より詳細な自己紹介文をここに入力します。自分の経験や特技について詳しく説明することでプロフィールの魅力が高まります。';
          console.log('自己紹介を更新しました。プロフィール完成度: 45%');
          
          console.log('Step 2: 専門分野を追加しています...');
          setTimeout(() => {
            mockProfile.specialties = ['テスト', 'デバッグ', '品質保証', '自動化テスト'];
            console.log('専門分野を追加しました。プロフィール完成度: 60%');
            
            console.log('Step 3: 言語スキルを追加しています...');
            setTimeout(() => {
              mockProfile.languages = [
                { language: 'ja', proficiency: 'native' },
                { language: 'en', proficiency: 'intermediate' }
              ];
              console.log('言語スキルを追加しました。プロフィール完成度: 75%');
              
              console.log('Step 4: 最終仕上げをしています...');
              setTimeout(() => {
                console.log('プロフィールの改善が完了しました。完成度: 100%');
                console.log('最終的なプロフィール:', mockProfile);
              }, 1000);
            }, 1000);
          }, 1000);
        }, 1000);
      };
      
      simulateImprovements();
    },
    
    // 画像アップロード
    test: {
      newUpload: async (attenderId) => {
        try {
          console.log(`アテンダー[${attenderId}]の画像アップロードをテストします`);
          await echoDevTools.helpers.testNewUpload(attenderId);
        } catch (error) {
          console.error('画像アップロードテストエラー:', error);
        }
      },
      
      apiConnection: async () => {
        try {
          console.log('API接続テストを実行しています...');
          const startTime = Date.now();
          
          // 基本的なAPI接続テスト
          const isConnected = await echoDevTools.checkConnection();
          
          if (isConnected) {
            const endTime = Date.now();
            console.log(`API接続テスト成功 (${endTime - startTime}ms)`);
          } else {
            console.error('API接続テスト失敗');
          }
        } catch (error) {
          console.error('API接続テストエラー:', error);
        }
      },
      
      cache: async () => {
        try {
          console.log('キャッシュ機能テストを実行しています...');
          
          // キャッシュをクリア
          await echoDevTools.clearApiCache();
          
          // テスト用エンドポイント
          const testEndpoint = `${environmentManager.getApiBaseUrl()}/api/test/cache`;
          
          console.log('1回目のリクエスト（キャッシュなし）...');
          const response1 = await apiClientComplete.get(testEndpoint);
          
          console.log('2回目のリクエスト（キャッシュから）...');
          const response2 = await apiClientComplete.get(testEndpoint);
          
          // キャッシュからのレスポンスかどうかを確認
          const fromCache = response2.headers.get('x-from-cache') === 'true';
          
          console.log(`キャッシュ機能テスト: ${fromCache ? '成功' : '失敗'}`);
        } catch (error) {
          console.error('キャッシュ機能テストエラー:', error);
        }
      },
      
      offline: async () => {
        try {
          console.log('オフラインモードテストを実行しています...');
          
          // オンライン状態を確認
          const isOnline = navigator.onLine;
          console.log(`現在のネットワーク状態: ${isOnline ? 'オンライン' : 'オフライン'}`);
          
          if (isOnline) {
            console.log('ネットワークをオフラインにして再度テストしてください。');
            console.log('Chrome開発者ツールのNetworkタブで"Offline"を有効にできます。');
          } else {
            // オフライン時のPOSTリクエストをテスト
            const testEndpoint = `${environmentManager.getApiBaseUrl()}/api/test/offline`;
            
            console.log('オフライン状態でPOSTリクエストを送信...');
            const response = await apiClientComplete.post(testEndpoint, { test: true });
            
            console.log('オフラインモードレスポンス:', response);
            
            if (!response.success && response.error?.code === 'OFFLINE') {
              console.log('オフラインモードテスト成功: リクエストがキューに追加されました');
            } else {
              console.log('オフラインモードテスト失敗: 予期しないレスポンス');
            }
          }
        } catch (error) {
          console.error('オフラインモードテストエラー:', error);
        }
      }
    },
    
    // ヘルパー関数
    helpers: {
      fetchDummyImage: async (): Promise<File> => {
        // ダミー画像のデータURIを作成
        const size = 300;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        
        if (ctx) {
          // 背景
          ctx.fillStyle = '#f0f0f0';
          ctx.fillRect(0, 0, size, size);
          
          // テキスト
          ctx.fillStyle = '#333333';
          ctx.font = 'bold 24px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('Test Image', size / 2, size / 2);
          
          // 現在の日時
          const now = new Date().toLocaleString();
          ctx.font = '14px Arial';
          ctx.fillText(now, size / 2, size / 2 + 30);
        }
        
        // Canvas から Blob を作成
        return new Promise<File>((resolve, reject) => {
          canvas.toBlob((blob) => {
            if (blob) {
              const file = new File([blob], 'test-image.png', { type: 'image/png' });
              resolve(file);
            } else {
              reject(new Error('画像の作成に失敗しました'));
            }
          }, 'image/png');
        });
      },
      
      generateTestData: (type: string) => {
        // テストデータを生成
        switch (type) {
          case 'attender':
            return {
              name: 'テストアテンダー',
              bio: 'これはテスト用のアテンダープロフィールです。',
              location: {
                country: 'JP',
                region: 'Tokyo',
                city: 'Shibuya'
              },
              specialties: ['観光', 'グルメ', '歴史'],
              languages: [
                { language: 'ja', proficiency: 'native' },
                { language: 'en', proficiency: 'intermediate' }
              ]
            };
          case 'experience':
            return {
              title: 'テスト体験',
              description: 'これはテスト用の体験プランです。',
              category: 'アクティビティ',
              subcategory: 'アウトドア',
              duration: 120,
              price: 5000
            };
          case 'booking':
            return {
              experienceId: 'exp_test123',
              date: new Date().toISOString().split('T')[0],
              time: '13:00',
              participants: 2,
              specialRequests: 'テスト予約です'
            };
          default:
            return { message: 'テストデータ' };
        }
      },
      
      testProfileScore: () => {
        // プロフィールスコアのテスト
        const mockProfile = {
          name: 'テストユーザー',
          bio: 'これはテスト用のプロフィールです。',
          specialties: ['テスト1', 'テスト2'],
          languages: [{ language: 'ja', proficiency: 'native' }],
          // 他の必要なフィールド
        };
        
        // 各フィールドの評価
        const evaluations = {
          name: { score: 100, maxScore: 100, message: '名前が設定されています' },
          bio: { score: 50, maxScore: 100, message: '自己紹介はもう少し詳しく書くとよいでしょう' },
          specialties: { score: 70, maxScore: 100, message: '専門分野を追加するとよいでしょう' },
          languages: { score: 80, maxScore: 100, message: '外国語のスキルを追加するとよいでしょう' },
          // 他のフィールドの評価
        };
        
        // 総合スコア
        const totalScore = Object.values(evaluations).reduce((acc, val) => acc + val.score, 0);
        const maxScore = Object.values(evaluations).reduce((acc, val) => acc + val.maxScore, 0);
        const percentageScore = Math.round((totalScore / maxScore) * 100);
        
        console.log(`プロフィール完成度: ${percentageScore}%`);
        console.log('各フィールドの評価:');
        Object.entries(evaluations).forEach(([field, evaluation]) => {
          console.log(`- ${field}: ${evaluation.score}/${evaluation.maxScore} - ${evaluation.message}`);
        });
        
        console.log('改善提案:');
        Object.entries(evaluations)
          .filter(([_, evaluation]) => evaluation.score < evaluation.maxScore)
          .forEach(([field, evaluation]) => {
            console.log(`- ${field}: ${evaluation.message}`);
          });
      },
      
      testApi: async () => {
        try {
          console.log('基本的なAPIテストを実行しています...');
          
          // 認証テスト
          console.log('1. 認証トークンテスト...');
          const token = await apiClientComplete.getAuthToken();
          console.log(`認証トークン: ${token ? '取得成功' : '未ログイン'}`);
          
          // GETリクエストテスト
          console.log('2. GETリクエストテスト...');
          const getEndpoint = `${environmentManager.getApiBaseUrl()}/api/test`;
          const getResponse = await apiClientComplete.get(getEndpoint);
          console.log('GETレスポンス:', getResponse);
          
          // POSTリクエストテスト
          console.log('3. POSTリクエストテスト...');
          const postEndpoint = `${environmentManager.getApiBaseUrl()}/api/test`;
          const postData = { test: true, timestamp: Date.now() };
          const postResponse = await apiClientComplete.post(postEndpoint, postData);
          console.log('POSTレスポンス:', postResponse);
          
          console.log('APIテスト完了!');
        } catch (error) {
          console.error('APIテストエラー:', error);
        }
      },
      
      testNewUpload: async (attenderId) => {
        try {
          console.log(`アテンダー[${attenderId}]の画像アップロードテストを実行...`);
          
          // テスト画像を生成
          const testImage = await echoDevTools.helpers.fetchDummyImage();
          console.log('テスト画像を生成しました:', testImage);
          
          // 進捗を表示するコールバック
          const progressCallback = (progress) => {
            console.log(`アップロード進捗: ${progress}%`);
          };
          
          // アップロードエンドポイント
          const uploadEndpoint = `${environmentManager.getApiBaseUrl()}/api/attenders/${attenderId}/profile-photo`;
          
          console.log('画像をアップロード中...');
          const response = await apiClientComplete.uploadFile(
            uploadEndpoint,
            testImage,
            'profilePhoto',
            { attenderId },
            {},
            progressCallback
          );
          
          if (response.success) {
            console.log('画像アップロード成功:', response.data);
          } else {
            console.error('画像アップロード失敗:', response.error);
          }
        } catch (error) {
          console.error('画像アップロードテストエラー:', error);
        }
      }
    },
    
    // ストレージ管理
    checkStorage: () => {
      try {
        // ローカルストレージのキーと値を表示
        console.log('ローカルストレージの内容:');
        const storage = { ...localStorage };
        console.table(storage);
        
        // 使用量を計算
        let totalSize = 0;
        for (const key in storage) {
          if (Object.prototype.hasOwnProperty.call(storage, key)) {
            totalSize += (key.length + String(storage[key]).length) * 2; // UTF-16 エンコーディングで2バイト/文字
          }
        }
        
        console.log(`ストレージ使用量: ${(totalSize / 1024).toFixed(2)} KB`);
        console.log(`残り容量: ${(5120 - totalSize / 1024).toFixed(2)} KB (最大約5MB)`);
      } catch (error) {
        console.error('ストレージチェックエラー:', error);
      }
    },
    
    clearStorage: () => {
      // 確認
      if (confirm('ローカルストレージのすべてのデータを削除します。よろしいですか？')) {
        localStorage.clear();
        console.log('ローカルストレージをクリアしました');
      }
    },
    
    // 診断
    diagnose: () => {
      console.group('Echo アプリ診断');
      
      // 環境情報
      console.log('環境情報:');
      console.log(`- 環境: ${environmentManager.getCurrentEnvironment()}`);
      console.log(`- モックデータ: ${environmentManager.useMockData() ? '有効' : '無効'}`);
      console.log(`- API URL: ${environmentManager.getApiBaseUrl()}`);
      console.log(`- オフラインサポート: ${environmentManager.enableOfflineSupport() ? '有効' : '無効'}`);
      
      // ブラウザ情報
      console.log('ブラウザ情報:');
      console.log(`- ユーザーエージェント: ${navigator.userAgent}`);
      console.log(`- オンライン状態: ${navigator.onLine ? 'オンライン' : 'オフライン'}`);
      console.log(`- 言語: ${navigator.language}`);
      
      // ローカルストレージの使用状況
      try {
        let totalSize = 0;
        for (const key in localStorage) {
          if (Object.prototype.hasOwnProperty.call(localStorage, key)) {
            totalSize += (key.length + localStorage[key].length) * 2;
          }
        }
        console.log(`- ローカルストレージ使用量: ${(totalSize / 1024).toFixed(2)} KB`);
      } catch (error) {
        console.log('- ローカルストレージアクセスエラー');
      }
      
      // Firebaseの認証状態
      const auth = getAuth();
      console.log('認証状態:');
      console.log(`- ログイン状態: ${auth.currentUser ? 'ログイン中' : '未ログイン'}`);
      if (auth.currentUser) {
        console.log(`- ユーザーID: ${auth.currentUser.uid}`);
        console.log(`- メールアドレス: ${auth.currentUser.email}`);
      }
      
      console.groupEnd();
    },
    
    checkConnection: async () => {
      try {
        // 単純な接続テスト
        const testEndpoint = `${environmentManager.getApiBaseUrl()}/api/ping`;
        const response = await fetch(testEndpoint, { 
          method: 'GET',
          cache: 'no-cache',
          headers: { 'Cache-Control': 'no-cache' }
        });
        
        return response.ok;
      } catch (error) {
        console.error('接続テストエラー:', error);
        return false;
      }
    },
    
    // モードと設定
    setDevMode: (isDevMode) => {
      // 開発モードの設定（実際の実装はプロジェクトにより異なる）
      console.log(`開発モードを ${isDevMode ? '有効' : '無効'} にしました`);
    },
    
    setDebugMode: (isDebugMode) => {
      // デバッグモードの設定
      const settings = environmentManager.getCurrentSettings();
      environmentManager.updateSettings({
        ...settings,
        enableLogging: isDebugMode
      });
      console.log(`デバッグモードを ${isDebugMode ? '有効' : '無効'} にしました`);
    },
    
    setUseMock: (useMock) => {
      // モックデータモードの設定
      environmentManager.updateSettings({
        useMockData: useMock
      });
      console.log(`モックデータモードを ${useMock ? '有効' : '無効'} にしました`);
    }
  };
  
  // グローバルオブジェクトに追加
  if (typeof window !== 'undefined') {
    (window as any).echoDevTools = echoDevTools;
    
    // サポート関数
    const repairAttender = () => {
      // 破損したアテンダーデータの修復（実装例）
      console.log('アテンダーデータの修復を試みています...');
      
      try {
        const attenderProfileKey = 'attenderProfile';
        const storedProfile = localStorage.getItem(attenderProfileKey);
        
        if (storedProfile) {
          try {
            const profile = JSON.parse(storedProfile);
            
            // 必須フィールドの確認と修復
            if (!profile.id) profile.id = 'att_' + Date.now();
            if (!profile.name) profile.name = 'Unknown Attender';
            if (!profile.languages) profile.languages = [];
            if (!profile.specialties) profile.specialties = [];
            
            // 修復したデータを保存
            localStorage.setItem(attenderProfileKey, JSON.stringify(profile));
            
            console.log('アテンダーデータを修復しました:', profile);
          } catch (e) {
            console.error('JSONパースエラー:', e);
            // 破損したデータを削除
            localStorage.removeItem(attenderProfileKey);
            console.log('破損したデータを削除しました');
          }
        } else {
          console.log('アテンダーデータが見つかりません');
        }
      } catch (error) {
        console.error('データ修復エラー:', error);
      }
    };
    
    (window as any).repairAttender = repairAttender;
    
    console.log('Echo Dev Tools が初期化されました。window.echoDevTools でアクセスできます。');
  }
};

// 開発環境で自動的に初期化
if (isDevelopment()) {
  initDevTools();
}

export default {
  initDevTools
};
