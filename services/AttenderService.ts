/**
 * アテンダーサービス
 * 
 * アテンダーの登録、取得、更新などの機能を提供します。
 */

import { v4 as uuidv4 } from 'uuid';
import api, { logApiRequest, logApiResponse } from '../src/utils/apiClient';
import { ENDPOINTS } from '../src/config/api';
import { isDevelopment } from '../src/config/env';
import { getAuth } from 'firebase/auth';

// アテンダーの型定義
export interface AttenderProfile {
  id: string;
  name: string;
  bio: string;
  location: string;
  specialties: string[];
  profilePhoto?: string;
  experienceSamples: ExperienceSample[];
  languages: LanguageSkill[];
  isLocalResident: boolean;
  isMigrant: boolean;
  yearsMoved?: number;
  previousLocation?: string;
  expertise: ExpertiseArea[];
  availableTimes: AvailabilityTimeSlot[];
  averageRating: number;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
}

// 言語スキルの型定義
export interface LanguageSkill {
  language: string;
  proficiency: 'beginner' | 'intermediate' | 'advanced' | 'native';
}

// 専門分野の型定義
export interface ExpertiseArea {
  category: string;
  subcategories?: string[];
  yearsOfExperience?: number;
  description?: string;
}

// 体験サンプルの型定義
export interface ExperienceSample {
  id?: string;
  title: string;
  description: string;
  category: string;
  subcategory?: string;
  estimatedDuration: number;
  price?: number;
  images?: string[];
  location?: string;
}

// 利用可能時間枠の型定義
export interface AvailabilityTimeSlot {
  dayOfWeek: number; // 0 = 日曜, 1 = 月曜, ...
  startTime: string; // HH:MM 形式
  endTime: string;   // HH:MM 形式
  isAvailable: boolean;
}

// アテンダー登録用データの型定義
export interface AttenderRegistrationData {
  name: string;
  bio: string;
  location: string;
  specialties: string[];
  profilePhoto?: string;
  languages?: LanguageSkill[];
  isLocalResident?: boolean;
  isMigrant?: boolean;
  yearsMoved?: number;
  previousLocation?: string;
  expertise?: ExpertiseArea[];
  availableTimes?: AvailabilityTimeSlot[];
}

// アテンダー更新用データの型定義
export interface AttenderUpdateData {
  name?: string;
  bio?: string;
  location?: string;
  specialties?: string[];
  profilePhoto?: string;
  experienceSamples?: ExperienceSample[];
  languages?: LanguageSkill[];
  isLocalResident?: boolean;
  isMigrant?: boolean;
  yearsMoved?: number;
  previousLocation?: string;
  expertise?: ExpertiseArea[];
  availableTimes?: AvailabilityTimeSlot[];
}

// 体験登録用データの型定義
export interface ExperienceCreateData {
  title: string;
  description: string;
  category: string;
  subcategory?: string;
  estimatedDuration: number;
  price: number;
  images?: string[];
  location?: string;
  isActive?: boolean;
}

