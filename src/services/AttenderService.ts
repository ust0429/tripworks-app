/**
 * アテンダーサービス
 * 
 * アテンダー情報の取得、登録、更新のためのサービス。
 * 実際のAPIエンドポイントと連携します。
 */

import { v4 as uuidv4 } from 'uuid';
import { 
  AttenderApplicationData, 
  ExpertiseArea,
  AvailabilityTimeSlot,
  PortfolioItem,
  AttenderStatus,
  VerificationStatus,
  BackgroundCheckStatus,
  Attender,
  LanguageSkill
} from '../types/attender/index';
import api, { logApiRequest, logApiResponse } from '../utils/apiClient';
import { ENDPOINTS } from '../config/api';
import { isDevelopment } from '../config/env';

// アテンダー申請検証結果の型定義
interface ApplicationValidationResult {
  valid: boolean;
  errors: string[];
}

// モックデータは簡易版のみを保持（開発環境でのみ使用）
const MOCK_ATTENDERS: Record<string, Attender> = {
  'att_123': {
    id: 'att_123',
    userId: 'user_789',
    name: '佐藤 健太',
    profileImage: '/images/attenders/sato.jpg',
    email: 'sato.kenta@example.com',
    phoneNumber: '090-1111-2222',
    location: {
      country: 'JP',
      region: 'Kyoto',
      city: 'Kyoto'
    },
    biography: '京都の伝統工芸を案内するアテンダーです',
    specialties: ['伝統工芸', '陶芸', 'アート'],
    languages: [
      { language: 'ja', proficiency: 'native' },
      { language: 'en', proficiency: 'intermediate' }
    ],
    experiences: ['exp_001'],
    averageRating: 4.9,
    reviewCount: 28,
    verificationStatus: 'verified',
    registrationDate: '2023-11-10T08:30:00Z',
    lastActiveDate: '2025-03-18T15:40:00Z',
    status: 'active',
    responseRate: 98,
    responseTime: 25,
    cancellationRate: 0,
    completedExperienceCount: 45,
    earnings: {
      total: 450000,
      lastMonth: 55000
    },
    availableTimes: [
      {
        dayOfWeek: 1,
        startTime: '13:00',
        endTime: '18:00',
        isAvailable: true
      }
    ],
    backgroundCheck: 'passed',
    identityVerified: true,
    isLocalResident: true,
    isMigrant: false,
    expertise: [
      {
        category: '伝統工芸',
        subcategories: ['陶芸'],
        yearsOfExperience: 15,
        description: '京都の伝統工芸に精通しています',
      }
    ]
  }
};

// 申請中のアテンダーデータ (開発環境でのみ使用)
const PENDING_APPLICATIONS: Record<string, AttenderApplicationData> = {};

/**
 * アテンダー情報を取得
 * 
 * @param attenderId アテンダーID
 * @returns アテンダー情報（存在しない場合はnull）
 */
export async function getAttender(attenderId: string): Promise<Attender | null> {
  try {
    // 開発環境ではモックデータを使用
    if (isDevelopment() && MOCK_ATTENDERS[attenderId]) {
      return MOCK_ATTENDERS[attenderId];
    }
    
    // 本番環境ではAPIを使用
    const response = await api.get<Attender>(ENDPOINTS.ATTENDER.DETAIL(attenderId));
    
    if (response.success && response.data) {
      return response.data;
    }
    
    return null;
  } catch (error) {
    console.error('アテンダー取得エラー:', error);
    return null;
  }
}

/**
 * 全てのアテンダー情報を取得
 */
