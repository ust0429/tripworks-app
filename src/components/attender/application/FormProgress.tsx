import React from 'react';
import { useAttenderApplication } from '../../../contexts/AttenderApplicationContext';
import { Check } from 'lucide-react';
import { REQUIRED_STEPS, OPTIONAL_STEPS, STEP_METADATA, StepKey } from '../../../constants/applicationSteps';

interface FormProgressProps {
  currentStep: number;
  maxSteps: number;
  stepLabels?: string[];
  onStepClick?: (step: number) => void;
}

const FormProgress: React.FC<FormProgressProps> = ({ 
  currentStep, 
  maxSteps, 
  stepLabels: propStepLabels,
  onStepClick
}) => {
  // コンテキストから必要な情報を取得
  const { goToStep, isStepCompleted, formStatus } = useAttenderApplication();
  
  // ステップのラベル（プロパティから渡されなければメタデータから取得）
  const stepLabels = propStepLabels || Object.values(STEP_METADATA).map(meta => meta.title);
  
  // ステップのクリックハンドラ
  const handleStepClick = (step: number) => {
    // カスタムのクリックハンドラがあればそれを使用
    if (onStepClick) {
      onStepClick(step);
      return;
    }
    
    // 完了したステップにのみ移動可能
    if (step < currentStep || isStepCompleted(step - 1)) {
      goToStep(step);
    }
  };
  
  // 進行率の計算
  const progressPercentage = ((currentStep - 1) / (maxSteps - 1)) * 100;
  
  return (
    <div className="relative mb-8">
      {/* プログレスバー */}
      <div className="pt-1 mb-6">
        <div className="flex mb-1 items-center justify-between">
          <div>
            <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-100">
              進行状況
            </span>
          </div>
          <div className="text-right">
            <span className="text-xs font-semibold inline-block text-blue-600">
              {Math.round(progressPercentage)}% 完了
            </span>
          </div>
        </div>
        <div className="overflow-hidden h-2 text-xs flex rounded-full bg-blue-100">
          <div
            style={{ width: `${progressPercentage}%` }}
            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500 transition-all duration-500 ease-in-out rounded-full"
            role="progressbar"
            aria-valuenow={Math.round(progressPercentage)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`フォーム入力進行度: ${Math.round(progressPercentage)}%`}
          ></div>
        </div>
      </div>
      
      {/* ステップインジケーター */}
      <div className="flex justify-between relative mb-2">
        {/* 接続線（背景） */}
        <div className="absolute h-0.5 bg-gray-200 top-4 left-0 right-0 -z-10"></div>
        
        {/* 接続線（進行中） */}
        <div 
          className="absolute h-0.5 bg-blue-500 top-4 left-0 -z-10 transition-all duration-500 ease-in-out"
          style={{width: `${progressPercentage}%`}}
        ></div>
        
        {/* 全ステップの代わりにフォーム状態に応じたステップを使用 */}
        {(() => {
          // 必要なステップまたは全ステップを選択
          const stepKeys = formStatus === 'required' 
            ? REQUIRED_STEPS 
            : [...REQUIRED_STEPS, ...OPTIONAL_STEPS];

          return stepKeys.map((stepKey, index) => {
            const stepNumber = index + 1;
            const isActive = stepNumber === currentStep;
            const isCompleted = stepNumber < currentStep;
            const isPending = stepNumber > currentStep;
            const isClickable = stepNumber <= currentStep || isStepCompleted(stepNumber - 1);
            const currentStepKey = stepKey as StepKey;
            
            // 各ステップの状態に応じたスタイル
            const circleStyle = isActive
              ? 'bg-blue-600 text-white border-2 border-blue-600 ring-4 ring-blue-100'
              : isCompleted
              ? 'bg-green-500 text-white border-2 border-green-500'
              : 'bg-white text-gray-400 border-2 border-gray-300';
              
            const textStyle = isActive
              ? 'text-blue-600 font-semibold'
              : isCompleted
              ? 'text-green-600'
              : 'text-gray-500';
            
            return (
              <div
                key={stepNumber}
                className={`flex flex-col items-center ${isClickable ? 'cursor-pointer hover:opacity-80' : 'cursor-default'}`}
                onClick={() => isClickable && handleStepClick(stepNumber)}
                role="button"
                tabIndex={isClickable ? 0 : -1}
                aria-current={isActive ? 'step' : undefined}
                aria-label={`ステップ ${stepNumber}: ${STEP_METADATA[currentStepKey]?.title} ${isCompleted ? '(完了)' : isActive ? '(現在のステップ)' : '(未完了)'}`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    isClickable && handleStepClick(stepNumber);
                  }
                }}
              >
                <div
                  className={`w-9 h-9 flex items-center justify-center rounded-full transition-all duration-300 ${circleStyle}`}
                  title={`ステップ ${stepNumber}: ${STEP_METADATA[currentStepKey]?.title}`}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <span className="text-sm font-medium">{stepNumber}</span>
                  )}
                </div>
                <div
                  className={`mt-2 text-xs max-w-[80px] text-center transition-colors duration-300 ${textStyle}`}
                >
                  {STEP_METADATA[currentStepKey]?.title}
                  {formStatus === 'required' && REQUIRED_STEPS.includes(stepKey) && (
                    <span className="bg-cyan-100 text-cyan-800 px-1 py-0.5 rounded-sm text-[9px] ml-1">必須</span>
                  )}
                </div>
              </div>
            );
          });
        })()} 
      </div>
      
      {/* 現在のステップ情報 */}
      <div className="text-center mt-2">
        <p className="text-xs text-gray-500">
          {formStatus === 'required' && (
            <span className="bg-cyan-100 text-cyan-800 px-2 py-0.5 rounded-full text-xs mr-2">
              基本登録
            </span>
          )}
          {currentStep < maxSteps 
            ? `ステップ ${currentStep} - 必須項目を入力して「次へ」をクリックしてください`
            : formStatus === 'required'
              ? '最終ステップ - 内容を確認して基本登録を完了してください'
              : '最終ステップ - 内容を確認して申請を完了してください'
          }
        </p>
      </div>
    </div>
  );
};

export default FormProgress;
