/**
 * レビューサービス
 * 
 * レビューの投稿、取得、編集、削除などの機能を提供します。
 */

import { v4 as uuidv4 } from 'uuid';
import api, { logApiRequest, logApiResponse, ApiOptions } from '../utils/apiClient';
import enhancedApi from '../utils/apiClientEnhanced';
import { ENDPOINTS } from '../config/api';
import { isDevelopment } from '../config/env';

// Firebase AuthのインポートとFallback
let getAuth;
try {
  getAuth = require('firebase/auth').getAuth;
} catch (e) {
  // Firebaseが利用できない場合はモックを使用
  getAuth = () => ({
    currentUser: { uid: 'mock-user-id' }
  });
}

// レビューの型定義
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

// レビュー作成用データの型定義
export interface ReviewCreateData {
  attenderId: string;
  experienceId?: string;
  rating: number;
  comment: string;
  photos?: string[];
}

// レビュー統計情報の型定義
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

// モックデータ（開発環境でのみ使用）
const MOCK_REVIEWS: Record<string, Review> = {
  'rev_123': {
    id: 'rev_123',
    userId: 'user_456',
    attenderId: 'att_123',
    experienceId: 'exp_001',
    rating: 5,
    comment: '素晴らしい体験でした！アテンダーの方の知識が豊富で、陶芸の奥深さを知ることができました。',
    photos: ['/images/reviews/review1.jpg', '/images/reviews/review2.jpg'],
    helpfulCount: 12,
    replyCount: 1,
    createdAt: '2025-02-15T10:30:00Z',
    updatedAt: '2025-02-15T10:30:00Z',
    userDisplayName: '山田太郎',
    userPhotoUrl: '/images/users/user_456.jpg'
  },
  'rev_124': {
    id: 'rev_124',
    userId: 'user_789',
    attenderId: 'att_123',
    experienceId: 'exp_001',
    rating: 4,
    comment: '良い体験でした。もう少し時間があれば完成度の高い作品ができたかもしれません。',
    helpfulCount: 5,
    replyCount: 1,
    createdAt: '2025-02-20T14:15:00Z',
    updatedAt: '2025-02-20T14:15:00Z',
    userDisplayName: '鈴木花子',
    userPhotoUrl: '/images/users/user_789.jpg'
  }
};

// 使用するAPIクライアント
// 開発環境では既存のモックを使用し、本番環境ではclientプロパティを使用
const getApiClient = () => {
  return isDevelopment() ? api : enhancedApi.client;
};

/**
 * 特定のアテンダーのレビュー一覧を取得
 * 
 * @param attenderId アテンダーID
 * @param limit 取得件数（デフォルト10件）
 * @returns レビュー一覧
 */
export async function getAttenderReviews(attenderId: string, limit: number = 10): Promise<Review[]> {
  try {
    // 開発環境ではモックデータを使用
    if (isDevelopment()) {
      // モックデータからこのアテンダーのレビューだけをフィルタリング
      let reviews = Object.values(MOCK_REVIEWS).filter(
        review => review.attenderId === attenderId
      );
      
      // 最新順に並べ替え
      reviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      // リミットを適用
      return reviews.slice(0, limit);
    }
    
    // 本番環境ではAPIを使用
    const options: ApiOptions = {
      headers: { 'X-Limit': String(limit) }
    };
    
    logApiRequest('GET', ENDPOINTS.REVIEW.ATTENDER_REVIEWS(attenderId), { limit });
    
    const response = await getApiClient().get<Review[]>(ENDPOINTS.REVIEW.ATTENDER_REVIEWS(attenderId), options);
    
    logApiResponse('GET', ENDPOINTS.REVIEW.ATTENDER_REVIEWS(attenderId), response);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    return [];
  } catch (error) {
    console.error('レビュー一覧取得エラー:', error);
    return [];
  }
}

/**
 * 特定の体験のレビュー一覧を取得
 * 
 * @param experienceId 体験ID
 * @param limit 取得件数（デフォルト10件）
 * @returns レビュー一覧
 */
