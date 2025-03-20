/**
 * フォーム進行状況コンポーネント
 * 
 * マルチステップフォームの進行状況を表示
 */
import React from 'react';
import { useAttenderApplication } from '../../../contexts/AttenderApplicationContext';

interface FormProgressProps {
  currentStep: number;
  maxSteps: number;
}

const FormProgress: React.FC<FormProgressProps> = ({ currentStep, maxSteps }) => {
  const { goToStep, isStepCompleted } = useAttenderApplication();
  
  // ステップのラベル
  const stepLabels = [
    '基本情報',
    '専門分野',
    '体験サンプル',
    '活動時間',
    '身分証明',
    '同意事項'
  ];
  
  // ステップのクリックハンドラ
  const handleStepClick = (step: number) => {
    // 完了したステップにのみ移動可能
    if (step < currentStep || isStepCompleted(step - 1)) {
      goToStep(step);
    }
  };
  
  // 進行率の計算
  const progressPercentage = ((currentStep - 1) / (maxSteps - 1)) * 100;
  
  return (
    <div className="mb-8">
      {/* プログレスバー */}
      <div className="relative pt-1">
        <div className="flex mb-2 items-center justify-between">
          <div>
            <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-200">
              進行状況
            </span>
          </div>
          <div className="text-right">
            <span className="text-xs font-semibold inline-block text-blue-600">
              {currentStep} / {maxSteps}
            </span>
          </div>
        </div>
        <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-200">
          <div
            style={{ width: `${progressPercentage}%` }}
            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500 transition-all duration-500"
          ></div>
        </div>
      </div>
      
      {/* ステップインジケーター */}
      <div className="flex justify-between">
        {stepLabels.map((label, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber === currentStep;
          const isCompleted = stepNumber < currentStep || isStepCompleted(stepNumber);
          const isClickable = stepNumber < currentStep || isStepCompleted(stepNumber - 1);
          
          return (
            <div
              key={stepNumber}
              className={`flex flex-col items-center ${isClickable ? 'cursor-pointer' : 'cursor-not-allowed'}`}
              onClick={() => isClickable && handleStepClick(stepNumber)}
            >
              <div
                className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors duration-200 ${
                  isActive
                    ? 'bg-blue-600 text-white border-2 border-blue-600'
                    : isCompleted
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {isCompleted && !isActive ? (
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : (
                  stepNumber
                )}
              </div>
              <div
                className={`mt-2 text-xs text-center ${
                  isActive ? 'text-blue-600 font-semibold' : 'text-gray-600'
                }`}
              >
                {label}
              </div>
            </div>
          );
        })}
      </div>
      
      {/* ステップ間の線 */}
      <div className="hidden sm:block absolute top-0 left-0 w-full">
        <div className="h-1 bg-gray-200">
          <div
            className="h-1 bg-blue-500 transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default FormProgress;
