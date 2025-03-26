import React, { useState, useEffect } from 'react';
import { useAttenderProfile } from '@/contexts/AttenderProfileContext';
import { Availability } from '@/types/attender/profile';
import { Clock, Save } from 'lucide-react';

interface AvailabilityCalendarProps {
  availability: Availability;
  isEditable?: boolean;
}

// 曜日の日本語表示用マッピング
const DAY_LABELS: Record<string, string> = {
  'monday': '月曜日',
  'tuesday': '火曜日',
  'wednesday': '水曜日',
  'thursday': '木曜日',
  'friday': '金曜日',
  'saturday': '土曜日',
  'sunday': '日曜日',
};

// 曜日の並び順
const DAY_ORDER = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

const AvailabilityCalendar: React.FC<AvailabilityCalendarProps> = ({
  availability,
  isEditable = false
}) => {
  const { updateProfile } = useAttenderProfile();
  const [editedAvailability, setEditedAvailability] = useState<Availability>({ ...availability });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // availabilityが変更されたら編集データも更新
  useEffect(() => {
    if (!isEditing) {
      setEditedAvailability({ ...availability });
    }
  }, [availability, isEditing]);

  // 曜日の利用可能状態を切り替え
  const toggleAvailability = (day: string) => {
    if (!isEditing && !isEditable) return;

    setEditedAvailability(prev => {
      const currentDay = prev[day] || { available: false };
      return {
        ...prev,
        [day]: {
          ...currentDay,
          available: !currentDay.available,
          // 利用可能にする場合、デフォルトの時間を設定
          startTime: !currentDay.available ? (currentDay.startTime || '10:00') : currentDay.startTime,
          endTime: !currentDay.available ? (currentDay.endTime || '18:00') : currentDay.endTime
        }
      };
    });
  };

  // 時間の変更
  const handleTimeChange = (day: string, field: 'startTime' | 'endTime', value: string) => {
    if (!isEditing && !isEditable) return;

    setEditedAvailability(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value
      }
    }));
  };

  // 変更を保存
  const saveChanges = async () => {
    if (!isEditable) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const success = await updateProfile({
        availability: editedAvailability
      });

      if (success) {
        setIsEditing(false);
      } else {
        setSubmitError('利用可能時間の更新に失敗しました');
      }
    } catch (error) {
      console.error('Error updating availability:', error);
      setSubmitError('エラーが発生しました。しばらくしてからお試しください。');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 編集モードを開始
  const startEditing = () => {
    setIsEditing(true);
    setEditedAvailability({ ...availability });
    setSubmitError(null);
  };

  // 編集をキャンセル
  const cancelEditing = () => {
    setIsEditing(false);
    setEditedAvailability({ ...availability });
    setSubmitError(null);
  };

  const currentAvailability = isEditing ? editedAvailability : availability;

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <div className="flex flex-row items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold">利用可能時間</h2>
          <p className="text-gray-500 text-sm">体験を提供できる曜日と時間帯</p>
        </div>
        {isEditable && !isEditing && (
          <button 
            className="px-4 py-2 bg-gray-100 rounded-md text-gray-700 hover:bg-gray-200 transition-colors"
            onClick={startEditing}
          >
            編集
          </button>
        )}
        {isEditable && isEditing && (
          <div className="flex space-x-2">
            <button
              className="px-4 py-2 bg-gray-100 rounded-md text-gray-700 hover:bg-gray-200 transition-colors"
              onClick={cancelEditing}
              disabled={isSubmitting}
            >
              キャンセル
            </button>
            <button
              className="px-4 py-2 bg-blue-600 rounded-md text-white hover:bg-blue-700 transition-colors flex items-center"
              onClick={saveChanges}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span>保存中...</span>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  保存
                </>
              )}
            </button>
          </div>
        )}
      </div>
      {submitError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700">
          {submitError}
        </div>
      )}

      <div className="space-y-4">
        {DAY_ORDER.map(day => {
          const dayAvailability = currentAvailability[day] || { available: false };
          
          return (
            <div key={day} className="flex items-center flex-wrap gap-4 p-2 rounded-lg bg-gray-50">
              <div className="flex items-center min-w-[180px]">
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={dayAvailability.available}
                    onChange={() => toggleAvailability(day)}
                    disabled={!isEditing && !isEditable}
                  />
                  <div className="relative w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  <span className="ms-3">
                    {DAY_LABELS[day]}
                  </span>
                </label>
              </div>
              
              {dayAvailability.available && (
                <div className="flex items-center gap-2 flex-grow">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <div className="flex items-center gap-2">
                    <input
                      type="time"
                      value={dayAvailability.startTime || ''}
                      onChange={(e) => handleTimeChange(day, 'startTime', e.target.value)}
                      disabled={!isEditing && !isEditable}
                      className="w-24 p-1 border border-gray-300 rounded-md"
                    />
                    <span>〜</span>
                    <input
                      type="time"
                      value={dayAvailability.endTime || ''}
                      onChange={(e) => handleTimeChange(day, 'endTime', e.target.value)}
                      disabled={!isEditing && !isEditable}
                      className="w-24 p-1 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>
              )}
              
              {!dayAvailability.available && (
                <span className="text-gray-500">利用不可</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AvailabilityCalendar;
