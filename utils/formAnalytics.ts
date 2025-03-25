/**
 * フォーム分析ユーティリティ
 * 
 * ユーザーのフォーム入力行動を匿名で収集し、改善のためのデータ分析を可能にします。
 * プライバシーを考慮し、個人特定可能な情報は含まれません。
 */

// イベントタイプの定義
export enum FormAnalyticsEventType {
  FORM_STARTED = 'form_started',
  FORM_STEP_VIEWED = 'form_step_viewed',
  FORM_FIELD_FOCUSED = 'form_field_focused',
  FORM_FIELD_FILLED = 'form_field_filled',
  FORM_FIELD_ERROR = 'form_field_error',
  FORM_STEP_COMPLETED = 'form_step_completed',
  FORM_STEP_BACK = 'form_step_back',
  FORM_SAVED = 'form_saved',
  FORM_RESUMED = 'form_resumed',
  FORM_SUBMITTED = 'form_submitted',
  FORM_ABANDONED = 'form_abandoned',
  HELP_VIEWED = 'help_viewed',
  TUTORIAL_STEP_VIEWED = 'tutorial_step_viewed',
  TUTORIAL_COMPLETED = 'tutorial_completed',
  TUTORIAL_SKIPPED = 'tutorial_skipped',
  PREVIEW_VIEWED = 'preview_viewed',
  ERROR_ENCOUNTERED = 'error_encountered'
}

// イベントプロパティの型
interface FormAnalyticsEventProps {
  formId?: string;
  stepId?: string | number;
  stepName?: string;
  fieldId?: string;
  fieldType?: string;
  errorType?: string;
  errorMessage?: string;
  timeSpent?: number;
  completionRate?: number;
  deviceType?: string;
  [key: string]: any; // 追加のプロパティを許可
}

// セッション情報
let sessionStartTime: number;
let currentStepStartTime: number;
let currentFormId: string | undefined;
let previousStepId: string | number | undefined;
let isAnalyticsEnabled = false;

/**
 * フォーム分析を初期化
 * @param formId フォーム識別子
 */
export function initFormAnalytics(formId: string): void {
  try {
    // ローカルストレージから分析設定を取得
    const analyticsSettings = localStorage.getItem('echo_analytics_settings');
    if (analyticsSettings) {
      const settings = JSON.parse(analyticsSettings);
      isAnalyticsEnabled = settings.enabled !== false; // デフォルトで有効
    } else {
      isAnalyticsEnabled = true; // 設定がなければデフォルトで有効
    }

    if (!isAnalyticsEnabled) {
      console.info('フォーム分析は無効化されています');
      return;
    }

    // セッション情報を初期化
    sessionStartTime = Date.now();
    currentFormId = formId;

    // フォーム開始イベントを記録
    trackFormEvent(FormAnalyticsEventType.FORM_STARTED, {
      formId,
      deviceType: getDeviceType()
    });

    // ウィンドウ閉じるイベントのリスナー設定
    window.addEventListener('beforeunload', handleWindowClose);

    console.info(`フォーム分析を初期化しました: ${formId}`);
  } catch (error) {
    console.warn('フォーム分析の初期化に失敗しました:', error);
  }
}

/**
 * フォーム分析を終了
 */
export function terminateFormAnalytics(): void {
  if (!isAnalyticsEnabled || !currentFormId) return;
  
  window.removeEventListener('beforeunload', handleWindowClose);
  currentFormId = undefined;
  
  console.info('フォーム分析を終了しました');
}

/**
 * フォームイベントを記録
 * @param eventType イベントタイプ
 * @param props イベントプロパティ
 */
export function trackFormEvent(
  eventType: FormAnalyticsEventType,
  props: FormAnalyticsEventProps = {}
): void {
  if (!isAnalyticsEnabled) return;
  
  try {
    const timestamp = Date.now();
    const sessionDuration = sessionStartTime ? timestamp - sessionStartTime : 0;
    
    // 基本イベントデータ
    const eventData = {
      eventType,
      timestamp,
      sessionDuration,
      formId: currentFormId,
      ...props
    };
    
    // イベントタイプに応じた追加処理
    switch (eventType) {
      case FormAnalyticsEventType.FORM_STEP_VIEWED:
        currentStepStartTime = timestamp;
        previousStepId = props.stepId;
        break;
        
      case FormAnalyticsEventType.FORM_STEP_COMPLETED:
        if (currentStepStartTime) {
          eventData.timeSpent = timestamp - currentStepStartTime;
        }
        break;
        
      case FormAnalyticsEventType.FORM_STEP_BACK:
        eventData.fromStep = previousStepId;
        eventData.toStep = props.stepId;
        break;
    }
    
    // 分析イベント送信
    sendAnalyticsEvent(eventData);
    
  } catch (error) {
    console.warn('フォームイベントの記録に失敗しました:', error);
  }
}

/**
 * フォームステップの閲覧を記録
 * @param stepId ステップID
 * @param stepName ステップ名
 */
export function trackStepView(stepId: string | number, stepName: string): void {
  trackFormEvent(FormAnalyticsEventType.FORM_STEP_VIEWED, { stepId, stepName });
}

/**
 * フォームステップの完了を記録
 * @param stepId ステップID
 * @param stepName ステップ名
 * @param completionRate 完了率（0-100）
 */
export function trackStepCompletion(
  stepId: string | number,
  stepName: string,
  completionRate: number
): void {
  trackFormEvent(FormAnalyticsEventType.FORM_STEP_COMPLETED, {
    stepId,
    stepName,
    completionRate
  });
}

