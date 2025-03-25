/**
 * 統合テスト用ヘルパーユーティリティ
 * 
 * アテンダー申請フォームの統合テストをサポートする関数群
 */

import { AttenderApplicationData, FormStatusType } from '../types/attender';

/**
 * テスト用のモックフォームデータを生成
 * 
 * @param formStatus フォームステータス（必須/任意/完了）
 * @param completionLevel 完成度レベル（0-100）
 * @returns モックデータ
 */
export function generateMockFormData(
  formStatus: FormStatusType = 'required',
  completionLevel: number = 100 // 完成度%
): Partial<AttenderApplicationData> {
  // 基本情報（必須）
  const basicInfo: Partial<AttenderApplicationData> = {
    name: '山田 太郎',
    email: 'taro.yamada@example.com',
    phoneNumber: '090-1234-5678',
    location: {
      country: 'JP',
      region: '東京都',
      city: '渋谷区',
      address: completionLevel >= 75 ? '渋谷1-1-1' : '',
      postalCode: completionLevel >= 75 ? '150-0001' : ''
    },
    biography: completionLevel >= 50 
      ? '私は東京在住の旅行ガイドです。特に伝統文化や歴史に詳しく、外国人観光客に日本の魅力を伝えることに情熱を持っています。英語と日本語を流暢に話し、街歩きツアーや文化体験を提供できます。'
      : '東京在住のガイドです',
    isLocalResident: true,
    isMigrant: false,
    specialties: ['観光案内', '食文化', '歴史'],
    languages: [
      { language: 'ja', proficiency: 'native' },
      { language: 'en', proficiency: 'intermediate' }
    ],
    formStatus
  };
  
  // 追加情報（50%以上の完成度の場合）
  if (completionLevel >= 50) {
    basicInfo.identificationDocument = {
      type: 'driver_license',
      number: 'ABC123456789',
      expirationDate: '2030-12-31',
      frontImageUrl: '/uploads/mock/id_front.jpg',
      backImageUrl: completionLevel >= 75 ? '/uploads/mock/id_back.jpg' : ''
    };
    
    basicInfo.agreements = {
      termsOfService: true,
      privacyPolicy: true,
      codeOfConduct: true,
      backgroundCheck: true
    };
  }
  
  // 任意情報（必須モード以外で、75%以上の完成度の場合）
  if (formStatus !== 'required' && completionLevel >= 75) {
    // 専門分野
    basicInfo.expertise = [
      {
        category: '観光案内',
        subcategories: ['寺社仏閣', '都市観光'],
        yearsOfExperience: 5,
        description: '東京の観光案内を5年間行ってきました。特に寺社仏閣や都市観光に詳しいです。'
      }
    ];
    
    // 体験サンプル
    basicInfo.experienceSamples = [
      {
        title: '東京下町散策ツアー',
        description: '東京の下町エリアを巡るツアーです。昔ながらの街並みや商店街、地元の人々との交流を楽しめます。歴史ある建物や美味しい食べ物も紹介します。',
        category: '都市観光',
        estimatedDuration: 3,
        maxParticipants: 6,
        pricePerPerson: 5000,
        images: ['/uploads/mock/experience1.jpg']
      }
    ];
    
    // 利用可能時間
    basicInfo.availability = {
      day1: { // 月曜日
        available: true,
        slots: [
          { startTime: '10:00', endTime: '13:00' },
          { startTime: '14:00', endTime: '18:00' }
        ]
      },
      day3: { // 水曜日
        available: true,
        slots: [
          { startTime: '10:00', endTime: '13:00' },
          { startTime: '14:00', endTime: '18:00' }
        ]
      },
      day5: { // 金曜日
        available: true,
        slots: [
          { startTime: '10:00', endTime: '16:00' }
        ]
      }
    };
  }
  
  // 完了レベルが100%の場合、すべての情報を追加
  if (completionLevel >= 100 && formStatus !== 'required') {
    // 追加の専門分野
    basicInfo.expertise?.push({
      category: '食文化',
      subcategories: ['和食', '居酒屋'],
      yearsOfExperience: 7,
      description: '食文化に関する知識と経験があります。特に地元の人しか知らない名店の案内ができます。'
    });
    
    // 追加の体験サンプル
    basicInfo.experienceSamples?.push({
      title: '地元の美食ツアー',
      description: '地元の人に人気の飲食店を巡るツアーです。観光客では見つけにくい隠れた名店や、季節の味覚を楽しめる場所を案内します。食の背景にある文化的な解説も行います。',
      category: '食文化',
      estimatedDuration: 4,
      maxParticipants: 4,
      pricePerPerson: 7000,
      images: ['/uploads/mock/experience2.jpg', '/uploads/mock/experience3.jpg']
    });
    
    // 追加の利用可能時間
    if (basicInfo.availability) {
      basicInfo.availability.day6 = { // 土曜日
        available: true,
        slots: [
          { startTime: '10:00', endTime: '18:00' }
        ]
      };
      
      basicInfo.availability.day7 = { // 日曜日
        available: true,
        slots: [
          { startTime: '10:00', endTime: '16:00' }
        ]
      };
    }
    
    // その他の補足情報
    basicInfo.profileImage = '/uploads/mock/profile.jpg';
    basicInfo.socialMediaLinks = {
      instagram: 'https://instagram.com/example',
      twitter: 'https://twitter.com/example'
    };
  }
  
  return basicInfo;
}

