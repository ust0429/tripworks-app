/**
 * アテンダー登録機能を扱うカスタムフック
 */
import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  AttenderApplicationData, 
  FormStatusType, 
  ApplicationStepType,
  StepCompletionStatus 
} from '../types/attender/application';
import { 
  saveDraftApplication, 
  submitAttenderApplication,
  getDraftApplication,
  checkApplicationStatus
} from '../services/AttenderService';

// 初期ステップ完了状態
const initialStepCompletion: StepCompletionStatus = {
  personal: false,
  profile: false,
  expertise: false,
  experiences: false,
  availability: false,
  review: false
};

// 初期アプリケーションデータ
const createInitialApplicationData = (userId: string): AttenderApplicationData => ({
  userId,
  personalInfo: {
    name: '',
    email: '',
    phone: '',
  },
  bio: '',
  specialties: [],
  languages: [],
  experienceSamples: [],
  residencyInfo: {
    isLocalResident: false,
    isMigrant: false,
  },
  expertise: [],
  status: 'draft',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

/**
 * アテンダー登録機能を提供するカスタムフック
 */
export const useAttenderRegistration = () => {
  const { user } = useAuth();
  const userId = user?.uid || '';
  
  // フォームのローカル保存用
  const [formData, setFormData] = useState<AttenderApplicationData>(
    createInitialApplicationData(userId)
  );
  
  // 現在のステップ
  const [currentStep, setCurrentStep] = useState<ApplicationStepType>('personal');
  
  // 各ステップの完了状態
  const [stepCompletion, setStepCompletion] = useState<StepCompletionStatus>(initialStepCompletion);
  
  // フォーム送信状態
  const [formStatus, setFormStatus] = useState<FormStatusType>('idle');
  
  // エラーメッセージ
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // ドラフト保存タイマーID
  const [draftTimerId, setDraftTimerId] = useState<NodeJS.Timeout | null>(null);
  
  // 申請状態
  const [applicationStatus, setApplicationStatus] = useState<{
    hasApplication: boolean;
    status?: 'pending' | 'approved' | 'rejected';
    applicationId?: string;
    submittedAt?: string;
    attenderId?: string;
  } | null>(null);
  
  // 申請ID
  const [applicationId, setApplicationId] = useState<string | null>(null);
  
  // アテンダー申請の状態確認
  const checkStatus = useCallback(async () => {
    if (!userId) return;
    
    try {
      const status = await checkApplicationStatus(userId);
      if (status) {
        setApplicationStatus(status);
        
        // 申請IDが存在する場合は保存
        if (status.applicationId) {
          setApplicationId(status.applicationId);
        }
      }
    } catch (error) {
      console.error('申請状態確認エラー:', error);
    }
  }, [userId]);
  
  // 初期化時に申請状態を確認
  useEffect(() => {
    if (userId) {
      checkStatus();
    }
  }, [userId, checkStatus]);
  
  // 初期化時にドラフトデータを取得
  useEffect(() => {
    const fetchDraftData = async () => {
      if (!userId) return;
      
      try {
        const draftData = await getDraftApplication(userId);
        if (draftData) {
          // ドラフトデータをフォームに設定
          setFormData(prevData => ({
            ...prevData,
            ...draftData,
            userId, // ユーザーIDは常に最新のものを使用
          }));
          
          // ステップの完了状態を更新
          updateStepCompletionFromData(draftData);
        }
      } catch (error) {
        console.error('ドラフト取得エラー:', error);
      }
    };
    
    fetchDraftData();
  }, [userId]);
  
  // フォームデータからステップ完了状態を更新
  const updateStepCompletionFromData = (data: Partial<AttenderApplicationData>) => {
    const newStepCompletion = { ...initialStepCompletion };
    
    // パーソナル情報のチェック
    if (
      data.personalInfo?.name && 
      data.personalInfo?.email
    ) {
      newStepCompletion.personal = true;
    }
    
    // プロフィール情報のチェック
    if (
      data.bio && 
      data.bio.length >= 50 &&
      data.specialties && 
      data.specialties.length > 0 &&
      data.languages &&
      data.languages.length > 0
    ) {
      newStepCompletion.profile = true;
    }
    
    // 専門知識のチェック
    if (
      data.expertise && 
      data.expertise.length > 0 &&
      data.expertise.every(exp => exp.category && exp.description)
    ) {
      newStepCompletion.expertise = true;
    }
    
    // 体験サンプルのチェック
    if (
      data.experienceSamples && 
      data.experienceSamples.length > 0 &&
      data.experienceSamples.every(sample => 
        sample.title && 
        sample.description && 
        sample.category &&
        sample.estimatedDuration > 0
      )
    ) {
      newStepCompletion.experiences = true;
    }
    
    setStepCompletion(newStepCompletion);
  };
  
  // フォームデータの更新
  const updateFormData = useCallback((
    fieldPath: string, 
    value: any, 
    shouldSaveDraft: boolean = true
  ) => {
    setFormData(prevData => {
      // ネストされたフィールドの更新
      const paths = fieldPath.split('.');
      const newData = { ...prevData };
      
      let current: any = newData;
      for (let i = 0; i < paths.length - 1; i++) {
        const path = paths[i];
        
        // 配列アクセスの場合
        if (path.includes('[') && path.includes(']')) {
          const arrayName = path.split('[')[0];
          const index = parseInt(path.split('[')[1].split(']')[0]);
          
          if (!current[arrayName]) {
            current[arrayName] = [];
          }
          
          if (!current[arrayName][index]) {
            current[arrayName][index] = {};
          }
          
          current = current[arrayName][index];
        } else {
          // オブジェクトアクセスの場合
          if (!current[path]) {
            current[path] = {};
          }
          current = current[path];
        }
      }
      
      // 最後のプロパティを設定
      const lastPath = paths[paths.length - 1];
      current[lastPath] = value;
      
      // 更新時間を更新
      newData.updatedAt = new Date().toISOString();
      
      return newData;
    });
    
    // ドラフトの自動保存タイマーをリセット
    if (shouldSaveDraft) {
      resetDraftTimer();
    }
  }, []);
  
  // ドラフト保存タイマーのリセット
  const resetDraftTimer = useCallback(() => {
    // 既存のタイマーをクリア
    if (draftTimerId) {
      clearTimeout(draftTimerId);
    }
    
    // 新しいタイマーを設定（60秒後に保存）
    const newTimer = setTimeout(async () => {
      await saveDraft();
    }, 60 * 1000);
    
    setDraftTimerId(newTimer);
  }, [draftTimerId]);
  
  // コンポーネントのアンマウント時にタイマーをクリア
  useEffect(() => {
    return () => {
      if (draftTimerId) {
        clearTimeout(draftTimerId);
      }
    };
  }, [draftTimerId]);
  
  // ドラフトの保存
  const saveDraft = useCallback(async () => {
    if (!userId || !formData) return null;
    
    try {
      // 合意事項などのチェックを追加
      const draftWithDefaults = {
        ...formData,
        userId,
        updatedAt: new Date().toISOString()
      };
      
      // ドラフトを保存
      const draftId = await saveDraftApplication(userId, draftWithDefaults);
      console.log('下書きが保存されました:', draftId);
      return draftId;
    } catch (error) {
      console.error('下書き保存エラー:', error);
      return null;
    }
  }, [userId, formData]);
  
  // 次のステップへ進む
  const goToNextStep = useCallback(() => {
    const steps: ApplicationStepType[] = ['personal', 'profile', 'expertise', 'experiences', 'availability', 'review'];
    const currentIndex = steps.indexOf(currentStep);
    
    if (currentIndex < steps.length - 1) {
      const nextStep = steps[currentIndex + 1];
      setCurrentStep(nextStep);
      
      // 自動保存
      saveDraft();
    }
  }, [currentStep, saveDraft]);
  
  // 前のステップへ戻る
  const goToPreviousStep = useCallback(() => {
    const steps: ApplicationStepType[] = ['personal', 'profile', 'expertise', 'experiences', 'availability', 'review'];
    const currentIndex = steps.indexOf(currentStep);
    
    if (currentIndex > 0) {
      const prevStep = steps[currentIndex - 1];
      setCurrentStep(prevStep);
    }
  }, [currentStep]);
  
  // 特定のステップへ移動
  const goToStep = useCallback((step: ApplicationStepType) => {
    setCurrentStep(step);
  }, []);
  
  // ステップの完了状態を更新
  const updateStepCompletion = useCallback((step: ApplicationStepType, completed: boolean) => {
    setStepCompletion(prev => ({
      ...prev,
      [step]: completed
    }));
  }, []);
  
  // フォームの送信
  const submitApplication = useCallback(async () => {
    if (!userId || !formData) return null;
    
    setFormStatus('submitting');
    setErrorMessage(null);
    
    try {
      // 送信前の最終確認
      const allStepsCompleted = Object.values(stepCompletion).every(completed => completed);
      
      if (!allStepsCompleted) {
        setErrorMessage('すべてのステップを完了してください');
        setFormStatus('error');
        return null;
      }
      
      // 送信データの準備
      const applicationDataToSubmit = {
        ...formData,
        userId,
        status: 'submitted',
        submittedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // アプリケーションを送信
      const applicationId = await submitAttenderApplication(applicationDataToSubmit);
      
      // 送信成功
      setApplicationId(applicationId);
      setFormStatus('submitted');
      
      // 申請状態を更新
      await checkStatus();
      
      return applicationId;
    } catch (error) {
      console.error('申請送信エラー:', error);
      setErrorMessage(error instanceof Error ? error.message : '予期せぬエラーが発生しました');
      setFormStatus('error');
      return null;
    }
  }, [userId, formData, stepCompletion, checkStatus]);
  
  return {
    // 状態
    formData,
    currentStep,
    stepCompletion,
    formStatus,
    errorMessage,
    applicationStatus,
    applicationId,
    
    // ユーティリティ
    updateFormData,
    saveDraft,
    goToNextStep,
    goToPreviousStep,
    goToStep,
    updateStepCompletion,
    submitApplication,
    checkStatus,
    
    // 計算値
    isLoading: formStatus === 'submitting',
    isSubmitted: formStatus === 'submitted',
    hasError: formStatus === 'error',
    isComplete: Object.values(stepCompletion).every(completed => completed),
  };
};

export default useAttenderRegistration;
