/**
 * 予約関連の型定義
 */
import { UUID } from './attender';

/**
 * 予約ステータス
 */
export enum BookingStatus {
  PENDING = 'pending',       // 保留中
  CONFIRMED = 'confirmed',   // 確認済み
  COMPLETED = 'completed',   // 完了
  CANCELLED = 'cancelled',   // キャンセル
  NO_SHOW = 'no_show'        // 不参加
}

/**
 * 支払いステータス
 */
export enum PaymentStatus {
  PENDING = 'pending',      // 支払い待ち
  PAID = 'paid',            // 支払い済み
  REFUNDED = 'refunded',    // 返金済み
  FAILED = 'failed'         // 失敗
}

/**
 * 予約モデル
 */
export interface Booking {
  id: UUID;
  userId: UUID;
  attenderId: UUID;
  experienceId: UUID;
  title: string;
  description: string;
  date: string;            // ISO 8601形式の日付
  time: string;            // HH:MM形式
  duration: string;        // 経過時間（例：'2時間'）
  location: string;
  price: number;
  participants: number;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  notes?: string;
  cancelReason?: string;
  cancellationPolicy: string;
  hasReview: boolean;
  createdAt: string;       // ISO 8601形式の日時
  updatedAt: string;       // ISO 8601形式の日時
}

/**
 * 予約作成用データ
 */
export interface BookingCreateData {
  attenderId: UUID;
  experienceId: UUID;
  date: string;
  time: string;
  duration: string;
  participants: number;
  price: number;
  location: string;
  notes?: string;
  paymentMethod?: string;
}

/**
 * 予約データ（拡張型）
 */
export interface BookingData extends Booking {
  attender: AttenderInfo;
  experience: {
    id: UUID;
    title: string;
    description: string;
    imageUrl?: string;
    price: number;
    duration: string;
    maxParticipants: number;
    location: string;
    category: string;
  };
}

/**
 * アテンダー情報（シンプル型）
 */
export interface AttenderInfo {
  id: UUID;
  name: string;
  imageUrl?: string;
  bio?: string;
  rating: number;
  reviewCount: number;
  languages?: string[];
  specialties?: string[];
  location?: string;
}

/**
 * 予約フィルターオプション
 */
export interface BookingFilterOptions {
  status?: BookingStatus | null;
  fromDate?: string | null;
  toDate?: string | null;
  experienceId?: UUID | null;
  attenderId?: UUID | null;
}

export default Booking;
