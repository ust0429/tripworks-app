// src/components/messages/LocationMessageContent.tsx
import React, { useState } from 'react';
import { Map, Navigation } from 'lucide-react';
import { MessageAttachment } from '../../types';

// 環境変数からAPIキーを取得するのが望ましいがここではダミーを使用
const GOOGLE_MAPS_API_KEY = "YOUR_API_KEY";

interface LocationMessageContentProps {
  attachment: MessageAttachment;
  isOwn?: boolean;
}

/**
 * 位置情報メッセージを表示するコンポーネント
 */
const LocationMessageContent: React.FC<LocationMessageContentProps> = ({ attachment, isOwn }) => {
  const [expanded, setExpanded] = useState(false);
  
  // 位置情報がなければプレースホルダーを表示
  if (!attachment.location) {
    return (
      <div className="mt-2 rounded-lg overflow-hidden">
        <div className="bg-gray-200 h-32 flex flex-col items-center justify-center">
          <Map size={24} className="text-gray-400 mb-2" />
          <span className="text-xs text-gray-500">位置情報が利用できません</span>
        </div>
      </div>
    );
  }
  
  const { latitude, longitude, address } = attachment.location;
  
  // Google Maps Static API のURL
  const mapImageUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${latitude},${longitude}&zoom=14&size=300x150&markers=color:red%7C${latitude},${longitude}&key=${GOOGLE_MAPS_API_KEY}`;
  
  // Google Maps へのリンク
  const googleMapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
  
  return (
    <div className={`mt-2 rounded-lg overflow-hidden ${expanded ? 'h-auto' : 'h-32'}`}>
      <div 
        className="relative bg-gray-200 w-full cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        {/* 実際の環境では実際のマップ画像を表示 */}
        {/* 開発環境ではプレースホルダーを表示 */}
        <div className="h-32 flex items-center justify-center">
          <Map size={32} className="text-gray-400" />
        </div>
        
        {/* アドレス情報 */}
        {address && (
          <div className={`px-3 py-2 text-sm ${isOwn ? 'text-white bg-black bg-opacity-70' : 'text-gray-800 bg-white bg-opacity-70'}`}>
            <div className="flex items-center mb-1">
              <Navigation size={14} className={isOwn ? 'text-white mr-1' : 'text-gray-600 mr-1'} />
              <span className="font-medium text-xs">位置情報</span>
            </div>
            <p className="text-xs truncate">{address}</p>
          </div>
        )}
      </div>
      
      {/* 拡張表示時に表示される追加コンテンツ */}
      {expanded && (
        <div className="p-3 bg-gray-100">
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full py-2 bg-blue-500 text-white text-center rounded-lg text-sm font-medium"
          >
            Google Mapsで開く
          </a>
        </div>
      )}
    </div>
  );
};

export default LocationMessageContent;