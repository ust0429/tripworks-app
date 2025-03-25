/**
 * 信頼性の高いナビゲーションフック
 * 
 * SPAアプリケーションで、通常のナビゲーションとフォールバックを組み合わせて
 * 安定したページ遷移を実現するためのカスタムフック
 */
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { navigateTo, navigateToHome, navigateToProfile } from '../utils/navigation';

export const useReliableNavigation = () => {
  const navigate = useNavigate();
  
  /**
   * 安全なナビゲーション
   * React Routerのnavigateとwindowベースのフォールバックを組み合わせたナビゲーション
   */
  const safeNavigate = useCallback((path: string) => {
    try {
      // まずReact Routerを試す
      navigate(path);
      
      // 万が一の場合に備えて200ms後にフォールバックの設定
      const fallbackTimer = setTimeout(() => {
        // フォールバックナビゲーション
        navigateTo(path);
      }, 200);
      
      // クリーンアップ
      return () => clearTimeout(fallbackTimer);
    } catch (error) {
      console.warn('React Router navigation failed, using fallback:', error);
      navigateTo(path);
    }
  }, [navigate]);
  
  /**
   * ホームページに移動
   */
  const goHome = useCallback(() => {
    navigateToHome();
  }, []);
  
  /**
   * プロフィールページに移動
   */
  const goToProfile = useCallback(() => {
    navigateToProfile();
  }, []);
  
  /**
   * キャンセル確認付きのナビゲーション
   */
  const navigateWithConfirmation = useCallback((path: string, message: string = '変更を破棄してページを移動しますか？') => {
    const confirmed = window.confirm(message);
    if (confirmed) {
      navigateTo(path);
    }
    return confirmed;
  }, []);
  
  /**
   * キャンセル確認付きのホームへの移動
   */
  const goHomeWithConfirmation = useCallback((message: string = '入力内容が保存されずに失われますが、キャンセルしますか？') => {
    return navigateWithConfirmation('/', message);
  }, [navigateWithConfirmation]);
  
  return {
    safeNavigate,
    goHome,
    goToProfile,
    navigateWithConfirmation,
    goHomeWithConfirmation
  };
};
