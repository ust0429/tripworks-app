/**
 * 体験サンプルステップ
 * 
 * アテンダー申請フォームの体験サンプルを入力するステップ
 */
import React, { useState } from 'react';
import { useAttenderApplication } from '../../../../contexts/AttenderApplicationContext';
import { ExperienceSample } from '../../../../types/attender/index';

interface ExperienceSamplesStepProps {
  onNext: () => void;
  onBack: () => void;
}

const ExperienceSamplesStep: React.FC<ExperienceSamplesStepProps> = ({ onNext, onBack }) => {
  const { 
    formData, 
    addExperienceSample,
    updateExperienceSample,
    removeExperienceSample,
    errors, 
    clearError 
  } = useAttenderApplication();
  
  // 体験カテゴリリスト
  const experienceCategories = [
    'ローカルツアー',
    'アートワークショップ',
    '料理体験',
    '伝統文化体験',
    'アウトドアアクティビティ',
    '音楽・ライブ体験',
    'ナイトライフツアー',
    'クラフト体験',
    '古着・骨董めぐり',
    '街歩き',
    '撮影スポットめぐり',
    'その他'
  ];
  
  // 新規体験サンプルの状態
  const [newSample, setNewSample] = useState<ExperienceSample>({
    title: '',
    description: '',
    category: '',
    estimatedDuration: 120, // デフォルト2時間
    maxParticipants: 4, // デフォルト4人
    pricePerPerson: 5000, // デフォルト5000円
    includesFood: false,
    includesTransportation: false,
    cancellationPolicy: 'moderate'
  } as ExperienceSample);
  
  // 編集モードの状態
  const [editIndex, setEditIndex] = useState<number | null>(null);
  
  // 入力変更ハンドラ
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    // チェックボックスの処理
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setNewSample(prev => ({
        ...prev,
        [name]: checked
      }));
    }
    // 数値フィールドの処理
    else if (type === 'number') {
      setNewSample(prev => ({
        ...prev,
        [name]: parseFloat(value) || 0
      }));
    }
    // その他のフィールド
    else {
      setNewSample(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  // 体験サンプルの追加ハンドラ
  const handleAddSample = () => {
    if (
      newSample.title &&
      newSample.description &&
      newSample.category
    ) {
      if (editIndex !== null) {
        // 編集モードの場合は更新
        updateExperienceSample(editIndex, newSample);
        setEditIndex(null);
      } else {
        // 新規追加
        addExperienceSample(newSample);
      }
      
      // フォームをリセット
      setNewSample({
        title: '',
        description: '',
        category: '',
        estimatedDuration: 120,
        maxParticipants: 4,
        pricePerPerson: 5000,
        includesFood: false,
        includesTransportation: false,
        cancellationPolicy: 'moderate'
      } as ExperienceSample);
      
      // エラーをクリア
      clearError('experienceSamples');
    }
  };
  
  // 体験サンプルの編集ハンドラ
  const handleEditSample = (index: number) => {
    const sample = formData.experienceSamples?.[index];
    if (sample) {
      setNewSample(sample);
      setEditIndex(index);
    }
  };
  
  // 体験サンプルの削除ハンドラ
  const handleRemoveSample = (index: number) => {
    removeExperienceSample(index);
    
    // 編集中のサンプルが削除された場合、編集モードをキャンセル
    if (editIndex === index) {
      setEditIndex(null);
      setNewSample({
        title: '',
        description: '',
        category: '',
        estimatedDuration: 120,
        maxParticipants: 4,
        pricePerPerson: 5000,
        includesFood: false,
        includesTransportation: false,
        cancellationPolicy: 'moderate'
      } as ExperienceSample);
    }
  };
  
  // キャンセルハンドラ（編集モード終了）
  const handleCancelEdit = () => {
    setEditIndex(null);
    setNewSample({
      title: '',
      description: '',
      category: '',
      estimatedDuration: 120,
      maxParticipants: 4,
      pricePerPerson: 5000,
      includesFood: false,
      includesTransportation: false,
      cancellationPolicy: 'moderate'
    });
  };
  
  return (
    <div className="space-y-8">
      <h2 className="text-xl font-semibold mb-4">体験サンプル</h2>
      <p className="text-sm text-gray-500">
        あなたが提供できる体験の例を少なくとも1つ入力してください。これはユーザーに表示される実際の体験とは異なる場合がありますが、
        あなたのスキルや専門知識を審査するために使用されます。
      </p>
      
      {/* 登録済み体験サンプルのリスト */}
      {(formData.experienceSamples || []).length > 0 && (
        <div className="mb-6 space-y-4">
          <h3 className="text-lg font-medium text-gray-700">登録済み体験サンプル</h3>
          {(formData.experienceSamples || []).map((sample, index) => (
            <div key={index} className="bg-gray-50 p-4 rounded-md relative">
              <div className="absolute top-2 right-2 flex space-x-2">
                <button
                  type="button"
                  onClick={() => handleEditSample(index)}
                  className="text-blue-500 hover:text-blue-600"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => handleRemoveSample(index)}
                  className="text-red-500 hover:text-red-600"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
              
              <h4 className="font-semibold text-lg mb-1">{sample.title}</h4>
              <p className="text-sm text-blue-600 mb-2">{sample.category}</p>
              <p className="text-sm text-gray-700 mb-3">{sample.description}</p>
              
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <div>
                  <span className="font-medium">所要時間:</span> {sample.estimatedDuration}分
                </div>
                <div>
                  <span className="font-medium">最大参加人数:</span> {sample.maxParticipants}人
                </div>
                <div>
                  <span className="font-medium">料金:</span> {sample.pricePerPerson.toLocaleString()}円/人
                </div>
                <div>
                  <span className="font-medium">キャンセルポリシー:</span>{' '}
                  {sample.cancellationPolicy === 'flexible' ? '柔軟' : 
                   sample.cancellationPolicy === 'moderate' ? '標準' : '厳格'}
                </div>
              </div>
              
              <div className="mt-3 flex flex-wrap gap-2">
                {sample.includesFood && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    食事付き
                  </span>
                )}
                {sample.includesTransportation && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    交通手段付き
                  </span>
                )}
                {sample.specialRequirements && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    特別な要件あり
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* 新規体験サンプルの追加フォーム */}
      <div className="bg-gray-50 p-4 rounded-md">
        <h3 className="text-lg font-medium text-gray-700 mb-4">
          {editIndex !== null ? '体験サンプルを編集' : '体験サンプルを追加'}
        </h3>
        
        {/* タイトル */}
        <div className="mb-4">
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            タイトル <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={newSample.title}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="例：京都の隠れた陶芸工房巡りと手作り体験"
          />
        </div>
        
        {/* カテゴリ */}
        <div className="mb-4">
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
            カテゴリ <span className="text-red-500">*</span>
          </label>
          <select
            id="category"
            name="category"
            value={newSample.category}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">カテゴリを選択してください</option>
            {experienceCategories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
        
        {/* 説明 */}
        <div className="mb-4">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            説明 <span className="text-red-500">*</span>
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            value={newSample.description}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="この体験の内容、特徴、参加者が体験できることについて詳しく説明してください。"
          />
        </div>
        
        {/* 所要時間 */}
        <div className="mb-4">
          <label htmlFor="estimatedDuration" className="block text-sm font-medium text-gray-700 mb-1">
            所要時間（分） <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            id="estimatedDuration"
            name="estimatedDuration"
            min="30"
            step="30"
            value={newSample.estimatedDuration}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
          <p className="mt-1 text-sm text-gray-500">30分単位で入力してください</p>
        </div>
        
        {/* 参加人数 */}
        <div className="mb-4">
          <label htmlFor="maxParticipants" className="block text-sm font-medium text-gray-700 mb-1">
            最大参加人数 <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            id="maxParticipants"
            name="maxParticipants"
            min="1"
            value={newSample.maxParticipants}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        {/* 料金 */}
        <div className="mb-4">
          <label htmlFor="pricePerPerson" className="block text-sm font-medium text-gray-700 mb-1">
            1人あたりの料金（円） <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            id="pricePerPerson"
            name="pricePerPerson"
            min="0"
            step="500"
            value={newSample.pricePerPerson}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        {/* オプション設定 */}
        <div className="mb-4">
          <fieldset>
            <legend className="text-sm font-medium text-gray-700 mb-2">含まれるもの</legend>
            <div className="space-y-2">
              <div className="flex items-center">
                <input
                  id="includesFood"
                  name="includesFood"
                  type="checkbox"
                  checked={newSample.includesFood}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="includesFood" className="ml-2 block text-sm text-gray-700">
                  食事が含まれる
                </label>
              </div>
              <div className="flex items-center">
                <input
                  id="includesTransportation"
                  name="includesTransportation"
                  type="checkbox"
                  checked={newSample.includesTransportation}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="includesTransportation" className="ml-2 block text-sm text-gray-700">
                  交通手段が含まれる
                </label>
              </div>
            </div>
          </fieldset>
        </div>
        
        {/* 特別な要件 */}
        <div className="mb-4">
          <label htmlFor="specialRequirements" className="block text-sm font-medium text-gray-700 mb-1">
            特別な要件（任意）
          </label>
          <textarea
            id="specialRequirements"
            name="specialRequirements"
            rows={2}
            value={newSample.specialRequirements || ''}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="参加者に必要なもの、年齢制限、アレルギー情報など"
          />
        </div>
        
        {/* キャンセルポリシー */}
        <div className="mb-4">
          <label htmlFor="cancellationPolicy" className="block text-sm font-medium text-gray-700 mb-1">
            キャンセルポリシー <span className="text-red-500">*</span>
          </label>
          <select
            id="cancellationPolicy"
            name="cancellationPolicy"
            value={newSample.cancellationPolicy}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="flexible">柔軟（24時間前まで全額返金）</option>
            <option value="moderate">標準（3日前まで全額返金）</option>
            <option value="strict">厳格（7日前まで全額返金）</option>
          </select>
        </div>
        
        {/* ボタン */}
        <div className="mt-6 flex justify-end space-x-3">
          {editIndex !== null && (
            <button
              type="button"
              onClick={handleCancelEdit}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              キャンセル
            </button>
          )}
          <button
            type="button"
            onClick={handleAddSample}
            disabled={!newSample.title || !newSample.description || !newSample.category}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-300 disabled:cursor-not-allowed"
          >
            {editIndex !== null ? '更新する' : '追加する'}
          </button>
        </div>
      </div>
      
      {errors.experienceSamples && (
        <p className="mt-2 text-sm text-red-500">{errors.experienceSamples}</p>
      )}
    </div>
  );
};

export default ExperienceSamplesStep;
