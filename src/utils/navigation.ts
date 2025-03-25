/**
 * ナビゲーションユーティリティ
 * 
 * アプリケーション内でのページ遷移を一元管理するユーティリティ関数
 */

// ログイン状態の確認関数
const isUserLoggedIn = (): boolean => {
  try {
    // localStorageからユーザー情報を確認
    const storedUser = localStorage.getItem('echo_user');
    const storedCurrentUser = localStorage.getItem('echo_currentUser');
    
    return !!(storedUser && storedCurrentUser);
  } catch (e) {
    console.error('Failed to check login status:', e);
    return false;
  }
};

/**
 * アプリケーション内のページに遷移する
 * React Router使用時とフォールバックを統合したナビゲーション関数
 * 
 * @param path 遷移先のパス
 * @param useRouter Reactルーターを使用するかどうか
 */
export const navigateTo = (path: string): void => {
  try {
    // 現在のURLからdomain部分を取得
    const baseUrl = window.location.origin;
    // 相対パスの場合は絶対パスに変換
    const fullPath = path.startsWith('/') ? `${baseUrl}${path}` : path;
    
    // ログイン状態の確認
    const wasLoggedIn = isUserLoggedIn();
    
    // JavaScript標準のナビゲーション
    window.location.href = fullPath;
    
    // 当初はユーザーがログインしていた場合、ナビゲーション後にログイン状態を再確認
    setTimeout(() => {
      if (wasLoggedIn && !isUserLoggedIn()) {
        console.warn('ナビゲーション後にログイン状態が失われた可能性があります');
      }
    }, 500);
  } catch (error) {
    console.error(`Navigation failed to: ${path}`, error);
    // フォールバック: 最も基本的なナビゲーション
    window.location.href = path;
  }
};

/**
 * ホームページに遷移する
 */
export const navigateToHome = (): void => {
  navigateTo('/');
};

/**
 * マイページに遷移する
 */
export const navigateToProfile = (): void => {
  navigateTo('/profile');
};

/**
 * アテンダー申請ページに遷移する
 */
export const navigateToAttenderApplication = (): void => {
  navigateTo('/apply-to-be-attender');
};

/**
 * アテンダー申請状況ページに遷移する
 */
export const navigateToAttenderStatus = (): void => {
  navigateTo('/attender/status');
};

/**
 * 前のページに戻る
 * history APIを使用し、失敗した場合はホームに戻る
 */
export const goBack = (): void => {
  try {
    window.history.back();
  } catch (error) {
    console.error('Failed to go back in history', error);
    navigateToHome();
  }
};

/**
 * 確認ダイアログ付きのナビゲーション
 * キャンセルやページ離脱時の確認に使用
 * 
 * @param path 遷移先のパス
 * @param confirmMessage 確認メッセージ
 * @returns 確認結果（true:遷移した、false:キャンセルされた）
 */
export const navigateWithConfirmation = (path: string, confirmMessage: string): boolean => {
  const confirmed = window.confirm(confirmMessage);
  if (confirmed) {
    navigateTo(path);
    return true;
  }
  return false;
};

/**
 * 確認ダイアログ付きのキャンセル処理
 * フォームのキャンセルボタンなどに使用
 * 
 * @param confirmMessage 確認メッセージ
 * @returns 確認結果（true:キャンセルされた、false:キャンセルされなかった）
 */
export const cancelWithConfirmation = (confirmMessage: string = '入力内容が保存されずに失われますが、よろしいですか？'): boolean => {
  return navigateWithConfirmation('/', confirmMessage);
};
