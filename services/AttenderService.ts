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
  LanguageSkill,
  FormStatusType
} from '../types/attender/index';
import enhancedApi, { logApiRequest, logApiResponse, ApiResponse } from '../utils/apiClientEnhanced';
import { ENDPOINTS } from '../config/api';
import { isDevelopment } from '../config/env';

// アテンダー申請検証結果の型定義
export interface ApplicationValidationResult {
  valid: boolean;
  errors: string[];
  warnings?: string[];
  fieldErrors?: Record<string, string>;
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
        description: '京都の伝統工芸に精通しています'
      }
    ]
  }
};

// 申請中のアテンダーデータ (開発環境でのみ使用)
const PENDING_APPLICATIONS: Record<string, AttenderApplicationData> = {};

// 下書き保存用のデータストア
const DRAFT_APPLICATIONS: Record<string, AttenderApplicationData> = {};

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
    const response = await enhancedApi.get<Attender>(ENDPOINTS.ATTENDER.DETAIL(attenderId));
    
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
    const response = await enhancedApi.post<Attender[]>(ENDPOINTS.ATTENDER.FILTER, filters);
    
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
 * @param formStatus フォームの状態（必須情報のみか全情報か）
 * @returns 検証結果オブジェクト
 */
function validateApplicationData(data: AttenderApplicationData, formStatus: FormStatusType = 'completed'): ApplicationValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const fieldErrors: Record<string, string> = {};
  
  // 必須フィールドのチェック（全フォーム状態で共通）
  if (!data.name) {
    errors.push('名前は必須です');
    fieldErrors['name'] = '名前を入力してください';
  }
  
  if (!data.email) {
    errors.push('メールアドレスは必須です');
    fieldErrors['email'] = 'メールアドレスを入力してください';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push('無効なメールアドレス形式です');
    fieldErrors['email'] = '有効なメールアドレスを入力してください';
  }
  
  if (!data.phoneNumber) {
    errors.push('電話番号は必須です');
    fieldErrors['phoneNumber'] = '電話番号を入力してください';
  } else if (!/^[0-9\-+() ]+$/.test(data.phoneNumber)) {
    warnings.push('電話番号の形式が標準的ではない可能性があります');
  }
  
  if (!data.location) {
    errors.push('所在地は必須です');
    fieldErrors['location'] = '所在地情報を入力してください';
  } else {
    if (!data.location.country) {
      errors.push('国名は必須です');
      fieldErrors['location.country'] = '国名を選択してください';
    }
    if (!data.location.region) {
      errors.push('地域は必須です');
      fieldErrors['location.region'] = '地域を選択してください';
    }
    if (!data.location.city) {
      errors.push('都市は必須です');
      fieldErrors['location.city'] = '都市を入力してください';
    }
  }
  
  if (!data.biography) {
    errors.push('自己紹介文は必須です');
    fieldErrors['biography'] = '自己紹介文を入力してください';
  } else if (data.biography.length < 50) {
    errors.push('自己紹介文は50文字以上必要です');
    fieldErrors['biography'] = '自己紹介文は少なくとも50文字以上で記入してください';
  }
  
  if (!data.specialties || data.specialties.length === 0) {
    errors.push('専門分野は少なくとも1つ必要です');
    fieldErrors['specialties'] = '少なくとも1つの専門分野を選択してください';
  }
  
  if (!data.languages || data.languages.length === 0) {
    errors.push('言語は少なくとも1つ必要です');
    fieldErrors['languages'] = '少なくとも1つの言語を選択してください';
  }
  
  // 身分証明書情報のチェック（任意）
  if (data.identificationDocument) {
    // 身分証明書が提出されている場合のみバリデーション
    if (data.identificationDocument.expirationDate) {
      const expirationDate = new Date(data.identificationDocument.expirationDate);
      const today = new Date();
      if (isNaN(expirationDate.getTime())) {
        errors.push('身分証明書の有効期限が無効な形式です');
        fieldErrors['identificationDocument.expirationDate'] = '有効な日付形式で入力してください';
      } else if (expirationDate < today) {
        errors.push('身分証明書の有効期限が過ぎています');
        fieldErrors['identificationDocument.expirationDate'] = '有効期限が切れています。有効期限内の身分証明書が必要です';
      }
    }
    
    // 必要なフィールドがある場合のみチェック
    if (data.identificationDocument.type && !data.identificationDocument.number) {
      warnings.push('身分証明書番号が入力されていません');
      fieldErrors['identificationDocument.number'] = '身分証明書番号を入力してください';
    }
    
    if (data.identificationDocument.type && !data.identificationDocument.frontImageUrl) {
      warnings.push('身分証明書の表面画像がアップロードされていません');
      fieldErrors['identificationDocument.frontImageUrl'] = '身分証明書の表面画像をアップロードしてください';
    }
  }
  
  // 提供体験サンプルのバリデーション（必須情報モードではチェックしない）
  if (formStatus !== 'required') {
    if (!data.expertise || data.expertise.length === 0) {
      errors.push('専門知識は少なくとも1つ必要です');
      fieldErrors['expertise'] = '少なくとも1つの専門知識を入力してください';
    } else {
      data.expertise.forEach((exp, index) => {
        if (!exp.category) {
          errors.push(`専門分野${index + 1}: カテゴリは必須です`);
          fieldErrors[`expertise[${index}].category`] = 'カテゴリを選択してください';
        }
        if (!exp.subcategories || exp.subcategories.length === 0) {
          errors.push(`専門分野${index + 1}: サブカテゴリーは少なくとも1つ必要です`);
          fieldErrors[`expertise[${index}].subcategories`] = '少なくとも1つのサブカテゴリーを選択してください';
        }
        if (!exp.description) {
          errors.push(`専門分野${index + 1}: 説明は必須です`);
          fieldErrors[`expertise[${index}].description`] = '説明を入力してください';
        }
      });
    }
    
    if (!data.availableTimes || data.availableTimes.length === 0) {
      errors.push('利用可能時間は必須です');
      fieldErrors['availableTimes'] = '少なくとも1つの利用可能時間を設定してください';
    } else {
      const hasAvailable = data.availableTimes.some(time => time.isAvailable);
      if (!hasAvailable) {
        errors.push('利用可能時間が設定されていません');
        fieldErrors['availableTimes'] = '少なくとも1つの利用可能な時間帯を設定してください';
      }
    }
    
    if (!data.experienceSamples || data.experienceSamples.length === 0) {
      errors.push('体験サンプルは少なくとも1つ必要です');
      fieldErrors['experienceSamples'] = '少なくとも1つの体験サンプルを追加してください';
    } else {
      data.experienceSamples.forEach((sample, index) => {
        if (!sample.title) {
          errors.push(`体験サンプル${index + 1}: タイトルは必須です`);
          fieldErrors[`experienceSamples[${index}].title`] = 'タイトルを入力してください';
        }
        
        if (!sample.description) {
          errors.push(`体験サンプル${index + 1}: 説明は必須です`);
          fieldErrors[`experienceSamples[${index}].description`] = '説明を入力してください';
        } else if (sample.description.length < 50) {
          errors.push(`体験サンプル${index + 1}: 説明は50文字以上必要です`);
          fieldErrors[`experienceSamples[${index}].description`] = '説明は少なくとも50文字以上で入力してください';
        }
        
        if (!sample.category) {
          errors.push(`体験サンプル${index + 1}: カテゴリは必須です`);
          fieldErrors[`experienceSamples[${index}].category`] = 'カテゴリを選択してください';
        }
        
        if (sample.estimatedDuration <= 0) {
          errors.push(`体験サンプル${index + 1}: 所要時間は0より大きい値が必要です`);
          fieldErrors[`experienceSamples[${index}].estimatedDuration`] = '有効な所要時間を入力してください';
        }
      });
    }
  }
  
  // 同意事項のチェック
  if (!data.agreements) {
    errors.push('すべての同意事項を承認する必要があります');
    fieldErrors['agreements'] = '同意事項への同意が必要です';
  } else {
    if (!data.agreements.termsOfService) {
      errors.push('利用規約への同意が必要です');
      fieldErrors['agreements.termsOfService'] = '利用規約に同意してください';
    }
    if (!data.agreements.privacyPolicy) {
      errors.push('プライバシーポリシーへの同意が必要です');
      fieldErrors['agreements.privacyPolicy'] = 'プライバシーポリシーに同意してください';
    }
    if (!data.agreements.codeOfConduct) {
      errors.push('行動規範への同意が必要です');
      fieldErrors['agreements.codeOfConduct'] = '行動規範に同意してください';
    }
    if (!data.agreements.backgroundCheck) {
      errors.push('バックグラウンドチェックへの同意が必要です');
      fieldErrors['agreements.backgroundCheck'] = 'バックグラウンドチェックに同意してください';
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings,
    fieldErrors
  };
}