export async function getExperienceReviews(experienceId: string, limit: number = 10): Promise<Review[]> {
  try {
    // 開発環境ではモックデータを使用
    if (isDevelopment()) {
      // モックデータからこの体験のレビューだけをフィルタリング
      let reviews = Object.values(MOCK_REVIEWS).filter(
        review => review.experienceId === experienceId
      );
      
      // 最新順に並べ替え
      reviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      // リミットを適用
      return reviews.slice(0, limit);
    }
    
    // 本番環境ではAPIを使用
    const options: ApiOptions = {
      headers: { 'X-Limit': String(limit) }
    };
    
    logApiRequest('GET', ENDPOINTS.REVIEW.EXPERIENCE_REVIEWS(experienceId), { limit });
    
    const response = await getApiClient().get<Review[]>(ENDPOINTS.REVIEW.EXPERIENCE_REVIEWS(experienceId), options);
    
    logApiResponse('GET', ENDPOINTS.REVIEW.EXPERIENCE_REVIEWS(experienceId), response);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    return [];
  } catch (error) {
    console.error('レビュー一覧取得エラー:', error);
    return [];
  }
}

/**
 * ユーザーが投稿したレビュー一覧を取得
 * 
 * @param limit 取得件数（デフォルト10件）
 * @returns レビュー一覧
 */
export async function getUserReviews(limit: number = 10): Promise<Review[]> {
  try {
    // 現在のユーザーIDを取得
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user) {
      throw new Error('ユーザーがログインしていません');
    }
    
    const userId = user.uid;
    
    // 開発環境ではモックデータを使用
    if (isDevelopment()) {
      // モックデータからこのユーザーのレビューだけをフィルタリング
      let reviews = Object.values(MOCK_REVIEWS).filter(
        review => review.userId === userId
      );
      
      // 最新順に並べ替え
      reviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      // リミットを適用
      return reviews.slice(0, limit);
    }
    
    // 本番環境ではAPIを使用
    const options: ApiOptions = {
      headers: { 'X-Limit': String(limit) }
    };
    
    logApiRequest('GET', ENDPOINTS.REVIEW.USER_REVIEWS, { userId, limit });
    
    const response = await getApiClient().get<Review[]>(ENDPOINTS.REVIEW.USER_REVIEWS, options);
    
    logApiResponse('GET', ENDPOINTS.REVIEW.USER_REVIEWS, response);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    return [];
  } catch (error) {
    console.error('ユーザーレビュー一覧取得エラー:', error);
    return [];
  }
}

/**
 * 特定のレビューの詳細を取得
 * 
 * @param reviewId レビューID
 * @returns レビュー詳細、存在しない場合はnull
 */
export async function getReviewDetails(reviewId: string): Promise<Review | null> {
  try {
    // 開発環境ではモックデータを使用
    if (isDevelopment() && MOCK_REVIEWS[reviewId]) {
      return MOCK_REVIEWS[reviewId];
    }
    
    // 本番環境ではAPIを使用
    logApiRequest('GET', ENDPOINTS.REVIEW.DETAIL(reviewId), {});
    
    const response = await getApiClient().get<Review>(ENDPOINTS.REVIEW.DETAIL(reviewId));
    
    logApiResponse('GET', ENDPOINTS.REVIEW.DETAIL(reviewId), response);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    return null;
  } catch (error) {
    console.error('レビュー詳細取得エラー:', error);
    return null;
  }
}

/**
 * レビュー統計情報を取得
 * 
 * @param attenderId アテンダーID
 * @returns レビュー統計情報
 */
export async function getReviewSummary(attenderId: string): Promise<ReviewSummary> {
  try {
    // 開発環境ではモックデータを使用
    if (isDevelopment()) {
      // アテンダーに関連するレビューを取得
      const reviews = Object.values(MOCK_REVIEWS).filter(
        review => review.attenderId === attenderId
      );
      
      if (reviews.length === 0) {
        return {
          averageRating: 0,
          totalReviews: 0,
          ratingCounts: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
          mostRecent: null
        };
      }
      
      // 評価の合計を計算
      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
      
      // 評価ごとの数を集計
      const ratingCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
      reviews.forEach(review => {
        ratingCounts[review.rating as keyof typeof ratingCounts]++;
      });
      
      // 最新のレビューを取得
      const sortedReviews = [...reviews].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      
      return {
        averageRating: totalRating / reviews.length,
        totalReviews: reviews.length,
        ratingCounts,
        mostRecent: sortedReviews[0] || null
      };
    }
    
    // 本番環境ではAPIを使用
    logApiRequest('GET', `${ENDPOINTS.REVIEW.ATTENDER_REVIEWS(attenderId)}/summary`, {});
    
    const response = await getApiClient().get<ReviewSummary>(`${ENDPOINTS.REVIEW.ATTENDER_REVIEWS(attenderId)}/summary`);
    
    logApiResponse('GET', `${ENDPOINTS.REVIEW.ATTENDER_REVIEWS(attenderId)}/summary`, response);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    // デフォルト値を返す
    return {
      averageRating: 0,
      totalReviews: 0,
      ratingCounts: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      mostRecent: null
    };
  } catch (error) {
    console.error('レビュー統計取得エラー:', error);
    return {
      averageRating: 0,
      totalReviews: 0,
      ratingCounts: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      mostRecent: null
    };
  }
}

