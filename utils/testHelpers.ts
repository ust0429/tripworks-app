/**
 * テスト用ヘルパー関数ライブラリ
 * 
 * フォームのテストやバリデーションテストのためのユーティリティを提供します。
 * Jest/Reactテスティングライブラリと連携して使用します。
 */

import { AttenderApplicationData, FormStatusType } from '../types/attender';

/**
 * モックアテンダー申請データを生成
 * 指定されたオーバーライドでカスタマイズ可能
 */
export function generateMockAttenderData(
  override: Partial<AttenderApplicationData> = {},
  formStatus: FormStatusType = 'completed'
): AttenderApplicationData {
  // ベースとなる完全なアテンダーデータ
  const baseData: AttenderApplicationData = {
    name: '山田 太郎',
    email: 'taro.yamada@example.com',
    phoneNumber: '090-1234-5678',
    location: {
      country: 'JP',
      region: '東京都',
      city: '渋谷区',
      address: '渋谷1-1-1',
      postalCode: '150-0001'
    },
    biography: 'テスト用のバイオグラフィー。最低50文字以上の文章を入力する必要があるため、このようなダミーテキストを使用しています。実際の申請では、もっと詳細な自己紹介文を書く必要があります。',
    specialties: ['観光案内', '食べ歩き', '歴史'],
    languages: [
      { language: 'ja', proficiency: 'native' },
      { language: 'en', proficiency: 'intermediate' }
    ],
    isLocalResident: true,
    isMigrant: false,
    yearsMoved: 0,
    previousLocation: null,
    expertise: [
      {
        category: '観光案内',
        subcategories: ['寺社仏閣', '都市観光'],
        yearsOfExperience: 5,
        description: '東京の観光案内を5年間行ってきました。特に寺社仏閣や都市観光に詳しいです。'
      }
    ],
    experienceSamples: [
      {
        title: '東京下町散策ツアー',
        description: '東京の下町エリアを巡るツアーです。昔ながらの街並みや商店街、地元の人々との交流を楽しめます。最低でも50文字以上の説明文を提供する必要があります。',
        category: '都市観光',
        estimatedDuration: 3,
        maxParticipants: 6,
        pricePerPerson: 5000,
        images: ['/mock/images/downtown1.jpg']
      }
    ],
    availableTimes: [
      {
        dayOfWeek: 1, // 月曜日
        startTime: '09:00',
        endTime: '17:00',
        isAvailable: true
      },
      {
        dayOfWeek: 2, // 火曜日
        startTime: '09:00',
        endTime: '17:00',
        isAvailable: true
      }
    ],
    identificationDocument: {
      type: 'driver_license',
      number: '123456789012',
      expirationDate: '2030-12-31',
      frontImageUrl: '/mock/images/id_front.jpg',
      backImageUrl: '/mock/images/id_back.jpg'
    },
    agreements: {
      termsOfService: true,
      privacyPolicy: true,
      codeOfConduct: true,
      backgroundCheck: true
    },
    formStatus
  };
  
  // 指定されたオーバーライドを適用
  return { ...baseData, ...override };
}

/**
 * 特定のフィールドを意図的に不足させたデータを生成
 * バリデーションテスト用
 */
