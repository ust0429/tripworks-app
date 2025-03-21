import React, { useState, useEffect } from 'react';
// モックライブラリをインポート
import { useTranslation } from '../../../mocks/i18nMock';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Grid,
  Button,
  InputAdornment,
  Divider,
  Chip,
  Autocomplete,
  CircularProgress,
  Alert,
  Stepper,
  Step,
  StepLabel,
  LinearProgress
} from '../../../mocks/materialMock';
import {
  Add as AddIcon,
  AddPhotoAlternate as PhotoIcon
} from '../../../mocks/iconsMock';
import { useApiClient } from '../../../hooks/useApiClient';
import { IExperience, ExperienceStatus } from '../../../types/attender';
import { FileUploader } from '../../common/upload/FileUploader';

interface ExperienceFormProps {
  experienceId?: string;
  onSave?: (experience: IExperience) => void;
  onCancel?: () => void;
}

// 体験カテゴリの選択肢
const CATEGORY_OPTIONS = [
  'アート探索',
  '伝統工芸',
  '食文化',
  '地元フード',
  'ナイトライフ',
  '路地裏散策',
  '写真撮影',
  'ローカルコミュニティ',
  '音楽',
  '建築',
  '自然',
  '歴史'
];

const steps = [
  'basicInfo',
  'details',
  'logistics',
  'images',
  'review'
];

