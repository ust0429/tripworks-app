import React from 'react';
import { IAttenderProfile } from '../../../types/attender';
// MaterialUIのモックを使用
import { Avatar, Typography, Box, Button } from '../../../mocks/materialMock';

interface LegacyProfileHeaderProps {
  profile: IAttenderProfile;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  readOnly?: boolean;
}

/**
 * 旧型のプロフィールヘッダーコンポーネント
 * AttenderProfileFormと互換性を持たせるためのもの
 */
const LegacyProfileHeader: React.FC<LegacyProfileHeaderProps> = ({
  profile,
  onChange,
  readOnly = false
}) => {
  return (
    <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'center', sm: 'flex-start' }} mb={3}>
      <Avatar
        src={profile.profileImage || undefined}
        alt={profile.displayName}
        sx={{ width: 100, height: 100, mb: { xs: 2, sm: 0 }, mr: { sm: 3 } }}
      />
      
      <Box flex={1}>
        <Typography variant="h5" gutterBottom>
          {profile.displayName}
          {profile.verified && (
            <Box component="span" sx={{ ml: 1, color: 'primary.main', fontSize: '1rem', verticalAlign: 'middle' }}>
              ✓
            </Box>
          )}
        </Typography>
        
        <Typography variant="body1" color="text.secondary" paragraph>
          {profile.location && `${profile.location} • `}
          {profile.expertise && profile.expertise.length > 0 && `専門: ${profile.expertise.join(', ')}`}
        </Typography>
        
        <Typography variant="body2" paragraph>
          {profile.bio}
        </Typography>
        
        {!readOnly && (
          <Box sx={{ mt: 2 }}>
            <input
              type="file"
              id="profile-image-upload"
              style={{ display: 'none' }}
              accept="image/*"
              // onChange={handleImageUpload} // この機能は実際のAPIと連携する際に実装
            />
            <label htmlFor="profile-image-upload">
              <Button
                variant="outlined"
                component="span"
                size="small"
                sx={{ mr: 1 }}
              >
                写真を変更
              </Button>
            </label>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default LegacyProfileHeader;
