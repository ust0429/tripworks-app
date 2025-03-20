/**
 * 型エラー修正の検証スクリプト
 * 
 * このスクリプトは型定義の修正が正しく行われているかを検証します。
 * - TypeScriptコンパイル
 * - 各ファイルの存在チェック
 * - 各型定義が正しく参照されているかのチェック
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// 色付きログ出力
const log = {
  info: (msg) => console.log(`\x1b[36m${msg}\x1b[0m`),
  success: (msg) => console.log(`\x1b[32m${msg}\x1b[0m`),
  warning: (msg) => console.log(`\x1b[33m${msg}\x1b[0m`),
  error: (msg) => console.log(`\x1b[31m${msg}\x1b[0m`)
};

// 必須ファイルのリスト
const requiredFiles = [
  'src/types/attender.ts',
  'src/types/applepay.d.ts',
  'src/types/uuid.d.ts',
  'src/setupTests.ts',
  'src/components/payment/ApplePayButton.tsx',
  'src/test/attender/AttenderRegistrationTest.tsx'
];

// プロジェクトルートのパス
const rootPath = path.resolve(__dirname, '..');

/**
 * ファイルの存在をチェック
 */
function checkRequiredFiles() {
  log.info('必須ファイルの存在チェック中...');
  
  const missingFiles = [];
  
  for (const file of requiredFiles) {
    const filePath = path.join(rootPath, file);
    if (!fs.existsSync(filePath)) {
      missingFiles.push(file);
    }
  }
  
  if (missingFiles.length === 0) {
    log.success('すべての必須ファイルが存在します');
    return true;
  } else {
    log.error('以下のファイルが見つかりません:');
    missingFiles.forEach(file => log.error(`  - ${file}`));
    return false;
  }
}

/**
 * TypeScriptコンパイルの実行
 */
function runTypeCheck() {
  log.info('TypeScriptコンパイルを実行中...');
  
  try {
    // TSCを実行して型エラーをチェック
    execSync('npx tsc --noEmit', { stdio: 'inherit' });
    log.success('TypeScriptコンパイルが成功しました');
    return true;
  } catch (error) {
    log.error('TypeScriptコンパイルでエラーが発生しました');
    return false;
  }
}

/**
 * テストの実行
 */
function runTests() {
  log.info('テストを実行中...');
  
  try {
    // テストを実行
    execSync('npm test -- --watchAll=false', { stdio: 'inherit' });
    log.success('テストが成功しました');
    return true;
  } catch (error) {
    log.error('テストでエラーが発生しました');
    return false;
  }
}

/**
 * メイン実行関数
 */
function main() {
  log.info('型エラー修正の検証を開始します...');
  
  const filesExist = checkRequiredFiles();
  if (!filesExist) {
    log.error('必須ファイルが存在しないため検証を中止します');
    process.exit(1);
  }
  
  const typeCheckPassed = runTypeCheck();
  if (!typeCheckPassed) {
    log.error('型チェックが失敗したため検証を中止します');
    process.exit(1);
  }
  
  const testsPassed = runTests();
  if (!testsPassed) {
    log.error('テストが失敗したため検証を中止します');
    process.exit(1);
  }
  
  log.success('すべての検証が成功しました！型エラーの修正は正しく完了しています。');
}

// スクリプトの実行
main();
