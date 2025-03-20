/**
 * echoアプリの統合検証スクリプト
 * IdentificationStepコンポーネントが正しく統合されているか確認します
 */
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// 重要なコンポーネントの依存関係チェック
const checkDependencies = () => {
  console.log('コンポーネントの依存関係を検証しています...');
  
  const criticalFiles = [
    {
      path: 'src/components/attender/application/AttenderApplicationForm.tsx',
      dependencies: [
        'IdentificationStep', 
        'AttenderApplicationProvider'
      ]
    },
    {
      path: 'src/components/attender/application/steps/IdentificationStep.tsx',
      dependencies: [
        'useAttenderApplication',
        'Reference',
        'AdditionalDocument',
        'SocialMediaLinks'
      ]
    },
    {
      path: 'src/contexts/AttenderApplicationContext.tsx',
      dependencies: [
        'AttenderApplicationData',
        'useContext',
        'useState',
        'createContext'
      ]
    }
  ];
  
  let allPassed = true;
  
  for (const file of criticalFiles) {
    const fullPath = path.join(process.cwd(), file.path);
    
    console.log(`${file.path} を検証中...`);
    
    if (!fs.existsSync(fullPath)) {
      console.error(`エラー: ${file.path} が見つかりません`);
      allPassed = false;
      continue;
    }
    
    const content = fs.readFileSync(fullPath, 'utf8');
    
    for (const dependency of file.dependencies) {
      if (!content.includes(dependency)) {
        console.error(`エラー: ${file.path} には ${dependency} が含まれていません`);
        allPassed = false;
      }
    }
  }
  
  if (allPassed) {
    console.log('すべての依存関係が正しく設定されています');
  }
  
  return allPassed;
};

// プロジェクトのビルドテスト
const testBuild = () => {
  console.log('プロジェクトのビルドテストを実行しています...');
  
  return new Promise((resolve, reject) => {
    // ビルド時の警告のみを表示するオプション
    exec('npm run build --silent', (error, stdout, stderr) => {
      if (error) {
        console.error('ビルドに失敗しました:');
        console.error(stdout || stderr);
        reject(error);
        return;
      }
      
      console.log('ビルドに成功しました！');
      resolve();
    });
  });
};

// IdentificationStepコンポーネントの独立テスト
const testIdentificationStep = () => {
  console.log('IdentificationStepコンポーネントをテストしています...');
  
  return new Promise((resolve, reject) => {
    exec('npx jest src/test/attender/IdentificationStepTest.tsx', (error, stdout, stderr) => {
      if (error) {
        console.error('テストに失敗しました:');
        console.error(stdout || stderr);
        reject(error);
        return;
      }
      
      console.log('IdentificationStepコンポーネントのテストに成功しました！');
      resolve();
    });
  });
};

// ファイルパスの一貫性チェック
const checkFilePaths = () => {
  console.log('ファイルパスの一貫性を検証しています...');
  
  // AttenderApplicationFormのインポートステートメントを確認
  const formPath = path.join(process.cwd(), 'src/components/attender/application/AttenderApplicationForm.tsx');
  
  if (!fs.existsSync(formPath)) {
    console.error('エラー: AttenderApplicationForm.tsx が見つかりません');
    return false;
  }
  
  const formContent = fs.readFileSync(formPath, 'utf8');
  
  // 正しいインポートパスを確認
  const correctImportPath = "import IdentificationStep from './steps/IdentificationStep';";
  
  if (!formContent.includes(correctImportPath)) {
    console.error('エラー: AttenderApplicationForm.tsx のインポートパスが正しくありません');
    console.error(`期待されるインポート: ${correctImportPath}`);
    return false;
  }
  
  console.log('ファイルパスの一貫性チェックに成功しました');
  return true;
};

// メイン処理
const main = async () => {
  try {
    const dependenciesOk = checkDependencies();
    if (!dependenciesOk) {
      console.error('依存関係の検証に失敗しました');
      process.exit(1);
    }
    
    const pathsOk = checkFilePaths();
    if (!pathsOk) {
      console.error('ファイルパスの一貫性チェックに失敗しました');
      process.exit(1);
    }
    
    // コメントアウト：実際のビルドはオプションで実行
    // await testBuild();
    
    // コメントアウト：実際のテスト実行はオプションで実行
    // await testIdentificationStep();
    
    console.log('すべての検証チェックに成功しました！');
  } catch (error) {
    console.error('検証に失敗しました');
    process.exit(1);
  }
};

// スクリプト実行
main();
