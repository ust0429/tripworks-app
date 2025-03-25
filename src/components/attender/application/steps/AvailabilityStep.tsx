/**
 * 利用可能時間ステップ
 * 
 * アテンダー申請フォームの利用可能時間を入力するステップ
 * TypeScript エラー修正と機能強化を施したバージョン
 */
import React, { useState, useEffect } from 'react';
import { useAttenderApplication } from '../../../../contexts/AttenderApplicationContext';
import { AvailabilityTimeSlot } from '../../../../types/attender';
import { Calendar, Clock, AlertTriangle, Info, Plus, Trash2, Copy } from 'lucide-react';

interface AvailabilityStepProps {
  onNext: () => void;
  onBack: () => void;
}

const AvailabilityStep: React.FC<AvailabilityStepProps> = ({ onNext, onBack }) => {
  const { formData, updateAvailabilityTimes, errors, clearError } = useAttenderApplication();
  
  // 曜日のリスト
  const weekdays = [
    { value: 0, label: '日曜日', shortLabel: '日' },
    { value: 1, label: '月曜日', shortLabel: '月' },
    { value: 2, label: '火曜日', shortLabel: '火' },
    { value: 3, label: '水曜日', shortLabel: '水' },
    { value: 4, label: '木曜日', shortLabel: '木' },
    { value: 5, label: '金曜日', shortLabel: '金' },
    { value: 6, label: '土曜日', shortLabel: '土' }
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
  
  // アクティブなタブの状態
  const [activeTab, setActiveTab] = useState<'individual' | 'template'>('individual');
  
  // テンプレート設定
  const [templateSettings, setTemplateSettings] = useState({
    weekdays: [1, 2, 3, 4, 5], // デフォルトで平日選択
    startTime: '09:00',
    endTime: '17:00'
  });
  
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
    
    // 時間の整合性チェック（終了時間が開始時間より前の場合）
    if (field === 'startTime' || field === 'endTime') {
      const { startTime, endTime } = updatedTimeSlots[index];
      if (startTime >= endTime) {
        // 開始時間が終了時間以降の場合、終了時間を自動調整
        const startTimeIndex = timeOptions.indexOf(startTime);
        if (startTimeIndex !== -1 && startTimeIndex < timeOptions.length - 1) {
          updatedTimeSlots[index].endTime = timeOptions[startTimeIndex + 1];
        }
      }
    }
    
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
    clearError('availableTimes');
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
  
  // テンプレート曜日の選択/解除ハンドラ
  const handleTemplateWeekdayToggle = (day: number) => {
    setTemplateSettings(prev => {
      if (prev.weekdays.includes(day)) {
        return {
          ...prev,
          weekdays: prev.weekdays.filter(d => d !== day)
        };
      } else {
        return {
          ...prev,
          weekdays: [...prev.weekdays, day].sort()
        };
      }
    });
  };
  
  // テンプレート時間の変更ハンドラ
  const handleTemplateTimeChange = (field: 'startTime' | 'endTime', value: string) => {
    setTemplateSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // テンプレートを適用するハンドラ
  const handleApplyTemplate = () => {
    if (!formData.availableTimes) return;
    
    // 既存の時間枚を保持
    const existingSlots = [...formData.availableTimes];
    
    // テンプレートの曜日ごとに処理
    templateSettings.weekdays.forEach(dayOfWeek => {
      // 既存のスロットを取得
      const daySlots = existingSlots.filter(slot => slot.dayOfWeek === dayOfWeek);
      
      if (daySlots.length === 0) {
        // その曜日のスロットがない場合は新規作成
        existingSlots.push({
          dayOfWeek: dayOfWeek as 0 | 1 | 2 | 3 | 4 | 5 | 6,
          startTime: templateSettings.startTime,
          endTime: templateSettings.endTime,
          isAvailable: true
        });
      } else {
        // 最初のスロットを利用可能に設定
        const index = existingSlots.indexOf(daySlots[0]);
        existingSlots[index] = {
          ...existingSlots[index],
          startTime: templateSettings.startTime,
          endTime: templateSettings.endTime,
          isAvailable: true
        };
      }
    });
    
    updateAvailabilityTimes(existingSlots);
    clearError('availableTimes');
    
    // 個別設定タブに切り替え
    setActiveTab('individual');
  };
  
  // プリセットテンプレートの設定
  const applyPreset = (preset: 'weekday' | 'weekend' | 'evening' | 'morning' | 'afternoon') => {
    switch (preset) {
      case 'weekday':
        setTemplateSettings({
          weekdays: [1, 2, 3, 4, 5],
          startTime: '09:00',
          endTime: '17:00'
        });
        break;
      case 'weekend':
        setTemplateSettings({
          weekdays: [0, 6],
          startTime: '10:00',
          endTime: '18:00'
        });
        break;
      case 'evening':
        setTemplateSettings({
          weekdays: [0, 1, 2, 3, 4, 5, 6],
          startTime: '18:00',
          endTime: '22:00'
        });
        break;
      case 'morning':
        setTemplateSettings({
          weekdays: [0, 1, 2, 3, 4, 5, 6],
          startTime: '07:00',
          endTime: '12:00'
        });
        break;
      case 'afternoon':
        setTemplateSettings({
          weekdays: [0, 1, 2, 3, 4, 5, 6],
          startTime: '13:00',
          endTime: '18:00'
        });
        break;
    }
  };
  
  // 時間スロットを別の曜日にコピー
  const copyTimeSlotToDay = (sourceDay: number, targetDay: number) => {
    if (!formData.availableTimes) return;
    
    // ソースの曜日のスロットを取得
    const sourceSlots = getTimeSlotsForDay(sourceDay);
    if (sourceSlots.length === 0) return;
    
    // 既存のスロット配列をコピー
    const updatedTimeSlots = [...formData.availableTimes];
    
    // ターゲット曜日の既存スロットを削除
    const filteredSlots = updatedTimeSlots.filter(slot => slot.dayOfWeek !== targetDay);
    
    // ソースのスロットをターゲットの曜日用にコピー
    const newTargetSlots = sourceSlots.map(sourceSlot => ({
      ...sourceSlot,
      dayOfWeek: targetDay as 0 | 1 | 2 | 3 | 4 | 5 | 6
    }));
    
    // 更新された配列を設定
    updateAvailabilityTimes([...filteredSlots, ...newTargetSlots]);
    clearError('availableTimes');
  };

  // アクティブな曜日の数を取得
  const getActiveDaysCount = () => {
    const activeDays = new Set();
    
    formData.availableTimes?.forEach(slot => {
      if (slot.isAvailable) {
        activeDays.add(slot.dayOfWeek);
      }
    });
    
    return activeDays.size;
  };
  
  // 少なくとも1つの利用可能時間があるかどうかをチェック
  const hasAvailableTimes = () => {
    return formData.availableTimes?.some(slot => slot.isAvailable) || false;
  };

  return (
    <div className="space-y-8">
      <h2 className="text-xl font-semibold mb-4">活動可能時間</h2>
      <p className="text-sm text-gray-500 mb-2">
        あなたが体験を提供できる曜日と時間帯を設定してください。
        少なくとも1つの曜日で活動可能時間を設定する必要があります。
      </p>
      
      {/* タブ切り替え */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          type="button"
          className={`py-2 px-4 text-sm font-medium ${
            activeTab === 'individual'
              ? 'text-blue-600 border-b-2 border-blue-500'
              : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
          onClick={() => setActiveTab('individual')}
        >
          個別設定
        </button>
        <button
          type="button"
          className={`py-2 px-4 text-sm font-medium ${
            activeTab === 'template'
              ? 'text-blue-600 border-b-2 border-blue-500'
              : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
          onClick={() => setActiveTab('template')}
        >
          テンプレート設定
        </button>
      </div>
      
      {activeTab === 'template' ? (
        // テンプレート設定タブ
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-lg font-medium mb-4">テンプレートを使用して一括設定</h3>
          
          <div className="mb-6">
            <p className="text-sm font-medium text-gray-700 mb-2">曜日を選択</p>
            <div className="flex flex-wrap gap-2">
              {weekdays.map(day => (
                <button
                  key={day.value}
                  type="button"
                  className={`px-4 py-2 rounded-md text-sm ${
                    templateSettings.weekdays.includes(day.value)
                      ? 'bg-blue-100 text-blue-800 border border-blue-300'
                      : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                  }`}
                  onClick={() => handleTemplateWeekdayToggle(day.value)}
                >
                  {day.label}
                </button>
              ))}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label htmlFor="templateStartTime" className="block text-sm font-medium text-gray-700 mb-1">
                開始時間
              </label>
              <select
                id="templateStartTime"
                value={templateSettings.startTime}
                onChange={(e) => handleTemplateTimeChange('startTime', e.target.value)}
                className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                {timeOptions.map(time => (
                  <option key={`start-${time}`} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="templateEndTime" className="block text-sm font-medium text-gray-700 mb-1">
                終了時間
              </label>
              <select
                id="templateEndTime"
                value={templateSettings.endTime}
                onChange={(e) => handleTemplateTimeChange('endTime', e.target.value)}
                className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                {timeOptions.map(time => (
                  <option key={`end-${time}`} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {/* プリセットボタン */}
          <div className="mb-6">
            <p className="text-sm font-medium text-gray-700 mb-2">よく使うパターン</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md text-sm hover:bg-gray-200"
                onClick={() => applyPreset('weekday')}
              >
                平日 (9-17時)
              </button>
              <button
                type="button"
                className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md text-sm hover:bg-gray-200"
                onClick={() => applyPreset('weekend')}
              >
                週末 (10-18時)
              </button>
              <button
                type="button"
                className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md text-sm hover:bg-gray-200"
                onClick={() => applyPreset('evening')}
              >
                毎日夕方 (18-22時)
              </button>
              <button
                type="button"
                className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md text-sm hover:bg-gray-200"
                onClick={() => applyPreset('morning')}
              >
                毎日午前 (7-12時)
              </button>
              <button
                type="button"
                className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md text-sm hover:bg-gray-200"
                onClick={() => applyPreset('afternoon')}
              >
                毎日午後 (13-18時)
              </button>
            </div>
          </div>
          
          {/* 適用ボタン */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleApplyTemplate}
              disabled={templateSettings.weekdays.length === 0}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-300 disabled:cursor-not-allowed"
            >
              選択した曜日に適用
            </button>
          </div>
          
          <div className="mt-4 bg-blue-50 p-3 rounded-md">
            <div className="flex">
              <Info className="w-5 h-5 text-blue-500 mr-2 flex-shrink-0" />
              <p className="text-sm text-blue-700">
                このテンプレートを適用すると、選択した曜日の時間設定が上書きされます。既存の設定がある場合は注意してください。
              </p>
            </div>
          </div>
        </div>
      ) : (
        // 個別設定タブ
        <div className="space-y-6">
          {weekdays.map(day => (
            <div key={day.value} className={`border rounded-md p-4 ${isDayAvailable(day.value) ? 'border-blue-200 bg-blue-50' : 'border-gray-200'}`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium flex items-center">
                  {day.label}
                  {isDayAvailable(day.value) && (
                    <span className="ml-2 bg-green-100 text-green-800 text-xs font-medium px-2 py-0.5 rounded-full">
                      活動可能
                    </span>
                  )}
                </h3>
                <div className="flex items-center">
                  {/* 他の曜日からコピーするドロップダウン */}
                  <div className="relative mr-2">
                    <select
                      onChange={(e) => {
                        if (e.target.value) {
                          copyTimeSlotToDay(parseInt(e.target.value), day.value);
                          e.target.value = ''; // リセット
                        }
                      }}
                      className="block w-36 py-1.5 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-xs"
                      value=""
                    >
                      <option value="">他の曜日からコピー</option>
                      {weekdays
                        .filter(otherDay => otherDay.value !== day.value && isDayAvailable(otherDay.value))
                        .map(otherDay => (
                          <option key={otherDay.value} value={otherDay.value}>
                            {otherDay.label}からコピー
                          </option>
                        ))}
                    </select>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAddTimeSlot(day.value as 0 | 1 | 2 | 3 | 4 | 5 | 6)}
                    className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    時間帯を追加
                  </button>
                </div>
              </div>
              
              {/* 時間スロットのリスト */}
              <div className="space-y-3">
                {getTimeSlotsForDay(day.value).map((timeSlot, index) => {
                  const globalIndex = formData.availableTimes?.indexOf(timeSlot) || 0;
                  
                  return (
                    <div 
                      key={index} 
                      className={`flex flex-wrap items-center gap-3 p-3 rounded-md ${
                        timeSlot.isAvailable ? 'bg-white border border-green-200' : 'bg-gray-50 border border-gray-200'
                      }`}
                    >
                      <div className="flex items-center">
                        <input
                          id={`available-${day.value}-${index}`}
                          type="checkbox"
                          checked={timeSlot.isAvailable}
                          onChange={(e) => handleAvailabilityChange(globalIndex, 'isAvailable', e.target.checked)}
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <label 
                          htmlFor={`available-${day.value}-${index}`} 
                          className={`ml-2 block text-sm font-medium ${
                            timeSlot.isAvailable ? 'text-gray-900' : 'text-gray-500'
                          }`}
                        >
                          活動可能
                        </label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 text-gray-400 mr-1" />
                          <select
                            value={timeSlot.startTime}
                            onChange={(e) => handleAvailabilityChange(globalIndex, 'startTime', e.target.value)}
                            className={`block w-24 py-1.5 px-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm ${
                              timeSlot.isAvailable 
                                ? 'border-gray-300 bg-white text-gray-900' 
                                : 'border-gray-200 bg-gray-50 text-gray-500'
                            }`}
                            disabled={!timeSlot.isAvailable}
                          >
                            {timeOptions.map(time => (
                              <option key={`start-${time}`} value={time}>
                                {time}
                              </option>
                            ))}
                          </select>
                        </div>
                        <span className="text-gray-500">から</span>
                        <select
                          value={timeSlot.endTime}
                          onChange={(e) => handleAvailabilityChange(globalIndex, 'endTime', e.target.value)}
                          className={`block w-24 py-1.5 px-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm ${
                            timeSlot.isAvailable 
                              ? 'border-gray-300 bg-white text-gray-900' 
                              : 'border-gray-200 bg-gray-50 text-gray-500'
                          }`}
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
                        className={`ml-auto inline-flex items-center p-1 border border-transparent rounded-full ${
                          timeSlot.isAvailable 
                            ? 'text-red-500 hover:bg-red-100' 
                            : 'text-gray-400 hover:bg-gray-100'
                        } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500`}
                        title="削除"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
              
              {/* 時間スロットがない場合のメッセージ */}
              {getTimeSlotsForDay(day.value).length === 0 && (
                <div className="text-center py-4 text-sm text-gray-500 border border-dashed border-gray-300 rounded-md">
                  この曜日にはまだ時間帯が設定されていません。「時間帯を追加」をクリックして設定してください。
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      
      {/* 警告メッセージ */}
      {!hasAvailableTimes() && (
        <div className="bg-yellow-50 p-4 rounded-md border-l-4 border-yellow-400">
          <div className="flex">
            <AlertTriangle className="w-5 h-5 text-yellow-400 mr-3 flex-shrink-0" />
            <div>
              <p className="text-sm text-yellow-700">
                少なくとも1つの時間帯を活動可能に設定してください。
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* バリデーションエラー */}
      {errors.availableTimes && (
        <div className="mt-2 text-sm text-red-500 bg-red-50 p-3 rounded-md border-l-4 border-red-500">
          {errors.availableTimes}
        </div>
      )}
      
      {/* 活動時間のサマリー */}
      <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
        <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
          <Calendar className="w-4 h-4 mr-1 text-gray-500" />
          活動時間サマリー
        </h4>
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekdays.map(day => (
            <div 
              key={day.value} 
              className={`text-center py-1 rounded-md text-xs font-medium ${
                isDayAvailable(day.value) 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'bg-gray-100 text-gray-500'
              }`}
            >
              {day.shortLabel}
            </div>
          ))}
        </div>
        <p className="text-sm text-gray-600">
          {getActiveDaysCount() === 0 
            ? '活動可能な曜日が設定されていません。' 
            : `${getActiveDaysCount()}日の活動可能な曜日が設定されています。`}
        </p>
      </div>
      
      {/* ヘルプテキスト */}
      <div className="bg-blue-50 p-4 rounded-md">
        <h4 className="text-sm font-medium text-blue-800 mb-2 flex items-center">
          <Info className="w-4 h-4 mr-1 text-blue-600" />
          ヒント
        </h4>
        <ul className="list-disc pl-5 text-sm text-blue-700 space-y-1">
          <li>週に最低3日は活動可能時間を設定することをお勧めします。これにより、より多くのユーザーとマッチングしやすくなります。</li>
          <li>複数の時間帯を設定することで、柔軟に活動できることをユーザーにアピールできます。</li>
          <li>最も人気のある時間帯は週末と平日の夕方以降です。可能であれば、この時間帯を優先的に設定することをお勧めします。</li>
        </ul>
      </div>
      
      {/* ナビゲーションボタン */}
      <div className="flex justify-between pt-6">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          前へ
        </button>
        <button
          type="button"
          onClick={onNext}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          disabled={!hasAvailableTimes()}
        >
          次へ
        </button>
      </div>
    </div>
  );
};

export default AvailabilityStep;
