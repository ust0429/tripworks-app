import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
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
  const setProfile = (profile: AttenderProfile) => 
    dispatch({ type: 'SET_PROFILE', payload: profile });
  
  const setLoadingState = (loadingState: ProfileContextState['loadingState']) => 
    dispatch({ type: 'SET_LOADING_STATE', payload: loadingState });
  
  const setError = (error: string | null) => 
    dispatch({ type: 'SET_ERROR', payload: error });
  
  const setEditMode = (mode: ProfileEditMode) => 
    dispatch({ type: 'SET_EDIT_MODE', payload: mode });
  
  const updateProfileField = (operation: ProfileUpdateOperation) => 
    dispatch({ type: 'UPDATE_PROFILE_FIELD', payload: operation });
  
  const addExperienceSample = (sample: ExperienceSample) => {
    dispatch({ type: 'ADD_EXPERIENCE_SAMPLE', payload: convertExperienceSample(sample) });
  };
  
  const updateExperienceSample = (
    id: string, 
    data: Partial<ExperienceSample>
  ) => {
    dispatch({ 
      type: 'UPDATE_EXPERIENCE_SAMPLE', 
      payload: { id, data: convertExperienceSample(data) } 
    });
  };
  
  const removeExperienceSample = (id: string) => 
    dispatch({ type: 'REMOVE_EXPERIENCE_SAMPLE', payload: id });
  
  const updateAvailability = (availability: AvailabilityTimeSlot[]) => 
    dispatch({ type: 'UPDATE_AVAILABILITY', payload: availability });
  
  const updateCompletionScore = (score: number) => 
    dispatch({ type: 'UPDATE_COMPLETION_SCORE', payload: score });
  
  const updateImprovementTips = (tips: string[]) => 
    dispatch({ type: 'UPDATE_IMPROVEMENT_TIPS', payload: tips });
  
  // プロフィール完成度スコアの再計算
  const recalculateProfileScore = () => {
    if (!state.profile) return;
    
    // 完成度スコアを計算
    const score = calculateProfileCompletionScore(state.profile);
    updateCompletionScore(score);
    
    // 改善アドバイスを生成
    const tips = generateProfileImprovementTips(state.profile);
    updateImprovementTips(tips);
  };
  
  // プロフィールが変更されたときに完成度スコアを再計算
  useEffect(() => {
    if (state.profile) {
      recalculateProfileScore();
    }
  }, [state.profile]);
  // バックエンドとの連携メソッド
  const saveProfileToBackend = async () => {
    if (!state.profile) return;
    
    setLoadingState('loading');
    try {
      // プロフィール更新APIを呼び出す
      await AttenderService.updateAttenderProfile(state.profile, {
        name: state.profile.name,
        bio: state.profile.bio,
        specialties: state.profile.specialties,
        languages: state.profile.languages,
        expertise: state.profile.expertise,
        imageUrl: state.profile.profilePhoto || state.profile.imageUrl
      });
      
      // 成功時の処理
      setLoadingState('success');
      
      // 完成度スコアを再計算
      recalculateProfileScore();
    } catch (error) {
      console.error('プロフィール保存エラー:', error);
      setError(error instanceof Error ? error.message : '予期せぬエラーが発生しました');
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
