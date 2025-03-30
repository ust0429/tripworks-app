import { 
  AttenderProfile, 
  ExperienceSample, 
  AvailabilityTimeSlot, 
  SocialMediaLinks
} from '../types/attender/profile';

// 型定義の追加
interface Availability {
  dayOfWeek: number;
  isAvailable: boolean;
  timeSlots: {
    startTime: string;
    endTime: string;
  }[];
}

interface TimeSlot {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}
import { calculateProfileCompletionScore } from './attender/ProfileCompletionService';
import enhancedApiClient, { logApiRequest, logApiResponse } from '../utils/apiClientEnhanced';
import { ENDPOINTS } from '../config/api';
import { isDevelopment } from '../config/env';

// ローカルストレージのキー
const STORAGE_KEY = 'echo_attender_profile';

/**
 * アテンダープロフィールサービス
 * 注: 開発環境ではローカルストレージを使用
 * 本番環境ではAPIリクエストに置き換える
 */
export class AttenderProfileService {
  /**
   * プロフィールを取得
   * @param attenderId アテンダーID
   * @returns アテンダープロフィール
   */
  static async getProfile(attenderId: string): Promise<AttenderProfile> {
    try {
      console.log(`Fetching profile for attenderId: ${attenderId}`);
      
      // 開発環境の場合はローカルストレージを確認
      if (isDevelopment()) {
        const storedProfile = localStorage.getItem(STORAGE_KEY);
        if (storedProfile) {
          console.log('Using profile from local storage');
          return JSON.parse(storedProfile) as AttenderProfile;
        }
      }

      // API経由でプロフィール情報を取得
      const url = `${ENDPOINTS.ATTENDER.DETAIL(attenderId)}/profile`;
      logApiRequest('GET', url);
      
      const response = await enhancedApiClient.client.get<AttenderProfile>(url);
      logApiResponse('GET', url, response);
      
      if (response.success && response.data) {
        console.log('Profile fetched successfully from API');
        return response.data;
      }
      
      // APIから取得できなかった場合
      console.log('API fetch failed, using sample profile');
      const sampleProfile = this.createSampleProfile(attenderId);
      
      // 開発環境の場合はサンプルプロフィールをローカルストレージに保存
      if (isDevelopment()) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(sampleProfile));
      }
      
