import React from 'react';
import { Camera, Calendar, Upload } from 'lucide-react';
import { ExperienceFormData, ExperienceFormHelpers } from './ExperienceFormTypes';

interface ExperienceStep3Props {
  formData: ExperienceFormData;
  helpers: ExperienceFormHelpers;
  isSubmitting: boolean;
}

export const ExperienceStep3: React.FC<ExperienceStep3Props> = ({ formData, helpers, isSubmitting }) => {
  const {
    handlePhotosUpload,
    removePhoto,
    handleDateChange,
    handleCheckboxChange,
    goToPreviousStep,
    handleSubmit
  } = helpers;
  
  // 日付ピッカー用の日付生成
  const generateDates = () => {
    const dates: string[] = [];
    const today = new Date();
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }
    
    return dates;
  };
  
  // 日付フォーマット
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      month: 'short',
      day: 'numeric',
      weekday: 'short'
    });
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-6">3. 写真と公開設定</h2>
      
      {/* 体験の写真 */}
      <div className="mb-8">
        <label className="block mb-2 font-medium">
          体験の写真 <span className="text-red-600">*</span> (最大5枚)
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
          {formData.photos.map((photo, index) => (
            <div key={index} className="relative">
              <div className="aspect-square rounded-lg overflow-hidden border border-gray-300">
                <img
                  src={URL.createObjectURL(photo)}
                  alt={`体験写真 ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
              <button
                type="button"
                onClick={() => removePhoto(index)}
                className="absolute top-2 right-2 bg-black bg-opacity-70 text-white p-1 rounded-full"
                aria-label="写真を削除"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
          
          {formData.photos.length < 5 && (
            <label className="aspect-square bg-gray-100 border border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50">
              <Camera size={36} className="text-gray-400 mb-2" />
              <p className="text-sm text-gray-500">写真を追加</p>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                multiple
                onChange={handlePhotosUpload}
              />
            </label>
          )}
        </div>
        <p className="text-sm text-gray-500">
          高品質の写真は予約率を上げる効果があります。体験の雰囲気がわかる写真を選びましょう。
        </p>
      </div>
      
      {/* 利用可能日 */}
      <div className="mb-8">
        <label className="block mb-2 font-medium">
          利用可能日 <span className="text-red-600">*</span>
        </label>
        <div className="flex items-center mb-2">
          <Calendar size={18} className="text-gray-500 mr-2" />
          <span className="text-sm text-gray-700">今後30日間の利用可能日を選択してください</span>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-7 gap-2 p-4 border border-gray-300 rounded-lg bg-gray-50">
          {generateDates().map(date => (
            <div
              key={date}
              className={`p-2 text-center rounded cursor-pointer ${
                formData.availableDates.includes(date)
                  ? 'bg-black text-white'
                  : 'bg-white text-gray-800 border border-gray-300 hover:bg-gray-100'
              }`}
              onClick={() => handleDateChange(date)}
            >
              <div className="text-xs">{formatDate(date)}</div>
            </div>
          ))}
        </div>
        <p className="text-sm text-gray-500 mt-2">
          後からいつでも利用可能日を変更できます。
        </p>
      </div>
      
      {/* 公開設定 */}
      <div className="mb-8">
        <h3 className="font-medium mb-4">公開設定</h3>
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-300">
          <label className="flex items-center space-x-2 mb-4">
            <input
              type="checkbox"
              name="isFeatured"
              checked={formData.isFeatured}
              onChange={handleCheckboxChange}
              className="rounded border-gray-300 text-black focus:ring-black"
            />
            <div>
              <span className="font-medium">おすすめに表示を希望</span>
              <p className="text-sm text-gray-500">echoのホーム画面や検索結果の上位に表示されることがあります</p>
            </div>
          </label>
          <p className="text-sm text-gray-600 border-t border-gray-300 pt-3">
            体験プランの公開にあたっては、審査チームによる確認が行われます。
            内容によっては修正をお願いする場合や、公開をお断りする場合があります。
          </p>
        </div>
      </div>
      
      {/* ナビゲーションボタン */}
      <div className="flex flex-col sm:flex-row justify-between mt-8 space-y-3 sm:space-y-0">
        <button
          type="button"
          onClick={goToPreviousStep}
          className="bg-gray-200 text-gray-800 py-3 px-8 rounded-lg font-medium hover:bg-gray-300 transition-colors"
        >
          戻る
        </button>
        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
          <button
            type="button"
            onClick={(e) => handleSubmit(e as any, true)}
            className="bg-white text-black border border-black py-3 px-6 rounded-lg font-medium hover:bg-gray-100 transition-colors"
            disabled={isSubmitting}
          >
            {isSubmitting ? '保存中...' : '下書きとして保存'}
          </button>
          <button
            type="submit"
            className="bg-black text-white py-3 px-6 rounded-lg font-medium hover:bg-gray-900 transition-colors"
            disabled={isSubmitting}
          >
            {isSubmitting ? '送信中...' : '公開申請する'}
          </button>
        </div>
      </div>
    </div>
  );
};