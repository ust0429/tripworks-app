import React, { useState, useEffect } from 'react';
// モックライブラリをインポート
import { useTranslation } from '../../../mocks/i18nMock';
import { Button, TextField, Paper, Typography, Grid, Box, CircularProgress } from '../../../mocks/materialMock';
import { IAttenderProfile } from '../../../types/attender';
import { useApiClient } from '../../../hooks/useApiClient';
import ProfileHeaderCompat from './ProfileHeaderCompat';
import ExpertiseSection from './ExpertiseSection';
import AvailabilityCalendarCompat from './AvailabilityCalendarCompat';

interface AttenderProfileFormProps {
  initialProfile?: IAttenderProfile;
  onSave?: (profile: IAttenderProfile) => void;
  readOnly?: boolean;
}

const AttenderProfileForm: React.FC<AttenderProfileFormProps> = ({
  initialProfile,
  onSave,
  readOnly = false
}) => {
  const { t } = useTranslation('attender');
  const apiClient = useApiClient();
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [profile, setProfile] = useState<IAttenderProfile>(initialProfile || {
    id: '',
    userId: '',
    displayName: '',
    bio: '',
    location: '',
    languages: [],
    expertise: [],
    experiences: [],
    availability: {},
    profileImage: '',
    rating: 0,
    reviewCount: 0,
    verified: false,
    createdAt: new Date(),
    updatedAt: new Date()
  });

  useEffect(() => {
    if (!initialProfile && !readOnly) {
      loadProfile();
    }
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/attender/profile');
      setProfile(response.data);
    } catch (error) {
      console.error('Failed to load attender profile:', error);
      // エラー処理
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    if (readOnly) return;
    
    try {
      setSaving(true);
      const response = await apiClient.put('/attender/profile', profile);
      if (onSave) {
        onSave(response.data);
      }
    } catch (error) {
      console.error('Failed to save attender profile:', error);
      // エラー処理
    } finally {
      setSaving(false);
    }
  };

  const handleExpertiseChange = (expertise: string[]) => {
    setProfile(prev => ({
      ...prev,
      expertise
    }));
  };

  const handleAvailabilityChange = (availability: Record<string, any>) => {
    setProfile(prev => ({
      ...prev,
      availability
    }));
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" my={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
      <ProfileHeaderCompat 
        profile={profile} 
        onChange={handleChange} 
        readOnly={readOnly} 
      />
      
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            {t('profile.basicInfo')}
          </Typography>
          <TextField
            fullWidth
            label={t('profile.displayName')}
            name="displayName"
            value={profile.displayName}
            onChange={handleChange}
            margin="normal"
            disabled={readOnly}
            required
          />
          <TextField
            fullWidth
            label={t('profile.location')}
            name="location"
            value={profile.location}
            onChange={handleChange}
            margin="normal"
            disabled={readOnly}
          />
          <TextField
            fullWidth
            label={t('profile.bio')}
            name="bio"
            value={profile.bio}
            onChange={handleChange}
            margin="normal"
            multiline
            rows={4}
            disabled={readOnly}
          />
        </Grid>
        
        <Grid item xs={12}>
          <ExpertiseSection 
            expertise={profile.expertise} 
            onChange={handleExpertiseChange}
            readOnly={readOnly}
          />
        </Grid>
        
        <Grid item xs={12}>
          <AvailabilityCalendarCompat 
            availability={profile.availability} 
            onChange={handleAvailabilityChange}
            readOnly={readOnly}
          />
        </Grid>
      </Grid>
      
      {!readOnly && (
        <Box mt={3} display="flex" justifyContent="flex-end">
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? <CircularProgress size={24} /> : t('common.save')}
          </Button>
        </Box>
      )}
    </Paper>
  );
};

export default AttenderProfileForm;