      return sampleProfile;
    } catch (error) {
      console.error('Failed to get profile:', error);
      throw error;
    }
  }
  
  /**
   * 現在のユーザーがアテンダーかどうかを確認し、アテンダーならプロフィールを取得
   * @returns アテンダープロフィールまたはnull
   */
  static async getCurrentAttenderProfile(): Promise<AttenderProfile | null> {
    try {
      console.log('Checking current user attender status');
      
      // 認証トークンを取得
      const token = await enhancedApiClient.getAuthToken();
      if (!token) {
        console.log('User not authenticated');
        return null;
      }
      
      // API経由で現在のユーザーのアテンダー情報を取得
      const url = `${ENDPOINTS.ATTENDER.LIST}/me`;
      logApiRequest('GET', url);
      
      const response = await enhancedApiClient.client.get<{isAttender: boolean; attenderId?: string}>(url);
      logApiResponse('GET', url, response);
      
      if (response.success && response.data) {
        // アテンダーでない場合はnullを返す
        if (!response.data.isAttender || !response.data.attenderId) {
          console.log('Current user is not an attender');
          return null;
        }
        
        // アテンダーの場合はプロフィールを取得
        console.log(`Current user is an attender with ID: ${response.data.attenderId}`);
        return this.getProfile(response.data.attenderId);
      }
      
      // 開発環境ではローカルストレージを確認
      if (isDevelopment()) {
        const storedProfile = localStorage.getItem(STORAGE_KEY);
        if (storedProfile) {
          console.log('Using profile from local storage for development');
          return JSON.parse(storedProfile) as AttenderProfile;
        }
      }
      
      console.log('Failed to determine attender status');
      return null;
    } catch (error) {
      console.error('Failed to get current attender profile:', error);
      return null;
    }
  }

  /**
   * プロフィールを更新
   * @param profile 更新するプロフィール
   * @returns 更新後のプロフィール
   */
  static async updateProfile(profile: AttenderProfile): Promise<AttenderProfile> {
    try {
      console.log('Updating profile:', profile.id);
      
      // データの検証
      this.validateProfile(profile);

      // 完成度スコアを計算して更新
      profile.completionScore = this.calculateCompletionScore(profile);
      profile.updatedAt = new Date().toISOString();

      // 開発環境の場合はローカルストレージにも保存
      if (isDevelopment()) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
      }

      // API経由でプロフィール情報を更新
      const url = `${ENDPOINTS.ATTENDER.DETAIL(profile.id)}/profile`;
      logApiRequest('PUT', url, profile);
      
      const response = await enhancedApiClient.client.put<AttenderProfile>(url, profile);
      logApiResponse('PUT', url, response);
      
      if (response.success && response.data) {
        console.log('Profile updated successfully via API');
        return response.data;
      }
      
      // API更新に失敗した場合は現在のプロフィールを返す
      console.log('API update failed, returning local profile');
      return profile;
    } catch (error) {
      console.error('Failed to update profile:', error);
      throw error;
    }
  }
  
  /**
   * プロフィールの特定フィールドのみを更新
   * @param attenderId アテンダーID
   * @param updateData 更新するフィールドとその値
   * @returns 更新後のプロフィール
   */
  static async updateProfileFields(attenderId: string, updateData: any): Promise<AttenderProfile> {
    try {
      console.log(`Updating profile fields for attenderId: ${attenderId}`);
      
      // 更新データを準備
      const updates = {
        ...updateData,
        updatedAt: new Date().toISOString()
      };
      
      // API経由でプロフィール情報を部分更新
      const url = `${ENDPOINTS.ATTENDER.DETAIL(attenderId)}/profile`;
      logApiRequest('PATCH', url, updates);
      
      const response = await enhancedApiClient.client.patch<AttenderProfile>(url, updates);
      logApiResponse('PATCH', url, response);
      
      if (response.success && response.data) {
        console.log('Profile fields updated successfully via API');
        
        // 開発環境の場合はローカルストレージも更新
        if (isDevelopment()) {
          const storedProfile = localStorage.getItem(STORAGE_KEY);
          if (storedProfile) {
            const currentProfile = JSON.parse(storedProfile) as AttenderProfile;
            const updatedProfile = { ...currentProfile, ...updates };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedProfile));
          }
        }
        
        return response.data;
      }
      
      // API更新に失敗した場合はローカルで処理
      console.log('API update failed, updating locally');
      const profile = await this.getProfile(attenderId);
      const updatedProfile = { ...profile, ...updates };
      
      // 開発環境の場合はローカルストレージを更新
      if (isDevelopment()) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedProfile));
      }
      
      return updatedProfile;
    } catch (error) {
      console.error('Failed to update profile fields:', error);
      throw error;
    }
  }

  /**
   * 体験サンプルを追加
   * @param attenderId アテンダーID
   * @param sample 追加する体験サンプルデータ
   * @returns 追加された体験サンプル
   */
  static async addExperienceSample(
    attenderId: string, 
    sample: Omit<ExperienceSample, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<ExperienceSample> {
    try {
      console.log(`Adding experience sample for attenderId: ${attenderId}`);
      
      // 新しいサンプルの基本情報を作成
      const now = new Date().toISOString();
      const sampleData = {
        ...sample,
        createdAt: now,
        updatedAt: now,
      };
      
      // API経由で体験サンプルを追加
      const url = `${ENDPOINTS.ATTENDER.DETAIL(attenderId)}/experiences`;
      logApiRequest('POST', url, sampleData);
      
      const response = await enhancedApiClient.client.post<ExperienceSample>(url, sampleData);
      logApiResponse('POST', url, response);
      
      if (response.success && response.data) {
        console.log('Experience sample added successfully via API');
        return response.data;
      }
      
      // API追加に失敗した場合はローカルで処理
      console.log('API add failed, adding sample locally');
      
      // 現在のプロフィールを取得
      const profile = await this.getProfile(attenderId);

      // 新しいサンプルを作成
      const newSample: ExperienceSample = {
        ...sampleData,
        id: `sample_${Date.now()}`,
      };

      // サンプルを追加
      if (!profile.experienceSamples) {
        profile.experienceSamples = [];
      }
      profile.experienceSamples.push(newSample);

      // プロフィールを更新
      await this.updateProfile(profile);

      return newSample;
    } catch (error) {
      console.error('Failed to add experience sample:', error);
      throw error;
    }
  }

  /**
   * 体験サンプルを更新
   * @param attenderId アテンダーID
   * @param sampleId サンプルID
   * @param updates 更新するデータ
   * @returns 更新後の体験サンプル
   */
  static async updateExperienceSample(
    attenderId: string,
    sampleId: string,
    updates: Partial<Omit<ExperienceSample, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<ExperienceSample> {
    try {
      console.log(`Updating experience sample ${sampleId} for attenderId: ${attenderId}`);
      
      // 更新データを準備
      const updateData = {
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      
      // API経由で体験サンプルを更新
      const url = `${ENDPOINTS.ATTENDER.DETAIL(attenderId)}/experiences/${sampleId}`;
      logApiRequest('PATCH', url, updateData);
      
      const response = await enhancedApiClient.client.patch<ExperienceSample>(url, updateData);
      logApiResponse('PATCH', url, response);
      
      if (response.success && response.data) {
        console.log('Experience sample updated successfully via API');
        return response.data;
      }
      
      // API更新に失敗した場合はローカルで処理
      console.log('API update failed, updating sample locally');
      
      // 現在のプロフィールを取得
      const profile = await this.getProfile(attenderId);

      // サンプルを検索
      if (!profile.experienceSamples) {
        throw new Error('Experience samples not initialized');
      }
      const sampleIndex = profile.experienceSamples.findIndex(s => s.id === sampleId);
      if (sampleIndex === -1) {
        throw new Error(`Experience sample with id ${sampleId} not found`);
      }

      // サンプルを更新
      const updatedSample: ExperienceSample = {
        ...(profile.experienceSamples?.[sampleIndex] || {}),
        ...updateData,
      };

      profile.experienceSamples[sampleIndex] = updatedSample;

      // プロフィールを更新
      await this.updateProfile(profile);

      return updatedSample;
    } catch (error) {
      console.error('Failed to update experience sample:', error);
      throw error;
    }
  }

  /**
   * 体験サンプルを削除
   * @param attenderId アテンダーID
   * @param sampleId サンプルID
   * @returns 成功したかどうか
   */
  static async removeExperienceSample(attenderId: string, sampleId: string): Promise<boolean> {
    try {
      console.log(`Removing experience sample ${sampleId} for attenderId: ${attenderId}`);
      
      // API経由で体験サンプルを削除
      const url = `${ENDPOINTS.ATTENDER.DETAIL(attenderId)}/experiences/${sampleId}`;
      logApiRequest('DELETE', url);
      
      const response = await enhancedApiClient.client.delete(url);
      logApiResponse('DELETE', url, response);
      
      if (response.success) {
        console.log('Experience sample removed successfully via API');
        return true;
      }
      
      // API削除に失敗した場合はローカルで処理
      console.log('API removal failed, removing sample locally');
      
      // 現在のプロフィールを取得
      const profile = await this.getProfile(attenderId);

      // サンプルを検索
      if (!profile.experienceSamples) {
        throw new Error('Experience samples not initialized');
      }
      const sampleIndex = profile.experienceSamples.findIndex(s => s.id === sampleId);
      if (sampleIndex === -1) {
        throw new Error(`Experience sample with id ${sampleId} not found`);
      }

      // サンプルを削除
      profile.experienceSamples.splice(sampleIndex, 1);

      // プロフィールを更新
      await this.updateProfile(profile);

      return true;
    } catch (error) {
      console.error('Failed to remove experience sample:', error);
      throw error;
    }
  }

  /**
   * 利用可能時間スケジュールを更新
   * @param attenderId アテンダーID
   * @param availability 新しい利用可能時間
   * @returns 成功したかどうか
   */
  static async updateAvailability(attenderId: string, availability: Availability[]): Promise<boolean> {
    try {
      console.log(`Updating availability for attenderId: ${attenderId}`);
      
      // API経由で利用可能時間を更新
      const url = `${ENDPOINTS.ATTENDER.DETAIL(attenderId)}/availability`;
      logApiRequest('PUT', url, { availability });
      
      const response = await enhancedApiClient.client.put(url, { availability });
      logApiResponse('PUT', url, response);
      
      if (response.success) {
        console.log('Availability updated successfully via API');
        
        // 開発環境の場合はローカルストレージも更新
        if (isDevelopment()) {
          const storedProfile = localStorage.getItem(STORAGE_KEY);
          if (storedProfile) {
            const profile = JSON.parse(storedProfile) as AttenderProfile;
            profile.availability = availability;
            localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
          }
        }
        
        return true;
      }
      
      // API更新に失敗した場合はローカルで処理
      console.log('API update failed, updating locally');
      const profile = await this.getProfile(attenderId);
      profile.availability = availability;
      
      await this.updateProfile(profile);
      return true;
    } catch (error) {
      console.error('Failed to update availability:', error);
      throw error;
    }
  }

  /**
   * SNSリンクを更新
   * @param attenderId アテンダーID
   * @param links 更新するSNSリンク
   * @returns 成功したかどうか
   */
  static async updateSocialLinks(attenderId: string, links: SocialMediaLinks): Promise<boolean> {
    try {
      console.log(`Updating social links for attenderId: ${attenderId}`);
      
      // API経由でSNSリンクを更新
      const url = `${ENDPOINTS.ATTENDER.DETAIL(attenderId)}/social-links`;
      logApiRequest('PATCH', url, links);
      
      const response = await enhancedApiClient.client.patch(url, links);
      logApiResponse('PATCH', url, response);
      
      if (response.success) {
        console.log('Social links updated successfully via API');
        
        // 開発環境の場合はローカルストレージも更新
        if (isDevelopment()) {
          const storedProfile = localStorage.getItem(STORAGE_KEY);
          if (storedProfile) {
            const profile = JSON.parse(storedProfile) as AttenderProfile;
            profile.socialMediaLinks = { ...(profile.socialMediaLinks || {}), ...links };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
          }
        }
        
        return true;
      }
      
      // API更新に失敗した場合はローカルで処理
      console.log('API update failed, updating locally');
      const profile = await this.getProfile(attenderId);
      profile.socialMediaLinks = { ...(profile.socialMediaLinks || {}), ...links };
      
      await this.updateProfileFields(attenderId, { socialMediaLinks: profile.socialMediaLinks });
      return true;
    } catch (error) {
      console.error('Failed to update social links:', error);
      throw error;
    }
  }
  
  /**
   * プロフィール画像を更新
   * @param attenderId アテンダーID
   * @param imageFile 画像ファイル
   * @returns 成功した場合は画像URL
   */
  static async updateProfileImage(attenderId: string, imageFile: File): Promise<string> {
    try {
      console.log(`Updating profile image for attenderId: ${attenderId}`);
      
      // API経由で画像をアップロード
      const url = ENDPOINTS.UPLOAD.PROFILE_PHOTO;
      logApiRequest('POST', url, { attenderId });
      
      // アップロード時のプログレス表示用コールバック
      const progressCallback = (progress: number) => {
        console.log(`Upload progress: ${progress}%`);
      };
      
      if (!enhancedApiClient.client.uploadFile) {
        return Promise.reject(new Error('uploadFile method not available'));
      }

      const response = await enhancedApiClient.client.uploadFile<{imageUrl: string}>(url, imageFile, 'image', { attenderId }, {}, progressCallback);
      logApiResponse('POST', url, response);
      
      if (response.success && response.data && response.data.imageUrl) {
        console.log('Profile image uploaded successfully:', response.data.imageUrl);
        
        // プロフィール情報も更新
        await this.updateProfileFields(attenderId, { 
          imageUrl: response.data.imageUrl,
          profilePhoto: response.data.imageUrl
        });
        
        return response.data.imageUrl;
      }
      
      throw new Error('Failed to upload profile image');
    } catch (error) {
      console.error('Failed to update profile image:', error);
      throw error;
    }
  }
  
  /**
   * 体験サンプル画像を追加
   * @param attenderId アテンダーID
   * @param sampleId サンプルID
   * @param imageFile 画像ファイル
   * @returns 成功した場合は画像URL
   */
  static async addExperienceSampleImage(attenderId: string, sampleId: string, imageFile: File): Promise<string> {
    try {
      console.log(`Uploading image for experience sample ${sampleId}`);
      
      // API経由で画像をアップロード
      const url = ENDPOINTS.UPLOAD.IMAGE;
      logApiRequest('POST', url, { attenderId, sampleId });
      
      // プログレス表示用コールバック
      const progressCallback = (progress: number) => {
        console.log(`Upload progress: ${progress}%`);
      };
      
      if (!enhancedApiClient.client.uploadFile) {
        return Promise.reject(new Error('uploadFile method not available'));
      }

      const response = await enhancedApiClient.client.uploadFile<{imageUrl: string}>(url, imageFile, 'image', {
        attenderId, 
        sampleId,
        type: 'experience_sample'
      }, {}, progressCallback);
      
      logApiResponse('POST', url, response);
      
      if (response.success && response.data && response.data.imageUrl) {
        console.log('Sample image uploaded successfully:', response.data.imageUrl);
        
        // サンプル情報を更新
        await this.updateExperienceSample(attenderId, sampleId, {
          imageUrl: response.data.imageUrl,
          imageUrls: [response.data.imageUrl]
        });
        
        return response.data.imageUrl;
      }
      
      throw new Error('Failed to upload sample image');
    } catch (error) {
      console.error('Failed to add sample image:', error);
      throw error;
    }
  }
  
  /**
   * プロフィール完成度スコアを計算
   * @param profile アテンダープロフィール
   * @returns 0-100のスコア
   */
  static calculateCompletionScore(profile: AttenderProfile): number {
    // ProfileCompletionServiceを使用して計算
    return calculateProfileCompletionScore(profile);
  }
  
  /**
   * サンプルプロフィールを作成（開発用）
   * @param attenderId アテンダーID
   * @returns サンプルプロフィール
   */
  private static createSampleProfile(attenderId: string): AttenderProfile {
    const now = new Date().toISOString();
    
    return {
      id: attenderId,
      name: 'サンプルアテンダー',
      email: 'sample@example.com',
      imageUrl: 'https://randomuser.me/api/portraits/men/32.jpg',
      location: '東京',
      bio: 'アートと文化が好きな地元ガイドです。東京の隠れた名所や、地元の人しか知らない場所をご案内します。',
      specialties: ['アート', '伝統文化', '食べ歩き'],
      background: '東京出身。アートギャラリーで3年間働いた経験があり、芸術分野に知見があります。',
      experienceSamples: [
        {
          id: 'sample_1',
          title: '下町アートギャラリー巡り',
          description: '東京の下町にある小さなギャラリーを巡るツアーです。地元アーティストの作品を見ながら、文化的背景も解説します。',
          category: 'アート',
          subcategory: 'ギャラリー',
          estimatedDuration: 180,
          price: 5000,
          images: ['https://source.unsplash.com/random/800x600/?gallery'],
          // 互換性のためのプロパティ
          imageUrl: 'https://source.unsplash.com/random/800x600/?gallery',
          duration: 180,
          categories: ['アート', '文化'],
          location: '東京都台東区',
          createdAt: now,
          updatedAt: now
        }
      ],
      availability: [
        { dayOfWeek: 0, isAvailable: false, timeSlots: [] },
        { dayOfWeek: 1, isAvailable: true, timeSlots: [{ startTime: '10:00', endTime: '16:00' }] },
        { dayOfWeek: 2, isAvailable: true, timeSlots: [{ startTime: '10:00', endTime: '16:00' }] },
        { dayOfWeek: 3, isAvailable: true, timeSlots: [{ startTime: '10:00', endTime: '16:00' }] },
        { dayOfWeek: 4, isAvailable: true, timeSlots: [{ startTime: '10:00', endTime: '16:00' }] },
        { dayOfWeek: 5, isAvailable: true, timeSlots: [{ startTime: '10:00', endTime: '18:00' }] },
        { dayOfWeek: 6, isAvailable: true, timeSlots: [{ startTime: '10:00', endTime: '18:00' }] },
      ],
      rating: 4.8,
      reviewCount: 12,
      verified: true,
      joinedAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(), // 90日前
      lastActive: now,
      completionScore: 85,
      createdAt: now,
      updatedAt: now,
      isLocalResident: true,
      isMigrant: false,
      expertise: [
        {
          category: 'アート',
          subcategories: ['展示ガイド', '現代アート'],
          yearsOfExperience: 3,
          description: '芸術分野に関する専門知識があります'
        }
      ],
      languages: [
        { language: 'ja', proficiency: 'native' },
        { language: 'en', proficiency: 'intermediate' }
      ]
    };
  }

  /**
   * プロフィールを検証
   */
  private static validateProfile(profile: AttenderProfile): void {
    console.log('Validating profile...');
    
    // 必須フィールドの検証
    if (!profile.id) throw new Error('Profile ID is required');
    if (!profile.name) throw new Error('Name is required');
    if (!profile.email && profile.emailAddress) {
      // フィールド名の互換性対応
      profile.email = profile.emailAddress;
    } else if (!profile.email) {
      throw new Error('Email is required');
    }
    
    // 配列フィールドの検証
    if (!Array.isArray(profile.experienceSamples)) {
      console.log('Initializing empty experienceSamples array');
      profile.experienceSamples = [];
    }
    
    // availabilityの検証とフィールド名の互換性対応
    if (profile.availableTimes && !profile.availability) {
      profile.availability = profile.availableTimes.map(slot => {
        return {
          dayOfWeek: slot.dayOfWeek,
          isAvailable: slot.isAvailable,
          timeSlots: slot.isAvailable ? [{ 
            startTime: slot.startTime,
            endTime: slot.endTime
          }] : []
        };
      });
    }
    
    if (!Array.isArray(profile.availability)) {
      console.log('Initializing empty availability array');
      profile.availability = [];
    }
    
    // 日時フィールドの検証
    try {
      // joinedAtフィールドがない場合はcreatedAtを使用
      if (!profile.joinedAt && profile.createdAt) {
        profile.joinedAt = profile.createdAt;
      } else if (!profile.joinedAt) {
        profile.joinedAt = new Date().toISOString();
      }
      
      new Date(profile.joinedAt);
    } catch (e) {
      console.error('Invalid joined date, resetting to current date');
      profile.joinedAt = new Date().toISOString();
    }
    
    // lastActiveの検証とフィールド名の互換性対応
    if (!profile.lastActive && profile.lastActiveDate) {
      profile.lastActive = profile.lastActiveDate;
    } else if (!profile.lastActive) {
      profile.lastActive = new Date().toISOString();
    }
    
      if (profile.lastActive) {
        try {
          new Date(profile.lastActive);
        } catch (e) {
          console.error('Invalid lastActive date, resetting to current date');
          profile.lastActive = new Date().toISOString();
        }
      } else {
        profile.lastActive = new Date().toISOString();
      }
    
    // 必要なフィールドの初期化
    if (!profile.bio && profile.biography) {
      profile.bio = profile.biography;
    }
    
    if (!profile.specialties) {
      profile.specialties = [];
    }
    
    if (!profile.languages) {
      profile.languages = [];
    }
    
    if (!profile.expertise) {
      profile.expertise = [];
    }
    
    if (!profile.completionScore) {
      profile.completionScore = this.calculateCompletionScore(profile);
    }
    
    console.log('Profile validation complete');
  }
}

export default AttenderProfileService;