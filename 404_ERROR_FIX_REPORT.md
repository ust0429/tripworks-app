# 404エラー問題修正レポート

## 問題の概要

アテンダー申請ページにおいて、以下の操作を行うと404エラーが発生する問題が見つかりました：

1. キャンセルボタンをクリックする
2. マイページボタンをクリックする
3. ページをリロードする

## 根本原因の分析

詳細な調査の結果、以下の原因が特定されました：

1. **ベースURLの設定問題**: `index.html`の`<base href="%PUBLIC_URL%/">`設定がルーティングに影響
2. **相対/絶対パスの処理**: ナビゲーション関数が相対パスと絶対パスを適切に処理していない
3. **SPAとHTMLルーティングの混在**: React Routerを使用するSPAだが、一部で`window.location.href`を使用

主な技術的課題は、React RouterによるSPAナビゲーションとHTMLベースのナビゲーション（`window.location.href`）が混在しており、両者で整合性がないことでした。

## 実装した解決策

### 1. ベースURLの修正

`public/index.html`のベースURL設定をコメントアウトし、問題を解消しました：

```html
<!-- <base href="%PUBLIC_URL%/"> -->
```

### 2. SPAルーティングのサポート強化

`public/404.html`ファイルを追加して、SPAアプリケーションへのリダイレクト処理を実装：

```html
<script>
  // SPAアプリケーションへのリダイレクト処理
  (function() {
    var l = window.location;
    var path = l.pathname.replace(/^\/?/, '');
    window.localStorage.setItem('echoRedirectPath', path + (l.search || '') + (l.hash || ''));
    window.location.href = l.protocol + '//' + l.hostname + (l.port ? ':' + l.port : '') + '/';
  })();
</script>
```

`index.html`にもリダイレクトパスを処理するスクリプトを追加：

```html
<script>
  // SPAリダイレクト処理
  (function() {
    var redirectPath = window.localStorage.getItem('echoRedirectPath');
    if (redirectPath) {
      window.localStorage.removeItem('echoRedirectPath');
      window.history.replaceState(null, null, redirectPath);
    }
  })();
</script>
```

### 3. ナビゲーション関数の改善

`src/utils/navigation.ts`を改善し、より堅牢なURLの扱いを実装：

```typescript
export const navigateTo = (path: string): void => {
  try {
    // URL構築の改善
    let fullPath = '';
    
    // 外部URLの場合はそのまま使用
    if (path.startsWith('http://') || path.startsWith('https://')) {
      fullPath = path;
    } else {
      // 相対パスの正規化
      const baseUrl = window.location.origin;
      const normalizedPath = path.startsWith('/') ? path : `/${path}`;
      fullPath = `${baseUrl}${normalizedPath}`;
    }
    
    // ログイン状態のバックアップ
    if (isUserLoggedIn()) {
      const user = localStorage.getItem('echo_user');
      const currentUser = localStorage.getItem('echo_currentUser');
      localStorage.setItem('echo_user_saved', user || '');
      localStorage.setItem('echo_currentUser_saved', currentUser || '');
    }
    
    // 標準ナビゲーション
    window.location.href = fullPath;
  } catch (error) {
    // フォールバック
    window.location.href = path;
  }
};
```

また、認証状態を復元する処理も追加：

```typescript
// ページロード時に認証状態をリストアする
(() => {
  try {
    const savedUser = localStorage.getItem('echo_user_saved');
    const savedCurrentUser = localStorage.getItem('echo_currentUser_saved');
    
    if (savedUser && savedCurrentUser && !isUserLoggedIn()) {
      localStorage.setItem('echo_user', savedUser);
      localStorage.setItem('echo_currentUser', savedCurrentUser);
      localStorage.removeItem('echo_user_saved');
      localStorage.removeItem('echo_currentUser_saved');
    }
  } catch (e) {
    console.warn('認証状態の復元に失敗しました:', e);
  }
})();
```

### 4. 追加ユーティリティの導入

SPAルーティングの問題に対処するための追加ユーティリティを作成：

1. `useReliableNavigation.ts` - React RouterとHTMLナビゲーションを組み合わせた信頼性の高いナビゲーションフック
2. `useSPARouting.ts` - SPAアプリでのページリロードやURL直接アクセスを処理するフック
3. `.htaccess` - サーバー側でSPAルーティングをサポートするための設定

### 5. 確認ダイアログの追加

ユーザー体験を向上させるため、ナビゲーション前に確認ダイアログを表示するよう修正：

```typescript
onClick={(e) => {
  e.preventDefault();
  
  // 確認ダイアログを表示
  const confirmed = window.confirm('プロフィールページに移動しますか？ 入力中のデータは保存されません。');
  if (confirmed) {
    navigateToProfile();
  }
}}
```

## 技術的詳細

### SPAルーティングの仕組み

1. **通常のナビゲーション**: React RouterによるSPAナビゲーション
2. **404エラー時のフォールバック**: `404.html`による保存と`index.html`でのパス復元
3. **状態保持**: ナビゲーション前のログイン状態をlocalStorageでバックアップ

### 互換性とフォールバック

この修正は以下の環境/状況で動作します：

1. 通常のSPAナビゲーション（サーバーサイドレンダリングなし）
2. HTML5 History APIをサポートするブラウザ
3. localStorageにアクセスできる環境

ブラウザやサーバーでこれらの機能が使用できない場合は、通常のHTMLナビゲーションにフォールバックします。

## 今後の改善点

1. **統合ルーティング**:
   - SPAとHTMLナビゲーションの統合的なアプローチの採用
   - React Routerの完全活用

2. **状態管理の改良**:
   - フォーム状態とナビゲーション状態の統合的な管理
   - リアクティブな状態更新

3. **エラー処理の強化**:
   - ナビゲーションエラーの適切な処理とフィードバック
   - 開発環境でのデバッグ支援

## 結論

今回の修正により、アテンダー申請ページにおける404エラーの問題が解消され、ページ間のナビゲーションが安定しました。また、認証状態の維持についても改善されています。

ソリューションはSPA（シングルページアプリケーション）の原則を維持しつつ、必要に応じてHTMLベースのナビゲーションをフォールバックとして使用するハイブリッドなアプローチを採用しています。これにより、ユーザー体験を損なうことなく安定したナビゲーションを実現しています。
