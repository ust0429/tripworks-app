/**
 * エコーアプリのタイプチェックを実行するスクリプト
 */
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// 重要なファイルが存在するか確認
const checkFiles = () => {
  const criticalFiles = [
    'src/components/attender/application/steps/IdentificationStep.tsx',
    'src/types/attender/index.ts',
    'src/contexts/AttenderApplicationContext.tsx'
  ];
  
  console.log('重要なファイルの存在を確認しています...');
  
  for (const filePath of criticalFiles) {
    const fullPath = path.join(process.cwd(), filePath);
    
    if (!fs.existsSync(fullPath)) {
      console.error(`エラー: ${filePath} が見つかりません`);
      return false;
    }
  }
  
  console.log('すべての重要なファイルが存在します。');
  return true;
};

// TypeScriptコンパイラでタイプチェックを実行
const runTypeCheck = () => {
  console.log('TypeScriptコンパイラでタイプチェックを実行しています...');
  
  return new Promise((resolve, reject) => {
    exec('npx tsc --noEmit', (error, stdout, stderr) => {
      if (error) {
        console.error('タイプチェックエラー:');
        console.error(stdout || stderr);
        reject(error);
        return;
      }
      
      console.log('タイプチェックに成功しました！');
      resolve();
    });
  });
};

// モジュールパスの確認
const checkModulePaths = () => {
  console.log('モジュールパスをテストしています...');
  
  return new Promise((resolve, reject) => {
    // テスト用の一時ファイルを作成
    const testFilePath = path.join(process.cwd(), 'src', 'test', 'module-path-test.ts');
    
    const testContent = `
      // このファイルはモジュールパスのテスト用です
      import { AttenderApplicationProvider } from '../contexts/AttenderApplicationContext';
      import IdentificationStep from '../components/attender/application/steps/IdentificationStep';
      
      // エラーがなければモジュールパスは正しく設定されています
      const testFunction = () => {
        console.log('モジュールパスのテストに成功しました');
      };
      
      export default testFunction;
    `;
    
    fs.writeFileSync(testFilePath, testContent);
    
    // このファイルを含めてTypeScriptコンパイラを実行
    exec('npx tsc --noEmit', (error, stdout, stderr) => {
      // テストファイルを削除
      if (fs.existsSync(testFilePath)) {
        fs.unlinkSync(testFilePath);
      }
      
      if (error) {
        console.error('モジュールパスのテストに失敗しました:');
        console.error(stdout || stderr);
        reject(error);
        return;
      }
      
      console.log('モジュールパスのテストに成功しました！');
      resolve();
    });
  });
};

// メイン処理
const main = async () => {
  try {
    const filesExist = checkFiles();
    if (!filesExist) {
      process.exit(1);
    }
    
    await runTypeCheck();
    await checkModulePaths();
    
    console.log('すべての検証に成功しました！');
  } catch (error) {
    console.error('検証に失敗しました。');
    process.exit(1);
  }
};

main();
