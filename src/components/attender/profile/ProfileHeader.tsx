import React, { useState } from 'react';
// モックライブラリをインポート
import { useTranslation } from '../../../mocks/i18nMock';
import { 
  Box, 
  Avatar, 
  Typography, 
  Rating, 
  Chip,
  IconButton,
  Badge,
  Skeleton
} from '../../../mocks/materialMock';
import { PhotoCamera as PhotoCameraIcon, Verified as VerifiedIcon } from '../../../mocks/iconsMock';
import { IAttenderProfile } from '../../../types/attender';
import { FileUploader } from '../../common/upload/FileUploader';

interface ProfileHeaderProps {
  profile: IAttenderProfile;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  readOnly?: boolean;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ 
  profile, 
  onChange,
  readOnly = false
}) => {
  const { t } = useTranslation(['attender', 'common']);
  const [uploading, setUploading] = useState<boolean>(false);
  
  const handleProfileImageUpload = async (file: File) => {
    if (readOnly) return;
    
    try {
      setUploading(true);
      
      // 実際の実装ではここでファイルをアップロードするAPIを呼び出す
      // const response = await apiClient.uploadFile('/attender/profile-image', file);
      // 仮の実装としてタイムアウトを設定
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // 仮のURLを生成 (実際の実装では返却されたURLを使用)
      const imageUrl = URL.createObjectURL(file);
      
      // プロフィール画像の更新をシミュレート
      const event = {
        target: {
          name: 'profileImage',
          value: imageUrl
        }
      } as React.ChangeEvent<HTMLInputElement>;
      
      onChange(event);
    } catch (error) {
      console.error('Failed to upload profile image:', error);
      // エラー処理
    } finally {
      setUploading(false);
    }
  };

  return (
    <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'center', sm: 'flex-start' }} gap={2}>
      <Box position="relative">
        <Badge
          overlap="circular"
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          badgeContent={
            !readOnly ? (
              <FileUploader
                accept="image/*"
                onFileSelected={handleProfileImageUpload}
                disabled={uploading}
              >
                <IconButton
                  color="primary"
                  aria-label="upload picture"
                  component="span"
                  sx={{
                    bgcolor: 'background.paper',
                    '&:hover': {
                      bgcolor: 'primary.light',
                    },
                  }}
                >
                  <PhotoCameraIcon />
                </IconButton>
              </FileUploader>
            ) : null
          }
        >
          {uploading ? (
            <Skeleton variant="circular" width={120} height={120} />
          ) : (
            <Avatar
              src={profile.profileImage}
              alt={profile.displayName}
              sx={{ width: 120, height: 120 }}
            />
          )}
        </Badge>
      </Box>
      
      <Box display="flex" flexDirection="column" justifyContent="center">
        <Box display="flex" alignItems="center" gap={1}>
          <Typography variant="h5" component="h1">
            {profile.displayName || t('profile.noDisplayName')}
          </Typography>
          
          {profile.verified && (
            <Chip 
              icon={<VerifiedIcon />} 
              label={t('profile.verified')} 
              color="primary" 
              size="small" 
              variant="outlined"
            />
          )}
        </Box>
        
        <Box display="flex" alignItems="center" mt={1}>
          <Rating value={profile.rating || 0} precision={0.5} readOnly size="small" />
          <Typography variant="body2" sx={{ ml: 1 }}>
            ({profile.reviewCount || 0} {t('profile.reviews')})
          </Typography>
        </Box>
        
        <Typography variant="body2" color="text.secondary" mt={1}>
          {profile.location ? (
            profile.location
          ) : (
            <em>{t('profile.noLocation')}</em>
          )}
        </Typography>
        
        {profile.languages && profile.languages.length > 0 && (
          <Box display="flex" gap={1} mt={1} flexWrap="wrap">
            {profile.languages.map((language, index) => (
              <Chip 
                key={index} 
                label={language} 
                size="small" 
                variant="outlined"
              />
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default ProfileHeader;
