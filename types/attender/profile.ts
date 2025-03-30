/**
 * アテンダープロファイル型定義
 * 
 * アテンダーの詳細情報を表す型
 */

// プロフィール編集モード
export type ProfileEditMode = 'view' | 'edit';

// プロフィールの状態
export interface ProfileContextState {
  profile: AttenderProfile | null;
  editMode: ProfileEditMode;
  loadingState: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  completionScore?: number;
  improvementTips?: string[];
}

// プロフィール更新操作
export interface ProfileUpdateOperation {
  field: keyof AttenderProfile;
  value: any;
}

/**
 * アテンダープロファイル
 */
export interface AttenderProfile {
  id: string;
  userId?: string;
  name: string;
  email: string;
  emailAddress?: string; // 互換性のためのフィールド
  phoneNumber?: string;
  bio: string;
  biography?: string; // 互換性のためのフィールド
  background?: string;
  location: string | { country: string; region: string; city: string };
  specialties: string[];
  profilePhoto?: string;
  imageUrl?: string; // 互換性のためのフィールド
  experienceSamples: ExperienceSample[];
  languages: LanguageSkill[];
  isLocalResident: boolean;
  isMigrant: boolean;
  yearsMoved?: number;
  previousLocation?: string;
  expertise: ExpertiseArea[];
  availableTimes?: AvailabilityTimeSlot[]; // 旧APIとの互換性のため
  availability: Availability[];
  averageRating?: number;
  rating?: number; // 互換性のためのフィールド
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
  
  // 拡張フィールド
  verified?: boolean;
  joinedAt?: string;
  lastActive?: string;
  lastActiveDate?: string; // 互換性のためのフィールド
  socialMediaLinks?: SocialMediaLinks;
  completionScore?: number;
  categories?: string[];
}

/**
 * 言語スキル
 */
export interface LanguageSkill {
  language: string;
  proficiency: 'beginner' | 'intermediate' | 'advanced' | 'native';
  // 追加の属性
  description?: string;
  certifications?: string[];
}

/**
 * 専門分野
 */
export interface ExpertiseArea {
  category: string;
  subcategories?: string[];
  yearsOfExperience?: number;
  description?: string;
  // 追加の属性
  certifications?: Certification[];
  level?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
}

/**
 * 認証
 */
export interface Certification {
  name: string;
  issuer: string;
  issueDate?: string;
  expiryDate?: string;
  verificationUrl?: string;
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
  duration?: number; // 互換性のためのフィールド
  price?: number;
  pricePerPerson?: number;
  images?: string[];
  imageUrl?: string; // 互換性のためのフィールド
  imageUrls?: string[];
  location?: string;
  
  // 追加の属性
  maxParticipants?: number;
  includesFood?: boolean;
  includesTransportation?: boolean;
  cancellationPolicy?: string;
  specialRequirements?: string;
  categories?: string[];
  tags?: string[];
  highlights?: string[];
  createdAt?: string;
  updatedAt?: string;
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
 * 新しい利用可能時間の形式（日ごとのタイムスロット）
 */
export interface Availability {
  dayOfWeek: number; // 0 = 日曜, 1 = 月曜, ...
  isAvailable: boolean;
  timeSlots: TimeSlot[];
}

/**
 * 時間枠
 */
export interface TimeSlot {
  startTime: string; // HH:MM 形式
  endTime: string;   // HH:MM 形式
  isBooked?: boolean;
}

/**
 * SNSリンク
 */
export interface SocialMediaLinks {
  twitter?: string;
  facebook?: string;
  instagram?: string;
  linkedin?: string;
  youtube?: string;
  tiktok?: string;
  website?: string;
}

/**
 * ポートフォリオ項目
 */
export interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  linkUrl?: string;
  type: 'image' | 'video' | 'document' | 'link';
  tags?: string[];
  createdAt: string;
}

/**
 * レビュー情報の型定義
 */
export interface ReviewSummary {
  averageRating: number;
  reviewCount: number;
  ratingDistribution?: { [key: string]: number }; // 例: { "5": 10, "4": 5, ... }
}

export default AttenderProfile;