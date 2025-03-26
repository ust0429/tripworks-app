/**
 * アテンダープロフィール関連の型定義
 */

// SNSリンク
export interface SocialMediaLink {
  platform: string;
  url: string;
}

// 利用可能時間
export interface Availability {
  [day: string]: {
    available: boolean;
    startTime?: string;
    endTime?: string;
  };
}

// 体験サンプル
export interface ExperienceSample {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  duration: string;
  price?: number;
}

// アテンダープロフィールデータ
export interface AttenderProfileData {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  address: string;
  bio: string;
  profileImage?: string;
  headerImage?: string;
  expertise: string[];
  languages: string[];
  experienceSamples: ExperienceSample[];
  socialMediaLinks: SocialMediaLink[];
  availability: Availability;
  rating?: number;
  reviewCount?: number;
  status: 'active' | 'pending' | 'inactive';
  joinedDate: string;
  verificationStatus: 'verified' | 'pending' | 'unverified';
  achievementBadges?: string[];
}

// 既存のAttenderApplicationDataを拡張して互換性を持たせる
import { AttenderApplicationData } from '../index';

// アプリケーションデータからプロフィールデータへの変換ヘルパー
export function convertApplicationToProfile(data: AttenderApplicationData): Partial<AttenderProfileData> {
  return {
    name: data.name,
    email: data.email,
    phoneNumber: data.phoneNumber,
    address: data.location ? `${data.location.city}, ${data.location.region}, ${data.location.country}` : '',
    bio: data.biography || '',
    expertise: data.specialties || [],
    // socialMediaLinksをSocialMediaLink[]型に変換
    socialMediaLinks: data.socialMediaLinks ? 
      Object.entries(data.socialMediaLinks).map(([platform, url]) => ({
        platform,
        url: url || ''
      })).filter(link => link.url) : [],
    // experienceSamplesを新しい形式に変換
    experienceSamples: (data.experienceSamples || []).map(sample => ({
      id: `exp-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      title: sample.title,
      description: sample.description,
      imageUrl: sample.imageUrls && sample.imageUrls.length > 0 ? sample.imageUrls[0] : undefined,
      duration: `${sample.estimatedDuration} 分`,
      price: sample.pricePerPerson
    })),
    // availableTimesをAvailability形式に変換
    availability: (data.availableTimes || []).reduce((acc, slot) => {
      const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const day = dayNames[slot.dayOfWeek];
      
      acc[day] = {
        available: slot.isAvailable,
        startTime: slot.startTime,
        endTime: slot.endTime
      };
      
      return acc;
    }, {} as Availability),
    status: 'pending',
    verificationStatus: 'pending',
    joinedDate: new Date().toISOString(),
  };
}
