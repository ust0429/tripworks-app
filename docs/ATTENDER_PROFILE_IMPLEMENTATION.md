# アテンダープロフィール実装詳細

## 概要

echo アプリのアテンダープロフィール機能は、アテンダーが自分のプロフィール情報を管理し、体験サンプルや利用可能時間を設定するための機能です。この文書では、実装の詳細とアーキテクチャについて説明します。

## アーキテクチャ

アテンダープロフィール機能は以下のアーキテクチャに基づいて実装されています：

1. **型定義**: TypeScript の型システムを活用し、データ構造を明示的に定義
2. **コンテキスト**: React Context API を利用した状態管理
3. **コンポーネント**: 機能ごとに分割された再利用可能なコンポーネント
4. **サービス**: データ操作と API 通信を担当するサービスレイヤー

## 主要コンポーネントとファイル構造

```
src/
├── components/
│   ├── ui/
│   │   ├── badge.tsx         # 汎用バッジコンポーネント
│   │   └── skeleton.tsx      # スケルトンローディングコンポーネント
│   └── attender/
│       └── profile/
│           ├── AttenderProfile.tsx       # メインのプロフィールコンポーネント
│           ├── AttenderProfileEdit.tsx   # プロフィール編集フォーム
│           ├── AvailabilityCalendar.tsx  # 利用可能時間設定
│           ├── ExperienceSamples.tsx     # 体験サンプル管理
│           ├── ProfileHeader.tsx         # プロフィールヘッダー
│           └── index.ts                  # エクスポート定義
├── contexts/
│   └── AttenderProfileContext.tsx        # プロフィール状態管理
├── pages/
│   └── attender/
│       └── profile/
│           └── index.tsx                 # プロフィールページ
├── services/
│   └── AttenderProfileService.ts         # プロフィールデータ操作
├── types/
│   └── attender/
│       └── profile/
│           └── index.ts                  # 型定義
└── utils/
    └── cn.ts                             # クラス名結合ユーティリティ
```

## 型定義

`src/types/attender/profile/index.ts` では、プロフィール関連の型を定義しています：

```typescript
// 基本的なプロフィール情報
export interface AttenderProfileBasic { ... }

// 体験サンプル
export interface ExperienceSample { ... }

// 利用可能時間
export interface AvailabilityTimeSlot { ... }
export interface DailyAvailability { ... }

// 完全なプロフィール
export interface AttenderProfile extends AttenderProfileBasic { ... }
```

## 状態管理

`AttenderProfileContext.tsx` では React Context API を使用して状態管理を行います：

```typescript
// コンテキスト状態
export interface ProfileContextState { ... }

// リデューサーアクション
type ProfileAction = ... 

// コンテキスト値
interface ProfileContextValue extends ProfileContextState { ... }
```

リデューサーパターンを採用し、状態更新のロジックを明示的に分離しています。

## データフロー

1. `AttenderProfilePage` がレンダリングされると、認証チェックが行われる
2. 認証済みの場合、`AttenderProfileProvider` がコンテキストを提供
3. `AttenderProfile` コンポーネントが `AttenderProfileService` を通じてデータを取得
4. ユーザーによる編集操作は各コンポーネントからコンテキストアクションを通じて処理
5. 最終的な更新は `AttenderProfileService` を通じてサーバーに保存（開発環境ではローカルストレージ）

## 機能詳細

### プロフィール表示・編集

- 基本情報（名前、メールアドレス、画像URL、居住地など）の表示と編集
- 表示モードと編集モードの切り替え
- フォームバリデーション

### 体験サンプル管理

- サンプルの追加、編集、削除
- 画像URL、所要時間、料金、カテゴリーなどの設定
- レスポンシブなカードレイアウト

### 利用可能時間設定

- 曜日ごとの利用可能状態の切り替え
- 複数の時間枠の追加・編集・削除
- 視覚的なカレンダーインターフェース

### プロフィール完成度

- 各項目の入力状況に基づく完成度スコア計算
- 視覚的なバッジによるフィードバック

## API 連携

現在の実装ではローカルストレージを使用していますが、本番環境では以下のようなAPIエンドポイントと連携します：

```
GET /api/attender/:id/profile        # プロフィール取得
PUT /api/attender/:id/profile        # プロフィール更新
POST /api/attender/:id/samples       # 体験サンプル追加
PUT /api/attender/:id/samples/:sampleId  # 体験サンプル更新
DELETE /api/attender/:id/samples/:sampleId  # 体験サンプル削除
```

## パフォーマンス最適化

- コンポーネントの適切な分割による再レンダリングの制限
- 非同期データ取得と状態更新の最適化
- 効率的なフォーム状態管理

## 今後の拡張性

コードベースは以下の拡張を容易に行えるように設計されています：

1. リアルタイム更新
2. 画像アップロード機能
3. 多言語対応
4. 追加のプロフィール項目
5. プロフィール公開設定

## 型安全性の確保

TypeScript の型システムを活用し、以下の点に注意して型安全性を確保しています：

1. 明示的なインターフェース定義
2. オブジェクトアクセスの型安全化
3. アクション型の明確な定義
4. 条件付きレンダリングでの型チェック

## まとめ

アテンダープロフィール機能は、型安全でメンテナンス性の高いアーキテクチャに基づいて実装されています。コンポーネントの分割とコンテキストベースの状態管理により、拡張性とテストのしやすさを確保しています。
