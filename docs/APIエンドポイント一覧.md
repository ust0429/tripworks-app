# Echo アプリ APIエンドポイント一覧

このドキュメントでは、Echo アプリで使用するAPIエンドポイントの一覧と使用方法を説明します。

## 基本情報

- **ベースURL（開発環境）**: `http://localhost:3001/api/v1`
- **ベースURL（本番環境）**: `https://api.echo-app.jp/api/v1`
- **認証方式**: Bearer認証（Firebaseトークン）

## 認証関連

| エンドポイント | メソッド | 説明 | 認証 | レスポンス |
|--------------|---------|------|------|-----------|
| `/auth/login` | POST | ログイン | 不要 | { token, user } |
| `/auth/logout` | POST | ログアウト | 必要 | { success } |
| `/auth/register` | POST | ユーザー登録 | 不要 | { token, user } |
| `/auth/verify-email` | POST | メール確認 | 不要 | { success } |
| `/auth/reset-password` | POST | パスワードリセット | 不要 | { success } |
| `/auth/refresh-token` | POST | トークン更新 | 必要 | { token } |

### リクエスト例（ログイン）

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

### レスポンス例（ログイン）

```json
{
  "token": "eyJhbGciOiJIUzI1...",
  "user": {
    "id": "user_123",
    "email": "user@example.com",
    "name": "サンプルユーザー",
    "role": "user"
  }
}
```

## ユーザー関連

| エンドポイント | メソッド | 説明 | 認証 | レスポンス |
|--------------|---------|------|------|-----------|
| `/users/profile` | GET | プロフィール取得 | 必要 | { user } |
| `/users/profile` | PUT | プロフィール更新 | 必要 | { user } |
| `/users/notifications` | GET | 通知一覧取得 | 必要 | { notifications } |
| `/users/preferences` | GET | 設定取得 | 必要 | { preferences } |
| `/users/preferences` | PUT | 設定更新 | 必要 | { preferences } |

### リクエスト例（プロフィール更新）

```json
{
  "name": "新しい名前",
  "bio": "自己紹介文",
  "location": "東京都"
}
```

## アテンダー関連

| エンドポイント | メソッド | 説明 | 認証 | レスポンス |
|--------------|---------|------|------|-----------|
| `/attenders` | GET | アテンダー一覧 | 不要 | { attenders } |
| `/attenders/:id` | GET | アテンダー詳細 | 不要 | { attender } |
| `/attenders` | POST | アテンダー登録 | 必要 | { attender } |
| `/attenders/:id` | PUT | アテンダー情報更新 | 必要 | { attender } |
| `/attenders/:id/experiences` | GET | アテンダーの体験一覧 | 不要 | { experiences } |
| `/attenders/:id/experiences` | POST | アテンダーの体験作成 | 必要 | { experience } |

### クエリパラメータ（アテンダー一覧）

- `category`: カテゴリでフィルタリング
- `location`: 場所でフィルタリング
- `limit`: 取得数の制限（デフォルト: 10）
- `offset`: ページネーション用オフセット
- `sort`: ソート順（`rating`, `price`, `newest`）

### リクエスト例（アテンダー登録）

```json
{
  "name": "山田太郎",
  "bio": "地元の歴史に詳しいガイドです",
  "location": "京都府京都市",
  "specialties": ["歴史", "伝統工芸", "食文化"],
  "languages": [
    { "language": "ja", "proficiency": "native" },
    { "language": "en", "proficiency": "intermediate" }
  ],
  "isLocalResident": true
}
```

## 体験関連

| エンドポイント | メソッド | 説明 | 認証 | レスポンス |
|--------------|---------|------|------|-----------|
| `/experiences` | GET | 体験一覧 | 不要 | { experiences } |
| `/experiences/:id` | GET | 体験詳細 | 不要 | { experience } |
| `/experiences` | POST | 体験作成 | 必要 | { experience } |
| `/experiences/:id` | PUT | 体験更新 | 必要 | { experience } |
| `/experiences/:id` | DELETE | 体験削除 | 必要 | { success } |
| `/experiences/:id/availability` | GET | 体験の予約可能時間 | 不要 | { availability } |

### クエリパラメータ（体験一覧）

- `category`: カテゴリでフィルタリング
- `location`: 場所でフィルタリング
- `minPrice`: 最小価格
- `maxPrice`: 最大価格
- `date`: 日付でフィルタリング
- `limit`: 取得数の制限（デフォルト: 10）
- `offset`: ページネーション用オフセット

