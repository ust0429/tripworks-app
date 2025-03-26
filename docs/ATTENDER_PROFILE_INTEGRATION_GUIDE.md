# アテンダープロフィール統合ガイド

このガイドでは、アテンダープロフィール機能をechoアプリの他の部分と統合するための手順を説明します。

## 前提条件

- Node.js および npm/yarn がインストールされていること
- echo アプリのコードベースがクローンされていること
- 必要な依存関係がインストールされていること

## 必要なパッケージ

実装では以下のパッケージを使用しています：

```bash
# スタイリング関連
npm install clsx tailwind-merge

# または
yarn add clsx tailwind-merge
```

## 1. コードベースへの統合

### 1.1 ディレクトリ構造の確認

以下のディレクトリ構造が正しく設定されていることを確認してください：

```
src/
├── components/
│   ├── ui/
│   └── attender/
│       └── profile/
├── contexts/
├── pages/
│   └── attender/
│       └── profile/
├── services/
├── types/
│   └── attender/
│       └── profile/
└── utils/
```

既存のディレクトリ構造と競合がある場合は、適宜調整してください。

### 1.2 APIサービスの設定

`AttenderProfileService.ts` のコメントアウトされたAPI呼び出し部分を、実際のバックエンドAPIと連携するように修正してください：

```typescript
// 例：プロフィール取得
static async getProfile(attenderId: string): Promise<AttenderProfile> {
  try {
    // ローカルストレージの代わりに実際のAPIを呼び出す
    const response = await fetch(`/api/attender/${attenderId}/profile`);
    if (!response.ok) throw new Error('Failed to fetch profile');
    return await response.json();
  } catch (error) {
    console.error('Failed to get profile:', error);
    throw error;
  }
}
```

すべてのメソッド（`updateProfile`, `addExperienceSample`, `updateExperienceSample`, `removeExperienceSample`）について同様の変更を行ってください。

### 1.3 認証システムとの連携

`pages/attender/profile/index.tsx` の認証チェック部分を、アプリの認証システムと連携するように修正してください：

```typescript
useEffect(() => {
  // モックの代わりに実際の認証チェックを実装
  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/status');
      const data = await response.json();
      
      if (data.isAuthenticated && data.user.role === 'attender') {
        setAttenderId(data.user.id);
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('認証確認エラー:', error);
      setIsAuthenticated(false);
    }
  };
  
  checkAuth();
}, []);
```

## 2. ルーティングの設定

アプリのルーターに新しいルートを追加します：

### React Router を使用している場合

```jsx
// App.tsx または routes.tsx
import AttenderProfilePage from './pages/attender/profile';

// 他のインポート...

const AppRoutes = () => (
  <Routes>
    {/* 他のルート... */}
    <Route path="/attender/profile" element={<AttenderProfilePage />} />
  </Routes>
);
```

### Next.js を使用している場合

ファイル構造に基づいて自動的にルーティングが設定されます（`pages/attender/profile.tsx` または `app/attender/profile/page.tsx`）。

## 3. ナビゲーションの追加

アプリのナビゲーションにプロフィールページへのリンクを追加します：

```jsx
// SideNav.jsx または Header.jsx の例
<Link 
  to="/attender/profile" 
  className="flex items-center p-2 text-gray-700 hover:bg-gray-100 rounded"
>
  <UserIcon className="w-5 h-5 mr-2" />
  <span>プロフィール</span>
</Link>
```

## 4. 画像アップロード機能の追加

現在の実装では画像URLの入力のみをサポートしています。ファイルアップロード機能を追加する場合は、以下のステップに従ってください：

1. アップロードコンポーネントの作成
2. 画像ファイルの処理とアップロード処理の実装
3. `AttenderProfileEdit.tsx` の画像URL入力部分の修正

```jsx
// ImageUploader コンポーネントの例
const ImageUploader = ({ currentImage, onImageUploaded }) => {
  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // FormDataの作成
    const formData = new FormData();
    formData.append('image', file);
    
    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      onImageUploaded(data.imageUrl);
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };
  
  return (
    <div>
      {currentImage && (
        <img 
          src={currentImage} 
          alt="プロフィール画像" 
          className="w-24 h-24 rounded-full object-cover mb-2" 
        />
      )}
      <input 
        type="file" 
        accept="image/*" 
        onChange={handleUpload} 
        className="block w-full text-sm text-gray-500
          file:mr-4 file:py-2 file:px-4
          file:rounded-full file:border-0
          file:text-sm file:font-semibold
          file:bg-blue-50 file:text-blue-700
          hover:file:bg-blue-100"
      />
    </div>
  );
};
```

