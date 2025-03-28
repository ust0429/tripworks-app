/**
 * アテンダー申請関連の型定義
 */

import { ExperienceSample, ExpertiseArea, LanguageSkill } from './profile';

/**
 * アテンダー申請データの型定義
 */
export interface AttenderApplicationData {
  userId: string;
  personalInfo: {
    name: string;
    email: string;
    phone?: string;
    birthdate?: string;
    gender?: string;
    address?: {
      country: string;
      region: string;
      city: string;
      street?: string;
      postalCode?: string;
    };
  };
  bio: string;
  specialties: string[];
  profilePhoto?: string;
  experienceSamples: ExperienceSample[];
  languages: LanguageSkill[];
  residencyInfo: {
    isLocalResident: boolean;
    isMigrant: boolean;
    yearsMoved?: number;
    previousLocation?: string;
  };
  expertise: ExpertiseArea[];
  status: ApplicationStatus;
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
  reviewedAt?: string;
  reviewerNotes?: string;
}

/**
 * アプリケーションステータスの列挙型
 */
export type ApplicationStatus = 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'incomplete';

/**
 * フォームステータスの型定義
 */
export type FormStatusType = 'idle' | 'submitting' | 'submitted' | 'error';

/**
 * アテンダーアプリケーションフォーム各ステップの型定義
 */
export type ApplicationStepType = 'personal' | 'profile' | 'expertise' | 'experiences' | 'availability' | 'review';

/**
 * アテンダーアプリケーションフォームの各ステップ完了ステータス
 */
export interface StepCompletionStatus {
  personal: boolean;
  profile: boolean;
  expertise: boolean;
  experiences: boolean;
  availability: boolean;
  review: boolean;
}

/**
 * アテンダー申請の検証エラー
 */
export interface ValidationErrors {
  [key: string]: string | ValidationErrors | Array<ValidationErrors>;
}

export default AttenderApplicationData;