### リクエスト例（体験作成）

```json
{
  "title": "京都の路地裏散策",
  "description": "観光客があまり訪れない京都の隠れた名所を巡ります",
  "category": "文化体験",
  "subcategory": "まち歩き",
  "duration": 120,
  "price": 5000,
  "location": "京都府京都市東山区",
  "maxParticipants": 6,
  "images": ["https://example.com/image1.jpg"]
}
```

## 予約関連

| エンドポイント | メソッド | 説明 | 認証 | レスポンス |
|--------------|---------|------|------|-----------|
| `/bookings` | GET | 予約一覧 | 必要 | { bookings } |
| `/bookings/:id` | GET | 予約詳細 | 必要 | { booking } |
| `/bookings` | POST | 予約作成 | 必要 | { booking } |
| `/bookings/:id/cancel` | POST | 予約キャンセル | 必要 | { booking } |
| `/bookings/:id/status` | PATCH | 予約ステータス更新 | 必要 | { booking } |

### クエリパラメータ（予約一覧）

- `status`: ステータスでフィルタリング（`pending`, `confirmed`, `completed`, `cancelled`）
- `from`: 開始日
- `to`: 終了日

### リクエスト例（予約作成）

```json
{
  "experienceId": "exp_001",
  "date": "2025-04-15",
  "time": "14:00",
  "participants": 2,
  "notes": "食物アレルギーがあります"
}
```

### リクエスト例（予約ステータス更新）

```json
{
  "status": "confirmed"
}
```

## レビュー関連

| エンドポイント | メソッド | 説明 | 認証 | レスポンス |
|--------------|---------|------|------|-----------|
| `/reviews` | GET | レビュー一覧 | 不要 | { reviews } |
| `/reviews/:id` | GET | レビュー詳細 | 不要 | { review } |
| `/reviews` | POST | レビュー投稿 | 必要 | { review } |
| `/reviews/:id` | PUT | レビュー更新 | 必要 | { review } |
| `/reviews/:id` | DELETE | レビュー削除 | 必要 | { success } |
| `/reviews/:id/helpful` | POST | レビューに「役に立った」マーク | 必要 | { review } |

### クエリパラメータ（レビュー一覧）

- `attenderId`: アテンダーIDでフィルタリング
- `experienceId`: 体験IDでフィルタリング
- `rating`: 評価でフィルタリング
- `limit`: 取得数の制限（デフォルト: 10）
- `offset`: ページネーション用オフセット

### リクエスト例（レビュー投稿）

```json
{
  "attenderId": "att_123",
  "experienceId": "exp_001",
  "bookingId": "bk_123",
  "rating": 5,
  "comment": "とても素晴らしい体験でした！ガイドの知識が豊富で、質問にも丁寧に答えてくれました。",
  "photos": ["https://example.com/review1.jpg"]
}
```

## メッセージ関連

| エンドポイント | メソッド | 説明 | 認証 | レスポンス |
|--------------|---------|------|------|-----------|
| `/messages` | GET | メッセージ一覧 | 必要 | { messages } |
| `/messages/conversations` | GET | 会話一覧 | 必要 | { conversations } |
| `/messages/conversations/:id` | GET | 会話詳細 | 必要 | { conversation } |
| `/messages/send` | POST | メッセージ送信 | 必要 | { message } |

### クエリパラメータ（メッセージ一覧）

- `conversationId`: 会話IDでフィルタリング
- `limit`: 取得数の制限（デフォルト: 20）
- `before`: 指定日時以前のメッセージを取得

### リクエスト例（メッセージ送信）

```json
{
  "receiverId": "user_456",
  "content": "こんにちは、予約について質問があります。",
  "conversationId": "conv_123" // 新規会話の場合は不要
}
```

## アップロード関連

| エンドポイント | メソッド | 説明 | 認証 | レスポンス |
|--------------|---------|------|------|-----------|
| `/uploads/image` | POST | 画像アップロード | 必要 | { url, fileId } |
| `/uploads/file` | POST | ファイルアップロード | 必要 | { url, fileId } |
| `/uploads/profile-photo` | POST | プロフィール写真アップロード | 必要 | { url, fileId } |

### リクエスト（アップロード）

マルチパートフォームデータ（`multipart/form-data`）を使用します。

