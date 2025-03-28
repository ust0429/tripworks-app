import React, { useEffect, useState } from 'react';
import { useAttenderProfile } from '../../../contexts/AttenderProfileContext';
import AttenderProfileService from '../../../services/AttenderProfileService';
import ProfileHeader from './ProfileHeader';
import AttenderProfileEdit from './AttenderProfileEdit';
import ExperienceSamples from './ExperienceSamples';
import AvailabilityCalendar from './AvailabilityCalendar';
import { AttenderProfile as AttenderProfileType, ExperienceSample, DailyAvailability } from '../../../types/attender/profile';

interface AttenderProfileProps {
  attenderId: string;
  /** カスタムレンダリングを行うレンダリングプロップ */
  renderProfile?: (profile: AttenderProfileType) => React.ReactNode;
}

/**
 * アテンダープロフィールコンポーネント
 */
const AttenderProfile: React.FC<AttenderProfileProps> = ({ attenderId, renderProfile }) => {
  const {
    profile,
    editMode,
    loadingState,
    error,
    setProfile,
    setEditMode,
    setLoadingState,
    setError,
    updateProfileField
  } = useAttenderProfile();
  
  // プロフィールデータの読み込み
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoadingState('loading');
        const profileData = await AttenderProfileService.getProfile(attenderId);
        setProfile(profileData);
        setLoadingState('success');
      } catch (err) {
        console.error('Failed to fetch profile:', err);
        setError(err instanceof Error ? err.message : '読み込みに失敗しました');
        setLoadingState('error');
      }
    };

    fetchProfile();
  }, [attenderId, setProfile, setLoadingState, setError]);
  
  // 編集モードの切り替え
  const handleEditToggle = () => {
    setEditMode(editMode === 'view' ? 'edit' : 'view');
  };
  
  // プロフィール編集の保存
  const handleSaveProfile = async (updates: Partial<AttenderProfileType>) => {
    if (!profile) return;
    
    try {
      setLoadingState('loading');
      
      // 更新データの作成
      const updatedProfile = {
        ...profile,
        ...updates
      };
      
      // 完成度スコアの再計算
      updatedProfile.completionScore = AttenderProfileService.calculateCompletionScore(updatedProfile);
      updatedProfile.lastActive = new Date().toISOString();
      
      // プロフィールの更新
      const result = await AttenderProfileService.updateProfile(updatedProfile);
      setProfile(result);
      
      setLoadingState('success');
      setEditMode('view');
    } catch (err) {
      console.error('Failed to save profile:', err);
      setError(err instanceof Error ? err.message : '保存に失敗しました');
      setLoadingState('error');
    }
  };
  
  // 体験サンプルの追加
  const handleAddSample = async (sample: Omit<ExperienceSample, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!profile) return;
    
    try {
      setLoadingState('loading');
      const newSample = await AttenderProfileService.addExperienceSample(profile.id, sample);
      
      const updatedProfile = { ...profile };
      updatedProfile.experienceSamples = profile.experienceSamples ? [...profile.experienceSamples, newSample] : [newSample];
      updatedProfile.completionScore = AttenderProfileService.calculateCompletionScore(updatedProfile);
      updatedProfile.lastActive = new Date().toISOString();
      
      setProfile(updatedProfile);
      await AttenderProfileService.updateProfile(updatedProfile);
      
      setLoadingState('success');
    } catch (err) {
      console.error('Failed to add sample:', err);
      setError(err instanceof Error ? err.message : 'サンプルの追加に失敗しました');
      setLoadingState('error');
    }
  };
  
  // 体験サンプルの更新
  const handleUpdateSample = async (
    id: string,
    updates: Partial<Omit<ExperienceSample, 'id' | 'createdAt' | 'updatedAt'>>
  ) => {
    if (!profile) return;
    
    try {
      setLoadingState('loading');
      const updatedSample = await AttenderProfileService.updateExperienceSample(profile.id, id, updates);
      
      const updatedProfile = { ...profile };
      updatedProfile.experienceSamples = profile.experienceSamples ? profile.experienceSamples.map(s => 
        s.id === id ? { ...s, ...updatedSample } : s
      ) : [];
      updatedProfile.lastActive = new Date().toISOString();
      
      setProfile(updatedProfile);
      await AttenderProfileService.updateProfile(updatedProfile);
      
      setLoadingState('success');
    } catch (err) {
      console.error('Failed to update sample:', err);
      setError(err instanceof Error ? err.message : 'サンプルの更新に失敗しました');
      setLoadingState('error');
    }
  };
  
  // 体験サンプルの削除
  const handleRemoveSample = async (id: string) => {
    if (!profile) return;
    
    try {
      setLoadingState('loading');
      await AttenderProfileService.removeExperienceSample(profile.id, id);
      
      const updatedProfile = { ...profile };
      updatedProfile.experienceSamples = profile.experienceSamples ? profile.experienceSamples.filter(s => s.id !== id) : [];
      updatedProfile.completionScore = AttenderProfileService.calculateCompletionScore(updatedProfile);
      updatedProfile.lastActive = new Date().toISOString();
      
      setProfile(updatedProfile);
      await AttenderProfileService.updateProfile(updatedProfile);
      
      setLoadingState('success');
    } catch (err) {
      console.error('Failed to remove sample:', err);
      setError(err instanceof Error ? err.message : 'サンプルの削除に失敗しました');
      setLoadingState('error');
    }
  };
  
  // 利用可能時間の更新
  const handleUpdateAvailability = async (availability: DailyAvailability[]) => {
    if (!profile) return;
    
    try {
      setLoadingState('loading');
      
      const updatedProfile = { ...profile, availability };
      updatedProfile.completionScore = AttenderProfileService.calculateCompletionScore(updatedProfile);
      updatedProfile.lastActive = new Date().toISOString();
      
      await AttenderProfileService.updateProfile(updatedProfile);
      setProfile(updatedProfile);
      
      setLoadingState('success');
    } catch (err) {
      console.error('Failed to update availability:', err);
      setError(err instanceof Error ? err.message : '利用可能時間の更新に失敗しました');
      setLoadingState('error');
    }
  };
  
  // エラー表示
  if (loadingState === 'error') {
    return (
      <div className="bg-red-50 p-4 rounded-lg text-red-700">
        <h3 className="font-medium">エラーが発生しました</h3>
        <p>{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-3 px-4 py-2 text-sm text-white bg-red-600 rounded hover:bg-red-700"
        >
          再読み込み
        </button>
      </div>
    );
  }
  
  // 読み込み中表示
  if (loadingState === 'loading' && !profile) {
    return (
      <div className="animate-pulse space-y-6">
        <ProfileHeader
          profile={null}
          isLoading={true}
        />
        <div className="bg-gray-100 h-64 rounded-lg"></div>
        <div className="bg-gray-100 h-64 rounded-lg"></div>
      </div>
    );
  }
  
  // プロフィールがない場合
  if (!profile) {
    return (
      <div className="text-center py-8">
        <h3 className="text-lg font-medium text-gray-700">プロフィールが見つかりません</h3>
        <p className="text-gray-500">データが読み込めないか、プロフィールが存在しません</p>
      </div>
    );
  }
  
  // カスタムレンダリング関数が与えられていれば、そちらを優先使用
  if (profile && renderProfile) {
    return <>{renderProfile(profile)}</>;
  }
  
  // 通常のレンダリング
  return (
    <div className="space-y-6">
      {/* プロフィールヘッダー */}
      <ProfileHeader
        profile={profile}
        isLoading={loadingState === 'loading'}
        isEditing={editMode === 'edit'}
        onEdit={handleEditToggle}
        onSave={() => setEditMode('view')}
        onCancel={() => setEditMode('view')}
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* プロフィール編集フォーム */}
          {editMode === 'edit' ? (
            <AttenderProfileEdit
              profile={profile}
              onSave={handleSaveProfile}
              onCancel={() => setEditMode('view')}
            />
          ) : (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">プロフィール情報</h2>
              
              <div className="space-y-4">
                {profile.location && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">居住地</h3>
                    <p>{profile.location}</p>
                  </div>
                )}
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">自己紹介</h3>
                  <p className="whitespace-pre-line">{profile.bio}</p>
                </div>
                
                {profile.specialties && profile.specialties.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">専門分野</h3>
                    <p>{profile.specialties.join('、')}</p>
                  </div>
                )}
                
                {profile.background && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">経歴・バックグラウンド</h3>
                    <p className="whitespace-pre-line">{profile.background}</p>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* 体験サンプル */}
          <ExperienceSamples
            samples={profile.experienceSamples || []}
            isEditing={editMode === 'edit'}
            onAdd={handleAddSample}
            onUpdate={handleUpdateSample}
            onRemove={handleRemoveSample}
          />
        </div>
        
        <div>
          {/* 利用可能時間 */}
          <AvailabilityCalendar
            availability={profile.availability || []}
            isEditing={editMode === 'edit'}
            onChange={handleUpdateAvailability}
          />
        </div>
      </div>
    </div>
  );
};

export default AttenderProfile;
