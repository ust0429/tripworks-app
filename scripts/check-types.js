/**
 * TypeScriptの型チェックを実行するスクリプト
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// プロジェクトルートからの相対パス
const targetFile = path.join(
  'src',
  'components',
  'attender',
  'application',
  'steps',
  'IdentificationStep.tsx'
);

// 実行前にファイルが存在するか確認
if (!fs.existsSync(targetFile)) {
  console.error(`エラー: ファイル ${targetFile} が見つかりません`);
  process.exit(1);
}

try {
  // TypeScriptコンパイラを実行（型チェックのみ）
  console.log('TypeScriptの型チェックを実行中...');
  execSync('npx tsc --noEmit', { stdio: 'inherit' });
  
  console.log('\n✅ 型チェックが正常に完了しました');
  console.log(`✅ ファイル ${targetFile} のエラーが修正されました`);
} catch (error) {
  console.error('\n❌ 型チェックエラーが検出されました');
  console.error('コンパイルエラーを修正してください');
  process.exit(1);
}
