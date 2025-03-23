/**
 * アテンダー申請フォーム
 * 
 * マルチステップフォームの制御と表示を行う
 * フォームの各ステップを管理し、必要な情報が入力されているかを検証し、申請データを送信する
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { useAuth } from '../../../AuthComponents';

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
    errors,
    formData,
    updateFormData
  } = useAttenderApplication();
  
  const navigate = useNavigate();
  const { isAuthenticated, openLoginModal, user } = useAuth();
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showAuthWarning, setShowAuthWarning] = useState<boolean>(false);
  
  // 認証が必要な場合は警告を表示
  useEffect(() => {
    // ユーザーがログインしていない場合、警告を表示
    if (!isAuthenticated) {
      setShowAuthWarning(true);
    } else {
      // ログインしている場合、基本情報にユーザー情報を事前設定
      if (user && currentStep === 1 && !formData.name) {
        // 基本情報がまだ設定されていない場合はユーザー情報から自動入力
        if (user.name) {
          updateFormData({ name: user.name });
        }
        if (user.email) {
          updateFormData({ email: user.email });
        }
      }
    }
  }, [isAuthenticated, user, currentStep, formData.name, updateFormData]);
  
  // フォーム送信処理
  const handleSubmit = async () => {
    // ユーザーが認証されていない場合はログインを促す
    if (!isAuthenticated) {
      setSubmitError('申請を送信するにはログインが必要です');
      openLoginModal();
      return;
    }
    
    try {
      setSubmitError(null);
      console.info('アテンダー申請を送信しています...');
      const id = await submitForm();
      console.info(`申請ID: ${id} が正常に作成されました`);
      setApplicationId(id);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '申請の送信中にエラーが発生しました';
      setSubmitError(errorMessage);
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
  
  // ホームに戻る
  const handleReturnHome = () => {
    navigate('/');
  }
  
  // 申請が完了した場合
  if (applicationId) {
    return <SubmitSuccess applicationId={applicationId} onReturnHome={handleReturnHome} />;
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
      
      {/* 認証警告 */}
      {showAuthWarning && !isAuthenticated && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-800">
          <h3 className="font-medium mb-2">ログインしていません</h3>
          <p className="text-sm mb-3">
            アテンダー申請を進めるには、ログインが必要です。申請する前にログインしてください。
          </p>
          <button
            onClick={openLoginModal}
            className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors"
          >
            ログイン / 新規登録
          </button>
        </div>
      )}
      
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
          disabled={!isCurrentStepCompleted || isSubmitting || (!isAuthenticated && currentStep === maxSteps)}
          className={`px-4 py-2 rounded-md ${
            !isCurrentStepCompleted || isSubmitting || (!isAuthenticated && currentStep === maxSteps)
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
