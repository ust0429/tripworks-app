import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Camera, Save, Loader, Plus, Trash, Clock, X, Check } from 'lucide-react';
import { useAuth } from '../../../AuthComponents';
import { AttenderProfile, ExperienceSample, AvailabilityTimeSlot, DailyAvailability } from '../../../types/attender/profile';
import { getAttenderProfile, updateAttenderProfile } from '../../../services/AttenderService';
import FileUploader from '../../common/FileUploader';
import { ProfileCompletionScore } from '.';

const AttenderProfileEditPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState<AttenderProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  // 編集用のフォーム状態
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    location: '',
    imageUrl: '',
    specialties: [] as string[],
    background: '',
    experienceSamples: [] as ExperienceSample[],
    availability: [] as DailyAvailability[]
  });
  
  // 専門分野のオプション
  const specialtyOptions = [
    'アート・クラフト', '料理・グルメ', '音楽・ライブ', 
    '伝統文化', '自然・アウトドア', '地元の歴史',
    'サブカルチャー', 'スポーツ・体験', 'フェス・イベント',
    '写真・映像', 'ファッション', '建築・デザイン'
  ];
  
  // 曜日表示用
  const daysOfWeek = ['日', '月', '火', '水', '木', '金', '土'];

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.id) {
        setError('ログインが必要です');
        setLoading(false);
        return;
      }
      
      try {
        const data = await getAttenderProfile(user.id);
        setProfile(data);
        
        // フォームデータを初期化
        setFormData({
          name: data.name || '',
          bio: data.bio || '',
          location: data.location || '',
          imageUrl: data.imageUrl || '',
          specialties: data.specialties || [],
          background: data.background || '',
          experienceSamples: data.experienceSamples || [],
          availability: data.availability || [
            { dayOfWeek: 0, isAvailable: false, timeSlots: [] },
            { dayOfWeek: 1, isAvailable: false, timeSlots: [] },
            { dayOfWeek: 2, isAvailable: false, timeSlots: [] },
            { dayOfWeek: 3, isAvailable: false, timeSlots: [] },
            { dayOfWeek: 4, isAvailable: false, timeSlots: [] },
            { dayOfWeek: 5, isAvailable: false, timeSlots: [] },
            { dayOfWeek: 6, isAvailable: false, timeSlots: [] }
          ]
        });
      } catch (err) {
        setError('プロフィールの取得に失敗しました');
        console.error('Failed to fetch attender profile:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, [user?.id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleImageUpload = (url: string) => {
    setFormData({
      ...formData,
      imageUrl: url
    });
  };

  const handleSpecialtyToggle = (specialty: string) => {
    const updatedSpecialties = formData.specialties.includes(specialty)
      ? formData.specialties.filter(s => s !== specialty)
      : [...formData.specialties, specialty];
    
    setFormData({
      ...formData,
      specialties: updatedSpecialties
    });
  };

  const handleAvailabilityToggle = (dayIndex: number) => {
    const updatedAvailability = [...formData.availability];
    updatedAvailability[dayIndex] = {
      ...updatedAvailability[dayIndex],
      isAvailable: !updatedAvailability[dayIndex].isAvailable
    };
    
    setFormData({
      ...formData,
      availability: updatedAvailability
    });
  };

  const handleAddTimeSlot = (dayIndex: number) => {
    const updatedAvailability = [...formData.availability];
    updatedAvailability[dayIndex] = {
      ...updatedAvailability[dayIndex],
      timeSlots: [
        ...updatedAvailability[dayIndex].timeSlots,
        { startTime: '10:00', endTime: '12:00' }
      ]
    };
    
    setFormData({
      ...formData,
      availability: updatedAvailability
    });
  };

  const handleRemoveTimeSlot = (dayIndex: number, slotIndex: number) => {
    const updatedAvailability = [...formData.availability];
    updatedAvailability[dayIndex] = {
      ...updatedAvailability[dayIndex],
      timeSlots: updatedAvailability[dayIndex].timeSlots.filter((_, i) => i !== slotIndex)
    };
    
    setFormData({
      ...formData,
      availability: updatedAvailability
    });
  };

  const handleTimeSlotChange = (dayIndex: number, slotIndex: number, field: 'startTime' | 'endTime', value: string) => {
    const updatedAvailability = [...formData.availability];
    updatedAvailability[dayIndex] = {
      ...updatedAvailability[dayIndex],
      timeSlots: updatedAvailability[dayIndex].timeSlots.map((slot, i) => {
        if (i === slotIndex) {
          return {
            ...slot,
            [field]: value
          };
        }
        return slot;
      })
    };
    
    setFormData({
      ...formData,
      availability: updatedAvailability
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!profile) {
      setError('プロフィールが読み込まれていません');
      return;
    }
    
    try {
      setSaving(true);
      setError(null);
      
      const updatedProfile: AttenderProfile = {
        ...profile,
        name: formData.name,
        bio: formData.bio,
        location: formData.location,
        imageUrl: formData.imageUrl,
        specialties: formData.specialties,
        background: formData.background,
        experienceSamples: formData.experienceSamples,
        availability: formData.availability
      };
      
      await updateAttenderProfile(updatedProfile, {});
      setSuccess(true);
      
      // プロフィールを更新
      setProfile(updatedProfile);
      
      // 3秒後に成功メッセージを消す
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err) {
      setError('プロフィールの更新に失敗しました');
      console.error('Failed to update attender profile:', err);
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

  if (!profile) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-red-50 p-4 rounded-lg text-red-700">
          プロフィールの取得に失敗しました。
        </div>
        <button
          onClick={() => navigate('/profile')}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
        >
          プロフィールに戻る
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <button 
        onClick={() => navigate('/profile')}
        className="flex items-center text-gray-600 mb-6"
      >
        <ChevronLeft size={20} />
        <span>プロフィールに戻る</span>
      </button>
      
      <h1 className="text-2xl font-bold mb-6">アテンダープロフィール編集</h1>
      
      {/* プロフィール完成度スコア */}
      <div className="mb-6">
        <ProfileCompletionScore profile={profile} showSuggestion={true} />
      </div>
      
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
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 基本情報セクション */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">基本情報</h2>
          
          {/* プロフィール画像 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              プロフィール画像
            </label>
            
            <div className="flex items-center">
              <div className="relative w-24 h-24 rounded-full overflow-hidden bg-gray-100 mr-4">
                {formData.imageUrl ? (
                  <img
                    src={formData.imageUrl}
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
              htmlFor="name" 
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              名前
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
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
          <div className="mb-4">
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
        </div>
        
        {/* 専門情報セクション */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">専門情報</h2>
          
          {/* 専門分野 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              専門分野
            </label>
            
            <div className="flex flex-wrap gap-2">
              {specialtyOptions.map((specialty) => (
                <button
                  key={specialty}
                  type="button"
                  onClick={() => handleSpecialtyToggle(specialty)}
                  className={`px-3 py-1 rounded-full text-sm ${
                    formData.specialties.includes(specialty)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {specialty}
                </button>
              ))}
            </div>
          </div>
          
          {/* 経歴・バックグラウンド */}
          <div className="mb-4">
            <label 
              htmlFor="background" 
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              経歴・バックグラウンド
            </label>
            <textarea
              id="background"
              name="background"
              value={formData.background}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              rows={4}
              placeholder="あなたの専門性や経験について教えてください。"
            />
          </div>
        </div>
        
        {/* 利用可能時間セクション */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">利用可能時間</h2>
          <p className="text-gray-600 mb-4 text-sm">
            あなたが体験を提供できる曜日と時間帯を設定してください。
          </p>
          
          <div className="space-y-4">
            {formData.availability.map((day, dayIndex) => (
              <div key={dayIndex} className="border-b border-gray-200 pb-4 last:border-0 last:pb-0">
                <div className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    id={`day-${dayIndex}`}
                    checked={day.isAvailable}
                    onChange={() => handleAvailabilityToggle(dayIndex)}
                    className="mr-2 h-4 w-4 text-blue-600 rounded"
                  />
                  <label 
                    htmlFor={`day-${dayIndex}`}
                    className="font-medium"
                  >
                    {daysOfWeek[dayIndex]}曜日
                  </label>
                </div>
                
                {day.isAvailable && (
                  <div className="ml-6 space-y-2">
                    {day.timeSlots.map((slot, slotIndex) => (
                      <div key={slotIndex} className="flex items-center gap-2">
                        <input
                          type="time"
                          value={slot.startTime}
                          onChange={(e) => handleTimeSlotChange(dayIndex, slotIndex, 'startTime', e.target.value)}
                          className="border border-gray-300 rounded p-1"
                        />
                        <span>〜</span>
                        <input
                          type="time"
                          value={slot.endTime}
                          onChange={(e) => handleTimeSlotChange(dayIndex, slotIndex, 'endTime', e.target.value)}
                          className="border border-gray-300 rounded p-1"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveTimeSlot(dayIndex, slotIndex)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                    
                    <button
                      type="button"
                      onClick={() => handleAddTimeSlot(dayIndex)}
                      className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                    >
                      <Plus size={14} className="mr-1" />
                      時間帯を追加
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        
        {/* 送信ボタン */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/profile')}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            キャンセル
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
            disabled={saving}
          >
            {saving ? (
              <>
                <Loader className="w-4 h-4 animate-spin mr-2" />
                保存中...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                変更を保存
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AttenderProfileEditPage;
