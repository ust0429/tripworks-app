# Echo アプリバックエンド統合引き継ぎプロンプト（2025年3月27日）

## 現在の実装状況

### バックエンド基盤
1. **基本構成**
   - Express.js + Firebase Admin SDK + TypeScript での実装
   - Cloud Run での実行を想定した Dockerfile とデプロイ設定
   - 主要API経路（アテンダー、予約、レビュー）の基本的なルート設定済み

2. **認証とセキュリティ**
   - Firebase Authentication との連携済み
   - CORS設定とHelmet によるセキュリティ強化
   - エラーハンドリング用ミドルウェア実装済み

3. **API エンドポイント**
   - アテンダー関連（GET/POST/PUT）
   - 予約関連（実装中）
   - レビュー関連（実装中）

### フロントエンド API クライアント
1. **基本実装**
   - `apiClient.ts` - 基本的なHTTPクライアント機能
   - `apiClientEnhanced.ts` - セキュリティ強化版（CSRF対策、XSS対策）
   - Promise ベースの非同期通信
   - エラーハンドリングとタイムアウト処理

2. **特殊機能**
   - ファイルアップロード対応（FormData処理）
   - 進捗追跡機能付きアップロード
   - レスポンスサニタイズ
   - デバッグログ

3. **AttenderService 実装**
   - アテンダー情報の取得・登録・更新基本機能実装

## 今後の開発計画

### 優先課題
1. **API 統合**
   - フロントエンドとバックエンドの実API連携
   - Firestoreから実データ取得への移行
   - Firebase AuthenticationトークンによるAPI認証

2. **データモデルの最適化**
   - フロントエンドとバックエンドでのデータ型の統一
   - バリデーションロジックの共通化

3. **デプロイメントパイプライン**
   - CI/CD設定の実装
   - ステージング環境と本番環境の分離

### 具体的な次のステップ
1. **AttenderService の完全実装**
   - 詳細検索機能
   - フィルタリングと並び替え
   - ページネーション
   - アバター画像のアップロード/取得

2. **BookingService の実装**
   - 予約作成/更新/キャンセル
   - 予約状態管理
   - 通知システム連携
   - 連動カレンダー処理

3. **ReviewService の実装**
   - レビュー投稿/編集/削除
   - 写真付きレビュー
   - レーティング集計
   - 不適切コンテンツ検出

## 技術メモ

### API エンドポイント構造
```
/api
  /attenders
    GET / - アテンダー一覧取得
    GET /:id - アテンダー詳細取得
    POST / - アテンダー登録申請
    PUT /:id - アテンダー情報更新
  /bookings
    GET / - 予約一覧取得
    GET /:id - 予約詳細取得
    POST / - 新規予約作成
    PUT /:id - 予約情報更新
    DELETE /:id - 予約キャンセル
  /reviews
    GET / - レビュー一覧取得
    GET /:id - レビュー詳細取得
    POST / - レビュー投稿
    PUT /:id - レビュー編集
    DELETE /:id - レビュー削除
```

### データモデル（主要フィールド）
```typescript
// アテンダー
interface Attender {
  id: string;
  userId: string;
  name: string;
  email: string;
  phoneNumber: string;
  location: string;
  biography: string;
  isLocalResident: boolean;
  isMigrant: boolean;
  specialties: string[];
  languages: string[];
  expertise: ExpertiseItem[];
  experienceSamples: ExperienceSample[];
  availableTimes: AvailabilitySlot[];
  identificationDocument: IdentificationDocument;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// 予約
interface Booking {
  id: string;
  userId: string;
  attenderId: string;
  experienceId?: string;
  title: string;
  description: string;
  date: string;
  time: string;
  duration: string;
  location: string;
  price: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'refunded';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// レビュー
interface Review {
  id: string;
  userId: string;
  attenderId: string;
  experienceId?: string;
  rating: number;
  comment: string;
  photoUrls?: string[];
  helpfulCount: number;
  replyCount: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

## 環境設定メモ

### 開発環境
- Docker と Docker Compose を利用した開発環境
- エミュレーターでのFirebase連携テスト
- `.env` による環境変数設定

### 本番環境
- Google Cloud Platform (GCP) + Firebase 構成
- バックエンド: Cloud Run (Node.js/Express)
- 認証/データベース: Firebase
- ストレージ: Cloud Storage / Firebase Storage

## 注意点と既知の課題
1. FirebaseモジュールとCloud Runの連携でAPIキーの適切な管理が必要
2. 画像アップロードとストレージ設定の最適化が必要
3. 実環境での認証フローのテストが不十分
4. バックエンドでのパフォーマンス最適化が未着手
5. エラーレスポンスの標準化とフロントでの一貫したハンドリングが必要

## 参考資料
- Firebase Admin SDK ドキュメント: https://firebase.google.com/docs/admin/setup
- Cloud Run ドキュメント: https://cloud.google.com/run/docs
- Express.js セキュリティベストプラクティス: https://expressjs.com/en/advanced/best-practice-security.html