// モックデータ（開発環境でのみ使用）
const MOCK_ATTENDERS: Record<string, AttenderProfile> = {
  'att_123': {
    id: 'att_123',
    name: '山田陶芸',
    bio: '京都で30年以上陶芸を続けています。伝統的な技法を大切にしながらも、現代的なアレンジを加えた作品作りが特徴です。',
    location: '京都市中京区',
    specialties: ['陶芸', '伝統工芸', '文化体験'],
    profilePhoto: '/images/attenders/yamada.jpg',
    experienceSamples: [
      {
        id: 'exp_001',
        title: '京都の陶芸体験',
        description: '伝統的な京都の陶芸を体験できるツアーです。初心者でも楽しめる内容です。',
        category: '伝統工芸',
        subcategory: '陶芸',
        estimatedDuration: 180,
        price: 12000,
        images: ['/images/experiences/pottery1.jpg', '/images/experiences/pottery2.jpg']
      }
    ],
    languages: [
      { language: '日本語', proficiency: 'native' },
      { language: '英語', proficiency: 'intermediate' }
    ],
    isLocalResident: true,
    isMigrant: false,
    expertise: [
      {
        category: '陶芸',
        subcategories: ['轆轤', '絵付け', '釉薬'],
        yearsOfExperience: 30,
        description: '京都の伝統的な陶芸技法を専門としています。'
      }
    ],
    availableTimes: [
      { dayOfWeek: 1, startTime: '10:00', endTime: '17:00', isAvailable: true },
      { dayOfWeek: 2, startTime: '10:00', endTime: '17:00', isAvailable: true },
      { dayOfWeek: 3, startTime: '10:00', endTime: '17:00', isAvailable: true },
      { dayOfWeek: 4, startTime: '10:00', endTime: '17:00', isAvailable: true },
      { dayOfWeek: 5, startTime: '10:00', endTime: '17:00', isAvailable: true }
    ],
    averageRating: 4.8,
    reviewCount: 25,
    createdAt: '2025-01-15T09:00:00Z',
    updatedAt: '2025-03-10T15:30:00Z'
  },
  'att_456': {
    id: 'att_456',
    name: '鈴木フードツアー',
    bio: '大阪のストリートフードの達人です。地元の人しか知らない名店や隠れた逸品をご案内します。',
    location: '大阪市中央区',
    specialties: ['フードツアー', '大阪文化', 'ストリートフード'],
    profilePhoto: '/images/attenders/suzuki.jpg',
    experienceSamples: [
      {
        id: 'exp_002',
        title: '大阪ストリートフード巡り',
        description: '大阪の美味しいストリートフードを地元の人と巡るツアーです。',
        category: 'フード',
        subcategory: 'ストリートフード',
        estimatedDuration: 240,
        price: 8000,
        images: ['/images/experiences/food1.jpg', '/images/experiences/food2.jpg']
      }
    ],
    languages: [
      { language: '日本語', proficiency: 'native' },
      { language: '英語', proficiency: 'advanced' },
      { language: '中国語', proficiency: 'beginner' }
    ],
    isLocalResident: false,
    isMigrant: true,
    yearsMoved: 5,
    previousLocation: '東京',
    expertise: [
      {
        category: '食文化',
        subcategories: ['大阪料理', 'B級グルメ', '屋台文化'],
        yearsOfExperience: 10,
        description: '大阪の食文化に精通しています。'
      }
    ],
    availableTimes: [
      { dayOfWeek: 5, startTime: '17:00', endTime: '22:00', isAvailable: true },
      { dayOfWeek: 6, startTime: '15:00', endTime: '22:00', isAvailable: true },
      { dayOfWeek: 0, startTime: '15:00', endTime: '22:00', isAvailable: true }
    ],
    averageRating: 4.6,
    reviewCount: 18,
    createdAt: '2025-02-01T14:30:00Z',
    updatedAt: '2025-03-15T16:45:00Z'
  }
};

// モック体験データ
const MOCK_EXPERIENCES: Record<string, any> = {
  'exp_001': {
    id: 'exp_001',
    attenderId: 'att_123',
    title: '京都の陶芸体験',
    description: '伝統的な京都の陶芸を体験できるツアーです。初心者でも楽しめる内容です。',
    category: '伝統工芸',
    subcategory: '陶芸',
    estimatedDuration: 180,
    price: 12000,
    images: ['/images/experiences/pottery1.jpg', '/images/experiences/pottery2.jpg'],
    location: '京都市中京区',
    isActive: true,
    averageRating: 4.7,
    reviewCount: 15,
    createdAt: '2025-01-20T10:00:00Z',
    updatedAt: '2025-03-10T15:30:00Z'
  },
  'exp_002': {
    id: 'exp_002',
    attenderId: 'att_456',
    title: '大阪ストリートフード巡り',
    description: '大阪の美味しいストリートフードを地元の人と巡るツアーです。',
    category: 'フード',
    subcategory: 'ストリートフード',
    estimatedDuration: 240,
    price: 8000,
    images: ['/images/experiences/food1.jpg', '/images/experiences/food2.jpg'],
    location: '大阪市中央区',
    isActive: true,
    averageRating: 4.6,
    reviewCount: 12,
    createdAt: '2025-02-05T09:15:00Z',
    updatedAt: '2025-03-15T16:45:00Z'
  }
};

