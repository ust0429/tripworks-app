/**
 * アテンダー申請フォーム
 * 
 * マルチステップフォームの制御と表示を行う
 * フォームの各ステップを管理し、必要な情報が入力されているかを検証し、申請データを送信する
 */
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  navigateTo, 
  navigateToProfile, 
  navigateToHome, 
  cancelWithConfirmation 
} from '../../../utils/navigation';
import { 
  AttenderApplicationProvider, 
  useAttenderApplication 
} from '../../../contexts/AttenderApplicationContext';
import { AttenderApplicationData } from '../../../types/attender/index';
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
import QuickRegistrationSuccess from './QuickRegistrationSuccess';
import { useAuth } from '../../../AuthComponents';
import { AlertTriangle, Info, ArrowLeft, ArrowRight, Loader2, HelpCircle, User, Eye } from 'lucide-react';

// 以前のステップメタデータは削除し、constants/applicationSteps.tsからインポートしたものを使用する
import { 
  REQUIRED_STEPS, 
  OPTIONAL_STEPS, 
  STEP_METADATA, 
  StepKey, 
  getStepKeyByIndex,
  getStepsForStatus
} from '../../../constants/applicationSteps';

import PreviewButton from './PreviewButton';
import DraftSaver from './DraftSaver';
import MobileFormWrapper from '../../../../components/attender/registration/MobileFormWrapper';
import ProgressReportContainer from './ProgressReportContainer';
import TutorialManager from './TutorialManager';
import ApiErrorHandler from './ApiErrorHandler';

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
    isSavingDraft,
    lastSaved,
    submitForm,
    saveDraft,
    isStepCompleted,
    errors,
    formData,
    updateFormData,
    clearAllErrors,
    formStatus,
    setFormStatus
  } = useAttenderApplication();
  
  const navigate = useNavigate();
  const { isAuthenticated, openLoginModal, user } = useAuth();
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<any | null>(null);
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
      setApiError(null); // APIエラーもクリア
      console.info('アテンダー申請を送信しています...');
      
      // 送信前に最終確認
      if (Object.keys(errors).length > 0) {
        setSubmitError('申請内容にエラーがあります。各ステップを確認してください。');
        return;
      }
      
      // フォーム状態に応じたデータの準備
      let completeFormData;
      
      if (formStatus === 'required') {
        // 必須情報のみ送信
        completeFormData = {
          name: formData.name!,
          email: formData.email!,
          phoneNumber: formData.phoneNumber!,
          location: formData.location!,
          biography: formData.biography!,
          isLocalResident: formData.isLocalResident === true,
          isMigrant: formData.isMigrant === true,
          identificationDocument: formData.identificationDocument!,
          agreements: formData.agreements!,
          // 最低限の空の配列を設定
          specialties: formData.specialties || [],
          languages: formData.languages || [],
          // 必要な場合は任意フィールドを追加
          yearsMoved: formData.yearsMoved,
          previousLocation: formData.previousLocation,
          // フォーム状態を明示的に設定
          formStatus: 'required' as const
        };
        
        // 存在する場合は任意情報を設定する必要がなくなったのでコメントアウト
        // if (formData.yearsMoved) completeFormData.yearsMoved = formData.yearsMoved;
        // if (formData.previousLocation) completeFormData.previousLocation = formData.previousLocation;
        
      } else {
        // 全情報の場合
        completeFormData = {
          ...formData as Partial<AttenderApplicationData>,
          // 以下のフィールドは必須なので存在しない場合はエラーになるはず
          name: formData.name!,
          email: formData.email!,
          phoneNumber: formData.phoneNumber!,
          location: formData.location!,
          biography: formData.biography!,
          specialties: formData.specialties || [],
          languages: formData.languages || [],
          isLocalResident: formData.isLocalResident === true,
          isMigrant: formData.isMigrant === true,
          expertise: formData.expertise || [],
          experienceSamples: formData.experienceSamples || [],
          availableTimes: formData.availableTimes || [],
          identificationDocument: formData.identificationDocument!,
          agreements: formData.agreements!,
          // フォーム状態を明示的に設定
          formStatus: 'completed' as const
        };
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
            isMigrant: formData.isMigrant,
            formStatus: formStatus // 現在のフォーム状態を送信
          });
        }
      } catch (analyticsError) {
        console.warn('分析イベント送信エラー:', analyticsError);
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '申請の送信中にエラーが発生しました';
      setSubmitError(errorMessage);
      setApiError(error); // APIエラーを設定
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
    navigateToHome();
  }, []);
  
  // 申請が完了した場合
  if (applicationId) {
    // フォーム状態に応じて異なる成功画面を表示
    return formStatus === 'required' ? (
      <QuickRegistrationSuccess 
        applicationId={applicationId} 
        onReturnHome={handleReturnHome} 
        onContinueSetup={() => {
          // 全情報フォームに切り替え
          setFormStatus('optional');
          setApplicationId(null); // 申請 IDをクリアして続きから入力できるようにする
          goToStep(4); // 最初の任意ステップ（専門分野）に移動
        }}
      />
    ) : (
      <SubmitSuccess applicationId={applicationId} onReturnHome={handleReturnHome} />
    );
  }
  
  // 現在のステップに応じてコンポーネントを表示
  const renderStep = () => {
    // 必須ステップ/任意ステップの定義に基づいてコンポーネントを表示
    // REQUIRED_STEPS = ['BasicInfo', 'Identification', 'Agreements']
    // OPTIONAL_STEPS = ['Expertise', 'ExperienceSamples', 'Availability']
    
    if (formStatus === 'required') {
      // 必須情報フェーズ
      switch (currentStep) {
        case 1:
          return <BasicInfoStep onNext={nextStep} />;
        case 2:
          return <IdentificationStep onNext={nextStep} onBack={prevStep} />;
        case 3:
          return <AgreementsStep onNext={nextStep} onBack={prevStep} />;
        default:
          return <div>不明なステップ</div>;
      }
    } else {
      // 任意情報フェーズ（すべてのステップ）
      switch (currentStep) {
        case 1:
          return <BasicInfoStep onNext={nextStep} />;
        case 2:
          return <IdentificationStep onNext={nextStep} onBack={prevStep} />;
        case 3:
          return <AgreementsStep onNext={nextStep} onBack={prevStep} />;
        case 4:
          return <ExpertiseStep onNext={nextStep} onBack={prevStep} />;
        case 5:
          return <ExperienceSamplesStep onNext={nextStep} onBack={prevStep} />;
        case 6:
          return <AvailabilityStep onNext={nextStep} onBack={prevStep} />;
        default:
          return <div>不明なステップ</div>;
      }
    }
  };

  return (
    <>
      <TutorialManager />
      <MobileFormWrapper
      currentStep={currentStep}
      maxSteps={maxSteps}
      formStatus={formStatus}
      onNavigate={goToStep}
      isStepCompleted={isStepCompleted}
    >
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
              onClick={(e) => {
                // イベントを処理
                e.preventDefault();
                
                // 確認ダイアログを表示
                const confirmed = window.confirm('プロフィールページに移動しますか？ 入力中のデータは保存されません。');
                if (confirmed) {
                  // マイページへ移動 - ルートからの絶対パスを使用
                  navigateToProfile();
                }
              }}
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
              {currentStep}. 
              {(() => {
                // ステップキーを取得
                const stepKey = getStepKeyByIndex(currentStep, formStatus);
                return stepKey ? STEP_METADATA[stepKey].title : `ステップ ${currentStep}`;
              })()}
              {formStatus === 'required' && (
                <span className="ml-2 bg-cyan-100 text-cyan-800 px-2 py-0.5 rounded-full text-xs">
                  基本登録
                </span>
              )}
            </h2>
            <span className="text-sm text-gray-500">
              ステップ {currentStep}/{maxSteps}
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            {(() => {
              // ステップキーを取得
              const stepKey = getStepKeyByIndex(currentStep, formStatus);
              return stepKey ? STEP_METADATA[stepKey].description : '';
            })()}
          </p>
          <FormProgress 
            currentStep={currentStep} 
            maxSteps={maxSteps} 
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
        
        {/* APIエラーハンドラー */}
        <ApiErrorHandler
          error={apiError}
          onRetry={handleSubmit}
          onClose={() => setApiError(null)}
          className="mb-6"
        />
        
        {/* 進行状況ミニステータス */}
        <div className="mb-4 flex justify-between text-sm text-gray-500">
          <div>
            {Array.from({ length: maxSteps }).map((_, index) => {
              // 現在のステップキーを取得
              const stepKey = getStepKeyByIndex(index + 1, formStatus);
              return (
                <span 
                  key={index}
                  className={`inline-block w-2 h-2 rounded-full mx-1 ${
                    index + 1 < currentStep 
                      ? 'bg-green-500' 
                      : index + 1 === currentStep 
                        ? 'bg-blue-500' 
                        : 'bg-gray-300'
                  }`}
                  title={stepKey ? STEP_METADATA[stepKey].title : `ステップ ${index + 1}`}
                />
              );
            })}
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
          <div className="flex space-x-2">
            {currentStep === maxSteps && (
              <PreviewButton 
                formData={formData} 
                isFormValid={isCurrentStepCompleted} 
              />
            )}
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
              onClick={() => {
                // キャンセル確認とナビゲーション
                cancelWithConfirmation('入力内容が保存されずに失われますが、申請をキャンセルしますか？');
              }}
              className="px-4 py-2 rounded-md border border-red-300 text-red-600 hover:bg-red-50"
            >
              キャンセル
            </button>
          </div>
          
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
            ) : formStatus === 'required' ? (
              '基本登録を完了する'
            ) : (
              '申請を完了する'
            )}
          </button>
        </div>
        
        {/* 下書きセーバー表示 */}
        <div className="mt-4">
          <DraftSaver 
            formData={formData} 
            onSave={saveDraft} 
          />
        </div>
        
        {/* ボタン表示の後、進捗レポートを追加 */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="text-lg font-medium mb-4">申請進捗状況</h3>
          <ProgressReportContainer />
        </div>
      </div>
    </MobileFormWrapper>
    </>
  );
};

export default AttenderApplicationFormWrapper;