/**
 * レビューサービス
 */

// APIクライアント
import apiClient from '../../utils/apiClientEnhanced';
import { ENDPOINTS } from '../../config/api';
import { logApiRequest, logApiResponse } from '../../utils/apiClient';
import { Review, ReviewCreateData } from '../../services/reviewService';

/**
 * アテンダーのレビュー一覧を取得
 * 
 * @param attenderId アテンダーID
 * @param limit 取得件数
 * @returns レビュー一覧
 */
export async function getAttenderReviews(attenderId: string, limit: number = 10) {
  try {
    logApiRequest('GET', ENDPOINTS.REVIEW.ATTENDER_REVIEWS(attenderId), { limit });
    
    const response = await apiClient.client.get<Review[]>(
      ENDPOINTS.REVIEW.ATTENDER_REVIEWS(attenderId),
      { 
        params: { limit } 
      }
    );
    
    logApiResponse('GET', ENDPOINTS.REVIEW.ATTENDER_REVIEWS(attenderId), response);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    return [];
  } catch (error) {
    console.error('アテンダーレビュー取得エラー:', error);
    return [];
  }
}

/**
 * 体験のレビュー一覧を取得
 * 
 * @param experienceId 体験ID
 * @param limit 取得件数
 * @returns レビュー一覧
 */
export async function getExperienceReviews(experienceId: string, limit: number = 10) {
  try {
    logApiRequest('GET', ENDPOINTS.REVIEW.EXPERIENCE_REVIEWS(experienceId), { limit });
    
    const response = await apiClient.client.get<Review[]>(
      ENDPOINTS.REVIEW.EXPERIENCE_REVIEWS(experienceId),
      { 
        params: { limit } 
      }
    );
    
    logApiResponse('GET', ENDPOINTS.REVIEW.EXPERIENCE_REVIEWS(experienceId), response);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    return [];
  } catch (error) {
    console.error('体験レビュー取得エラー:', error);
    return [];
  }
}

/**
 * レビューを投稿
 * 
 * @param reviewData レビューデータ
 * @returns 成功時はレビューID、失敗時はnull
 */
export async function createReview(reviewData: ReviewCreateData) {
  try {
    logApiRequest('POST', ENDPOINTS.REVIEW.CREATE, reviewData);
    
    const response = await apiClient.client.post<{ id: string }>(
      ENDPOINTS.REVIEW.CREATE,
      reviewData
    );
    
    logApiResponse('POST', ENDPOINTS.REVIEW.CREATE, response);
    
    if (response.success && response.data) {
      return response.data.id;
    }
    
    return null;
  } catch (error) {
    console.error('レビュー投稿エラー:', error);
    return null;
  }
}

/**
 * レビューを更新
 * 
 * @param reviewId レビューID
 * @param updateData 更新データ
 * @returns 成功時はtrue、失敗時はfalse
 */
export async function updateReview(
  reviewId: string, 
  updateData: Partial<{
    rating: number;
    comment: string;
    photos: string[];
  }>
) {
  try {
    logApiRequest('PUT', ENDPOINTS.REVIEW.UPDATE(reviewId), updateData);
    
    const response = await apiClient.client.put(
      ENDPOINTS.REVIEW.UPDATE(reviewId),
      updateData
    );
    
    logApiResponse('PUT', ENDPOINTS.REVIEW.UPDATE(reviewId), response);
    
    return response.success;
  } catch (error) {
    console.error('レビュー更新エラー:', error);
    return false;
  }
}

/**
 * レビューを削除
 * 
 * @param reviewId レビューID
 * @returns 成功時はtrue、失敗時はfalse
 */
export async function deleteReview(reviewId: string) {
  try {
    logApiRequest('DELETE', ENDPOINTS.REVIEW.DELETE(reviewId), {});
    
    const response = await apiClient.client.delete(
      ENDPOINTS.REVIEW.DELETE(reviewId)
    );
    
    logApiResponse('DELETE', ENDPOINTS.REVIEW.DELETE(reviewId), response);
    
    return response.success;
  } catch (error) {
    console.error('レビュー削除エラー:', error);
    return false;
  }
}

/**
 * レビューに「役に立った」を追加
 * 
 * @param reviewId レビューID
 * @returns 成功時はtrue、失敗時はfalse
 */
export async function markReviewAsHelpful(reviewId: string) {
  try {
    logApiRequest('POST', ENDPOINTS.REVIEW.HELPFUL(reviewId), {});
    
    const response = await apiClient.client.post(
      ENDPOINTS.REVIEW.HELPFUL(reviewId),
      {}
    );
    
    logApiResponse('POST', ENDPOINTS.REVIEW.HELPFUL(reviewId), response);
    
    return response.success;
  } catch (error) {
    console.error('レビュー「役に立った」追加エラー:', error);
    return false;
  }
}

export default {
  getAttenderReviews,
  getExperienceReviews,
  createReview,
  updateReview,
  deleteReview,
  markReviewAsHelpful
};
