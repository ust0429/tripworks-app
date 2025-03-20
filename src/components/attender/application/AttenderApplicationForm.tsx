/**
 * アテンダー申請フォーム
 * 
 * マルチステップフォームの制御と表示を行う
 */
import React, { useState } from 'react';
import { 
  AttenderApplicationProvider, 
  useAttenderApplication 
} from '../../../contexts/AttenderApplicationContext';
import {
  BasicInfoStep,
  ExpertiseStep,
  ExperienceSamplesStep,
  AvailabilityStep,
  IdentificationStep,
  AgreementsStep
} from './steps';
import FormProgress from './FormProgress';
import SubmitSuccess from './SubmitSuccess';

// アテンダー申請フォームのラッパーコンポーネント
const AttenderApplicationFormWrapper: React.FC = () => {
  return (
    <AttenderApplicationProvider>
      <AttenderApplicationFormContent />
    </AttenderApplicationProvider>
  );
};

// フォームのコンテンツ（コンテキストを利用）
const AttenderApplicationFormContent: React.FC = () => {
  const { 
    currentStep, 
    maxSteps, 
    prevStep, 
    nextStep, 
    isSubmitting,
    submitForm,
    isStepCompleted,
    errors
  } = useAttenderApplication();
  
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  
  // フォーム送信処理
  const handleSubmit = async () => {
    try {
      setSubmitError(null);
      const id = await submitForm();
      setApplicationId(id);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : '申請の送信中にエラーが発生しました');
      console.error('申請送信エラー:', error);
    }
  };
  
  // 現在のステップが完了しているか
  const isCurrentStepCompleted = isStepCompleted(currentStep);
  
  // 次へボタンのクリックハンドラ
  const handleNextClick = () => {
    if (currentStep < maxSteps) {
      nextStep();
    } else if (isCurrentStepCompleted) {
      handleSubmit();
    }
  };
  
  // 申請が完了した場合
  if (applicationId) {
    return <SubmitSuccess applicationId={applicationId} />;
  }
  
  // 現在のステップに応じてコンポーネントを表示
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <BasicInfoStep onNext={nextStep} />;
      case 2:
        return <ExpertiseStep onNext={nextStep} onBack={prevStep} />;
      case 3:
        return <ExperienceSamplesStep onNext={nextStep} onBack={prevStep} />;
      case 4:
        return <AvailabilityStep onNext={nextStep} onBack={prevStep} />;
      case 5:
        return <IdentificationStep onNext={nextStep} onBack={prevStep} />;
      case 6:
        return <AgreementsStep onNext={nextStep} onBack={prevStep} />;
      default:
        return <div>不明なステップ</div>;
    }
  };
  
  return (
    <div className="max-w-4xl mx-auto p-4 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-center mb-6">アテンダー申請</h1>
      
      {/* 進行状況バー */}
      <FormProgress currentStep={currentStep} maxSteps={maxSteps} />
      
      {/* 現在のステップのフォーム */}
      <div className="mt-8">
        {renderStep()}
      </div>
      
      {/* エラーメッセージ */}
      {submitError && (
        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
          {submitError}
        </div>
      )}
      
      {/* ナビゲーションボタン */}
      <div className="mt-8 flex justify-between">
        <button
          type="button"
          onClick={prevStep}
          disabled={currentStep === 1}
          className={`px-4 py-2 rounded-md ${
            currentStep === 1
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-gray-500 text-white hover:bg-gray-600'
          }`}
        >
          前へ
        </button>
        
        <button
          type="button"
          onClick={handleNextClick}
          disabled={!isCurrentStepCompleted || isSubmitting}
          className={`px-4 py-2 rounded-md ${
            !isCurrentStepCompleted || isSubmitting
              ? 'bg-blue-300 cursor-not-allowed'
              : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
        >
          {isSubmitting ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              処理中...
            </span>
          ) : currentStep < maxSteps ? (
            '次へ'
          ) : (
            '申請する'
          )}
        </button>
      </div>
    </div>
  );
};

export default AttenderApplicationFormWrapper;
