import React from 'react';
import { Camera, Upload, AlertTriangle } from 'lucide-react';
import { AttenderApplicationFormData } from './AttenderApplicationFormPart1';

// AttenderApplicationFormPart2のプロパティ型定義
export interface AttenderApplicationFormPart2Props {
  formData: AttenderApplicationFormData;
  handleFileUpload: (
    e: React.ChangeEvent<HTMLInputElement>, 
    field: 'profilePhoto' | 'photosOfWork' | 'identificationDocument'
  ) => void;
  removePhoto: (index: number) => void;
  handleInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => void;
  handleCheckboxChange: (
    e: React.ChangeEvent<HTMLInputElement>,
    field: 'specialties' | 'areas' | 'languages'
  ) => void;
  currentStep: number;
  error: string | null;
  isSubmitting: boolean;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  SPECIALTY_CATEGORIES: string[];
  AREA_OPTIONS: {
    id: string;
    name: string;
    prefecture: string;
  }[];
  LANGUAGE_OPTIONS: {
    code: string;
    name: string;
  }[];
}

// フォームの主要部分を表示するコンポーネント
export const AttenderApplicationFormPart2: React.FC<AttenderApplicationFormPart2Props> = ({
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
}) => {
  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">アテンダー申請</h1>
      
      {/* プログレスバー */}
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          {['基本情報', '活動詳細', '身分確認・安全対策'].map((step, index) => (
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
      
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
        {/* ステップ1: 基本情報 */}
        {currentStep === 1 && (
          <div>
            <h2 className="text-xl font-bold mb-6">1. 基本情報</h2>
            
            {/* 表示名 */}
            <div className="mb-6">
              <label className="block mb-2 font-medium">
                表示名 <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                name="displayName"
                value={formData.displayName}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg"
                placeholder="あなたの表示名"
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                アプリ上で表示される名前です。本名でなくてもOKです。
              </p>
            </div>
            
            {/* アテンダータイプ */}
            <div className="mb-6">
              <label className="block mb-2 font-medium">
                アテンダータイプ <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg"
                placeholder="例: バンドマン、アーティスト、写真家など"
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                あなたの専門分野や特性を一言で表す肩書きを入力してください。
              </p>
            </div>
            
            {/* 自己紹介 */}
            <div className="mb-6">
              <label className="block mb-2 font-medium">
                自己紹介 <span className="text-red-600">*</span>
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg"
                rows={5}
                placeholder="あなたの経験や特技、提供できる体験などについて教えてください"
                required
              ></textarea>
              <p className="text-sm text-gray-500 mt-1">
                最大500文字。ユーザーがあなたの特徴や提供できる体験を理解できる文章を書きましょう。
              </p>
            </div>
            
            {/* 専門分野 */}
            <div className="mb-6">
              <label className="block mb-2 font-medium">
                専門分野 <span className="text-red-600">*</span> (複数選択可)
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {SPECIALTY_CATEGORIES.map(category => (
                  <label key={category} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      name="specialties"
                      value={category}
                      checked={formData.specialties.includes(category)}
                      onChange={(e) => handleCheckboxChange(e, 'specialties')}
                      className="rounded border-gray-300 text-black focus:ring-black"
                    />
                    <span>{category}</span>
                  </label>
                ))}
              </div>
            </div>
            
            {/* プロフィール写真 */}
            <div className="mb-6">
              <label className="block mb-2 font-medium">
                プロフィール写真
              </label>
              <div className="flex items-center gap-4">
                <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                  {formData.profilePhoto ? (
                    <img
                      src={URL.createObjectURL(formData.profilePhoto)}
                      alt="プロフィール写真"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Camera size={32} className="text-gray-400" />
                  )}
                </div>
                <div>
                  <label className="block py-2 px-4 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, 'profilePhoto')}
                    />
                    写真をアップロード
                  </label>
                  <p className="text-sm text-gray-500 mt-1">
                    JPG/PNG形式, 最大2MB
                  </p>
                </div>
              </div>
            </div>
            
            {/* 活動写真 */}
            <div className="mb-6">
              <label className="block mb-2 font-medium">
                活動写真 (最大5枚)
              </label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-3">
                {formData.photosOfWork.map((photo, index) => (
                  <div key={index} className="relative">
                    <div className="aspect-square rounded-lg overflow-hidden">
                      <img
                        src={URL.createObjectURL(photo)}
                        alt={`活動写真 ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="absolute top-1 right-1 bg-black bg-opacity-70 text-white p-1 rounded-full"
                      aria-label="写真を削除"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
                {formData.photosOfWork.length < 5 && (
                  <label className="aspect-square bg-gray-100 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-gray-200">
                    <Upload size={24} className="text-gray-400 mb-2" />
                    <span className="text-sm text-gray-500">追加</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      multiple
                      onChange={(e) => handleFileUpload(e, 'photosOfWork')}
                    />
                  </label>
                )}
              </div>
              <p className="text-sm text-gray-500">
                あなたの活動や提供できる体験がわかる写真をアップロードしてください。
              </p>
            </div>
            
            {/* ナビゲーションボタン */}
            <div className="flex justify-end mt-8">
              <button
                type="button"
                onClick={goToNextStep}
                className="bg-black text-white py-3 px-8 rounded-lg font-medium hover:bg-gray-900 transition-colors"
              >
                次へ
              </button>
            </div>
          </div>
        )}
        
        {/* 残りのフォームパーツはAttenderApplicationFormPart3で実装 */}
        {currentStep > 1 && <AttenderApplicationFormPart3 {...{
          formData, 
          handleInputChange, 
          handleCheckboxChange,
          handleFileUpload,
          currentStep,
          isSubmitting,
          goToNextStep,
          goToPreviousStep,
          handleSubmit,
          AREA_OPTIONS,
          LANGUAGE_OPTIONS
        }} />}
      </form>
    </div>
  );
};

// 別ファイルから直接インポートするため、ここでは循環インポートを避けて型だけ定義
type AttenderApplicationFormPart3Props = Omit<AttenderApplicationFormPart2Props, 'error' | 'removePhoto' | 'SPECIALTY_CATEGORIES'>;

// フォームの残りの部分を表示するコンポーネント（実際の実装はAttenderApplicationFormPart3.tsxで行う）
const AttenderApplicationFormPart3: React.FC<AttenderApplicationFormPart3Props> = (props) => {
  // 実際の実装はAttenderApplicationFormPart3.tsxファイルで行う
  return props.currentStep === 2 ? (
    <div>
      <h2 className="text-xl font-bold mb-6">2. 活動詳細</h2>
      {/* ダミー要素：実際の実装はAttenderApplicationFormPart3.tsxで行う */}
    </div>
  ) : (
    <div>
      <h2 className="text-xl font-bold mb-6">3. 身分確認・安全対策</h2>
      {/* ダミー要素：実際の実装はAttenderApplicationFormPart3.tsxで行う */}
    </div>
  );
};
