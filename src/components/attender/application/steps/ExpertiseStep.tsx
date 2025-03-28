/**
 * 専門分野と言語ステップ
 * 
 * アテンダー申請フォームの専門分野と言語を入力するステップ
 */
import React, { useState } from 'react';
import { useAttenderApplication } from '../../../../contexts/AttenderApplicationContext';
import { ExpertiseArea, LanguageSkill } from '../../../../types/attender/index';

interface ExpertiseStepProps {
  onNext: () => void;
  onBack: () => void;
}

const ExpertiseStep: React.FC<ExpertiseStepProps> = ({ onNext, onBack }) => {
  const { 
    formData, 
    updateFormData, 
    addExpertise,
    updateExpertise,
    removeExpertise,
    errors, 
    clearError,
    updateSocialMediaLinks 
  } = useAttenderApplication();
  
  // カテゴリリスト（実際の実装ではより多くのカテゴリが必要）
  const categories = [
    '伝統工芸',
    '音楽',
    'アート',
    '料理',
    'アウトドア',
    '歴史',
    '寺社仏閣',
    'サブカルチャー',
    'ファッション',
    '建築',
    '自然',
    'ローカルフード',
    'ナイトライフ',
    'スポーツ',
    'テクノロジー',
    'その他'
  ];
  
  // サブカテゴリ（実際の実装ではカテゴリに紐づいたサブカテゴリが必要）
  const getSubcategories = (category: string): string[] => {
    switch (category) {
      case '伝統工芸':
        return ['陶芸', '染織', '漆芸', '金工', '木工', '和紙', '京焼・清水焼', 'その他'];
      case '音楽':
        return ['クラシック', 'ジャズ', 'ロック', 'ポップス', 'インディーズ', '民族音楽', 'その他'];
      case 'アート':
        return ['現代アート', '絵画', '彫刻', '写真', 'デジタルアート', 'ストリートアート', 'その他'];
      case 'サブカルチャー':
        return ['アニメ', 'マンガ', 'コスプレ', 'ゲーム', 'アイドル', '同人文化', 'その他'];
      default:
        return ['その他'];
    }
  };
  
  // 言語リスト
  const languages = [
    { code: 'ja', name: '日本語' },
    { code: 'en', name: '英語' },
    { code: 'zh-CN', name: '中国語（簡体字）' },
    { code: 'zh-TW', name: '中国語（繁体字）' },
    { code: 'ko', name: '韓国語' },
    { code: 'fr', name: 'フランス語' },
    { code: 'de', name: 'ドイツ語' },
    { code: 'es', name: 'スペイン語' },
    { code: 'it', name: 'イタリア語' },
    { code: 'ru', name: 'ロシア語' },
    { code: 'pt', name: 'ポルトガル語' },
    { code: 'th', name: 'タイ語' }
  ];
  
  // 言語コードの型を定義
  type LanguageCode = string;
  
  // 新規専門分野の状態
  const [newExpertise, setNewExpertise] = useState<ExpertiseArea & { certifications?: string[] }>({
    category: '',
    subcategories: [],
    yearsOfExperience: 0,
    description: '',
    certifications: []
  });
  
  // 新規認定資格の状態
  const [newCertification, setNewCertification] = useState('');
  
  // 専門分野の変更ハンドラ
  const handleExpertiseChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // 数値フィールドの処理
    if (name === 'yearsOfExperience') {
      setNewExpertise(prev => ({
        ...prev,
        [name]: parseFloat(value) || 0
      }));
    } else {
      setNewExpertise(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  // サブカテゴリの選択変更ハンドラ
  const handleSubcategoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    
    setNewExpertise(prev => {
      // subcategoriesが存在しない場合は空配列を使用
      const currentSubcategories = prev.subcategories || [];
      const updatedSubcategories = checked
        ? [...currentSubcategories, value]
        : currentSubcategories.filter(item => item !== value);
      
      return {
        ...prev,
        subcategories: updatedSubcategories
      };
    });
  };
  
  // 新規認定資格の追加ハンドラ
  const handleAddCertification = () => {
    if (newCertification.trim()) {
      setNewExpertise(prev => ({
        ...prev,
        certifications: [...(prev.certifications || []), newCertification.trim()]
      }));
      setNewCertification('');
    }
  };
  
  // 認定資格の削除ハンドラ
  const handleRemoveCertification = (index: number) => {
    setNewExpertise(prev => {
      const updatedCertifications = [...(prev.certifications || [])];
      updatedCertifications.splice(index, 1);
      return {
        ...prev,
        certifications: updatedCertifications
      };
    });
  };
  
  // 専門分野の追加ハンドラ
  const handleAddExpertise = () => {
    if (
    newExpertise.category &&
    newExpertise.subcategories && 
    newExpertise.subcategories.length > 0 &&
      newExpertise.description
    ) {
      addExpertise(newExpertise);
      // フォームをリセット
      setNewExpertise({
        category: '',
        subcategories: [],
        yearsOfExperience: 0,
        description: '',
        certifications: []
      });
      
      // エラーをクリア
      clearError('expertise');
    }
  };
  
  // 専門分野の編集ハンドラ
  const handleEditExpertise = (index: number) => {
    const expertise = formData.expertise?.[index];
    if (expertise) {
      setNewExpertise(expertise);
      removeExpertise(index);
      clearError('expertise');
    }
  };
  
  // 専門分野の変更ハンドラ
  const handleUpdateExpertise = (index: number, updatedExpertise: ExpertiseArea) => {
    updateExpertise(index, updatedExpertise);
    clearError(`expertise[${index}]`);
  };
  
  // 専門分野の削除ハンドラ
  const handleRemoveExpertise = (index: number) => {
    removeExpertise(index);
  };
  
  // SNSリンクの更新
  const handleSocialMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    updateSocialMediaLinks({ [name]: value });
  };

  // 言語の選択変更ハンドラ
  const handleLanguageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    const langCode = value; // 選択された言語コード
    
    updateFormData({
      languages: checked
        ? [...(formData.languages || []), { language: langCode, proficiency: 'intermediate' }] // 新しい言語を追加
        : (formData.languages || []).filter(lang => lang.language !== langCode) // 言語コードでフィルタリング
    });
    
    clearError('languages');
  };
  
  // 専門分野の選択変更ハンドラ
  const handleSpecialtyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    
    updateFormData({
      specialties: checked
        ? [...(formData.specialties || []), value]
        : (formData.specialties || []).filter(specialty => specialty !== value)
    });
    
    clearError('specialties');
  };
  
  return (
    <div className="space-y-8">
      <h2 className="text-xl font-semibold mb-4">専門分野と言語</h2>
      
      {/* 専門分野（タグ選択） */}
      <div>
        <fieldset>
          <legend className="text-base font-medium text-gray-700 mb-2">
            専門分野 <span className="text-red-500">*</span>
          </legend>
          <p className="text-sm text-gray-500 mb-3">
            あなたが案内できる分野を選択してください（複数選択可）
          </p>
          <div className="mt-1 flex flex-wrap gap-2">
            {categories.map(category => (
              <div key={category} className="flex items-center">
                <input
                  id={`specialty-${category}`}
                  name="specialties"
                  type="checkbox"
                  value={category}
                  checked={(formData.specialties || []).includes(category)}
                  onChange={handleSpecialtyChange}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label
                  htmlFor={`specialty-${category}`}
                  className="ml-2 mr-4 text-sm font-medium text-gray-700"
                >
                  {category}
                </label>
              </div>
            ))}
          </div>
          {errors.specialties && (
            <p className="mt-1 text-sm text-red-500">{errors.specialties}</p>
          )}
        </fieldset>
      </div>
      
      {/* 言語スキル */}
      <div>
        <fieldset>
          <legend className="text-base font-medium text-gray-700 mb-2">
            言語スキル <span className="text-red-500">*</span>
          </legend>
          <p className="text-sm text-gray-500 mb-3">
            案内可能な言語を選択してください（複数選択可）
          </p>
          <div className="mt-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {languages.map(language => (
              <div key={language.code} className="flex items-center">
                <input
                  id={`language-${language.code}`}
                  name="languages"
                  type="checkbox"
                  value={language.code}
                  checked={(formData.languages || []).some(lang => lang.language === language.code)}
                  onChange={handleLanguageChange}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label
                  htmlFor={`language-${language.code}`}
                  className="ml-2 text-sm font-medium text-gray-700"
                >
                  {language.name}
                </label>
              </div>
            ))}
          </div>
          {errors.languages && (
            <p className="mt-1 text-sm text-red-500">{errors.languages}</p>
          )}
        </fieldset>
      </div>
      
      {/* 専門知識リスト */}
      <div>
        <h3 className="text-lg font-medium text-gray-700 mb-2">
          専門知識 <span className="text-red-500">*</span>
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          あなたが深い知識や経験を持つ専門分野について詳しく教えてください
        </p>
        
        {/* 登録済み専門知識のリスト */}
        {Array.isArray(formData.expertise) && formData.expertise.length > 0 && (
          <div className="mb-6 space-y-4">
            <h4 className="text-md font-medium text-gray-700">登録済み専門知識</h4>
            {Array.isArray(formData.expertise) && formData.expertise.map((expertise, index) => (
              <div key={index} className="bg-gray-50 p-4 rounded-md relative">
                <div className="absolute top-2 right-2 flex space-x-2">
                  <button
                    type="button"
                    onClick={() => handleEditExpertise(index)}
                    className="text-blue-500 hover:text-blue-600"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveExpertise(index)}
                    className="text-red-500 hover:text-red-600"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
                <p className="font-semibold">{expertise.category}</p>
                <p className="text-sm text-gray-600">
                  {expertise.subcategories ? expertise.subcategories.join(', ') : ''}
                </p>
                <p className="text-sm">
                  <span className="font-medium">経験年数:</span> {expertise.yearsOfExperience}年
                </p>
                <p className="text-sm mt-2">{expertise.description}</p>
                {expertise.certifications && expertise.certifications.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm font-medium">認定資格:</p>
                    <ul className="list-disc list-inside text-sm text-gray-600 pl-2">
                      {expertise.certifications.map((cert, i) => (
                        <li key={i}>{cert}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        
        {/* 新規専門知識の追加フォーム */}
        <div className="bg-gray-50 p-4 rounded-md">
          <h4 className="text-md font-medium text-gray-700 mb-4">専門知識を追加</h4>
          
          {/* カテゴリ選択 */}
          <div className="mb-4">
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              カテゴリ <span className="text-red-500">*</span>
            </label>
            <select
              id="category"
              name="category"
              value={newExpertise.category}
              onChange={handleExpertiseChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">カテゴリを選択してください</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          
          {/* サブカテゴリ選択（カテゴリが選択されている場合のみ表示） */}
          {newExpertise.category && (
            <div className="mb-4">
              <fieldset>
                <legend className="block text-sm font-medium text-gray-700 mb-1">
                  サブカテゴリ <span className="text-red-500">*</span>
                </legend>
                <div className="mt-1 grid grid-cols-2 gap-2">
                  {getSubcategories(newExpertise.category).map(subcategory => (
                    <div key={subcategory} className="flex items-center">
                      <input
                        id={`subcategory-${subcategory}`}
                        name="subcategories"
                        type="checkbox"
                        value={subcategory}
                        checked={newExpertise.subcategories ? newExpertise.subcategories.includes(subcategory) : false}
                        onChange={handleSubcategoryChange}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label
                        htmlFor={`subcategory-${subcategory}`}
                        className="ml-2 text-sm font-medium text-gray-700"
                      >
                        {subcategory}
                      </label>
                    </div>
                  ))}
                </div>
              </fieldset>
            </div>
          )}
          
          {/* 経験年数 */}
          <div className="mb-4">
            <label htmlFor="yearsOfExperience" className="block text-sm font-medium text-gray-700 mb-1">
              経験年数 <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="yearsOfExperience"
              name="yearsOfExperience"
              min="0"
              step="0.5"
              value={newExpertise.yearsOfExperience}
              onChange={handleExpertiseChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="例：5"
            />
          </div>
          
          {/* 説明 */}
          <div className="mb-4">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              説明 <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              value={newExpertise.description}
              onChange={handleExpertiseChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="この分野でのあなたの経験や知識について詳しく説明してください"
            />
          </div>
          
          {/* 認定資格（オプション） */}
          <div className="mb-4">
            <label htmlFor="certifications" className="block text-sm font-medium text-gray-700 mb-1">
              認定資格（任意）
            </label>
            <div className="flex">
              <input
                type="text"
                id="certifications"
                value={newCertification}
                onChange={(e) => setNewCertification(e.target.value)}
                className="flex-grow px-3 py-2 border border-gray-300 rounded-l-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="例：京都観光文化検定1級"
              />
              <button
                type="button"
                onClick={handleAddCertification}
                className="px-4 py-2 bg-blue-500 text-white rounded-r-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                追加
              </button>
            </div>
            
            {/* 追加された認定資格のリスト */}
            {newExpertise.certifications && newExpertise.certifications.length > 0 && (
              <div className="mt-2">
                <ul className="space-y-1">
                  {newExpertise.certifications.map((cert, index) => (
                    <li key={index} className="flex items-center justify-between bg-gray-100 px-3 py-1 rounded-md">
                      <span className="text-sm">{cert}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveCertification(index)}
                        className="text-red-500 hover:text-red-600"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          
          {/* 追加ボタン */}
          <div className="mt-4">
            <button
              type="button"
              onClick={handleAddExpertise}
              disabled={!newExpertise.category || !newExpertise.subcategories || newExpertise.subcategories.length === 0 || !newExpertise.description}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-300 disabled:cursor-not-allowed"
            >
              専門知識を追加
            </button>
          </div>
        </div>
        
        {errors.expertise && (
          <p className="mt-2 text-sm text-red-500">{errors.expertise}</p>
        )}
      </div>
      
      {/* SNSリンク */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <h3 className="text-lg font-medium mb-4">SNSリンク（任意）</h3>
        <p className="text-sm text-gray-500 mb-4">
          あなたのSNSアカウントやウェブサイトを共有することで、ゲストにあなたの活動や提供する体験についてより詳しく知ってもらうことができます。
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Instagram */}
          <div>
            <label htmlFor="instagram" className="block text-sm font-medium text-gray-700 mb-1">
              Instagram
            </label>
            <input
              type="text"
              id="instagram"
              name="instagram"
              value={formData.socialMediaLinks?.instagram || ''}
              onChange={(e) => handleSocialMediaChange(e)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="https://instagram.com/username"
            />
          </div>
          
          {/* Twitter */}
          <div>
            <label htmlFor="twitter" className="block text-sm font-medium text-gray-700 mb-1">
              Twitter
            </label>
            <input
              type="text"
              id="twitter"
              name="twitter"
              value={formData.socialMediaLinks?.twitter || ''}
              onChange={(e) => handleSocialMediaChange(e)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="https://twitter.com/username"
            />
          </div>
          
          {/* YouTube */}
          <div>
            <label htmlFor="youtube" className="block text-sm font-medium text-gray-700 mb-1">
              YouTube
            </label>
            <input
              type="text"
              id="youtube"
              name="youtube"
              value={formData.socialMediaLinks?.youtube || ''}
              onChange={(e) => handleSocialMediaChange(e)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="https://youtube.com/channel/xyz"
            />
          </div>
          
          {/* TikTok */}
          <div>
            <label htmlFor="tiktok" className="block text-sm font-medium text-gray-700 mb-1">
              TikTok
            </label>
            <input
              type="text"
              id="tiktok"
              name="tiktok"
              value={formData.socialMediaLinks?.tiktok || ''}
              onChange={(e) => handleSocialMediaChange(e)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="https://tiktok.com/@username"
            />
          </div>
          
          {/* Facebook */}
          <div>
            <label htmlFor="facebook" className="block text-sm font-medium text-gray-700 mb-1">
              Facebook
            </label>
            <input
              type="text"
              id="facebook"
              name="facebook"
              value={formData.socialMediaLinks?.facebook || ''}
              onChange={(e) => handleSocialMediaChange(e)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="https://facebook.com/username"
            />
          </div>
          
          {/* ウェブサイト */}
          <div>
            <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1">
              ウェブサイト
            </label>
            <input
              type="text"
              id="website"
              name="website"
              value={formData.socialMediaLinks?.website || ''}
              onChange={(e) => handleSocialMediaChange(e)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="https://yourwebsite.com"
            />
          </div>
          
          {/* ブログ */}
          <div>
            <label htmlFor="blog" className="block text-sm font-medium text-gray-700 mb-1">
              ブログ
            </label>
            <input
              type="text"
              id="blog"
              name="blog"
              value={formData.socialMediaLinks?.blog || ''}
              onChange={(e) => handleSocialMediaChange(e)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="https://yourblog.com"
            />
          </div>
        </div>
      </div>

      {/* ナビゲーションボタン */}
      <div className="flex justify-between pt-6">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          前へ
        </button>
        <button
          type="button"
          onClick={onNext}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          disabled={!formData.specialties?.length || !formData.languages?.length || !Array.isArray(formData.expertise) || formData.expertise.length === 0}
        >
          次へ
        </button>
      </div>
    </div>
  );
};

export default ExpertiseStep;
