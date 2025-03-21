import React, { useState, useEffect } from 'react';
// モックライブラリをインポート
import { useTranslation } from '../../../mocks/i18nMock';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Chip,
  Button,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  Alert,
  Rating,
  ImageList,
  ImageListItem
} from '../../../mocks/materialMock';
import {
  AccessTime as TimeIcon,
  Group as PeopleIcon,
  Place as LocationIcon,
  CheckCircle as IncludeIcon,
  Close as ExcludeIcon,
  Info as RequirementIcon,
  Edit as EditIcon
} from '../../../mocks/iconsMock';
import { useApiClient } from '../../../hooks/useApiClient';
import { IExperience, ExperienceStatus } from '../../../types/attender';

interface ExperienceDetailViewProps {
  experienceId: string;
  onEdit?: (experienceId: string) => void;
}

const ExperienceDetailView: React.FC<ExperienceDetailViewProps> = ({
  experienceId,
  onEdit
}) => {
  const { t } = useTranslation(['attender', 'common']);
  const apiClient = useApiClient();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [experience, setExperience] = useState<IExperience | null>(null);

  useEffect(() => {
    if (experienceId) {
      loadExperienceDetail(experienceId);
    }
  }, [experienceId]);

  const loadExperienceDetail = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // 実際の実装ではAPIからデータを取得
      // const response = await apiClient.get(`/attender/experiences/${id}`);
      // setExperience(response.data);
      
      // 仮のデータを設定
      setTimeout(() => {
        setExperience({
          id: id,
          attenderId: 'att-123',
          title: 'ローカルアーティストと巡る路地裏アート探検',
          description: '地元のアーティストと一緒に、観光客にはあまり知られていない路地裏のアートスポットを巡ります。壁画、ストリートアート、ゲリラアートなど、様々な形態の現代アートを見つけながら、その背景や歴史について解説します。途中、地元のカフェでの休憩も含まれています。',
          category: ['アート探索', '路地裏散策', 'ローカルコミュニティ'],
          location: {
            address: '東京都墨田区押上1-1-2',
            latitude: 35.7100,
            longitude: 139.8107
          },
          mainImage: 'https://example.com/main-image.jpg',
          images: [
            'https://example.com/image1.jpg',
            'https://example.com/image2.jpg'
          ],
          duration: 180,
          price: 6500,
          maxParticipants: 4,
          includesItems: [
            'ローカルカフェでのドリンク',
            'アートマップ',
            'オリジナルポストカード'
          ],
          excludesItems: [
            '交通費',
            '追加の飲食'
          ],
          requirements: [
            '歩きやすい靴でお越しください',
            '雨天の場合は傘をご持参ください'
          ],
          status: ExperienceStatus.ACTIVE,
          rating: 4.8,
          reviewCount: 12,
          createdAt: new Date('2025-02-15'),
          updatedAt: new Date('2025-03-10')
        });
        setLoading(false);
      }, 1000);
      
    } catch (error: any) {
      console.error('Failed to load experience details:', error);
      setError(error.message || t('experience.error.loadDetailFailed'));
      setLoading(false);
    }
  };

  // 日付フォーマット用関数
  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" my={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ my: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!experience) {
    return (
      <Alert severity="warning" sx={{ my: 2 }}>
        {t('experience.error.notFound')}
      </Alert>
    );
  }

  return (
    <Box mb={4}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          {t('experience.detail.title')}
        </Typography>
        
        {onEdit && (
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={() => onEdit(experience.id)}
          >
            {t('common.edit')}
          </Button>
        )}
      </Box>
      
      <Paper elevation={3} sx={{ mb: 4 }}>
        <Box
          sx={{
            position: 'relative',
            height: { xs: 200, sm: 300 },
            overflow: 'hidden'
          }}
        >
          <img
            src={experience.mainImage || 'https://via.placeholder.com/1200x400?text=No+Image'}
            alt={experience.title}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
          />
          
          <Box
            sx={{
              position: 'absolute',
              top: 16,
              right: 16,
              display: 'flex',
              gap: 1
            }}
          >
            <Chip
              label={t(`experience.status.${experience.status}`)}
              color={
                experience.status === ExperienceStatus.ACTIVE ? 'success' :
                experience.status === ExperienceStatus.PENDING ? 'warning' :
                experience.status === ExperienceStatus.INACTIVE ? 'error' :
                'default'
              }
              sx={{ fontWeight: 'bold' }}
            />
          </Box>
        </Box>
        
        <Box p={3}>
          <Typography variant="h4" gutterBottom>
            {experience.title}
          </Typography>
          
          <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
            {experience.category.map((category, index) => (
              <Chip key={index} label={category} />
            ))}
          </Box>
          
          <Box display="flex" alignItems="center" mb={2}>
            <Rating value={experience.rating} precision={0.5} readOnly />
            <Typography variant="body2" sx={{ ml: 1 }}>
              ({experience.reviewCount} {t('experience.detail.reviews')})
            </Typography>
          </Box>
          
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={4}>
              <Box display="flex" alignItems="center">
                <TimeIcon color="action" sx={{ mr: 1 }} />
                <Typography variant="body1">
                  {experience.duration} {t('common.minutes')}
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <Box display="flex" alignItems="center">
                <PeopleIcon color="action" sx={{ mr: 1 }} />
                <Typography variant="body1">
                  {t('experience.detail.maxPeople', { count: experience.maxParticipants })}
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <Typography variant="h6" color="primary">
                ¥{experience.price.toLocaleString()}
              </Typography>
            </Grid>
          </Grid>
          
          <Divider sx={{ mb: 3 }} />
          
          <Typography variant="h6" gutterBottom>
            {t('experience.detail.description')}
          </Typography>
          <Typography variant="body1" paragraph>
            {experience.description}
          </Typography>
          
          <Typography variant="h6" gutterBottom>
            {t('experience.detail.location')}
          </Typography>
          <Box display="flex" alignItems="flex-start" mb={3}>
            <LocationIcon color="action" sx={{ mr: 1, mt: 0.5 }} />
            <Typography variant="body1">
              {experience.location.address}
            </Typography>
          </Box>
          
          <Divider sx={{ mb: 3 }} />
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" gutterBottom>
                {t('experience.detail.includes')}
              </Typography>
              <List disablePadding dense>
                {experience.includesItems.map((item, index) => (
                  <ListItem key={index} disablePadding>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <IncludeIcon color="success" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary={item} />
                  </ListItem>
                ))}
              </List>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Typography variant="h6" gutterBottom>
                {t('experience.detail.excludes')}
              </Typography>
              <List disablePadding dense>
                {experience.excludesItems.map((item, index) => (
                  <ListItem key={index} disablePadding>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <ExcludeIcon color="error" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary={item} />
                  </ListItem>
                ))}
              </List>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Typography variant="h6" gutterBottom>
                {t('experience.detail.requirements')}
              </Typography>
              <List disablePadding dense>
                {experience.requirements.map((item, index) => (
                  <ListItem key={index} disablePadding>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <RequirementIcon color="primary" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary={item} />
                  </ListItem>
                ))}
              </List>
            </Grid>
          </Grid>
        </Box>
      </Paper>
      
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          {t('experience.detail.images')}
        </Typography>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <ImageList cols={3} gap={16}>
            {[experience.mainImage, ...experience.images].map((image, index) => (
              <ImageListItem key={index}>
                <img
                  src={image}
                  alt={`${experience.title} - ${index}`}
                  loading="lazy"
                  style={{ borderRadius: 4 }}
                />
              </ImageListItem>
            ))}
          </ImageList>
        </Box>
      </Paper>
      
      <Box display="flex" justifyContent="flex-end" mt={3}>
        <Typography variant="caption" color="text.secondary">
          {t('experience.detail.lastUpdated', { date: formatDate(experience.updatedAt) })}
        </Typography>
      </Box>
    </Box>
  );
};

export default ExperienceDetailView;