/**
 * アテンダー一覧を取得
 * 
 * @param filters オプションのフィルター条件
 * @returns アテンダー一覧
 */
export async function getAttenders(filters?: {
  location?: string;
  specialties?: string;
  isLocalResident?: boolean;
  isMigrant?: boolean;
  limit?: number;
}): Promise<AttenderProfile[]> {
  try {
    // 開発環境ではモックデータを使用
    if (isDevelopment()) {
      // モックデータからフィルタリング
      let attenders = Object.values(MOCK_ATTENDERS);
      
      // フィルタリング条件の適用
      if (filters) {
        if (filters.location) {
          attenders = attenders.filter(attender => 
            attender.location.includes(filters.location as string));
        }
        
        if (filters.specialties) {
          attenders = attenders.filter(attender => 
            attender.specialties.includes(filters.specialties as string));
        }
        
        if (filters.isLocalResident !== undefined) {
          attenders = attenders.filter(attender => 
            attender.isLocalResident === filters.isLocalResident);
        }
        
        if (filters.isMigrant !== undefined) {
          attenders = attenders.filter(attender => 
            attender.isMigrant === filters.isMigrant);
        }
      }
      
      // 評価の高い順にソート
      attenders.sort((a, b) => b.averageRating - a.averageRating);
      
      // 件数制限の適用
      if (filters?.limit) {
        attenders = attenders.slice(0, filters.limit);
      }
      
      return attenders;
    }
    
    // 本番環境ではAPIを使用
    const queryParams = filters || {};
    
    logApiRequest('GET', ENDPOINTS.ATTENDER.LIST, queryParams);
    
    const response = await api.get<AttenderProfile[]>(
      ENDPOINTS.ATTENDER.LIST,
      queryParams
    );
    
    logApiResponse('GET', ENDPOINTS.ATTENDER.LIST, response);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    return [];
  } catch (error) {
    console.error('アテンダー一覧取得エラー:', error);
    return [];
  }
}

/**
 * 特定のアテンダーの詳細を取得
 * 
 * @param attenderId アテンダーID
 * @returns アテンダー詳細、存在しない場合はnull
 */
export async function getAttenderDetails(attenderId: string): Promise<AttenderProfile | null> {
  try {
    // 開発環境ではモックデータを使用
    if (isDevelopment() && MOCK_ATTENDERS[attenderId]) {
      return MOCK_ATTENDERS[attenderId];
    }
    
    // 本番環境ではAPIを使用
    logApiRequest('GET', ENDPOINTS.ATTENDER.DETAIL(attenderId), {});
    
    const response = await api.get<AttenderProfile>(
      ENDPOINTS.ATTENDER.DETAIL(attenderId)
    );
    
    logApiResponse('GET', ENDPOINTS.ATTENDER.DETAIL(attenderId), response);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    return null;
  } catch (error) {
    console.error('アテンダー詳細取得エラー:', error);
    return null;
  }
}

/**
 * 自分がアテンダーかどうかを確認
 * 
 * @returns アテンダーの場合はプロファイル情報、そうでない場合はnull
 */
export async function checkIfAttender(): Promise<AttenderProfile | null> {
  try {
    // 現在のユーザーIDを取得
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user) {
      console.log('ユーザーがログインしていません');
      return null;
    }
    
    // 開発環境ではモックデータを使用
    if (isDevelopment()) {
      // モックデータからユーザーIDに対応するアテンダーを検索
      // 本来はユーザーIDとアテンダーIDの紐付けが必要だが、モックではシンプルに最初のアテンダーを返す
      const mockAttender = Object.values(MOCK_ATTENDERS)[0];
      
      return mockAttender;
    }
    
    // 本番環境ではAPIを使用
    // 認証済みヘッダーを持っているので、自分がアテンダーかどうかを確認するAPIを呼び出す
    logApiRequest('GET', ENDPOINTS.ATTENDER.CHECK_IF_ATTENDER, {});
    
    const response = await api.get<AttenderProfile>(
      ENDPOINTS.ATTENDER.CHECK_IF_ATTENDER
    );
    
    logApiResponse('GET', ENDPOINTS.ATTENDER.CHECK_IF_ATTENDER, response);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    return null;
  } catch (error) {
    console.error('アテンダー確認エラー:', error);
    return null;
  }
}

