import React, { useState } from 'react';
import { User, Camera, MapPin, Upload, Clock, Globe, Tag, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../../AuthComponents';
import { AttenderApplicationFormPart2 } from './AttenderApplicationFormPart2';

// アテンダー申請で選択可能な専門分野カテゴリ
const SPECIALTY_CATEGORIES = [
  'アート・サブカルチャー', '音楽', '伝統文化', 'クラフト・手作り', 
  'ローカルフード', 'アウトドア', 'スポーツ', 'ナイトライフ',
  '歴史・建築', '自然', 'ショッピング', 'ローカルイベント',
  '季節のお祭り', '穴場・裏スポット'
];

interface AreaOption {
  id: string;
  name: string;
  prefecture: string;
}

// エリア選択で表示する地域オプション（実際はAPIから取得）
const AREA_OPTIONS: AreaOption[] = [
  { id: 'tokyo-shinjuku', name: '新宿', prefecture: '東京都' },
  { id: 'tokyo-shibuya', name: '渋谷', prefecture: '東京都' },
  { id: 'tokyo-shimokitazawa', name: '下北沢', prefecture: '東京都' },
  { id: 'kyoto-gion', name: '祇園', prefecture: '京都府' },
  { id: 'kyoto-arashiyama', name: '嵐山', prefecture: '京都府' },
  { id: 'osaka-namba', name: '難波', prefecture: '大阪府' },
  { id: 'osaka-umeda', name: '梅田', prefecture: '大阪府' },
  { id: 'fukuoka-tenjin', name: '天神', prefecture: '福岡県' },
  { id: 'okinawa-naha', name: '那覇', prefecture: '沖縄県' },
];

// 言語オプション
const LANGUAGE_OPTIONS = [
  { code: 'ja', name: '日本語' },
  { code: 'en', name: '英語' },
  { code: 'zh', name: '中国語' },
  { code: 'ko', name: '韓国語' },
  { code: 'fr', name: 'フランス語' },
  { code: 'es', name: 'スペイン語' },
  { code: 'de', name: 'ドイツ語' },
  { code: 'it', name: 'イタリア語' },
  { code: 'ru', name: 'ロシア語' },
];

export interface AttenderApplicationFormData {
  displayName: string;
  type: string;
  bio: string;
  specialties: string[];
  areas: string[];
  languages: string[];
  profilePhoto: File | null;
  photosOfWork: File[];
  mobileNumber: string;
  emergencyContact: string;
  identificationDocument: File | null;
  experienceYears: string;
  certifications: string;
  availability: 'weekends' | 'weekdays' | 'anytime';
  motivationLetter: string;
}

// アテンダー申請フォームコンポーネント
const AttenderApplicationForm: React.FC = () => {
  const { isAuthenticated, user, openLoginModal } = useAuth();
  
  // フォームの状態管理
  const [formData, setFormData] = useState<AttenderApplicationFormData>({
    displayName: user?.name || '',
    type: '',
    bio: '',
    specialties: [],
    areas: [],
    languages: [],
    profilePhoto: null,
    photosOfWork: [],
    mobileNumber: '',
    emergencyContact: '',
    identificationDocument: null,
    experienceYears: '',
    certifications: '',
    availability: 'weekends',
    motivationLetter: '',
  });
  
  // フォームの現在のステップ
  const [currentStep, setCurrentStep] = useState(1);
  
  // エラーメッセージ
  const [error, setError] = useState<string | null>(null);
  
  // 送信中状態
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // 申請完了状態
  const [isCompleted, setIsCompleted] = useState(false);
  
  // ファイルアップロードハンドラー
  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>, 
    field: 'profilePhoto' | 'photosOfWork' | 'identificationDocument'
  ) => {
    const files = e.target.files;
    if (!files) return;
    
    if (field === 'profilePhoto' || field === 'identificationDocument') {
      // 単一ファイル
      setFormData({
        ...formData,
        [field]: files[0]
      });
    } else if (field === 'photosOfWork') {
      // 複数ファイル
      const newPhotos = [...formData.photosOfWork];
      for (let i = 0; i < files.length; i++) {
        newPhotos.push(files[i]);
      }
      // 最大5枚まで
      setFormData({
        ...formData,
        photosOfWork: newPhotos.slice(0, 5)
      });
    }
  };
  
  // 活動写真の削除
  const removePhoto = (index: number) => {
    const newPhotos = [...formData.photosOfWork];
    newPhotos.splice(index, 1);
    setFormData({
      ...formData,
      photosOfWork: newPhotos
    });
  };
  
  // テキスト・選択入力の変更ハンドラー
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value as any
    });
  };
  
  // チェックボックスの変更ハンドラー
  const handleCheckboxChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: 'specialties' | 'areas' | 'languages'
  ) => {
    const { value, checked } = e.target;
    let updatedArray = [...formData[field]];
    
    if (checked) {
      updatedArray.push(value);
    } else {
      updatedArray = updatedArray.filter(item => item !== value);
    }
    
    setFormData({
      ...formData,
      [field]: updatedArray
    });
  };
  
  // 次のステップへ進む
  const goToNextStep = () => {
    // 現在のステップのバリデーション
    if (currentStep === 1) {
      // 基本情報のバリデーション
      if (!formData.displayName || !formData.type || !formData.bio || formData.specialties.length === 0) {
        setError('必須項目をすべて入力してください');
        return;
      }
    } else if (currentStep === 2) {
      // 活動エリアと言語のバリデーション
      if (formData.areas.length === 0 || formData.languages.length === 0) {
        setError('活動エリアと言語を少なくとも1つ選択してください');
        return;
      }
    }
    
    setError(null);
    setCurrentStep(currentStep + 1);
    window.scrollTo(0, 0);
  };
  
  // 前のステップに戻る
  const goToPreviousStep = () => {
    setCurrentStep(currentStep - 1);
    window.scrollTo(0, 0);
  };
  
  // フォーム送信ハンドラー
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 最終バリデーション
    if (!formData.mobileNumber || !formData.emergencyContact || !formData.identificationDocument) {
      setError('必須項目をすべて入力してください');
      return;
    }
    
    setError(null);
    setIsSubmitting(true);
    
    try {
      // APIリクエストのモック
      // 実際のアプリでは適切なAPIエンドポイントにデータを送信
      console.log('送信データ:', formData);
      
      // 成功したと仮定
      setTimeout(() => {
        setIsSubmitting(false);
        setIsCompleted(true);
      }, 1500);
    } catch (error) {
      console.error('申請送信エラー:', error);
      setError('申請の送信中にエラーが発生しました。後ほど再度お試しください。');
      setIsSubmitting(false);
    }
  };
  
  // 認証状態のチェック
  if (!isAuthenticated) {
    return (
      <div className="max-w-3xl mx-auto py-8 px-4">
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <User size={48} className="mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold mb-4">アテンダー申請にはログインが必要です</h2>
          <p className="text-gray-600 mb-6">
            アテンダーとして活動するには、まずログインしてください。
            アカウントをお持ちでない場合は、新規登録もできます。
          </p>
          <button
            onClick={openLoginModal}
            className="bg-black text-white py-3 px-8 rounded-lg font-medium hover:bg-gray-900 transition-colors"
          >
            ログイン / 新規登録
          </button>
        </div>
      </div>
    );
  }
  
  // 申請完了画面
  if (isCompleted) {
    return (
      <div className="max-w-3xl mx-auto py-8 px-4">
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-4">アテンダー申請が完了しました</h2>
          <p className="text-gray-600 mb-8">
            申請内容は審査チームによって確認されます。
            結果は5営業日以内にメールでお知らせします。
            申請状況はマイページでも確認できます。
          </p>
          <div className="flex flex-col md:flex-row md:justify-center gap-4">
            <button
              onClick={() => window.location.href = '/mypage'}
              className="bg-black text-white py-3 px-8 rounded-lg font-medium hover:bg-gray-900 transition-colors"
            >
              マイページへ
            </button>
            <button
              onClick={() => window.location.href = '/home'}
              className="bg-white text-black border border-black py-3 px-8 rounded-lg font-medium hover:bg-gray-100 transition-colors"
            >
              ホームへ戻る
            </button>
          </div>
        </div>
      </div>
    );
  }

  // パート2コンポーネントに渡すプロパティ
  const propsForPart2 = {
    formData,
    handleFileUpload,
    removePhoto,
    handleInputChange,
    handleCheckboxChange,
    currentStep,
    error,
    isSubmitting,
    goToNextStep,
    goToPreviousStep,
    handleSubmit,
    SPECIALTY_CATEGORIES,
    AREA_OPTIONS,
    LANGUAGE_OPTIONS
  };

  // パート2コンポーネントを描画
  return <AttenderApplicationFormPart2 {...propsForPart2} />;
};

export default AttenderApplicationForm;