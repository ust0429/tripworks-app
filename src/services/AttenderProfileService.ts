import { AttenderProfile, ExperienceSample } from '../types/attender/profile';
import { calculateProfileCompletionScore } from './attender/ProfileCompletionService';

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
   */
  static async getProfile(attenderId: string): Promise<AttenderProfile> {
    try {
      // 開発環境: ローカルストレージから取得
      const storedProfile = localStorage.getItem(STORAGE_KEY);
      if (storedProfile) {
        return JSON.parse(storedProfile) as AttenderProfile;
      }

      // 本番環境: APIリクエスト
      // const response = await fetch(`/api/attender/${attenderId}/profile`);
      // if (!response.ok) throw new Error('Failed to fetch profile');
      // return await response.json();

      // データがない場合はサンプルデータを返す
      return this.createSampleProfile(attenderId);
    } catch (error) {
      console.error('Failed to get profile:', error);
      throw error;
    }
  }

  /**
   * プロフィールを更新
   */
  static async updateProfile(profile: AttenderProfile): Promise<AttenderProfile> {
    try {
      // データの検証
      this.validateProfile(profile);

      // 完成度スコアを計算して更新
      profile.completionScore = this.calculateCompletionScore(profile);

      // 開発環境: ローカルストレージに保存
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));

      // 本番環境: APIリクエスト
      // const response = await fetch(`/api/attender/${profile.id}/profile`, {
      //   method: 'PUT',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify(profile),
      // });
      // if (!response.ok) throw new Error('Failed to update profile');
      // return await response.json();

      return profile;
    } catch (error) {
      console.error('Failed to update profile:', error);
      throw error;
    }
  }

  /**
   * 体験サンプルを追加
   */
  static async addExperienceSample(
    attenderId: string, 
    sample: Omit<ExperienceSample, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<ExperienceSample> {
    try {
      // 現在のプロフィールを取得
      const profile = await this.getProfile(attenderId);

      // 新しいサンプルを作成
      const newSample: ExperienceSample = {
        ...sample,
        id: `sample_${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
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
   */
  static async updateExperienceSample(
    attenderId: string,
    sampleId: string,
    updates: Partial<Omit<ExperienceSample, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<ExperienceSample> {
    try {
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
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      if (!profile.experienceSamples) {
        throw new Error('Experience samples not initialized');
      }
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
   */
  static async removeExperienceSample(attenderId: string, sampleId: string): Promise<boolean> {
    try {
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
      if (!profile.experienceSamples) {
        throw new Error('Experience samples not initialized');
      }
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
   * プロフィール完成度スコアを計算
   */
  static calculateCompletionScore(profile: AttenderProfile): number {
    // ProfileCompletionServiceを使用して計算
    return calculateProfileCompletionScore(profile);
  }

  /**
   * プロフィールを検証
   */
  private static validateProfile(profile: AttenderProfile): void {
    // 必須フィールドの検証
    if (!profile.id) throw new Error('Profile ID is required');
    if (!profile.name) throw new Error('Name is required');
    if (!profile.email) throw new Error('Email is required');
    
    // 配列フィールドの検証
    if (!Array.isArray(profile.experienceSamples)) {
      throw new Error('Experience samples must be an array');
    }
    
    if (!Array.isArray(profile.availability)) {
      throw new Error('Availability must be an array');
    }
    
    // 日時フィールドの検証
    try {
      new Date(profile.joinedAt || new Date().toISOString());
    } catch (e) {
      throw new Error('Invalid joined date');
    }
    
    if (profile.lastActive) {
      try {
        new Date(profile.lastActive);
      } catch (e) {
        throw new Error('Invalid last active date');
      }
    }
  }

  /**
   * サンプルプロフィールを作成（開発用）
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
      updatedAt: now
    };
  }
}

export default AttenderProfileService;
