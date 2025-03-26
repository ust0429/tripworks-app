import React, { useState } from 'react';
// モックライブラリをインポート
import { 
  Paper, 
  Typography, 
  Box, 
  Chip, 
  TextField, 
  Button 
} from '../../../mocks/materialMock';
import { useTranslation } from '../../../mocks/i18nMock';

interface ExpertiseSectionProps {
  expertise: string[];
  onChange?: (expertise: string[]) => void;
  readOnly?: boolean;
}

/**
 * 専門分野セクションコンポーネント
 */
const ExpertiseSection: React.FC<ExpertiseSectionProps> = ({
  expertise,
  onChange,
  readOnly = false
}) => {
  const { t } = useTranslation('attender');
  const [newExpertise, setNewExpertise] = useState<string>('');

  // 専門分野を追加
  const handleAddExpertise = () => {
    if (!newExpertise.trim() || readOnly || !onChange) return;
    
    const updatedExpertise = [...expertise, newExpertise.trim()];
    onChange(updatedExpertise);
    setNewExpertise('');
  };

  // 専門分野を削除
  const handleDeleteExpertise = (index: number) => {
    if (readOnly || !onChange) return;
    
    const updatedExpertise = [...expertise];
    updatedExpertise.splice(index, 1);
    onChange(updatedExpertise);
  };

  // Enterキーでの追加対応
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddExpertise();
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        {t('profile.expertise')}
      </Typography>
      
      <Box display="flex" flexWrap="wrap" gap={1} mb={3}>
        {expertise.length > 0 ? (
          expertise.map((item, index) => (
            <Chip
              key={index}
              label={item}
              onDelete={readOnly ? undefined : () => handleDeleteExpertise(index)}
              color="primary"
              variant="outlined"
            />
          ))
        ) : (
          <Typography variant="body2" color="text.secondary">
            {t('profile.noExpertise')}
          </Typography>
        )}
      </Box>
      
      {!readOnly && (
        <Box display="flex" gap={2}>
          <TextField
            value={newExpertise}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewExpertise(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={t('profile.addExpertise')}
            size="small"
            fullWidth
          />
          <Button 
            variant="outlined" 
            onClick={handleAddExpertise}
            disabled={!newExpertise.trim()}
          >
            {t('common.add')}
          </Button>
        </Box>
      )}
    </Paper>
  );
};

export default ExpertiseSection;
