/**
 * 予約関連の型定義
 */

// アテンダー（ガイド）情報
export interface AttenderInfo {
  id: string;
  name: string;
  profileImage?: string;
  specialties: string[];
  rating: number;
  reviewCount: number;
}

// 場所情報
export interface LocationInfo {
  name: string;
  address: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

// 予約情報
export interface BookingData {
  id: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'payment_pending';
  experienceTitle: string;
  date: string; // ISO形式の日付文字列
  startTime: string;
  endTime: string;
  duration: number; // 分単位
  attender: AttenderInfo;
  location: LocationInfo;
  participants: number;
  basePrice: number;
  optionPrice: number;
  taxAmount: number;
  totalAmount: number;
  paymentStatus?: 'pending' | 'completed' | 'failed';
  transactionId?: string;
  cancellationPolicy: string;
  notes?: string;
  createdAt: string; // ISO形式の日付文字列
}

// 予約フィルタ条件
export interface BookingFilterOptions {
  status?: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'payment_pending';
  startDate?: Date;
  endDate?: Date;
  attenderId?: string;
}

// 予約詳細のオプション項目
export interface BookingOption {
  id: string;
  name: string;
  description: string;
  price: number;
  selected: boolean;
}

// 予約作成リクエスト
export interface CreateBookingRequest {
  experienceId: string;
  date: string; // ISO形式の日付文字列
  startTime: string;
  participants: number;
  selectedOptions?: string[]; // オプションID
  notes?: string;
}
