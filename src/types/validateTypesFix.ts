/**
 * 型を検証するためのファイル
 * 実際には実行されず、型チェックのためだけに使用
 */
import {
  AttenderApplicationData,
  ExpertiseArea,
  AvailabilityTimeSlot,
  IdentificationDocument,
  AdditionalDocument,
  Reference,
  SocialMediaLinks,
  PortfolioItem,
  AttenderProfile
} from './attender';

// 型が正しく定義されているか確認するためのダミー関数
function validateTypes() {
  // AvailabilityTimeSlot型の確認
  const availabilitySlot: AvailabilityTimeSlot = {
    dayOfWeek: 1, // 月曜日
    startTime: "09:00",
    endTime: "12:00",
    isAvailable: true
  };

  // IdentificationDocument型の確認
  const idDocument: IdentificationDocument = {
    documentType: 'passport',
    documentNumber: 'AB1234567',
    expiryDate: new Date('2025-12-31'),
    documentImageUrl: 'https://example.com/front.jpg',
    // 互換性のための古い形式のプロパティも取得可能
    type: 'passport',
    number: 'AB1234567',
    expirationDate: '2025-12-31',
    frontImageUrl: 'https://example.com/front.jpg',
    backImageUrl: 'https://example.com/back.jpg'
  };

  // PortfolioItem型の確認
  const portfolioItem: PortfolioItem = {
    id: '1',
    title: 'サンプル作品',
    description: '説明文',
    mediaUrls: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
    category: 'アート',
    // 互換性のための古い形式のプロパティも取得可能
    imageUrls: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
    tags: ['伝統工芸', '陶芸']
  };

  // 完全なAttenderApplicationData型の確認
  const applicationData: AttenderApplicationData = {
    name: 'テスト太郎',
    email: 'test@example.com',
    phoneNumber: '090-1234-5678',
    biography: 'テスト用の自己紹介文です。',
    location: {
      country: 'JP',
      region: '関東',
      city: '東京',
    },
    isLocalResident: true,
    specialties: ['アート', '伝統工芸'],
    languages: [
      { language: 'ja', proficiency: 'native' },
      { language: 'en', proficiency: 'intermediate' }
    ],
    expertise: ['アート', '陶芸', '書道'],
    experienceSamples: [
      {
        id: 'exp-001',
        title: '陶芸体験ワークショップ',
        description: '初心者向けの陶芸体験です。',
        imageUrl: 'https://example.com/ceramics.jpg',
        duration: 120,
        // 互換性のための古い形式のプロパティも持つ
        category: 'アート',
        estimatedDuration: 120,
        maxParticipants: 6,
        pricePerPerson: 5000,
        imageUrls: ['https://example.com/ceramics.jpg']
      }
    ],
    availableTimes: [
      {
        dayOfWeek: 1, // 月曜日
        startTime: "09:00",
        endTime: "12:00",
        isAvailable: true
      }
    ],
    identificationDocument: {
      documentType: 'passport',
      documentNumber: 'AB1234567',
      expiryDate: new Date('2025-12-31'),
      documentImageUrl: 'https://example.com/front.jpg',
      // 互換性のための古いプロパティ
      type: 'passport',
      number: 'AB1234567',
      expirationDate: '2025-12-31',
      frontImageUrl: 'https://example.com/front.jpg'
    },
    agreements: {
      termsOfService: true,
      privacyPolicy: true,
      codeOfConduct: true,
      backgroundCheck: true
    }
  };

  // ApplePay関連の型確認
  type ApplePayValidation = (success: boolean) => void;
  const validate: ApplePayValidation = (success) => {
    console.log(`Validation ${success ? 'succeeded' : 'failed'}`);
  };

  // ApplePayButton用の型確認
  type PaymentProps = {
    amount: string | number;
    onPaymentComplete: (transactionId: string) => void;
    onPaymentError: (error: Error) => void;
  };

  const paymentProps: PaymentProps = {
    amount: "1000",
    onPaymentComplete: (id) => console.log(`Transaction ${id} completed`),
    onPaymentError: (err) => console.error(`Error: ${err.message}`)
  };

  // 数値でも渡せることを確認
  const paymentPropsWithNumber: PaymentProps = {
    amount: 1000,
    onPaymentComplete: (id) => console.log(`Transaction ${id} completed`),
    onPaymentError: (err) => console.error(`Error: ${err.message}`)
  };
}

// この関数は実行されず、型チェックのみに使用
export default validateTypes;
