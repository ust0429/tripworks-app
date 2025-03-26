import React from 'react';
import { IAvailabilityDay } from '../../../types/attender';
// モックライブラリをインポート
import { 
  Paper, 
  Typography, 
  Box, 
  Grid, 
  FormControlLabel, 
  Switch, 
  Slider, 
  Chip 
} from '../../../mocks/materialMock';

interface AvailabilityCalendarCompatProps {
  availability: Record<string, IAvailabilityDay>;
  onChange?: (availability: Record<string, IAvailabilityDay>) => void;
  readOnly?: boolean;
}

// 曜日の表示名マッピング
const DAY_LABELS: Record<string, string> = {
  mon: '月曜日',
  tue: '火曜日',
  wed: '水曜日',
  thu: '木曜日',
  fri: '金曜日',
  sat: '土曜日',
  sun: '日曜日'
};

// 曜日の順序
const DAY_ORDER = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

/**
 * 旧型IAvailabilityDay互換の利用可能時間カレンダーコンポーネント
 */
const AvailabilityCalendarCompat: React.FC<AvailabilityCalendarCompatProps> = ({
  availability,
  onChange,
  readOnly = false
}) => {
  // 曜日の利用可能状態を切り替え
  const handleToggleDay = (day: string) => {
    if (readOnly || !onChange) return;

    const newAvailability = { ...availability };
    newAvailability[day] = {
      ...newAvailability[day],
      available: !newAvailability[day]?.available
    };
    
    onChange(newAvailability);
  };

  // 時間範囲を変更
  const handleTimeChange = (day: string, timeRange: [number, number]) => {
    if (readOnly || !onChange) return;

    const newAvailability = { ...availability };
    newAvailability[day] = {
      ...newAvailability[day],
      timeRange
    };
    
    onChange(newAvailability);
  };

  // 時間の表示形式を整形
  const formatTime = (hour: number) => {
    return `${hour}:00`;
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        利用可能時間
      </Typography>
      
      <Box mt={3}>
        {DAY_ORDER.map(day => {
          const dayData = availability[day] || { available: false, timeRange: [9, 17] };
          
          return (
            <Box key={day} mb={2} pb={2} borderBottom={1} borderColor="divider">
              <FormControlLabel
                control={
                  <Switch
                    checked={dayData.available}
                    onChange={() => handleToggleDay(day)}
                    disabled={readOnly}
                    color="primary"
                  />
                }
                label={DAY_LABELS[day]}
              />
              
              {dayData.available && (
                <Box mt={1} px={2}>
                  {readOnly ? (
                    <Box display="flex" alignItems="center">
                      <Chip 
                        label={`${formatTime(dayData.timeRange[0])} - ${formatTime(dayData.timeRange[1])}`} 
                        variant="outlined" 
                        size="small" 
                      />
                    </Box>
                  ) : (
                    <Box px={2}>
                      <Slider
                        value={dayData.timeRange}
                        onChange={(e: React.SyntheticEvent, newValue: number | number[]) => handleTimeChange(day, newValue as [number, number])}
                        min={0}
                        max={24}
                        step={1}
                        marks
                        valueLabelDisplay="auto"
                        valueLabelFormat={formatTime}
                        disabled={readOnly}
                      />
                      <Box display="flex" justifyContent="space-between">
                        <Typography variant="caption">
                          {formatTime(dayData.timeRange[0])}
                        </Typography>
                        <Typography variant="caption">
                          {formatTime(dayData.timeRange[1])}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                </Box>
              )}
            </Box>
          );
        })}
      </Box>
    </Paper>
  );
};

export default AvailabilityCalendarCompat;
