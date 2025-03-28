/**
 * レビュー関連の型定義
 */

/**
 * レビューの基本型定義
 */
export interface Review {
  id: string;
  userId: string;
  attenderId: string;
  experienceId?: string;
  rating: number;
  comment: string;
  photos?: string[];
  helpfulCount: number;
  replyCount: number;
  createdAt: string;
  updatedAt: string;
  userDisplayName?: string;
  userPhotoUrl?: string;
}

/**
 * レビュー作成用データの型定義
 */
export interface ReviewCreateData {
  attenderId: string;
  experienceId?: string;
  rating: number;
  comment: string;
  photos?: string[];
}

/**
 * レビュー更新用データの型定義
 */
export interface ReviewUpdateData {
  rating?: number;
  comment?: string;
  photos?: string[];
}

/**
 * レビュー概要の型定義
 */
export interface ReviewSummary {
  averageRating: number;
  totalReviews: number;
  ratingCounts: Record<number, number>; // 評価ごとのレビュー数 (例: { 5: 10, 4: 5, ... })
}

export default Review;
