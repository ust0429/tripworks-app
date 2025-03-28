/**
 * アテンダープロファイル型定義
 * 
 * アテンダーの詳細情報を表す型
 */

export interface AttenderProfile {
  id: string;
  name: string;
  bio: string;
  location: string | { country: string; region: string; city: string };
  specialties: string[];
  profilePhoto?: string;
  experienceSamples: ExperienceSample[];
  languages: LanguageSkill[];
  isLocalResident: boolean;
  isMigrant: boolean;
  yearsMoved?: number;
  previousLocation?: string;
  expertise: ExpertiseArea[];
  availableTimes: AvailabilityTimeSlot[];
  averageRating: number;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
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
  price?: number;
  images?: string[];
  location?: string;
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

export default AttenderProfile;