/**
 * アテンダー関連の型定義
 */

// アテンダー基本情報
export interface Attender {
  id: string;
  userId: string;
  name: string;
  profileImage?: string;
  backgroundImage?: string;
  email: string;
  phoneNumber: string;
  location: {
    country: string;
    region: string;
    city: string;
  };
  biography: string;
  specialties: string[];
  languages: LanguageSkill[];
  experiences: string[]; // 提供可能な体験IDのリスト
  averageRating: number;
  reviewCount: number;
  verificationStatus: VerificationStatus;
  registrationDate: string; // ISO形式の日付文字列
  lastActiveDate: string; // ISO形式の日付文字列
  status: AttenderStatus;
  responseRate: number; // 返信率（0-100%）
  responseTime: number; // 平均返信時間（分）
  cancellationRate: number; // キャンセル率（0-100%）
  completedExperienceCount: number; // 完了した体験数
  earnings: {
    total: number;
    lastMonth: number;
  };
  availableTimes: AvailabilityTimeSlot[];
  backgroundCheck: BackgroundCheckStatus;
  identityVerified: boolean;
  isLocalResident: boolean; // 地元住民かどうか
  isMigrant: boolean; // 移住者かどうか
  yearsMoved?: number; // 移住してからの年数
  previousLocation?: string; // 以前の居住地
  expertise: ExpertiseArea[];
  socialMediaLinks?: SocialMediaLinks;
  portfolio?: PortfolioItem[];
}

// アテンダーステータス
export type AttenderStatus = 
  | 'active' // 活動中
  | 'inactive' // 一時的に非アクティブ
  | 'pending_review' // 審査待ち
  | 'suspended' // 停止中
  | 'banned'; // 永久停止

// 認証ステータス
export type VerificationStatus = 
  | 'unverified' // 未認証
  | 'pending' // 審査中
  | 'verified' // 認証済み
  | 'rejected'; // 拒否

// バックグラウンドチェックステータス
export type BackgroundCheckStatus = 
  | 'not_submitted' // 未提出
  | 'pending' // 審査中
  | 'passed' // 合格
  | 'failed'; // 不合格

// 身分証明書の型定義
export interface IdentificationDocument {
  type: 'passport' | 'driver_license' | 'id_card' | 'residence_card' | 'other';
  number: string;
  expirationDate: string;
  frontImageUrl: string;
  backImageUrl?: string;
}

// 利用可能時間枠
export interface AvailabilityTimeSlot {
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0: 日曜, 1: 月曜, ...
  startTime: string; // 24時間形式 "HH:MM"
  endTime: string; // 24時間形式 "HH:MM"
  isAvailable: boolean;
}

// 専門分野
export interface ExpertiseArea {
  category: string;
  subcategories: string[];
  yearsOfExperience: number;
  description: string;
  certifications?: string[];
}

// SNSリンク
export interface SocialMediaLinks {
  instagram?: string;
  twitter?: string;
  youtube?: string;
  tiktok?: string;
  facebook?: string;
  website?: string;
  blog?: string;
}

// ポートフォリオ項目
export interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  imageUrls: string[];
  videoUrl?: string;
  link?: string;
}

// アテンダー登録申請フォームデータ
// 言語スキルの型定義
export interface LanguageSkill {
  language: string; // 言語コード（例: 'ja', 'en'）
  proficiency: 'beginner' | 'intermediate' | 'advanced' | 'native'; // 熟練度
}

export interface AttenderApplicationData {
  // 基本情報
  name: string;
  email: string;
  phoneNumber: string;
  location: {
    country: string;
    region: string;
    city: string;
  };
  
  // プロフィール情報
  biography: string;
  specialties: string[];
  languages: LanguageSkill[]; // 言語スキルの配列
  
  // 居住情報
  isLocalResident: boolean;
  isMigrant: boolean;
  yearsMoved?: number;
  previousLocation?: string;
  
  // 専門情報
  expertise: ExpertiseArea[];
  
  // 提供可能な体験の概要
  experienceSamples: ExperienceSample[];
  
  // 利用可能時間
  availableTimes: AvailabilityTimeSlot[];
  
  // 身分証明書
  identificationDocument: {
    type: 'passport' | 'driver_license' | 'id_card' | 'residence_card' | 'other';
    number: string;
    expirationDate: string;
    frontImageUrl: string;
    backImageUrl?: string;
  };
  
  // 承諾事項
  agreements: {
    termsOfService: boolean;
    privacyPolicy: boolean;
    codeOfConduct: boolean;
    backgroundCheck: boolean;
  };
  
  // 追加情報
  socialMediaLinks?: SocialMediaLinks;
  references?: Reference[];
  additionalDocuments?: AdditionalDocument[];
}

// 体験サンプル（アテンダー申請時に入力する提供可能な体験の例）
export interface ExperienceSample {
  title: string;
  description: string;
  category: string;
  estimatedDuration: number; // 分単位
  maxParticipants: number;
  pricePerPerson: number;
  imageUrls?: string[]; // 画像の配列
  includesFood: boolean;
  includesTransportation: boolean;
  specialRequirements?: string;
  cancellationPolicy: 'flexible' | 'moderate' | 'strict';
}

// 推薦者情報
export interface Reference {
  name: string;
  relationship: string;
  email: string;
  phoneNumber?: string;
  contactInfo?: string;
  yearsKnown?: number;
  message?: string;
  verified?: boolean;
}

// 追加書類
export interface AdditionalDocument {
  type: 'certification' | 'license' | 'insurance' | 'reference_letter' | 'other';
  title: string;
  description?: string;
  fileUrl: string;
  uploadDate: string;
}

// アテンダー審査結果
export interface AttenderVerificationResult {
  attender: Attender;
  reviewerId: string;
  reviewDate: string;
  status: VerificationStatus;
  notes?: string;
  requiredChanges?: string[];
  verifiedDocuments: string[];
  rejectionReason?: string;
}
