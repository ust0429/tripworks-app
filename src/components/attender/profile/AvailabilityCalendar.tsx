import React, { useState } from 'react';
// モックライブラリをインポート
import { useTranslation } from '../../../mocks/i18nMock';
import {
  Box,
  Typography,
  Paper,
  Grid,
  ToggleButton,
  ToggleButtonGroup,
  Slider,
  FormControlLabel,
  Switch,
  Divider
} from '../../../mocks/materialMock';

interface AvailabilityCalendarProps {
  availability: Record<string, any>;
  onChange: (availability: Record<string, any>) => void;
  readOnly?: boolean;
}

// 曜日の配列
const DAYS_OF_WEEK = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

// 時間スロットの生成（8:00 ~ 22:00）
const TIME_SLOTS = Array.from({ length: 15 }, (_, i) => {
  const hour = i + 8;
  return `${hour}:00`;
});

const AvailabilityCalendar: React.FC<AvailabilityCalendarProps> = ({
  availability,
  onChange,
  readOnly = false
}) => {
  const { t } = useTranslation(['attender', 'common']);
  const [selectedDay, setSelectedDay] = useState<string>('monday');
  
  // 初期値の設定
  const initialAvailability = { ...availability };
  DAYS_OF_WEEK.forEach(day => {
    if (!initialAvailability[day]) {
      initialAvailability[day] = {
        available: false,
        timeRange: [9, 17]
      };
    }
  });

  const handleDayChange = (
    _: React.MouseEvent<HTMLElement>,
    newDay: string,
  ) => {
    if (newDay !== null) {
      setSelectedDay(newDay);
    }
  };

  const handleAvailableToggle = (day: string) => {
    if (readOnly) return;
    
    const updatedAvailability = {
      ...initialAvailability,
      [day]: {
        ...initialAvailability[day],
        available: !initialAvailability[day].available
      }
    };
    
    onChange(updatedAvailability);
  };

  const handleTimeRangeChange = (day: string, newValue: number | number[]) => {
    if (readOnly) return;
    
    const updatedAvailability = {
      ...initialAvailability,
      [day]: {
        ...initialAvailability[day],
        timeRange: newValue as number[]
      }
    };
    
    onChange(updatedAvailability);
  };

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        {t('profile.availability.title')}
      </Typography>
      
      <Typography variant="body2" color="text.secondary" mb={2}>
        {t('profile.availability.description')}
      </Typography>
      
      <Box mb={3}>
        <ToggleButtonGroup
          value={selectedDay}
          exclusive
          onChange={handleDayChange}
          aria-label="selected day"
          fullWidth
          size="small"
        >
          {DAYS_OF_WEEK.map((day) => (
            <ToggleButton key={day} value={day} aria-label={day}>
              {t(`common.days.${day}.short`)}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Box>
      
      <Divider sx={{ mb: 3 }} />
      
      <Grid container spacing={3}>
        {DAYS_OF_WEEK.map((day) => (
          <React.Fragment key={day}>
            {selectedDay === day && (
              <>
                <Grid item xs={12}>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="subtitle1">
                      {t(`common.days.${day}.full`)}
                    </Typography>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={initialAvailability[day]?.available || false}
                          onChange={() => handleAvailableToggle(day)}
                          disabled={readOnly}
                          color="primary"
                        />
                      }
                      label={
                        initialAvailability[day]?.available
                          ? t('profile.availability.available')
                          : t('profile.availability.unavailable')
                      }
                    />
                  </Box>
                </Grid>
                
                <Grid item xs={12}>
                  <Box px={2}>
                    <Slider
                      value={initialAvailability[day]?.timeRange || [9, 17]}
                      onChange={(_event: Event, newValue: number[]) => handleTimeRangeChange(day, newValue)}
                      valueLabelDisplay="auto"
                      valueLabelFormat={(value: number) => `${value}:00`}
                      step={1}
                      marks
                      min={8}
                      max={22}
                      disabled={!initialAvailability[day]?.available || readOnly}
                    />
                    
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="caption" color="text.secondary">
                        {t('profile.availability.startTime')}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {t('profile.availability.endTime')}
                      </Typography>
                    </Box>
                    
                    {initialAvailability[day]?.available && (
                      <Box mt={2} p={2} bgcolor="action.hover" borderRadius={1}>
                        <Typography variant="body2">
                          {t('profile.availability.timeRangeDisplay', {
                            day: t(`common.days.${day}.full`),
                            startTime: `${initialAvailability[day]?.timeRange[0]}:00`,
                            endTime: `${initialAvailability[day]?.timeRange[1]}:00`
                          })}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Grid>
              </>
            )}
          </React.Fragment>
        ))}
      </Grid>
    </Paper>
  );
};

export default AvailabilityCalendar;
