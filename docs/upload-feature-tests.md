# ファイルアップロード機能テスト実装ドキュメント

## 概要

echoアプリのファイルアップロード機能に関する統合テストを実装しました。これらのテストは、アテンダー登録フォームにおけるファイルアップロード機能の正常な動作を確認するものです。

## 実装したテスト

### 1. コンポーネントテスト

#### 共通コンポーネント
- **FileUploader**: ファイルアップロードの基本コンポーネント
  - ドラッグ＆ドロップ機能
  - ファイル選択ダイアログ
  - プレビュー表示
  - バリデーション（サイズ、形式）
  - エラーハンドリング

- **UploadProgressBar**: アップロード進捗表示コンポーネント
  - 各ステータスの表示（処理中、アップロード中、完了、エラー）
  - 進捗パーセンテージの表示
  - ファイル情報の表示
  - 閉じるボタンの機能

#### アテンダー登録関連コンポーネント
- **IdentificationUploader**: 身分証明書アップロードコンポーネント
  - 身分証明書の表/裏のアップロード
  - 適切なAPI呼び出し
  - エラーハンドリング

- **ExperienceImageUploader**: 体験サンプル画像アップロードコンポーネント
  - 複数画像のアップロード
  - 画像の追加/削除
  - 最大数制限

### 2. 統合テスト

- **AttenderApplicationForm**: アテンダー申請フォーム全体の統合テスト
  - 各ステップの遷移
  - フォーム入力の検証
  - ファイルアップロードの統合
  - 申請の完了

## テストの実行方法

作成したテストは以下のコマンドで実行できます:

```bash
node scripts/run-upload-tests.js
```

または個別のテストの実行:

```bash
npx vitest run src/__tests__/components/common/upload/FileUploader.test.tsx
```

## テストの構造

```
src/
└── __tests__/
    ├── components/
    │   ├── common/
    │   │   └── upload/
    │   │       ├── FileUploader.test.tsx
    │   │       └── UploadProgressBar.test.tsx
    │   └── attender/
    │       └── application/
    │           ├── IdentificationUploader.test.tsx
    │           ├── ExperienceImageUploader.test.tsx
    │           └── AttenderApplicationForm.test.tsx
    └── services/
        └── upload/
            └── FileUploadService.test.ts
```

## 実装上の工夫

1. **モックの活用**
   - FileUploadService のモック化
   - API 呼び出しのモック化
   - DataTransfer オブジェクトのモック化

2. **実際のユーザー操作のシミュレーション**
   - ドラッグ＆ドロップ
   - ファイル選択
   - フォーム入力とナビゲーション

3. **エラーハンドリングのテスト**
   - サイズ超過のファイル
   - 非対応の形式
   - API エラー

## 今後の課題

1. E2Eテストの実装
   - 実際のブラウザ環境でのテスト
   - 実際のファイルシステムとの連携テスト

2. パフォーマンステスト
   - 大きなファイルでのアップロード性能
   - 複数ファイル同時アップロード

3. セキュリティテスト
   - XSS対策の検証
   - CSRF対策の検証
   - ファイル検証のバイパス試行

## 参考ドキュメント

- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Vitest](https://vitest.dev/guide/)
- [Testing File Upload](https://developer.mozilla.org/en-US/docs/Web/API/File/Using_files_from_web_applications)