/**
 * 統合テスト用のフォーム送信シミュレーション
 * 
 * @param formData 送信するフォームデータ
 * @param delayMs 模擬遅延（ms）
 * @param shouldFail 失敗させるかどうか
 * @returns 申請ID または エラー
 */
export async function simulateFormSubmission(
  formData: Partial<AttenderApplicationData>,
  delayMs: number = 1000,
  shouldFail: boolean = false
): Promise<{ success: boolean; applicationId?: string; error?: string }> {
  // 遅延をシミュレート
  await new Promise(resolve => setTimeout(resolve, delayMs));
  
  // エラーシミュレーション
  if (shouldFail) {
    return {
      success: false,
      error: '申請の送信中にエラーが発生しました。ネットワーク接続を確認してください。'
    };
  }
  
  // 成功レスポンス
  return {
    success: true,
    applicationId: `app_${Math.random().toString(36).substring(2, 15)}`
  };
}

/**
 * フォーム入力イベントのシミュレーション
 * 
 * @param fieldName フィールド名
 * @param value 入力値
 * @param type 入力タイプ
 * @returns イベントオブジェクト
 */
export function createInputEvent(
  fieldName: string,
  value: string | boolean | number,
  type: string = 'text'
): React.ChangeEvent<HTMLInputElement> {
  const event = {
    target: {
      name: fieldName,
      value,
      type,
      checked: type === 'checkbox' ? Boolean(value) : undefined
    },
    preventDefault: () => {}
  } as unknown as React.ChangeEvent<HTMLInputElement>;
  
  return event;
}

/**
 * 全ステップをシミュレートして入力する
 * 
 * @param handleChange 変更ハンドラ
 * @param mockData モックデータ
 * @param stepDelayMs ステップ間の遅延
 */
export async function simulateFormCompletion(
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
  mockData: Partial<AttenderApplicationData>,
  stepDelayMs: number = 500
): Promise<void> {
  // 基本情報の入力
  handleChange(createInputEvent('name', mockData.name || ''));
  await new Promise(resolve => setTimeout(resolve, stepDelayMs));
  
  handleChange(createInputEvent('email', mockData.email || ''));
  await new Promise(resolve => setTimeout(resolve, stepDelayMs));
  
  handleChange(createInputEvent('phoneNumber', mockData.phoneNumber || ''));
  await new Promise(resolve => setTimeout(resolve, stepDelayMs));
  
  // 位置情報の入力
  if (mockData.location) {
    handleChange(createInputEvent('location.country', mockData.location.country || ''));
    await new Promise(resolve => setTimeout(resolve, stepDelayMs));
    
    handleChange(createInputEvent('location.region', mockData.location.region || ''));
    await new Promise(resolve => setTimeout(resolve, stepDelayMs));
    
    handleChange(createInputEvent('location.city', mockData.location.city || ''));
    await new Promise(resolve => setTimeout(resolve, stepDelayMs));
  }
  
  // 自己紹介の入力
  handleChange(createInputEvent('biography', mockData.biography || ''));
  await new Promise(resolve => setTimeout(resolve, stepDelayMs));
  
  // 地元住民フラグ
  handleChange(createInputEvent('isLocalResident', mockData.isLocalResident || false, 'checkbox'));
  await new Promise(resolve => setTimeout(resolve, stepDelayMs));
  
  // 移住者フラグ
  handleChange(createInputEvent('isMigrant', mockData.isMigrant || false, 'checkbox'));
  await new Promise(resolve => setTimeout(resolve, stepDelayMs));
  
  // 同意事項
  if (mockData.agreements) {
    handleChange(createInputEvent('agreements.termsOfService', mockData.agreements.termsOfService || false, 'checkbox'));
    await new Promise(resolve => setTimeout(resolve, stepDelayMs));
    
    handleChange(createInputEvent('agreements.privacyPolicy', mockData.agreements.privacyPolicy || false, 'checkbox'));
    await new Promise(resolve => setTimeout(resolve, stepDelayMs));
    
    handleChange(createInputEvent('agreements.codeOfConduct', mockData.agreements.codeOfConduct || false, 'checkbox'));
    await new Promise(resolve => setTimeout(resolve, stepDelayMs));
    
    handleChange(createInputEvent('agreements.backgroundCheck', mockData.agreements.backgroundCheck || false, 'checkbox'));
    await new Promise(resolve => setTimeout(resolve, stepDelayMs));
  }
  
  // 注: 専門分野、体験サンプル、利用可能時間などの複雑なデータは、
  // 実際のテストでは直接setFieldValueなどのメソッドを使用する必要があります
}

export default {
  generateMockFormData,
  simulateFormSubmission,
  createInputEvent,
  simulateFormCompletion
};