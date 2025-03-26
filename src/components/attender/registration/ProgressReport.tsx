import React from 'react';
import { FormStatusType, AttenderApplicationData } from '../../../types/attender/index';
import { Check, AlertCircle } from 'lucide-react';

interface ProgressReportProps {
  currentStep: number;
  maxSteps: number;
  formStatus: FormStatusType;
  formData: Partial<AttenderApplicationData>;
  errors: Record<string, string>;
  onNavigateToStep: (step: number) => void;
  completedSteps?: number[];
  className?: string;
}

/**
 * フォーム入力の進捗状況を視覚的に表示するコンポーネント
 * 
 * 段階的登録のプログレスを視覚的にユーザーに伝える
 */
const ProgressReport: React.FC<ProgressReportProps> = ({
  currentStep,
  maxSteps,
  formStatus,
  formData,
  errors,
  onNavigateToStep,
  completedSteps = [],
  className = ''
}) => {
  // ステップのステータスを判定
  const getStepStatus = (step: number) => {
    if (step < currentStep || completedSteps.includes(step)) {
      return 'completed';
    }
    if (step === currentStep) {
      return 'current';
    }
    return 'pending';
  };
  
  // ステップの状態に応じたスタイルを返す
  const getStepStyles = (step: number) => {
    const status = getStepStatus(step);
    
    switch (status) {
      case 'completed':
        return {
          dot: 'bg-green-500 text-white',
          line: 'bg-green-500'
        };
      case 'current':
        return {
          dot: 'bg-blue-500 text-white',
          line: 'bg-gray-300'
        };
      case 'pending':
      default:
        return {
          dot: 'bg-gray-300 text-gray-500',
          line: 'bg-gray-300'
        };
    }
  };
  
  // プログレスバーの進捗率を計算
  const progressPercentage = Math.max(
    Math.min(((currentStep - 1) / (maxSteps - 1)) * 100, 100),
    0
  );
  
  // モバイル向けシンプル表示
  const renderMobileProgress = () => (
    <div className="flex items-center">
      <div className="flex-1 h-1 bg-gray-200 rounded overflow-hidden">
        <div 
          className="h-1 bg-blue-500 transition-all duration-300"
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>
      <div className="ml-2 text-xs text-gray-500">
        {formStatus === 'required' ? '基本' : '詳細'} {currentStep}/{maxSteps}
      </div>
    </div>
  );
  
  // デスクトップ向け詳細表示
  const renderDesktopProgress = () => (
    <div className="flex items-center space-x-1">
      {Array.from({ length: maxSteps }).map((_, index) => {
        const step = index + 1;
        const styles = getStepStyles(step);
        const isLast = step === maxSteps;
        
        return (
          <React.Fragment key={step}>
            {/* ステップドット */}
            <div 
              className={`w-6 h-6 rounded-full flex items-center justify-center ${styles.dot} transition-colors duration-300`}
            >
              {getStepStatus(step) === 'completed' ? (
                <Check className="w-4 h-4" />
              ) : (
                <span className="text-xs">{step}</span>
              )}
            </div>
            
            {/* ステップ間の線（最後のステップ以外） */}
            {!isLast && (
              <div className="flex-1 h-1 transition-colors duration-300">
                <div className={`h-full ${styles.line}`}></div>
              </div>
            )}
          </React.Fragment>
        );
      })}
      
      {/* 登録形式の表示 */}
      {formStatus === 'required' && (
        <span className="ml-2 bg-cyan-100 text-cyan-800 px-2 py-0.5 rounded-full text-xs">
          基本登録
        </span>
      )}
    </div>
  );
  
  return (
    <div className={className}>
      {/* モバイル表示とデスクトップ表示を分岐 */}
      <div className="block md:hidden">
        {renderMobileProgress()}
      </div>
      <div className="hidden md:block">
        {renderDesktopProgress()}
      </div>
      
      {/* 警告表示（例：未入力項目がある場合） */}
      {completedSteps.length < currentStep - 1 && (
        <div className="mt-2 text-xs text-amber-600 flex items-center">
          <AlertCircle className="w-3 h-3 mr-1" />
          入力が完了していない項目があります。
        </div>
      )}
    </div>
  );
};

export default ProgressReport;