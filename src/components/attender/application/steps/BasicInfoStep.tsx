/**
 * 基本情報入力ステップ
 * 
 * アテンダー申請フォームの基本情報を入力するステップ
 */
import React, { useEffect } from 'react';
import { useAttenderApplication } from '../../../../contexts/AttenderApplicationContext';

interface BasicInfoStepProps {
  onNext: () => void;
}

const BasicInfoStep: React.FC<BasicInfoStepProps> = ({ onNext }) => {
  const { 
    formData, 
    updateFormData, 
    errors, 
    clearError,
    updateSocialMediaLinks
  } = useAttenderApplication();
  
  // 国のリスト（実際の実装ではより包括的なリストを使用）
  const countries = [
    { code: 'JP', name: '日本' },
    { code: 'US', name: 'アメリカ合衆国' },
    { code: 'GB', name: 'イギリス' },
    { code: 'FR', name: 'フランス' },
    { code: 'DE', name: 'ドイツ' },
    { code: 'CN', name: '中国' },
    { code: 'KR', name: '韓国' },
    { code: 'TW', name: '台湾' },
    { code: 'AU', name: 'オーストラリア' }
  ];
  
  // 日本の地域リスト（実際の実装ではより詳細なリストを使用）
  const japanRegions = [
    '北海道', '東北', '関東', '中部', '関西', '中国', '四国', '九州・沖縄'
  ];
  
  // 住所フィールドの変更ハンドラ
  const handleLocationChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    const fieldName = name.split('.')[1] as 'country' | 'region' | 'city';
    
    // 現在のlocation情報を取得
    const currentLocation = formData.location || { country: '', region: '', city: '' };
    
    // 新しいlocationオブジェクトを作成して更新
    updateFormData({
      location: {
        ...currentLocation,
        [fieldName]: value
      }
    });
    
    clearError(name);
  };
  
  // 移住者関連の入力フィールドを表示するかどうか
  const showMigrantFields = formData.isMigrant === true;
  
  // 移住者ステータスの変更ハンドラ
  const handleResidentStatusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isLocalResident = e.target.value === 'local';
    
    updateFormData({
      isLocalResident,
      isMigrant: !isLocalResident
    });
    
    clearError('isLocalResident');
  };
  
  // 入力フィールドの変更ハンドラ
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    updateFormData({ [name]: value });
    clearError(name);
  };
  
  // SNSリンクの更新
  const handleSocialMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    updateSocialMediaLinks({ [name]: value });
  };

  // 初期レンダリング時に日本を選択
  useEffect(() => {
    if (!formData.location?.country) {
      // 既存のlocation情報を取得または初期化
      const currentLocation = formData.location || { country: '', region: '', city: '' };
      
      updateFormData({
        location: {
          ...currentLocation,
          country: 'JP'
        }
      });
    }
  }, [formData.location?.country, updateFormData]);
  
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold mb-4">基本情報</h2>
      
      {/* 名前 */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          名前 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name || ''}
          onChange={handleInputChange}
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
            errors.name ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="例：山田 太郎"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-500">{errors.name}</p>
        )}
      </div>
      
      {/* メールアドレス */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          メールアドレス <span className="text-red-500">*</span>
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email || ''}
          onChange={handleInputChange}
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
            errors.email ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="例：email@example.com"
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-500">{errors.email}</p>
        )}
      </div>
      
      {/* 電話番号 */}
      <div>
        <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
          電話番号 <span className="text-red-500">*</span>
        </label>
        <input
          type="tel"
          id="phoneNumber"
          name="phoneNumber"
          value={formData.phoneNumber || ''}
          onChange={handleInputChange}
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
            errors.phoneNumber ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="例：090-1234-5678"
        />
        {errors.phoneNumber && (
          <p className="mt-1 text-sm text-red-500">{errors.phoneNumber}</p>
        )}
      </div>
      
      {/* 所在地 */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">所在地</h3>
        
        {/* 国 */}
        <div>
          <label htmlFor="location.country" className="block text-sm font-medium text-gray-700 mb-1">
            国 <span className="text-red-500">*</span>
          </label>
          <select
            id="location.country"
            name="location.country"
            value={formData.location?.country || ''}
            onChange={handleLocationChange}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
              errors['location.country'] ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">国を選択してください</option>
            {countries.map(country => (
              <option key={country.code} value={country.code}>
                {country.name}
              </option>
            ))}
          </select>
          {errors['location.country'] && (
            <p className="mt-1 text-sm text-red-500">{errors['location.country']}</p>
          )}
        </div>
        
        {/* 地域（日本の場合） */}
        {formData.location?.country === 'JP' && (
          <div>
            <label htmlFor="location.region" className="block text-sm font-medium text-gray-700 mb-1">
              地域 <span className="text-red-500">*</span>
            </label>
            <select
              id="location.region"
              name="location.region"
              value={formData.location?.region || ''}
              onChange={handleLocationChange}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                errors['location.region'] ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">地域を選択してください</option>
              {japanRegions.map(region => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
            </select>
            {errors['location.region'] && (
              <p className="mt-1 text-sm text-red-500">{errors['location.region']}</p>
            )}
          </div>
        )}
        
        {/* 都市 */}
        <div>
          <label htmlFor="location.city" className="block text-sm font-medium text-gray-700 mb-1">
            都市 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="location.city"
            name="location.city"
            value={formData.location?.city || ''}
            onChange={handleLocationChange}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
              errors['location.city'] ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="例：京都市"
          />
          {errors['location.city'] && (
            <p className="mt-1 text-sm text-red-500">{errors['location.city']}</p>
          )}
        </div>
      </div>
      
      {/* 自己紹介文 */}
      <div>
        <label htmlFor="biography" className="block text-sm font-medium text-gray-700 mb-1">
          自己紹介文 <span className="text-red-500">*</span>
        </label>
        <p className="text-sm text-gray-500 mb-2">
          あなたの経歴、趣味、特技、そしてゲストに提供できる体験について簡潔に説明してください。
        </p>
        <textarea
          id="biography"
          name="biography"
          value={formData.biography || ''}
          onChange={handleInputChange}
          rows={5}
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
            errors.biography ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="例：私は京都で育ち、伝統工芸を学んだ後、陶芸家として活動しています。京都の隠れた工芸スポットや、普段は入れない職人の工房をご案内できます。..."
        />
        {errors.biography && (
          <p className="mt-1 text-sm text-red-500">{errors.biography}</p>
        )}
        <p className="mt-1 text-sm text-gray-500">
          最低50文字必要です（{(formData.biography || '').length}/50）
        </p>
      </div>
      
      {/* 居住ステータス */}
      <div>
        <fieldset>
          <legend className="text-base font-medium text-gray-700 mb-2">
            居住ステータス <span className="text-red-500">*</span>
          </legend>
          <div className="mt-1 space-y-2">
            <div className="flex items-center">
              <input
                id="local"
                name="residentStatus"
                type="radio"
                value="local"
                checked={formData.isLocalResident === true}
                onChange={handleResidentStatusChange}
                className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <label htmlFor="local" className="ml-3 block text-sm font-medium text-gray-700">
                地元住民（ずっとこの地域に住んでいる）
              </label>
            </div>
            <div className="flex items-center">
              <input
                id="migrant"
                name="residentStatus"
                type="radio"
                value="migrant"
                checked={formData.isMigrant === true}
                onChange={handleResidentStatusChange}
                className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <label htmlFor="migrant" className="ml-3 block text-sm font-medium text-gray-700">
                移住者（他の地域から移住してきた）
              </label>
            </div>
          </div>
          {errors.isLocalResident && (
            <p className="mt-1 text-sm text-red-500">{errors.isLocalResident}</p>
          )}
        </fieldset>
      </div>
      
      {/* 移住者の場合の追加フィールド */}
      {showMigrantFields && (
        <div className="space-y-4 bg-gray-50 p-4 rounded-md">
          <h3 className="text-lg font-medium">移住情報</h3>
          
          {/* 移住前の居住地 */}
          <div>
            <label htmlFor="previousLocation" className="block text-sm font-medium text-gray-700 mb-1">
              以前の居住地 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="previousLocation"
              name="previousLocation"
              value={formData.previousLocation || ''}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                errors.previousLocation ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="例：東京都"
            />
            {errors.previousLocation && (
              <p className="mt-1 text-sm text-red-500">{errors.previousLocation}</p>
            )}
          </div>
          
          {/* 移住してからの年数 */}
          <div>
            <label htmlFor="yearsMoved" className="block text-sm font-medium text-gray-700 mb-1">
              移住してからの年数 <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="yearsMoved"
              name="yearsMoved"
              min="0"
              step="0.5"
              value={formData.yearsMoved || ''}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                errors.yearsMoved ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="例：3.5"
            />
            {errors.yearsMoved && (
              <p className="mt-1 text-sm text-red-500">{errors.yearsMoved}</p>
            )}
          </div>
        </div>
      )}
      
      {/* 注釈: SNSリンクは第二部の専門分野ステップに移動されました */}
    </div>
  );
};

export default BasicInfoStep;