/**
 * 新規アテンダーを登録
 * 
 * @param registrationData 登録データ
 * @returns 成功時はアテンダーID、失敗時はエラーをスロー
 */
export async function registerAttender(registrationData: AttenderRegistrationData): Promise<string> {
  try {
    // 現在のユーザーIDを取得
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user) {
      throw new Error('ユーザーがログインしていません');
    }
    
    // 開発環境ではモックデータを使用
    if (isDevelopment()) {
      // 模擬的に処理遅延を再現
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const attenderId = `att_${uuidv4().substring(0, 8)}`;
      
      // 新しいアテンダーデータを作成
      MOCK_ATTENDERS[attenderId] = {
        id: attenderId,
        ...registrationData,
        experienceSamples: [],
        languages: registrationData.languages || [],
        isLocalResident: registrationData.isLocalResident || false,
        isMigrant: registrationData.isMigrant || false,
        expertise: registrationData.expertise || [],
        availableTimes: registrationData.availableTimes || [],
        averageRating: 0,
        reviewCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      return attenderId;
    }
    
    // 本番環境ではAPIを使用
    logApiRequest('POST', ENDPOINTS.ATTENDER.LIST, { dataSize: JSON.stringify(registrationData).length });
    
    const response = await api.post<{ id: string }>(
      ENDPOINTS.ATTENDER.LIST,
      registrationData
    );
    
    logApiResponse('POST', ENDPOINTS.ATTENDER.LIST, response);
    
    if (response.success && response.data) {
      return response.data.id;
    }
    
    // エラーレスポンスの処理
    const errorMessage = response.error?.message || 'アテンダー登録に失敗しました';
    throw new Error(errorMessage);
  } catch (error) {
    console.error('アテンダー登録エラー:', error);
    throw error instanceof Error 
      ? error 
      : new Error('アテンダー登録中に予期せぬエラーが発生しました');
  }
}

/**
 * アテンダー情報を更新
 * 
 * @param attenderId アテンダーID
 * @param updateData 更新データ
 * @returns 成功時はtrue、失敗時はエラーをスロー
 */
export async function updateAttender(attenderId: string, updateData: AttenderUpdateData): Promise<boolean> {
  try {
    // 現在のユーザーIDを取得
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user) {
      throw new Error('ユーザーがログインしていません');
    }
    
    // 開発環境ではモックデータを使用
    if (isDevelopment()) {
      const attender = MOCK_ATTENDERS[attenderId];
      if (!attender) {
        throw new Error('指定されたアテンダーが見つかりません');
      }
      
      // アテンダーデータの更新
      MOCK_ATTENDERS[attenderId] = {
        ...attender,
        ...updateData,
        updatedAt: new Date().toISOString()
      };
      
      return true;
    }
    
    // 本番環境ではAPIを使用
    logApiRequest('PUT', ENDPOINTS.ATTENDER.DETAIL(attenderId), updateData);
    
    const response = await api.put(
      ENDPOINTS.ATTENDER.DETAIL(attenderId),
      updateData
    );
    
    logApiResponse('PUT', ENDPOINTS.ATTENDER.DETAIL(attenderId), response);
    
    if (response.success) {
      return true;
    }
    
    // エラーレスポンスの処理
    const errorMessage = response.error?.message || 'アテンダー情報の更新に失敗しました';
    throw new Error(errorMessage);
  } catch (error) {
    console.error('アテンダー更新エラー:', error);
    throw error instanceof Error 
      ? error 
      : new Error('アテンダー情報の更新中に予期せぬエラーが発生しました');
  }
}

