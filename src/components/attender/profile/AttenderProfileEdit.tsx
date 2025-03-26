import React, { useState, useEffect } from 'react';
import { useAttenderProfile } from '@/contexts/AttenderProfileContext';
import { AttenderProfileData } from '@/types/attender/profile';
import { ArrowLeft, Loader2, Save, AlertCircle, Plus, Trash2 } from 'lucide-react';

interface AttenderProfileEditProps {
  onCancel: () => void;
  onSaved: () => void;
}

const AttenderProfileEdit: React.FC<AttenderProfileEditProps> = ({
  onCancel,
  onSaved
}) => {
  const { profileData, isLoading, error, updateProfile } = useAttenderProfile();
  const [formData, setFormData] = useState<Partial<AttenderProfileData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [currentTab, setCurrentTab] = useState('basic-info');
  const [newSocialMedia, setNewSocialMedia] = useState({ platform: '', url: '' });

  // 専門分野のオプション
  const EXPERTISE_OPTIONS = [
    { value: 'local-culture', label: '地元文化' },
    { value: 'food', label: '食文化' },
    { value: 'history', label: '歴史' },
    { value: 'art', label: 'アート' },
    { value: 'nature', label: '自然' },
    { value: 'adventure', label: 'アドベンチャー' },
    { value: 'nightlife', label: 'ナイトライフ' },
    { value: 'photography', label: '写真' },
    { value: 'craft', label: '工芸' },
    { value: 'music', label: '音楽' },
  ];

  // 言語オプション
  const LANGUAGE_OPTIONS = [
    '日本語', '英語', '中国語', '韓国語', 'フランス語', 'スペイン語', 'ドイツ語', 'イタリア語'
  ];

  // プロフィールデータが読み込まれたらフォームデータを初期化
  useEffect(() => {
    if (profileData) {
      setFormData({
        name: profileData.name,
        email: profileData.email,
        phoneNumber: profileData.phoneNumber,
        address: profileData.address,
        bio: profileData.bio,
        profileImage: profileData.profileImage,
        headerImage: profileData.headerImage,
        expertise: profileData.expertise,
        languages: profileData.languages || [],
        socialMediaLinks: profileData.socialMediaLinks,
      });
    }
  }, [profileData]);

  // 入力フィールドの変更ハンドラ
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // 複数選択の変更ハンドラ
  const handleMultiSelectChange = (field: keyof AttenderProfileData, value: string, isSelected: boolean) => {
    const currentValues = formData[field] as string[] || [];
    
    if (isSelected) {
      setFormData({
        ...formData,
        [field]: [...currentValues, value]
      });
    } else {
      setFormData({
        ...formData,
        [field]: currentValues.filter(item => item !== value)
      });
    }
  };

  // SNSリンクの変更ハンドラ
  const handleSocialMediaChange = (index: number, field: 'platform' | 'url', value: string) => {
    const updatedLinks = [...(formData.socialMediaLinks || [])];
    updatedLinks[index] = {
      ...updatedLinks[index],
      [field]: value
    };
    
    setFormData({
      ...formData,
      socialMediaLinks: updatedLinks
    });
  };

  // SNSリンクの追加ハンドラ
  const handleAddSocialMedia = () => {
    if (newSocialMedia.platform && newSocialMedia.url) {
      setFormData({
        ...formData,
        socialMediaLinks: [
          ...(formData.socialMediaLinks || []),
          { ...newSocialMedia }
        ]
      });
      setNewSocialMedia({ platform: '', url: '' });
    }
  };

  // SNSリンクの削除ハンドラ
  const handleRemoveSocialMedia = (index: number) => {
    const updatedLinks = [...(formData.socialMediaLinks || [])];
    updatedLinks.splice(index, 1);
    
    setFormData({
      ...formData,
      socialMediaLinks: updatedLinks
    });
  };

  // タブの切り替えハンドラ
  const handleTabChange = (tab: string) => {
    setCurrentTab(tab);
  };

  // フォーム送信ハンドラ
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 入力検証
    if (!formData.name?.trim()) {
      setFormError('名前は必須です');
      return;
    }
    
    if (!formData.email?.trim()) {
      setFormError('メールアドレスは必須です');
      return;
    }
    
    if (!formData.bio?.trim()) {
      setFormError('自己紹介は必須です');
      return;
    }
    
    setIsSubmitting(true);
    setFormError(null);
    
    try {
      const success = await updateProfile(formData);
      
      if (success) {
        onSaved();
      } else {
        setFormError('プロフィールの更新中にエラーが発生しました');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setFormError('エラーが発生しました。後でもう一度お試しください');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  if (error || !profileData) {
    return (
      <div className="p-4 text-center">
        <div className="bg-red-50 p-4 rounded-lg flex items-center justify-center mb-4">
          <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
          <p className="text-red-700">{error || 'プロフィールの読み込みに失敗しました'}</p>
        </div>
        <button 
          className="px-4 py-2 bg-gray-100 rounded-md text-gray-700 hover:bg-gray-200 transition-colors"
          onClick={() => window.location.reload()}
        >
          再読み込み
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto pb-12">
      <div className="mb-6 flex items-center">
        <button 
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full mr-2"
          onClick={onCancel}
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-2xl font-bold">プロフィール編集</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="bg-white border rounded-lg shadow-sm mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 border-b">
            <button 
              type="button"
              className={`px-4 py-3 text-center ${currentTab === 'basic-info' 
                ? 'border-b-2 border-blue-600 text-blue-700 font-medium' 
                : 'hover:bg-gray-50'}`}
              onClick={() => handleTabChange('basic-info')}
            >
              基本情報
            </button>
            <button 
              type="button"
              className={`px-4 py-3 text-center ${currentTab === 'profile-details' 
                ? 'border-b-2 border-blue-600 text-blue-700 font-medium' 
                : 'hover:bg-gray-50'}`}
              onClick={() => handleTabChange('profile-details')}
            >
              詳細情報
            </button>
            <button 
              type="button"
              className={`px-4 py-3 text-center ${currentTab === 'social-media' 
                ? 'border-b-2 border-blue-600 text-blue-700 font-medium' 
                : 'hover:bg-gray-50'}`}
              onClick={() => handleTabChange('social-media')}
            >
              SNSリンク
            </button>
          </div>

          <div className="p-6">
            {formError && (
              <div className="p-3 mb-6 bg-red-50 border border-red-200 rounded-md text-red-700 flex items-start">
                <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {currentTab === 'basic-info' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      名前 <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="name"
                      name="name"
                      value={formData.name || ''}
                      onChange={handleInputChange}
                      placeholder="例: 山田 太郎"
                      className="w-full p-2 border border-gray-300 rounded-md"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      メールアドレス <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email || ''}
                      onChange={handleInputChange}
                      placeholder="例: yamada@example.com"
                      className="w-full p-2 border border-gray-300 rounded-md"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                      電話番号 <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="phoneNumber"
                      name="phoneNumber"
                      value={formData.phoneNumber || ''}
                      onChange={handleInputChange}
                      placeholder="例: 090-1234-5678"
                      className="w-full p-2 border border-gray-300 rounded-md"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                      住所 <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="address"
                      name="address"
                      value={formData.address || ''}
                      onChange={handleInputChange}
                      placeholder="例: 東京都渋谷区..."
                      className="w-full p-2 border border-gray-300 rounded-md"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                    自己紹介 <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="bio"
                    name="bio"
                    value={formData.bio || ''}
                    onChange={handleInputChange}
                    placeholder="あなたについて、経験、得意なことなどを書いてください"
                    rows={5}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
              </div>
            )}

            {currentTab === 'profile-details' && (
              <div className="space-y-6">
                <div>
                  <label htmlFor="profileImage" className="block text-sm font-medium text-gray-700 mb-1">
                    プロフィール画像URL
                  </label>
                  <input
                    id="profileImage"
                    name="profileImage"
                    value={formData.profileImage || ''}
                    onChange={handleInputChange}
                    placeholder="プロフィール画像のURL"
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>

                <div>
                  <label htmlFor="headerImage" className="block text-sm font-medium text-gray-700 mb-1">
                    ヘッダー画像URL
                  </label>
                  <input
                    id="headerImage"
                    name="headerImage"
                    value={formData.headerImage || ''}
                    onChange={handleInputChange}
                    placeholder="ヘッダー画像のURL"
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    専門分野 <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                    {EXPERTISE_OPTIONS.map(option => (
                      <label key={option.value} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={(formData.expertise || []).includes(option.value)}
                          onChange={(e) => handleMultiSelectChange('expertise', option.value, e.target.checked)}
                          className="rounded border-gray-300"
                        />
                        <span>{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    対応言語
                  </label>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                    {LANGUAGE_OPTIONS.map(language => (
                      <label key={language} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={(formData.languages || []).includes(language)}
                          onChange={(e) => handleMultiSelectChange('languages', language, e.target.checked)}
                          className="rounded border-gray-300"
                        />
                        <span>{language}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {currentTab === 'social-media' && (
              <div className="space-y-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SNSリンク
                </label>
                <div className="space-y-3">
                  {(formData.socialMediaLinks || []).map((link, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        value={link.platform}
                        onChange={(e) => handleSocialMediaChange(index, 'platform', e.target.value)}
                        placeholder="プラットフォーム名 (Instagram, Twitterなど)"
                        className="flex-1 p-2 border border-gray-300 rounded-md"
                      />
                      <input
                        value={link.url}
                        onChange={(e) => handleSocialMediaChange(index, 'url', e.target.value)}
                        placeholder="URL"
                        className="flex-1 p-2 border border-gray-300 rounded-md"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveSocialMedia(index)}
                        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  ))}

                  <div className="flex gap-2">
                    <input
                      value={newSocialMedia.platform}
                      onChange={(e) => setNewSocialMedia({ ...newSocialMedia, platform: e.target.value })}
                      placeholder="プラットフォーム名"
                      className="flex-1 p-2 border border-gray-300 rounded-md"
                    />
                    <input
                      value={newSocialMedia.url}
                      onChange={(e) => setNewSocialMedia({ ...newSocialMedia, url: e.target.value })}
                      placeholder="URL"
                      className="flex-1 p-2 border border-gray-300 rounded-md"
                    />
                    <button
                      type="button"
                      onClick={handleAddSocialMedia}
                      disabled={!newSocialMedia.platform || !newSocialMedia.url}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-300"
                    >
                      <Plus className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-between">
          <button 
            type="button" 
            className="px-4 py-2 bg-gray-100 rounded-md text-gray-700 hover:bg-gray-200 transition-colors"
            onClick={onCancel} 
            disabled={isSubmitting}
          >
            キャンセル
          </button>
          <button 
            type="submit" 
            className="px-4 py-2 bg-blue-600 rounded-md text-white hover:bg-blue-700 transition-colors disabled:bg-blue-300 flex items-center"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                保存中...
              </>
            ) : (
              <>
                <Save className="h-5 w-5 mr-2" />
                変更を保存
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AttenderProfileEdit;
