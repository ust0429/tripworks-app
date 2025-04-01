# Echo アプリ 統合テスト・導入ガイド

このドキュメントでは、新しく実装した高度なAPIクライアントとバックエンド統合機能の導入方法、テスト方法、およびトラブルシューティングについて説明します。

## 目次

1. [導入手順](#1-導入手順)
2. [機能テスト](#2-機能テスト)
3. [トラブルシューティング](#3-トラブルシューティング)
4. [よくある質問](#4-よくある質問)
5. [参考資料](#5-参考資料)

## 1. 導入手順

### 1.1 既存コードの移行

既存のAPIクライアントから新しい高度なAPIクライアントへの移行は、以下の手順で行います。

#### ステップ1: インポート文の変更

```typescript
// 変更前
import api from '../utils/apiClientEnhanced';

// 変更後
import api from '../utils/apiClient';
```

#### ステップ2: 認証関連のインポート更新（必要な場合）

```typescript
// 変更前
import { getAuthToken } from '../utils/apiClientEnhanced';

// 変更後
import { getAuthToken } from '../utils/apiClient';
```

#### ステップ3: バージョン切り替えテスト

移行をスムーズに行うために、一時的に両方のAPIクライアントを使い分ける場合：

```typescript
import enhancedApi from '../utils/apiClientEnhanced';
import newApi from '../utils/apiClient';

// 環境変数で切り替え
const api = process.env.REACT_APP_USE_NEW_API === 'true' ? newApi : enhancedApi;
```

### 1.2 必要なライブラリのインストール

新しいAPIクライアントが依存しているライブラリをインストールします：

```bash
npm install idb
```

### 1.3 環境設定の初期化

アプリケーション起動時に環境設定を初期化するには、エントリーポイントで以下のコードを実行します：

```typescript
import environmentManager from './utils/environmentManager';
import devTools from './utils/devTools';

// 環境設定の初期化
const config = environmentManager.getEnvironmentConfig();
console.log('アプリ環境設定:', config);

// 開発者ツールの初期化（開発環境のみ）
if (process.env.NODE_ENV === 'development') {
  // ネットワーク監視を開始
  devTools.monitorNetworkStatus();
}
```

## 2. 機能テスト

### 2.1 APIクライアント基本テスト

以下のテストを実行して、APIクライアントの基本機能をテストします。

#### Healthエンドポイントのテスト

```javascript
// コンソールからの実行
window.echoDevTools.testApi('/api/health');
```

#### GETリクエストのテスト

```typescript
import api from '../utils/apiClient';

async function testGet() {
  try {
    const response = await api.get('/api/test');
    console.log('レスポンス:', response);
    
    if (response.success) {
      console.log('成功:', response.data);
    } else {
      console.error('エラー:', response.error);
    }
  } catch (error) {
    console.error('例外:', error);
  }
}

testGet();
```

#### POSTリクエストのテスト

```typescript
import api from '../utils/apiClient';

async function testPost() {
  try {
    const data = { test: 'データ', value: 123 };
    const response = await api.post('/api/test', data);
    console.log('レスポンス:', response);
  } catch (error) {
    console.error('例外:', error);
  }
}

testPost();
```

### 2.2 認証機能のテスト

Firebase認証機能を使用したAPIリクエストのテスト：

```typescript
import api from '../utils/apiClient';

async function testAuthenticatedRequest() {
  try {
    // 認証が必要なエンドポイントへのリクエスト
    const response = await api.get('/api/protected-resource', { requireAuth: true });
    
    if (response.success) {
      console.log('認証成功:', response.data);
    } else {
      if (response.status === 401) {
        console.error('認証エラー: ログインしてください');
      } else {
        console.error('その他のエラー:', response.error);
      }
    }
  } catch (error) {
    console.error('例外:', error);
  }
}

testAuthenticatedRequest();
```

### 2.3 キャッシュ機能のテスト

キャッシュ機能を確認するためのテスト：

```typescript
import api from '../utils/apiClient';

async function testCaching() {
  try {
    console.log('1回目のリクエスト（キャッシュなし）:');
    const response1 = await api.get('/api/test', { cache: true });
    console.log(response1);
    
    console.log('2回目のリクエスト（キャッシュから）:');
    const response2 = await api.get('/api/test', { cache: true });
    console.log(response2);
    
    console.log('3回目のリクエスト（強制的に再取得）:');
    const response3 = await api.get('/api/test', { cache: false });
    console.log(response3);
    
    // キャッシュ統計を確認
    const stats = await window.echoDevTools.cache.getStats();
    console.log('キャッシュ統計:', stats);
  } catch (error) {
    console.error('例外:', error);
  }
}

testCaching();
```

### 2.4 オフライン機能のテスト

オフライン状態のシミュレーションとキュー機能のテスト：

```typescript
import api from '../utils/apiClient';

async function testOfflineQueue() {
  // ネットワーク接続をオフラインに設定
  // 注意: 実際のネットワーク接続はオフにできないため、開発者ツールでオフライン状態をシミュレート
  console.log('オフライン状態でのリクエストのテスト:');
  
  try {
    // オフライン状態でPOSTリクエスト
    const response = await api.post('/api/test', { offlineTest: 'データ' });
    console.log('レスポンス:', response);
    
    // オフラインキューの確認
    // 注: これは開発者ツールからの方法です
    window.echoDevTools.checkStorage();
    
    console.log('これでネットワーク接続をオンラインに戻してください。');
    console.log('そうすると、キューに入れられたリクエストが自動的に送信されます。');
  } catch (error) {
    console.error('例外:', error);
  }
}

testOfflineQueue();
```

### 2.5 ファイルアップロードのテスト

ファイルアップロード機能のテスト：

```typescript
import api from '../utils/apiClient';

function testFileUpload(fileInput: HTMLInputElement) {
  const file = fileInput.files?.[0];
  if (!file) {
    console.error('ファイルが選択されていません');
    return;
  }
  
  const progressBar = document.getElementById('progress-bar') as HTMLProgressElement;
  
  api.uploadFile(
    '/api/upload',
    file,
    'file',
    { description: 'テストアップロード' },
    { timeout: 60000 },
    (progress) => {
      console.log(`アップロード進捗: ${progress}%`);
      if (progressBar) {
        progressBar.value = progress;
      }
    }
  ).then(response => {
    console.log('アップロード結果:', response);
  }).catch(error => {
    console.error('アップロードエラー:', error);
  });
}

// HTML内で以下のように使用:
// <input type="file" id="file-input">
// <progress id="progress-bar" value="0" max="100"></progress>
// <button onclick="testFileUpload(document.getElementById('file-input'))">アップロード</button>
```

### 2.6 モックデータのテスト

モックデータの登録と使用のテスト：

```typescript
import api, { registerMock } from '../utils/apiClient';
import environmentManager from '../utils/environmentManager';

// モックデータの登録
registerMock(/\/api\/users/, () => {
  return [
    { id: 1, name: 'テストユーザー1', email: 'test1@example.com' },
    { id: 2, name: 'テストユーザー2', email: 'test2@example.com' },
    { id: 3, name: 'テストユーザー3', email: 'test3@example.com' }
  ];
});

// パラメータに応じた動的なモックデータ
registerMock(/\/api\/users\/(\d+)/, (url) => {
  const id = parseInt(url.match(/\/api\/users\/(\d+)/)?.[1] || '0');
  return {
    id,
    name: `テストユーザー${id}`,
    email: `test${id}@example.com`,
    detail: '詳細情報'
  };
});

async function testMockData() {
  // モックデータを有効化
  environmentManager.setUseMockData(true);
  
  try {
    // ユーザー一覧の取得（モックデータから）
    const usersResponse = await api.get('/api/users');
    console.log('ユーザー一覧（モック）:', usersResponse.data);
    
    // 特定ユーザーの取得（モックデータから）
    const userResponse = await api.get('/api/users/5');
    console.log('ユーザー詳細（モック）:', userResponse.data);
    
    // モックデータを無効化して実際のAPIを使用
    environmentManager.setUseMockData(false);
    
    // 実際のAPIからデータ取得
    console.log('実際のAPIからデータ取得を試みます...');
    const realResponse = await api.get('/api/users');
    console.log('実際のレスポンス:', realResponse);
  } catch (error) {
    console.error('例外:', error);
  }
}

testMockData();
```

## 3. トラブルシューティング

### 3.1 一般的な問題と解決策

#### 認証エラー

**問題:** APIリクエストが401エラーで失敗する

**解決策:**
1. ユーザーがログインしているか確認
2. 認証トークンが期限切れでないか確認
3. コンソールから以下を実行してトークンをクリア
```javascript
window.echoDevTools.env.setAuthEnabled(true);
localStorage.removeItem('echo_auth_token');
```

#### キャッシュの問題

**問題:** 古いデータが表示される、または更新されない

**解決策:**
1. キャッシュをクリア
```javascript
window.echoDevTools.cache.clear();
```

2. 特定のURLパターンのキャッシュを無効化
```javascript
window.echoDevTools.cache.invalidate(/\/api\/affected-endpoint/);
```

#### ネットワークエラー

**問題:** APIリクエストがネットワークエラーで失敗する

**解決策:**
1. ネットワーク接続を確認
2. API接続テストを実行
```javascript
window.echoDevTools.testApi('/api/health');
```

3. 環境設定を確認
```javascript
console.log(window.echoEnv.getConfig());
```

#### オフラインキューの問題

**問題:** オフラインで作成されたリクエストがオンライン復帰後に実行されない

**解決策:**
1. ストレージを確認
```javascript
window.echoDevTools.checkStorage();
```

2. 手動でキュー処理を実行
```javascript
// 内部関数を使用してオフラインキューを処理
window.echoDevTools.processQueue();
```

### 3.2 エラーコードと説明

| エラーコード | 説明 | 解決策 |
|------------|------|-------|
| `AUTH_REQUIRED` | 認証が必要なリソースにアクセスしようとした | ユーザーをログインさせる |
| `TIMEOUT` | リクエストがタイムアウトした | タイムアウト設定を増やすか、ネットワーク接続を確認 |
| `NETWORK_ERROR` | ネットワーク接続エラー | ネットワーク接続を確認 |
| `UPLOAD_ERROR` | ファイルアップロード中のエラー | ファイルサイズ・形式を確認 |
| `MOCK_ERROR` | モックデータ生成中のエラー | モックデータジェネレータを確認 |

### 3.3 環境別問題解決

#### 開発環境

- **API接続エラー**
  - ローカルAPIサーバーが起動しているか確認
  - CORSが正しく設定されているか確認
  - Firefoxの開発者ツールでネットワークリクエストを調査

- **キャッシュの挙動確認**
  - Chrome DevToolsのApplicationタブでIndexedDBを確認
  - 開発者ツールからキャッシュをクリア

#### ステージング環境

- **認証エラー**
  - ステージング環境のFirebase設定を確認
  - Auth Tokenに問題がないか確認

- **タイムアウト**
  - ステージング環境のネットワーク遅延を確認
  - タイムアウト設定を調整

#### 本番環境

- **エラーログの収集**
  - Sentryなどのログ収集ツールでエラーを追跡
  - ユーザービヘイビアを分析

- **パフォーマンス改善**
  - キャッシュ戦略を調整
  - CDNとの連携を確認

## 4. よくある質問

### 4.1 基本的な質問

**Q: 新しいAPIクライアントと古いAPIクライアントの互換性はありますか？**

A: はい、インターフェースは互換性があります。ほとんどの場合、インポート文の変更だけで移行できます。

**Q: モックデータはどのように管理すればいいですか？**

A: `registerMock`関数を使って特定のURLパターンに対するモックデータを登録できます。大規模なモックデータは別ファイルに分離することをお勧めします。

**Q: キャッシュを無効にするにはどうすればいいですか？**

A: 個別のリクエストで`cache: false`を指定するか、グローバルに`window.echoEnv.setUseCache(false)`を実行します。

### 4.2 高度な質問

**Q: リトライのバックオフアルゴリズムをカスタマイズできますか？**

A: 現在は直接的なカスタマイズ方法はありませんが、環境設定で基本遅延と最大遅延を調整できます。必要に応じてソースコードを修正してください。

**Q: 大きなファイルのアップロードでタイムアウトしますが、どうすればいいですか？**

A: アップロードタイムアウトを増やしてください：
```typescript
api.uploadFile(url, file, 'file', {}, { timeout: 300000 /* 5分 */ });
```

**Q: オフラインキューの優先順位を変更できますか？**

A: 現在のバージョンでは、キューは時間順（FIFO）に処理されます。優先順位付けが必要な場合は、ソースコードの`processOfflineQueue`関数を修正してください。

## 5. 参考資料

### 5.1 内部ドキュメント

- [Echo アプリ バックエンド統合完了レポート](./BACKEND_INTEGRATION_COMPLETE.md)
- [Firebase認証の使い方](./docs/firebase-auth.md)
- [APIエンドポイント仕様](./docs/api-endpoints.md)

### 5.2 外部リソース

- [IndexedDB API (MDN)](https://developer.mozilla.org/ja/docs/Web/API/IndexedDB_API)
- [Firebase Authentication](https://firebase.google.com/docs/auth)
- [Fetch API (MDN)](https://developer.mozilla.org/ja/docs/Web/API/Fetch_API)

---

**作成日: 2025年4月1日**
