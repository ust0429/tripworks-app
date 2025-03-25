/**
 * テストユーティリティ関数
 * 
 * 単体テストと統合テスト用のヘルパー関数を提供します。
 */

import React from 'react';
import { AttenderApplicationData, FormStatusType } from '../types/attender';

/**
 * モックイベントを生成
 * @param values イベントのvalue/checked値
 */
export function createMockEvent(values: Record<string, any> = {}) {
  return {
    preventDefault: jest.fn(),
    stopPropagation: jest.fn(),
    target: { ...values }
  };
}

/**
 * 指定時間待機する非同期関数
 * @param ms 待機ミリ秒
 */
export function wait(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 非同期アクションの完了を待機
 * 主にUI更新やAPIコールの完了を待つために使用
 */
export async function waitForAsyncActions(): Promise<void> {
  // イベントループの次のサイクルまで待機
  await new Promise(resolve => setTimeout(resolve, 0));
  // さらにひとつのタイマーティックを待機
  await new Promise(resolve => setTimeout(resolve, 0));
}

/**
 * モックのローカルストレージを作成
 * テスト用に使用
 */
export function createMockLocalStorage() {
  const store: Record<string, string> = {};
  
  return {
    getItem: jest.fn((key: string): string | null => {
      return store[key] || null;
    }),
    setItem: jest.fn((key: string, value: string): void => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string): void => {
      delete store[key];
    }),
    clear: jest.fn((): void => {
      Object.keys(store).forEach(key => {
        delete store[key];
      });
    }),
    get length(): number {
      return Object.keys(store).length;
    },
    key: jest.fn((index: number): string | null => {
      return Object.keys(store)[index] || null;
    }),
    getStore: () => store
  };
}

/**
 * サンプルのアテンダー申請データを生成
 * @param override 上書きする値
 * @param formStatus フォームステータス
 */
export function generateSampleAttenderData(
  override: Partial<AttenderApplicationData> = {},
  formStatus: FormStatusType = 'required'
): AttenderApplicationData {
  const baseData: AttenderApplicationData = {
    name: 'テスト太郎',
    email: 'test@example.com',
    phoneNumber: '090-1234-5678',
    location: {
      country: 'JP',
      region: '東京都',
      city: '渋谷区'
    },
    biography: 'これはテスト用のバイオグラフィーです。50文字以上の文章が必要なので、このようなダミーテキストを使用しています。',
    specialties: ['観光', 'グルメ'],
    languages: [
      { language: 'ja', proficiency: 'native' },
      { language: 'en', proficiency: 'intermediate' }
    ],
    isLocalResident: true,
    isMigrant: false,
    expertise: [
      {
        category: '観光',
        subcategories: ['史跡', '自然'],
        yearsOfExperience: 5,
        description: '観光案内の経験が5年あります。'
      }
    ],
    experienceSamples: [
      {
        title: '東京観光ツアー',
        description: '東京の観光名所を巡るツアーです。半日かけて主要スポットを効率的に案内します。50文字以上の説明文が必要です。',
        category: '観光',
        estimatedDuration: 4,
        maxParticipants: 5,
        pricePerPerson: 5000,
        images: []
      }
    ],
    availableTimes: [
      {
        dayOfWeek: 1,
        startTime: '10:00',
        endTime: '18:00',
        isAvailable: true
      },
      {
        dayOfWeek: 2,
        startTime: '10:00',
        endTime: '18:00',
        isAvailable: true
      }
    ],
    identificationDocument: {
      type: 'driver_license',
      number: '123456789012',
      expirationDate: '2030-12-31',
      frontImageUrl: '/mock/id_front.jpg',
      backImageUrl: '/mock/id_back.jpg'
    },
    agreements: {
      termsOfService: true,
      privacyPolicy: true,
      codeOfConduct: true,
      backgroundCheck: true
    },
    formStatus
  };
  
  return { ...baseData, ...override };
}

/**
 * 異なるフォーム状態間で移行する際のデータ変換をテスト
 * @param requiredData 必須モードのデータ
 * @param additionalData 追加データ
 */
export function testFormStatusTransition(
  requiredData: AttenderApplicationData,
  additionalData: Partial<AttenderApplicationData>
): AttenderApplicationData {
  // 必須モードから完全モードへの移行をシミュレート
  return {
    ...requiredData,
    ...additionalData,
    formStatus: 'completed' as const
  };
}

/**
 * フォームステップの完了状態をテスト
 * @param formData フォームデータ
 * @param step ステップ番号
 * @param expectedResult 期待される結果
 */
export function testStepCompletion(
  formData: Partial<AttenderApplicationData>,
  step: number,
  expectedResult: boolean
): boolean {
  // 実際のアプリケーションロジックに合わせて実装
  // これは単純な例です
  const isComplete = (step === 1 && formData.name && formData.email)
    || (step === 2 && formData.identificationDocument)
    || (step === 3 && formData.agreements?.termsOfService)
    || (step === 4 && formData.expertise && formData.expertise.length > 0)
    || (step === 5 && formData.experienceSamples && formData.experienceSamples.length > 0)
    || (step === 6 && formData.availableTimes && formData.availableTimes.length > 0);
  
  return isComplete === expectedResult;
}

export default {
  createMockEvent,
  wait,
  waitForAsyncActions,
  createMockLocalStorage,
  generateSampleAttenderData,
  testFormStatusTransition,
  testStepCompletion
};