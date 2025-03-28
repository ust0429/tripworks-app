/**
 * ユーザーサービス
 */

// APIクライアント
import apiClient from '../../utils/apiClientEnhanced';
import { ENDPOINTS } from '../../config/api';
import { logApiRequest, logApiResponse } from '../../utils/apiClient';

/**
 * ユーザープロフィール
 */
export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  createdAt: string;
  updatedAt: string;
  preferences?: {
    language?: string;
    currency?: string;
    notifications?: {
      email?: boolean;
      push?: boolean;
      sms?: boolean;
    };
  };
}

/**
 * ユーザープロフィールを取得
 * 
 * @returns ユーザープロフィール
 */
export async function getUserProfile() {
  try {
    logApiRequest('GET', ENDPOINTS.USER.PROFILE, {});
    
    const response = await apiClient.client.get<UserProfile>(
      ENDPOINTS.USER.PROFILE
    );
    
    logApiResponse('GET', ENDPOINTS.USER.PROFILE, response);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    return null;
  } catch (error) {
    console.error('ユーザープロフィール取得エラー:', error);
    return null;
  }
}

/**
 * ユーザープロフィールを更新
 * 
 * @param updateData 更新データ
 * @returns 成功時はtrue、失敗時はfalse
 */
export async function updateUserProfile(updateData: Partial<UserProfile>) {
  try {
    logApiRequest('PUT', ENDPOINTS.USER.UPDATE, updateData);
    
    const response = await apiClient.client.put(
      ENDPOINTS.USER.UPDATE,
      updateData
    );
    
    logApiResponse('PUT', ENDPOINTS.USER.UPDATE, response);
    
    return response.success;
  } catch (error) {
    console.error('ユーザープロフィール更新エラー:', error);
    return false;
  }
}

export default {
  getUserProfile,
  updateUserProfile
};
