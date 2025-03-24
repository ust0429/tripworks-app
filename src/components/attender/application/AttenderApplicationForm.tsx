/**
 * アテンダー申請フォーム
 * 
 * マルチステップフォームの制御と表示を行う
 * フォームの各ステップを管理し、必要な情報が入力されているかを検証し、申請データを送信する
 */
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
import { AlertTriangle, Info, ArrowLeft, ArrowRight, Loader2, HelpCircle, User } from 'lucide-react';

// ステップのメタデータ
const STEP_METADATA = [
  { title: '基本情報', description: '個人情報とプロフィール' },
  { title: '専門分野', description: '専門知識と言語スキル' },
  { title: '体験サンプル', description: '提供できる体験の例' },
  { title: '利用可能時間', description: '活動可能な時間帯' },
  { title: '本人確認', description: '身分証明書の提出' },
  { title: '同意事項', description: '規約と条件の確認' }
];

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
    goToStep,
    isSubmitting,
    submitForm,
    isStepCompleted,
    errors,
    formData,
    updateFormData,
    clearAllErrors
  } = useAttenderApplication();
  
  const navigate = useNavigate();
  const { isAuthenticated, openLoginModal, user } = useAuth();
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showAuthWarning, setShowAuthWarning] = useState<boolean>(false);
  const [showFormHelp, setShowFormHelp] = useState<boolean>(false);
  
  // ログイン状態に応じた処理
  useEffect(() => {
    if (!isAuthenticated) {
      setShowAuthWarning(true);
    } else {
      setShowAuthWarning(false);
      
      // ログインしている場合、基本情報にユーザー情報を事前設定
      if (user && currentStep === 1) {
        if (user.name && !formData.name) {
          updateFormData({ name: user.name });
        }
        if (user.email && !formData.email) {
          updateFormData({ email: user.email });
        }
      }
    }
  }, [isAuthenticated, user, currentStep, formData, updateFormData]);
  
  // ステップ変更時にエラーをクリア
  useEffect(() => {
    // ステップが変わったときに前ステップのエラーが残らないようにする
    clearAllErrors();
  }, [currentStep, clearAllErrors]);
  
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
      
      // 送信前に最終確認
      if (Object.keys(errors).length > 0) {
        setSubmitError('申請内容にエラーがあります。各ステップを確認してください。');
        return;
      }
      
      const id = await submitForm();
      console.info(`申請ID: ${id} が正常に作成されました`);
      
      // 成功したらIDをセット
      setApplicationId(id);
      
      // 分析イベントがあれば送信（実装があれば）
      try {
        const analyticsAny = window as any;
        if (analyticsAny.analytics) {
          analyticsAny.analytics.track('AttenderApplication_Submitted', {
            applicationId: id,
            userId: user?.id,
            specialties: formData.specialties,
            isLocalResident: formData.isLocalResident,
            isMigrant: formData.isMigrant
          });
        }
      } catch (analyticsError) {
        console.warn('分析イベント送信エラー:', analyticsError);
      }
      
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
  const handleReturnHome = useCallback(() => {
    navigate('/');
  }, [navigate]);
  
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
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">アテンダー申請</h1>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowFormHelp(prev => !prev)}
            className="text-blue-500 hover:text-blue-700 flex items-center"
          >
            <HelpCircle className="w-5 h-5 mr-1" />
            <span className="hidden sm:inline">ヘルプ</span>
          </button>
          
          <Link
            to="/profile"
            className="text-gray-500 hover:text-gray-700 flex items-center"
          >
            <User className="w-5 h-5 mr-1" />
            <span className="hidden sm:inline">マイページ</span>
          </Link>
        </div>
      </div>
      
      {/* ヘルプ情報 */}
      {showFormHelp && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md text-blue-800">
          <h3 className="font-medium mb-2 flex items-center">
            <Info className="w-5 h-5 mr-2" />
            申請フォームの入力ガイド
          </h3>
          <div className="text-sm space-y-2">
            <p>
              このフォームでは、アテンダーとして登録するために必要な情報を段階的に入力していきます。
            </p>
            <p>
              各ステップで必須項目をすべて入力すると「次へ」ボタンが有効になります。必須項目は「*」マークで示されています。
            </p>
            <p>
              申請内容は一時的に保存されますが、最終的な送信は最後のステップで行います。送信前に内容を確認してください。
            </p>
            <p>
              身分証明書のアップロードでは、有効期限内の公的身分証明書が必要です。写真や文字が明確に見えるようにしてください。
            </p>
          </div>
          <div className="mt-2 text-xs text-blue-600">
            ご不明な点があれば、<a href="mailto:support@echo.jp" className="underline">support@echo.jp</a> までお問い合わせください。
          </div>
        </div>
      )}
      
      {/* 認証警告 */}
      {showAuthWarning && !isAuthenticated && (
        <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-md">
          <div className="flex">
            <AlertTriangle className="w-5 h-5 text-yellow-500 mr-3 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-yellow-800">ログインが必要です</h3>
              <p className="text-sm text-yellow-700 mt-1">
                アテンダー申請を完了するにはログインが必要です。フォームの入力は続けられますが、提出前にログインしてください。
              </p>
              <button
                onClick={openLoginModal}
                className="mt-2 px-4 py-2 bg-yellow-500 text-white text-sm rounded-md hover:bg-yellow-600 transition-colors"
              >
                ログイン / 新規登録
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* 進行状況 */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-medium">
            {currentStep}. {STEP_METADATA[currentStep - 1]?.title}
          </h2>
          <span className="text-sm text-gray-500">
            ステップ {currentStep}/{maxSteps}
          </span>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          {STEP_METADATA[currentStep - 1]?.description}
        </p>
        <FormProgress 
          currentStep={currentStep} 
          maxSteps={maxSteps} 
          stepLabels={STEP_METADATA.map(step => step.title)}
          onStepClick={(step) => {
            // 前のステップには自由に移動可能
            if (step < currentStep) {
              goToStep(step);
            }
          }}
        />
      </div>
      
      {/* 現在のステップのフォーム */}
      <div className="bg-gray-50 p-5 rounded-lg border border-gray-200 mb-6">
        {renderStep()}
      </div>
      
      {/* エラーメッセージ */}
      {submitError && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-md">
          <div className="flex">
            <AlertTriangle className="w-5 h-5 text-red-500 mr-3 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-red-800">エラーが発生しました</h3>
              <p className="text-sm text-red-700 mt-1">{submitError}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* 進行状況ミニステータス */}
      <div className="mb-4 flex justify-between text-sm text-gray-500">
        <div>
          {Array.from({ length: maxSteps }).map((_, index) => (
            <span 
              key={index}
              className={`inline-block w-2 h-2 rounded-full mx-1 ${
                index + 1 < currentStep 
                  ? 'bg-green-500' 
                  : index + 1 === currentStep 
                    ? 'bg-blue-500' 
                    : 'bg-gray-300'
              }`}
              title={STEP_METADATA[index]?.title}
            />
          ))}
        </div>
        <div>
          {Object.keys(errors).length > 0 && (
            <span className="text-red-500 flex items-center">
              <AlertTriangle className="w-4 h-4 mr-1" />
              解決が必要なエラーがあります
            </span>
          )}
        </div>
      </div>
      
      {/* ナビゲーションボタン */}
      <div className="flex justify-between">
        <button
          type="button"
          onClick={prevStep}
          disabled={currentStep === 1}
          className={`px-4 py-2 rounded-md flex items-center ${
            currentStep === 1
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          前へ
        </button>
        
        <button
          type="button"
          onClick={handleNextClick}
          disabled={!isCurrentStepCompleted || isSubmitting || (!isAuthenticated && currentStep === maxSteps)}
          className={`px-6 py-2 rounded-md flex items-center ${
            !isCurrentStepCompleted || isSubmitting || (!isAuthenticated && currentStep === maxSteps)
              ? 'bg-blue-300 text-white cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              送信中...
            </>
          ) : currentStep < maxSteps ? (
            <>
              次へ
              <ArrowRight className="w-4 h-4 ml-2" />
            </>
          ) : (
            '申請を完了する'
          )}
        </button>
      </div>
      
      {/* フォーム保存状態通知 */}
      <div className="mt-4 text-center">
        <p className="text-xs text-gray-500">
          フォームの入力内容は自動的に保存されます。後でログインして続きから入力することもできます。
        </p>
      </div>
    </div>
  );
};

export default AttenderApplicationFormWrapper;