- `file`: アップロードするファイル
- `description`: ファイルの説明（オプション）
- `type`: ファイルタイプ（`profile`, `experience`, `review`など、オプション）

### レスポンス例（アップロード）

```json
{
  "url": "https://storage.example.com/uploads/image123.jpg",
  "fileId": "file_123",
  "mimeType": "image/jpeg",
  "size": 12345
}
```

## 検索関連

| エンドポイント | メソッド | 説明 | 認証 | レスポンス |
|--------------|---------|------|------|-----------|
| `/search/attenders` | GET | アテンダー検索 | 不要 | { attenders } |
| `/search/experiences` | GET | 体験検索 | 不要 | { experiences } |

### クエリパラメータ（検索）

- `q`: 検索キーワード
- `location`: 場所
- `category`: カテゴリ
- `dateFrom`: 開始日
- `dateTo`: 終了日
- `priceMin`: 最小価格
- `priceMax`: 最大価格
- `limit`: 取得数の制限
- `offset`: ページネーション用オフセット

## 通知関連

| エンドポイント | メソッド | 説明 | 認証 | レスポンス |
|--------------|---------|------|------|-----------|
| `/notifications` | GET | 通知一覧 | 必要 | { notifications } |
| `/notifications/:id/read` | POST | 通知を既読にする | 必要 | { notification } |
| `/notifications/settings` | GET | 通知設定を取得 | 必要 | { settings } |
| `/notifications/settings` | PUT | 通知設定を更新 | 必要 | { settings } |

### クエリパラメータ（通知一覧）

- `type`: 通知タイプでフィルタリング
- `read`: 既読/未読でフィルタリング
- `limit`: 取得数の制限（デフォルト: 20）

### リクエスト例（通知設定更新）

```json
{
  "email": {
    "bookingConfirmation": true,
    "bookingReminder": true,
    "newMessage": false,
    "promotions": false
  },
  "push": {
    "bookingConfirmation": true,
    "bookingReminder": true,
    "newMessage": true,
    "promotions": false
  }
}
```

## 支払い関連

| エンドポイント | メソッド | 説明 | 認証 | レスポンス |
|--------------|---------|------|------|-----------|
| `/payments/methods` | GET | 支払い方法一覧 | 必要 | { methods } |
| `/payments/methods/add` | POST | 支払い方法追加 | 必要 | { method } |
| `/payments/process` | POST | 支払い処理 | 必要 | { payment } |
| `/payments/history` | GET | 支払い履歴 | 必要 | { payments } |

### リクエスト例（支払い処理）

```json
{
  "bookingId": "bk_123",
  "methodId": "card_123",
  "amount": 5000,
  "currency": "JPY"
}
```

## エラーレスポンス

APIがエラーを返す場合、以下の形式のJSONが返されます：

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "エラーメッセージ",
    "details": {} // オプショナルな追加情報
  }
}
```

### 主なエラーコード

- `UNAUTHORIZED`: 認証が必要または認証が無効
- `FORBIDDEN`: 権限がない
- `NOT_FOUND`: リソースが見つからない
- `VALIDATION_ERROR`: 入力値が不正
- `SERVER_ERROR`: サーバー内部エラー
- `BOOKING_ALREADY_CANCELLED`: 予約は既にキャンセル済み
- `UNAVAILABLE_TIME`: 指定された時間は予約不可

## API使用上の注意点

1. 認証が必要なエンドポイントでは、HTTPリクエストヘッダーに`Authorization: Bearer {token}`を追加してください。
2. 本番環境では常にHTTPSを使用してください。
3. レート制限があります：認証済みユーザーは1分あたり60リクエスト、未認証ユーザーは1分あたり20リクエストまで。
4. 大量のデータを取得する場合は、`limit`と`offset`パラメータを使用してページネーションを行ってください。
5. アップロードファイルの最大サイズは10MBです。
6. 画像アップロードでは、JPEG、PNG、GIF、WebPのみがサポートされています。

## テスト用アカウント（開発環境のみ）

開発環境ではテスト用アカウントが利用可能です：

- ユーザー: `test@example.com` / `testpassword123`
- アテンダー: `attender@example.com` / `attenderpass123`
- 管理者: `admin@example.com` / `adminpass123`

## バージョン管理

APIの変更履歴は以下の通りです：

- v1: 2025年1月リリース、現行バージョン
- v0.9: 2024年10月ベータリリース（非推奨）

今後のAPIアップデートについては、開発者ポータルで通知します。
