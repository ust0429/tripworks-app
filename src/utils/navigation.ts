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

// ページロード時に認証状態をリストアする
(() => {
  try {
    // バックアップされた認証情報があるか確認
    const savedUser = localStorage.getItem('echo_user_saved');
    const savedCurrentUser = localStorage.getItem('echo_currentUser_saved');
    
    // 通常の認証情報がなく、バックアップがある場合に復元
    if (savedUser && savedCurrentUser && !isUserLoggedIn()) {
      localStorage.setItem('echo_user', savedUser);
      localStorage.setItem('echo_currentUser', savedCurrentUser);
      
      // バックアップをクリア
      localStorage.removeItem('echo_user_saved');
      localStorage.removeItem('echo_currentUser_saved');
      
      console.log('認証状態を復元しました');
    }
  } catch (e) {
    console.warn('認証状態の復元に失敗しました:', e);
  }
})();

/**
 * アプリケーション内のページに遷移する
 * React Router使用時とフォールバックを統合したナビゲーション関数
 * 
 * @param path 遷移先のパス
 * @param useRouter Reactルーターを使用するかどうか
 */
export const navigateTo = (path: string): void => {
  try {
    // URL構築の改善: 
    // 1. 相対パスからの正規化
    // 2. 二重スラッシュの防止
    let fullPath = '';
    
    // 外部URLの場合はそのまま使用
    if (path.startsWith('http://') || path.startsWith('https://')) {
      fullPath = path;
    } else {
      // 現在のURLからベースURLを取得
      const baseUrl = window.location.origin;
      
      // 先頭のスラッシュを正規化
      const normalizedPath = path.startsWith('/') ? path : `/${path}`;
      
      // 絶対パスを構築
      fullPath = `${baseUrl}${normalizedPath}`;
    }
    
    // ログイン状態の確認
    const wasLoggedIn = isUserLoggedIn();
    
    // 当面の問題に対応するためのログイン状態を保存
    if (wasLoggedIn) {
      try {
        const user = localStorage.getItem('echo_user');
        const currentUser = localStorage.getItem('echo_currentUser');
        
        // 「保存版」を作成
        localStorage.setItem('echo_user_saved', user || '');
        localStorage.setItem('echo_currentUser_saved', currentUser || '');
        
        console.log('認証状態のバックアップを作成しました');
      } catch (e) {
        console.warn('認証状態のバックアップに失敗しました:', e);
      }
    }
    
    // JavaScript標準のナビゲーション
    window.location.href = fullPath;
    
    // ナビゲーション後の確認と復旧はページ読み込み時に行われる
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
