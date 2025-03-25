import React, { useState, useEffect } from 'react';
import { X, HelpCircle, ChevronRight, ChevronLeft, BookOpen } from 'lucide-react';

interface TutorialStep {
  title: string;
  content: string;
  target?: string; // ターゲット要素のセレクタ
  position?: 'top' | 'right' | 'bottom' | 'left';
}

interface TutorialOverlayProps {
  onClose: () => void;
  onComplete: () => void;
  isVisible: boolean;
}

/**
 * アテンダー申請フォームのチュートリアルオーバーレイ
 * 初めてフォームを利用するユーザー向けのガイダンスを提供
 */
const TutorialOverlay: React.FC<TutorialOverlayProps> = ({
  onClose,
  onComplete,
  isVisible
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [skipAnimation, setSkipAnimation] = useState(false);
  
  // チュートリアルのステップ定義
  const tutorialSteps: TutorialStep[] = [
    {
      title: '段階的申請プロセスへようこそ',
      content: '「echo」のアテンダー申請は、段階的に必要な情報を入力できるように設計されています。まずは基本情報から入力し、その後詳細情報を追加できます。',
      position: 'bottom'
    },
    {
      title: '必須情報と任意情報',
      content: '青色のバッジがついたステップは必須項目です。最小限の情報だけで申請を完了することができます。詳細情報は後からいつでも追加できます。',
      target: '.step-indicator',
      position: 'bottom'
    },
    {
      title: '自動保存と下書き機能',
      content: 'フォームの入力内容は自動的に保存されます。また「今すぐ保存」ボタンで明示的に下書き保存することもできます。',
      target: '.draft-saver',
      position: 'top'
    },
    {
      title: 'プレビュー機能',
      content: '最終ステップでは「プレビュー」ボタンをクリックすると、アテンダープロフィールの表示イメージを確認できます。',
      target: '.preview-button',
      position: 'left'
    },
    {
      title: '進捗状況のモニタリング',
      content: '進捗状況レポートでは、各セクションの入力状況や残りの項目を確認できます。',
      target: '.progress-report',
      position: 'top'
    },
    {
      title: 'いつでもヘルプが利用可能',
      content: '不明点がある場合は、右上の「ヘルプ」ボタンをクリックするとガイダンスが表示されます。また、各フィールドの横にある情報アイコンからもヒントを確認できます。',
      target: '.help-button',
      position: 'bottom'
    },
    {
      title: '準備完了！',
      content: 'これでチュートリアルは完了です。「始める」ボタンをクリックして申請プロセスを開始しましょう。いつでもチュートリアルに戻ることができます。',
      position: 'bottom'
    }
  ];
  
  // 現在のステップ
  const step = tutorialSteps[currentStep];
  
  // ターゲット要素の位置を取得
  const getTargetPosition = () => {
    if (!step.target) return { top: '50%', left: '50%' };
    
    const targetElement = document.querySelector(step.target);
    if (!targetElement) return { top: '50%', left: '50%' };
    
    const rect = targetElement.getBoundingClientRect();
    
    // ポジションに応じて調整
    switch (step.position) {
      case 'top':
        return {
          top: `${rect.top - 10}px`,
          left: `${rect.left + rect.width / 2}px`,
          transform: 'translate(-50%, -100%)'
        };
      case 'right':
        return {
          top: `${rect.top + rect.height / 2}px`,
          left: `${rect.right + 10}px`,
          transform: 'translate(0, -50%)'
        };
      case 'bottom':
        return {
          top: `${rect.bottom + 10}px`,
          left: `${rect.left + rect.width / 2}px`,
          transform: 'translate(-50%, 0)'
        };
      case 'left':
        return {
          top: `${rect.top + rect.height / 2}px`,
          left: `${rect.left - 10}px`,
          transform: 'translate(-100%, -50%)'
        };
      default:
        return {
          top: `${rect.top + rect.height / 2}px`,
          left: `${rect.left + rect.width / 2}px`,
          transform: 'translate(-50%, -50%)'
        };
    }
  };
  
  // ターゲット要素のハイライト表示
  const highlightTarget = () => {
    if (!step.target) return;
    
    const targetElement = document.querySelector(step.target);
    if (!targetElement) return;
    
    // ハイライト用のクラスを追加
    targetElement.classList.add('tutorial-highlight');
    
    // クリーンアップ関数を返す
    return () => {
      targetElement.classList.remove('tutorial-highlight');
    };
  };
  
  // ターゲット要素のハイライト設定
  useEffect(() => {
    if (!isVisible) return;
    
    const cleanup = highlightTarget();
    return cleanup;
  }, [currentStep, isVisible]);
  
  // 次のステップへ進む
  const nextStep = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setSkipAnimation(true);
      setCurrentStep(currentStep + 1);
      setTimeout(() => setSkipAnimation(false), 50);
    } else {
      onComplete();
    }
  };
  
  // 前のステップへ戻る
  const prevStep = () => {
    if (currentStep > 0) {
      setSkipAnimation(true);
      setCurrentStep(currentStep - 1);
      setTimeout(() => setSkipAnimation(false), 50);
    }
  };
  
  // オーバーレイが非表示の場合は何も表示しない
  if (!isVisible) return null;
  
  // ターゲット位置の算出
  const position = getTargetPosition();
  
  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      {/* 半透明オーバーレイ */}
      <div className="absolute inset-0 bg-black bg-opacity-60 pointer-events-auto" onClick={onClose} />
      
      {/* チュートリアルポップアップ */}
      <div 
        className={`absolute bg-white rounded-lg shadow-lg p-4 max-w-xs w-full pointer-events-auto
                   transition-all duration-300 ${skipAnimation ? '' : 'animate-float'}`}
        style={{
          top: position.top,
          left: position.left,
          transform: position.transform || 'translate(-50%, -50%)'
        }}
      >
        {/* ヘッダー */}
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center text-blue-600">
            <BookOpen size={16} className="mr-1" />
            <span className="text-xs font-medium">チュートリアル {currentStep + 1}/{tutorialSteps.length}</span>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="チュートリアルを閉じる"
          >
            <X size={16} />
          </button>
        </div>
        
        {/* タイトル */}
        <h3 className="font-medium text-gray-900 mb-1">{step.title}</h3>
        
        {/* コンテンツ */}
        <p className="text-sm text-gray-600 mb-4">{step.content}</p>
        
        {/* ナビゲーションボタン */}
        <div className="flex justify-between items-center">
          <button
            onClick={prevStep}
            disabled={currentStep === 0}
            className={`p-1 rounded ${
              currentStep === 0 
                ? 'text-gray-300 cursor-not-allowed' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
            aria-label="前のステップ"
          >
            <ChevronLeft size={16} />
          </button>
          
          <div className="flex space-x-2">
            <button
              onClick={onClose}
              className="px-3 py-1 text-xs text-gray-600 border border-gray-300 rounded hover:bg-gray-100 transition-colors"
            >
              スキップ
            </button>
            
            <button
              onClick={nextStep}
              className="px-3 py-1 text-xs text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors"
            >
              {currentStep < tutorialSteps.length - 1 ? '次へ' : '始める'}
            </button>
          </div>
          
          <button
            onClick={nextStep}
            className={`p-1 rounded ${
              currentStep === tutorialSteps.length - 1 
                ? 'text-gray-300 cursor-not-allowed' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
            aria-label="次のステップ"
            disabled={currentStep === tutorialSteps.length - 1}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
      
      {/* ヘルプボタン */}
      <button
        onClick={() => setCurrentStep(0)}
        className="fixed bottom-4 right-4 w-12 h-12 rounded-full bg-blue-600 text-white shadow-lg flex items-center justify-center hover:bg-blue-700 transition-colors pointer-events-auto"
        aria-label="チュートリアルを再開"
      >
        <HelpCircle size={24} />
      </button>
    </div>
  );
};

export default TutorialOverlay;