import React, { useState, useEffect } from 'react';
import { DailyAvailability, AvailabilityTimeSlot } from '../../../types/attender/profile';
import { cn } from '../../../utils/cn';

interface AvailabilityCalendarProps {
  availability: DailyAvailability[];
  isEditing: boolean;
  onChange?: (availability: DailyAvailability[]) => void;
}

const DAYS_OF_WEEK = ['日', '月', '火', '水', '木', '金', '土'];

/**
 * 利用可能時間設定カレンダーコンポーネント
 */
const AvailabilityCalendar: React.FC<AvailabilityCalendarProps> = ({
  availability,
  isEditing,
  onChange,
}) => {
  const [localAvailability, setLocalAvailability] = useState<DailyAvailability[]>(availability);

  useEffect(() => {
    setLocalAvailability(availability);
  }, [availability]);

  // 曜日の有効/無効を切り替え
  const toggleDayAvailability = (dayOfWeek: number) => {
    if (!isEditing) return;

    const updatedAvailability = localAvailability.map(day => {
      if (day.dayOfWeek === dayOfWeek) {
        // 無効化する場合は時間枠もクリア
        return {
          ...day,
          isAvailable: !day.isAvailable,
          timeSlots: !day.isAvailable ? day.timeSlots : []
        };
      }
      return day;
    });

    setLocalAvailability(updatedAvailability);
    onChange?.(updatedAvailability);
  };

  // 時間枠を追加
  const addTimeSlot = (dayOfWeek: number) => {
    if (!isEditing) return;

    const defaultSlot: AvailabilityTimeSlot = {
      dayOfWeek: dayOfWeek,
      startTime: '10:00',
      endTime: '18:00',
      isAvailable: true
    };

    const updatedAvailability = localAvailability.map(day => {
      if (day.dayOfWeek === dayOfWeek) {
        return {
          ...day,
          timeSlots: [...day.timeSlots, defaultSlot]
        };
      }
      return day;
    });

    setLocalAvailability(updatedAvailability);
    onChange?.(updatedAvailability);
  };

  // 時間枠を更新
  const updateTimeSlot = (dayOfWeek: number, index: number, field: keyof AvailabilityTimeSlot, value: string) => {
    if (!isEditing) return;

    const updatedAvailability = localAvailability.map(day => {
      if (day.dayOfWeek === dayOfWeek) {
        const updatedSlots = [...day.timeSlots];
        updatedSlots[index] = {
          ...updatedSlots[index],
          [field]: value
        };
        return {
          ...day,
          timeSlots: updatedSlots
        };
      }
      return day;
    });

    setLocalAvailability(updatedAvailability);
    onChange?.(updatedAvailability);
  };

  // 時間枠を削除
  const removeTimeSlot = (dayOfWeek: number, index: number) => {
    if (!isEditing) return;

    const updatedAvailability = localAvailability.map(day => {
      if (day.dayOfWeek === dayOfWeek) {
        const updatedSlots = [...day.timeSlots];
        updatedSlots.splice(index, 1);
        return {
          ...day,
          timeSlots: updatedSlots
        };
      }
      return day;
    });

    setLocalAvailability(updatedAvailability);
    onChange?.(updatedAvailability);
  };

  // 時間は30分単位で選択可能
  const timeOptions = [
    '00:00', '00:30', '01:00', '01:30', '02:00', '02:30', '03:00', '03:30',
    '04:00', '04:30', '05:00', '05:30', '06:00', '06:30', '07:00', '07:30',
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30',
    '20:00', '20:30', '21:00', '21:30', '22:00', '22:30', '23:00', '23:30'
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-semibold mb-4">利用可能時間</h2>
      
      <div className="space-y-4">
        {localAvailability.map(day => (
          <div key={day.dayOfWeek} className="border-b pb-4">
            <div className="flex items-center mb-2">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id={`day-${day.dayOfWeek}`}
                  checked={day.isAvailable}
                  onChange={() => toggleDayAvailability(day.dayOfWeek)}
                  disabled={!isEditing}
                  className="h-4 w-4 text-blue-600 rounded"
                />
                <label htmlFor={`day-${day.dayOfWeek}`} className="ml-2 font-medium">
                  {DAYS_OF_WEEK[day.dayOfWeek]}曜日
                </label>
              </div>
              
              {isEditing && day.isAvailable && (
                <button
                  type="button"
                  onClick={() => addTimeSlot(day.dayOfWeek)}
                  className="ml-auto text-sm text-blue-600 hover:text-blue-800"
                >
                  時間枠を追加
                </button>
              )}
            </div>
            
            {day.isAvailable && (
              <div className="pl-6 space-y-2">
                {day.timeSlots.length === 0 ? (
                  <p className="text-gray-500 text-sm italic">
                    {isEditing 
                      ? '「時間枠を追加」ボタンをクリックして時間を設定してください'
                      : '時間枠が設定されていません'}
                  </p>
                ) : (
                  day.timeSlots.map((slot, index) => (
                    <div key={index} className="flex items-center gap-2">
                      {isEditing ? (
                        <>
                          <select
                            value={slot.startTime}
                            onChange={(e) => updateTimeSlot(day.dayOfWeek, index, 'startTime', e.target.value)}
                            className="p-1 text-sm border rounded"
                          >
                            {timeOptions.map(time => (
                              <option key={`start-${time}`} value={time}>{time}</option>
                            ))}
                          </select>
                          <span>〜</span>
                          <select
                            value={slot.endTime}
                            onChange={(e) => updateTimeSlot(day.dayOfWeek, index, 'endTime', e.target.value)}
                            className="p-1 text-sm border rounded"
                          >
                            {timeOptions.map(time => (
                              <option key={`end-${time}`} value={time}>{time}</option>
                            ))}
                          </select>
                          
                          <button
                            type="button"
                            onClick={() => removeTimeSlot(day.dayOfWeek, index)}
                            className="ml-2 text-red-500 hover:text-red-700"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </>
                      ) : (
                        <span className="text-gray-700">
                          {slot.startTime} 〜 {slot.endTime}
                        </span>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AvailabilityCalendar;
