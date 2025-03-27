# Echo アプリ開発引き継ぎプロンプト（2025年3月27日更新）

## 最近の実装内容
1. **モノクロデザインのさらなる適用拡大**
   - ReviewForm.tsx（レビュー投稿画面）をモノクロデザインに変更
   - ReviewCard.tsx（レビュー表示カード）をモノクロデザインに変更
   - MarketScreen.tsx（マーケットプレイス画面）をモノクロデザインに変更
   - MobileFormWrapper.tsxのデバイス表示インジケーターを削除
   - 以下の要素をモノクロデザインに統一：
     - レビュー投稿フォームの各セクション（評価、コメント、写真アップロード）
     - レビューカードの表示（ユーザー情報、評価、コメント、写真、役に立つボタン）
     - マーケットプレイスの商品リスト、カテゴリー、限定商品セクション

2. **デザイン統一の詳細実装内容**
   - 背景色：
     - 主要背景を `bg-mono-white` に統一 
     - セカンダリ背景を `bg-mono-lighter` に統一
   - テキスト色：
     - 重要テキストを `text-mono-black` に統一（タイトル、主要情報）
     - 補足テキストを `text-mono-gray-medium` に統一（詳細情報）
     - 説明テキストを `text-mono-gray-light` に統一（補助情報）
   - ボタン：
     - プライマリボタンは `bg-mono-black text-mono-white` で統一
     - セカンダリボタンは `border border-mono-light text-mono-dark` で統一
     - ホバー状態は `hover:bg-mono-dark`（プライマリ）と `hover:bg-mono-lighter`（セカンダリ）で統一
     - 遷移効果は `transition-colors duration-200` で統一
   - 入力フォーム：
     - ボーダーは `border-mono-light` に統一
     - フォーカス状態は `focus:ring-mono-black focus:border-mono-gray-medium` に統一

## 現在の動作
- レビュー投稿フォームがモノクロデザインで統一された
- レビューカードの表示がモノクロデザインで統一された
- マーケットプレイス画面全体がモノクロデザインで統一された
- アプリの主要な画面すべてがUberライクなモノクロテーマで視覚的に一貫性を持った

## 今後の優先課題
1. 残りの機能ページをモノクロデザインに適用
   - メッセージング画面
   - プロフィール編集画面
   - 設定画面
   - コミュニティ機能画面
2. モノクロカラーパレットの微調整と確認
   - 特にコントラスト比の確認
   - アクセシビリティ標準への適合
3. レスポンシブデザインの改善
   - モバイル表示の最適化
   - タブレット表示の調整

## 次回取り組むべき実装
1. メッセージング画面のモノクロデザイン適用
2. プロフィール編集画面のモノクロデザイン適用
3. ダークモードサポートの検討と実装準備

## デザインシステムメモ
- プライマリアクション：`bg-mono-black text-mono-white hover:bg-mono-dark transition-colors duration-200`
- セカンダリアクション：`border border-mono-light text-mono-dark hover:bg-mono-lighter transition-colors duration-200`
- 警告アクション：`bg-mono-black text-mono-white hover:bg-mono-dark transition-colors duration-200`（以前は赤色だったが、統一のためモノクロに）
- 重要テキスト：`text-mono-black font-bold/semibold`
- 二次テキスト：`text-mono-gray-medium`
- 説明テキスト：`text-mono-gray-light text-sm`
- アイコン：`text-mono-gray-medium`（通常状態）、`text-mono-black`（アクティブ状態）
- 背景（ページ）：`bg-mono-lighter`
- 背景（カード）：`bg-mono-white`
- ボーダー：`border-mono-light`（セパレーター、フォーム境界線）
- フォーカス状態：`focus:ring-mono-black focus:border-mono-gray-medium`
- 星評価：例外的に `text-yellow-500 fill-current`（アクティブ）と `text-mono-gray-light`（非アクティブ）

## 対応コンポーネント一覧
以下のコンポーネントすべてでモノクロデザインを適用済み：
- AttenderInfoPage.tsx
- HomeScreen.tsx（アテンダー募集バナー）
- BookingConfirmationScreen.tsx
- ExperienceSearch.tsx
- ReviewForm.tsx
- ReviewCard.tsx
- MarketScreen.tsx
- MobileFormWrapper.tsx（開発表示インジケーター削除）