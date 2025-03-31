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

// PreviewButtonはエラーが発生するため削除
// 基本登録（第1部）は短いので下書き保存は不要
import MobileFormWrapper from '../registration/MobileFormWrapper';
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
    // 引数なしでlocation.hrefを使用するとキャッシュを強制的にリフレッシュして読み込む
    window.location.href = window.location.origin + '/?refresh=' + Date.now();
  }, []);
  
  // 申請が完了した場合
  if (applicationId) {
    // 認証情報にアテンダーフラグを設定しておく
    if (user && !user.isAttender) {
      // ローカルストレージのユーザー情報を直接更新
      try {
        const storedUser = localStorage.getItem('echo_user');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          userData.isAttender = true;
          localStorage.setItem('echo_user', JSON.stringify(userData));
          console.info('ローカルストレージのユーザー情報を更新しました (ApplicationForm)');
        }
      } catch (e) {
        console.error('ローカルストレージの更新に失敗しました (ApplicationForm):', e);
      }
    }
    
    // 基本登録成功画面を表示
    return (
      <QuickRegistrationSuccess 
        applicationId={applicationId} 
        onReturnHome={handleReturnHome}
      />
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
      <div className="max-w-4xl mx-auto p-6 bg-mono-white rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-mono-black">アテンダー申請</h1>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowFormHelp(prev => !prev)}
              className="text-mono-black hover:text-mono-gray-dark flex items-center"
            >
              <HelpCircle className="w-5 h-5 mr-1" />
              <span className="hidden sm:inline">ヘルプ</span>
            </button>
            
            <Link
              to="/profile"
              className="text-mono-gray-medium hover:text-mono-gray-dark flex items-center"
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
          <div className="mb-6 p-4 bg-mono-lighter border border-mono-light rounded-md text-mono-black">
            <h3 className="font-medium mb-2 flex items-center text-mono-black">
              <Info className="w-5 h-5 mr-2" />
              申請フォームの入力ガイド
            </h3>
            <div className="text-sm space-y-2 text-mono-gray-dark">
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
            <div className="mt-2 text-xs text-mono-black">
              ご不明な点があれば、<a href="mailto:support@echo.jp" className="underline">support@echo.jp</a> までお問い合わせください。
            </div>
          </div>
        )}
        
        {/* 認証警告 */}
        {showAuthWarning && !isAuthenticated && (
          <div className="mb-6 p-4 bg-mono-lighter border-l-4 border-mono-light rounded-md">
            <div className="flex">
              <AlertTriangle className="w-5 h-5 text-mono-gray-dark mr-3 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-mono-black">ログインが必要です</h3>
                <p className="text-sm text-mono-gray-dark mt-1">
                  アテンダー申請を完了するにはログインが必要です。フォームの入力は続けられますが、提出前にログインしてください。
                </p>
                <button
                  onClick={openLoginModal}
                  className="mt-2 px-4 py-2 bg-mono-black text-mono-white text-sm rounded-md hover:bg-mono-dark transition-colors"
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
            <h2 className="text-lg font-medium text-mono-black">
              {currentStep}. 
              {(() => {
                // ステップキーを取得
                const stepKey = getStepKeyByIndex(currentStep, formStatus);
                return stepKey ? STEP_METADATA[stepKey].title : `ステップ ${currentStep}`;
              })()}
              {formStatus === 'required' && (
                <span className="ml-2 bg-mono-lighter text-mono-dark px-2 py-0.5 rounded-full text-xs">
                  基本登録
                </span>
              )}
            </h2>
            <span className="text-sm text-mono-gray-medium">
              ステップ {currentStep}/{maxSteps}
            </span>
          </div>
          <p className="text-sm text-mono-gray-medium mb-4">
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
        <div className="bg-mono-lighter p-5 rounded-lg border border-mono-light mb-6">
          {renderStep()}
        </div>
        
        {/* エラーメッセージ - 二重表示問題を修正 */}
        {submitError && (
          <div className="mb-6 p-4 bg-mono-lighter border-l-4 border-mono-gray-dark rounded-md">
            <div className="flex">
              <AlertTriangle className="w-5 h-5 text-mono-gray-dark mr-3 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-mono-black">エラーが発生しました</h3>
                <p className="text-sm text-mono-gray-dark mt-1">{submitError}</p>
              </div>
            </div>
          </div>
        )}
        
        {/* APIエラーハンドラー - 二重表示を避けるためにsubmitErrorがない場合のみ表示 */}
        {!submitError && <ApiErrorHandler
          error={apiError}
          onRetry={handleSubmit}
          onClose={() => setApiError(null)}
          className="mb-6"
        />}
        
        {/* 進行状況ミニステータス */}
        <div className="mb-4 flex justify-between text-sm text-mono-gray-medium">
          <div>
            {Array.from({ length: maxSteps }).map((_, index) => {
              // 現在のステップキーを取得
              const stepKey = getStepKeyByIndex(index + 1, formStatus);
              return (
                <span 
                  key={index}
                  className={`inline-block w-2 h-2 rounded-full mx-1 ${
                    index + 1 < currentStep 
                      ? 'bg-mono-black' 
                      : index + 1 === currentStep 
                        ? 'bg-mono-dark' 
                        : 'bg-mono-light'
                  }`}
                  title={stepKey ? STEP_METADATA[stepKey].title : `ステップ ${index + 1}`}
                />
              );
            })}
          </div>
          <div>
            {Object.keys(errors).length > 0 && (
              <span className="text-mono-gray-dark flex items-center">
                <AlertTriangle className="w-4 h-4 mr-1" />
                解決が必要なエラーがあります
              </span>
            )}
          </div>
        </div>
        
        {/* ナビゲーションボタン */}
        <div className="flex justify-between">
          <div className="flex space-x-2">
            {/* PreviewButton削除（エラー発生のため） */}
            <button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 1}
              className={`px-4 py-2 rounded-md flex items-center ${
                currentStep === 1
                  ? 'bg-mono-light text-mono-gray-light cursor-not-allowed'
                  : 'bg-mono-lighter text-mono-gray-dark hover:bg-mono-light'
              }`}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              前へ
            </button>
          </div>
          
          <button
            type="button"
            onClick={handleNextClick}
            disabled={!isCurrentStepCompleted || isSubmitting || (!isAuthenticated && currentStep === maxSteps)}
            className={`px-6 py-2 rounded-md flex items-center ${
              !isCurrentStepCompleted || isSubmitting || (!isAuthenticated && currentStep === maxSteps)
                ? 'bg-mono-gray-light text-mono-white cursor-not-allowed'
                : 'bg-mono-black text-mono-white hover:bg-mono-dark'
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
        
        {/* 下書きセーバー表示 - 基本登録（第1部）では不要のため削除 */}
      </div>
    </MobileFormWrapper>
    </>
  );
};

export default AttenderApplicationFormWrapper;