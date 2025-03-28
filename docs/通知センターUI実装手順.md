# 通知センターUI実装手順

## 概要

このドキュメントでは、Echo アプリに実装した通知センターUIの統合手順について説明します。通知センターUIは、ユーザーが受け取った通知を確認し、既読管理ができる機能を提供します。

## 実装済みコンポーネント

以下のコンポーネントを実装しました：

1. **NotificationService.ts**
   - 通知の取得、既読管理などの機能を提供するサービス

2. **NotificationContext.tsx**
   - アプリ全体で通知状態を管理するContextProvider

3. **通知UIコンポーネント**
   - NotificationIcon: 未読数を表示するベルアイコン
   - NotificationDropdown: 通知一覧のドロップダウンメニュー
   - NotificationItem: 個別の通知アイテム
   - NotificationsPage: 通知一覧ページ
   - HeaderNotification: ヘッダーに統合するための便利なラッパー

## 統合手順

### 1. App.tsx への NotificationProvider の追加

`App.tsx` または `TripworksApp.tsx` のメインコンポーネントに `NotificationProvider` を追加します：

```tsx
// TripworksApp.tsx
import { NotificationProvider } from '../contexts/NotificationContext';

const TripworksApp = () => {
  return (
    <AuthProvider>
      <NotificationProvider>
        <AppContent />
      </NotificationProvider>
    </AuthProvider>
  );
};
```

### 2. ヘッダーへの通知アイコンの統合

ヘッダー部分に `HeaderNotification` コンポーネントを追加します：

```tsx
// AppContent.tsx または該当するヘッダーコンポーネント内
import { HeaderNotification } from './components/notification';

// ヘッダー部分を以下のように修正
<header className="bg-black text-white p-4 flex justify-between items-center">
  <div className="flex items-center">
    <h1 className="text-2xl" style={{ fontFamily: "sans-serif" }}>
      <span className="font-bold">e</span>
      <span className="font-light">cho</span>
      <span className="text-xs align-top ml-1" style={{ opacity: 0.7 }}>
        β
      </span>
    </h1>
  </div>
  <div className="flex items-center space-x-2">
    {/* 通知アイコンを追加 */}
    <HeaderNotification />
    
    {isAuthenticated ? (
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="p-2 rounded-full hover:bg-gray-800 flex items-center space-x-2"
      >
        <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center text-white text-sm">
          {user?.name.charAt(0)}
        </div>
        {menuOpen ? <X size={20} /> : <Menu size={20} />}
      </button>
    ) : (
      <>
        <button
          onClick={openLoginModal}
          className="py-1 px-3 border border-white rounded-full text-sm hover:bg-white hover:text-black transition duration-200"
        >
          ログイン
        </button>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="p-2 rounded-full hover:bg-gray-800"
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </>
    )}
  </div>
</header>
```

### 3. ルーティングへの通知ページの追加

通知一覧ページをルーティングに追加します。React Router を使用している場合は以下のようになります：

```tsx
// App.tsx または該当するルーティング設定
import { NotificationsPage } from './components/notification';

// ルーティング設定に追加
{activeTab === 'notifications' && <NotificationsPage />}

// またはルーターを使用している場合
<Route path="/notifications" component={NotificationsPage} />
```

サイドメニューやフッターナビゲーションにも通知ページへのリンクを追加すると良いでしょう。

### 4. モバイル対応の調整

モバイル画面でのドロップダウンの表示位置などを調整する必要がある場合は、NotificationDropdown.tsx の CSS を修正してください。

```tsx
// NotificationDropdown.tsx
<div className="absolute top-14 right-0 w-80 max-h-[70vh] bg-white rounded-lg shadow-lg overflow-hidden z-50 md:w-80 sm:w-full sm:right-0">
  {/* 内容 */}
</div>
```

## テスト

統合後は以下の点を確認してください：

1. 通知アイコンがヘッダーに正しく表示されるか
2. 未読通知数が正しく表示されるか
3. 通知アイコンをクリックするとドロップダウンが表示されるか
4. 通知をクリックすると正しいページに遷移するか
5. 「すべて既読にする」ボタンが機能するか
6. 通知一覧ページが正しく表示されるか
7. フィルタリングと検索が機能するか

## 注意点

1. Firebase Firestore のセキュリティルールを適切に設定し、ユーザーが自分の通知のみにアクセスできるようにしてください。

2. 通知数が多い場合のパフォーマンスを考慮し、リアルタイムリスナーの制限（limit）を適切に設定してください。

3. モバイルでの表示を確認し、必要に応じてレスポンシブデザインを調整してください。

## 次のステップ

1. **Firebase Cloud Messaging の統合**
   - ブラウザプッシュ通知
   - モバイルプッシュ通知

2. **通知設定ページの実装**
   - 通知タイプごとの設定
   - 通知頻度の設定

3. **より詳細な通知タイプの追加**
   - トランザクションやアクティビティに応じた通知の分類
   - 通知テンプレートの拡充
