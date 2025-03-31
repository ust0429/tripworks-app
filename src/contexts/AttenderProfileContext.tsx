import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { isDevelopment, isDebugMode } from '../config/env';
import AttenderService from '../services/AttenderService';
import { calculateProfileCompletionScore, generateProfileImprovementTips } from '../utils/profileCompletionScore';
import { 
  AttenderProfile, 
  ProfileContextState, 
  ProfileEditMode, 
  ProfileUpdateOperation 
} from '../types/attender/profile';
import { ExperienceSample, AvailabilityTimeSlot } from '../types/attender/index';

// 初期状態
const initialState: ProfileContextState = {
  profile: null,
  editMode: 'view',
  loadingState: 'idle',
  error: null,
  completionScore: 0,
  improvementTips: []
};

// アクションの型定義

// 型が渡された際に変換を行うアダプター関数
const convertExperienceSample = (sample: any): any => {
  // 型の変換が必要な場合はここで行う
  return sample as any;
};

type ProfileAction =
  | { type: 'SET_PROFILE'; payload: AttenderProfile }
  | { type: 'SET_LOADING_STATE'; payload: ProfileContextState['loadingState'] }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_EDIT_MODE'; payload: ProfileEditMode }
  | { type: 'UPDATE_PROFILE_FIELD'; payload: ProfileUpdateOperation }
  | { type: 'ADD_EXPERIENCE_SAMPLE'; payload: ExperienceSample }
  | { type: 'UPDATE_EXPERIENCE_SAMPLE'; payload: { id: string; data: Partial<ExperienceSample> } }
  | { type: 'REMOVE_EXPERIENCE_SAMPLE'; payload: string }
  | { type: 'UPDATE_AVAILABILITY'; payload: AvailabilityTimeSlot[] }
  | { type: 'UPDATE_COMPLETION_SCORE'; payload: number }
  | { type: 'UPDATE_IMPROVEMENT_TIPS'; payload: string[] };

// コンテキストの型定義
interface ProfileContextValue extends ProfileContextState {
  setProfile: (profile: AttenderProfile) => void;
  setLoadingState: (state: ProfileContextState['loadingState']) => void;
  setError: (error: string | null) => void;
  setEditMode: (mode: ProfileEditMode) => void;
  updateProfileField: (operation: ProfileUpdateOperation) => void;
  addExperienceSample: (sample: ExperienceSample) => void;
  updateExperienceSample: (id: string, data: Partial<ExperienceSample>) => void;
  removeExperienceSample: (id: string) => void;
  updateAvailability: (availability: AvailabilityTimeSlot[]) => void;
  saveProfileToBackend: () => Promise<void>;
  updateCompletionScore: (score: number) => void;
  updateImprovementTips: (tips: string[]) => void;
  recalculateProfileScore: () => void;
}

// コンテキストの作成
const ProfileContext = createContext<ProfileContextValue | undefined>(undefined);

