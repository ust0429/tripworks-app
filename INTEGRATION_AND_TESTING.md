# バックエンド統合実装 インテグレーションガイド

## 概要

このドキュメントでは、新しく実装されたバックエンド統合機能をプロジェクトに導入するための手順を説明します。既存のコードからの移行方法やテスト手順、トラブルシューティングについても記載しています。

## 導入の流れ

### 1. 新しいAPIクライアントへの切り替え

既存のAPIクライアントから新しいAPIクライアントへの切り替えは、インポート文を更新するだけで完了します。

**変更前:**
```typescript
import api from '../utils/apiClientEnhanced';
```

**変更後:**
```typescript
import api from '../utils/apiClient';
```

### 2. 環境の初期化

アプリケーションの起動時に環境を初期化するため、以下のコードを `src/index.tsx` または同等の起動ファイルに追加します。

```typescript
// src/index.tsx
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './utils/devTools'; // 開発者ツールを初期化

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);
```

### 3. サービスの更新

既存のサービスクラスを更新して、新しいAPIクライアントの機能を活用します。

**例: AttenderService.ts の更新**

```typescript
// AttenderService.ts の更新例
import api from '../utils/apiClient'; // 新しいAPIクライアントをインポート

// アテンダープロフィールをバックエンドに保存する
export async function saveProfile(profile: any): Promise<boolean> {
  try {
    console.info(`アテンダープロフィール[${profile.id}]を保存中...`);
    
    const attenderId = profile.id;
    if (!attenderId) {
      throw new Error('アテンダーIDが見つかりません');
    }
    
    // キャッシュを使わないようにオプションを設定
    const response = await api.patch(
      ENDPOINTS.ATTENDER.UPDATE_PROFILE(attenderId),
      {
        name: profile.name,
        bio: profile.bio || profile.biography,
        specialties: profile.specialties,
        languages: profile.languages,
        expertise: profile.expertise,
        profilePhoto: profile.profilePhoto || profile.imageUrl
      },
      {},
      { useCache: false } // キャッシュオプションを指定
    );
    
    if (!response.success) {
      console.error('プロフィール保存エラー:', response.error);
      return false;
    }
    
    // 関連キャッシュをクリア
    await api.clearCache(`attenders/${attenderId}`);
    
    console.info('プロフィールが正常に保存されました');
    return true;
  } catch (error) {
    console.error('プロフィール保存エラー:', error);
    return false;
  }
}
```

### 4. キャッシュ戦略の設定

頻繁に変更されないデータには長めのキャッシュ期間を、頻繁に更新されるデータには短めのキャッシュ期間を設定します。

```typescript
// 長期キャッシュ (1日)
const response = await api.get(
  ENDPOINTS.CATEGORIES.LIST,
  {},
  {},
  { useCache: true, expiry: 24 * 60 * 60 * 1000 }
);

// 短期キャッシュ (5分)
const response = await api.get(
  ENDPOINTS.BOOKINGS.LIST,
  {},
  {},
  { useCache: true, expiry: 5 * 60 * 1000 }
);

// キャッシュを使わない
const response = await api.get(
  ENDPOINTS.NOTIFICATIONS.LIST,
  {},
  {},
  { useCache: false }
);

// 強制的にキャッシュをバイパス
const response = await api.get(
  ENDPOINTS.ATTENDER.DETAIL(id),
  {},
  {},
  { bypassCache: true }
);
```

## テスト方法

### 1. 開発者ツールを使用したテスト

ブラウザのコンソールから開発者ツールを使用して、各機能をテストします。

```javascript
// APIテスト
window.echoDevTools.testApi('/api/attenders', 'GET');

// キャッシュテスト
window.echoDevTools.test.cache();

// オフラインモードテスト
window.echoDevTools.test.offline();

// 環境切り替え
window.echoDevTools.switchEnvironment('staging');
```

### 2. オフラインモードのテスト

1. Chrome開発者ツールの「Network」タブで「Offline」を有効にします
2. アプリケーション内でいくつかの操作を行います
3. 「Offline」を無効にして、保留中の操作が自動的に実行されることを確認します

### 3. キャッシュのテスト

1. 同じAPIエンドポイントに対して2回リクエストを行います
2. 2回目のリクエストがキャッシュから提供されることを確認します（ネットワークタブでリクエストが発生しないことを確認）
3. キャッシュをクリアして、再度リクエストを行います
4. リクエストがネットワークから提供されることを確認します

### 4. リトライ機能のテスト

1. ネットワーク接続を不安定にします（Chrome開発者ツールの「Network」タブで「Slow 3G」を選択）
2. APIリクエストを行い、自動的にリトライされることを確認します
3. コンソールでリトライログを確認します

## トラブルシューティング

### 1. キャッシュの問題

**症状**: 古いデータが表示される、または更新が反映されない

