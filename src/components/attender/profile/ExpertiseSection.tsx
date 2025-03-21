import React, { useState } from 'react';
// モックライブラリをインポート
import { useTranslation } from '../../../mocks/i18nMock';
import {
  Box,
  Typography,
  Chip,
  TextField,
  Button,
  Autocomplete,
  Paper
} from '../../../mocks/materialMock';
import { Add as AddIcon } from '../../../mocks/iconsMock';

interface ExpertiseSectionProps {
  expertise: string[];
  onChange: (expertise: string[]) => void;
  readOnly?: boolean;
}

// 仮の専門分野選択肢（実際の実装ではAPIから取得するか、定数から読み込む）
const EXPERTISE_OPTIONS = [
  'アート',
  '歴史',
  '伝統工芸',
  '食文化',
  '屋台巡り',
  '地元のアンダーグラウンド',
  '音楽',
  'クラフトビール',
  '写真撮影',
  '建築',
  '自然探索',
  '地域コミュニティ',
  '都市探検',
  '路地裏巡り',
  '古書店',
  'ヴィンテージショップ',
  'ストリートアート',
  'ナイトライフ',
  'ローカルフェスティバル',
  '地元市場',
];

const ExpertiseSection: React.FC<ExpertiseSectionProps> = ({
  expertise,
  onChange,
  readOnly = false
}) => {
  const { t } = useTranslation(['attender', 'common']);
  const [newExpertise, setNewExpertise] = useState<string>('');
  const [customInput, setCustomInput] = useState<string>('');

  const handleDelete = (expertiseToDelete: string) => {
    if (readOnly) return;
    const updatedExpertise = expertise.filter(item => item !== expertiseToDelete);
    onChange(updatedExpertise);
  };

  const handleAdd = () => {
    if (readOnly || !newExpertise || expertise.includes(newExpertise)) return;
    
    const updatedExpertise = [...expertise, newExpertise];
    onChange(updatedExpertise);
    setNewExpertise('');
  };

  const handleCustomAdd = () => {
    if (readOnly || !customInput || expertise.includes(customInput)) return;
    
    const updatedExpertise = [...expertise, customInput];
    onChange(updatedExpertise);
    setCustomInput('');
  };

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        {t('profile.expertise.title')}
      </Typography>
      
      <Typography variant="body2" color="text.secondary" mb={2}>
        {t('profile.expertise.description')}
      </Typography>
      
      <Box display="flex" flexWrap="wrap" gap={1} mb={3}>
        {expertise.length > 0 ? (
          expertise.map((item, index) => (
            <Chip
              key={index}
              label={item}
              onDelete={readOnly ? undefined : () => handleDelete(item)}
              color="primary"
              variant="outlined"
            />
          ))
        ) : (
          <Typography variant="body2" color="text.secondary" fontStyle="italic">
            {t('profile.expertise.none')}
          </Typography>
        )}
      </Box>
      
      {!readOnly && (
        <>
          <Box mb={2}>
            <Typography variant="subtitle2" gutterBottom>
              {t('profile.expertise.selectFromOptions')}
            </Typography>
            <Box display="flex" gap={1}>
              <Autocomplete
                value={newExpertise}
                onChange={(_event: React.SyntheticEvent, value: string | null) => setNewExpertise(value || '')}
                options={EXPERTISE_OPTIONS.filter(option => !expertise.includes(option))}
                renderInput={(params: React.ComponentProps<typeof TextField>) => (
                  <TextField
                    {...params}
                    variant="outlined"
                    size="small"
                    placeholder={t('profile.expertise.select')}
                    fullWidth
                  />
                )}
                sx={{ flexGrow: 1 }}
              />
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={handleAdd}
                disabled={!newExpertise}
              >
                {t('common.add')}
              </Button>
            </Box>
          </Box>
          
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              {t('profile.expertise.addCustom')}
            </Typography>
            <Box display="flex" gap={1}>
              <TextField
                value={customInput}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomInput(e.target.value)}
                variant="outlined"
                size="small"
                placeholder={t('profile.expertise.customPlaceholder')}
                fullWidth
              />
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={handleCustomAdd}
                disabled={!customInput}
              >
                {t('common.add')}
              </Button>
            </Box>
          </Box>
        </>
      )}
    </Paper>
  );
};

export default ExpertiseSection;
