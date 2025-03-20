/**
 * 利用可能時間ステップ
 * 
 * アテンダー申請フォームの利用可能時間を入力するステップ
 */
import React, { useState, useEffect } from 'react';
import { useAttenderApplication } from '../../../../contexts/AttenderApplicationContext';
import { AvailabilityTimeSlot } from '../../../../types/attender';

interface AvailabilityStepProps {
  onNext: () => void;
  onBack: () => void;
}

const AvailabilityStep: React.FC<AvailabilityStepProps> = ({ onNext, onBack }) => {
  const { formData, updateAvailabilityTimes, errors, clearError } = useAttenderApplication();
  
  // 曜日のリスト
  const weekdays = [
    { value: 0, label: '日曜日' },
    { value: 1, label: '月曜日' },
    { value: 2, label: '火曜日' },
    { value: 3, label: '水曜日' },
    { value: 4, label: '木曜日' },
    { value: 5, label: '金曜日' },
    { value: 6, label: '土曜日' }
  ];
  
  // 時間のオプション生成
  const timeOptions: string[] = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const formattedHour = hour.toString().padStart(2, '0');
      const formattedMinute = minute.toString().padStart(2, '0');
      timeOptions.push(`${formattedHour}:${formattedMinute}`);
    }
  }
  
  // 初期状態の設定
  useEffect(() => {
    if (!formData.availableTimes || formData.availableTimes.length === 0) {
      // 初期状態として、すべての曜日に非活動状態のスロットを作成
      const initialTimeSlots: AvailabilityTimeSlot[] = weekdays.map(day => ({
        dayOfWeek: day.value as 0 | 1 | 2 | 3 | 4 | 5 | 6,
        startTime: '09:00',
        endTime: '17:00',
        isAvailable: false
      }));
      
      updateAvailabilityTimes(initialTimeSlots);
    }
  }, [formData.availableTimes, updateAvailabilityTimes]);
  
  // 利用可能時間の変更ハンドラ
  const handleAvailabilityChange = (index: number, field: keyof AvailabilityTimeSlot, value: any) => {
    if (!formData.availableTimes) return;
    
    const updatedTimeSlots = [...formData.availableTimes];
    updatedTimeSlots[index] = {
      ...updatedTimeSlots[index],
      [field]: value
    };
    
    updateAvailabilityTimes(updatedTimeSlots);
    clearError('availableTimes');
  };
  
  // 時間スロットの追加ハンドラ
  const handleAddTimeSlot = (dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6) => {
    if (!formData.availableTimes) return;
    
    const newTimeSlot: AvailabilityTimeSlot = {
      dayOfWeek,
      startTime: '09:00',
      endTime: '17:00',
      isAvailable: true
    };
    
    const updatedTimeSlots = [...formData.availableTimes, newTimeSlot];
    updateAvailabilityTimes(updatedTimeSlots);
  };
  
  // 時間スロットの削除ハンドラ
  const handleRemoveTimeSlot = (index: number) => {
    if (!formData.availableTimes) return;
    
    const updatedTimeSlots = formData.availableTimes.filter((_, i) => i !== index);
    updateAvailabilityTimes(updatedTimeSlots);
  };
  
  // 特定の曜日の利用可能時間を取得
  const getTimeSlotsForDay = (dayOfWeek: number) => {
    return formData.availableTimes?.filter(slot => slot.dayOfWeek === dayOfWeek) || [];
  };
  
  // 特定の曜日が活動可能かどうかを取得
  const isDayAvailable = (dayOfWeek: number) => {
    return getTimeSlotsForDay(dayOfWeek).some(slot => slot.isAvailable);
  };
  
  return (
    <div className="space-y-8">
      <h2 className="text-xl font-semibold mb-4">活動可能時間</h2>
      <p className="text-sm text-gray-500 mb-6">
        あなたが体験を提供できる曜日と時間帯を設定してください。
        少なくとも1つの曜日で活動可能時間を設定する必要があります。
      </p>
      
      {/* 曜日ごとの設定 */}
      <div className="space-y-6">
        {weekdays.map(day => (
          <div key={day.value} className="border rounded-md p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">{day.label}</h3>
              <div className="flex items-center">
                <span className="mr-2 text-sm">
                  {isDayAvailable(day.value) ? (
                    <span className="text-green-600">活動可能</span>
                  ) : (
                    <span className="text-gray-500">活動不可</span>
                  )}
                </span>
                <button
                  type="button"
                  onClick={() => handleAddTimeSlot(day.value as 0 | 1 | 2 | 3 | 4 | 5 | 6)}
                  className="ml-2 inline-flex items-center px-2.5 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  時間帯を追加
                </button>
              </div>
            </div>
            
            {/* 時間スロットのリスト */}
            <div className="space-y-3">
              {getTimeSlotsForDay(day.value).map((timeSlot, index) => {
                const globalIndex = formData.availableTimes?.indexOf(timeSlot) || 0;
                
                return (
                  <div key={index} className="flex flex-wrap items-center gap-3 p-3 bg-gray-50 rounded-md">
                    <div className="flex items-center">
                      <input
                        id={`available-${day.value}-${index}`}
                        type="checkbox"
                        checked={timeSlot.isAvailable}
                        onChange={(e) => handleAvailabilityChange(globalIndex, 'isAvailable', e.target.checked)}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label htmlFor={`available-${day.value}-${index}`} className="ml-2 block text-sm font-medium text-gray-700">
                        活動可能
                      </label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <select
                        value={timeSlot.startTime}
                        onChange={(e) => handleAvailabilityChange(globalIndex, 'startTime', e.target.value)}
                        className="block w-24 py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                        disabled={!timeSlot.isAvailable}
                      >
                        {timeOptions.map(time => (
                          <option key={`start-${time}`} value={time}>
                            {time}
                          </option>
                        ))}
                      </select>
                      <span className="text-gray-500">から</span>
                      <select
                        value={timeSlot.endTime}
                        onChange={(e) => handleAvailabilityChange(globalIndex, 'endTime', e.target.value)}
                        className="block w-24 py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                        disabled={!timeSlot.isAvailable}
                      >
                        {timeOptions.map(time => (
                          <option key={`end-${time}`} value={time}>
                            {time}
                          </option>
                        ))}
                      </select>
                      <span className="text-gray-500">まで</span>
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => handleRemoveTimeSlot(globalIndex)}
                      className="ml-auto inline-flex items-center p-1 border border-transparent rounded-full text-red-500 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                );
              })}
            </div>
            
            {/* 時間スロットがない場合のメッセージ */}
            {getTimeSlotsForDay(day.value).length === 0 && (
              <div className="text-center py-4 text-sm text-gray-500">
                この曜日にはまだ時間帯が設定されていません。「時間帯を追加」をクリックして設定してください。
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* バリデーションエラー */}
      {errors.availableTimes && (
        <div className="mt-2 text-sm text-red-500">
          {errors.availableTimes}
        </div>
      )}
      
      {/* ヘルプテキスト */}
      <div className="bg-blue-50 p-4 rounded-md">
        <h4 className="text-sm font-medium text-blue-800 mb-2">ヒント</h4>
        <ul className="list-disc pl-5 text-sm text-blue-700 space-y-1">
          <li>週に最低3日は活動可能時間を設定することをお勧めします。これにより、より多くのユーザーとマッチングしやすくなります。</li>
          <li>複数の時間帯を設定することで、柔軟に活動できることをユーザーにアピールできます。</li>
          <li>最も人気のある時間帯は週末と平日の夕方以降です。可能であれば、この時間帯を優先的に設定することをお勧めします。</li>
        </ul>
      </div>
    </div>
  );
};

export default AvailabilityStep;