/**
 * 新規レビューを投稿
 * 
 * @param reviewData レビューデータ
 * @returns 成功時はレビューID、失敗時はエラーをスロー
 */
export async function createReview(reviewData: ReviewCreateData): Promise<string> {
  try {
    // フィールドの検証
    if (reviewData.rating < 1 || reviewData.rating > 5) {
      throw new Error('評価は1から5の間で入力してください');
    }
    
    if (!reviewData.comment || reviewData.comment.trim().length === 0) {
      throw new Error('コメントは必須です');
    }
    
    // 現在のユーザーIDを取得
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user) {
      throw new Error('ユーザーがログインしていません');
    }
    
    const userId = user.uid;
    
    // 開発環境ではモックデータを使用
    if (isDevelopment()) {
      // 模擬的に処理遅延を再現
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const reviewId = `rev_${uuidv4().substring(0, 8)}`;
      
      // 新しいレビューデータを作成
      MOCK_REVIEWS[reviewId] = {
        id: reviewId,
        userId,
        attenderId: reviewData.attenderId,
        experienceId: reviewData.experienceId,
        rating: reviewData.rating,
        comment: reviewData.comment,
        photos: reviewData.photos,
        helpfulCount: 0,
        replyCount: 0,
        userDisplayName: 'テストユーザー', // 実際のユーザー名はバックエンドで設定
        userPhotoUrl: '/images/users/default.jpg', // 実際のユーザー画像はバックエンドで設定
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      return reviewId;
    }
    
    // 本番環境ではAPIを使用
    const requestData = {
      userId,
      ...reviewData
    };
    
    logApiRequest('POST', ENDPOINTS.REVIEW.CREATE, { dataSize: JSON.stringify(requestData).length });
    
    const response = await getApiClient().post<{ id: string }>(ENDPOINTS.REVIEW.CREATE, requestData);
    
    logApiResponse('POST', ENDPOINTS.REVIEW.CREATE, response);
    
    if (response.success && response.data) {
      return response.data.id;
    }
    
    // エラーレスポンスの処理
    const errorMessage = response.error?.message || 'レビューの投稿に失敗しました';
    throw new Error(errorMessage);
  } catch (error) {
    console.error('レビュー投稿エラー:', error);
    throw error instanceof Error 
      ? error 
      : new Error('レビューの投稿中に予期せぬエラーが発生しました');
  }
}

/**
 * レビューフォームからレビューを投稿
 * (ReviewForm.tsxコンポーネント用)
 */
export async function submitReview(reviewData: ReviewCreateData): Promise<string> {
  return createReview(reviewData);
}

/**
 * レビューを編集
 * 
 * @param reviewId レビューID
 * @param updateData 更新データ
 * @returns 成功時はtrue、失敗時はエラーをスロー
 */
export async function updateReview(
  reviewId: string, 
  updateData: Partial<{
    rating: number;
    comment: string;
    photos: string[];
  }>
): Promise<boolean> {
  try {
    // 現在のユーザーIDを取得
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user) {
      throw new Error('ユーザーがログインしていません');
    }
    
    const userId = user.uid;
    
    // 開発環境ではモックデータを使用
    if (isDevelopment()) {
      const review = MOCK_REVIEWS[reviewId];
      if (!review) {
        throw new Error('指定されたレビューが見つかりません');
      }
      
      // 自分のレビューかチェック
      if (review.userId !== userId) {
        throw new Error('他のユーザーのレビューは編集できません');
      }
      
      // フィールドの検証
      if (updateData.rating !== undefined && (updateData.rating < 1 || updateData.rating > 5)) {
        throw new Error('評価は1から5の間で入力してください');
      }
      
      if (updateData.comment !== undefined && updateData.comment.trim().length === 0) {
        throw new Error('コメントは必須です');
      }
      
      // レビューデータの更新
      if (updateData.rating !== undefined) review.rating = updateData.rating;
      if (updateData.comment !== undefined) review.comment = updateData.comment;
      if (updateData.photos !== undefined) review.photos = updateData.photos;
      review.updatedAt = new Date().toISOString();
      
      return true;
    }
    
    // 本番環境ではAPIを使用
    logApiRequest('PUT', ENDPOINTS.REVIEW.UPDATE(reviewId), updateData);
    
    const response = await getApiClient().put(ENDPOINTS.REVIEW.UPDATE(reviewId), {
      userId, // 認証情報としてユーザーIDを含める
      ...updateData
    });
    
    logApiResponse('PUT', ENDPOINTS.REVIEW.UPDATE(reviewId), response);
    
    if (response.success) {
      return true;
    }
    
    // エラーレスポンスの処理
    const errorMessage = response.error?.message || 'レビューの更新に失敗しました';
    throw new Error(errorMessage);
  } catch (error) {
    console.error('レビュー更新エラー:', error);
    throw error instanceof Error 
      ? error 
      : new Error('レビューの更新中に予期せぬエラーが発生しました');
  }
}

