/**
 * ファイルアップロード関連コンポーネントのテストを実行するスクリプト
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// テスト対象ディレクトリ
const TEST_DIRS = [
  'src/__tests__/services/upload',
  'src/__tests__/components/common/upload',
  'src/__tests__/components/attender/application'
];

// 色付きの出力用の定数
const COLORS = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

/**
 * テストの存在確認
 * @returns {boolean} すべてのテストディレクトリが存在すればtrue
 */
function checkTestFilesExist() {
  let allExist = true;
  
  console.log(`${COLORS.cyan}テストファイルの存在確認...${COLORS.reset}`);
  
  TEST_DIRS.forEach(dir => {
    const dirPath = path.join(process.cwd(), dir);
    
    if (fs.existsSync(dirPath)) {
      const files = fs.readdirSync(dirPath);
      const testFiles = files.filter(file => file.endsWith('.test.tsx') || file.endsWith('.test.ts'));
      
      if (testFiles.length > 0) {
        console.log(`${COLORS.green}✓ ${dir} に ${testFiles.length} 個のテストファイルを確認${COLORS.reset}`);
      } else {
        console.log(`${COLORS.yellow}⚠ ${dir} にテストファイルがありません${COLORS.reset}`);
        allExist = false;
      }
    } else {
      console.log(`${COLORS.red}✗ ${dir} が存在しません${COLORS.reset}`);
      allExist = false;
    }
  });
  
  return allExist;
}

/**
 * テストを実行
 */
function runTests() {
  console.log(`\n${COLORS.cyan}ファイルアップロード関連のテストを実行します...${COLORS.reset}\n`);
  
  try {
    // アップロード関連のファイルのみに絞ったテスト実行
    const testPatterns = TEST_DIRS.map(dir => dir.replace(/\\/g, '/'))
      .map(dir => `${dir}/**/*.test.{ts,tsx}`)
      .join(',');
    
    const cmd = `npx vitest run ${testPatterns} --reporter=verbose`;
    console.log(`${COLORS.yellow}実行コマンド: ${cmd}${COLORS.reset}\n`);
    
    // テスト実行（出力をそのまま表示）
    execSync(cmd, { stdio: 'inherit' });
    
    console.log(`\n${COLORS.green}ファイルアップロード関連のテストが完了しました${COLORS.reset}`);
    return true;
  } catch (error) {
    console.error(`\n${COLORS.red}テストの実行中にエラーが発生しました:${COLORS.reset}`);
    console.error(error.message);
    return false;
  }
}

/**
 * メイン実行関数
 */
function main() {
  console.log(`\n${COLORS.magenta}=== ファイルアップロード関連テスト実行スクリプト ===${COLORS.reset}\n`);
  
  const testsExist = checkTestFilesExist();
  
  if (!testsExist) {
    console.log(`\n${COLORS.yellow}一部のテストファイルが不足しています。それでもテストを実行しますか？ (Y/n)${COLORS.reset}`);
    
    // 標準入力からの入力を同期的に処理（簡易的な実装）
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    readline.question('', (answer) => {
      readline.close();
      if (answer.toLowerCase() !== 'n') {
        const success = runTests();
        process.exit(success ? 0 : 1);
      } else {
        console.log(`\n${COLORS.yellow}テストを中止しました${COLORS.reset}`);
        process.exit(0);
      }
    });
  } else {
    const success = runTests();
    process.exit(success ? 0 : 1);
  }
}

// スクリプト実行
main();
