import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerAttender } from '../../../services/AttenderService';
import { getUserProfile } from '../../../services/UserService';

interface AttenderRegistrationFormProps {
  onSuccess?: () => void;
}

const AttenderRegistrationForm: React.FC<AttenderRegistrationFormProps> = ({ onSuccess }) => {
  const navigate = useNavigate();
  
  // フォームの状態
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    location: '',
    specialties: [] as string[],
    isLocalResident: false,
    isMigrant: false,
    yearsMoved: '',
    previousLocation: '',
  });
  
  // 追加の専門分野の入力フィールド
  const [newSpecialty, setNewSpecialty] = useState('');
  
  // ステータス管理
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  // フォーム送信時の処理
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // バリデーション
    if (!formData.name.trim()) {
      setError('氏名は必須です');
      return;
    }
    
    if (!formData.bio.trim()) {
      setError('自己紹介は必須です');
      return;
    }
    
    if (!formData.location.trim()) {
      setError('活動地域は必須です');
      return;
    }
    
    if (formData.specialties.length === 0) {
      setError('専門分野は少なくとも1つ設定してください');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      // ユーザープロフィールの取得
      const userProfile = await getUserProfile();
      
      // アテンダー登録データの作成
      const registrationData = {
        name: formData.name,
        bio: formData.bio,
        location: formData.location,
        specialties: formData.specialties,
        profilePhoto: userProfile?.photoURL,
        isLocalResident: formData.isLocalResident,
        isMigrant: formData.isMigrant,
        yearsMoved: formData.yearsMoved ? Number(formData.yearsMoved) : undefined,
        previousLocation: formData.previousLocation || undefined,
        // その他の初期値
        languages: [{ language: '日本語', proficiency: 'native' }],
        expertise: [
          {
            category: formData.specialties[0],
            description: formData.bio
          }
        ],
        availableTimes: [
          { dayOfWeek: 1, startTime: '09:00', endTime: '17:00', isAvailable: true },
          { dayOfWeek: 2, startTime: '09:00', endTime: '17:00', isAvailable: true },
          { dayOfWeek: 3, startTime: '09:00', endTime: '17:00', isAvailable: true },
          { dayOfWeek: 4, startTime: '09:00', endTime: '17:00', isAvailable: true },
          { dayOfWeek: 5, startTime: '09:00', endTime: '17:00', isAvailable: true }
        ]
      };
      
      // アテンダー登録API呼び出し
      const attenderId = await registerAttender(registrationData);
      
      setSuccess(true);
      
      // 成功後のコールバック
      if (onSuccess) {
        onSuccess();
      }
      
      // 成功後に詳細ページへリダイレクト
      setTimeout(() => {
        navigate(`/attender/${attenderId}`);
      }, 1500);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : '登録中にエラーが発生しました');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // フォーム入力の処理
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    // チェックボックスの処理
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
      return;
    }
    
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // 専門分野の追加
  const addSpecialty = () => {
    if (newSpecialty.trim() && !formData.specialties.includes(newSpecialty.trim())) {
      setFormData(prev => ({
        ...prev,
        specialties: [...prev.specialties, newSpecialty.trim()]
      }));
      setNewSpecialty('');
    }
  };
  
  // 専門分野の削除
  const removeSpecialty = (index: number) => {
    setFormData(prev => ({
      ...prev,
      specialties: prev.specialties.filter((_, i) => i !== index)
    }));
  };
  
  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center">アテンダー登録</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          <p>{error}</p>
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
          <p>アテンダー登録が完了しました！</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        {/* 氏名 */}
        <div className="mb-4">
          <label className="block mb-2 font-medium">氏名 <span className="text-red-500">*</span></label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="例: 山田 京都"
            required
          />
        </div>
        
        {/* 自己紹介 */}
        <div className="mb-4">
          <label className="block mb-2 font-medium">自己紹介 <span className="text-red-500">*</span></label>
          <textarea
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="あなたについて、どのような体験を提供できるかなどを書いてください"
            rows={4}
            required
          />
        </div>
        
        {/* 活動地域 */}
        <div className="mb-4">
          <label className="block mb-2 font-medium">活動地域 <span className="text-red-500">*</span></label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="例: 京都市中京区"
            required
          />
        </div>
        
        {/* 専門分野 */}
        <div className="mb-4">
          <label className="block mb-2 font-medium">専門分野 <span className="text-red-500">*</span></label>
          <div className="flex">
            <input
              type="text"
              value={newSpecialty}
              onChange={(e) => setNewSpecialty(e.target.value)}
              className="flex-1 p-2 border rounded-l focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="例: 陶芸, 伝統工芸, フードツアー"
            />
            <button
              type="button"
              onClick={addSpecialty}
              className="px-4 py-2 bg-blue-500 text-white rounded-r hover:bg-blue-600"
            >
              追加
            </button>
          </div>
          
          {/* 追加された専門分野のタグ表示 */}
          <div className="mt-2 flex flex-wrap gap-2">
            {formData.specialties.map((specialty, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full flex items-center"
              >
                {specialty}
                <button
                  type="button"
                  onClick={() => removeSpecialty(index)}
                  className="ml-2 text-blue-500 hover:text-blue-700"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
        
        {/* 地元住民 / 移住者 */}
        <div className="mb-4 flex gap-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isLocalResident"
              name="isLocalResident"
              checked={formData.isLocalResident}
              onChange={handleChange}
              className="mr-2"
            />
            <label htmlFor="isLocalResident">地元住民</label>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isMigrant"
              name="isMigrant"
              checked={formData.isMigrant}
              onChange={handleChange}
              className="mr-2"
            />
            <label htmlFor="isMigrant">移住者</label>
          </div>
        </div>
        
        {/* 移住者情報（isMigrantがtrueの場合のみ表示） */}
        {formData.isMigrant && (
          <div className="mb-4 pl-4 border-l-2 border-blue-200">
            <div className="mb-3">
              <label className="block mb-1">移住年数</label>
              <input
                type="number"
                name="yearsMoved"
                value={formData.yearsMoved}
                onChange={handleChange}
                min="0"
                className="w-20 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="年数"
              />
            </div>
            
            <div>
              <label className="block mb-1">以前の居住地</label>
              <input
                type="text"
                name="previousLocation"
                value={formData.previousLocation}
                onChange={handleChange}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="例: 東京"
              />
            </div>
          </div>
        )}
        
        {/* 送信ボタン */}
        <div className="mt-6">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-3 rounded font-medium text-white ${
              isSubmitting
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isSubmitting ? '登録中...' : 'アテンダーとして登録する'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AttenderRegistrationForm;
