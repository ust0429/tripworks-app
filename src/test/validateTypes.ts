/**
 * プロジェクト全体の型の整合性チェック
 * 
 * このファイルは実際に実行されるわけではなく、タイプチェッカーにエラーがないかを確認するためのものです。
 */
import { AttenderApplicationData, Reference, AdditionalDocument } from '../types/attender';
import { AttenderApplicationProvider, useAttenderApplication } from '../contexts/AttenderApplicationContext';

// AttenderApplicationDataのチェック
const validateAttenderApplicationData = () => {
  // 型に合った正しいデータ構造
  const validData: AttenderApplicationData = {
    name: "山田 太郎",
    email: "taro@example.com",
    phoneNumber: "090-1234-5678",
    location: {
      country: "JP",
      region: "Tokyo",
      city: "Shibuya"
    },
    biography: "東京在住のデザイナーです。地元の魅力を伝えたいと思っています。",
    specialties: ["アート", "デザイン", "カフェ巡り"],
    languages: [
      { language: "ja", proficiency: "native" },
      { language: "en", proficiency: "intermediate" }
    ],
    isLocalResident: true,
    isMigrant: false,
    expertise: [
      {
        category: "アート",
        subcategories: ["デジタルアート", "グラフィックデザイン"],
        yearsOfExperience: 5,
        description: "デザイン会社で5年間勤務し、様々なプロジェクトに携わってきました。",
        certifications: ["Adobe認定エキスパート"]
      }
    ],
    experienceSamples: [
      {
        title: "デザインスタジオツアー",
        description: "東京のデザインスタジオを巡るツアーです。",
        category: "アート",
        estimatedDuration: 180,
        maxParticipants: 6,
        pricePerPerson: 5000,
        includesFood: false,
        includesTransportation: true,
        cancellationPolicy: "moderate"
      }
    ],
    availableTimes: [
      {
        dayOfWeek: 5,
        startTime: "10:00",
        endTime: "18:00",
        isAvailable: true
      },
      {
        dayOfWeek: 6,
        startTime: "10:00",
        endTime: "18:00",
        isAvailable: true
      }
    ],
    identificationDocument: {
      type: "driver_license",
      number: "T12345678",
      expirationDate: "2028-12-31",
      frontImageUrl: "https://example.com/license_front.jpg",
      backImageUrl: "https://example.com/license_back.jpg"
    },
    agreements: {
      termsOfService: true,
      privacyPolicy: true,
      codeOfConduct: true,
      backgroundCheck: true
    },
    socialMediaLinks: {
      instagram: "https://instagram.com/yamada_taro",
      twitter: "https://twitter.com/yamada_taro"
    },
    references: [
      {
        name: "鈴木 一郎",
        relationship: "同僚",
        email: "suzuki@example.com",
        phoneNumber: "080-9876-5432",
        yearsKnown: 3,
        message: "真面目で信頼できる人物です。",
        verified: true
      }
    ],
    additionalDocuments: [
      {
        type: "certification",
        title: "デザイン資格証",
        description: "取得した資格の証明書です。",
        fileUrl: "https://example.com/certificate.pdf",
        uploadDate: "2025-03-01T12:00:00Z"
      }
    ]
  };

  return validData;
};

// Referenceのチェック
const validateReference = () => {
  const validReference: Reference = {
    name: "鈴木 一郎",
    relationship: "同僚",
    email: "suzuki@example.com",
    phoneNumber: "080-9876-5432",
    contactInfo: "suzuki@example.com", // 古い形式（後方互換性のため）
    yearsKnown: 3,
    message: "真面目で信頼できる人物です。",
    verified: true
  };

  return validReference;
};

// AdditionalDocumentのチェック
const validateAdditionalDocument = () => {
  const validDocument: AdditionalDocument = {
    type: "certification",
    title: "デザイン資格証",
    description: "取得した資格の証明書です。",
    fileUrl: "https://example.com/certificate.pdf",
    uploadDate: "2025-03-01T12:00:00Z"
  };

  return validDocument;
};

export const validateTypes = {
  validateAttenderApplicationData,
  validateReference,
  validateAdditionalDocument
};