**解決策**:
- 関連キャッシュをクリアします: `window.echoDevTools.clearApiCache('pattern')`
- キャッシュを無効にしてリクエストを行います: `{ bypassCache: true }`
- すべてのキャッシュをクリアします: `window.echoDevTools.clearApiCache()`

### 2. 認証の問題

**症状**: 401エラーが発生する、または認証が必要なAPIにアクセスできない

**解決策**:
- 認証状態を確認します: `window.echoDevTools.diagnose()`
- ログアウトして再度ログインします
- トークンを強制的に更新します: `await apiClientComplete.getAuthToken(true)`

### 3. オフラインモードの問題

**症状**: オフラインモードでデータが表示されない、またはエラーが発生する

**解決策**:
- キャッシュをプリロードします: オフラインモードに入る前に必要なデータをリクエストします
- キャッシュ期間を延長します: `{ expiry: 7 * 24 * 60 * 60 * 1000 }` （7日間）
- オフラインサポートが有効になっていることを確認します: `window.echoDevTools.getCurrentSettings()`

### 4. 環境切り替えの問題

**症状**: 環境切り替え後もデータが変わらない、または予期しないデータが表示される

**解決策**:
- ローカルストレージをクリアします: `window.echoDevTools.clearStorage()`
- アプリケーションをリロードします
- 現在の環境を確認します: `window.echoDevTools.getCurrentEnvironment()`

## パフォーマンスチューニング

### 1. キャッシュ戦略の最適化

- 静的なデータには長いTTLを設定します（1日〜1週間）
- 頻繁に変更されるデータには短いTTLを設定します（5分〜1時間）
- ユーザー固有のデータは適切にキャッシュキーを設計します（ユーザーIDを含める）

### 2. バッチリクエストの利用

複数のリクエストがある場合は、可能な限りバッチ処理を使用します。

```typescript
// バッチリクエスト例
const [profileResponse, bookingsResponse, reviewsResponse] = await Promise.all([
  api.get(`/api/attenders/${attenderId}`),
  api.get(`/api/attenders/${attenderId}/bookings`),
  api.get(`/api/attenders/${attenderId}/reviews`)
]);
```

### 3. プリフェッチの活用

ユーザーが必要とする可能性が高いデータを事前にフェッチします。

```typescript
// プリフェッチ例
async function prefetchUserData(userId) {
  // ユーザープロフィールをプリフェッチ
  api.get(`/api/users/${userId}/profile`, {}, {}, { useCache: true, expiry: 30 * 60 * 1000 });
  
  // 最近の予約をプリフェッチ
  api.get(`/api/users/${userId}/bookings/recent`, {}, {}, { useCache: true, expiry: 15 * 60 * 1000 });
}
```

## セキュリティに関する注意点

1. **機密データのキャッシュ**: 機密データをキャッシュする場合は、TTLを短く設定し、不要になったらすぐにクリアします。
2. **トークン管理**: 認証トークンは安全に管理し、漏洩しないようにします。
3. **オフライン保存**: オフライン時に保存されるデータには機密情報を含めないようにします。

## APIクライアントの拡張

新しいAPIクライアントは拡張可能な設計になっています。独自の機能を追加する方法は以下の通りです。

### 1. 新しいメソッドの追加

```typescript
// utils/apiClientExtended.ts
import apiClientComplete from './apiClientComplete';

// GraphQLサポートを追加
async function graphql<T = any>(
  query: string,
  variables?: Record<string, any>
): Promise<any> {
  return apiClientComplete.post('/api/graphql', {
    query,
    variables
  });
}

export default {
  ...apiClientComplete,
  graphql
};
```

### 2. ミドルウェアの実装

リクエスト/レスポンスを処理するミドルウェアを実装することもできます。

```typescript
// utils/apiMiddleware.ts
import apiClientComplete from './apiClientComplete';

// リクエスト前の処理
function beforeRequest(url, method, data) {
  // リクエスト前の処理を行う
  return { url, method, data };
}

// レスポンス後の処理
function afterResponse(response) {
  // レスポンス後の処理を行う
  return response;
}

// 拡張したAPIクライアント
const apiWithMiddleware = {
  ...apiClientComplete,
  
  // GETメソッドをオーバーライド
  async get(url, params, options, cacheConfig) {
    const processed = beforeRequest(url, 'GET', params);
    const response = await apiClientComplete.get(
      processed.url,
      processed.data,
      options,
      cacheConfig
    );
    return afterResponse(response);
  },
  
  // 他のメソッドも同様にオーバーライド
};

export default apiWithMiddleware;
```

## 将来的な拡張

1. **GraphQLサポート**: GraphQL APIとの統合
2. **WebSocketサポート**: リアルタイム通信のサポート
3. **データ同期**: オフライン変更の同期と競合解決
4. **バッチ処理**: 複数リクエストの最適化

以上の手順に従って、新しいバックエンド統合機能をプロジェクトに導入してください。問題が発生した場合は、トラブルシューティングセクションを参照するか、開発チームにお問い合わせください。
