/**
 * アテンダーに関する型定義
 */

/**
 * UUID型の定義
 */
export type UUID = string;

/**
 * 専門分野の型定義
 */
export interface ExpertiseArea {
  id: string;
  name: string;
  description?: string;
  icon?: string;
}

/**
 * 利用可能な時間枠の型定義
 */
export interface AvailabilityTimeSlot {
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6; // 曜日の値
  startTime: string; // 開始時間 (例: "09:00")
  endTime: string; // 終了時間 (例: "17:00")
  isAvailable: boolean; // 利用可能かどうか
}

// 実装上の互換性のために古い形式のプロパティも許可
export interface AvailabilityTimeSlot {
  day?: string; // 古いプロパティ形式
  available?: boolean; // 古いプロパティ形式
}

/**
 * 身分証明書の型定義
 */
export interface IdentificationDocument {
  documentType: string; // 身分証明書の種類 (例: "passport", "drivers_license")
  documentNumber: string; // 身分証明書番号
  issuedDate?: Date; // 発行日
  expiryDate: Date; // 有効期限
  issuingCountry?: string; // 発行国
  documentImageUrl: string; // 画像URL
  verificationStatus?: string; // 検証状態
  
  // 実装上の互換性のために古い形式のプロパティも許可
  type?: string; // documentTypeの別名
  number?: string; // documentNumberの別名
  expirationDate?: string; // expiryDateの文字列形式
  frontImageUrl?: string; // documentImageUrlの別名
  backImageUrl?: string; // 裏面画像
  [key: string]: any; // その他の任意プロパティを許可
}

/**
 * 追加書類の型定義
 */
export interface AdditionalDocument {
  documentType: string; // 書類の種類
  description?: string; // 説明
  documentUrl: string; // 書類のURL
  uploadedAt: Date; // アップロード日時
  verificationStatus?: string; // 検証状態
  
  // 実装上の互換性のために古い形式のプロパティも許可
  type?: string; // documentTypeの別名
  title?: string; // タイトル
  fileUrl?: string; // documentUrlの別名
  uploadDate?: string; // uploadedAtの文字列形式
  [key: string]: any; // その他の任意プロパティを許可
}

/**
 * 参照情報の型定義
 */
export interface Reference {
  name: string; // 紹介者名
  relationship: string; // 関係性
  contactInfo: string; // 連絡先
  referenceText?: string; // 紹介文
  
  // 実装上の互換性のために古い形式のプロパティも許可
  email?: string; // メールアドレス
  phoneNumber?: string; // 電話番号
  yearsKnown?: number; // 面識年数
  message?: string; // メッセージ
  verified?: boolean; // 検証済みかどうか
  [key: string]: any; // その他の任意プロパティを許可
}

/**
 * SNSリンクの型定義
 */
export interface SocialMediaLinks {
  twitter?: string;
  instagram?: string;
  facebook?: string;
  linkedin?: string;
  tiktok?: string;
  youtube?: string;
  website?: string;
  other?: Record<string, string>; // その他のSNS
}

/**
 * ポートフォリオ項目の型定義
 */
export interface PortfolioItem {
  id: string;
  title: string;
  description?: string;
  mediaUrls: string[]; // 画像・動画などのURL
  category?: string;
  date?: Date;
  featured?: boolean; // 注目の作品かどうか
  
  // 実装上の互換性のために古い形式のプロパティも許可
  imageUrls?: string[]; // mediaUrlsの別名
  tags?: string[]; // タグ
  [key: string]: any; // その他の任意プロパティを許可
}

/**
 * アテンダープロフィールの型定義
 */
export interface IAttenderProfile {
  // 基本情報
  id: string;
  userId: string;
  displayName: string;
  bio: string;
  location: string;
  languages: string[];
  profileImage: string;
  
  // 専門情報
  expertise: string[];
  experiences: IExperienceSample[];
  
  // 利用可能時間情報
  availability: Record<string, IAvailabilityDay>;
  
  // ステータス情報
  rating: number;
  reviewCount: number;
  verified: boolean;
  
  // 時間情報
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 体験サンプルの型定義
 */
export interface IExperienceSample {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  duration: number; // 分単位
  price?: number;
  
  // 実装上の互換性のために古い形式のプロパティも許可
  category?: string; // カテゴリ
  estimatedDuration?: number; // durationの別名
  maxParticipants?: number; // 最大参加人数
  pricePerPerson?: number; // 一人当たりの価格
  includesFood?: boolean; // 食事込み
  includesTransportation?: boolean; // 交通費込み
  cancellationPolicy?: string; // キャンセルポリシー
  imageUrls?: string[]; // 画像URL配列
  [key: string]: any; // その他の任意プロパティを許可
}

/**
 * 利用可能日情報の型定義
 */
export interface IAvailabilityDay {
  available: boolean;
  timeRange: [number, number]; // [開始時間, 終了時間] (例: [9, 17] は 9:00〜17:00)
}

/**
 * 体験の型定義
 */
export interface IExperience {
  id: string;
  attenderId: string;
  title: string;
  description: string;
  category: string[];
  location: {
    address: string;
    latitude?: number;
    longitude?: number;
  };
  images: string[];
  mainImage: string;
  duration: number; // 分単位
  price: number;
  maxParticipants: number;
  includesItems: string[];
  excludesItems: string[];
  requirements: string[];
  status: ExperienceStatus;
  rating: number;
  reviewCount: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 体験のステータスの列挙型
 */
export enum ExperienceStatus {
  DRAFT = 'draft',        // 下書き
  PENDING = 'pending',    // 審査待ち
  ACTIVE = 'active',      // 公開中
  INACTIVE = 'inactive',  // 非公開
  REJECTED = 'rejected'   // 却下
}

/**
 * アテンダー申請の型定義
 */
export interface IAttenderApplication {
  id?: string;
  userId?: string;
  personalInfo?: {
    fullName: string;
    phoneNumber: string;
    email: string;
    address: string;
  };
  identificationDocument?: {
    documentType: string;
    documentNumber: string;
    expiryDate: Date;
    documentImageUrl: string;
    [key: string]: any; 
  };
  expertise?: string[];
  experienceSamples?: IExperienceSample[];
  applicationStatus?: ApplicationStatus;
  rejectionReason?: string;
  createdAt?: Date;
  updatedAt?: Date;
  
  // 古い形式のプロパティも許可
  name?: string;
  email?: string;
  phoneNumber?: string;
  biography?: string;
  location?: any;
  isLocalResident?: boolean;
  isMigrant?: boolean;
  specialties?: string[];
  languages?: any[];
  availableTimes?: any[];
  agreements?: any;
  socialMediaLinks?: any;
  references?: any[];
  additionalDocuments?: any[];
  
  // 任意のプロパティを許可
  [key: string]: any;
}

/**
 * アテンダー申請のステータスの列挙型
 */
export enum ApplicationStatus {
  PENDING = 'pending',      // 審査待ち
  APPROVED = 'approved',    // 承認済み
  REJECTED = 'rejected',    // 却下
  INCOMPLETE = 'incomplete' // 情報不足
}

/**
 * 型の別名 - 古い型名との後方互換性のため
 */
export type AttenderProfile = IAttenderProfile;
export type AttenderApplicationData = IAttenderApplication;
