/**
 * アテンダープロファイル型定義
 * 
 * アテンダーの詳細情報を表す型
 */

export interface AttenderProfile {
  id: string;
  name: string;
  bio: string;
  location: string;
  specialties: string[];
  profileImage?: string; // 互換性のために追加
  experienceSamples?: ExperienceSample[];
  languages: LanguageSkill[];
  isLocalResident: boolean;
  isMigrant: boolean;
  yearsMoved?: number;
  previousLocation?: string;
  expertise: ExpertiseArea[];
  availability?: DailyAvailability[];
  averageRating: number;
  reviewCount: number;
  joinedAt: string;
  lastActive: string;
  verified?: boolean;
  email?: string;
  phoneNumber?: string;
  completionScore?: number;
}

/**
 * 言語スキル
 */
export interface LanguageSkill {
  language: string;
  proficiency: 'beginner' | 'intermediate' | 'advanced' | 'native';
}

/**
 * 専門分野
 */
export interface ExpertiseArea {
  category: string;
  subcategories?: string[];
  yearsOfExperience?: number;
  description?: string;
  certifications?: string[]; // 認定資格リスト
}

/**
 * 体験サンプル
 */
export interface ExperienceSample {
  id?: string;
  title: string;
  description: string;
  category: string;
  subcategory?: string;
  estimatedDuration: number;
  pricePerPerson?: number;
  price?: number; // 互換性のため残す
  images?: string[];
  imageUrl?: string; // 互換性のため追加
  imageUrls?: string[]; // 互換性のため追加
  location?: string;
  duration?: number; // 互換性のため追加
  categories?: string[]; // 互換性のために追加
  createdAt?: string;
  updatedAt?: string;
}

/**
 * 1日の利用可能時間
 */
export interface DailyAvailability {
  dayOfWeek: number; // 0 = 日曜, 1 = 月曜, ...
  isAvailable: boolean;
  timeSlots: AvailabilityTimeSlot[];
}

/**
 * 利用可能時間枠
 */
export interface AvailabilityTimeSlot {
  dayOfWeek: number; // 0 = 日曜, 1 = 月曜, ...
  startTime: string; // HH:MM 形式
  endTime: string;   // HH:MM 形式
  isAvailable: boolean;
}

/**
 * 追加書類
 */
export interface AdditionalDocument {
  type: 'certification' | 'license' | 'insurance' | 'reference_letter' | 'other';
  title: string;
  description: string;
  fileUrl?: string;
  uploadDate?: string;
  verified: boolean;
}

/**
 * Expertiseデータ型 (アプリケーション用)
 */
export interface ExpertiseData {
  specialties: string[];
  expertiseAreas: ExpertiseArea[];
  languages: LanguageSkill[];
}

export default AttenderProfile;