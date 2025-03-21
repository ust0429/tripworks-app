import axios from '../mocks/axiosMock';
import { 
  ScheduleSettings,
  DailySchedule,
  WeeklySchedule,
  MonthlySchedule,
  ScheduleUpdateRequest,
  ScheduleResponse,
  TimeSlot
} from '../types/schedule';
import { UUID } from '../types/attender';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api';

// モック関数を使用するかのフラグ
const USE_MOCK = process.env.NODE_ENV === 'development';

/**
 * スケジュール設定の取得
 */
export const getScheduleSettings = async (attenderId: UUID): Promise<ScheduleSettings> => {
  if (USE_MOCK) {
    return mockGetScheduleSettings(attenderId);
  }
  
  const response = await axios.get(`${API_BASE_URL}/attenders/${attenderId}/schedule/settings`);
  return response.data;
};

/**
 * スケジュール設定の更新
 */
export const updateScheduleSettings = async (settings: ScheduleSettings): Promise<ScheduleSettings> => {
  if (USE_MOCK) {
    return mockUpdateScheduleSettings(settings);
  }
  
  const response = await axios.put(`${API_BASE_URL}/attenders/${settings.attenderId}/schedule/settings`, settings);
  return response.data;
};

/**
 * 日次スケジュールの取得
 */
export const getDailySchedule = async (attenderId: UUID, date: string): Promise<DailySchedule> => {
  if (USE_MOCK) {
    return mockGetDailySchedule(attenderId, date);
  }
  
  const response = await axios.get(`${API_BASE_URL}/attenders/${attenderId}/schedule/daily/${date}`);
  return response.data;
};

/**
 * 週間スケジュールの取得
 */
export const getWeeklySchedule = async (attenderId: UUID, startDate: string): Promise<WeeklySchedule> => {
  if (USE_MOCK) {
    return mockGetWeeklySchedule(attenderId, startDate);
  }
  
  const response = await axios.get(`${API_BASE_URL}/attenders/${attenderId}/schedule/weekly/${startDate}`);
  return response.data;
};

/**
 * 月間スケジュールの取得
 */
export const getMonthlySchedule = async (attenderId: UUID, year: number, month: number): Promise<MonthlySchedule> => {
  if (USE_MOCK) {
    return mockGetMonthlySchedule(attenderId, year, month);
  }
  
  const response = await axios.get(`${API_BASE_URL}/attenders/${attenderId}/schedule/monthly/${year}/${month}`);
  return response.data;
};

/**
 * スケジュールの更新（利用可能時間の追加・削除・更新）
 */
export const updateSchedule = async (request: ScheduleUpdateRequest): Promise<ScheduleResponse> => {
  if (USE_MOCK) {
    return mockUpdateSchedule(request);
  }
  
  const response = await axios.post(`${API_BASE_URL}/attenders/${request.attenderId}/schedule/update`, request);
  return response.data;
};

// モック関数の実装
function mockGetScheduleSettings(attenderId: UUID): Promise<ScheduleSettings> {
  return Promise.resolve({
    attenderId,
    defaultStartTime: '09:00',
    defaultEndTime: '18:00',
    slotDuration: 60,
    breakDuration: 15,
    workingDays: [1, 2, 3, 4, 5], // 月-金
    customTimeRanges: [
      {
        dayOfWeek: 6, // 土曜日
        startTime: '10:00',
        endTime: '16:00',
      }
    ],
    blackoutDates: []
  });
}

function mockUpdateScheduleSettings(settings: ScheduleSettings): Promise<ScheduleSettings> {
  return Promise.resolve(settings);
}

function createMockTimeSlots(date: string, settings: ScheduleSettings): TimeSlot[] {
  const slots: TimeSlot[] = [];
  const dateObj = new Date(date);
  const dayOfWeek = dateObj.getDay();
  
  // 休業日の場合は空の配列を返す
  if (!settings.workingDays.includes(dayOfWeek)) {
    return [];
  }
  
  // ブラックアウト日の場合も空の配列を返す
  if (settings.blackoutDates.includes(date)) {
    return [];
  }
  
  // カスタム時間範囲があるか確認
  const customRange = settings.customTimeRanges?.find(range => range.dayOfWeek === dayOfWeek);
  
  const startTime = customRange ? customRange.startTime : settings.defaultStartTime;
  const endTime = customRange ? customRange.endTime : settings.defaultEndTime;
  
  // 開始時間と終了時間から時間枠を生成
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);
  
  let currentHour = startHour;
  let currentMinute = startMinute;
  let slotId = 1;
  
  while (
    currentHour < endHour || 
    (currentHour === endHour && currentMinute < endMinute)
  ) {
    const startDateTime = new Date(date);
    startDateTime.setHours(currentHour, currentMinute, 0, 0);
    
    // 次の時間枠の計算
    let nextMinute = currentMinute + settings.slotDuration;
    let nextHour = currentHour;
    
    // 分が60を超える場合、時間を進める
    if (nextMinute >= 60) {
      nextHour += Math.floor(nextMinute / 60);
      nextMinute %= 60;
    }
    
    // 次の時間枠が終了時間を超える場合はループを終了
    if (
      nextHour > endHour || 
      (nextHour === endHour && nextMinute > endMinute)
    ) {
      break;
    }
    
    const endDateTime = new Date(date);
    endDateTime.setHours(nextHour, nextMinute, 0, 0);
    
    // ランダムに予約済み状態を生成（デモ用）
    const isBooked = Math.random() < 0.3; // 30%の確率で予約済み
    
    slots.push({
      id: `slot_${date}_${slotId}`,
      startTime: startDateTime.toISOString(),
      endTime: endDateTime.toISOString(),
      isAvailable: true,
      isBooked,
      experienceId: isBooked ? `exp_${Math.floor(Math.random() * 1000)}` : undefined,
      bookingId: isBooked ? `book_${Math.floor(Math.random() * 1000)}` : undefined
    });
    
    slotId++;
    
    // 次の時間枠の開始時間を計算（休憩時間を含む）
    currentMinute = nextMinute + settings.breakDuration;
    if (currentMinute >= 60) {
      currentHour += Math.floor(currentMinute / 60);
      currentMinute %= 60;
    } else {
      currentHour = nextHour;
    }
  }
  
  return slots;
}

