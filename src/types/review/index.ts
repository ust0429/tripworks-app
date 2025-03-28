/**
 * レビュー関連の型定義
 */

export interface Review {
  id: string;
  userId: string;
  attenderId: string;
  experienceId?: string;
  experienceTitle?: string;
  bookingId?: string;
  rating: number;
  comment: string;
  photos?: string[];
  helpfulCount: number;
  replyCount: number;
  createdAt: string;
  updatedAt: string;
  userName?: string;
  userImage?: string;
  userIsVerified?: boolean;
  isAnonymous?: boolean;
}

export interface ReviewSummary {
  averageRating: number;
  totalReviews: number;
  ratingCounts: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  mostRecent: Review | null;
}

export interface ReviewFormData {
  attenderId: string;
  experienceId?: string;
  rating: number;
  comment: string;
  photos?: string[];
  isAnonymous?: boolean;
}

export interface ReviewReplyFormData {
  reviewId: string;
  comment: string;
}
