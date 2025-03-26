import React from 'react';
import { IAttenderProfile } from '../../../types/attender';
// モックライブラリをインポート 
import { TextField, Avatar, Badge, Typography, Box } from '../../../mocks/materialMock';

interface ProfileHeaderProps {
  profile: IAttenderProfile;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  readOnly?: boolean;
}

/**
 * 古いIAttenderProfile型互換のプロフィールヘッダーコンポーネント
 */
const ProfileHeaderCompat: React.FC<ProfileHeaderProps> = ({
  profile,
  onChange,
  readOnly = false
}) => {
  return (
    <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'center', sm: 'flex-start' }} mb={3}>
      <Box mr={{ sm: 3 }} mb={{ xs: 2, sm: 0 }} position="relative">
        <Badge
          overlap="circular"
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          badgeContent={
            profile.verified ? (
              <Box 
                sx={{ 
                  bgcolor: 'success.main', 
                  color: 'white', 
                  borderRadius: '50%',
                  width: 20,
                  height: 20,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ✓
              </Box>
            ) : null
          }
        >
          <Avatar
            src={profile.profileImage}
            alt={profile.displayName}
            sx={{ width: 100, height: 100 }}
          />
        </Badge>
        
        {!readOnly && (
          <Box mt={1} textAlign="center">
            <TextField
              name="profileImage"
              label="プロフィール画像URL"
              variant="outlined"
              size="small"
              value={profile.profileImage || ''}
              onChange={onChange}
              placeholder="https://example.com/image.jpg"
              fullWidth
              sx={{ maxWidth: 200 }}
            />
          </Box>
        )}
      </Box>
      
      <Box flex={1}>
        {!readOnly ? (
          <TextField
            name="displayName"
            label="表示名"
            variant="outlined"
            value={profile.displayName}
            onChange={onChange}
            fullWidth
            margin="normal"
          />
        ) : (
          <Typography variant="h4" gutterBottom>
            {profile.displayName}
            {profile.verified && (
              <Box 
                component="span" 
                sx={{ 
                  fontSize: '0.8rem',
                  bgcolor: 'success.light',
                  color: 'success.contrastText',
                  borderRadius: 1,
                  px: 1,
                  py: 0.5,
                  ml: 1,
                  verticalAlign: 'middle'
                }}
              >
                認証済み
              </Box>
            )}
          </Typography>
        )}
        
        <Box display="flex" alignItems="center" flexWrap="wrap" my={1}>
          {profile.rating > 0 && (
            <Box display="flex" alignItems="center" mr={2}>
              <Box sx={{ color: 'warning.main', mr: 0.5 }}>★</Box>
              <Typography variant="body2">
                {profile.rating.toFixed(1)} ({profile.reviewCount}件のレビュー)
              </Typography>
            </Box>
          )}
          
          {profile.location && (
            <Typography variant="body2" color="text.secondary" mr={2}>
              📍 {profile.location}
            </Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default ProfileHeaderCompat;
