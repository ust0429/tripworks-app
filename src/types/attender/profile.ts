/**
 * アテンダープロファイル型定義
 */

export interface AttenderProfile {
  id: string;
  name: string;
  bio: string;
  location: string;
  specialties: string[];
  profileImage?: string;
  imageUrl?: string;
  email?: string;
  isLocalResident?: boolean;
  isMigrant?: boolean;
  yearsMoved?: number;
  previousLocation?: string;
  expertise?: ExpertiseArea[];
  experienceSamples?: ExperienceSample[];
  languages?: LanguageSkill[];
  availability?: DailyAvailability[];
  availableTimes?: AvailabilityTimeSlot[];
  background?: string;
  verified?: boolean;
  joinedAt?: string;
  lastActive?: string;
  completionScore?: number;
  rating: number;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
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
  imageUrls?: string[];
  imageUrl?: string; // 互換性のため
  duration?: number; // 互換性のため
  categories?: string[]; // 互換性のため
  location?: string;
  createdAt?: string;
  updatedAt?: string;
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
  certifications?: string[];
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
 * 日別利用可能時間
 */
export interface DailyAvailability {
  dayOfWeek: number; // 0-6
  isAvailable: boolean;
  timeSlots: {
    startTime: string;
    endTime: string;
  }[];
}

/**
 * 参考資料
 */
export interface Reference {
  name: string;
  email: string;
  phone?: string;
  relationship: string;
}

/**
 * 追加書類
 */
export interface AdditionalDocument {
  id?: string;
  title: string;
  type: string;
  url: string;
  uploadedAt: string;
}

/**
 * 身分証明書
 */
export interface IdentificationDocument {
  id?: string;
  documentType: 'id_card' | 'passport' | 'drivers_license' | 'other';
  documentNumber: string;
  issuedBy: string;
  issuedDate: string;
  expiryDate?: string;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  documentImageFront: string;
  documentImageBack?: string;
}

/**
 * SNSリンク
 */
export interface SocialMediaLinks {
  instagram?: string;
  twitter?: string;
  facebook?: string;
  linkedin?: string;
  website?: string;
  other?: string;
}

/**
 * フォームステータス
 */
export type FormStatusType = 'editing' | 'saving' | 'submitting' | 'success' | 'error';

/**
 * プロフィールコンテキスト状態
 */
export interface ProfileContextState {
  profile: AttenderProfile | null;
  editMode: ProfileEditMode;
  loadingState: 'idle' | 'loading' | 'success' | 'error';
  error: string | null;
}

/**
 * プロフィール編集モード
 */
export type ProfileEditMode = 'view' | 'edit' | 'edit-availability' | 'edit-experiences';

/**
 * プロフィール更新操作
 */
export interface ProfileUpdateOperation {
  field: keyof AttenderProfile;
  value: any;
}

/**
 * アテンダー登録申請データ
 */
export interface AttenderApplicationData {
  name: string;
  email: string;
  phone?: string;
  address?: {
    country: string;
    prefecture: string;
    city: string;
    line1: string;
    line2?: string;
    postalCode: string;
  };
  bio: string;
  location: string;
  specialties: string[];
  isLocalResident: boolean;
  isMigrant: boolean;
  yearsMoved?: number;
  previousLocation?: string;
  languages?: LanguageSkill[];
  expertise?: ExpertiseArea[];
  experienceSamples?: ExperienceSample[];
  availableTimes?: AvailabilityTimeSlot[];
  references?: Reference[];
  identificationDocument?: IdentificationDocument;
  additionalDocuments?: AdditionalDocument[];
  socialMediaLinks?: SocialMediaLinks;
  agreementChecked: boolean;
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected';
  submittedAt?: string;
  reviewedAt?: string;
  reviewNotes?: string;
  stepCompleted: {
    basicInfo: boolean;
    expertise: boolean;
    experiences: boolean;
    availability: boolean;
    verification: boolean;
  };
}

export default AttenderProfile;