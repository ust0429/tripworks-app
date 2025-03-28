import React from 'react';
import { useAttenderApplication } from '../../../contexts/AttenderApplicationContext';
import { Check, AlertCircle, Clock } from 'lucide-react';
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
  const { goToStep, isStepCompleted, formStatus, errors } = useAttenderApplication();
  
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
  
  // 各ステップのエラーを確認
  const getStepErrorStatus = (stepNumber: number) => {
    const stepKeys = formStatus === 'required' 
      ? REQUIRED_STEPS 
      : [...REQUIRED_STEPS, ...OPTIONAL_STEPS];
    
    if (stepNumber < 1 || stepNumber > stepKeys.length) return false;
    
    const stepKey = stepKeys[stepNumber - 1] as StepKey;
    
    // 各ステップに関連するフィールドのエラーをチェック
    const fieldErrors = Object.keys(errors);
    
    switch (stepKey) {
      case 'BasicInfo':
        return fieldErrors.some(field => 
          ['name', 'email', 'phoneNumber', 'location', 'biography', 'isLocalResident', 'isMigrant'].includes(field) ||
          field.startsWith('location.')
        );
      case 'Identification':
        return fieldErrors.some(field => 
          field === 'identificationDocument' || field.startsWith('identificationDocument.')
        );
      case 'Agreements':
        return fieldErrors.some(field => 
          field === 'agreements' || field.startsWith('agreements.')
        );
      case 'Expertise':
        return fieldErrors.some(field => 
          ['specialties', 'languages', 'expertise'].includes(field) || 
          field.startsWith('expertise[')
        );
      case 'ExperienceSamples':
        return fieldErrors.some(field => 
          field === 'experienceSamples' || field.startsWith('experienceSamples[')
        );
      case 'Availability':
        return fieldErrors.some(field => 
          field === 'availableTimes' || field.startsWith('availableTimes[')
        );
      default:
        return false;
    }
  };
  
  // 完了ステップの数をカウント
  const completedSteps = Array.from({ length: maxSteps }).filter((_, index) => 
    index + 1 < currentStep || isStepCompleted(index + 1)
  ).length;
  
  return (
    <div className="relative mb-8">
      {/* プログレスバー */}
      <div className="pt-1 mb-6">
        <div className="flex mb-1 items-center justify-between">
          <div className="flex items-center">
            <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-mono-black bg-mono-lighter mr-2">
              進行状況
            </span>
            <span className="text-xs text-mono-gray-medium">
              {completedSteps}/{maxSteps} ステップ完了
            </span>
          </div>
          <div className="text-right">
            <span className="text-xs font-semibold inline-block text-mono-black">
              {Math.round(progressPercentage)}% 完了
            </span>
          </div>
        </div>
        <div className="overflow-hidden h-2 text-xs flex rounded-full bg-mono-lighter">
          <div
            style={{ width: `${progressPercentage}%` }}
            className="shadow-none flex flex-col text-center whitespace-nowrap text-mono-white justify-center bg-mono-black transition-all duration-500 ease-in-out rounded-full"
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
        <div className="absolute h-0.5 bg-mono-light top-4 left-0 right-0 -z-10"></div>
        
        {/* 接続線（進行中） */}
        <div 
          className="absolute h-0.5 bg-mono-black top-4 left-0 -z-10 transition-all duration-500 ease-in-out"
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
            const hasError = getStepErrorStatus(stepNumber);
            const currentStepKey = stepKey as StepKey;
            
            // 各ステップの状態に応じたスタイル
            let circleStyle = '';
            let icon: React.ReactNode = null;
            
            if (hasError) {
              circleStyle = 'bg-mono-lighter text-mono-gray-dark border-2 border-mono-gray-dark';
              icon = <AlertCircle className="w-4 h-4" />;
            } else if (isActive) {
              circleStyle = 'bg-mono-black text-mono-white border-2 border-mono-black ring-4 ring-mono-lighter';
              icon = <span className="text-sm font-medium">{stepNumber}</span>;
            } else if (isCompleted) {
              circleStyle = 'bg-mono-black text-mono-white border-2 border-mono-black';
              icon = <Check className="w-4 h-4" />;
            } else if (isPending) {
              circleStyle = 'bg-mono-white text-mono-gray-light border-2 border-mono-light';
              icon = <Clock className="w-4 h-4" />;
            }
              
            const textStyle = isActive
              ? 'text-mono-black font-semibold'
              : isCompleted
                ? 'text-mono-black'
                : hasError
                  ? 'text-mono-gray-dark'
                  : 'text-mono-gray-medium';
            
            // ステップの完了・エラー状況を表すバッジ
            let badge: React.ReactNode = null;
            if (formStatus === 'required' && REQUIRED_STEPS.includes(stepKey)) {
              badge = (
                <span className="bg-mono-lighter text-mono-black px-1 py-0.5 rounded-sm text-[9px] ml-1">必須</span>
              );
            } else if (hasError) {
              badge = (
                <span className="bg-mono-lighter text-mono-gray-dark px-1 py-0.5 rounded-sm text-[9px] ml-1">エラー</span>
              );
            } else if (isCompleted) {
              badge = (
                <span className="bg-mono-lighter text-mono-black px-1 py-0.5 rounded-sm text-[9px] ml-1">完了</span>
              );
            }
            
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
                  {icon}
                </div>
                <div
                  className={`mt-2 text-xs max-w-[80px] text-center transition-colors duration-300 ${textStyle}`}
                >
                  {STEP_METADATA[currentStepKey]?.title}
                  {badge}
                </div>
              </div>
            );
          });
        })()} 
      </div>
      
      {/* 現在のステップ情報 */}
      <div className="text-center mt-4 bg-mono-lighter p-3 rounded-md border border-mono-light">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
          {formStatus === 'required' && (
            <span className="bg-mono-lighter text-mono-dark px-2 py-0.5 rounded-full text-xs">
              基本登録
            </span>
          )}
          <p className="text-sm text-mono-gray-dark">
            {currentStep < maxSteps 
              ? `ステップ ${currentStep} - ${STEP_METADATA[
                  (formStatus === 'required' ? REQUIRED_STEPS : [...REQUIRED_STEPS, ...OPTIONAL_STEPS])[currentStep - 1] as StepKey
                ]?.title}を入力してください`
              : formStatus === 'required'
                ? '最終ステップ - 内容を確認して基本登録を完了してください'
                : '最終ステップ - 内容を確認して申請を完了してください'
            }
          </p>
        </div>
        
        <div className="mt-2 text-xs text-mono-gray-medium">
          {formStatus === 'required' 
            ? '基本情報のみで登録可能です。詳細情報は後から入力できます。'
            : '全ての情報を入力して申請を完了します。'
          }
        </div>
      </div>
    </div>
  );
};

export default FormProgress;