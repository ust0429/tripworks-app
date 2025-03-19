import React, { useEffect, useRef, useState } from 'react';
import { Map, ExternalLink } from 'lucide-react';
import { MessageAttachment } from '../../types';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Mapbox access token (実際は環境変数から取得する)
mapboxgl.accessToken = 'YOUR_MAPBOX_ACCESS_TOKEN';

interface LocationMessageContentProps {
  attachment: MessageAttachment;
  isOwn?: boolean;
}

const LocationMessageContent: React.FC<LocationMessageContentProps> = ({ attachment, isOwn }) => {
  const mapContainerId = `map-${attachment.id}`;
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapReady, setMapReady] = useState(false);
  
  useEffect(() => {
    if (!attachment.location) return;
    
    // マップを初期化
    // 実際のアプリでは、Mapboxのアクセストークンを設定する必要がある
    // ここではモック表示にする
    const initializeMap = () => {
      if (!mapContainer.current) return;
      
      try {
        // location が undefined でないことを確認済み
        const { latitude, longitude } = attachment.location!;
        
        // マップが未初期化の場合は初期化
        if (!map.current) {
          map.current = new mapboxgl.Map({
            container: mapContainerId,
            style: 'mapbox://styles/mapbox/streets-v11',
            center: [longitude, latitude],
            zoom: 14
          });
          
          // マップが読み込まれたらマーカーを追加
          map.current.on('load', () => {
            if (!map.current) return;
            
            // マーカーを追加
            new mapboxgl.Marker({ color: '#ff0000' })
              .setLngLat([longitude, latitude])
              .addTo(map.current);
              
            setMapReady(true);
          });
        }
      } catch (error) {
        console.error('マップの初期化に失敗しました:', error);
        // マップが初期化できない場合はモック表示
        setMapReady(false);
      }
    };
    
    initializeMap();
    
    // クリーンアップ関数
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [attachment.id, attachment.location, mapContainerId]);
  
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
  
  return (
    <div className="overflow-hidden rounded-lg">
      {/* 住所表示 */}
      {address && (
        <div className="p-2 bg-white text-gray-800 text-sm">
          {address}
        </div>
      )}
      
      {/* マップ表示 */}
      <div 
        id={mapContainerId}
        ref={mapContainer}
        className="h-40 bg-gray-100 relative"
      >
        {!mapReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
            <Map size={24} className="text-gray-400 mr-2" />
            <span className="text-gray-500">地図を読み込み中...</span>
          </div>
        )}
      </div>
      
      {/* 外部マップアプリで開くボタン */}
      <div className="p-2 bg-white border-t">
        <a
          href={getMapLink()}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center w-full py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium"
        >
          <ExternalLink size={16} className="mr-1" />
          マップアプリで開く
        </a>
      </div>
    </div>
  );
};

export default LocationMessageContent;