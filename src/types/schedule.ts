import { UUID } from './attender';

export interface TimeSlot {
  id: string;
  startTime: string; // ISO 8601形式の日時
  endTime: string; // ISO 8601形式の日時
  isAvailable: boolean;
  isBooked: boolean;
  experienceId?: string; // 予約された場合の体験ID
  bookingId?: string; // 予約ID
}

export interface DailySchedule {
  date: string; // YYYY-MM-DD形式
  timeSlots: TimeSlot[];
}

export interface WeeklySchedule {
  startDate: string; // 週の開始日 YYYY-MM-DD形式
  endDate: string; // 週の終了日 YYYY-MM-DD形式
  dailySchedules: DailySchedule[];
}

export interface MonthlySchedule {
  month: number; // 1-12
  year: number;
  weeklySchedules: WeeklySchedule[];
}

export interface ScheduleSettings {
  attenderId: UUID;
  defaultStartTime: string; // HH:MM形式
  defaultEndTime: string; // HH:MM形式
  slotDuration: number; // 分単位
  breakDuration: number; // 分単位
  workingDays: number[]; // 0-6 (0=日曜日)
  customTimeRanges?: {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
  }[];
  blackoutDates: string[]; // 利用不可の日付 YYYY-MM-DD形式
}

export interface ScheduleUpdateRequest {
  scheduleSettingsId?: string;
  attenderId: UUID;
  dates: string[]; // 更新する日付 YYYY-MM-DD形式
  action: 'add' | 'remove' | 'update';
  timeSlots?: Partial<TimeSlot>[];
}

export interface ScheduleResponse {
  success: boolean;
  message: string;
  data?: {
    updatedDates: string[];
    affectedBookings?: string[];
  };
}
