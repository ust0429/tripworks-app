/**
 * アテンダーに関連する型定義
 */

// アテンダー申請フォームのデータ
export interface AttenderApplicationData {
  // 基本情報
  id?: string;
  name: string;
  email: string;
  phoneNumber: string;
  avatarImageUrl?: string;
  biography: string;
  
  // 居住地情報
  location: {
    country: string;
    region: string;
    city: string;
    address?: string;
    postalCode?: string;
  };
  
  // 地元住民かどうか
  isLocalResident: boolean;
  
  // 移住者の場合の追加情報
  isMigrant?: boolean;
  previousLocation?: string;
  yearsMoved?: number;
  
  // 専門分野とスキル
  specialties: string[];
  languages: {
    language: string;
    proficiency: 'beginner' | 'intermediate' | 'advanced' | 'native';
  }[];
  expertise: ExpertiseArea[];
  
  // 体験サンプル
  experienceSamples: ExperienceSample[];
  
  // 利用可能時間
  availableTimes: AvailabilityTimeSlot[];
  
  // 身分証明書
  identificationDocument: IdentificationDocument;
  
  // 追加書類
  additionalDocuments?: AdditionalDocument[];
  
  // SNSアカウント
  socialMediaLinks?: SocialMediaLinks;
  
  // 推薦者
  references?: Reference[];
  
  // 同意事項
  agreements: {
    termsOfService: boolean;
    privacyPolicy: boolean;
    codeOfConduct: boolean;
    backgroundCheck: boolean;
  };
  
  // ポートフォリオ
  portfolioItems?: PortfolioItem[];
  
  // 申請ステータス
  status?: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected';
  
  // 審査コメント
  reviewComments?: string;
  
  // 登録日時
  registeredAt?: string;
  updatedAt?: string;
}

// 専門分野
export interface ExpertiseArea {
  category: string;
  subcategories: string[];
  yearsOfExperience: number;
  description: string;
  certifications?: string[];
}

// 体験サンプル
export interface ExperienceSample {
  id?: string;
  title: string;
  description: string;
  category: string;
  subcategories?: string[];
  estimatedDuration: number; // 分単位
  maxParticipants: number;
  pricePerPerson: number;
  currency?: string;
  included?: string[];
  excluded?: string[];
  locationDescription?: string;
  imageUrls?: string[];
  tags?: string[];
  includesFood?: boolean;
  includesTransportation?: boolean;
  cancellationPolicy?: 'flexible' | 'moderate' | 'strict';
  specialRequirements?: string;
}

// 利用可能時間スロット
export interface AvailabilityTimeSlot {
  id?: string;
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  isAvailable: boolean;
  startTime: string; // HH:MM形式
  endTime: string; // HH:MM形式
  notes?: string;
  day?: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  timeSlot?: 'morning' | 'afternoon' | 'evening';
}

// 身分証明書
export interface IdentificationDocument {
  type: 'passport' | 'driver_license' | 'id_card' | 'residence_card' | 'other';
  number: string;
  expirationDate: string; // YYYY-MM-DD形式
  issuingCountry?: string;
  frontImageUrl: string;
  backImageUrl?: string;
  additionalInfo?: string;
}

// 追加書類
export interface AdditionalDocument {
  id?: string;
  type: 'certification' | 'license' | 'insurance' | 'reference_letter' | 'other';
  title: string;
  description?: string;
  fileUrl: string;
  issuedAt?: string; // YYYY-MM-DD形式
  expiresAt?: string; // YYYY-MM-DD形式
  uploadDate?: string;
  name?: string;
}

// SNSリンク
export interface SocialMediaLinks {
  instagram?: string;
  twitter?: string;
  facebook?: string;
  linkedin?: string;
  youtube?: string;
  tiktok?: string;
  website?: string;
  blog?: string;
  other?: {
    title: string;
    url: string;
  }[];
}

// 推薦者
export interface Reference {
  id?: string;
  name: string;
  relationship: string;
  email: string;
  phoneNumber?: string;
  message?: string;
  verified?: boolean;
  contactInfo?: string;
  yearsKnown?: number;
}

// ポートフォリオアイテム
export interface PortfolioItem {
  id?: string;
  title: string;
  description?: string;
  category: string;
  imageUrls: string[];
  tags?: string[];
  createdAt?: string;
}

// アテンダーの詳細情報
export interface AttenderProfile extends Omit<AttenderApplicationData, 'agreements' | 'status' | 'reviewComments'> {
  id: string;
  rating?: number;
  reviewCount?: number;
  totalExperiences?: number;
  badges?: {
    id: string;
    name: string;
    description: string;
    imageUrl: string;
  }[];
  verificationStatus: {
    identity: boolean;
    email: boolean;
    phone: boolean;
    address?: boolean;
    socialMedia?: boolean;
  };
  memberSince: string;
  responseRate?: number;
  responseTime?: string;
  featured?: boolean;
}
