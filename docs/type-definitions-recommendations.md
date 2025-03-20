# TypeScript型定義のベストプラクティス

## 概要

このドキュメントは、「echo」アプリにおけるTypeScript型定義のベストプラクティスをまとめたものです。型エラーを防ぎ、開発効率を向上させるために、以下のガイドラインに従ってください。

## 目次

1. [基本原則](#基本原則)
2. [型定義の構成](#型定義の構成)
3. [外部ライブラリの型定義](#外部ライブラリの型定義)
4. [コンポーネントの型定義](#コンポーネントの型定義)
5. [API関連の型定義](#api関連の型定義)
6. [よくある問題と解決策](#よくある問題と解決策)
7. [型定義のテスト](#型定義のテスト)

## 基本原則

- **明示的な型定義**: `any`型の使用を最小限に抑え、可能な限り明示的な型を定義する
- **シングルソース**: 型定義は一箇所で定義し、複数の場所で再定義しない
- **一貫性**: 命名規則や構造に一貫性を持たせる
- **最小権限の原則**: 必要最小限の型定義を心がける
- **自己文書化**: 型定義自体がコードの意図を表すよう心がける

## 型定義の構成

### プロジェクト構造

```
src/
  types/
    # ドメイン固有の型定義
    attender.ts        # アテンダー関連の型定義
    experience.ts      # 体験関連の型定義
    user.ts            # ユーザー関連の型定義
    payment.ts         # 決済関連の型定義
    
    # 外部APIや特殊な型定義（宣言ファイル）
    applepay.d.ts      # Apple Pay API宣言
    uuid.d.ts          # UUID関連宣言
    
    # 共通型定義
    common.ts          # 共通で使用する型定義
    api.ts             # API関連の共通型定義
```

### 関連する型のグループ化

関連する型は同じファイルにグループ化してください。例えば、アテンダーに関連するすべての型は `attender.ts` にまとめます。

```typescript
// src/types/attender.ts
export interface AttenderProfile { ... }
export interface AttenderApplicationData { ... }
export interface ExpertiseArea { ... }
// アテンダーに関連するその他の型
```

## 外部ライブラリの型定義

### 公式型定義パッケージの利用

可能な限り、公式または広く使われている型定義パッケージを使用してください。

```bash
# 例: UUIDの公式型定義をインストール
npm install --save-dev @types/uuid
```

### カスタム宣言ファイル

公式の型定義が存在しない、または不十分な場合は、カスタム宣言ファイル（`.d.ts`）を作成してください。

```typescript
// src/types/third-party-lib.d.ts
declare module 'third-party-lib' {
  export function someFunction(): string;
  export interface SomeInterface {
    prop1: string;
    prop2: number;
  }
}
```

## コンポーネントの型定義

### Propsの型定義

Reactコンポーネントのpropsは、明示的なインターフェースとして定義してください。

```typescript
// ✅ 良い例
interface ButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

const Button: React.FC<ButtonProps> = ({ label, onClick, disabled }) => {
  // ...
};
```

```typescript
// ❌ 避けるべき例
const Button = ({ label, onClick, disabled }: any) => {
  // ...
};
```

### イベントハンドラの型定義

イベントハンドラは、適切なReactイベント型を使用してください。

```typescript
// ✅ 良い例
const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const value = e.target.value;
  // ...
};
```

### コンテキストの型定義

Reactコンテキストを使用する場合は、値と関数の両方に型を付けてください。

```typescript
// ✅ 良い例
interface AuthContextType {
  user: User | null;
  login: (credentials: Credentials) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
```

## API関連の型定義

### リクエスト/レスポンスの型定義

APIリクエストとレスポンスには、明示的な型を定義してください。

```typescript
// ✅ 良い例
interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  token: string;
  user: UserProfile;
  expiresAt: string;
}

async function login(data: LoginRequest): Promise<LoginResponse> {
  // ...
}
```

### APIエラーの型定義

APIエラーにも適切な型を定義してください。

```typescript
interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
}
```

## よくある問題と解決策

### `undefined` や `null` の処理

オプショナルな値には、明示的に `undefined` や `null` を含めてください。

```typescript
// ✅ 良い例
interface UserProfile {
  name: string;
  bio?: string; // undefinedを許容
  avatarUrl: string | null; // nullを明示的に許容
}
```

### 型の拡張とインターセクション

既存の型を拡張する場合は、インターセクション型を使用してください。

```typescript
// ✅ 良い例
interface BaseProps {
  className?: string;
  style?: React.CSSProperties;
}

interface ButtonProps extends BaseProps {
  label: string;
  onClick: () => void;
}

// または
type ButtonProps = BaseProps & {
  label: string;
  onClick: () => void;
};
```

### 共用体型（Union Types）の活用

関連する複数の型を表現する場合は、共用体型を使用してください。

```typescript
// ✅ 良い例
type PaymentMethod = 'credit_card' | 'apple_pay' | 'google_pay';

type ApiResponse<T> = 
  | { status: 'success'; data: T }
  | { status: 'error'; error: ApiError };
```

### 型の絞り込み（Type Narrowing）

共用体型を使用する場合は、型ガードを使用して型を絞り込むことを推奨します。

```typescript
// ✅ 良い例
function handleResponse<T>(response: ApiResponse<T>): T {
  if (response.status === 'success') {
    return response.data; // Tとして扱われる
  } else {
    throw new Error(response.error.message);
  }
}
```

## 型定義のテスト

### 型検証ファイル

型定義の正確性を確認するために、型検証ファイルを作成することを推奨します。

```typescript
// src/types/validateTypes.ts
import { AttenderProfile, ExpertiseArea } from './attender';

// 型が正しく定義されていることを確認するコード
function validateTypes() {
  const profile: AttenderProfile = {
    // プロパティの設定
  };
  
  const expertise: ExpertiseArea = {
    // プロパティの設定
  };
  
  // 型の使用例
}
```

### TypeScriptコンパイラによる検証

定期的に `tsc --noEmit` を実行して、型エラーをチェックしてください。CI/CDパイプラインにこのステップを組み込むことを推奨します。

```bash
# 全プロジェクトの型チェック
npx tsc --noEmit

# 特定のファイルの型チェック
npx tsc path/to/file.ts --noEmit
```

## まとめ

このガイドラインに従うことで、「echo」アプリの型安全性を向上させ、開発効率の向上とバグの削減を実現できます。新しい型定義を追加する際や、既存のコードを修正する際には、このドキュメントを参照してください。

---

最終更新日: 2025年3月20日