/**
 * アテンダー申請の下書きを保存
 * 
 * @param userId ユーザーID
 * @param applicationData アテンダー申請データ
 * @returns 成功時は下書きID、失敗時はエラーをスロー
 */
export async function saveDraftApplication(userId: string, applicationData: Partial<AttenderApplicationData>): Promise<string> {
  try {
    console.info('アテンダー申請の下書きを保存中...');
    
    // 開発環境ではモックデータを使用
    if (isDevelopment()) {
      // 保存処理を模擬するために遅延
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 下書きIDを生成
      const draftId = `draft_${userId}_${new Date().getTime()}`;
      
      // モックデータに保存
      DRAFT_APPLICATIONS[draftId] = {
        ...applicationData as any,
        lastSaved: new Date().toISOString()
      };
      
      console.info(`下書きが正常に保存されました。下書きID: ${draftId}`);
      
      return draftId;
    }
    
    // 本番環境ではAPIを使用
    logApiRequest('POST', ENDPOINTS.ATTENDER.SAVE_DRAFT, { dataSize: JSON.stringify(applicationData).length });
    
    const response = await enhancedApi.post<{ draftId: string }>(
      ENDPOINTS.ATTENDER.SAVE_DRAFT,
      { userId, applicationData }
    );
    
    logApiResponse('POST', ENDPOINTS.ATTENDER.SAVE_DRAFT, response);
    
    if (response.success && response.data) {
      console.info(`下書きが正常に保存されました。下書きID: ${response.data.draftId}`);
      return response.data.draftId;
    }
    
    // エラーレスポンスの処理
    const errorMessage = response.error?.message || '下書きの保存に失敗しました';
    throw new Error(errorMessage);
  } catch (error) {
    console.error('下書き保存エラー:', error);
    throw error instanceof Error 
      ? error 
      : new Error('下書きの保存中に予期せぬエラーが発生しました');
  }
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
    
    // フォーム状態の取得
    const formStatus = (applicationData as any).formStatus || 'completed';
    
    // 不要なプロパティを取り除く
    const { formStatus: _, ...cleanedData } = applicationData as any;
    
    // 検証ロジックをフォーム状態によって変更
    const validationResult = validateApplicationData(applicationData, formStatus);
    if (!validationResult.valid) {
      const errorMessage = `入力内容に問題があります: ${validationResult.errors.join('、')}`;
      console.error('バリデーションエラー:', errorMessage);
      
      // フィールドごとのエラーをログに記録（開発用）
      if (validationResult.fieldErrors) {
        console.debug('フィールドエラー詳細:', validationResult.fieldErrors);
      }
      
      throw new Error(errorMessage);
    }
    
    // 警告があれば記録
    if (validationResult.warnings && validationResult.warnings.length > 0) {
      console.warn('検証警告:', validationResult.warnings.join(', '));
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
    
    const response = await enhancedApi.post<{ applicationId: string }>(
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
    const response = await enhancedApi.patch(
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
    const response = await enhancedApi.patch(
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
    const response = await enhancedApi.post<{ portfolioItemId: string }>(
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
 * アテンダー体験を追加
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
    const response = await enhancedApi.post(
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