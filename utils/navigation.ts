/**
 * ナビゲーション関連のユーティリティ
 * 
 * ルート間の移動を簡単に行うためのユーティリティ関数を提供します。
 * このファイルはReact Routerのバージョンに依存せず、
 * URLベースのナビゲーション関数を提供します。
 */

// アプリケーションのルート定義
export const ROUTES = {
  // メインルート
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  PROFILE: '/profile',
  SETTINGS: '/settings',
  
  // アテンダー関連
  ATTENDER_APPLICATION: '/attender/apply',
  ATTENDER_PROFILE: '/attender/profile',
  ATTENDER_DASHBOARD: '/attender/dashboard',
  ATTENDER_EXPERIENCES: '/attender/experiences',
  ATTENDER_BOOKINGS: '/attender/bookings',
  
  // 体験関連
  EXPERIENCES: '/experiences',
  EXPERIENCE_DETAIL: (id: string) => `/experiences/${id}`,
  EXPERIENCE_CREATE: '/experiences/create',
  EXPERIENCE_EDIT: (id: string) => `/experiences/${id}/edit`,
  
  // 予約関連
  BOOKINGS: '/bookings',
  BOOKING_DETAIL: (id: string) => `/bookings/${id}`,
  BOOKING_CONFIRM: (id: string) => `/bookings/${id}/confirm`,
  
  // ユーザー関連
  USER_PROFILE: (userId: string) => `/users/${userId}`,
  USER_REVIEWS: (userId: string) => `/users/${userId}/reviews`,
  
  // その他
  ABOUT: '/about',
  CONTACT: '/contact',
  TERMS: '/terms',
  PRIVACY: '/privacy',
  FAQ: '/faq',
  SUPPORT: '/support',
  NOT_FOUND: '/404',
};

/**
 * 現在のブラウザURLを取得
 * @returns 現在のURL
 */
export function getCurrentUrl(): string {
  return window.location.href;
}

/**
 * 現在のパスを取得
 * @returns 現在のパス
 */
export function getCurrentPath(): string {
  return window.location.pathname;
}

/**
 * 指定されたパスに移動
 * @param path 移動先のパス
 * @param replace 現在の履歴を置き換えるかどうか
 */
export function navigateTo(path: string, replace: boolean = false): void {
  if (replace) {
    window.location.replace(path);
  } else {
    window.location.href = path;
  }
}

/**
 * ホームページに移動
 */
export function navigateToHome(): void {
  navigateTo(ROUTES.HOME);
}

/**
 * ログインページに移動
 * @param returnUrl ログイン後に戻るURL（オプション）
 */
export function navigateToLogin(returnUrl?: string): void {
  const loginUrl = returnUrl ? `${ROUTES.LOGIN}?returnUrl=${encodeURIComponent(returnUrl)}` : ROUTES.LOGIN;
  navigateTo(loginUrl);
}

/**
 * プロフィールページに移動
 */
export function navigateToProfile(): void {
  navigateTo(ROUTES.PROFILE);
}

/**
 * アテンダー申請ページに移動
 */
export function navigateToAttenderApplication(): void {
  navigateTo(ROUTES.ATTENDER_APPLICATION);
}

/**
 * アテンダーダッシュボードに移動
 */
export function navigateToAttenderDashboard(): void {
  navigateTo(ROUTES.ATTENDER_DASHBOARD);
}

/**
 * 体験一覧ページに移動
 */
export function navigateToExperiences(): void {
  navigateTo(ROUTES.EXPERIENCES);
}

/**
 * 体験詳細ページに移動
 * @param experienceId 体験ID
 */
export function navigateToExperienceDetail(experienceId: string): void {
  navigateTo(ROUTES.EXPERIENCE_DETAIL(experienceId));
}

/**
 * 前のページに戻る
 */
export function goBack(): void {
  window.history.back();
}

/**
 * キャンセル確認ダイアログを表示
 * @param message 確認メッセージ
 * @param callbackOrUrl 確認時のコールバック関数またはURL
 */
export function cancelWithConfirmation(message: string, callbackOrUrl?: (() => void) | string): void {
  if (window.confirm(message)) {
    if (typeof callbackOrUrl === 'function') {
      callbackOrUrl();
    } else if (typeof callbackOrUrl === 'string') {
      navigateTo(callbackOrUrl);
    } else {
      goBack();
    }
  }
}

/**
 * URLパラメータからクエリパラメータを取得
 * @param name パラメータ名
 * @returns パラメータの値（存在しない場合はnull）
 */
export function getQueryParam(name: string): string | null {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
}

export default {
  ROUTES,
  navigateTo,
  navigateToHome,
  navigateToLogin,
  navigateToProfile,
  navigateToAttenderApplication,
  navigateToAttenderDashboard,
  navigateToExperiences,
  navigateToExperienceDetail,
  goBack,
  cancelWithConfirmation,
  getCurrentUrl,
  getCurrentPath,
  getQueryParam
};