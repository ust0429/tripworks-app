/**
 * アテンダープロフィール編集コンポーネント
 * 
 * アテンダーのプロフィール情報を編集するためのフォーム
 */
import React, { useState, useEffect } from 'react';
import AttenderService from '../../services/AttenderService';
import type { 
  AttenderProfile,
  LanguageSkill,
  ExpertiseArea
} from '../../types/attender/profile';
import apiClient from '../../utils/apiClientEnhanced';
import { ENDPOINTS } from '../../config/api';

interface AttenderProfileEditorProps {
  attenderId: string;
  onSave?: (profile: AttenderProfile) => void;
  onCancel?: () => void;
}

const AttenderProfileEditor: React.FC<AttenderProfileEditorProps> = ({
  attenderId,
  onSave,
  onCancel
}) => {
  const [profile, setProfile] = useState<AttenderProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  
  // フォーム状態
  const [formData, setFormData] = useState<Partial<AttenderProfile>>({});
  
  // 初期データの読み込み
  useEffect(() => {
    const fetchProfile = async () => {
      if (!attenderId) return;
      
      try {
        setLoading(true);
        setError(null);
        
        console.log(`アテンダープロフィールを取得中... ID: ${attenderId}`);
        
        // APIからプロフィールを取得
        const response = await apiClient.get<AttenderProfile>(ENDPOINTS.ATTENDER.DETAIL(attenderId));
        
        if (response.success && response.data) {
          const profileData = response.data;
          console.log('プロフィール取得成功:', profileData.name);
          setProfile(profileData);
          setFormData({
            name: profileData.name,
            bio: profileData.bio || profileData.biography || '',
            location: profileData.location,
            specialties: [...profileData.specialties],
            languages: JSON.parse(JSON.stringify(profileData.languages)),
            expertise: JSON.parse(JSON.stringify(profileData.expertise)),
            profilePhoto: profileData.profilePhoto || profileData.imageUrl
          });
        } else {
          console.error('プロフィール取得エラー:', response.error);
          setError(response.error?.message || 'プロフィール情報の取得に失敗しました');
        }
      } catch (err) {
        console.error('プロフィール取得中に例外が発生:', err);
        setError('データの取得中にエラーが発生しました');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, [attenderId]);
  
  // 入力値の変更ハンドラー
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  // 専門分野タグの追加
  const handleAddSpecialty = (specialty: string) => {
    if (!specialty.trim() || formData.specialties?.includes(specialty)) return;
    
    setFormData({
      ...formData,
      specialties: [...(formData.specialties || []), specialty]
    });
  };
  
  // 専門分野タグの削除
  const handleRemoveSpecialty = (specialty: string) => {
    setFormData({
      ...formData,
      specialties: formData.specialties?.filter(item => item !== specialty) || []
    });
  };
  
  // 言語スキルの更新
  const handleLanguageChange = (index: number, field: keyof LanguageSkill, value: string) => {
    const updatedLanguages = [...(formData.languages || [])];
    updatedLanguages[index] = {
      ...updatedLanguages[index],
      [field]: value
    };
    
    setFormData({
      ...formData,
      languages: updatedLanguages
    });
  };
  
  // 言語スキルの追加
  const handleAddLanguage = () => {
    setFormData({
      ...formData,
      languages: [
        ...(formData.languages || []),
        { language: '', proficiency: 'intermediate' }
      ]
    });
  };
  
  // 言語スキルの削除
  const handleRemoveLanguage = (index: number) => {
    const updatedLanguages = [...(formData.languages || [])];
    updatedLanguages.splice(index, 1);
    
    setFormData({
      ...formData,
      languages: updatedLanguages
    });
  };
  
  // 専門知識の更新
  const handleExpertiseChange = (index: number, field: keyof ExpertiseArea, value: any) => {
    const updatedExpertise = [...(formData.expertise || [])];
    updatedExpertise[index] = {
      ...updatedExpertise[index],
      [field]: value
    };
    
    setFormData({
      ...formData,
      expertise: updatedExpertise
    });
  };
  
  // 専門知識のサブカテゴリ更新
  const handleSubcategoryChange = (expertiseIndex: number, value: string) => {
    const updatedExpertise = [...(formData.expertise || [])];
    
    if (!value.trim()) return;
    
    // 既に存在するサブカテゴリかチェック
    const subcategories = updatedExpertise[expertiseIndex].subcategories || [];
    if (subcategories.includes(value)) return;
    
    // サブカテゴリを追加
    updatedExpertise[expertiseIndex].subcategories = [...subcategories, value];
    
    setFormData({
      ...formData,
      expertise: updatedExpertise
    });
  };
  
  // 専門知識のサブカテゴリ削除
  const handleRemoveSubcategory = (expertiseIndex: number, subcategory: string) => {
    const updatedExpertise = [...(formData.expertise || [])];
    
    updatedExpertise[expertiseIndex].subcategories = 
      updatedExpertise[expertiseIndex].subcategories?.filter(item => item !== subcategory) || [];
    
    setFormData({
      ...formData,
      expertise: updatedExpertise
    });
  };
  
  // 専門知識の追加
  const handleAddExpertise = () => {
    setFormData({
      ...formData,
      expertise: [
        ...(formData.expertise || []),
        { category: '', subcategories: [], yearsOfExperience: 1 }
      ]
    });
  };
  
  // 専門知識の削除
  const handleRemoveExpertise = (index: number) => {
    const updatedExpertise = [...(formData.expertise || [])];
    updatedExpertise.splice(index, 1);
    
    setFormData({
      ...formData,
      expertise: updatedExpertise
    });
  };
  
  // プロフィール写真のアップロード
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !profile) return;
    
    const file = e.target.files[0];
    
    try {
      setLoading(true);
      console.log('プロフィール写真をアップロード中...');
      
      // プログレスコールバック（今回は使わないが、UIで進捗表示する場合に有用）
      const progressCallback = (progress: number) => {
        console.log(`アップロード進捗: ${progress}%`);
      };
      
      // 写真をアップロードしてプロフィールを更新
      const imageUrl = await AttenderService.uploadAndUpdateProfilePhoto(
        profile.id,
        file,
        profile,
        progressCallback
      );
      
      console.log('プロフィール写真アップロード成功:', imageUrl);
      
      // フォームデータを更新
      setFormData({
        ...formData,
        profilePhoto: imageUrl
      });
      
      // プロフィールも更新
      setProfile({
        ...profile,
        profilePhoto: imageUrl,
        imageUrl: imageUrl // 互換性のため
      });
    } catch (err) {
      console.error('写真アップロードエラー:', err);
      setError('写真のアップロードに失敗しました');
    } finally {
      setLoading(false);
    }
  };
  
  // プロフィールの保存処理
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!profile) return;
    
    try {
      setSaving(true);
      setSaveError(null);
      
      console.log('プロフィール更新データを送信中...', formData);
      
      // バックエンドへの更新処理
      const response = await apiClient.patch(
        ENDPOINTS.ATTENDER.UPDATE_PROFILE(profile.id),
        formData
      );
      
      if (response.success) {
        console.log('プロフィール更新成功');
        
        // 更新されたプロフィール情報
        const updatedProfile: AttenderProfile = {
          ...profile,
          ...formData,
          updatedAt: new Date().toISOString()
        };
        
        setProfile(updatedProfile);
        
        // 親コンポーネントにコールバック
        if (onSave) {
          onSave(updatedProfile);
        }
      } else {
        console.error('プロフィール更新エラー:', response.error);
        setSaveError(response.error?.message || 'プロフィールの更新に失敗しました');
      }
    } catch (err) {
      console.error('プロフィール保存中にエラーが発生:', err);
      setSaveError('保存処理中にエラーが発生しました');
    } finally {
      setSaving(false);
    }
  };
  
  // キャンセル処理
  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };
  
  if (loading && !profile) {
    return <div className="p-4 text-center">読み込み中...</div>;
  }
  
  if (error) {
    return <div className="p-4 text-red-500 text-center">{error}</div>;
  }
  
  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">プロフィール編集</h1>
      
      <form onSubmit={handleSubmit}>
        {/* プロフィール写真 */}
        <div className="mb-6">
          <label className="block text-gray-700 font-medium mb-2">プロフィール写真</label>
          <div className="flex items-center">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 mr-4">
              {formData.profilePhoto ? (
                <img 
                  src={formData.profilePhoto} 
                  alt="プロフィール写真" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  画像なし
                </div>
              )}
            </div>
            <div>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
                id="profile-photo-upload"
              />
              <label
                htmlFor="profile-photo-upload"
                className="bg-indigo-500 hover:bg-indigo-600 text-white py-2 px-4 rounded cursor-pointer inline-block"
              >
                写真を変更
              </label>
            </div>
          </div>
        </div>
        
        {/* 基本情報 */}
        <div className="mb-6">
          <label htmlFor="name" className="block text-gray-700 font-medium mb-2">名前</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name || ''}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md"
            required
          />
        </div>
        
        {/* 自己紹介 */}
        <div className="mb-6">
          <label htmlFor="bio" className="block text-gray-700 font-medium mb-2">自己紹介</label>
          <textarea
            id="bio"
            name="bio"
            value={formData.bio || ''}
            onChange={handleChange}
            rows={5}
            className="w-full px-3 py-2 border rounded-md"
            required
          />
        </div>
        
        {/* 専門分野 */}
        <div className="mb-6">
          <label className="block text-gray-700 font-medium mb-2">専門分野</label>
          
          <div className="flex flex-wrap gap-2 mb-2">
            {formData.specialties?.map((specialty, index) => (
              <div 
                key={index} 
                className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm flex items-center"
              >
                <span>{specialty}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveSpecialty(specialty)}
                  className="ml-2 text-indigo-500 hover:text-indigo-700"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          
          <div className="flex">
            <input
              type="text"
              placeholder="新しい専門分野を追加"
              className="flex-1 px-3 py-2 border rounded-l-md"
              id="new-specialty"
            />
            <button
              type="button"
              onClick={() => {
                const input = document.getElementById('new-specialty') as HTMLInputElement;
                handleAddSpecialty(input.value);
                input.value = '';
              }}
              className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-r-md"
            >
              追加
            </button>
          </div>
        </div>
        
        {/* 言語スキル */}
        <div className="mb-6">
          <label className="block text-gray-700 font-medium mb-2">対応言語</label>
          
          {formData.languages?.map((lang, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                type="text"
                value={lang.language}
                onChange={(e) => handleLanguageChange(index, 'language', e.target.value)}
                placeholder="言語名"
                className="flex-1 px-3 py-2 border rounded-md"
                required
              />
              <select
                value={lang.proficiency}
                onChange={(e) => handleLanguageChange(index, 'proficiency', e.target.value)}
                className="px-3 py-2 border rounded-md"
              >
                <option value="native">ネイティブ</option>
                <option value="advanced">上級</option>
                <option value="intermediate">中級</option>
                <option value="beginner">初級</option>
              </select>
              <button
                type="button"
                onClick={() => handleRemoveLanguage(index)}
                className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-md"
              >
                削除
              </button>
            </div>
          ))}
          
          <button
            type="button"
            onClick={handleAddLanguage}
            className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-md"
          >
            言語を追加
          </button>
        </div>
        
        {/* 専門知識 */}
        <div className="mb-6">
          <label className="block text-gray-700 font-medium mb-2">専門知識</label>
          
          {formData.expertise?.map((exp, expIndex) => (
            <div key={expIndex} className="mb-4 p-4 border rounded-md">
              <div className="mb-2">
                <label className="block text-gray-700 text-sm mb-1">カテゴリ</label>
                <input
                  type="text"
                  value={exp.category}
                  onChange={(e) => handleExpertiseChange(expIndex, 'category', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
              </div>
              
              <div className="mb-2">
                <label className="block text-gray-700 text-sm mb-1">経験年数</label>
                <input
                  type="number"
                  value={exp.yearsOfExperience || 0}
                  onChange={(e) => handleExpertiseChange(expIndex, 'yearsOfExperience', parseInt(e.target.value))}
                  min="0"
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              
              <div className="mb-2">
                <label className="block text-gray-700 text-sm mb-1">説明</label>
                <textarea
                  value={exp.description || ''}
                  onChange={(e) => handleExpertiseChange(expIndex, 'description', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                  rows={2}
                />
              </div>
              
              <div className="mb-2">
                <label className="block text-gray-700 text-sm mb-1">サブカテゴリ</label>
                
                <div className="flex flex-wrap gap-2 mb-2">
                  {exp.subcategories?.map((subcategory, scIndex) => (
                    <div 
                      key={scIndex} 
                      className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm flex items-center"
                    >
                      <span>{subcategory}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSubcategory(expIndex, subcategory)}
                        className="ml-2 text-indigo-500 hover:text-indigo-700"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                
                <div className="flex">
                  <input
                    type="text"
                    placeholder="新しいサブカテゴリを追加"
                    className="flex-1 px-3 py-2 border rounded-l-md"
                    id={`new-subcategory-${expIndex}`}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const input = document.getElementById(`new-subcategory-${expIndex}`) as HTMLInputElement;
                      handleSubcategoryChange(expIndex, input.value);
                      input.value = '';
                    }}
                    className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-r-md"
                  >
                    追加
                  </button>
                </div>
              </div>
              
              <div className="mt-3 text-right">
                <button
                  type="button"
                  onClick={() => handleRemoveExpertise(expIndex)}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-sm"
                >
                  この専門知識を削除
                </button>
              </div>
            </div>
          ))}
          
          <button
            type="button"
            onClick={handleAddExpertise}
            className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-md"
          >
            専門知識を追加
          </button>
        </div>
        
        {/* 保存エラーメッセージ */}
        {saveError && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {saveError}
          </div>
        )}
        
        {/* ボタン */}
        <div className="flex justify-end gap-3 mt-8">
          <button
            type="button"
            onClick={handleCancel}
            className="px-5 py-2 border border-gray-300 rounded-md"
            disabled={saving}
          >
            キャンセル
          </button>
          <button
            type="submit"
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md disabled:bg-indigo-300"
            disabled={saving}
          >
            {saving ? '保存中...' : '保存する'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AttenderProfileEditor;
