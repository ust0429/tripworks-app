import React from 'react';
import { ExperienceFormData, ExperienceFormHelpers, EXPERIENCE_CATEGORIES } from './ExperienceFormTypes';

interface ExperienceStep1Props {
  formData: ExperienceFormData;
  helpers: ExperienceFormHelpers;
}

export const ExperienceStep1: React.FC<ExperienceStep1Props> = ({ formData, helpers }) => {
  const { handleInputChange, goToNextStep } = helpers;

  return (
    <div>
      <h2 className="text-xl font-bold mb-6">1. 基本情報</h2>
      
      {/* タイトル */}
      <div className="mb-6">
        <label className="block mb-2 font-medium">
          体験タイトル <span className="text-red-600">*</span>
        </label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleInputChange}
          className="w-full p-3 border border-gray-300 rounded-lg"
          placeholder="例: 陶芸家と巡る裏路地の工房ツアー"
          required
        />
        <p className="text-sm text-gray-500 mt-1">
          魅力的で簡潔なタイトルを入力してください。
        </p>
      </div>
      
      {/* カテゴリ */}
      <div className="mb-6">
        <label className="block mb-2 font-medium">
          カテゴリ <span className="text-red-600">*</span>
        </label>
        <select
          name="category"
          value={formData.category}
          onChange={handleInputChange}
          className="w-full p-3 border border-gray-300 rounded-lg"
          required
        >
          <option value="">カテゴリを選択してください</option>
          {EXPERIENCE_CATEGORIES.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </div>
      
      {/* 短い説明 */}
      <div className="mb-6">
        <label className="block mb-2 font-medium">
          短い説明 <span className="text-red-600">*</span>
        </label>
        <textarea
          name="shortDescription"
          value={formData.shortDescription}
          onChange={handleInputChange}
          className="w-full p-3 border border-gray-300 rounded-lg"
          rows={2}
          placeholder="一文で体験の魅力を伝えてください"
          maxLength={100}
          required
        ></textarea>
        <p className="text-sm text-gray-500 mt-1">
          最大100文字。検索結果などに表示される簡潔な説明文です。
        </p>
      </div>
      
      {/* 詳細説明 */}
      <div className="mb-6">
        <label className="block mb-2 font-medium">
          詳細説明 <span className="text-red-600">*</span>
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          className="w-full p-3 border border-gray-300 rounded-lg"
          rows={6}
          placeholder="この体験でできること、参加者が得られるもの、あなたならではの特色などを詳しく説明してください。"
          required
        ></textarea>
        <p className="text-sm text-gray-500 mt-1">
          500〜1000文字程度が理想的です。魅力的でわかりやすい説明を心がけましょう。
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
  );
};