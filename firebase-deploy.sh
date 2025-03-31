#!/bin/bash
# Firebase デプロイ自動化スクリプト

# 現在のディレクトリを表示
echo "Current directory: $(pwd)"

# 既存のビルドを削除
echo "Removing existing build folder..."
rm -rf build

# パッケージのインストール (必要に応じて)
# echo "Installing dependencies..."
# npm install

# アプリをビルド
echo "Building the app..."
npm run build

# ビルドが成功したか確認
if [ ! -d "build" ]; then
  echo "Build failed. Exiting."
  exit 1
fi

# ビルドフォルダの内容を確認
echo "Checking build folder contents..."
ls -la build

# デプロイ前に確認
echo "Homepage setting in package.json:"
grep "homepage" package.json

# Firebase にデプロイ
echo "Deploying to Firebase..."
firebase deploy --only hosting

# デプロイ後のメッセージ
echo "Deployment completed."
echo "Please check https://echo-app-staging.web.app to verify the deployment."
