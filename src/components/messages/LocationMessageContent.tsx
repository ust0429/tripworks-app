// src/components/messages/LocationMessageContent.tsx
import React, { useEffect, useRef, useState } from 'react';
import { Map as MapIcon, ExternalLink, Navigation, Copy, Check, MapPin } from 'lucide-react';
import { MessageAttachment } from '../../types';
import Map, { Marker, NavigationControl } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Mapbox access token
const MAPBOX_TOKEN = 'pk.eyJ1IjoibWFwYm94LWdsLWpzIiwiYSI6ImNram9ybGI1ajExYzQycW1xMTdoanVoY3QifQ.Ks2t1hGMNWYW_Pt7fVvLFQ';

interface LocationMessageContentProps {
  attachment: MessageAttachment;
  isOwn?: boolean;
  onClick?: () => void;
  onNavigateClick?: () => void;
  interactive?: boolean;
  height?: number;
}

const LocationMessageContent: React.FC<LocationMessageContentProps> = ({ 
  attachment, 
  isOwn = false,
  onClick,
  onNavigateClick,
  interactive = true,
  height = 150
}) => {
  const [copied, setCopied] = useState(false);
  const [showActions, setShowActions] = useState(false);
  
  if (!attachment.location) {
    return (
      <div className="flex items-center justify-center p-4 bg-gray-100 rounded-lg">
        <p className="text-gray-500">位置情報が見つかりません</p>
      </div>
    );
  }
  
  // location が undefined でないことを確認済み
  const { latitude, longitude, address } = attachment.location!;
  
  // Google Mapsへのリンク
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
  
  // Apple Mapsへのリンク（iOSデバイス用）
  const appleMapsUrl = `https://maps.apple.com/?q=${latitude},${longitude}`;
  
  // プラットフォームに応じたマップリンクを生成
  const getMapLink = () => {
    // iOS端末の場合はApple Maps、それ以外はGoogle Maps
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    return isIOS ? appleMapsUrl : googleMapsUrl;
  };
  
  // 座標をコピー
  const handleCopyLocation = () => {
    navigator.clipboard.writeText(`${latitude},${longitude}`).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  
  // ナビゲーション開始
  const handleNavigate = () => {
    if (onNavigateClick) {
      onNavigateClick();
    } else {
      window.open(getMapLink(), '_blank');
    }
  };
  
  return (
    <div 
      className="overflow-hidden rounded-lg bg-white shadow-sm"
      onClick={() => showActions ? setShowActions(false) : onClick && onClick()}
    >
      {/* 地図表示 */}
      <div 
        className="relative"
        style={{ height: `${height}px` }}
      >
        <Map
          initialViewState={{
            longitude,
            latitude,
            zoom: 14
          }}
          mapStyle="mapbox://styles/mapbox/streets-v11"
          mapboxAccessToken={MAPBOX_TOKEN}
          style={{ width: '100%', height: '100%' }}
          interactive={interactive}
          attributionControl={false}
        >
          <Marker
            longitude={longitude}
            latitude={latitude}
            anchor="bottom"
          >
            <MapPin 
              size={36} 
              className="text-red-500" 
              fill="#ef4444" 
              strokeWidth={2}
              stroke="#ffffff"
            />
          </Marker>
          
          {interactive && <NavigationControl position="top-right" showCompass={false} />}
        </Map>
        
        {/* アクションボタン */}
        {!showActions && interactive && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowActions(true);
            }}
            className="absolute bottom-2 right-2 bg-white rounded-full p-2 shadow-md text-gray-700 hover:bg-gray-50"
            aria-label="その他のオプション"
          >
            <MapIcon size={18} />
          </button>
        )}
        
        {/* アクションメニュー */}
        {showActions && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div 
              className="bg-white rounded-lg overflow-hidden shadow-lg w-64"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-3 border-b">
                <h3 className="font-medium">位置情報アクション</h3>
                <p className="text-xs text-gray-500 mt-1">
                  {address || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`}
                </p>
              </div>
              
              <div className="p-1">
                <button
                  onClick={handleNavigate}
                  className="flex items-center w-full p-2 text-left hover:bg-gray-100 rounded-md"
                >
                  <Navigation size={18} className="mr-2 text-blue-600" />
                  <span>ナビゲーションを開始</span>
                </button>
                
                <button
                  onClick={handleCopyLocation}
                  className="flex items-center w-full p-2 text-left hover:bg-gray-100 rounded-md"
                >
                  {copied ? (
                    <Check size={18} className="mr-2 text-green-600" />
                  ) : (
                    <Copy size={18} className="mr-2 text-gray-600" />
                  )}
                  <span>{copied ? 'コピーしました' : '座標をコピー'}</span>
                </button>
                
                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center w-full p-2 text-left hover:bg-gray-100 rounded-md"
                >
                  <ExternalLink size={18} className="mr-2 text-gray-600" />
                  <span>Google Mapsで開く</span>
                </a>
              </div>
              
              <div className="p-2 bg-gray-50">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowActions(false);
                  }}
                  className="w-full p-2 text-center text-gray-700 font-medium"
                >
                  キャンセル
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* 住所表示 */}
      {address && (
        <div className="px-3 py-2 text-sm text-gray-700 border-t border-gray-100">
          <div className="flex items-start">
            <MapPin size={14} className="text-gray-500 mt-0.5 mr-1 flex-shrink-0" />
            <span className="line-clamp-2">{address}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationMessageContent;