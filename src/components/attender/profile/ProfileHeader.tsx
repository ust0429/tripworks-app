import React from 'react';
import { AttenderProfile } from '../../../types/attender/profile';
import { Badge } from '../../ui/badge';
import { cn } from '../../../utils/cn';
import { Skeleton } from '../../ui/skeleton';
import ProfileCompletionScore from './ProfileCompletionScore';
import { calculateProfileCompletionScore } from '../../../services/attender/ProfileCompletionService';

interface ProfileHeaderProps {
  profile: AttenderProfile | null;
  isLoading?: boolean;
  isEditing?: boolean;
  onEdit?: () => void;
  onSave?: () => void;
  onCancel?: () => void;
}

/**
 * アテンダープロフィールのヘッダーコンポーネント
 */
const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  profile,
  isLoading = false,
  isEditing = false,
  onEdit,
  onSave,
  onCancel,
}) => {
  if (isLoading) {
    return (
      <div className="flex flex-col md:flex-row gap-6 p-6 bg-white rounded-lg shadow-sm">
        <Skeleton className="w-24 h-24 rounded-full" />
        <div className="flex-1">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-32 mb-4" />
          <Skeleton className="h-20 w-full" />
        </div>
      </div>
    );
  }

  if (!profile) return null;

  // プロフィール完成度を計算（completionScoreがなければ計算する）
  const profileScore = profile.completionScore || calculateProfileCompletionScore(profile);
  
  const completionScoreBadgeVariant = 
    profileScore >= 80 ? 'success' :
    profileScore >= 50 ? 'warning' :
    'danger';

  return (
    <div className={cn(
      "flex flex-col md:flex-row gap-6 p-6 rounded-lg shadow-sm",
      isEditing ? "bg-gray-50" : "bg-white"
    )}>
      {/* プロフィール画像 */}
      <div className="relative">
        <img
          src={profile.imageUrl || 'https://via.placeholder.com/96'}
          alt={profile.name}
          className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
        />
        {profile.verified && (
          <div className="absolute bottom-0 right-0 bg-blue-500 text-white rounded-full p-1">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
        )}
      </div>

      {/* プロフィール情報 */}
      <div className="flex-1">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <h1 className="text-2xl font-bold">{profile.name}</h1>
          
          {profile.verified && (
            <Badge variant="secondary" size="sm">
              認証済み
            </Badge>
          )}
          
          <Badge variant={completionScoreBadgeVariant} size="sm">
            完成度 {profileScore}%
          </Badge>
        </div>
        
        <div className="mb-3 text-gray-600">
          {profile.location && <span className="mr-4">{profile.location}</span>}
          {profile.specialties && profile.specialties.length > 0 && (
            <span className="text-sm">
              専門: {profile.specialties.join('・')}
            </span>
          )}
        </div>
        
        <p className="text-gray-700 mb-4">{profile.bio}</p>
        
        {/* プロフィール完成度スコア（非編集モードのみ表示） */}
        {!isEditing && (
          <div className="mb-4">
            <ProfileCompletionScore profile={profile} showSuggestion={true} />
          </div>
        )}
        
        {/* アクションボタン */}
        <div className="flex gap-2 mt-auto">
          {!isEditing && onEdit && (
            <button
              onClick={onEdit}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              プロフィールを編集
            </button>
          )}
          
          {isEditing && (
            <>
              <button
                onClick={onSave}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                保存
              </button>
              <button
                onClick={onCancel}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                キャンセル
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