export function generateInvalidAttenderData(
  invalidFields: string[],
  formStatus: FormStatusType = 'completed'
): AttenderApplicationData {
  const validData = generateMockAttenderData({}, formStatus);
  const invalidData = { ...validData };
  
  // 各無効フィールドを処理
  invalidFields.forEach(field => {
    // ネストされたフィールドを処理（例: location.country）
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      if (invalidData[parent as keyof AttenderApplicationData]) {
        const parentObj = invalidData[parent as keyof AttenderApplicationData] as any;
        if (parentObj && typeof parentObj === 'object') {
          parentObj[child] = undefined;
        }
      }
    } else {
      // 通常のフィールド
      switch (field) {
        case 'name':
        case 'email':
        case 'phoneNumber':
        case 'biography':
          (invalidData as any)[field] = '';
          break;
        case 'specialties':
        case 'languages':
        case 'expertise':
        case 'experienceSamples':
        case 'availableTimes':
          (invalidData as any)[field] = [];
          break;
        case 'identificationDocument':
          (invalidData as any)[field] = null;
          break;
        case 'isLocalResident':
        case 'isMigrant':
          (invalidData as any)[field] = undefined;
          break;
        case 'agreements':
          (invalidData as any)[field] = {
            termsOfService: false,
            privacyPolicy: false,
            codeOfConduct: false,
            backgroundCheck: false
          };
          break;
        default:
          // 特殊な処理が必要ないフィールドは単に削除
          (invalidData as any)[field] = undefined;
      }
    }
  });
  
  return invalidData;
}

/**
 * 各フィールドに対応する期待されるエラーメッセージを生成
 */
export function getExpectedErrorMessages(invalidFields: string[]): Record<string, string> {
  const errorMessages: Record<string, string> = {};
  
  invalidFields.forEach(field => {
    switch (field) {
      case 'name':
        errorMessages[field] = '名前は必須です';
        break;
      case 'email':
        errorMessages[field] = 'メールアドレスは必須です';
        break;
      case 'phoneNumber':
        errorMessages[field] = '電話番号は必須です';
        break;
      case 'location.country':
        errorMessages[field] = '国は必須です';
        break;
      case 'location.region':
        errorMessages[field] = '地域は必須です';
        break;
      case 'location.city':
        errorMessages[field] = '都市は必須です';
        break;
      case 'biography':
        errorMessages[field] = '自己紹介文は必須です';
        break;
      case 'specialties':
        errorMessages[field] = '少なくとも1つの専門分野を選択してください';
        break;
      case 'languages':
        errorMessages[field] = '少なくとも1つの言語を選択してください';
        break;
      case 'expertise':
        errorMessages[field] = '少なくとも1つの専門知識を追加してください';
        break;
      case 'experienceSamples':
        errorMessages[field] = '少なくとも1つの体験サンプルを追加してください';
        break;
      case 'availableTimes':
        errorMessages[field] = '少なくとも1つの利用可能時間を設定してください';
        break;
      case 'isLocalResident':
        errorMessages[field] = '地元住民かどうかを選択してください';
        break;
      case 'agreements.termsOfService':
        errorMessages[field] = '利用規約への同意が必要です';
        break;
      case 'agreements.privacyPolicy':
        errorMessages[field] = 'プライバシーポリシーへの同意が必要です';
        break;
      case 'agreements.codeOfConduct':
        errorMessages[field] = '行動規範への同意が必要です';
        break;
      case 'agreements.backgroundCheck':
        errorMessages[field] = 'バックグラウンドチェックへの同意が必要です';
        break;
      default:
        errorMessages[field] = `${field}は必須です`;
    }
  });
  
  return errorMessages;
}

/**
 * AttenderApplicationData の特定の型を持つフィールドのみを抽出
 */
export function filterFieldsByType<T>(
  data: AttenderApplicationData,
  predicate: (value: any, key: string) => boolean
): Record<string, T> {
  const result: Record<string, T> = {};
  
  Object.entries(data).forEach(([key, value]) => {
    if (predicate(value, key)) {
      result[key] = value as T;
    }
  });
  
  return result;
}

/**
 * フォームイベントをモック
 */
export function mockFormEvent(
  value: string | boolean | number,
  name: string = 'test'
): React.ChangeEvent<HTMLInputElement> {
  return {
    target: {
      name,
      value,
      type: typeof value === 'boolean' ? 'checkbox' : 'text',
      checked: typeof value === 'boolean' ? value : undefined
    }
  } as unknown as React.ChangeEvent<HTMLInputElement>;
}

export default {
  generateMockAttenderData,
  generateInvalidAttenderData,
  getExpectedErrorMessages,
  filterFieldsByType,
  mockFormEvent
};