/**
 * レビューを削除
 * 
 * @param reviewId レビューID
 * @returns 成功時はtrue、失敗時はエラーをスロー
 */
export async function deleteReview(reviewId: string): Promise<boolean> {
  try {
    // 現在のユーザーIDを取得
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user) {
      throw new Error('ユーザーがログインしていません');
    }
    
    const userId = user.uid;
    
    // 開発環境ではモックデータを使用
    if (isDevelopment()) {
      const review = MOCK_REVIEWS[reviewId];
      if (!review) {
        throw new Error('指定されたレビューが見つかりません');
      }
      
      // 自分のレビューかチェック
      if (review.userId !== userId) {
        throw new Error('他のユーザーのレビューは削除できません');
      }
      
      // レビューの削除
      delete MOCK_REVIEWS[reviewId];
      
      return true;
    }
    
    // 本番環境ではAPIを使用
    logApiRequest('DELETE', ENDPOINTS.REVIEW.DELETE(reviewId), { userId });
    
    const response = await getApiClient().delete(ENDPOINTS.REVIEW.DELETE(reviewId));
    
    logApiResponse('DELETE', ENDPOINTS.REVIEW.DELETE(reviewId), response);
    
    if (response.success) {
      return true;
    }
    
    // エラーレスポンスの処理
    const errorMessage = response.error?.message || 'レビューの削除に失敗しました';
    throw new Error(errorMessage);
  } catch (error) {
    console.error('レビュー削除エラー:', error);
    throw error instanceof Error 
      ? error 
      : new Error('レビューの削除中に予期せぬエラーが発生しました');
  }
}

/**
 * レビューに「役に立った」を追加
 * 
 * @param reviewId レビューID
 * @returns 成功時はtrue、失敗時はエラーをスロー
 */
export async function markReviewAsHelpful(reviewId: string): Promise<boolean> {
  try {
    // 現在のユーザーIDを取得
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user) {
      throw new Error('ユーザーがログインしていません');
    }
    
    const userId = user.uid;
    
    // 開発環境ではモックデータを使用
    if (isDevelopment()) {
      const review = MOCK_REVIEWS[reviewId];
      if (!review) {
        throw new Error('指定されたレビューが見つかりません');
      }
      
      // 自分のレビューには「役に立った」をつけられないようにする
      if (review.userId === userId) {
        throw new Error('自分のレビューには「役に立った」をつけられません');
      }
      
      // 「役に立った」カウントを増やす
      review.helpfulCount += 1;
      review.updatedAt = new Date().toISOString();
      
      return true;
    }
    
    // 本番環境ではAPIを使用
    logApiRequest('POST', ENDPOINTS.REVIEW.HELPFUL(reviewId), { userId });
    
    const response = await getApiClient().post(ENDPOINTS.REVIEW.HELPFUL(reviewId), { userId });
    
    logApiResponse('POST', ENDPOINTS.REVIEW.HELPFUL(reviewId), response);
    
    if (response.success) {
      return true;
    }
    
    // エラーレスポンスの処理
    const errorMessage = response.error?.message || '「役に立った」の追加に失敗しました';
    throw new Error(errorMessage);
  } catch (error) {
    console.error('「役に立った」追加エラー:', error);
    throw error instanceof Error 
      ? error 
      : new Error('「役に立った」の追加中に予期せぬエラーが発生しました');
  }
}

export default {
  getAttenderReviews,
  getExperienceReviews,
  getUserReviews,
  getReviewDetails,
  getReviewSummary,
  createReview,
  submitReview,
  updateReview,
  deleteReview,
  markReviewAsHelpful
};