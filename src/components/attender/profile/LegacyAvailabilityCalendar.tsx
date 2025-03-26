import React from 'react';
import { IAvailabilityDay } from '../../../types/attender';
import { Box, Typography, FormControlLabel, Switch, Slider } from '../../../mocks/materialMock';

interface LegacyAvailabilityCalendarProps {
  availability: Record<string, IAvailabilityDay>;
  onChange?: (availability: Record<string, IAvailabilityDay>) => void;
  readOnly?: boolean;
}

const DAYS_OF_WEEK = {
  'sun': '日曜日',
  'mon': '月曜日',
  'tue': '火曜日',
  'wed': '水曜日',
  'thu': '木曜日',
  'fri': '金曜日',
  'sat': '土曜日'
};

/**
 * 旧型の利用可能時間カレンダーコンポーネント
 * AttenderProfileFormと互換性を持たせるためのもの
 */
const LegacyAvailabilityCalendar: React.FC<LegacyAvailabilityCalendarProps> = ({
  availability,
  onChange,
  readOnly = false
}) => {
  const handleAvailabilityToggle = (day: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    if (readOnly || !onChange) return;
    
    const newAvailability = { ...availability };
    newAvailability[day] = {
      ...newAvailability[day],
      available: event.target.checked
    };
    
    onChange(newAvailability);
  };
  
  const handleTimeRangeChange = (day: string) => (event: Event, newValue: number | number[]) => {
    if (readOnly || !onChange) return;
    
    const timeRange = newValue as number[];
    const newAvailability = { ...availability };
    newAvailability[day] = {
      ...newAvailability[day],
      timeRange: [timeRange[0], timeRange[1]]
    };
    
    onChange(newAvailability);
  };
  
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        利用可能時間
      </Typography>
      
      {Object.entries(DAYS_OF_WEEK).map(([dayKey, dayName]) => {
        const dayData = availability[dayKey] || { available: false, timeRange: [9, 17] };
        
        return (
          <Box key={dayKey} sx={{ mb: 2, pb: 2, borderBottom: 1, borderColor: 'divider' }}>
            <FormControlLabel
              control={
                <Switch
                  checked={dayData.available}
                  onChange={handleAvailabilityToggle(dayKey)}
                  disabled={readOnly}
                />
              }
              label={dayName}
            />
            
            {dayData.available && (
              <Box sx={{ px: 2, mt: 1 }}>
                <Slider
                  value={dayData.timeRange}
                  onChange={handleTimeRangeChange(dayKey)}
                  valueLabelDisplay="auto"
                  step={1}
                  marks
                  min={0}
                  max={24}
                  disabled={readOnly}
                  valueLabelFormat={(value: number) => `${value}:00`}
                  sx={{ mt: 4 }}
                />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    {dayData.timeRange[0]}:00
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {dayData.timeRange[1]}:00
                  </Typography>
                </Box>
              </Box>
            )}
          </Box>
        );
      })}
    </Box>
  );
};

export default LegacyAvailabilityCalendar;