function mockGetDailySchedule(attenderId: UUID, date: string): Promise<DailySchedule> {
  return mockGetScheduleSettings(attenderId).then(settings => {
    return {
      date,
      timeSlots: createMockTimeSlots(date, settings)
    };
  });
}

function mockGetWeeklySchedule(attenderId: UUID, startDate: string): Promise<WeeklySchedule> {
  return mockGetScheduleSettings(attenderId).then(settings => {
    const startDateObj = new Date(startDate);
    const dailySchedules: DailySchedule[] = [];
    
    // 7日分のスケジュールを生成
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(startDateObj);
      currentDate.setDate(startDateObj.getDate() + i);
      const dateString = currentDate.toISOString().split('T')[0];
      
      dailySchedules.push({
        date: dateString,
        timeSlots: createMockTimeSlots(dateString, settings)
      });
    }
    
    const endDateObj = new Date(startDateObj);
    endDateObj.setDate(startDateObj.getDate() + 6);
    
    return {
      startDate,
      endDate: endDateObj.toISOString().split('T')[0],
      dailySchedules
    };
  });
}

function mockGetMonthlySchedule(attenderId: UUID, year: number, month: number): Promise<MonthlySchedule> {
  return mockGetScheduleSettings(attenderId).then(settings => {
    // 月の最初の日
    const firstDayOfMonth = new Date(year, month - 1, 1);
    
    // 月の最後の日
    const lastDayOfMonth = new Date(year, month, 0);
    
    // 週の開始日（日曜日）に調整
    const firstSundayOfSchedule = new Date(firstDayOfMonth);
    firstSundayOfSchedule.setDate(firstSundayOfSchedule.getDate() - firstSundayOfSchedule.getDay());
    
    // 月の最後の日の週の土曜日
    const lastSaturdayOfSchedule = new Date(lastDayOfMonth);
    const daysToAdd = 6 - lastSaturdayOfSchedule.getDay();
    lastSaturdayOfSchedule.setDate(lastSaturdayOfSchedule.getDate() + daysToAdd);
    
    // 週ごとのスケジュールを生成
    const weeklySchedules: WeeklySchedule[] = [];
    let currentStartDate = new Date(firstSundayOfSchedule);
    
    while (currentStartDate <= lastSaturdayOfSchedule) {
      const weekStartDate = currentStartDate.toISOString().split('T')[0];
      
      const weeklySchedulePromise = mockGetWeeklySchedule(attenderId, weekStartDate);
      
      // 本来は非同期処理だが、モックのためここでは同期的に処理
      const weeklySchedule = {
        startDate: weekStartDate,
        endDate: new Date(currentStartDate.getTime() + 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        dailySchedules: []
      };
      
      // 次の週の開始日を計算
      currentStartDate.setDate(currentStartDate.getDate() + 7);
      
      weeklySchedules.push(weeklySchedule);
    }
    
    // 非同期処理を同期的に扱うための回避策（実際の実装では改善が必要）
    // 各週のdailySchedulesをAPIから取得した結果で埋める
    Promise.all(weeklySchedules.map((week, index) => {
      const startDate = week.startDate;
      return mockGetWeeklySchedule(attenderId, startDate);
    })).then(results => {
      results.forEach((result, index) => {
        weeklySchedules[index].dailySchedules = result.dailySchedules;
      });
    });
    
    return {
      month,
      year,
      weeklySchedules
    };
  });
}

function mockUpdateSchedule(request: ScheduleUpdateRequest): Promise<ScheduleResponse> {
  // 実際のAPIでは、ここでスケジュールを更新する処理を行う
  return Promise.resolve({
    success: true,
    message: 'スケジュールが正常に更新されました',
    data: {
      updatedDates: request.dates,
      affectedBookings: []
    }
  });
}