/**
 * アテンダーの体験一覧を取得
 * 
 * @param attenderId アテンダーID
 * @param isActive アクティブな体験のみを取得するフラグ（オプション）
 * @returns 体験一覧
 */
export async function getAttenderExperiences(
  attenderId: string,
  isActive?: boolean
): Promise<any[]> {
  try {
    // 開発環境ではモックデータを使用
    if (isDevelopment()) {
      // モックデータからこのアテンダーの体験だけをフィルタリング
      let experiences = Object.values(MOCK_EXPERIENCES).filter(
        exp => exp.attenderId === attenderId
      );
      
      // アクティブフラグでフィルタリング
      if (isActive !== undefined) {
        experiences = experiences.filter(exp => exp.isActive === isActive);
      }
      
      // 最新順に並べ替え
      experiences.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      return experiences;
    }
    
    // 本番環境ではAPIを使用
    const queryParams = isActive !== undefined ? { isActive } : {};
    
    logApiRequest('GET', ENDPOINTS.ATTENDER.EXPERIENCES(attenderId), queryParams);
    
    const response = await api.get(
      ENDPOINTS.ATTENDER.EXPERIENCES(attenderId),
      queryParams
    );
    
    logApiResponse('GET', ENDPOINTS.ATTENDER.EXPERIENCES(attenderId), response);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    return [];
  } catch (error) {
    console.error('アテンダー体験一覧取得エラー:', error);
    return [];
  }
}

/**
 * アテンダーの新規体験を作成
 * 
 * @param attenderId アテンダーID
 * @param experienceData 体験データ
 * @returns 成功時は体験ID、失敗時はエラーをスロー
 */
export async function createExperience(
  attenderId: string,
  experienceData: ExperienceCreateData
): Promise<string> {
  try {
    // 現在のユーザーIDを取得
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user) {
      throw new Error('ユーザーがログインしていません');
    }
    
    // 開発環境ではモックデータを使用
    if (isDevelopment()) {
      // 模擬的に処理遅延を再現
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const experienceId = `exp_${uuidv4().substring(0, 8)}`;
      
      // 新しい体験データを作成
      MOCK_EXPERIENCES[experienceId] = {
        id: experienceId,
        attenderId,
        ...experienceData,
        isActive: experienceData.isActive !== undefined ? experienceData.isActive : true,
        averageRating: 0,
        reviewCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // アテンダーのexperienceSamplesに追加（まだ3つ未満の場合）
      const attender = MOCK_ATTENDERS[attenderId];
      if (attender && attender.experienceSamples.length < 3) {
        const experienceSample: ExperienceSample = {
          id: experienceId,
          title: experienceData.title,
          description: experienceData.description,
          category: experienceData.category,
          subcategory: experienceData.subcategory,
          estimatedDuration: experienceData.estimatedDuration,
          price: experienceData.price,
          images: experienceData.images,
          location: experienceData.location
        };
        
        attender.experienceSamples.push(experienceSample);
        attender.updatedAt = new Date().toISOString();
      }
      
      return experienceId;
    }
    
    // 本番環境ではAPIを使用
    logApiRequest('POST', ENDPOINTS.ATTENDER.CREATE_EXPERIENCE(attenderId), { dataSize: JSON.stringify(experienceData).length });
    
    const response = await api.post<{ id: string }>(
      ENDPOINTS.ATTENDER.CREATE_EXPERIENCE(attenderId),
      experienceData
    );
    
    logApiResponse('POST', ENDPOINTS.ATTENDER.CREATE_EXPERIENCE(attenderId), response);
    
    if (response.success && response.data) {
      return response.data.id;
    }
    
    // エラーレスポンスの処理
    const errorMessage = response.error?.message || '体験の作成に失敗しました';
    throw new Error(errorMessage);
  } catch (error) {
    console.error('体験作成エラー:', error);
    throw error instanceof Error 
      ? error 
      : new Error('体験の作成中に予期せぬエラーが発生しました');
  }
}

export default {
  getAttenders,
  getAttenderDetails,
  checkIfAttender,
  registerAttender,
  updateAttender,
  getAttenderExperiences,
  createExperience
};
