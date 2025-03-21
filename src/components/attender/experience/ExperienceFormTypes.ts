// 体験プランのデータ型
export interface ExperienceFormData {
  title: string;
  category: string;
  description: string;
  shortDescription: string;
  location: string;
  meetingPoint: string;
  duration: string;
  capacity: string;
  price: string;
  includedItems: string[];
  whatToBring: string[];
  photos: File[];
  itinerary: {
    title: string;
    description: string;
    duration: string;
  }[];
  availableDates: string[];
  specialRequirements: string;
  cancellationPolicy: 'flexible' | 'moderate' | 'strict';
  isFeatured: boolean;
  isDraft: boolean;
}

// 体験プランのカテゴリ
export const EXPERIENCE_CATEGORIES = [
  'アート・クラフト', '音楽', '食・グルメ', 'ドリンク', 
  'アウトドア・自然', '文化・伝統', 'スポーツ・アクティビティ', 'ナイトライフ',
  '歴史・建築', '写真', 'ショッピング', 'サブカルチャー',
  '季節限定', '特別イベント'
];

// 体験プランの初期値
export const initialExperienceData: ExperienceFormData = {
  title: '',
  category: '',
  description: '',
  shortDescription: '',
  location: '',
  meetingPoint: '',
  duration: '2', // デフォルト2時間
  capacity: '4', // デフォルト4人
  price: '',
  includedItems: [],
  whatToBring: [],
  photos: [],
  itinerary: [
    { title: '', description: '', duration: '30' }
  ],
  availableDates: [],
  specialRequirements: '',
  cancellationPolicy: 'moderate', // 'flexible', 'moderate', 'strict'
  isFeatured: false,
  isDraft: true,
};

// ヘルパー関数の型
export interface ExperienceFormHelpers {
  handleInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => void;
  handleCheckboxChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handlePhotosUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  removePhoto: (index: number) => void;
  handleListItemChange: (
    list: 'includedItems' | 'whatToBring',
    index: number,
    value: string
  ) => void;
  addListItem: (list: 'includedItems' | 'whatToBring') => void;
  removeListItem: (list: 'includedItems' | 'whatToBring', index: number) => void;
  handleItineraryChange: (
    index: number,
    field: 'title' | 'description' | 'duration',
    value: string
  ) => void;
  addItineraryItem: () => void;
  removeItineraryItem: (index: number) => void;
  handleDateChange: (date: string) => void;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  handleSubmit: (e: React.FormEvent, asDraft?: boolean) => Promise<void>;
}