const ExperienceForm: React.FC<ExperienceFormProps> = ({
  experienceId,
  onSave,
  onCancel
}) => {
  const { t } = useTranslation(['attender', 'common']);
  const apiClient = useApiClient();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [experience, setExperience] = useState<Partial<IExperience>>({
    title: '',
    description: '',
    category: [],
    location: {
      address: '',
      latitude: undefined,
      longitude: undefined
    },
    mainImage: '',
    images: [],
    duration: 120,
    price: 5000,
    maxParticipants: 5,
    includesItems: [],
    excludesItems: [],
    requirements: [],
    status: ExperienceStatus.DRAFT
  });

  // 新規追加用のフィールド
  const [newIncludeItem, setNewIncludeItem] = useState<string>('');
  const [newExcludeItem, setNewExcludeItem] = useState<string>('');
  const [newRequirement, setNewRequirement] = useState<string>('');
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  useEffect(() => {
    if (experienceId) {
      loadExperience(experienceId);
    }
  }, [experienceId]);

  const loadExperience = async (id: string) => {
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
          description: '地元のアーティストと一緒に、観光客にはあまり知られていない路地裏のアートスポットを巡ります。',
          category: ['アート探索', '路地裏散策'],
          location: {
            address: '東京都墨田区押上1-1-2',
            latitude: 35.7100,
            longitude: 139.8107
          },
          mainImage: 'https://example.com/main-image.jpg',
          images: [
            'https://example.com/image1.jpg'
          ],
          duration: 180,
          price: 6500,
          maxParticipants: 4,
          includesItems: [
            'ローカルカフェでのドリンク',
            'アートマップ'
          ],
          excludesItems: [
            '交通費'
          ],
          requirements: [
            '歩きやすい靴でお越しください'
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
      console.error('Failed to load experience:', error);
      setError(error.message || t('experience.error.loadFailed'));
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      // ネストされたプロパティの場合
      const [parent, child] = name.split('.');
      setExperience(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof typeof prev] as Record<string, any> || {}),
          [child]: value
        }
      }));
    } else {
      // 通常のプロパティの場合
      setExperience(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = value === '' ? 0 : parseInt(value, 10);
    
    setExperience(prev => ({
      ...prev,
      [name]: numValue
    }));
  };

  const handleCategoryChange = (_: React.SyntheticEvent, newValue: string[]) => {
    setExperience(prev => ({
      ...prev,
      category: newValue
    }));
  };

  const handleAddInclude = () => {
    if (!newIncludeItem.trim()) return;
    
    setExperience(prev => ({
      ...prev,
      includesItems: [...(prev.includesItems || []), newIncludeItem.trim()]
    }));
    setNewIncludeItem('');
  };

  const handleAddExclude = () => {
    if (!newExcludeItem.trim()) return;
    
    setExperience(prev => ({
      ...prev,
      excludesItems: [...(prev.excludesItems || []), newExcludeItem.trim()]
    }));
    setNewExcludeItem('');
  };

  const handleAddRequirement = () => {
    if (!newRequirement.trim()) return;
    
    setExperience(prev => ({
      ...prev,
      requirements: [...(prev.requirements || []), newRequirement.trim()]
    }));
    setNewRequirement('');
  };

  const handleRemoveItem = (field: 'includesItems' | 'excludesItems' | 'requirements', index: number) => {
    setExperience(prev => ({
      ...prev,
      [field]: prev[field]?.filter((_, i) => i !== index)
    }));
  };

  const handleImageUpload = async (file: File, isMainImage: boolean = false) => {
    try {
      setUploadProgress(0);
      
      // 実際の実装ではAPIを使ってファイルをアップロード
      // 進捗状況を追跡するための模擬的な実装
      for (let i = 0; i <= 100; i += 20) {
        await new Promise(resolve => setTimeout(resolve, 100));
        setUploadProgress(i);
      }
      
      // 仮のURL生成
      const imageUrl = URL.createObjectURL(file);
      
      if (isMainImage) {
        setExperience(prev => ({
          ...prev,
          mainImage: imageUrl
        }));
      } else {
        setExperience(prev => ({
          ...prev,
          images: [...(prev.images || []), imageUrl]
        }));
      }
      
      setUploadProgress(0);
    } catch (error) {
      console.error('Failed to upload image:', error);
      setUploadProgress(0);
    }
  };

  const handleRemoveImage = (index: number) => {
    setExperience(prev => ({
      ...prev,
      images: prev.images?.filter((_, i) => i !== index)
    }));
  };

  const handleSetMainImage = (imageUrl: string) => {
    setExperience(prev => ({
      ...prev,
      mainImage: imageUrl
    }));
  };

  const handleNext = () => {
    setActiveStep(prevStep => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep(prevStep => prevStep - 1);
  };

  const handleSave = async (asDraft: boolean = false) => {
    try {
      setSaving(true);
      setError(null);
      
      const finalExperience = {
        ...experience,
        status: asDraft ? ExperienceStatus.DRAFT : ExperienceStatus.PENDING
      };
      
      // 実際の実装ではAPIにデータを送信
      // const response = await apiClient.post('/attender/experiences', finalExperience);
      
      // 仮の実装としてタイムアウトを設定
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (onSave) {
        onSave(finalExperience as IExperience);
      }
    } catch (error: any) {
      console.error('Failed to save experience:', error);
      setError(error.message || t('experience.error.saveFailed'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" my={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box mb={4}>
      <Typography variant="h4" component="h1" gutterBottom>
        {experienceId ? t('experience.edit.title') : t('experience.create.title')}
      </Typography>
      
      <Stepper activeStep={activeStep} sx={{ my: 4 }}>
        {steps.map((stepKey) => (
          <Step key={stepKey}>
            <StepLabel>{t(`experience.steps.${stepKey}`)}</StepLabel>
          </Step>
        ))}
      </Stepper>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Paper elevation={3} sx={{ p: 3 }}>
        {/* ステップ内容 */}
        {/* 各ステップの詳細は重要な部分のみ記載 */}

        {/* ステップボタン */}
        <Box mt={3} display="flex" justifyContent="space-between">
          <Button
            onClick={handleBack}
            disabled={activeStep === 0}
          >
            {t('common.back')}
          </Button>
          
          <Box>
            {activeStep === steps.length - 1 ? (
              <>
                <Button
                  variant="outlined"
                  onClick={() => handleSave(true)}
                  sx={{ mr: 1 }}
                  disabled={saving}
                >
                  {saving ? <CircularProgress size={24} /> : t('experience.saveDraft')}
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handleSave(false)}
                  disabled={saving}
                >
                  {saving ? <CircularProgress size={24} /> : t('experience.submit')}
                </Button>
              </>
            ) : (
              <Button
                variant="contained"
                color="primary"
                onClick={handleNext}
              >
                {t('common.next')}
              </Button>
            )}
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default ExperienceForm;
