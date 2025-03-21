import { UUID } from './attender';

export interface ReviewPhoto {
  id: string;
  url: string;
}

export interface ReviewReply {
  id: string;
  text: string;
  createdAt: string; // ISO 8601形式の日時
}

export interface Review {
  id: string;
  experienceId: string;
  experienceTitle: string;
  bookingId: string;
  userId: string;
  userName: string;
  userImage: string | null;
  attenderId: UUID;
  rating: number;
  text: string;
  photos: ReviewPhoto[];
  attenderReply: ReviewReply | null;
  createdAt: string; // ISO 8601形式の日時
}

export interface ReviewSummary {
  attenderId: UUID;
  totalReviews: number;
  averageRating: number;
  ratingCounts: Record<number, number>; // 評価ごとの件数 (例: {5: 10, 4: 5, ...})
  repliedReviews: number; // 返信済みレビュー数
  reviewsWithPhotos: number; // 写真付きレビュー数
  latestReviewDate: string; // 最新レビューの日付
  averageReplyTime: number; // 平均返信時間（時間単位）
}

export interface ReviewFilterOptions {
  rating?: number | null;
  experience?: string | null;
  period?: 'all' | 'month' | 'week' | 'day';
  withPhotos?: boolean;
  withReplies?: boolean;
  withoutReplies?: boolean;
}
