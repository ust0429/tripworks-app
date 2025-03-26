import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Edit, Star, Award, Check, AlertCircle, Clock } from 'lucide-react';

interface ProfileHeaderProps {
  name: string;
  bio: string;
  profileImage?: string;
  headerImage?: string;
  rating?: number;
  reviewCount?: number;
  verificationStatus: 'verified' | 'pending' | 'unverified';
  badges?: string[];
  onEdit?: () => void;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  name,
  bio,
  profileImage,
  headerImage,
  rating,
  reviewCount,
  verificationStatus,
  badges = [],
  onEdit
}) => {
  // ベリフィケーションステータスに応じたコンポーネント
  const VerificationBadge = () => {
    switch (verificationStatus) {
      case 'verified':
        return (
          <Badge variant="success" className="flex items-center">
            <Check className="h-3 w-3 mr-1" />
            認証済み
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="warning" className="flex items-center">
            <Clock className="h-3 w-3 mr-1" />
            認証待ち
          </Badge>
        );
      case 'unverified':
        return (
          <Badge variant="destructive" className="flex items-center">
            <AlertCircle className="h-3 w-3 mr-1" />
            未認証
          </Badge>
        );
      default:
        return null;
    }
  };

  // バッジ表示用のマッピング
  const badgeLabels: Record<string, string> = {
    'top-rated': '高評価',
    'quick-responder': '迅速な返信',
    'experienced-host': '経験豊富',
    'popular': '人気',
    'new': '新規'
  };

  return (
    <div className="w-full">
      {/* ヘッダー画像 */}
      <div className="relative w-full h-48 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-t-lg overflow-hidden">
        {headerImage && (
          <img 
            src={headerImage} 
            alt={`${name}のヘッダー画像`} 
            className="w-full h-full object-cover"
          />
        )}
        
        {/* 編集ボタン */}
        {onEdit && (
          <button 
            className="absolute top-4 right-4 bg-white bg-opacity-80 px-3 py-1 rounded-md text-sm flex items-center gap-1 hover:bg-opacity-100 transition-colors"
            onClick={onEdit}
          >
            <Edit className="h-4 w-4 mr-1" />
            編集
          </button>
        )}
        
        {/* プロフィール画像 */}
        <div className="absolute -bottom-16 left-8">
          <div className="w-32 h-32 rounded-full bg-gray-200 border-4 border-white overflow-hidden">
            {profileImage ? (
              <img 
                src={profileImage} 
                alt={`${name}のプロフィール画像`} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-300">
                <span className="text-2xl font-bold text-gray-500">
                  {name?.charAt(0)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* プロフィール情報 */}
      <div className="mt-20 px-8">
        <div className="flex flex-wrap justify-between items-start gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              {name}
              <VerificationBadge />
            </h1>
            
            <p className="text-gray-600 mt-1 max-w-2xl">
              {bio}
            </p>
          </div>
          
          {/* 評価情報 */}
          {(rating !== undefined && reviewCount !== undefined) && (
            <div className="flex items-center">
              <div className="flex items-center">
                <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                <span className="ml-1 font-semibold">{rating.toFixed(1)}</span>
              </div>
              <span className="mx-1 text-gray-500">•</span>
              <span className="text-gray-500">{reviewCount} レビュー</span>
            </div>
          )}
        </div>
        
        {/* 実績バッジ */}
        {badges && badges.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {badges.map((badge) => (
              <Badge key={badge} variant="outline" className="flex items-center gap-1">
                <Award className="h-3 w-3" />
                {badgeLabels[badge] || badge}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileHeader;
