import React, { useState } from 'react';
import { Edit3, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../../AuthComponents';
import { ExperienceFormData, initialExperienceData } from './ExperienceFormTypes';
import { ExperienceStep1 } from './ExperienceStep1';
import { ExperienceStep2 } from './ExperienceStep2';
import { ExperienceStep3 } from './ExperienceStep3';

// 体験プラン作成フォームコンポーネント
const ExperienceCreationFormBase: React.FC = () => {
  const { isAuthenticated, user, openLoginModal } = useAuth();
  
  // フォームの状態管理
  const [formData, setFormData] = useState<ExperienceFormData>(initialExperienceData);
  
  // フォームの現在のステップ
  const [currentStep, setCurrentStep] = useState(1);
  
  // エラーメッセージ
  const [error, setError] = useState<string | null>(null);
  
  // 送信中状態
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // 完了状態
  const [isCompleted, setIsCompleted] = useState(false);
  
  // 写真アップロードハンドラー
  const handlePhotosUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    const newPhotos = [...formData.photos];
    for (let i = 0; i < files.length; i++) {
      newPhotos.push(files[i]);
    }
    
    // 最大5枚まで
    setFormData({
      ...formData,
      photos: newPhotos.slice(0, 5)
    });
  };
  
  // 写真の削除
  const removePhoto = (index: number) => {
    const newPhotos = [...formData.photos];
    newPhotos.splice(index, 1);
    setFormData({
      ...formData,
      photos: newPhotos
    });
  };
  
  // テキスト・選択入力の変更ハンドラー
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  // チェックボックスの変更ハンドラー
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData({
      ...formData,
      [name]: checked
    });
  };
  
  // 含まれるもの・持ち物リストの更新
  const handleListItemChange = (
    list: 'includedItems' | 'whatToBring',
    index: number,
    value: string
  ) => {
    const newList = [...formData[list]];
    newList[index] = value;
    setFormData({
      ...formData,
      [list]: newList
    });
  };
  
  // リストアイテムの追加
  const addListItem = (list: 'includedItems' | 'whatToBring') => {
    setFormData({
      ...formData,
      [list]: [...formData[list], '']
    });
  };
  
  // リストアイテムの削除
  const removeListItem = (list: 'includedItems' | 'whatToBring', index: number) => {
    const newList = [...formData[list]];
    newList.splice(index, 1);
    setFormData({
      ...formData,
      [list]: newList
    });
  };
  
  // 行程の更新
  const handleItineraryChange = (
    index: number,
    field: 'title' | 'description' | 'duration',
    value: string
  ) => {
    const newItinerary = [...formData.itinerary];
    newItinerary[index] = {
      ...newItinerary[index],
      [field]: value
    };
    setFormData({
      ...formData,
      itinerary: newItinerary
    });
  };
  
  // 行程の追加
  const addItineraryItem = () => {
    setFormData({
      ...formData,
      itinerary: [
        ...formData.itinerary,
        { title: '', description: '', duration: '30' }
      ]
    });
  };
  
  // 行程の削除
  const removeItineraryItem = (index: number) => {
    if (formData.itinerary.length <= 1) return; // 少なくとも1つは必要
    
    const newItinerary = [...formData.itinerary];
    newItinerary.splice(index, 1);
    setFormData({
      ...formData,
      itinerary: newItinerary
    });
  };
  
  // 利用可能な日付の設定
  const handleDateChange = (date: string) => {
    const dates = [...formData.availableDates];
    const index = dates.indexOf(date);
    
    if (index === -1) {
      // 追加
      dates.push(date);
    } else {
      // 削除
      dates.splice(index, 1);
    }
    
    setFormData({
      ...formData,
      availableDates: dates
    });
  };
  
  // 次のステップへ進む
  const goToNextStep = () => {
    // 現在のステップのバリデーション
    if (currentStep === 1) {
      // 基本情報のバリデーション
      if (!formData.title || !formData.category || !formData.description || !formData.shortDescription) {
        setError('必須項目をすべて入力してください');
        return;
      }
    } else if (currentStep === 2) {
      // 詳細情報のバリデーション
      if (!formData.location || !formData.meetingPoint || !formData.price) {
        setError('必須項目をすべて入力してください');
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
  const handleSubmit = async (e: React.FormEvent, asDraft: boolean = false) => {
    e.preventDefault();
    
    // バリデーション
    if (currentStep === 3) {
      if (formData.photos.length === 0) {
        setError('少なくとも1枚の写真をアップロードしてください');
        return;
      }
      
      if (asDraft) {
        // 下書きとして保存する場合は、すべての必須フィールドをチェックしない
        setFormData({
          ...formData,
          isDraft: true
        });
      } else {
        // 公開する場合は、すべての必須フィールドをチェック
        if (formData.availableDates.length === 0) {
          setError('少なくとも1つの利用可能日を設定してください');
          return;
        }
        
        setFormData({
          ...formData,
          isDraft: false
        });
      }
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
      console.error('体験プラン送信エラー:', error);
      setError('体験プランの保存中にエラーが発生しました。後ほど再度お試しください。');
      setIsSubmitting(false);
    }
  };
  
  // 認証状態のチェック
  if (!isAuthenticated) {
    return (
      <div className="max-w-3xl mx-auto py-8 px-4">
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <Edit3 size={48} className="mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold mb-4">体験プラン作成にはログインが必要です</h2>
          <p className="text-gray-600 mb-6">
            体験プランを作成するには、まずログインしてください。
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
  
  // 完了画面
  if (isCompleted) {
    return (
      <div className="max-w-3xl mx-auto py-8 px-4">
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-4">
            {formData.isDraft ? '下書きとして保存しました' : '体験プランを公開しました'}
          </h2>
          <p className="text-gray-600 mb-8">
            {formData.isDraft
              ? 'プランはいつでも編集して公開できます。'
              : '体験プランは審査後に公開されます。審査には1-2営業日かかります。'}
          </p>
          <div className="flex flex-col md:flex-row md:justify-center gap-4">
            <button
              onClick={() => window.location.href = '/attender/experiences'}
              className="bg-black text-white py-3 px-8 rounded-lg font-medium hover:bg-gray-900 transition-colors"
            >
              体験プラン一覧へ
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
  
  // ヘルパー関数
  const helpers = {
    handleInputChange,
    handleCheckboxChange,
    handlePhotosUpload,
    removePhoto,
    handleListItemChange,
    addListItem,
    removeListItem,
    handleItineraryChange,
    addItineraryItem,
    removeItineraryItem,
    handleDateChange,
    goToNextStep,
    goToPreviousStep,
    handleSubmit
  };
  
  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">体験プラン作成</h1>
      
      {/* プログレスバー */}
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          {['基本情報', '詳細情報', '写真と公開設定'].map((step, index) => (
            <div key={index} className="text-sm font-medium text-center flex-1">
              {step}
            </div>
          ))}
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className="bg-black h-2.5 rounded-full transition-all duration-300" 
            style={{ width: `${(currentStep / 3) * 100}%` }}
          ></div>
        </div>
      </div>
      
      {/* エラーメッセージ */}
      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 rounded-lg flex items-start">
          <AlertTriangle size={20} className="text-red-600 mt-0.5 mr-2 flex-shrink-0" />
          <p className="text-red-700">{error}</p>
        </div>
      )}
      
      <form onSubmit={(e) => handleSubmit(e, false)} className="bg-white rounded-lg shadow p-6">
        {currentStep === 1 && (
          <ExperienceStep1 
            formData={formData} 
            helpers={helpers} 
          />
        )}
        
        {currentStep === 2 && (
          <ExperienceStep2 
            formData={formData} 
            helpers={helpers} 
          />
        )}
        
        {currentStep === 3 && (
          <ExperienceStep3 
            formData={formData} 
            helpers={helpers} 
            isSubmitting={isSubmitting}
          />
        )}
      </form>
    </div>
  );
};

export default ExperienceCreationFormBase;