export async function getAllAttenders(filters?: {
  status?: AttenderStatus;
  verificationStatus?: VerificationStatus;
  specialties?: string[];
  location?: { country?: string; region?: string; city?: string };
}): Promise<Attender[]> {
  try {
    // 開発環境ではモックデータを使用
    if (isDevelopment()) {
      let attenders = Object.values(MOCK_ATTENDERS);
      
      // フィルタリング（省略版）
      if (filters) {
        if (filters.status) {
          attenders = attenders.filter(a => a.status === filters.status);
        }
      }
      
      return attenders;
    }
    
    // 本番環境ではAPIを使用
    const response = await api.post<Attender[]>(ENDPOINTS.ATTENDER.FILTER, filters);
    
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
 * アテンダー申請データのバリデーション
 * 
 * @param data 検証するアテンダー申請データ
 * @returns 検証結果オブジェクト
 */
function validateApplicationData(data: AttenderApplicationData): ApplicationValidationResult {
  const errors: string[] = [];
  
  // 必須フィールドのチェック
  if (!data.name) errors.push('名前は必須です');
  if (!data.email) errors.push('メールアドレスは必須です');
  if (!data.phoneNumber) errors.push('電話番号は必須です');
  if (!data.location) errors.push('所在地は必須です');
  if (!data.biography) errors.push('自己紹介文は必須です');
  if (!data.specialties || data.specialties.length === 0) errors.push('専門分野は少なくとも1つ必要です');
  if (!data.languages || data.languages.length === 0) errors.push('言語は少なくとも1つ必要です');
  if (!data.expertise || data.expertise.length === 0) errors.push('専門知識は少なくとも1つ必要です');
  if (!data.availableTimes || data.availableTimes.length === 0) errors.push('利用可能時間は必須です');
  if (!data.identificationDocument) errors.push('身分証明書情報は必須です');
  
  // 同意事項のチェック
  if (!data.agreements) errors.push('すべての同意事項を承認する必要があります');
  else {
    if (!data.agreements.termsOfService) errors.push('利用規約への同意が必要です');
    if (!data.agreements.privacyPolicy) errors.push('プライバシーポリシーへの同意が必要です');
    if (!data.agreements.codeOfConduct) errors.push('行動規範への同意が必要です');
    if (!data.agreements.backgroundCheck) errors.push('バックグラウンドチェックへの同意が必要です');
  }
  
  // 専門知識のバリデーション（簡略化）
  if (data.expertise) {
    data.expertise.forEach((exp, index) => {
      if (!exp.category) errors.push(`専門分野${index + 1}: カテゴリは必須です`);
      if (!exp.subcategories || exp.subcategories.length === 0) errors.push(`専門分野${index + 1}: サブカテゴリーは少なくとも1つ必要です`);
    });
  }
  
  // 提供体験サンプルのバリデーション（簡略化）
  if (!data.experienceSamples || data.experienceSamples.length === 0) {
    errors.push('体験サンプルは少なくとも1つ必要です');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * アテンダー申請を送信
 * 
 * @param applicationData アテンダー申請データ
 * @returns 申請ID
 */
export async function submitAttenderApplication(applicationData: AttenderApplicationData): Promise<string> {
  try {
    // アプリケーションデータのログ（開発用）
    console.info('アテンダー申請データを検証中...');
    
    // バリデーション
    const validationResult = validateApplicationData(applicationData);
    if (!validationResult.valid) {
      const errorMessage = `入力内容に問題があります: ${validationResult.errors.join('、')}`;
      console.error('バリデーションエラー:', errorMessage);
      throw new Error(errorMessage);
    }
    
    console.info('アテンダー申請データの検証に成功しました');
    
    // 開発環境ではモックデータを使用
    if (isDevelopment()) {
      console.info('開発環境でアテンダー申請を処理中...');
      
      // 申請処理を模擬するために遅延
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // 申請IDを生成
      const applicationId = `app_${uuidv4()}`;
      
      // モックデータに保存
      PENDING_APPLICATIONS[applicationId] = applicationData;
      
      console.info(`アテンダー申請が正常に処理されました。申請ID: ${applicationId}`);
      
      // 申請IDを返す
      return applicationId;
    }
    
    // 本番環境ではAPIを使用
    logApiRequest('POST', ENDPOINTS.ATTENDER.APPLICATION, { dataSize: JSON.stringify(applicationData).length });
    console.info('本番環境でアテンダー申請を送信中...');
    
    const response = await api.post<{ applicationId: string }>(
      ENDPOINTS.ATTENDER.APPLICATION,
      applicationData
    );
    
    logApiResponse('POST', ENDPOINTS.ATTENDER.APPLICATION, response);
    
    if (response.success && response.data) {
      console.info(`アテンダー申請が正常に送信されました。申請ID: ${response.data.applicationId}`);
      return response.data.applicationId;
    }
    
    // エラーレスポンスの処理
    const errorMessage = response.error?.message || 'アテンダー申請の送信に失敗しました';
    throw new Error(errorMessage);
  } catch (error) {
    console.error('アテンダー申請送信エラー:', error);
    throw error instanceof Error 
      ? error 
      : new Error('アテンダー申請の送信中に予期せぬエラーが発生しました');
  }
}

/**
 * アテンダープロフィール情報を更新
 */
export async function updateAttenderProfile(attenderId: string, profileData: Partial<{
  name: string;
  profileImage: string;
  biography: string;
  specialties: string[];
  languages: LanguageSkill[];
  expertise: ExpertiseArea[];
  socialMediaLinks: Record<string, string>;
}>): Promise<void> {
  try {
    // 開発環境ではモックデータを使用
    if (isDevelopment()) {
      const attender = MOCK_ATTENDERS[attenderId];
      if (!attender) {
        throw new Error('指定されたアテンダーが見つかりません');
      }
      
      // プロフィール情報の更新
      if (profileData.name) attender.name = profileData.name;
      if (profileData.profileImage) attender.profileImage = profileData.profileImage;
      if (profileData.biography) attender.biography = profileData.biography;
      if (profileData.specialties) attender.specialties = profileData.specialties;
      if (profileData.languages) attender.languages = profileData.languages;
      if (profileData.expertise) attender.expertise = profileData.expertise;
      
      // SNSリンクの更新（部分的に更新可能）
      if (profileData.socialMediaLinks) {
        attender.socialMediaLinks = {
          ...attender.socialMediaLinks || {},
          ...profileData.socialMediaLinks
        };
      }
      
      attender.lastActiveDate = new Date().toISOString();
      
      return;
    }
    
    // 本番環境ではAPIを使用
    const response = await api.patch(
      ENDPOINTS.ATTENDER.UPDATE_PROFILE(attenderId),
      profileData
    );
    
    if (!response.success) {
      throw new Error('プロフィール情報の更新に失敗しました');
    }
  } catch (error) {
    console.error('プロフィール更新エラー:', error);
    throw error instanceof Error 
      ? error 
      : new Error('プロフィール情報の更新中に予期せぬエラーが発生しました');
  }
}

/**
 * アテンダーの利用可能時間を更新
 */
export async function updateAvailableTimes(attenderId: string, availableTimes: AvailabilityTimeSlot[]): Promise<void> {
  try {
    // 開発環境ではモックデータを使用
    if (isDevelopment()) {
      const attender = MOCK_ATTENDERS[attenderId];
      if (!attender) {
        throw new Error('指定されたアテンダーが見つかりません');
      }
      
      // 利用可能時間の更新
      attender.availableTimes = availableTimes;
      attender.lastActiveDate = new Date().toISOString();
      
      return;
    }
    
    // 本番環境ではAPIを使用
    const response = await api.patch(
      ENDPOINTS.ATTENDER.UPDATE_AVAILABILITY(attenderId),
      { availableTimes }
    );
    
    if (!response.success) {
      throw new Error('利用可能時間の更新に失敗しました');
    }
  } catch (error) {
    console.error('利用可能時間更新エラー:', error);
    throw error instanceof Error 
      ? error 
      : new Error('利用可能時間の更新中に予期せぬエラーが発生しました');
  }
}

/**
 * ポートフォリオアイテムを追加
 */
export async function addPortfolioItem(attenderId: string, portfolioItem: Omit<PortfolioItem, 'id'>): Promise<string> {
  try {
    // 開発環境ではモックデータを使用
    if (isDevelopment()) {
      const attender = MOCK_ATTENDERS[attenderId];
      if (!attender) {
        throw new Error('指定されたアテンダーが見つかりません');
      }
      
      const newItemId = `port_${uuidv4()}`;
      const newItem: PortfolioItem = {
        id: newItemId,
        ...portfolioItem
      };
      
      if (!attender.portfolio) {
        attender.portfolio = [];
      }
      
      attender.portfolio.push(newItem);
      
      return newItemId;
    }
    
    // 本番環境ではAPIを使用
    const response = await api.post<{ portfolioItemId: string }>(
      ENDPOINTS.ATTENDER.ADD_PORTFOLIO(attenderId),
      portfolioItem
    );
    
    if (response.success && response.data) {
      return response.data.portfolioItemId;
    }
    
    throw new Error('ポートフォリオアイテムの追加に失敗しました');
  } catch (error) {
    console.error('ポートフォリオ追加エラー:', error);
    throw error instanceof Error 
      ? error 
      : new Error('ポートフォリオアイテムの追加中に予期せぬエラーが発生しました');
  }
}

/**
 * 体験を追加
 * 
 * @param attenderId アテンダーID
 * @param experienceId 追加する体験ID
 * @throws Error アテンダーが見つからないエラーまたはAPI通信エラー
 */
export async function addExperienceToAttender(attenderId: string, experienceId: string): Promise<void> {
  try {
    logApiRequest('POST', `アテンダー体験追加: ${attenderId}`, { experienceId });
    
    // 開発環境ではモックデータを使用
    if (isDevelopment()) {
      console.info(`開発環境: モックデータでアテンダー[${attenderId}]に体験[${experienceId}]を追加`);
      const attender = MOCK_ATTENDERS[attenderId];
      if (!attender) {
        throw new Error('指定されたアテンダーが見つかりません');
      }
      
      if (!attender.experiences.includes(experienceId)) {
        attender.experiences.push(experienceId);
      }
      attender.lastActiveDate = new Date().toISOString();
      
      // 開発環境では処理を遅延させてAPI通信を模倣
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return;
    }
    
    // 本番環境ではAPIを使用
    const response = await api.post(
      ENDPOINTS.ATTENDER.DETAIL(attenderId) + '/experiences',
      { experienceId }
    );
    logApiResponse('POST', ENDPOINTS.ATTENDER.DETAIL(attenderId) + '/experiences', response);
    
    if (!response.success) {
      if (response.error) {
        throw new Error(
          `体験の追加に失敗しました: ${response.error.message || 'Unknown error'}`
        );
      }
      throw new Error('体験の追加に失敗しました');
    }
  } catch (error) {
    console.error('体験追加エラー:', error);
    throw error instanceof Error 
      ? error 
      : new Error('体験の追加中に予期せぬエラーが発生しました');
  }
}
