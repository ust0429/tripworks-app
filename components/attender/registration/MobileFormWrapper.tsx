import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Menu, X } from 'lucide-react';
import { AttenderApplicationData } from '@/types/attender';
import { REQUIRED_STEPS, OPTIONAL_STEPS, STEP_METADATA, StepKey } from '../../../constants/applicationSteps';

interface MobileFormWrapperProps {
  children: React.ReactNode;
  currentStep: number;
  maxSteps: number;
  formStatus: 'required' | 'optional' | 'completed';
  onNavigate: (step: number) => void;
  isStepCompleted: (step: number) => boolean;
}

/**
 * モバイルデバイス向けのフォームラッパーコンポーネント
 * モバイルビューでのステップナビゲーションを提供
 */
const MobileFormWrapper: React.FC<MobileFormWrapperProps> = ({
  children,
  currentStep,
  maxSteps,
  formStatus,
  onNavigate,
  isStepCompleted
}) => {
  const [showMenu, setShowMenu] = useState(false);

  // 必要なステップまたは全ステップを選択
  const stepKeys = formStatus === 'required' 
    ? REQUIRED_STEPS 
    : [...REQUIRED_STEPS, ...OPTIONAL_STEPS];

  // 現在のステップキーとメタデータを取得
  const currentStepKey = stepKeys[currentStep - 1] as StepKey;
  const currentStepMeta = currentStepKey ? STEP_METADATA[currentStepKey] : null;

  // ステップが完了しているかをチェック
  const canGoNext = currentStep < maxSteps || isStepCompleted(currentStep);
  const canGoPrev = currentStep > 1;

  // モバイルメニューの表示・非表示
  const toggleMenu = () => {
    setShowMenu(!showMenu);
  };

  return (
    <div className="relative w-full">
      {/* モバイルヘッダー */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sm:hidden">
        <button
          type="button"
          onClick={toggleMenu}
          className="p-2 -ml-2 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md"
          aria-label="メニューを開く"
        >
          {showMenu ? <X size={20} /> : <Menu size={20} />}
        </button>
        
        <div className="text-center">
          <h2 className="text-sm font-medium text-gray-900 truncate max-w-[200px]">
            {currentStepMeta?.title || `ステップ ${currentStep}`}
          </h2>
          <p className="text-xs text-gray-500">
            {currentStep}/{maxSteps}
          </p>
        </div>
        
        <div className="flex space-x-1">
          <button
            type="button"
            disabled={!canGoPrev}
            onClick={() => onNavigate(currentStep - 1)}
            className={`p-2 rounded-full ${
              canGoPrev 
                ? 'text-gray-500 hover:text-gray-700 hover:bg-gray-100' 
                : 'text-gray-300 cursor-not-allowed'
            }`}
            aria-label="前のステップへ"
          >
            <ChevronLeft size={20} />
          </button>
          
          <button
            type="button"
            disabled={!canGoNext}
            onClick={() => onNavigate(currentStep + 1)}
            className={`p-2 rounded-full ${
              canGoNext 
                ? 'text-gray-500 hover:text-gray-700 hover:bg-gray-100' 
                : 'text-gray-300 cursor-not-allowed'
            }`}
            aria-label="次のステップへ"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
      
      {/* モバイルナビゲーションドロワー */}
      {showMenu && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 sm:hidden">
          <div className="bg-white h-full w-3/4 max-w-xs overflow-y-auto shadow-xl">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-bold">アテンダー申請</h2>
              <button
                type="button"
                onClick={toggleMenu}
                className="p-1 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md"
                aria-label="メニューを閉じる"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="py-2">
              {/* ステップリスト */}
              <div className="mt-2 space-y-1 px-3">
                {stepKeys.map((stepKey, index) => {
                  const stepNumber = index + 1;
                  const isActive = stepNumber === currentStep;
                  const isCompleted = stepNumber < currentStep || isStepCompleted(stepNumber);
                  const isPending = stepNumber > currentStep;
                  const isClickable = stepNumber <= currentStep || isStepCompleted(stepNumber);
                  const currentStepKey = stepKey as StepKey;
                  
                  return (
                    <button
                      key={stepNumber}
                      onClick={() => {
                        if (isClickable) {
                          onNavigate(stepNumber);
                          setShowMenu(false);
                        }
                      }}
                      disabled={!isClickable}
                      className={`w-full text-left px-3 py-2 rounded-md flex items-center ${
                        isActive
                          ? 'bg-blue-50 text-blue-700'
                          : isCompleted
                            ? 'text-green-700 hover:bg-gray-100'
                            : 'text-gray-500 hover:bg-gray-100'
                      } ${!isClickable ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      <div className={`w-6 h-6 flex items-center justify-center rounded-full mr-3 ${
                        isActive
                          ? 'bg-blue-600 text-white'
                          : isCompleted
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-200 text-gray-500'
                      }`}>
                        {stepNumber}
                      </div>
                      <div>
                        <div className="font-medium">
                          {STEP_METADATA[currentStepKey]?.title}
                        </div>
                        <div className="text-xs text-gray-500">
                          {isCompleted ? '完了' : isActive ? '入力中' : '未完了'}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
              
              {/* 補足情報 */}
              <div className="mt-4 px-4 py-3 bg-gray-50 text-xs text-gray-500">
                <p>
                  {formStatus === 'required' 
                    ? '基本情報のみで登録可能です。詳細情報は後から入力できます。' 
                    : '全ての情報を入力して申請を完了します。'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* メインコンテンツ */}
      <div className="pt-0 sm:pt-2">
        {children}
      </div>
      
      {/* モバイルフッターナビゲーション */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 flex justify-between items-center sm:hidden">
        <button
          type="button"
          disabled={!canGoPrev}
          onClick={() => onNavigate(currentStep - 1)}
          className={`px-4 py-2 rounded-md flex items-center ${
            canGoPrev 
              ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          <ChevronLeft size={16} className="mr-1" />
          前へ
        </button>
        
        <span className="text-xs text-gray-500">
          {currentStep}/{maxSteps}
        </span>
        
        <button
          type="button"
          disabled={!canGoNext}
          onClick={() => onNavigate(currentStep + 1)}
          className={`px-4 py-2 rounded-md flex items-center ${
            canGoNext 
              ? 'bg-blue-600 text-white hover:bg-blue-700' 
              : 'bg-blue-300 text-white cursor-not-allowed'
          }`}
        >
          次へ
          <ChevronRight size={16} className="ml-1" />
        </button>
      </div>
      
      {/* モバイルでフッターナビの高さ分の余白 */}
      <div className="h-16 sm:h-0 md:h-0"></div>
    </div>
  );
};

export default MobileFormWrapper;