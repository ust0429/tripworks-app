import React from 'react';
import { useAttenderProfile } from '@/contexts/AttenderProfileContext';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { 
  User, MapPin, Mail, Phone, Calendar, Award, Edit, ExternalLink, 
  Instagram, Twitter, Facebook, Globe, Clock, Star, AlertCircle
} from 'lucide-react';
import ProfileHeader from './ProfileHeader';
import ExperienceSamples from './ExperienceSamples';
import AvailabilityCalendar from './AvailabilityCalendar';

// ソーシャルメディアアイコンのマッピング
const SOCIAL_ICONS: Record<string, React.ReactNode> = {
  'Instagram': <Instagram className="h-4 w-4" />,
  'Twitter': <Twitter className="h-4 w-4" />,
  'Facebook': <Facebook className="h-4 w-4" />,
  'default': <Globe className="h-4 w-4" />
};

// 専門分野ラベルのマッピング
const EXPERTISE_LABELS: Record<string, string> = {
  'local-culture': '地元文化',
  'food': '食文化',
  'history': '歴史',
  'art': 'アート',
  'nature': '自然',
  'adventure': 'アドベンチャー',
  'nightlife': 'ナイトライフ',
  'photography': '写真',
  'craft': '工芸',
  'music': '音楽',
};

interface AttenderProfileProps {
  onEdit?: () => void;
}

const AttenderProfile: React.FC<AttenderProfileProps> = ({ onEdit }) => {
  const { profileData, isLoading, error, setIsEditing } = useAttenderProfile();

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  if (error || !profileData) {
    return (
      <div className="w-full max-w-4xl mx-auto p-4 text-center">
        <div className="bg-red-50 p-4 rounded-lg flex items-center justify-center mb-4">
          <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
          <p className="text-red-700">{error || 'プロフィールの読み込みに失敗しました'}</p>
        </div>
        <button 
          className="px-4 py-2 bg-gray-100 rounded-md text-gray-700 hover:bg-gray-200 transition-colors"
          onClick={() => window.location.reload()}
        >
          再読み込み
        </button>
      </div>
    );
  }

  const handleEditClick = () => {
    setIsEditing(true);
    if (onEdit) onEdit();
  };

  return (
    <div className="w-full max-w-4xl mx-auto pb-12">
      <ProfileHeader 
        name={profileData.name}
        bio={profileData.bio}
        profileImage={profileData.profileImage}
        headerImage={profileData.headerImage}
        rating={profileData.rating}
        reviewCount={profileData.reviewCount}
        verificationStatus={profileData.verificationStatus}
        badges={profileData.achievementBadges}
        onEdit={handleEditClick}
      />

      <div className="mt-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <button 
            className="px-4 py-2 bg-white border-b-2 border-blue-600 text-blue-700 font-medium"
            onClick={() => {
              document.getElementById('profile-section')?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            プロフィール
          </button>
          <button 
            className="px-4 py-2 hover:bg-gray-50"
            onClick={() => {
              document.getElementById('experiences-section')?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            体験サンプル
          </button>
          <button 
            className="px-4 py-2 hover:bg-gray-50"
            onClick={() => {
              document.getElementById('availability-section')?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            利用可能時間
          </button>
        </div>

        <div id="profile-section" className="mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-xl font-semibold mb-6">基本情報</h2>
            <div className="grid gap-6">
              {/* 基本情報 */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <span>{profileData.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span>{profileData.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span>{profileData.phoneNumber}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span>{profileData.address}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span>登録日: {new Date(profileData.joinedDate).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="pt-4 border-t">
                <h3 className="text-lg font-medium mb-3">専門分野</h3>
                <div className="flex flex-wrap gap-2">
                  {profileData.expertise.map(skill => (
                    <Badge key={skill} variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                      {EXPERTISE_LABELS[skill] || skill}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* 言語 */}
              {profileData.languages && profileData.languages.length > 0 && (
                <div className="pt-4 border-t">
                  <h3 className="text-lg font-medium mb-3">対応言語</h3>
                  <div className="flex flex-wrap gap-2">
                    {profileData.languages.map(language => (
                      <Badge key={language} variant="outline" className="border-gray-300 hover:bg-gray-100">
                        {language}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* ソーシャルメディアリンク */}
              {profileData.socialMediaLinks && profileData.socialMediaLinks.length > 0 && (
                <div className="pt-4 border-t">
                  <h3 className="text-lg font-medium mb-3">SNSリンク</h3>
                  <div className="flex flex-wrap gap-3">
                    {profileData.socialMediaLinks.map((link, index) => (
                      <a 
                        key={index}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
                      >
                        {SOCIAL_ICONS[link.platform] || SOCIAL_ICONS.default}
                        <span>{link.platform}</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* 編集ボタン */}
              <div className="flex justify-end mt-4">
                <button 
                  className="px-4 py-2 bg-gray-100 rounded-md text-gray-700 hover:bg-gray-200 transition-colors flex items-center"
                  onClick={handleEditClick}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  プロフィールを編集
                </button>
              </div>
            </div>
          </div>
        </div>

        <div id="experiences-section" className="mb-8">
          <ExperienceSamples 
            experiences={profileData.experienceSamples} 
            isEditable={false}
          />
        </div>

        <div id="availability-section">
          <AvailabilityCalendar 
            availability={profileData.availability} 
            isEditable={false}
          />
        </div>
      </div>
    </div>
  );
};

// ローディング中に表示するスケルトン
const ProfileSkeleton: React.FC = () => (
  <div className="w-full max-w-4xl mx-auto pb-12">
    <div className="relative">
      <Skeleton className="w-full h-48 rounded-t-lg" />
      <div className="absolute -bottom-16 left-8">
        <Skeleton className="w-32 h-32 rounded-full border-4 border-white" />
      </div>
    </div>
    
    <div className="mt-20 px-8">
      <Skeleton className="h-8 w-64 mb-2" />
      <Skeleton className="h-4 w-full max-w-md mb-6" />
      
      <div className="flex gap-2 mb-8">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-6 w-24" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
      
      <div className="space-y-4 mb-8">
        <Skeleton className="h-6 w-32 mb-2" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
      
      <div className="space-y-4 mb-8">
        <Skeleton className="h-6 w-32 mb-2" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    </div>
  </div>
);

export default AttenderProfile;
