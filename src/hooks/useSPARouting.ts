/**
 * SPAルーティングのためのフック
 * 
 * SPAアプリでもページのリロードや直接URLアクセス時に適切に動作するための
 * ルーティング機能を提供するカスタムフック
 */
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export const useSPARouting = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // リロード後のパス復元
  useEffect(() => {
    // ローカルストレージからリダイレクトパスが保存されているか確認
    const redirectPath = localStorage.getItem('echoRedirectPath');
    if (redirectPath) {
      // パスを復元
      localStorage.removeItem('echoRedirectPath');
      navigate(redirectPath);
    }
  }, [navigate]);
  
  // 404フォールバック（ハッシュベースのルーティング）
  useEffect(() => {
    // URLにリダイレクトパラメータがある場合（404.htmlからのリダイレクト）
    const query = new URLSearchParams(window.location.search);
    const redirectPath = query.get('p');
    if (redirectPath && redirectPath !== location.pathname) {
      // パスを復元
      navigate(redirectPath, { replace: true });
    }
  }, [location, navigate]);
  
  // 通常のSPAルーティングと非SPAルーティングの分別処理
  useEffect(() => {
    // 一部のルートに限定したHTMLベースのルーティング（必要に応じて）
    const nonSPARoutes = [
      '/apply-to-be-attender', 
      '/external-page'
    ];
    
    // 現在のパスをチェック
    const needsHTMLRouting = nonSPARoutes.some(route => 
      location.pathname.startsWith(route)
    );
    
    if (needsHTMLRouting) {
      // HTML/URL直接ナビゲーションのフラグを設定（必要に応じて）
      sessionStorage.setItem('echoUseDirectNavigation', 'true');
    } else {
      // フラグをクリア
      sessionStorage.removeItem('echoUseDirectNavigation');
    }
  }, [location]);
  
  return {
    // SPA内で使用するためのメソッドなど（必要に応じて）
    saveCurrentPath: () => {
      localStorage.setItem('echoLastPath', location.pathname + location.search + location.hash);
    },
    restoreLastPath: () => {
      const lastPath = localStorage.getItem('echoLastPath');
      if (lastPath) {
        navigate(lastPath);
        return true;
      }
      return false;
    }
  };
};
