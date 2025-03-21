import React, { useState, useEffect } from 'react';
import { 
  WeeklySchedule, 
  DailySchedule, 
  TimeSlot,
  ScheduleUpdateRequest
} from '../../../types/schedule';
import { UUID } from '../../../types/attender';
import { 
  getWeeklySchedule, 
  updateSchedule 
} from '../../../services/scheduleService';

interface ScheduleCalendarProps {
  attenderId: UUID;
}

const dayNames = ['日', '月', '火', '水', '木', '金', '土'];

const ScheduleCalendar: React.FC<ScheduleCalendarProps> = ({ attenderId }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [weeklySchedule, setWeeklySchedule] = useState<WeeklySchedule | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [bulkActionMode, setBulkActionMode] = useState<'available' | 'unavailable' | null>(null);

  // 週の開始日（日曜日）を取得
  const getWeekStartDate = (date: Date): Date => {
    const result = new Date(date);
    const day = result.getDay();
    result.setDate(result.getDate() - day);
    return result;
  };

  // 日付をYYYY-MM-DD形式に変換
  const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  // 時間をHH:MM形式に変換
  const formatTime = (isoString: string): string => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('ja-JP', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  // 週間スケジュールの取得
  useEffect(() => {
    const fetchWeeklySchedule = async () => {
      try {
        setLoading(true);
        const startOfWeek = getWeekStartDate(currentDate);
        const startDateStr = formatDate(startOfWeek);
        
        const data = await getWeeklySchedule(attenderId, startDateStr);
        setWeeklySchedule(data);
        setError(null);
      } catch (err) {
        setError('スケジュールの取得に失敗しました。再度お試しください。');
        console.error('Error fetching weekly schedule:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchWeeklySchedule();
  }, [attenderId, currentDate]);

  // 前の週へ移動
  const goToPreviousWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() - 7);
    setCurrentDate(newDate);
  };

  // 次の週へ移動
  const goToNextWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + 7);
    setCurrentDate(newDate);
  };

  // 今日の週へ移動
  const goToCurrentWeek = () => {
    setCurrentDate(new Date());
  };

  // タイムスロットの選択/選択解除
  const toggleSlotSelection = (slotId: string) => {
    if (selectedSlots.includes(slotId)) {
      setSelectedSlots(selectedSlots.filter(id => id !== slotId));
    } else {
      setSelectedSlots([...selectedSlots, slotId]);
    }
  };

  // スロットの可用性を一括更新
  const updateSelectedSlotsAvailability = async (makeAvailable: boolean) => {
    if (!weeklySchedule || selectedSlots.length === 0) return;

    // 選択されたスロットから日付を抽出
    const selectedDatesMap: Record<string, string[]> = {};
    
    // 選択されたスロットを含む日付を特定
    weeklySchedule.dailySchedules.forEach(dailySchedule => {
      dailySchedule.timeSlots.forEach(slot => {
        if (selectedSlots.includes(slot.id)) {
          if (!selectedDatesMap[dailySchedule.date]) {
            selectedDatesMap[dailySchedule.date] = [];
          }
          selectedDatesMap[dailySchedule.date].push(slot.id);
        }
      });
    });

    const updateRequest: ScheduleUpdateRequest = {
      attenderId,
      dates: Object.keys(selectedDatesMap),
      action: 'update',
      timeSlots: selectedSlots.map(slotId => ({
        id: slotId,
        isAvailable: makeAvailable
      }))
    };

    try {
      setLoading(true);
      const response = await updateSchedule(updateRequest);
      
      if (response.success) {
        setSuccessMessage(`${selectedSlots.length}件のスケジュールを更新しました`);
        
        // 選択を解除
        setSelectedSlots([]);
        setBulkActionMode(null);
        
        // スケジュールを再取得
        const startOfWeek = getWeekStartDate(currentDate);
        const startDateStr = formatDate(startOfWeek);
        const updatedSchedule = await getWeeklySchedule(attenderId, startDateStr);
        setWeeklySchedule(updatedSchedule);
        
        // 3秒後にメッセージを消す
        setTimeout(() => {
          setSuccessMessage(null);
        }, 3000);
      } else {
        setError('スケジュールの更新に失敗しました');
      }
    } catch (err) {
      setError('スケジュールの更新中にエラーが発生しました');
      console.error('Error updating schedule:', err);
    } finally {
      setLoading(false);
    }
  };

  // バルク選択モードの切り替え
  const toggleBulkActionMode = (mode: 'available' | 'unavailable') => {
    if (bulkActionMode === mode) {
      setBulkActionMode(null);
    } else {
      setBulkActionMode(mode);
      // モード切り替え時に選択をクリア
      setSelectedSlots([]);
    }
  };

  // 選択済みスロットをすべて解除
  const clearSelection = () => {
    setSelectedSlots([]);
  };

  // スロットのスタイル判定
  const getSlotClassName = (slot: TimeSlot) => {
    let className = 'p-2 border rounded text-center text-sm ';
    
    // 選択中
    if (selectedSlots.includes(slot.id)) {
      return className + 'bg-yellow-200 border-yellow-400';
    }
    
    // 予約済み
    if (slot.isBooked) {
      return className + 'bg-blue-100 border-blue-300 cursor-not-allowed';
    }
    
    // 利用可能/不可
    if (slot.isAvailable) {
      return className + 'bg-green-100 border-green-300 cursor-pointer hover:bg-green-200';
    } else {
      return className + 'bg-gray-100 border-gray-300 cursor-pointer hover:bg-gray-200';
    }
  };

  if (loading && !weeklySchedule) {
    return <div className="p-4 text-center">ロード中...</div>;
  }

  if (error && !weeklySchedule) {
    return <div className="p-4 text-red-500 text-center">{error}</div>;
  }

  if (!weeklySchedule) {
    return <div className="p-4 text-center">スケジュールが見つかりません</div>;
  }

  // 現在表示している週の範囲を表示用に整形
  const startOfWeek = new Date(weeklySchedule.startDate);
  const endOfWeek = new Date(weeklySchedule.endDate);
  const weekRangeText = `${startOfWeek.toLocaleDateString('ja-JP')} 〜 ${endOfWeek.toLocaleDateString('ja-JP')}`;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">スケジュールカレンダー</h2>
        
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={goToPreviousWeek}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            ◀
          </button>
          
          <button
            type="button"
            onClick={goToCurrentWeek}
            className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
          >
            今週
          </button>
          
          <span className="font-medium">{weekRangeText}</span>
          
          <button
            type="button"
            onClick={goToNextWeek}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            ▶
          </button>
        </div>
      </div>
      
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
      
      <div className="mb-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => toggleBulkActionMode('available')}
          className={`px-4 py-2 rounded ${
            bulkActionMode === 'available'
              ? 'bg-green-500 text-white'
              : 'bg-green-100 text-green-700'
          }`}
        >
          利用可に設定
        </button>
        
        <button
          type="button"
          onClick={() => toggleBulkActionMode('unavailable')}
          className={`px-4 py-2 rounded ${
            bulkActionMode === 'unavailable'
              ? 'bg-red-500 text-white'
              : 'bg-red-100 text-red-700'
          }`}
        >
          利用不可に設定
        </button>
        
        {selectedSlots.length > 0 && (
          <>
            <span className="px-3 py-2 bg-gray-100 rounded">
              {selectedSlots.length}件選択中
            </span>
            
            <button
              type="button"
              onClick={clearSelection}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded"
            >
              選択解除
            </button>
            
            {bulkActionMode === 'available' && (
              <button
                type="button"
                onClick={() => updateSelectedSlotsAvailability(true)}
                className="px-4 py-2 bg-green-600 text-white rounded"
                disabled={loading}
              >
                {loading ? '更新中...' : '利用可に変更'}
              </button>
            )}
            
            {bulkActionMode === 'unavailable' && (
              <button
                type="button"
                onClick={() => updateSelectedSlotsAvailability(false)}
                className="px-4 py-2 bg-red-600 text-white rounded"
                disabled={loading}
              >
                {loading ? '更新中...' : '利用不可に変更'}
              </button>
            )}
          </>
        )}
      </div>
      
      <div className="mb-3 flex flex-wrap gap-3">
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
          <span className="text-sm">利用可能</span>
        </div>
        
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-gray-100 border border-gray-300 rounded"></div>
          <span className="text-sm">利用不可</span>
        </div>
        
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-blue-100 border border-blue-300 rounded"></div>
          <span className="text-sm">予約済み</span>
        </div>
        
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-yellow-200 border border-yellow-400 rounded"></div>
          <span className="text-sm">選択中</span>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <div className="grid grid-cols-7 gap-1 mb-1">
          {dayNames.map((day, index) => (
            <div
              key={day}
              className={`p-2 text-center font-medium ${
                index === 0 ? 'text-red-600' : index === 6 ? 'text-blue-600' : ''
              }`}
            >
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-1 mb-4">
          {weeklySchedule.dailySchedules.map((dailySchedule) => {
            const date = new Date(dailySchedule.date);
            const isToday = formatDate(new Date()) === dailySchedule.date;
            
            return (
              <div
                key={dailySchedule.date}
                className={`p-2 border rounded ${
                  isToday ? 'bg-blue-50 border-blue-300' : ''
                }`}
              >
                <div className="text-center font-medium mb-2">
                  {date.getDate()}
                </div>
                
                <div className="space-y-1">
                  {dailySchedule.timeSlots.length > 0 ? (
                    dailySchedule.timeSlots.map((slot) => (
                      <div
                        key={slot.id}
                        className={getSlotClassName(slot)}
                        onClick={() => {
                          if (!slot.isBooked) {
                            toggleSlotSelection(slot.id);
                          }
                        }}
                      >
                        {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                        {slot.isBooked && (
                          <div className="text-xs text-blue-700 mt-1">予約済み</div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-gray-500 text-sm py-2">
                      利用可能な時間枠はありません
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ScheduleCalendar;
