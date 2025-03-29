import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserProfile, updateUserProfile } from '../../services/UserService';
import { User } from '../../types/user';
import { Loader, Camera, Check } from 'lucide-react';
import FileUploader from '../common/FileUploader';

const UserProfile: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  
  // 編集用のフォーム状態
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    phoneNumber: '',
    bio: '',
    location: '',
    interests: [] as string[],
    profileImage: '',
  });

  // 興味カテゴリーのリスト
  const interestCategories = [
    'アート・クラフト', '料理・グルメ', '音楽・ライブ', 
    '伝統文化', '自然・アウトドア', '地元の歴史',
    'サブカルチャー', 'スポーツ・体験', 'フェス・イベント'
  ];

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        const userData = await getUserProfile();
        setUser(userData);
        
        // フォームデータを初期化
        setFormData({
          displayName: userData.displayName || '',
          email: userData.email || '',
          phoneNumber: userData.phoneNumber || '',
          bio: userData.bio || '',
          location: userData.location || '',
          interests: userData.interests || [],
          profileImage: userData.profileImage || '',
        });
      } catch (err) {
        setError('プロフィールデータの取得に失敗しました。');
        console.error('Failed to fetch user profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleInterestToggle = (interest: string) => {
    const updatedInterests = formData.interests.includes(interest)
      ? formData.interests.filter(i => i !== interest)
      : [...formData.interests, interest];
    
    setFormData({ ...formData, interests: updatedInterests });
  };

  const handleImageUpload = (url: string) => {
    setFormData({ ...formData, profileImage: url });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      await updateUserProfile(formData);
      setSuccess(true);
      
      // 3秒後に成功メッセージを消す
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError('プロフィールの更新に失敗しました。後でもう一度お試しください。');
      console.error('Failed to update profile:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 flex justify-center">
        <Loader className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-red-50 p-4 rounded-lg text-red-700">
          ユーザー情報が見つかりませんでした。
        </div>
        <button
          onClick={() => navigate('/')}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
        >
          ホームに戻る
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">プロフィール設定</h1>
      
      {error && (
        <div className="bg-red-50 p-4 rounded-lg text-red-700 mb-6">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-50 p-4 rounded-lg text-green-700 mb-6 flex items-center">
          <Check className="w-5 h-5 mr-2" />
          プロフィールを更新しました
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        {/* プロフィール画像 */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            プロフィール画像
          </label>
          
          <div className="flex items-center">
            <div className="relative w-24 h-24 rounded-full overflow-hidden bg-gray-100 mr-4">
              {formData.profileImage ? (
                <img
                  src={formData.profileImage}
                  alt="プロフィール"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <Camera className="w-8 h-8" />
                </div>
              )}
            </div>
            
            <FileUploader
              onUploadComplete={handleImageUpload}
              acceptedFileTypes="image/*"
              buttonLabel="画像を変更"
            />
          </div>
        </div>
        
        {/* 名前 */}
        <div className="mb-4">
          <label 
            htmlFor="displayName" 
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            名前
          </label>
          <input
            id="displayName"
            name="displayName"
            type="text"
            value={formData.displayName}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            required
          />
        </div>
        
        {/* Eメール */}
        <div className="mb-4">
          <label 
            htmlFor="email" 
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Eメール
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            required
          />
        </div>
        
        {/* 電話番号 */}
        <div className="mb-4">
          <label 
            htmlFor="phoneNumber" 
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            電話番号
          </label>
          <input
            id="phoneNumber"
            name="phoneNumber"
            type="tel"
            value={formData.phoneNumber}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        
        {/* 居住地 */}
        <div className="mb-4">
          <label 
            htmlFor="location" 
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            居住地
          </label>
          <input
            id="location"
            name="location"
            type="text"
            value={formData.location}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        
        {/* 自己紹介 */}
        <div className="mb-6">
          <label 
            htmlFor="bio" 
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            自己紹介
          </label>
          <textarea
            id="bio"
            name="bio"
            value={formData.bio}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            rows={4}
          />
        </div>
        
        {/* 興味・関心 */}
        <div className="mb-6">
          <span className="block text-sm font-medium text-gray-700 mb-2">
            興味・関心
          </span>
          
          <div className="flex flex-wrap gap-2">
            {interestCategories.map((interest) => (
              <button
                key={interest}
                type="button"
                onClick={() => handleInterestToggle(interest)}
                className={`px-3 py-1 rounded-full text-sm ${
                  formData.interests.includes(interest)
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {interest}
              </button>
            ))}
          </div>
        </div>
        
        {/* 送信ボタン */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center"
            disabled={saving}
          >
            {saving ? (
              <>
                <Loader className="w-4 h-4 animate-spin mr-2" />
                保存中...
              </>
            ) : (
              '変更を保存'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserProfile;