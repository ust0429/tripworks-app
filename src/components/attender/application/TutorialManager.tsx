import React, { useState, useEffect } from 'react';
import TutorialOverlay from '../../../../components/attender/registration/TutorialOverlay';

/**
 * チュートリアルの表示管理コンポーネント
 * ローカルストレージを利用して初回訪問者にのみチュートリアルを表示
 */
const TutorialManager: React.FC = () => {
  const [showTutorial, setShowTutorial] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  
  // マウント時にローカルストレージをチェック
  useEffect(() => {
    setIsMounted(true);
    
    try {
      // チュートリアル完了フラグを確認
      const tutorialCompleted = localStorage.getItem('attender_tutorial_completed');
      
      // 未完了の場合はチュートリアルを表示
      if (!tutorialCompleted) {
        // 少し遅延させてUIが整ってから表示
        const timer = setTimeout(() => {
          setShowTutorial(true);
        }, 1500);
        
        return () => clearTimeout(timer);
      }
    } catch (error) {
      console.warn('ローカルストレージへのアクセスエラー:', error);
      // エラー時は安全のためチュートリアルを表示しない
    }
  }, []);
  
  // チュートリアル完了時の処理
  const handleComplete = () => {
    try {
      // 完了フラグを保存
      localStorage.setItem('attender_tutorial_completed', 'true');
      // チュートリアルを閉じる
      setShowTutorial(false);
      
      // 分析イベントがあれば送信（実装があれば）
      try {
        const analyticsAny = window as any;
        if (analyticsAny.analytics) {
          analyticsAny.analytics.track('Tutorial_Completed', {
            source: 'attender_application'
          });
        }
      } catch (analyticsError) {
        console.warn('分析イベント送信エラー:', analyticsError);
      }
      
    } catch (error) {
      console.warn('ローカルストレージへの保存エラー:', error);
      // エラー時も問題なくチュートリアルを閉じる
      setShowTutorial(false);
    }
  };
  
  // チュートリアルを閉じる
  const handleClose = () => {
    setShowTutorial(false);
    
    // 分析イベントがあれば送信（実装があれば）
    try {
      const analyticsAny = window as any;
      if (analyticsAny.analytics) {
        analyticsAny.analytics.track('Tutorial_Skipped', {
          source: 'attender_application'
        });
      }
    } catch (analyticsError) {
      console.warn('分析イベント送信エラー:', analyticsError);
    }
  };
  
  // マウント前は何も表示しない（SSRでのエラー防止）
  if (!isMounted) return null;
  
  return (
    <TutorialOverlay
      isVisible={showTutorial}
      onClose={handleClose}
      onComplete={handleComplete}
    />
  );
};

export default TutorialManager;