/**
 * フィールドのフォーカスを記録
 * @param fieldId フィールドID
 * @param fieldType フィールドタイプ
 */
export function trackFieldFocus(fieldId: string, fieldType: string): void {
  trackFormEvent(FormAnalyticsEventType.FORM_FIELD_FOCUSED, { fieldId, fieldType });
}

/**
 * フィールドの入力完了を記録
 * @param fieldId フィールドID
 * @param fieldType フィールドタイプ
 * @param isValid 値が有効か
 */
export function trackFieldFilled(
  fieldId: string,
  fieldType: string,
  isValid: boolean
): void {
  trackFormEvent(FormAnalyticsEventType.FORM_FIELD_FILLED, {
    fieldId,
    fieldType,
    isValid
  });
}

/**
 * フィールドエラーを記録
 * @param fieldId フィールドID
 * @param errorMessage エラーメッセージ
 */
export function trackFieldError(fieldId: string, errorMessage: string): void {
  trackFormEvent(FormAnalyticsEventType.FORM_FIELD_ERROR, {
    fieldId,
    errorMessage
  });
}

/**
 * フォーム送信を記録
 * @param success 送信成功したか
 * @param completionTime 完了までの時間（ミリ秒）
 */
export function trackFormSubmission(success: boolean, completionTime: number): void {
  trackFormEvent(FormAnalyticsEventType.FORM_SUBMITTED, {
    success,
    completionTime
  });
}

/**
 * ヘルプ表示を記録
 * @param helpType ヘルプタイプ
 * @param helpTopic ヘルプトピック
 */
export function trackHelpView(helpType: string, helpTopic: string): void {
  trackFormEvent(FormAnalyticsEventType.HELP_VIEWED, {
    helpType,
    helpTopic
  });
}

/**
 * チュートリアルステップ表示を記録
 * @param stepIndex ステップインデックス
 * @param stepTitle ステップタイトル
 */
export function trackTutorialStep(stepIndex: number, stepTitle: string): void {
  trackFormEvent(FormAnalyticsEventType.TUTORIAL_STEP_VIEWED, {
    stepIndex,
    stepTitle
  });
}

/**
 * チュートリアル完了を記録
 * @param completedAll 全ステップ完了したか
 * @param stepsCompleted 完了したステップ数
 * @param totalSteps 総ステップ数
 */
export function trackTutorialCompletion(
  completedAll: boolean,
  stepsCompleted: number,
  totalSteps: number
): void {
  trackFormEvent(FormAnalyticsEventType.TUTORIAL_COMPLETED, {
    completedAll,
    stepsCompleted,
    totalSteps
  });
}

/**
 * エラー発生を記録
 * @param errorType エラータイプ
 * @param errorMessage エラーメッセージ
 * @param componentName エラーが発生したコンポーネント
 */
export function trackError(
  errorType: string,
  errorMessage: string,
  componentName?: string
): void {
  trackFormEvent(FormAnalyticsEventType.ERROR_ENCOUNTERED, {
    errorType,
    errorMessage,
    componentName
  });
}

/**
 * ウィンドウを閉じるときのハンドラ
 */
function handleWindowClose(): void {
  if (!currentFormId) return;
  
  // フォーム放棄イベントを記録
  trackFormEvent(FormAnalyticsEventType.FORM_ABANDONED, {
    formId: currentFormId,
    totalTimeSpent: Date.now() - sessionStartTime
  });
}

/**
 * デバイスタイプを取得
 */
function getDeviceType(): string {
  const width = window.innerWidth;
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
}

/**
 * 分析イベントをバックエンドに送信
 * @param eventData イベントデータ
 */
function sendAnalyticsEvent(eventData: any): void {
  try {
    // 開発環境ではコンソールに出力
    if (process.env.NODE_ENV === 'development') {
      console.debug('📊 Analytics Event:', eventData);
      return;
    }
    
    // 本番環境では実際のAPIを使用
    const analyticsAny = window as any;
    if (analyticsAny.analytics) {
      analyticsAny.analytics.track(eventData.eventType, eventData);
    } else {
      // バッファリングして後で送信
      if (!analyticsAny._analyticsBuffer) {
        analyticsAny._analyticsBuffer = [];
      }
      analyticsAny._analyticsBuffer.push(eventData);
    }
  } catch (error) {
    // 分析は重要ではないので、エラーがあっても静かに処理
    console.warn('Analytics event sending failed:', error);
  }
}

/**
 * フォーム分析の有効/無効を設定
 * @param enabled 有効にするか
 */
export function setFormAnalyticsEnabled(enabled: boolean): void {
  try {
    isAnalyticsEnabled = enabled;
    
    // 設定を保存
    const settings = { enabled, updatedAt: new Date().toISOString() };
    localStorage.setItem('echo_analytics_settings', JSON.stringify(settings));
    
    console.info(`フォーム分析を${enabled ? '有効' : '無効'}にしました`);
  } catch (error) {
    console.warn('フォーム分析設定の更新に失敗しました:', error);
  }
}

/**
 * フォーム分析が有効かどうかを取得
 */
export function isFormAnalyticsEnabled(): boolean {
  return isAnalyticsEnabled;
}

export default {
  initFormAnalytics,
  terminateFormAnalytics,
  trackFormEvent,
  trackStepView,
  trackStepCompletion,
  trackFieldFocus,
  trackFieldFilled,
  trackFieldError,
  trackFormSubmission,
  trackHelpView,
  trackTutorialStep,
  trackTutorialCompletion,
  trackError,
  setFormAnalyticsEnabled,
  isFormAnalyticsEnabled,
  FormAnalyticsEventType
};