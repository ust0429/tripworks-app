import React, { useState, useEffect } from 'react';
import { ScheduleSettings as ScheduleSettingsType } from '../../../types/schedule';
import { UUID } from '../../../types/attender';
import { getScheduleSettings, updateScheduleSettings } from '../../../services/scheduleService';

interface ScheduleSettingsProps {
  attenderId: UUID;
  onSaved?: (settings: ScheduleSettingsType) => void;
}

const dayNames = ['日曜日', '月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日'];

const ScheduleSettings: React.FC<ScheduleSettingsProps> = ({ attenderId, onSaved }) => {
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<ScheduleSettingsType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [newBlackoutDate, setNewBlackoutDate] = useState<string>('');

  // スケジュール設定データの取得
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const data = await getScheduleSettings(attenderId);
        setSettings(data);
        setError(null);
      } catch (err) {
        setError('スケジュール設定の取得に失敗しました。再度お試しください。');
        console.error('Error fetching schedule settings:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [attenderId]);

  // 営業日の切り替え
  const handleWorkingDayToggle = (dayIndex: number) => {
    if (!settings) return;

    const updatedWorkingDays = [...settings.workingDays];
    const index = updatedWorkingDays.indexOf(dayIndex);

    if (index === -1) {
      updatedWorkingDays.push(dayIndex);
    } else {
      updatedWorkingDays.splice(index, 1);
    }

    setSettings({
      ...settings,
      workingDays: updatedWorkingDays,
    });
  };

  // デフォルト営業時間の変更
  const handleTimeChange = (field: 'defaultStartTime' | 'defaultEndTime', value: string) => {
    if (!settings) return;

    setSettings({
      ...settings,
      [field]: value,
    });
  };

  // スロット時間と休憩時間の変更
  const handleDurationChange = (field: 'slotDuration' | 'breakDuration', value: string) => {
    if (!settings) return;

    setSettings({
      ...settings,
      [field]: parseInt(value, 10),
    });
  };

  // カスタム時間範囲の追加
  const handleAddCustomTimeRange = () => {
    if (!settings) return;

    const customTimeRanges = settings.customTimeRanges || [];
    
    setSettings({
      ...settings,
      customTimeRanges: [
        ...customTimeRanges,
        {
          dayOfWeek: 0, // デフォルトで日曜日
          startTime: settings.defaultStartTime,
          endTime: settings.defaultEndTime
        }
      ]
    });
  };

  // カスタム時間範囲の削除
  const handleRemoveCustomTimeRange = (index: number) => {
    if (!settings || !settings.customTimeRanges) return;

    const updatedCustomTimeRanges = [...settings.customTimeRanges];
    updatedCustomTimeRanges.splice(index, 1);

    setSettings({
      ...settings,
      customTimeRanges: updatedCustomTimeRanges
    });
  };

  // カスタム時間範囲の更新
  const handleCustomTimeRangeChange = (
    index: number, 
    field: 'dayOfWeek' | 'startTime' | 'endTime', 
    value: string | number
  ) => {
    if (!settings || !settings.customTimeRanges) return;

    const updatedCustomTimeRanges = [...settings.customTimeRanges];
    
    if (field === 'dayOfWeek') {
      updatedCustomTimeRanges[index] = {
        ...updatedCustomTimeRanges[index],
        dayOfWeek: Number(value)
      };
    } else {
      updatedCustomTimeRanges[index] = {
        ...updatedCustomTimeRanges[index],
        [field]: value
      };
    }

    setSettings({
      ...settings,
      customTimeRanges: updatedCustomTimeRanges
    });
  };

  // ブラックアウト日の追加
  const handleAddBlackoutDate = () => {
    if (!settings || !newBlackoutDate) return;
    if (settings.blackoutDates.includes(newBlackoutDate)) return;

    setSettings({
      ...settings,
      blackoutDates: [...settings.blackoutDates, newBlackoutDate].sort()
    });
    
    setNewBlackoutDate('');
  };

  // ブラックアウト日の削除
  const handleRemoveBlackoutDate = (date: string) => {
    if (!settings) return;

    setSettings({
      ...settings,
      blackoutDates: settings.blackoutDates.filter(d => d !== date)
    });
  };

  // 設定の保存
  const handleSaveSettings = async () => {
    if (!settings) return;

    try {
      setLoading(true);
      const updatedSettings = await updateScheduleSettings(settings);
      setSettings(updatedSettings);
      setSuccessMessage('スケジュール設定を保存しました');
      
      if (onSaved) {
        onSaved(updatedSettings);
      }
      
      // 3秒後に成功メッセージを消す
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err) {
      setError('スケジュール設定の保存に失敗しました。再度お試しください。');
      console.error('Error saving schedule settings:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !settings) {
    return <div className="p-4 text-center">ロード中...</div>;
  }

  if (error && !settings) {
    return <div className="p-4 text-red-500 text-center">{error}</div>;
  }

  if (!settings) {
    return <div className="p-4 text-center">スケジュール設定が見つかりません</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-6">スケジュール設定</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}
      
      {successMessage && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
          {successMessage}
        </div>
      )}
      
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">営業日</h3>
        <div className="flex flex-wrap gap-2">
          {dayNames.map((day, index) => (
            <button
              key={day}
              type="button"
              className={`px-4 py-2 rounded-full ${
                settings.workingDays.includes(index)
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
              onClick={() => handleWorkingDayToggle(index)}
            >
              {day}
            </button>
          ))}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <h3 className="text-lg font-semibold mb-3">デフォルト営業時間</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                開始時間
              </label>
              <input
                type="time"
                value={settings.defaultStartTime}
                onChange={(e) => handleTimeChange('defaultStartTime', e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                終了時間
              </label>
              <input
                type="time"
                value={settings.defaultEndTime}
                onChange={(e) => handleTimeChange('defaultEndTime', e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-3">時間枠設定</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                1つの枠の時間（分）
              </label>
              <select
                value={settings.slotDuration}
                onChange={(e) => handleDurationChange('slotDuration', e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="30">30分</option>
                <option value="60">1時間</option>
                <option value="90">1時間30分</option>
                <option value="120">2時間</option>
                <option value="180">3時間</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                枠間の休憩時間（分）
              </label>
              <select
                value={settings.breakDuration}
                onChange={(e) => handleDurationChange('breakDuration', e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="0">なし</option>
                <option value="5">5分</option>
                <option value="10">10分</option>
                <option value="15">15分</option>
                <option value="30">30分</option>
              </select>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-semibold">カスタム営業時間</h3>
          <button
            type="button"
            onClick={handleAddCustomTimeRange}
            className="px-3 py-1 bg-green-500 text-white rounded text-sm"
          >
            追加
          </button>
        </div>
        
        {settings.customTimeRanges && settings.customTimeRanges.length > 0 ? (
          <div className="space-y-3">
            {settings.customTimeRanges.map((range, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded">
                <select
                  value={range.dayOfWeek}
                  onChange={(e) => handleCustomTimeRangeChange(index, 'dayOfWeek', e.target.value)}
                  className="p-2 border rounded"
                >
                  {dayNames.map((day, idx) => (
                    <option key={day} value={idx}>
                      {day}
                    </option>
                  ))}
                </select>
                
                <input
                  type="time"
                  value={range.startTime}
                  onChange={(e) => handleCustomTimeRangeChange(index, 'startTime', e.target.value)}
                  className="p-2 border rounded"
                />
                
                <span>〜</span>
                
                <input
                  type="time"
                  value={range.endTime}
                  onChange={(e) => handleCustomTimeRangeChange(index, 'endTime', e.target.value)}
                  className="p-2 border rounded"
                />
                
                <button
                  type="button"
                  onClick={() => handleRemoveCustomTimeRange(index)}
                  className="p-1 text-red-500"
                >
                  削除
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 italic">カスタム営業時間はありません</p>
        )}
      </div>
      
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">ブラックアウト日（休業日）</h3>
        
        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            日付を追加
          </label>
          <div className="flex gap-2">
            <input
              type="date"
              value={newBlackoutDate}
              onChange={(e) => setNewBlackoutDate(e.target.value)}
              className="flex-grow p-2 border rounded"
            />
            <button
              type="button"
              onClick={handleAddBlackoutDate}
              className="px-4 py-2 bg-blue-500 text-white rounded"
              disabled={!newBlackoutDate}
            >
              追加
            </button>
          </div>
        </div>
        
        {settings.blackoutDates.length > 0 ? (
          <div className="space-y-2">
            {settings.blackoutDates.map((date) => (
              <div key={date} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <span>{date}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveBlackoutDate(date)}
                  className="p-1 text-red-500"
                >
                  削除
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 italic">ブラックアウト日はありません</p>
        )}
      </div>
      
      <div className="flex justify-end mt-8">
        <button
          type="button"
          onClick={handleSaveSettings}
          className="px-6 py-2 bg-blue-600 text-white rounded shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          disabled={loading}
        >
          {loading ? '保存中...' : '保存する'}
        </button>
      </div>
    </div>
  );
};

export default ScheduleSettings;
