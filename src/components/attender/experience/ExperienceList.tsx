import React, { useState, useEffect } from 'react';
// モックライブラリをインポート
import { useTranslation } from '../../../mocks/i18nMock';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Rating,
  Divider
} from '../../../mocks/materialMock';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Add as AddIcon
} from '../../../mocks/iconsMock';
import { useApiClient } from '../../../hooks/useApiClient';
import { IExperience, ExperienceStatus } from '../../../types/attender';

interface ExperienceListProps {
  onEdit?: (experienceId: string) => void;
  onAdd?: () => void;
}

const ExperienceList: React.FC<ExperienceListProps> = ({
  onEdit,
  onAdd
}) => {
  const { t } = useTranslation(['attender', 'common']);
  const apiClient = useApiClient();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [experiences, setExperiences] = useState<IExperience[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedExperienceId, setSelectedExperienceId] = useState<string | null>(null);

  useEffect(() => {
    fetchExperiences();
  }, []);

  const fetchExperiences = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // 実際の実装ではAPIからデータを取得
      // const response = await apiClient.get('/attender/experiences');
      // setExperiences(response.data);
      
      // 仮のデータを設定
      setTimeout(() => {
        setExperiences([
          {
            id: 'exp-1',
            attenderId: 'att-123',
            title: 'ローカルアーティストと巡る路地裏アート探検',
            description: '地元のアーティストと一緒に、観光客にはあまり知られていない路地裏のアートスポットを巡ります。',
            category: ['アート探索', '路地裏散策'],
            location: {
              address: '東京都墨田区押上1-1-2',
              latitude: 35.7100,
              longitude: 139.8107
            },
            mainImage: 'https://example.com/main-image.jpg',
            images: ['https://example.com/image1.jpg'],
            duration: 180,
            price: 6500,
            maxParticipants: 4,
            includesItems: ['カフェでのドリンク', 'アートマップ'],
            excludesItems: ['交通費'],
            requirements: ['歩きやすい靴でお越しください'],
            status: ExperienceStatus.ACTIVE,
            rating: 4.8,
            reviewCount: 12,
            createdAt: new Date('2025-02-15'),
            updatedAt: new Date('2025-03-10')
          },
          {
            id: 'exp-2',
            attenderId: 'att-123',
            title: '伝統工芸の職人と作る和紙クラフトワークショップ',
            description: '伝統的な和紙作りの技術を学びながら、オリジナルの和紙アート作品を制作します。',
            category: ['伝統工芸', 'ワークショップ'],
            location: {
              address: '東京都台東区谷中3-5-1',
              latitude: 35.7234,
              longitude: 139.7671
            },
            mainImage: 'https://example.com/main-image2.jpg',
            images: ['https://example.com/image2.jpg'],
            duration: 120,
            price: 5000,
            maxParticipants: 6,
            includesItems: ['材料費', 'お茶菓子'],
            excludesItems: ['交通費'],
            requirements: [],
            status: ExperienceStatus.DRAFT,
            rating: 0,
            reviewCount: 0,
            createdAt: new Date('2025-03-01'),
            updatedAt: new Date('2025-03-01')
          },
          {
            id: 'exp-3',
            attenderId: 'att-123',
            title: '地元シェフと巡る朝市ツアーと料理体験',
            description: '地元の朝市で旬の食材を選び、プロのシェフと一緒に日本の家庭料理を作ります。',
            category: ['食文化', '地元フード'],
            location: {
              address: '神奈川県鎌倉市小町1-4-5',
              latitude: 35.3192,
              longitude: 139.5505
            },
            mainImage: 'https://example.com/main-image3.jpg',
            images: ['https://example.com/image3.jpg'],
            duration: 240,
            price: 9800,
            maxParticipants: 4,
            includesItems: ['食材費', 'エプロン貸出', '料理のレシピ'],
            excludesItems: ['交通費', 'アルコール'],
            requirements: ['食物アレルギーがある場合は事前にお知らせください'],
            status: ExperienceStatus.PENDING,
            rating: 0,
            reviewCount: 0,
            createdAt: new Date('2025-03-10'),
            updatedAt: new Date('2025-03-10')
          }
        ]);
        setLoading(false);
      }, 1000);
      
    } catch (error: any) {
      console.error('Failed to fetch experiences:', error);
      setError(error.message || t('experience.error.fetchFailed'));
      setLoading(false);
    }
  };

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>, experienceId: string) => {
    setAnchorEl(event.currentTarget);
    setSelectedExperienceId(experienceId);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setSelectedExperienceId(null);
  };

  const handleEdit = () => {
    if (selectedExperienceId && onEdit) {
      onEdit(selectedExperienceId);
    }
    handleCloseMenu();
  };

  const handleDelete = async () => {
    if (!selectedExperienceId) return;
    
    if (window.confirm(t('experience.confirmDelete'))) {
      try {
        // 実際の実装ではAPIを呼び出して削除
        // await apiClient.delete(`/attender/experiences/${selectedExperienceId}`);
        
        // 仮の実装としてローカルの状態のみ更新
        setExperiences(prev => prev.filter(exp => exp.id !== selectedExperienceId));
        
      } catch (error) {
        console.error('Failed to delete experience:', error);
        // エラーハンドリング
      }
    }
    
    handleCloseMenu();
  };

  const handleToggleStatus = async () => {
    if (!selectedExperienceId) return;
    
    try {
      const experience = experiences.find(exp => exp.id === selectedExperienceId);
      if (!experience) return;
      
      const newStatus = experience.status === ExperienceStatus.ACTIVE 
        ? ExperienceStatus.INACTIVE 
        : ExperienceStatus.ACTIVE;
      
      // 実際の実装ではAPIを呼び出してステータスを変更
      // await apiClient.patch(`/attender/experiences/${selectedExperienceId}`, {
      //   status: newStatus
      // });
      
      // 仮の実装としてローカルの状態のみ更新
      setExperiences(prev => prev.map(exp => 
        exp.id === selectedExperienceId 
          ? { ...exp, status: newStatus } 
          : exp
      ));
      
    } catch (error) {
      console.error('Failed to toggle experience status:', error);
      // エラーハンドリング
    }
    
    handleCloseMenu();
  };

  const handleStatusFilterChange = (_: React.SyntheticEvent, newValue: string) => {
    setStatusFilter(newValue);
  };

  // ステータスでフィルタリング
  const filteredExperiences = experiences.filter(exp => {
    if (statusFilter === 'all') return true;
    return exp.status === statusFilter;
  });

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

  return (
    <Box mb={4}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          {t('experience.list.title')}
        </Typography>
        
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={onAdd}
        >
          {t('experience.list.addNew')}
        </Button>
      </Box>
      
      <Tabs
        value={statusFilter}
        onChange={handleStatusFilterChange}
        sx={{ mb: 3 }}
      >
        <Tab value="all" label={t('experience.list.filter.all')} />
        <Tab value={ExperienceStatus.ACTIVE} label={t('experience.list.filter.active')} />
        <Tab value={ExperienceStatus.DRAFT} label={t('experience.list.filter.draft')} />
        <Tab value={ExperienceStatus.PENDING} label={t('experience.list.filter.pending')} />
        <Tab value={ExperienceStatus.INACTIVE} label={t('experience.list.filter.inactive')} />
      </Tabs>
      
      {filteredExperiences.length === 0 ? (
        <Alert severity="info">
          {t('experience.list.empty')}
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {filteredExperiences.map((experience) => (
            <Grid item xs={12} sm={6} md={4} key={experience.id}>
              <Card elevation={3}>
                <Box sx={{ position: 'relative' }}>
                  <CardMedia
                    component="img"
                    height="180"
                    image={experience.mainImage || 'https://via.placeholder.com/300x180?text=No+Image'}
                    alt={experience.title}
                  />
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
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
                      size="small"
                      sx={{ fontWeight: 'bold' }}
                    />
                  </Box>
                </Box>
                
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {experience.title}
                  </Typography>
                  
                  <Box display="flex" alignItems="center" mb={1}>
                    {experience.reviewCount > 0 ? (
                      <>
                        <Rating value={experience.rating} precision={0.5} readOnly size="small" />
                        <Typography variant="body2" sx={{ ml: 1 }}>
                          ({experience.reviewCount})
                        </Typography>
                      </>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        {t('experience.list.noReviews')}
                      </Typography>
                    )}
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {experience.description.length > 100
                      ? `${experience.description.substring(0, 100)}...`
                      : experience.description}
                  </Typography>
                  
                  <Box display="flex" flexWrap="wrap" gap={0.5} mb={2}>
                    {experience.category.map((category, index) => (
                      <Chip key={index} label={category} size="small" />
                    ))}
                  </Box>
                  
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      borderTop: '1px solid',
                      borderColor: 'divider',
                      pt: 1
                    }}
                  >
                    <Typography variant="body2">
                      <strong>{t('experience.details.duration')}:</strong> {experience.duration}分
                    </Typography>
                    <Typography variant="body2">
                      <strong>{t('experience.details.price')}:</strong> ¥{experience.price.toLocaleString()}
                    </Typography>
                  </Box>
                </CardContent>
                
                <Divider />
                
                <CardActions
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between'
                  }}
                >
                  <Typography variant="caption" color="text.secondary">
                    {t('experience.list.created')}: {formatDate(experience.createdAt)}
                  </Typography>
                  
                  <Box>
                    <IconButton
                      size="small"
                      onClick={() => onEdit && onEdit(experience.id)}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={(e: React.MouseEvent<HTMLElement>) => handleOpenMenu(e, experience.id)}
                    >
                      <MoreIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
      
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
      >
        <MenuItem onClick={handleEdit}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          {t('common.edit')}
        </MenuItem>
        <MenuItem onClick={handleToggleStatus}>
          {experiences.find(exp => exp.id === selectedExperienceId)?.status === ExperienceStatus.ACTIVE ? (
            <>
              <VisibilityOffIcon fontSize="small" sx={{ mr: 1 }} />
              {t('experience.list.deactivate')}
            </>
          ) : (
            <>
              <VisibilityIcon fontSize="small" sx={{ mr: 1 }} />
              {t('experience.list.activate')}
            </>
          )}
        </MenuItem>
        <MenuItem onClick={handleDelete}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          {t('common.delete')}
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default ExperienceList;
