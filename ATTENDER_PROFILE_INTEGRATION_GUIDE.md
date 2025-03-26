# アテンダープロフィール機能統合ガイド

このガイドは、新しく実装した「アテンダープロフィール機能」をechoアプリの既存のコードベースに統合するための手順を説明します。

## 1. 依存パッケージの確認

以下のパッケージが必要です。`package.json`で確認し、なければインストールしてください：

```bash
npm install clsx tailwind-merge
```

## 2. ディレクトリ構造

実装したファイルは以下のディレクトリ構造に配置されています：

```
src/
├── components/
│   ├── ui/
│   │   ├── badge.tsx
│   │   └── skeleton.tsx
│   └── attender/
│       └── profile/
│           ├── AttenderProfile.tsx
│           ├── AttenderProfileEdit.tsx
│           ├── AvailabilityCalendar.tsx
│           ├── ExperienceSamples.tsx
│           ├── ProfileHeader.tsx
│           └── index.ts
├── contexts/
│   └── AttenderProfileContext.tsx
├── pages/
│   └── attender/
│       └── profile/
│           └── index.tsx
├── services/
│   └── AttenderProfileService.ts
├── types/
│   └── attender/
│       └── profile/
│           └── index.ts
└── utils/
    └── cn.ts
```

## 3. ルーティング設定の統合

既存のルーティング設定に新しいプロフィールページを追加します。

### React Router を使用している場合

`App.tsx`または該当するルーティング設定ファイルを開き、以下のルートを追加します：

```jsx
import AttenderProfilePage from '@/pages/attender/profile';

// ルート定義に追加
<Route path="/attender/profile" element={<AttenderProfilePage />} />
```

### Next.js を使用している場合

ファイルベースのルーティングが自動的に機能します。必要であれば、以下のページコンポーネントを作成します：

#### Pages Router

```jsx
// pages/attender/profile.js
export { default } from '@/pages/attender/profile';
```

#### App Router

```jsx
// app/attender/profile/page.js
import AttenderProfilePage from '@/pages/attender/profile';

export default function Page() {
  return <AttenderProfilePage />;
}
```

## 4. 認証連携

アテンダープロフィールページは適切な認証・権限チェックが必要です。

### 認証コンテキストの統合

`src/pages/attender/profile/index.tsx`で使用している`useAuth`フックが既存の認証コンテキストを参照していることを確認します：

```typescript
// 既存の認証コンテキストとの連携部分
import { useAuth } from '@/contexts/AuthContext'; // パスを確認

const AttenderProfilePage: React.FC = () => {
  const { isAuthenticated, isAttender, loading } = useAuth();
  // ...
}
```

認証コンテキストの構造が異なる場合は、適宜調整してください。

## 5. ナビゲーションへの追加

アプリのナビゲーションメニューにプロフィールページへのリンクを追加します：

### サイドナビゲーションの場合

```jsx
// components/SideBar/index.jsx など
<NavItem
  icon={<User size={20} />}
  label="プロフィール"
  href="/attender/profile"
  active={currentPath === '/attender/profile'}
/>
```

### ヘッダーナビゲーションの場合

```jsx
// components/NavBar/index.jsx など
<li>
  <a href="/attender/profile" className="nav-link">
    <User size={16} />
    <span>プロフィール</span>
  </a>
</li>
```

## 6. スタイリングの統合

現在の実装はTailwind CSSを使用しています。以下のユーティリティ関数を確認してください：

### cn ユーティリティ関数

`src/utils/cn.ts`に`cn`関数を実装しています。これはclsxとtailwind-mergeを使って効率的にクラス名を結合するためのものです。既存のユーティリティ関数がある場合は、それを使用するように各コンポーネントを調整してください。

### カラースキームのカスタマイズ

現在の実装では基本的なカラースキームを使用しています。echoアプリの色彩に合わせて調整する場合は、各コンポーネントでの色の指定を変更してください（例：`bg-blue-600`→`bg-primary-600`など）。

## 7. APIエンドポイントの連携

`src/services/AttenderProfileService.ts`で実際のAPIエンドポイントと連携するように設定してください。

```typescript
// 開発環境チェックのコメントを解除し、実際のAPIパスを設定
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://api.echo-app.com';

// 以下のコード部分を有効化
const response = await fetch(`${API_BASE_URL}/api/attenders/${profileId || 'me'}/profile`, {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
  },
});
```

## 8. 既存の型定義との統合

`src/types/attender/profile/index.ts`で定義されているプロフィール関連の型が既存の型定義と矛盾しないように調整してください。特に注意すべきは：

- `AttenderProfileData`インターフェース
- `ExperienceSample`インターフェース
- `SocialMediaLink`インターフェース
- `Availability`インターフェース

これらが既存の定義と衝突する場合は、名前を変更するか統合してください。

## 9. 多言語対応

アプリケーションが多言語対応している場合は、翻訳キーを追加します：

```json
// locales/ja.json
{
  "attenderProfile": {
    "title": "プロフィール",
    "edit": "編集",
    "save": "保存",
    // その他の翻訳キー
  }
}
```

その後、各コンポーネントを適宜更新して翻訳関数を使用するようにします：

```jsx
// 例：
<h1>{t('attenderProfile.title')}</h1>
```

## 10. テスト統合

以下のテストケースを追加して、機能が正常に動作することを確認してください：

1. プロフィール表示ページの読み込み
2. プロフィール編集機能
3. 体験サンプルの追加・編集・削除
4. 利用可能時間の設定

```jsx
// __tests__/pages/attender/profile.test.js の例
import { render, screen } from '@testing-library/react';
import AttenderProfilePage from '@/pages/attender/profile';

describe('AttenderProfilePage', () => {
  test('renders profile page', () => {
    render(<AttenderProfilePage />);
    expect(screen.getByText(/プロフィール/i)).toBeInTheDocument();
  });
});
```

## 11. デプロイ確認事項

デプロイ前には以下を確認してください：

1. すべての依存関係がpackage.jsonに含まれているか
2. API連携が正しく設定されているか
3. 認証・権限チェックが機能しているか
4. レスポンシブデザインが機能しているか
5. エラーハンドリングが適切に実装されているか

## 12. 既存の登録フローとの連携

アテンダー登録完了後に、プロフィール画面にリダイレクトするよう設定することをおすすめします：

```javascript
// src/components/attender/application/SubmitSuccess.tsx など
const handleComplete = () => {
  // 登録処理の後
  navigate('/attender/profile'); // Reactルーター使用時
  // または
  window.location.href = '/attender/profile';
};
```

## トラブルシューティング

### コンポーネントがうまく表示されない場合

1. ブラウザの開発者ツールでエラーを確認
2. コンテキストプロバイダーが正しく設定されているか確認
3. 必要なCSSがロードされているか確認

### API連携エラー

1. APIエンドポイントが正しいか確認
2. 認証トークンが正しく送信されているか確認
3. CORS設定が適切か確認

### 認証・権限エラー

1. 認証コンテキストが正しく連携されているか確認
2. 権限チェックが適切に実装されているか確認

## まとめ

アテンダープロフィール機能をechoアプリに統合することで、アテンダーは自分のプロフィールを充実させ、ユーザーに魅力的な情報を提供できるようになります。この機能は段階的登録機能と組み合わせて、よりシームレスなユーザー体験を提供します。

質問や問題があれば、開発チームにお問い合わせください。
