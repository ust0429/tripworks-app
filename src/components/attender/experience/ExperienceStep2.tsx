import React from 'react';
import { Trash2, Plus } from 'lucide-react';
import { ExperienceFormData, ExperienceFormHelpers } from './ExperienceFormTypes';

interface ExperienceStep2Props {
  formData: ExperienceFormData;
  helpers: ExperienceFormHelpers;
}

export const ExperienceStep2: React.FC<ExperienceStep2Props> = ({ formData, helpers }) => {
  const {
    handleInputChange,
    handleListItemChange,
    addListItem,
    removeListItem,
    handleItineraryChange,
    addItineraryItem,
    removeItineraryItem,
    goToNextStep,
    goToPreviousStep
  } = helpers;

  return (
    <div>
      <h2 className="text-xl font-bold mb-6">2. 詳細情報</h2>
      
      {/* 所要時間 */}
      <div className="mb-6">
        <label className="block mb-2 font-medium">
          所要時間 <span className="text-red-600">*</span>
        </label>
        <div className="flex items-center">
          <input
            type="number"
            name="duration"
            value={formData.duration}
            onChange={handleInputChange}
            className="w-24 p-3 border border-gray-300 rounded-lg"
            min="0.5"
            max="8"
            step="0.5"
            required
          />
          <span className="ml-2">時間</span>
        </div>
        <p className="text-sm text-gray-500 mt-1">
          0.5時間単位で設定できます。最大8時間まで。
        </p>
      </div>
      
      {/* 最大人数 */}
      <div className="mb-6">
        <label className="block mb-2 font-medium">
          最大参加人数 <span className="text-red-600">*</span>
        </label>
        <div className="flex items-center">
          <input
            type="number"
            name="capacity"
            value={formData.capacity}
            onChange={handleInputChange}
            className="w-24 p-3 border border-gray-300 rounded-lg"
            min="1"
            max="20"
            step="1"
            required
          />
          <span className="ml-2">人</span>
        </div>
        <p className="text-sm text-gray-500 mt-1">
          1〜20人まで設定できます。
        </p>
      </div>
      
      {/* 料金 */}
      <div className="mb-6">
        <label className="block mb-2 font-medium">
          料金（1人あたり） <span className="text-red-600">*</span>
        </label>
        <div className="flex items-center">
          <span className="mr-2">¥</span>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleInputChange}
            className="w-40 p-3 border border-gray-300 rounded-lg"
            min="1000"
            step="100"
            required
          />
        </div>
        <p className="text-sm text-gray-500 mt-1">
          最低1,000円から設定できます。100円単位で設定してください。
        </p>
      </div>
      
      {/* 場所 */}
      <div className="mb-6">
        <label className="block mb-2 font-medium">
          場所 <span className="text-red-600">*</span>
        </label>
        <input
          type="text"
          name="location"
          value={formData.location}
          onChange={handleInputChange}
          className="w-full p-3 border border-gray-300 rounded-lg"
          placeholder="例: 東京都港区南青山"
          required
        />
        <p className="text-sm text-gray-500 mt-1">
          体験が行われる場所の地域名を入力してください。
        </p>
      </div>
      
      {/* 集合場所 */}
      <div className="mb-6">
        <label className="block mb-2 font-medium">
          集合場所 <span className="text-red-600">*</span>
        </label>
        <input
          type="text"
          name="meetingPoint"
          value={formData.meetingPoint}
          onChange={handleInputChange}
          className="w-full p-3 border border-gray-300 rounded-lg"
          placeholder="例: 表参道駅A2出口前"
          required
        />
        <p className="text-sm text-gray-500 mt-1">
          参加者と待ち合わせる正確な場所を入力してください。
        </p>
      </div>
      
      {/* 含まれるもの */}
      <div className="mb-6">
        <label className="block mb-2 font-medium">
          体験に含まれるもの
        </label>
        <div className="space-y-3">
          {formData.includedItems.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                type="text"
                value={item}
                onChange={(e) => handleListItemChange('includedItems', index, e.target.value)}
                className="flex-1 p-3 border border-gray-300 rounded-lg"
                placeholder="例: ワークショップ材料費、ドリンク1杯"
              />
              <button
                type="button"
                onClick={() => removeListItem('includedItems', index)}
                className="p-2 text-gray-500 hover:text-red-500"
              >
                <Trash2 size={20} />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => addListItem('includedItems')}
            className="flex items-center gap-1 text-gray-600 hover:text-black"
          >
            <Plus size={18} />
            <span>追加</span>
          </button>
        </div>
        <p className="text-sm text-gray-500 mt-1">
          料金に含まれるものを入力してください。
        </p>
      </div>
      
      {/* 持ち物 */}
      <div className="mb-6">
        <label className="block mb-2 font-medium">
          参加者が持参するもの
        </label>
        <div className="space-y-3">
          {formData.whatToBring.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                type="text"
                value={item}
                onChange={(e) => handleListItemChange('whatToBring', index, e.target.value)}
                className="flex-1 p-3 border border-gray-300 rounded-lg"
                placeholder="例: 動きやすい服装、タオル"
              />
              <button
                type="button"
                onClick={() => removeListItem('whatToBring', index)}
                className="p-2 text-gray-500 hover:text-red-500"
              >
                <Trash2 size={20} />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => addListItem('whatToBring')}
            className="flex items-center gap-1 text-gray-600 hover:text-black"
          >
            <Plus size={18} />
            <span>追加</span>
          </button>
        </div>
        <p className="text-sm text-gray-500 mt-1">
          参加者が持参する必要があるものを入力してください。
        </p>
      </div>
      
      {/* 行程 */}
      <div className="mb-6">
        <label className="block mb-2 font-medium">
          体験の行程 <span className="text-red-600">*</span>
        </label>
        <div className="space-y-6">
          {formData.itinerary.map((item, index) => (
            <div key={index} className="p-4 border border-gray-200 rounded-lg">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-medium">ステップ {index + 1}</h3>
                {formData.itinerary.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItineraryItem(index)}
                    className="p-1 text-gray-500 hover:text-red-500"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block mb-1 text-sm">タイトル</label>
                  <input
                    type="text"
                    value={item.title}
                    onChange={(e) => handleItineraryChange(index, 'title', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    placeholder="例: 工房見学"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm">説明</label>
                  <textarea
                    value={item.description}
                    onChange={(e) => handleItineraryChange(index, 'description', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    rows={2}
                    placeholder="例: 陶芸家の工房を見学し、作品制作の過程について説明します。"
                  ></textarea>
                </div>
                <div>
                  <label className="block mb-1 text-sm">所要時間（分）</label>
                  <input
                    type="number"
                    value={item.duration}
                    onChange={(e) => handleItineraryChange(index, 'duration', e.target.value)}
                    className="w-20 p-2 border border-gray-300 rounded-lg"
                    min="5"
                    step="5"
                  />
                </div>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={addItineraryItem}
            className="flex items-center gap-1 text-gray-600 hover:text-black"
          >
            <Plus size={18} />
            <span>行程を追加</span>
          </button>
        </div>
      </div>
      
      {/* 特別な条件 */}
      <div className="mb-6">
        <label className="block mb-2 font-medium">
          特別な条件や注意事項
        </label>
        <textarea
          name="specialRequirements"
          value={formData.specialRequirements}
          onChange={handleInputChange}
          className="w-full p-3 border border-gray-300 rounded-lg"
          rows={3}
          placeholder="例: 未成年者は保護者同伴が必要です。アレルギーをお持ちの方は事前にお知らせください。"
        ></textarea>
        <p className="text-sm text-gray-500 mt-1">
          参加者が知っておくべき条件や注意事項があれば入力してください。
        </p>
      </div>
      
      {/* キャンセルポリシー */}
      <div className="mb-6">
        <label className="block mb-2 font-medium">
          キャンセルポリシー <span className="text-red-600">*</span>
        </label>
        <div className="space-y-2">
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              name="cancellationPolicy"
              value="flexible"
              checked={formData.cancellationPolicy === 'flexible'}
              onChange={handleInputChange}
              className="rounded-full border-gray-300 text-black focus:ring-black"
            />
            <div>
              <span className="font-medium">柔軟</span>
              <p className="text-sm text-gray-500">体験開始24時間前までのキャンセルで全額返金</p>
            </div>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              name="cancellationPolicy"
              value="moderate"
              checked={formData.cancellationPolicy === 'moderate'}
              onChange={handleInputChange}
              className="rounded-full border-gray-300 text-black focus:ring-black"
            />
            <div>
              <span className="font-medium">標準</span>
              <p className="text-sm text-gray-500">体験開始3日前までのキャンセルで全額返金</p>
            </div>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              name="cancellationPolicy"
              value="strict"
              checked={formData.cancellationPolicy === 'strict'}
              onChange={handleInputChange}
              className="rounded-full border-gray-300 text-black focus:ring-black"
            />
            <div>
              <span className="font-medium">厳格</span>
              <p className="text-sm text-gray-500">体験開始7日前までのキャンセルで全額返金</p>
            </div>
          </label>
        </div>
      </div>
      
      {/* ナビゲーションボタン */}
      <div className="flex justify-between mt-8">
        <button
          type="button"
          onClick={goToPreviousStep}
          className="bg-gray-200 text-gray-800 py-3 px-8 rounded-lg font-medium hover:bg-gray-300 transition-colors"
        >
          戻る
        </button>
        <button
          type="button"
          onClick={goToNextStep}
          className="bg-black text-white py-3 px-8 rounded-lg font-medium hover:bg-gray-900 transition-colors"
        >
          次へ
        </button>
      </div>
    </div>
  );
};