// リデューサー関数
const profileReducer = (state: ProfileContextState, action: ProfileAction): ProfileContextState => {
  switch (action.type) {
    case 'SET_PROFILE':
      return { ...state, profile: action.payload };
    
    case 'SET_LOADING_STATE':
      return { ...state, loadingState: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    
    case 'SET_EDIT_MODE':
      return { ...state, editMode: action.payload };
    
    case 'UPDATE_PROFILE_FIELD':
      if (!state.profile) return state;
      return {
        ...state,
        profile: {
          ...state.profile,
          [action.payload.field]: action.payload.value
        }
      };
    
    case 'ADD_EXPERIENCE_SAMPLE':
      if (!state.profile) return state;
      return {
        ...state,
        profile: {
          ...state.profile,
          experienceSamples: [...(state.profile.experienceSamples || []), convertExperienceSample(action.payload)]
        }
      };
    
    case 'UPDATE_EXPERIENCE_SAMPLE':
      if (!state.profile) return state;
      return {
        ...state,
        profile: {
          ...state.profile,
          experienceSamples: (state.profile.experienceSamples || []).map(sample => 
            sample.id === action.payload.id 
              ? { ...sample, ...convertExperienceSample(action.payload.data) } 
              : sample
          )
        }
      };
    
    case 'REMOVE_EXPERIENCE_SAMPLE':
      if (!state.profile) return state;
      return {
        ...state,
        profile: {
          ...state.profile,
          experienceSamples: (state.profile.experienceSamples || []).filter(
            sample => sample.id !== action.payload
          )
        }
      };
    
    case 'UPDATE_AVAILABILITY':
      if (!state.profile) return state;
      return {
        ...state,
        profile: {
          ...state.profile,
          availableTimes: action.payload
        }
      };
    
    case 'UPDATE_COMPLETION_SCORE':
      return { ...state, completionScore: action.payload };
    
    case 'UPDATE_IMPROVEMENT_TIPS':
      return { ...state, improvementTips: action.payload };
    
    default:
      return state;
  }
};

// プロバイダーコンポーネント
interface ProfileProviderProps {
  children: ReactNode;
}

export const AttenderProfileProvider: React.FC<ProfileProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(profileReducer, initialState);
  
  // アクションクリエイター
  const setProfile = (profile: AttenderProfile) => {
    console.info('プロフィール設定:', { id: profile.id, name: profile.name });
    dispatch({ type: 'SET_PROFILE', payload: profile });
  };
  
  const setLoadingState = (loadingState: ProfileContextState['loadingState']) => {
    if (isDevelopment() || isDebugMode()) {
      console.info('ローディング状態変更:', loadingState);
    }
    dispatch({ type: 'SET_LOADING_STATE', payload: loadingState });
  };
  
  const setError = (error: string | null) => {
    if (error) {
      console.error('エラー設定:', error);
    } else if (state.error) {
      console.info('エラークリア');
    }
    dispatch({ type: 'SET_ERROR', payload: error });
  };
  
  const setEditMode = (mode: ProfileEditMode) => {
    console.info('編集モード変更:', { from: state.editMode, to: mode });
    dispatch({ type: 'SET_EDIT_MODE', payload: mode });
  };
  
  const updateProfileField = (operation: ProfileUpdateOperation) => {
    if (isDevelopment() || isDebugMode()) {
      console.info('プロフィールフィールド更新:', { 
        field: operation.field, 
        valueType: typeof operation.value,
        valuePreview: Array.isArray(operation.value) 
          ? `Array(${operation.value.length})` 
          : String(operation.value).substring(0, 50)
      });
    }
    dispatch({ type: 'UPDATE_PROFILE_FIELD', payload: operation });
  };
  
  const addExperienceSample = (sample: ExperienceSample) => {
    console.info('体験サンプル追加:', { title: sample.title });
    dispatch({ type: 'ADD_EXPERIENCE_SAMPLE', payload: convertExperienceSample(sample) });
  };
  
  const updateExperienceSample = (
    id: string, 
    data: Partial<ExperienceSample>
  ) => {
    console.info('体験サンプル更新:', { id, fields: Object.keys(data) });
    dispatch({ 
      type: 'UPDATE_EXPERIENCE_SAMPLE', 
      payload: { id, data: convertExperienceSample(data) } 
    });
  };
  
  const removeExperienceSample = (id: string) => {
    console.info('体験サンプル削除:', { id });
    dispatch({ type: 'REMOVE_EXPERIENCE_SAMPLE', payload: id });
  };
  
  const updateAvailability = (availability: AvailabilityTimeSlot[]) => {
    console.info('利用可能時間更新:', { count: availability.length });
    dispatch({ type: 'UPDATE_AVAILABILITY', payload: availability });
  };
  
  const updateCompletionScore = (score: number) => {
    // 前回のスコアと比較して変化があった場合のみログを出力
    if (score !== state.completionScore) {
      console.info('完成度スコア更新:', { 
        from: state.completionScore, 
        to: score,
        change: score - state.completionScore
      });
    }
    dispatch({ type: 'UPDATE_COMPLETION_SCORE', payload: score });
  };
  
  const updateImprovementTips = (tips: string[]) => {
    if (isDevelopment() || isDebugMode()) {
      console.info('改善ヒント更新:', { count: tips.length });
    }
    dispatch({ type: 'UPDATE_IMPROVEMENT_TIPS', payload: tips });
  };
  
  // プロフィール完成度スコアの再計算
  const recalculateProfileScore = () => {
    if (!state.profile) {
      console.warn('プロフィールが存在しないため、完成度スコアを計算できません');
      return;
    }
    
    try {
      // 完成度スコアを計算
      const score = calculateProfileCompletionScore(state.profile);
      updateCompletionScore(score);
      
      // 改善アドバイスを生成
      const tips = generateProfileImprovementTips(state.profile);
      updateImprovementTips(tips);
      
      // ローカルストレージにキャッシュ
      if (state.profile.id) {
        try {
          localStorage.setItem(
            `profile_score_${state.profile.id}`, 
            JSON.stringify({ score, date: new Date().toISOString() })
          );
        } catch (e) {
          // ローカルストレージエラーは無視する
          console.warn('ローカルストレージへの保存に失敗しました:', e);
        }
      }
    } catch (error) {
      console.error('完成度スコア計算エラー:', error);
    }
  };
  
  // プロフィールが変更されたときに完成度スコアを再計算
  useEffect(() => {
    if (state.profile) {
      recalculateProfileScore();
    }
  }, [state.profile]);
  // バックエンドとの連携メソッド
  const saveProfileToBackend = async () => {
    if (!state.profile) {
      console.error('保存対象のプロフィールが存在しません');
      setError('プロフィールデータが見つかりません');
      setLoadingState('error');
      return;
    }
    
    // プロフィールデータのバリデーション
    const requiredFields = ['name', 'bio', 'location'];
    const missingFields = requiredFields.filter(field => {
      const value = state.profile?.[field as keyof AttenderProfile];
      return !value || (typeof value === 'string' && value.trim() === '');
    });
    
    if (missingFields.length > 0) {
      console.warn(`プロフィール保存警告: 必須フィールドが未入力です - ${missingFields.join(', ')}`);
      // 警告だけで保存は続行する
    }
    
    // ローディング状態を設定
    setLoadingState('loading');
    
    try {
      // 保存前ログ
      console.info('プロフィールをバックエンドに保存中...', {
        id: state.profile.id,
        name: state.profile.name,
        fields: Object.keys(state.profile).length
      });
      
      // AttenderServiceのsaveProfileメソッドを使用
      const success = await AttenderService.saveProfile(state.profile);
      
      if (success) {
        // 成功時の処理
        setLoadingState('success');
        console.info('プロフィールが正常に保存されました:', state.profile.id);
        
        // 完成度スコアを再計算
        recalculateProfileScore();
        
        // 一定時間後にローディング状態をリセット
        setTimeout(() => {
          if (state.loadingState === 'success') {
            setLoadingState('idle');
          }
        }, 3000);
      } else {
        // 保存失敗時のエラー処理
        const errorMessage = 'プロフィールの保存に失敗しました。ネットワーク接続を確認してください。';
        console.error(errorMessage);
        setError(errorMessage);
        setLoadingState('error');
      }
    } catch (error) {
      // 例外発生時のエラー処理
      console.error('プロフィール保存時に例外が発生しました:', error);
      
      // ユーザーフレンドリーなエラーメッセージ
      let errorMessage = '予期せぬエラーが発生しました';
      if (error instanceof Error) {
        // ネットワークエラーの特殊処理
        if (error.message.includes('Network') || error.message.includes('network')) {
          errorMessage = 'ネットワーク接続エラーが発生しました。インターネット接続を確認してください。';
        } else if (error.message.includes('timeout') || error.message.includes('Timeout')) {
          errorMessage = 'サーバーからの応答がタイムアウトしました。時間をおいて再試行してください。';
        } else {
          errorMessage = `エラー: ${error.message}`;
        }
      }
      
      setError(errorMessage);
      setLoadingState('error');
    }
  };
  
  const value = {
    ...state,
    setProfile,
    setLoadingState,
    setError,
    setEditMode,
    updateProfileField,
    addExperienceSample,
    updateExperienceSample,
    removeExperienceSample,
    updateAvailability,
    saveProfileToBackend,
    updateCompletionScore,
    updateImprovementTips,
    recalculateProfileScore
  };
  
  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
};

// カスタムフック
export const useAttenderProfile = (): ProfileContextValue => {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useAttenderProfile must be used within an AttenderProfileProvider');
  }
  return context;
};
