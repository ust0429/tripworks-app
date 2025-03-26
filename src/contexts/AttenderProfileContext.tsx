import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { AttenderProfileData } from '@/types/attender/profile';
import { getAttenderProfile, updateAttenderProfile } from '@/services/AttenderProfileService';

interface AttenderProfileContextProps {
  profileData: AttenderProfileData | null;
  isLoading: boolean;
  error: string | null;
  updateProfile: (data: Partial<AttenderProfileData>) => Promise<boolean>;
  refreshProfile: () => Promise<void>;
  isEditing: boolean;
  setIsEditing: (editing: boolean) => void;
}

const defaultContext: AttenderProfileContextProps = {
  profileData: null,
  isLoading: false,
  error: null,
  updateProfile: async () => false,
  refreshProfile: async () => {},
  isEditing: false,
  setIsEditing: () => {},
};

export const AttenderProfileContext = createContext<AttenderProfileContextProps>(defaultContext);

export const useAttenderProfile = () => useContext(AttenderProfileContext);

interface AttenderProfileProviderProps {
  children: ReactNode;
  profileId?: string; // オプション - 指定がなければ現在ログイン中のアテンダーと想定
}

export const AttenderProfileProvider: React.FC<AttenderProfileProviderProps> = ({ 
  children, 
  profileId 
}) => {
  const [profileData, setProfileData] = useState<AttenderProfileData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  const refreshProfile = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const profile = await getAttenderProfile(profileId);
      setProfileData(profile);
    } catch (err) {
      console.error('プロフィール取得エラー:', err);
      setError('プロフィールの取得中にエラーが発生しました。');
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (data: Partial<AttenderProfileData>): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // 現在のプロフィールデータとマージ
      const updatedProfile = profileData ? { ...profileData, ...data } : data;
      
      // API呼び出し
      await updateAttenderProfile(updatedProfile as AttenderProfileData);
      
      // 更新後、最新の情報を取得
      await refreshProfile();
      
      return true;
    } catch (err) {
      console.error('プロフィール更新エラー:', err);
      setError('プロフィールの更新中にエラーが発生しました。');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // 初回マウント時にプロフィールを取得
  useEffect(() => {
    refreshProfile();
  }, [profileId]);

  return (
    <AttenderProfileContext.Provider
      value={{
        profileData,
        isLoading,
        error,
        updateProfile,
        refreshProfile,
        isEditing,
        setIsEditing,
      }}
    >
      {children}
    </AttenderProfileContext.Provider>
  );
};
