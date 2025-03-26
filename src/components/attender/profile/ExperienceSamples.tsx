import React, { useState } from 'react';
import { ExperienceSample } from '../../../types/attender/profile';
import { Badge } from '../../ui/badge';
import { cn } from '../../../utils/cn';

interface ExperienceSamplesProps {
  samples: ExperienceSample[];
  isEditing: boolean;
  onAdd?: (sample: Omit<ExperienceSample, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdate?: (id: string, updates: Partial<Omit<ExperienceSample, 'id' | 'createdAt' | 'updatedAt'>>) => void;
  onRemove?: (id: string) => void;
}

type EditingSample = Omit<ExperienceSample, 'id' | 'createdAt' | 'updatedAt'> & { id?: string };

/**
 * 体験サンプル管理コンポーネント
 */
const ExperienceSamples: React.FC<ExperienceSamplesProps> = ({
  samples,
  isEditing,
  onAdd,
  onUpdate,
  onRemove,
}) => {
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingSampleId, setEditingSampleId] = useState<string | null>(null);
  const [editingSample, setEditingSample] = useState<EditingSample>({
    title: '',
    description: '',
    imageUrl: '',
    duration: 60,
    price: 0,
    categories: [],
  });
  
  // 入力値の変更ハンドラ
  const handleChange = (field: keyof EditingSample, value: any) => {
    setEditingSample(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // カテゴリー入力の変更ハンドラ
  const handleCategoriesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const categories = e.target.value.split(',').map(cat => cat.trim()).filter(Boolean);
    handleChange('categories', categories);
  };
  
  // 編集フォームの保存
  const handleSave = () => {
    if (isAddingNew) {
      onAdd?.(editingSample);
      setIsAddingNew(false);
    } else if (editingSampleId) {
      onUpdate?.(editingSampleId, editingSample);
      setEditingSampleId(null);
    }
    
    // フォームをリセット
    setEditingSample({
      title: '',
      description: '',
      imageUrl: '',
      duration: 60,
      price: 0,
      categories: [],
    });
  };
  
  // 編集キャンセル
  const handleCancel = () => {
    setIsAddingNew(false);
    setEditingSampleId(null);
    setEditingSample({
      title: '',
      description: '',
      imageUrl: '',
      duration: 60,
      price: 0,
      categories: [],
    });
  };
  
  // 体験サンプルの編集を開始
  const startEdit = (sample: ExperienceSample) => {
    setEditingSampleId(sample.id);
    setEditingSample({
      title: sample.title,
      description: sample.description,
      imageUrl: sample.imageUrl || '',
      duration: sample.duration || 60,
      price: sample.price || 0,
      categories: sample.categories || [],
    });
  };
  
  // 新規作成フォームの表示
  const startAddNew = () => {
    setIsAddingNew(true);
    setEditingSampleId(null);
    setEditingSample({
      title: '',
      description: '',
      imageUrl: '',
      duration: 60,
      price: 0,
      categories: [],
    });
  };
  
  // サンプルの削除
  const handleRemove = (id: string) => {
    if (window.confirm('この体験サンプルを削除してもよろしいですか？')) {
      onRemove?.(id);
    }
  };
  
  // サンプル編集フォーム
  const SampleForm = () => (
    <div className="bg-gray-50 p-4 rounded-lg mt-4 border">
      <h3 className="text-lg font-medium mb-3">
        {isAddingNew ? '新しい体験サンプルを追加' : '体験サンプルを編集'}
      </h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            タイトル*
          </label>
          <input
            type="text"
            value={editingSample.title}
            onChange={(e) => handleChange('title', e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            説明*
          </label>
          <textarea
            value={editingSample.description}
            onChange={(e) => handleChange('description', e.target.value)}
            className="w-full p-2 border rounded"
            rows={3}
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            画像URL
          </label>
          <input
            type="text"
            value={editingSample.imageUrl}
            onChange={(e) => handleChange('imageUrl', e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="https://example.com/image.jpg"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              所要時間（分）
            </label>
            <input
              type="number"
              value={editingSample.duration}
              onChange={(e) => handleChange('duration', parseInt(e.target.value) || 0)}
              className="w-full p-2 border rounded"
              min="0"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              料金（円）
            </label>
            <input
              type="number"
              value={editingSample.price}
              onChange={(e) => handleChange('price', parseInt(e.target.value) || 0)}
              className="w-full p-2 border rounded"
              min="0"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            カテゴリー（カンマ区切り）
          </label>
          <input
            type="text"
            value={editingSample.categories?.join(', ') || ''}
            onChange={handleCategoriesChange}
            className="w-full p-2 border rounded"
            placeholder="アート, 文化, 食べ歩き"
          />
        </div>
        
        <div className="flex justify-end gap-2 mt-4">
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            キャンセル
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!editingSample.title || !editingSample.description}
            className={cn(
              "px-4 py-2 text-sm font-medium text-white rounded-md",
              (!editingSample.title || !editingSample.description)
                ? "bg-blue-300"
                : "bg-blue-600 hover:bg-blue-700"
            )}
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">体験サンプル</h2>
        
        {isEditing && !isAddingNew && !editingSampleId && (
          <button
            type="button"
            onClick={startAddNew}
            className="px-3 py-1 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            サンプルを追加
          </button>
        )}
      </div>
      
      {samples.length === 0 && !isAddingNew ? (
        <div className="text-center py-8 text-gray-500">
          <p>体験サンプルがまだ登録されていません</p>
          {isEditing && (
            <button
              type="button"
              onClick={startAddNew}
              className="mt-3 px-4 py-2 text-sm font-medium text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50"
            >
              サンプルを追加
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {samples.map(sample => (
            editingSampleId === sample.id ? (
              <SampleForm key={sample.id} />
            ) : (
              <div key={sample.id} className="border rounded-lg overflow-hidden">
                <div className="relative">
                  {sample.imageUrl ? (
                    <img
                      src={sample.imageUrl}
                      alt={sample.title}
                      className="w-full h-48 object-cover"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gray-200 flex items-center justify-center text-gray-400">
                      画像なし
                    </div>
                  )}
                  
                  {/* 料金表示 */}
                  {sample.price !== undefined && sample.price > 0 && (
                    <div className="absolute top-3 right-3 bg-white px-3 py-1 rounded-full shadow-md text-gray-800 font-medium">
                      ¥{sample.price.toLocaleString()}
                    </div>
                  )}
                </div>
                
                <div className="p-4">
                  <h3 className="text-lg font-medium mb-2">{sample.title}</h3>
                  
                  <div className="flex flex-wrap gap-1 mb-3">
                    {sample.categories?.map(category => (
                      <Badge key={category} variant="default" size="sm">
                        {category}
                      </Badge>
                    ))}
                  </div>
                  
                  <p className="text-gray-600 mb-3">{sample.description}</p>
                  
                  <div className="flex items-center text-sm text-gray-500">
                    {sample.duration && (
                      <div className="flex items-center mr-4">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {sample.duration}分
                      </div>
                    )}
                  </div>
                  
                  {isEditing && (
                    <div className="mt-3 flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => startEdit(sample)}
                        className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800"
                      >
                        編集
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemove(sample.id)}
                        className="px-3 py-1 text-sm text-red-600 hover:text-red-800"
                      >
                        削除
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )
          ))}
          
          {isAddingNew && <SampleForm />}
        </div>
      )}
    </div>
  );
};

export default ExperienceSamples;
