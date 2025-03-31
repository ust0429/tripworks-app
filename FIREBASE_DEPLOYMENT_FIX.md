# Firebase デプロイ問題修正レポート

## 実施日: 2025年3月31日

## 概要

Firebase Hosting(`https://echo-app-staging.web.app/`)にデプロイしたアプリケーションが表示されない問題を調査し修正しました。

## 問題点

1. **不正なホームページURL設定**：
   - `package.json`ファイルの`homepage`プロパティが`https://ust0429.github.io/tripworks-app`を指していました。
   - これはFirebaseホスティングのURLではなく、GitHub Pagesを指しているため、すべての静的アセットのパスが不正でした。

2. **静的アセットのパス問題**：
   - ビルドされた`index.html`内のすべてのリソースパスが`/tripworks-app/`をプレフィックスとして持っていました。
   - 例: `<script defer="defer" src="/tripworks-app/static/js/main.072850c8.js"></script>`
   - このため、Firebase HostingのURLでは静的アセットが正しく読み込まれませんでした。

## 修正内容

1. **`package.json`の`homepage`プロパティを修正**：
   ```json
   "homepage": "https://echo-app-staging.web.app"
   ```

2. **再ビルドとデプロイ手順**：
   ```bash
   # アプリケーションを再ビルド
   npm run build
   
   # Firebase にデプロイ
   firebase deploy --only hosting
   ```

## 修正後の確認手順

1. `https://echo-app-staging.web.app/` にアクセスして、アプリケーションが正常に表示されることを確認
2. コンソールエラーが表示されないことを確認
3. アプリケーションの主要機能が動作することを確認

## 今後の対策

1. **デプロイ前チェックリスト**：
   - `package.json`の`homepage`プロパティが正しいURLを指していることを確認
   - 静的アセットが正しいパスを使用していることを確認
   - 特にプラットフォーム(GitHub Pages, Firebase, その他)を切り替える際は注意

2. **CI/CDの改善**：
   - 自動デプロイスクリプトを更新して、デプロイ前の環境設定確認を追加
   - デプロイ後の自動テストを実装して、基本的な機能が動作することを確認

## 参考資料

- [React Router と公開URL(ベースパス)の設定](https://create-react-app.dev/docs/deployment/#building-for-relative-paths)
- [Firebase Hostingへのデプロイドキュメント](https://firebase.google.com/docs/hosting/deploying)