## 5. テストの実装

各コンポーネントのテストを作成することをお勧めします：

```
src/
└── __tests__/
    └── components/
        └── attender/
            └── profile/
                ├── AttenderProfile.test.tsx
                ├── AttenderProfileEdit.test.tsx
                ├── AvailabilityCalendar.test.tsx
                ├── ExperienceSamples.test.tsx
                └── ProfileHeader.test.tsx
```

Jest と React Testing Library を使用したテスト例：

```jsx
// AttenderProfile.test.tsx の例
import { render, screen } from '@testing-library/react';
import { AttenderProfileProvider } from '../../../contexts/AttenderProfileContext';
import AttenderProfile from '../../../components/attender/profile/AttenderProfile';

// モックサービス
jest.mock('../../../services/AttenderProfileService', () => ({
  getProfile: jest.fn().mockResolvedValue({
    id: 'test-id',
    name: 'テストユーザー',
    email: 'test@example.com',
    // ...その他の必要なフィールド
  }),
  // 他のメソッドもモック
}));

describe('AttenderProfile', () => {
  it('プロフィールを正しく表示する', async () => {
    render(
      <AttenderProfileProvider>
        <AttenderProfile attenderId="test-id" />
      </AttenderProfileProvider>
    );
    
    // ローディング状態を確認
    expect(screen.getByRole('status')).toBeInTheDocument();
    
    // データが読み込まれた後の表示を確認
    const profileName = await screen.findByText('テストユーザー');
    expect(profileName).toBeInTheDocument();
  });
  
  // 他のテストケース...
});
```

## 6. i18n（国際化）の設定

複数言語をサポートする場合は、テキストを翻訳ファイルに抽出してください：

```json
// locales/ja.json の例
{
  "attenderProfile": {
    "title": "アテンダープロフィール",
    "basicInfo": "基本情報",
    "edit": "編集",
    "save": "保存",
    "cancel": "キャンセル",
    // ...その他の翻訳キー
  }
}
```

## 7. 既存のユーザーフローとの連携

### 7.1 登録フローからの連携

新規アテンダー登録完了時にプロフィールページにリダイレクトするようにしてください：

```jsx
// AttenderRegistrationComplete.jsx の例
const handleComplete = () => {
  // 登録処理完了後
  history.push('/attender/profile');
};
```

### 7.2 ダッシュボードからの連携

アテンダーダッシュボードにプロフィール完成度を表示し、未完成の場合はプロフィール編集を促してください：

```jsx
// AttenderDashboard.jsx の例
{profileCompletionScore < 80 && (
  <div className="bg-yellow-50 p-4 rounded-lg mb-6">
    <h3 className="font-medium text-yellow-800">プロフィールを完成させましょう</h3>
    <p className="text-yellow-700 mb-2">
      プロフィール完成度: {profileCompletionScore}%
    </p>
    <Link
      to="/attender/profile"
      className="text-sm text-yellow-800 font-medium underline"
    >
      プロフィールを編集する
    </Link>
  </div>
)}
```

## 8. パフォーマンス最適化の検討

大規模なアプリケーションでは以下の最適化を検討してください：

1. React.memo を使用したコンポーネントのメモ化
2. useMemo と useCallback の適切な使用
3. バンドルサイズの最適化（コード分割）
4. 画像最適化

## 9. アクセシビリティの確保

アクセシビリティを確保するために以下の点を確認してください：

1. 適切なARIA属性の使用
2. キーボードナビゲーションのサポート
3. 色のコントラスト比の確保
4. スクリーンリーダー対応

## 10. デプロイ前の確認事項

- 本番APIエンドポイントの設定
- 環境変数の設定
- エラーハンドリングの確認
- データバリデーションの確認
- セキュリティの確認（XSS対策など）

## ヘルプとサポート

統合で問題が発生した場合は、以下のリソースを参照してください：

1. コードコメント
2. 実装詳細ドキュメント（`ATTENDER_PROFILE_IMPLEMENTATION.md`）
3. プロジェクトの issue トラッカー

---

この統合ガイドに従うことで、アテンダープロフィール機能をスムーズにアプリケーションに統合できます。質問や問題がある場合は、開発チームにお問い合わせください。
