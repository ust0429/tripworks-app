const fs = require('fs');
const path = require('path');

// 対象ディレクトリの設定
const componentsDir = path.join(__dirname, '..', 'src', 'components');
const hooksDir = path.join(__dirname, '..', 'src', 'hooks');

// インポート置換のマッピング
const importReplacements = [
  {
    from: "import { useTranslation } from 'react-i18next';",
    to: "import { useTranslation } from '../../../mocks/i18nMock';"
  },
  {
    from: "import { useTranslation } from \"react-i18next\";",
    to: "import { useTranslation } from '../../../mocks/i18nMock';"
  },
  {
    fromPattern: /from ['"]@mui\/material['"]/g,
    to: "from '../../../mocks/materialMock'"
  },
  {
    fromPattern: /from ['"]@mui\/icons-material['"]/g,
    to: "from '../../../mocks/iconsMock'"
  },
  {
    fromPattern: /import .+ from ['"]@mui\/icons-material\/[\w]+['"];/g,
    toFn: (match) => {
      // アイコン名を抽出
      const iconName = match.match(/\/(\w+)['"]/)[1];
      return `import { ${iconName} } from '../../../mocks/iconsMock';`;
    }
  }
];

// ファイルを再帰的に処理する関数
function processDirectory(directoryPath, depth = 0) {
  const relativePath = '../'.repeat(depth + 3); // 基本的な相対パスを計算
  
  const files = fs.readdirSync(directoryPath);
  for (const file of files) {
    const filePath = path.join(directoryPath, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // ディレクトリなら再帰
      processDirectory(filePath, depth + 1);
    } else if (stat.isFile() && /\.(tsx|ts)$/.test(file)) {
      // TSX/TSファイルを処理
      let content = fs.readFileSync(filePath, 'utf8');
      let modified = false;
      
      // 各置換ルールを適用
      for (const replacement of importReplacements) {
        if (replacement.from && content.includes(replacement.from)) {
          // 直接文字列置換
          content = content.replace(replacement.from, replacement.to.replace('../../../', relativePath));
          modified = true;
        } else if (replacement.fromPattern) {
          // 正規表現パターン置換
          const matches = content.match(replacement.fromPattern);
          if (matches) {
            if (replacement.to) {
              content = content.replace(replacement.fromPattern, replacement.to.replace('../../../', relativePath));
            } else if (replacement.toFn) {
              for (const match of matches) {
                let replacement = replacement.toFn(match);
                replacement = replacement.replace('../../../', relativePath);
                content = content.replace(match, replacement);
              }
            }
            modified = true;
          }
        }
      }
      
      // 変更があった場合だけファイルを書き込む
      if (modified) {
        console.log(`Updating imports in ${filePath}`);
        fs.writeFileSync(filePath, content, 'utf8');
      }
    }
  }
}

// コンポーネントディレクトリと他のディレクトリを処理
console.log('Updating imports in component files...');
processDirectory(componentsDir);
console.log('Updating imports in hook files...');
processDirectory(hooksDir);
console.log('Done!');
