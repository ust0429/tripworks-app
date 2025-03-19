import React, { useState, useRef } from 'react';
import { X, Image, File, MapPin, Calendar, Camera } from 'lucide-react';
import { MessageAttachment } from '../../types';

interface AttachmentOptionsProps {
  onClose: () => void;
  onAttachmentSelect: (attachment: MessageAttachment) => void;
}

// 位置情報の型定義
interface LocationData {
  latitude: number;
  longitude: number;
  address?: string;
}

const AttachmentOptions: React.FC<AttachmentOptionsProps> = ({ onClose, onAttachmentSelect }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [isLocationLoading, setIsLocationLoading] = useState(false);
  
  // ファイル選択ハンドラー
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    // ファイルサイズチェック (20MB以下)
    if (file.size > 20 * 1024 * 1024) {
      alert('ファイルサイズは20MB以下にしてください');
      return;
    }
    
    // ファイルの添付オブジェクトを作成
    const attachment: MessageAttachment = {
      id: `file-${Date.now()}`,
      type: 'file',
      name: file.name,
      size: file.size,
      mimeType: file.type,
      url: URL.createObjectURL(file)
    };
    
    onAttachmentSelect(attachment);
  };
  
  // 画像選択ハンドラー
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    // ファイルサイズチェック (10MB以下)
    if (file.size > 10 * 1024 * 1024) {
      alert('画像サイズは10MB以下にしてください');
      return;
    }
    
    // 画像形式チェック
    const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validImageTypes.includes(file.type)) {
      alert('サポートされていない画像形式です');
      return;
    }
    
    // サムネイル生成
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target && typeof event.target.result === 'string') {
        // 画像の添付オブジェクトを作成
        const attachment: MessageAttachment = {
          id: `image-${Date.now()}`,
          type: 'image',
          name: file.name,
          size: file.size,
          mimeType: file.type,
          url: URL.createObjectURL(file),
          thumbnailUrl: event.target.result
        };
        
        onAttachmentSelect(attachment);
      }
    };
    reader.readAsDataURL(file);
  };
  
  // カメラを起動
  const handleOpenCamera = () => {
    if (imageInputRef.current) {
      imageInputRef.current.accept = 'image/*';
      imageInputRef.current.setAttribute('capture', 'environment');
      imageInputRef.current.click();
    }
  };
  
  // 位置情報の取得
  const handleShareLocation = () => {
    setIsLocationLoading(true);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          // 位置情報のアドレスに変換（実際のアプリではバックエンドAPIを使用）
          let address = '';
          try {
            // モックの逆ジオコーディング（実際はGoogleやMapboxのAPIなどを使用）
            address = await mockReverseGeocode(latitude, longitude);
          } catch (error) {
            console.error('住所の取得に失敗しました:', error);
            address = '位置情報';
          }
          
          // 位置情報の添付オブジェクトを作成
          const locationData: LocationData = {
            latitude,
            longitude,
            address
          };
          
          const attachment: MessageAttachment = {
            id: `location-${Date.now()}`,
            type: 'location',
            name: address || '現在地',
            location: locationData
          };
          
          onAttachmentSelect(attachment);
          setIsLocationLoading(false);
        },
        (error) => {
          console.error('位置情報の取得に失敗しました:', error);
          alert('位置情報の取得に失敗しました。位置情報の利用を許可してください。');
          setIsLocationLoading(false);
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    } else {
      alert('お使いのブラウザは位置情報をサポートしていません');
      setIsLocationLoading(false);
    }
  };
  
  // 待ち合わせ日程の共有
  const handleShareDate = () => {
    // 現在の日時を取得（30分単位で切り上げ）
    const now = new Date();
    const minutes = now.getMinutes();
    const roundedMinutes = Math.ceil(minutes / 30) * 30;
    now.setMinutes(roundedMinutes);
    now.setSeconds(0);
    now.setMilliseconds(0);
    
    // 1時間後の時間
    const oneHourLater = new Date(now);
    oneHourLater.setHours(now.getHours() + 1);
    
    // 日程の添付オブジェクトを作成
    const attachment: MessageAttachment = {
      id: `date-${Date.now()}`,
      type: 'date',
      name: '待ち合わせ日程',
      date: {
        start: now.toISOString(),
        end: oneHourLater.toISOString(),
        title: '待ち合わせ'
      }
    };
    
    onAttachmentSelect(attachment);
  };
  
  // モックの逆ジオコーディング関数
  const mockReverseGeocode = async (latitude: number, longitude: number): Promise<string> => {
    // 実際はここでMapboxやGoogleのジオコーディングAPIを呼び出し
    
    // モックデータ（実際のアプリでは削除）
    const mockLocations = [
      { lat: 35.6812, lng: 139.7671, address: '東京都千代田区丸の内' },
      { lat: 35.6584, lng: 139.7019, address: '東京都渋谷区道玄坂' },
      { lat: 35.6918, lng: 139.7035, address: '東京都新宿区歌舞伎町' },
      { lat: 35.6280, lng: 139.7742, address: '東京都港区六本木' },
      { lat: 34.6937, lng: 135.5023, address: '大阪府大阪市北区梅田' }
    ];
    
    // 最も近い場所を返す（実際のアプリでは削除）
    let closestLocation = mockLocations[0];
    let minDistance = Number.MAX_VALUE;
    
    mockLocations.forEach(loc => {
      const distance = Math.sqrt(
        Math.pow(latitude - loc.lat, 2) + Math.pow(longitude - loc.lng, 2)
      );
      if (distance < minDistance) {
        minDistance = distance;
        closestLocation = loc;
      }
    });
    
    // API呼び出しを模倣するための遅延
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return closestLocation.address;
  };
  
  return (
    <div className="pb-3">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-medium">添付ファイル</h3>
        <button onClick={onClose} className="text-gray-500">
          <X size={18} />
        </button>
      </div>
      
      <div className="grid grid-cols-4 gap-2">
        {/* 画像アップロード */}
        <div>
          <input 
            type="file" 
            accept="image/*" 
            ref={imageInputRef}
            onChange={handleImageChange}
            className="hidden" 
          />
          <button 
            onClick={() => imageInputRef.current?.click()}
            className="flex flex-col items-center w-full p-3 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            <Image size={24} className="text-blue-500 mb-1" />
            <span className="text-xs text-gray-700">画像</span>
          </button>
        </div>
        
        {/* カメラ */}
        <div>
          <button 
            onClick={handleOpenCamera}
            className="flex flex-col items-center w-full p-3 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            <Camera size={24} className="text-green-500 mb-1" />
            <span className="text-xs text-gray-700">カメラ</span>
          </button>
        </div>
        
        {/* ファイルアップロード */}
        <div>
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden" 
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center w-full p-3 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            <File size={24} className="text-purple-500 mb-1" />
            <span className="text-xs text-gray-700">ファイル</span>
          </button>
        </div>
        
        {/* 位置情報 */}
        <div>
          <button 
            onClick={handleShareLocation}
            disabled={isLocationLoading}
            className="flex flex-col items-center w-full p-3 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50"
          >
            <MapPin size={24} className="text-red-500 mb-1" />
            <span className="text-xs text-gray-700">
              {isLocationLoading ? '取得中...' : '位置情報'}
            </span>
          </button>
        </div>
        
        {/* 日程共有 */}
        <div>
          <button 
            onClick={handleShareDate}
            className="flex flex-col items-center w-full p-3 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            <Calendar size={24} className="text-orange-500 mb-1" />
            <span className="text-xs text-gray-700">日程</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AttachmentOptions;