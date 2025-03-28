import React, { useState, useEffect } from 'react';
import { AttenderProfile } from '../../../types/attender/profile';
import { cn } from '../../../utils/cn';

interface AttenderProfileEditProps {
  profile: AttenderProfile;
  onSave: (updates: Partial<AttenderProfile>) => void;
  onCancel: () => void;
}

/**
 * アテンダープロフィール編集フォームコンポーネント
 */
const AttenderProfileEdit: React.FC<AttenderProfileEditProps> = ({
  profile,
  onSave,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    name: profile.name,
    email: profile.email,
    imageUrl: profile.imageUrl || '',
    location: profile.location || '',
    bio: profile.bio || '',
    background: profile.background || '',
    specialties: profile.specialties ? profile.specialties.join(', ') : '',
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  useEffect(() => {
    setFormData({
      name: profile.name,
      email: profile.email,
      imageUrl: profile.imageUrl || '',
      location: profile.location || '',
      bio: profile.bio || '',
      background: profile.background || '',
      specialties: profile.specialties ? profile.specialties.join(', ') : '',
    });
  }, [profile]);
  
  // フォーム入力の変更ハンドラ
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // エラーをクリア
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };
  
  // フォームの検証
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = '名前は必須です';
    }
    
    if (!formData.email || !formData.email.trim()) {
      newErrors.email = 'メールアドレスは必須です';
    } else if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = '有効なメールアドレスを入力してください';
    }
    
    if (formData.imageUrl && !/^(https?:\/\/)/.test(formData.imageUrl)) {
      newErrors.imageUrl = '有効なURL（http://またはhttps://）を入力してください';
    }
    
    if (!formData.bio.trim()) {
      newErrors.bio = '自己紹介は必須です';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // 保存ハンドラ
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      // 専門分野の処理
      const specialties = formData.specialties
        .split(',')
        .map(item => item.trim())
        .filter(Boolean);
      
      onSave({
        name: formData.name,
        email: formData.email,
        imageUrl: formData.imageUrl || undefined,
        location: formData.location || undefined,
        bio: formData.bio,
        background: formData.background || undefined,
        specialties: specialties.length > 0 ? specialties : undefined,
      });
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-semibold mb-4">プロフィール情報</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            名前 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={cn(
              "w-full p-2 border rounded",
              errors.name ? "border-red-500" : "border-gray-300"
            )}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-500">{errors.name}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            メールアドレス <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={cn(
              "w-full p-2 border rounded",
              errors.email ? "border-red-500" : "border-gray-300"
            )}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-500">{errors.email}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            プロフィール画像URL
          </label>
          <input
            type="text"
            name="imageUrl"
            value={formData.imageUrl}
            onChange={handleChange}
            placeholder="https://example.com/image.jpg"
            className={cn(
              "w-full p-2 border rounded",
              errors.imageUrl ? "border-red-500" : "border-gray-300"
            )}
          />
          {errors.imageUrl && (
            <p className="mt-1 text-sm text-red-500">{errors.imageUrl}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            ※後で画像アップロード機能を追加予定です
          </p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            居住地
          </label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="例: 東京都渋谷区"
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            自己紹介 <span className="text-red-500">*</span>
          </label>
          <textarea
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            rows={4}
            className={cn(
              "w-full p-2 border rounded",
              errors.bio ? "border-red-500" : "border-gray-300"
            )}
          />
          {errors.bio && (
            <p className="mt-1 text-sm text-red-500">{errors.bio}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            専門分野（カンマ区切り）
          </label>
          <input
            type="text"
            name="specialties"
            value={formData.specialties}
            onChange={handleChange}
            placeholder="例: アート, 伝統文化, 食べ歩き"
            className="w-full p-2 border border-gray-300 rounded"
          />
          <p className="mt-1 text-xs text-gray-500">
            複数の専門分野はカンマ（,）で区切ってください
          </p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            経歴・バックグラウンド
          </label>
          <textarea
            name="background"
            value={formData.background}
            onChange={handleChange}
            rows={3}
            placeholder="あなたの経歴や専門知識について書いてください"
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
        
        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            キャンセル
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            保存
          </button>
        </div>
      </div>
    </form>
  );
};

export default AttenderProfileEdit;
