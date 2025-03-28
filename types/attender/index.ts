/**
 * アテンダー関連の型定義
 */

// 言語スキル
export interface LanguageSkill {
  language: string;
  proficiency: 'beginner' | 'intermediate' | 'advanced' | 'native';
}

// 専門分野
export interface ExpertiseArea {
  category: string;
  subcategories?: string[];
  yearsOfExperience?: number;
  description?: string;
}

// 体験サンプル
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
  // 追加のプロパティ
  imageUrl?: string;
  imageUrls?: string[];
  // 引っかかる新しいプロパティ
  maxParticipants?: number;
  pricePerPerson?: number;
  duration?: number;
  includesFood?: boolean;
  includesTransportation?: boolean;
  cancellationPolicy?: string;
  specialRequirements?: string;
  createdAt?: string;
  updatedAt?: string;
}

// 利用可能時間枠
export interface AvailabilityTimeSlot {
  dayOfWeek: number; // 0 = 日曜, 1 = 月曜, ...
  startTime: string; // HH:MM 形式
  endTime: string;   // HH:MM 形式
  isAvailable: boolean;
}

// アテンダープロファイル
export interface AttenderProfile {
  id: string;
  name: string;
  bio: string;
  location: string;
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

// プロファイル編集モード用の拡張インターフェース
export interface EditableAttenderProfile extends AttenderProfile {
  editMode?: boolean;
}

// アテンダー登録フォーム
export interface AttenderRegistrationForm {
  name: string;
  bio: string;
  location: string;
  specialties: string[];
  isLocalResident: boolean;
  isMigrant: boolean;
  yearsMoved?: number;
  previousLocation?: string;
}

// アテンダー検索フィルター
export interface AttenderSearchFilter {
  location?: string;
  specialties?: string[];
  rating?: number;
  isLocalResident?: boolean;
  isMigrant?: boolean;
  availability?: {
    dayOfWeek?: number;
    startTime?: string;
    endTime?: string;
  };
  keyword?: string;
}

// アテンダー検索結果
export interface AttenderSearchResult {
  attenders: AttenderProfile[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// エクスポート（既存モジュールとの統合のため）
export type {
  LanguageSkill,
  ExpertiseArea,
  ExperienceSample,
  AvailabilityTimeSlot,
  AttenderProfile,
  EditableAttenderProfile,
  AttenderRegistrationForm,
  AttenderSearchFilter,
  AttenderSearchResult
};

export default AttenderProfile;
