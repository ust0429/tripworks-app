# echo - ディープカルチャー体験プラットフォーム

![echo アプリ](https://via.placeholder.com/1200x630?text=echo+-+%E3%83%87%E3%82%A3%E3%83%BC%E3%83%97%E3%82%AB%E3%83%AB%E3%83%81%E3%83%A3%E3%83%BC%E4%BD%93%E9%A8%93%E3%83%97%E3%83%A9%E3%83%83%E3%83%88%E3%83%95%E3%82%A9%E3%83%BC%E3%83%A0)

## プロジェクト概要

echoは「旅にインディーズを、旅にオルタナティブを」をコンセプトにした地域共創型ディープカルチャー体験プラットフォームです。地元の案内人・アーティスト・職人などの「アテンダー」が案内する、ガイドブックには載っていないディープな体験を提供します。

## 主な特徴

- **インディーズ精神の体験**: 大手の定型プランではなく、地域の裏路地や隠れ家、コミュニティスペースなどを探索する「生々しい」体験を提供
- **多様なアテンダー**: バンドマン、アーティスト、職人など、従来の観光ガイドの枠を超えた個性的な人材が案内
- **共創型体験**: 利用者も能動的に参加し、「一時的な地元住民」感覚を味わえる体験を提供
- **サプライズと柔軟性**: 「ゆるい」プランで偶然と不確実性を楽しむ旅を実現

## アプリの現状

現在は以下の機能を実装しています：

- ユーザー認証（ログイン/新規登録）
- アテンダー一覧表示と詳細情報
- 体験プランの表示と予約フロー
- メッセージング機能
- レビュー投稿・表示機能
- 予約確認と履歴管理
- オンボーディング画面

## 今後の開発予定

- レビュー機能の強化
- 位置情報/地図機能の完成
- 決済機能の本格実装
- 通知センターの開発
- コミュニティ機能の展開
- マーケットプレイス機能の追加

## 主要ペルソナ

1. **ソロ旅初心者「ゆる旅スタート君」**
   - 旅行計画が苦手だが、個性的な体験をしてみたい20代後半

2. **カルチャー愛好家「ディープカルチャー花子」**
   - 定番観光では飽き足らず、ローカルのマイナーカルチャーに強い関心を持つ30代女性

3. **デジタルノマド「ノマド太郎」**
   - リモートワークで各地を回り、移動先の刺激的な現地体験を求める

4. **移住検討中「ローカルシフト恵子」**
   - 都会暮らしに疲れ、地方の暮らしを体感して移住の可能性を探りたい

## 技術スタック

- **フロントエンド**: React, TypeScript, Tailwind CSS
- **状態管理**: React Context API
- **UI/UXライブラリ**: Lucide React (アイコン)
- **マップ機能**: React Map GL, Mapbox GL
- **将来予定**: Node.js, Express, MongoDB, Firebase など

## プロジェクト構造

主なディレクトリ構造：

```
src/
├── components/       # 共通コンポーネント
│   ├── messages/     # メッセージング関連
│   └── screens/      # 主要画面
├── utils/            # ユーティリティ関数
├── types.ts          # 型定義
├── mockData.ts       # モックデータ
├── AuthComponents.tsx # 認証関連
└── App.tsx           # メインアプリコンポーネント
```

## 開発環境のセットアップ

### 前提条件

- Node.js 18.x 以上
- npm 9.x 以上

### インストール

```bash
# リポジトリをクローン
git clone https://github.com/yourusername/echo.git
cd echo

# 依存パッケージをインストール
npm install

# 開発サーバーを起動
npm start
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開くとアプリが表示されます。

## 利用可能なスクリプト

- `npm start`: 開発モードでアプリを実行
- `npm test`: テストを実行
- `npm run build`: 本番用ビルドを作成
- `npm run deploy`: GitHub Pages へデプロイ

## コントリビューション

プロジェクトへの貢献を歓迎します。以下の手順で参加できます：

1. リポジトリをフォークする
2. 機能ブランチを作成する (`git checkout -b feature/amazing-feature`)
3. 変更をコミットする (`git commit -m 'Add some amazing feature'`)
4. ブランチをプッシュする (`git push origin feature/amazing-feature`)
5. プルリクエストを作成する

## ライセンス

このプロジェクトは MIT ライセンスの下で公開されています。詳細は [LICENSE](LICENSE) ファイルをご覧ください。

## お問い合わせ

プロジェクトに関するご質問やご提案は、issues セクションに投稿するか、以下の連絡先までお問い合わせください：

- Email: contact@echo-app.example.com
- Twitter: [@echo_app](https://twitter.com/echo_app_example)

---

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).
