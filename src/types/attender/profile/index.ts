/**
 * アテンダープロフィール関連の型定義
 */

// 基本的なプロフィール情報の型
export interface AttenderProfileBasic {
  id: string;
  name: string;
  email: string;
  imageUrl?: string;
  location?: string;
  bio?: string;
  specialties?: string[];
  background?: string;
}

// 体験サンプルの型
export interface ExperienceSample {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  duration?: number; // 分単位
  price?: number;
  categories?: string[];
  createdAt: string;
  updatedAt?: string;
}

// 利用可能時間設定の型
export interface AvailabilityTimeSlot {
  startTime: string; // HH:MM 形式
  endTime: string;   // HH:MM 形式
}

export interface DailyAvailability {
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0: 日曜日, 1: 月曜日, ...
  isAvailable: boolean;
  timeSlots: AvailabilityTimeSlot[];
}

// 完全なアテンダープロフィールの型
export interface AttenderProfile extends AttenderProfileBasic {
  experienceSamples: ExperienceSample[];
  availability: DailyAvailability[];
  rating?: number;
  reviewCount?: number;
  verified?: boolean;
  joinedAt: string;
  lastActive?: string;
  completionScore?: number; // プロフィール完成度を示すスコア (0-100)
}

// プロフィール更新オペレーションの型
export type ProfileUpdateOperation = {
  field: keyof AttenderProfile;
  value: any;
};

// プロフィール編集状態の型
export type ProfileEditMode = 'view' | 'edit';

// プロフィール読み込み状態の型
export type ProfileLoadingState = 'idle' | 'loading' | 'success' | 'error';

// プロフィールコンテキスト状態の型
export interface ProfileContextState {
  profile: AttenderProfile | null;
  editMode: ProfileEditMode;
  loadingState: ProfileLoadingState;
  error: string | null;
}
