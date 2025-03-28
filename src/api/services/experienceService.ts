/**
 * 体験サービス
 */

// APIクライアント
import apiClient from '../../utils/apiClientEnhanced';
import { ENDPOINTS } from '../../config/api';
import { logApiRequest, logApiResponse } from '../../utils/apiClient';

// モデル
import { Experience } from '../../types/experience';

/**
 * 体験の詳細を取得
 * 
 * @param experienceId 体験ID
 * @returns 体験詳細
 */
export async function getExperienceDetails(experienceId: string) {
  try {
    logApiRequest('GET', ENDPOINTS.EXPERIENCE.DETAIL(experienceId), {});
    
    const response = await apiClient.client.get<Experience>(
      ENDPOINTS.EXPERIENCE.DETAIL(experienceId)
    );
    
    logApiResponse('GET', ENDPOINTS.EXPERIENCE.DETAIL(experienceId), response);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    return null;
  } catch (error) {
    console.error('体験詳細取得エラー:', error);
    return null;
  }
}

/**
 * 体験検索
 * 
 * @param params 検索パラメータ
 * @returns 体験のリスト
 */
export async function searchExperiences(params: {
  category?: string;
  location?: string;
  attenderId?: string;
  minRating?: number;
  maxPrice?: number;
  limit?: number;
  offset?: number;
}) {
  try {
    logApiRequest('GET', ENDPOINTS.EXPERIENCE.SEARCH, params);
    
    const response = await apiClient.client.get<Experience[]>(
      ENDPOINTS.EXPERIENCE.SEARCH,
      { params }
    );
    
    logApiResponse('GET', ENDPOINTS.EXPERIENCE.SEARCH, response);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    return [];
  } catch (error) {
    console.error('体験検索エラー:', error);
    return [];
  }
}

/**
 * 体験の作成（アテンダー専用）
 * 
 * @param attenderId アテンダーID
 * @param experienceData 体験データ
 * @returns 成功時は体験ID、失敗時はnull
 */
export async function createExperience(attenderId: string, experienceData: Partial<Experience>) {
  try {
    const endpoint = ENDPOINTS.ATTENDER.EXPERIENCES(attenderId);
    
    logApiRequest('POST', endpoint, experienceData);
    
    const response = await apiClient.client.post<{ id: string }>(
      endpoint,
      experienceData
    );
    
    logApiResponse('POST', endpoint, response);
    
    if (response.success && response.data) {
      return response.data.id;
    }
    
    return null;
  } catch (error) {
    console.error('体験作成エラー:', error);
    return null;
  }
}

/**
 * 体験の更新（アテンダー専用）
 * 
 * @param experienceId 体験ID
 * @param updateData 更新データ
 * @returns 成功時はtrue、失敗時はfalse
 */
export async function updateExperience(experienceId: string, updateData: Partial<Experience>) {
  try {
    logApiRequest('PUT', ENDPOINTS.EXPERIENCE.UPDATE(experienceId), updateData);
    
    const response = await apiClient.client.put(
      ENDPOINTS.EXPERIENCE.UPDATE(experienceId),
      updateData
    );
    
    logApiResponse('PUT', ENDPOINTS.EXPERIENCE.UPDATE(experienceId), response);
    
    return response.success;
  } catch (error) {
    console.error('体験更新エラー:', error);
    return false;
  }
}

/**
 * 体験の削除（アテンダー専用）
 * 
 * @param experienceId 体験ID
 * @returns 成功時はtrue、失敗時はfalse
 */
export async function deleteExperience(experienceId: string) {
  try {
    logApiRequest('DELETE', ENDPOINTS.EXPERIENCE.DELETE(experienceId), {});
    
    const response = await apiClient.client.delete(
      ENDPOINTS.EXPERIENCE.DELETE(experienceId)
    );
    
    logApiResponse('DELETE', ENDPOINTS.EXPERIENCE.DELETE(experienceId), response);
    
    return response.success;
  } catch (error) {
    console.error('体験削除エラー:', error);
    return false;
  }
}

export default {
  getExperienceDetails,
  searchExperiences,
  createExperience,
  updateExperience,
  deleteExperience
};
