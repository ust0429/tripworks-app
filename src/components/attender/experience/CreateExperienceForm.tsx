import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../AuthComponents';
import { createExperience } from '../../../services/AttenderService';
import { ChevronLeft, Camera, Clock, MapPin, Tag, Check, Loader, FileText, Calendar, DollarSign } from 'lucide-react';
import FileUploader from '../../common/FileUploader';

const CreateExperienceForm: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageUrl: '',
    duration: 60,
    price: 5000,
    categories: [] as string[],
    location: '',
    availableDays: [] as number[],
    maxParticipants: 4,
    includesItems: '',
    requiredItems: '',
    cancellationPolicy: 'moderate' // 'flexible', 'moderate', 'strict'
  });

  // カテゴリーのリスト
  const categoryOptions = [
    'アート・クラフト', '料理・グルメ', '音楽・ライブ', 
    '伝統文化', '自然・アウトドア', '地元の歴史',
    'サブカルチャー', 'スポーツ・体験', 'フェス・イベント'
  ];
  
  // 曜日のリスト
  const daysOfWeek = ['日', '月', '火', '水', '木', '金', '土'];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleNumberInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: parseInt(value) || 0 });
  };

  const handleCategoryToggle = (category: string) => {
    const updatedCategories = formData.categories.includes(category)
      ? formData.categories.filter(c => c !== category)
      : [...formData.categories, category];
    
    setFormData({ ...formData, categories: updatedCategories });
  };

  const handleDayToggle = (day: number) => {
    const updatedDays = formData.availableDays.includes(day)
      ? formData.availableDays.filter(d => d !== day)
      : [...formData.availableDays, day];
    
    setFormData({ ...formData, availableDays: updatedDays });
  };

  const handleImageUpload = (url: string) => {
    setFormData({ ...formData, imageUrl: url });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id) {
      setError('ログインが必要です');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // 必須項目のバリデーション
      if (!formData.title) throw new Error('タイトルを入力してください');
      if (!formData.description) throw new Error('説明を入力してください');
      if (formData.categories.length === 0) throw new Error('カテゴリーを選択してください');
      if (formData.availableDays.length === 0) throw new Error('利用可能な曜日を選択してください');
      
      await createExperience(user.id, formData);
      setSuccess(true);
      
      // 成功後、一覧画面に戻る
      setTimeout(() => {
        navigate('/attender/experiences');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : '体験プランの作成に失敗しました');
      console.error('Failed to create experience:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // プロフィールページに戻る
    navigate('/profile');
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center text-gray-600 mb-6"
      >
        <ChevronLeft size={20} />
        <span>戻る</span>
      </button>
      
      <h1 className="text-2xl font-bold mb-6">新しい体験プランを作成</h1>
      
      {error && (
        <div className="bg-red-50 p-4 rounded-lg text-red-700 mb-6">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-50 p-4 rounded-lg text-green-700 mb-6 flex items-center">
          <Check className="w-5 h-5 mr-2" />
          体験プランを作成しました！リダイレクトします...
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 基本情報セクション */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">基本情報</h2>
          
          {/* タイトル */}
          <div className="mb-4">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              タイトル<span className="text-red-500 ml-1">*</span>
            </label>
            <input
              id="title"
              name="title"
              type="text"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="例: 地元アーティストと巡る裏路地アートツアー"
              required
            />
          </div>
          
          {/* 説明 */}
          <div className="mb-4">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              説明<span className="text-red-500 ml-1">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              rows={6}
              placeholder="何をするのか、どんな体験ができるのか、参加者にとっての魅力を詳しく説明してください。"
              required
            />
          </div>
          
          {/* メイン画像 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              メイン画像
            </label>
            
            <div className="flex items-start">
              <div className="relative w-32 h-24 bg-gray-100 rounded overflow-hidden mr-4">
                {formData.imageUrl ? (
                  <img
                    src={formData.imageUrl}
                    alt="体験のイメージ"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <Camera className="w-8 h-8" />
                  </div>
                )}
              </div>
              
              <div>
                <FileUploader
                  onUploadComplete={handleImageUpload}
                  acceptedFileTypes="image/*"
                  buttonLabel="画像をアップロード"
                />
                <p className="text-xs text-gray-500 mt-1">
                  ※ 高解像度の横長画像が推奨されます（1200×800px以上）
                </p>
              </div>
            </div>
          </div>
          
          {/* カテゴリー */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              カテゴリー<span className="text-red-500 ml-1">*</span>
            </label>
            
            <div className="flex flex-wrap gap-2">
              {categoryOptions.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => handleCategoryToggle(category)}
                  className={`px-3 py-1 rounded-full text-sm flex items-center ${
                    formData.categories.includes(category)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Tag size={14} className="mr-1" />
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        {/* 詳細情報セクション */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">詳細情報</h2>
          
          {/* 場所 */}
          <div className="mb-4">
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
              体験場所<span className="text-red-500 ml-1">*</span>
            </label>
            <div className="flex">
              <span className="inline-flex items-center px-3 border border-r-0 border-gray-300 bg-gray-50 text-gray-500 rounded-l-md">
                <MapPin size={16} />
              </span>
              <input
                id="location"
                name="location"
                type="text"
                value={formData.location}
                onChange={handleInputChange}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-r-md"
                placeholder="例: 東京都渋谷区 - スクランブル交差点集合"
                required
              />
            </div>
          </div>
          
          {/* 所要時間 */}
          <div className="mb-4">
            <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
              所要時間<span className="text-red-500 ml-1">*</span>
            </label>
            <div className="flex">
              <span className="inline-flex items-center px-3 border border-r-0 border-gray-300 bg-gray-50 text-gray-500 rounded-l-md">
                <Clock size={16} />
              </span>
              <input
                id="duration"
                name="duration"
                type="number"
                min="30"
                max="480"
                step="30"
                value={formData.duration}
                onChange={handleNumberInputChange}
                className="w-24 px-3 py-2 border border-gray-300"
              />
              <span className="inline-flex items-center px-3 border border-l-0 border-gray-300 bg-gray-50 text-gray-500 rounded-r-md">
                分
              </span>
            </div>
          </div>
          
          {/* 料金 */}
          <div className="mb-4">
            <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
              料金（1人あたり）<span className="text-red-500 ml-1">*</span>
            </label>
            <div className="flex">
              <span className="inline-flex items-center px-3 border border-r-0 border-gray-300 bg-gray-50 text-gray-500 rounded-l-md">
                <DollarSign size={16} />
              </span>
              <input
                id="price"
                name="price"
                type="number"
                min="1000"
                step="100"
                value={formData.price}
                onChange={handleNumberInputChange}
                className="w-32 px-3 py-2 border border-gray-300"
              />
              <span className="inline-flex items-center px-3 border border-l-0 border-gray-300 bg-gray-50 text-gray-500 rounded-r-md">
                円
              </span>
            </div>
          </div>
          
          {/* 最大参加人数 */}
          <div className="mb-4">
            <label htmlFor="maxParticipants" className="block text-sm font-medium text-gray-700 mb-1">
              最大参加人数<span className="text-red-500 ml-1">*</span>
            </label>
            <select
              id="maxParticipants"
              name="maxParticipants"
              value={formData.maxParticipants}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              {[1, 2, 3, 4, 5, 6, 8, 10, 12, 15, 20].map(num => (
                <option key={num} value={num}>{num}人</option>
              ))}
            </select>
          </div>
          
          {/* 利用可能曜日 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              利用可能曜日<span className="text-red-500 ml-1">*</span>
            </label>
            <div className="flex gap-2">
              {daysOfWeek.map((day, index) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleDayToggle(index)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm ${
                    formData.availableDays.includes(index)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              ※ 具体的な時間帯は別途、カレンダー設定で指定できます
            </p>
          </div>
        </div>
        
        {/* 追加情報セクション */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">追加情報</h2>
          
          {/* 含まれるもの */}
          <div className="mb-4">
            <label htmlFor="includesItems" className="block text-sm font-medium text-gray-700 mb-1">
              含まれるもの
            </label>
            <textarea
              id="includesItems"
              name="includesItems"
              value={formData.includesItems}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              rows={3}
              placeholder="例: 飲み物、スナック、体験に必要な道具、写真データなど"
            />
          </div>
          
          {/* 持っていくもの */}
          <div className="mb-4">
            <label htmlFor="requiredItems" className="block text-sm font-medium text-gray-700 mb-1">
              参加者が持っていくもの
            </label>
            <textarea
              id="requiredItems"
              name="requiredItems"
              value={formData.requiredItems}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              rows={3}
              placeholder="例: 歩きやすい靴、水分、カメラなど"
            />
          </div>
          
          {/* キャンセルポリシー */}
          <div className="mb-4">
            <label htmlFor="cancellationPolicy" className="block text-sm font-medium text-gray-700 mb-1">
              キャンセルポリシー<span className="text-red-500 ml-1">*</span>
            </label>
            <select
              id="cancellationPolicy"
              name="cancellationPolicy"
              value={formData.cancellationPolicy}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="flexible">柔軟 (24時間前まで全額返金)</option>
              <option value="moderate">標準 (3日前まで全額、24時間前まで半額返金)</option>
              <option value="strict">厳格 (7日前まで全額、3日前まで半額返金)</option>
            </select>
          </div>
        </div>
        
        {/* 送信ボタン */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            disabled={loading}
          >
            キャンセル
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader className="w-4 h-4 animate-spin mr-2" />
                保存中...
              </>
            ) : (
              '体験プランを作成'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateExperienceForm;
