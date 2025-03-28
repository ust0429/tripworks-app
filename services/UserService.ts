/**
 * ユーザーサービス
 * 
 * ユーザープロフィールの取得、更新などの機能を提供します。
 */

import api, { logApiRequest, logApiResponse } from '../src/utils/apiClient';
import { ENDPOINTS } from '../src/config/api';
import { isDevelopment } from '../src/config/env';
import { getAuth, updateProfile } from 'firebase/auth';

// ユーザープロフィールの型定義
export interface UserProfile {
  id: string;
  email?: string;
  displayName?: string;
  photoURL?: string;
  phoneNumber?: string;
  address?: string;
  preferences?: {
    categories?: string[];
    notificationEnabled?: boolean;
    emailEnabled?: boolean;
    [key: string]: any;
  };
  attenderId?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

// プロフィール更新用データの型定義
export interface ProfileUpdateData {
  displayName?: string;
  photoURL?: string;
  phoneNumber?: string;
  address?: string;
  preferences?: {
    categories?: string[];
    notificationEnabled?: boolean;
    emailEnabled?: boolean;
    [key: string]: any;
  };
  [key: string]: any;
}

// モックデータ（開発環境でのみ使用）
const MOCK_USER_PROFILE: UserProfile = {
  id: 'user_123',
  email: 'user@example.com',
  displayName: 'テストユーザー',
  photoURL: '/images/users/default.jpg',
  phoneNumber: '090-1234-5678',
  address: '東京都渋谷区',
  preferences: {
    categories: ['陶芸', 'フードツアー', '伝統工芸'],
    notificationEnabled: true,
    emailEnabled: true
  },
  attenderId: 'att_123',
  createdAt: '2025-01-01T09:00:00Z',
  updatedAt: '2025-03-15T15:30:00Z'
};

/**
 * 自分のプロフィール情報を取得
 * 
 * @returns プロフィール情報、取得失敗時はnull
 */
export async function getUserProfile(): Promise<UserProfile | null> {
  try {
    // 現在のユーザーの確認
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user) {
      console.log('ユーザーがログインしていません');
      return null;
    }
    
    // 開発環境ではモックデータを使用
    if (isDevelopment()) {
      return {
        ...MOCK_USER_PROFILE,
        id: user.uid,
        email: user.email || MOCK_USER_PROFILE.email,
        displayName: user.displayName || MOCK_USER_PROFILE.displayName,
        photoURL: user.photoURL || MOCK_USER_PROFILE.photoURL
      };
    }
    
    // 本番環境ではAPIを使用
    logApiRequest('GET', ENDPOINTS.USER.PROFILE, {});
    
    const response = await api.get<UserProfile>(
      ENDPOINTS.USER.PROFILE
    );
    
    logApiResponse('GET', ENDPOINTS.USER.PROFILE, response);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    return null;
  } catch (error) {
    console.error('プロフィール取得エラー:', error);
    return null;
  }
}

/**
 * プロフィール情報を更新
 * 
 * @param updateData 更新データ
 * @returns 成功時はtrue、失敗時はエラーをスロー
 */
export async function updateUserProfile(updateData: ProfileUpdateData): Promise<boolean> {
  try {
    // 現在のユーザーの確認
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user) {
      throw new Error('ユーザーがログインしていません');
    }
    
    // 開発環境ではFirebase Authenticationとモックデータのみを更新
    if (isDevelopment()) {
      // Firebase Authenticationのプロフィールを更新
      if (updateData.displayName !== undefined || updateData.photoURL !== undefined) {
        await updateProfile(user, {
          displayName: updateData.displayName,
          photoURL: updateData.photoURL
        });
      }
      
      // モックデータの更新（実際のアプリでは不要）
      Object.assign(MOCK_USER_PROFILE, updateData);
      MOCK_USER_PROFILE.updatedAt = new Date().toISOString();
      
      return true;
    }
    
    // 本番環境ではAPIを使用
    logApiRequest('PUT', ENDPOINTS.USER.UPDATE_PROFILE, updateData);
    
    const response = await api.put(
      ENDPOINTS.USER.UPDATE_PROFILE,
      updateData
    );
    
    logApiResponse('PUT', ENDPOINTS.USER.UPDATE_PROFILE, response);
    
    if (response.success) {
      // Firebase Authenticationのプロフィールも更新
      if (updateData.displayName !== undefined || updateData.photoURL !== undefined) {
        await updateProfile(user, {
          displayName: updateData.displayName,
          photoURL: updateData.photoURL
        });
      }
      
      return true;
    }
    
    // エラーレスポンスの処理
    const errorMessage = response.error?.message || 'プロフィールの更新に失敗しました';
    throw new Error(errorMessage);
  } catch (error) {
    console.error('プロフィール更新エラー:', error);
    throw error instanceof Error 
      ? error 
      : new Error('プロフィールの更新中に予期せぬエラーが発生しました');
  }
}

export default {
  getUserProfile,
  updateUserProfile
};
