/**
 * アテンダー型定義ファイル
 */

// UUID型定義（IDとして使用する文字列）
export type UUID = string;

// アテンダー基本プロフィール情報
export interface AttenderBasic {
  id: UUID;
  name: string;
  profileImage?: string;
  location: string;
  specialties: string[];
  rating: number;
  reviewCount: number;
}

// アテンダー検索パラメータ
export interface AttenderSearchParams {
  query?: string;
  location?: string;
  specialties?: string[];
  minRating?: number;
  isLocalResident?: boolean;
  isMigrant?: boolean;
  page?: number;
  limit?: number;
}

// アテンダー検索結果
export interface AttenderSearchResult {
  attenders: AttenderBasic[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
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
 * 専門知識データ
 */
export interface ExpertiseData {
  specialties: string[];
  expertiseAreas: ExpertiseArea[];
  languages: LanguageSkill[];
  background?: string;
  education?: string[];
  certificates?: string[];
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
  pricePerPerson?: number;
  maxParticipants?: number;
  images?: string[];
  imageUrl?: string;
  imageUrls?: string[];
  location?: string;
  duration?: number;
  categories?: string[];
  includesFood?: boolean;
  includesTransportation?: boolean;
  cancellationPolicy?: 'flexible' | 'moderate' | 'strict';
  specialRequirements?: string;
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
 * 日次の利用可能時間
 */
export interface DailyAvailability {
  dayOfWeek: number;
  isAvailable: boolean;
  timeSlots: AvailabilityTimeSlot[];
}

/**
 * 本人確認書類
 */
export interface IdentificationDocument {
  type: 'passport' | 'driver_license' | 'id_card' | 'residence_card' | 'other';
  number: string;
  documentNumber?: string;
  expirationDate: string;
  expiryDate?: string;
  frontImageUrl?: string;
  backImageUrl?: string;
  verified?: boolean;
  verificationDate?: string;
  status?: 'pending' | 'verified' | 'rejected';
  rejectionReason?: string;
}

/**
 * 追加書類
 */
export interface AdditionalDocument {
  type: string;
  title: string;
  description?: string;
  fileUrl: string;
  uploadDate: string;
  verified: boolean;
  verificationDate?: string;
}

/**
 * 参照情報（推薦者）
 */
export interface Reference {
  name: string;
  relationship: string;
  company?: string;
  email: string;
  phone?: string;
  yearsKnown?: number;
  message?: string;
  verified: boolean;
  verificationDate?: string;
}

/**
 * ソーシャルメディアリンク
 */
export interface SocialMediaLinks {
  instagram?: string;
  twitter?: string;
  facebook?: string;
  linkedin?: string;
  youtube?: string;
  website?: string;
  blog?: string;
  tiktok?: string;
  other?: string[];
}

/**
 * ポートフォリオ項目
 */
export interface PortfolioItem {
  id: string;
  title: string;
  description?: string;
  imageUrls: string[];
  videoUrls?: string[];
  videoUrl?: string;
  link?: string;
  linkUrl?: string;
  type: 'image' | 'video' | 'document' | 'link';
  createdAt: string;
  updatedAt: string;
}

/**
 * フォームステータスタイプ
 */
export type FormStatusType = 'required' | 'completed' | 'pending' | 'rejected' | 'draft' | 'review' | 'approved' | 'optional';

/**
 * アテンダー申請データ
 */
export interface AttenderApplicationData {
  id?: string;
  userId?: string;
  name: string;
  email: string;
  phoneNumber: string;
  location: {
    country: string;
    region: string;
    city: string;
  };
  biography: string;
  isLocalResident: boolean;
  isMigrant: boolean;
  yearsMoved?: number;
  previousLocation?: string;
  specialties: string[];
  languages: LanguageSkill[];
  expertise: ExpertiseData;
  availableTimes: AvailabilityTimeSlot[];
  experienceSamples: ExperienceSample[];
  identificationDocument: IdentificationDocument;
  additionalDocuments?: AdditionalDocument[];
  agreements: {
    termsOfService: boolean;
    privacyPolicy: boolean;
    codeOfConduct: boolean;
    backgroundCheck: boolean;
  };
  socialMediaLinks?: SocialMediaLinks;
  references?: Reference[];
  formStatus?: FormStatusType;
  applicationDate?: string;
  updatedAt?: string;
  reviewNotes?: string;
  reviewerId?: string;
  reviewDate?: string;
}

/**
 * アテンダープロファイル
 */
export interface AttenderProfile {
  id: string;
  name: string;
  bio: string;
  location: string;
  specialties: string[];
  profileImage?: string;
  imageUrl?: string;
  experienceSamples?: ExperienceSample[];
  languages: LanguageSkill[];
  isLocalResident: boolean;
  isMigrant: boolean;
  yearsMoved?: number;
  previousLocation?: string;
  expertise: ExpertiseArea[];
  availability?: DailyAvailability[];
  availableTimes?: AvailabilityTimeSlot[];
  averageRating: number;
  rating?: number;
  reviewCount: number;
  verified?: boolean;
  joinedAt?: string;
  createdAt: string;
  lastActive?: string;
  updatedAt: string;
  completionScore?: number;
}

/**
 * アテンダー（認証情報含む）
 */
export interface Attender extends AttenderProfile {
  userId: string;
  email: string;
  isActive: boolean;
  accountStatus: 'pending' | 'active' | 'suspended' | 'inactive';
  stripeConnectAccountId?: string;
  paymentVerified: boolean;
  notificationSettings: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
}
