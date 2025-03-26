import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { 
  AttenderProfile, 
  ProfileContextState, 
  ProfileEditMode, 
  ProfileUpdateOperation 
} from '../types/attender/profile';

// 初期状態
const initialState: ProfileContextState = {
  profile: null,
  editMode: 'view',
  loadingState: 'idle',
  error: null
};

// アクションの型定義
type ProfileAction =
  | { type: 'SET_PROFILE'; payload: AttenderProfile }
  | { type: 'SET_LOADING_STATE'; payload: ProfileContextState['loadingState'] }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_EDIT_MODE'; payload: ProfileEditMode }
  | { type: 'UPDATE_PROFILE_FIELD'; payload: ProfileUpdateOperation }
  | { type: 'ADD_EXPERIENCE_SAMPLE'; payload: AttenderProfile['experienceSamples'][0] }
  | { type: 'UPDATE_EXPERIENCE_SAMPLE'; payload: { id: string; data: Partial<AttenderProfile['experienceSamples'][0]> } }
  | { type: 'REMOVE_EXPERIENCE_SAMPLE'; payload: string }
  | { type: 'UPDATE_AVAILABILITY'; payload: AttenderProfile['availability'] };

// コンテキストの型定義
interface ProfileContextValue extends ProfileContextState {
  setProfile: (profile: AttenderProfile) => void;
  setLoadingState: (state: ProfileContextState['loadingState']) => void;
  setError: (error: string | null) => void;
  setEditMode: (mode: ProfileEditMode) => void;
  updateProfileField: (operation: ProfileUpdateOperation) => void;
  addExperienceSample: (sample: AttenderProfile['experienceSamples'][0]) => void;
  updateExperienceSample: (id: string, data: Partial<AttenderProfile['experienceSamples'][0]>) => void;
  removeExperienceSample: (id: string) => void;
  updateAvailability: (availability: AttenderProfile['availability']) => void;
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
          experienceSamples: [...state.profile.experienceSamples, action.payload]
        }
      };
    
    case 'UPDATE_EXPERIENCE_SAMPLE':
      if (!state.profile) return state;
      return {
        ...state,
        profile: {
          ...state.profile,
          experienceSamples: state.profile.experienceSamples.map(sample => 
            sample.id === action.payload.id 
              ? { ...sample, ...action.payload.data } 
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
          experienceSamples: state.profile.experienceSamples.filter(
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
          availability: action.payload
        }
      };
    
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
  
  const addExperienceSample = (sample: AttenderProfile['experienceSamples'][0]) => 
    dispatch({ type: 'ADD_EXPERIENCE_SAMPLE', payload: sample });
  
  const updateExperienceSample = (
    id: string, 
    data: Partial<AttenderProfile['experienceSamples'][0]>
  ) => dispatch({ 
    type: 'UPDATE_EXPERIENCE_SAMPLE', 
    payload: { id, data } 
  });
  
  const removeExperienceSample = (id: string) => 
    dispatch({ type: 'REMOVE_EXPERIENCE_SAMPLE', payload: id });
  
  const updateAvailability = (availability: AttenderProfile['availability']) => 
    dispatch({ type: 'UPDATE_AVAILABILITY', payload: availability });
  
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
    updateAvailability
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
