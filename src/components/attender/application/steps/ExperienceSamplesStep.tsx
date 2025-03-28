/**
 * 体験サンプルステップ
 * 
 * アテンダー申請フォームの体験サンプルを入力するステップ
 * TypeScript エラー修正と機能強化を施したバージョン
 */
import React, { useState } from 'react';
import { useAttenderApplication } from '../../../../contexts/AttenderApplicationContext';
import { ExperienceSample } from '../../../../types/attender/index';
import ExperienceImageUploader from '../ExperienceImageUploader';
import { Info, Trash2, Edit2, Plus, ChevronDown, ChevronUp, Clock, Users, DollarSign, AlertTriangle } from 'lucide-react';

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
  
  // 初期サンプル状態
  const initialSampleState: ExperienceSample = {
    title: '',
    description: '',
    category: '',
    estimatedDuration: 120,
    maxParticipants: 4,
    pricePerPerson: 5000,
    includesFood: false,
    includesTransportation: false,
    cancellationPolicy: 'moderate',
    imageUrls: []
  };
  
  // 新規体験サンプルの状態
  const [newSample, setNewSample] = useState<ExperienceSample>({...initialSampleState});
  
  // 編集モードの状態
  const [editIndex, setEditIndex] = useState<number | null>(null);
  
  // 詳細表示状態の追跡
  const [expandedItems, setExpandedItems] = useState<Record<number, boolean>>({});
  
  // 文字数カウント
  const [descriptionCharCount, setDescriptionCharCount] = useState(0);
  
  // バリデーションエラーの状態
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  
  // 項目の展開状態を切り替え
  const toggleExpanded = (index: number) => {
    setExpandedItems(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };
  
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
      
      // バリデーションエラーをクリア
      if (validationErrors[name]) {
        setValidationErrors(prev => {
          const updated = {...prev};
          delete updated[name];
          return updated;
        });
      }
    }
    // 数値フィールドの処理
    else if (type === 'number') {
      setNewSample(prev => ({
        ...prev,
        [name]: parseFloat(value) || 0
      }));
      
      // バリデーションエラーをクリア
      if (validationErrors[name]) {
        setValidationErrors(prev => {
          const updated = {...prev};
          delete updated[name];
          return updated;
        });
      }
    }
    // 説明文の文字数カウント
    else if (name === 'description') {
      setDescriptionCharCount(value.length);
      setNewSample(prev => ({
        ...prev,
        [name]: value
      }));
      
      // バリデーションエラーをクリア
      if (validationErrors[name]) {
        setValidationErrors(prev => {
          const updated = {...prev};
          delete updated[name];
          return updated;
        });
      }
    }
    // その他のフィールド
    else {
      setNewSample(prev => ({
        ...prev,
        [name]: value
      }));
      
      // バリデーションエラーをクリア
      if (validationErrors[name]) {
        setValidationErrors(prev => {
          const updated = {...prev};
          delete updated[name];
          return updated;
        });
      }
    }
  };
  
  // 体験サンプル画像の更新ハンドラ
  const handleImageUpdate = (imageUrls: string[]) => {
    setNewSample(prev => ({
      ...prev,
      imageUrls
    }));
  };
  
  // フォームバリデーション
  const validateSampleForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!newSample.title) {
      errors.title = 'タイトルは必須です';
    } else if (newSample.title.length < 5) {
      errors.title = 'タイトルは5文字以上にしてください';
    }
    
    if (!newSample.description) {
      errors.description = '説明は必須です';
    } else if (newSample.description.length < 50) {
      errors.description = '説明は50文字以上にしてください';
    }
    
    if (!newSample.category) {
      errors.category = 'カテゴリは必須です';
    }
    
    if (!newSample.estimatedDuration || newSample.estimatedDuration < 30) {
      errors.estimatedDuration = '所要時間は30分以上に設定してください';
    }
    
    if (!newSample.maxParticipants || newSample.maxParticipants < 1) {
      errors.maxParticipants = '最大参加人数は1人以上に設定してください';
    }
    
    if ((newSample.pricePerPerson ?? 0) < 0) {
      errors.pricePerPerson = '料金は0円以上に設定してください';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // 体験サンプルの追加ハンドラ
  const handleAddSample = () => {
    if (validateSampleForm()) {
      if (editIndex !== null) {
        // 編集モードの場合は更新
        updateExperienceSample(editIndex, newSample);
        setEditIndex(null);
      } else {
        // 新規追加
        addExperienceSample(newSample);
      }
      
      // フォームをリセット
      setNewSample({...initialSampleState});
      setDescriptionCharCount(0);
      
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
      setDescriptionCharCount(sample.description.length);
      
      // 編集時に自動的にフォームにスクロール
      setTimeout(() => {
        const formElement = document.getElementById('experience-sample-form');
        if (formElement) {
          formElement.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  };
  
  // 体験サンプルの削除ハンドラ
  const handleRemoveSample = (index: number) => {
    // 削除確認
    if (window.confirm('この体験サンプルを削除してもよろしいですか？')) {
      removeExperienceSample(index);
      
      // 編集中のサンプルが削除された場合、編集モードをキャンセル
      if (editIndex === index) {
        setEditIndex(null);
        setNewSample({...initialSampleState});
        setDescriptionCharCount(0);
      }
    }
  };
  
  // キャンセルハンドラ（編集モード終了）
  const handleCancelEdit = () => {
    setEditIndex(null);
    setNewSample({...initialSampleState});
    setDescriptionCharCount(0);
    setValidationErrors({});
  };
  
  // 価格表示のフォーマット
  const formatPrice = (price: number | undefined): string => {
    if (price === undefined) return '0円';
    return price.toLocaleString('ja-JP') + '円';
  };
  
  // 時間表示のフォーマット
  const formatDuration = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes}分`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (remainingMinutes === 0) {
      return `${hours}時間`;
    }
    
    return `${hours}時間${remainingMinutes}分`;
  };
  
  // フォームフィールドのクラス名（バリデーションエラーに応じて）
  const getFieldClassName = (fieldName: string): string => {
    const baseClass = "w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500";
    return validationErrors[fieldName]
      ? `${baseClass} border-red-300 bg-red-50`
      : `${baseClass} border-gray-300`;
  };

  return (
    <div className="space-y-8">
      <h2 className="text-xl font-semibold mb-4">体験サンプル</h2>
      <div className="bg-blue-50 p-4 rounded-md mb-6">
        <div className="flex items-start">
          <Info className="w-5 h-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">体験サンプルとは？</p>
            <p>あなたが提供できる体験の例を少なくとも1つ入力してください。これはユーザーに表示される実際の体験とは異なる場合がありますが、
            あなたのスキルや専門知識を審査するために使用されます。魅力的でユニークな体験案を作成しましょう！</p>
          </div>
        </div>
      </div>
      
      {/* 登録済み体験サンプルのリスト */}
      {(formData.experienceSamples || []).length > 0 && (
        <div className="mb-6 space-y-4">
          <h3 className="text-lg font-medium text-gray-700">登録済み体験サンプル</h3>
          {(formData.experienceSamples || []).map((sample, index) => (
            <div key={index} className="bg-white border border-gray-200 rounded-md shadow-sm overflow-hidden">
              <div className="flex justify-between items-center p-4 cursor-pointer" onClick={() => toggleExpanded(index)}>
                <div className="flex-1">
                  <h4 className="font-semibold text-lg">{sample.title}</h4>
                  <div className="flex items-center text-sm text-gray-600 mt-1">
                    <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs font-medium mr-2">
                      {sample.category}
                    </span>
                    <div className="flex items-center mr-3">
                      <Clock className="w-4 h-4 mr-1 text-gray-400" />
                      {formatDuration(sample.estimatedDuration)}
                    </div>
                    <div className="flex items-center mr-3">
                      <Users className="w-4 h-4 mr-1 text-gray-400" />
                      最大{sample.maxParticipants}人
                    </div>
                    <div className="flex items-center">
                      <DollarSign className="w-4 h-4 mr-1 text-gray-400" />
                      {formatPrice(sample.pricePerPerson)}/人
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditSample(index);
                    }}
                    className="text-blue-500 hover:text-blue-600 p-1"
                    aria-label="編集"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveSample(index);
                    }}
                    className="text-red-500 hover:text-red-600 p-1"
                    aria-label="削除"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                  {expandedItems[index] ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </div>
              
              {expandedItems[index] && (
                <div className="px-4 pb-4 border-t border-gray-100">
                  <div className="mt-3">
                    <p className="text-sm text-gray-700 whitespace-pre-line">{sample.description}</p>
                  </div>
                  
                  {sample.imageUrls && sample.imageUrls.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">画像</p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {sample.imageUrls.map((url, imgIndex) => (
                          <img 
                            key={imgIndex} 
                            src={url} 
                            alt={`${sample.title} サンプル画像 ${imgIndex + 1}`} 
                            className="w-full h-28 object-cover rounded-md"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-700">キャンセルポリシー</p>
                      <p className="text-sm text-gray-600">
                        {sample.cancellationPolicy === 'flexible' ? '柔軟（24時間前まで全額返金）' : 
                         sample.cancellationPolicy === 'moderate' ? '標準（3日前まで全額返金）' : '厳格（7日前まで全額返金）'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">含まれるもの</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {sample.includesFood && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            食事付き
                          </span>
                        )}
                        {sample.includesTransportation && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            交通手段付き
                          </span>
                        )}
                        {!sample.includesFood && !sample.includesTransportation && (
                          <span className="text-sm text-gray-500">特になし</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {sample.specialRequirements && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-700">特別な要件</p>
                      <p className="text-sm text-gray-600">{sample.specialRequirements}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      
      {/* 新規体験サンプルの追加フォーム */}
      <div id="experience-sample-form" className="bg-gray-50 p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          {editIndex !== null ? '体験サンプルを編集' : '新しい体験サンプルを追加'}
          {editIndex !== null && (
            <span className="ml-2 bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs">
              編集モード
            </span>
          )}
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
            className={getFieldClassName('title')}
            placeholder="例：京都の隠れた陶芸工房巡りと手作り体験"
          />
          {validationErrors.title && (
            <p className="mt-1 text-sm text-red-500">{validationErrors.title}</p>
          )}
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
            className={getFieldClassName('category')}
          >
            <option value="">カテゴリを選択してください</option>
            {experienceCategories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          {validationErrors.category && (
            <p className="mt-1 text-sm text-red-500">{validationErrors.category}</p>
          )}
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
            className={getFieldClassName('description')}
            placeholder="この体験の内容、特徴、参加者が体験できることについて詳しく説明してください。"
          />
          <div className="flex justify-between mt-1">
            <p className={`text-xs ${descriptionCharCount < 50 ? 'text-red-500' : 'text-gray-500'}`}>
              {descriptionCharCount}/200文字（最低50文字）
            </p>
            {validationErrors.description && (
              <p className="text-xs text-red-500">{validationErrors.description}</p>
            )}
          </div>
        </div>
        
        {/* 画像アップローダー */}
        <ExperienceImageUploader
          experienceSample={newSample}
          onUpdate={handleImageUpdate}
          maxImages={5}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
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
              className={getFieldClassName('estimatedDuration')}
            />
            <p className="mt-1 text-xs text-gray-500">30分単位で入力してください</p>
            {validationErrors.estimatedDuration && (
              <p className="mt-1 text-xs text-red-500">{validationErrors.estimatedDuration}</p>
            )}
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
              className={getFieldClassName('maxParticipants')}
            />
            {validationErrors.maxParticipants && (
              <p className="mt-1 text-xs text-red-500">{validationErrors.maxParticipants}</p>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 料金 */}
          <div className="mb-4">
            <label htmlFor="pricePerPerson" className="block text-sm font-medium text-gray-700 mb-1">
              1人あたりの料金（円） <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500">¥</span>
              </div>
              <input
                type="number"
                id="pricePerPerson"
                name="pricePerPerson"
                min="0"
                step="100"
                value={newSample.pricePerPerson}
                onChange={handleInputChange}
                className={`${getFieldClassName('pricePerPerson')} pl-7`}
              />
            </div>
            {validationErrors.pricePerPerson && (
              <p className="mt-1 text-xs text-red-500">{validationErrors.pricePerPerson}</p>
            )}
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
              className={getFieldClassName('cancellationPolicy')}
            >
              <option value="flexible">柔軟（24時間前まで全額返金）</option>
              <option value="moderate">標準（3日前まで全額返金）</option>
              <option value="strict">厳格（7日前まで全額返金）</option>
            </select>
          </div>
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
            className={getFieldClassName('specialRequirements')}
            placeholder="参加者に必要なもの、年齢制限、アレルギー情報など"
          />
        </div>
        
        {/* エラーメッセージ */}
        {Object.keys(validationErrors).length > 0 && (
          <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 rounded-md">
            <div className="flex">
              <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
              <p className="text-sm text-red-700">
                入力内容に誤りがあります。各フィールドを確認してください。
              </p>
            </div>
          </div>
        )}
        
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
            className="px-5 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center"
          >
            <Plus className="w-4 h-4 mr-1" />
            {editIndex !== null ? '更新する' : '追加する'}
          </button>
        </div>
      </div>
      
      {/* フォームエラー表示 */}
      {errors.experienceSamples && (
        <p className="mt-2 text-sm text-red-500">{errors.experienceSamples}</p>
      )}
      
      {/* ヘルプ情報 */}
      <div className="bg-yellow-50 p-4 rounded-md mt-6">
        <h4 className="text-sm font-medium text-yellow-800 mb-2 flex items-center">
          <Info className="w-5 h-5 mr-2 text-yellow-500" />
          効果的な体験サンプルの作り方
        </h4>
        <ul className="list-disc pl-5 text-sm text-yellow-700 space-y-1">
          <li>タイトルは簡潔かつ魅力的に。ユーザーの興味を引くような内容にしましょう。</li>
          <li>説明文は具体的に書きましょう。何をするのか、何が得られるのかをわかりやすく記載することが重要です。</li>
          <li>画像は明るく、鮮明なものを選びましょう。実際の体験場所や活動の様子が伝わる写真が理想的です。</li>
          <li>価格設定は類似の体験を参考に、適切な範囲内で設定しましょう。</li>
        </ul>
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
          disabled={!formData.experienceSamples?.length}
        >
          次へ
        </button>
      </div>
    </div>
  );
};

export default ExperienceSamplesStep;
