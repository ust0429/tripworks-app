// src/components/AttenderDetailMap.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { MapPin, Navigation, Maximize2, ExternalLink } from 'lucide-react';
import { AttenderDetailType } from '../types';
import Map, { Marker, NavigationControl, FullscreenControl } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Mapboxのアクセストークン（公開可能なトークンを使用）
const MAPBOX_TOKEN = 'pk.eyJ1IjoibWFwYm94LWdsLWpzIiwiYSI6ImNram9ybGI1ajExYzQycW1xMTdoanVoY3QifQ.Ks2t1hGMNWYW_Pt7fVvLFQ';

interface AttenderDetailMapProps {
  attender: AttenderDetailType;
  height?: number;
  onClick?: () => void;
  showFullMapButton?: boolean;
  showNavigationButton?: boolean;
  location?: { longitude: number; latitude: number };
  zoomLevel?: number;
  mapStyle?: string;
  interactive?: boolean;
}

const AttenderDetailMap: React.FC<AttenderDetailMapProps> = ({ 
  attender, 
  height = 200, 
  onClick,
  showFullMapButton = true,
  showNavigationButton = true,
  location,
  zoomLevel = 14,
  mapStyle = 'mapbox://styles/mapbox/streets-v11',
  interactive = true
}) => {
  // モック座標を生成（本番では実際の座標を使用）
  const [mapLocation, setMapLocation] = useState({
    longitude: location?.longitude || 139.7690,
    latitude: location?.latitude || 35.6804,
    zoom: zoomLevel
  });

  // 座標のモック生成（実際のアプリでは不要）
  useEffect(() => {
    // 位置情報が外部から提供されていない場合にのみ生成
    if (!location) {
      // 東京付近にランダムな座標を生成
      const randomLongitude = 139.7690 + (Math.random() - 0.5) * 0.02; 
      const randomLatitude = 35.6804 + (Math.random() - 0.5) * 0.02;
      
      setMapLocation({
        longitude: randomLongitude,
        latitude: randomLatitude,
        zoom: zoomLevel
      });
    } else {
      setMapLocation({
        longitude: location.longitude,
        latitude: location.latitude,
        zoom: zoomLevel
      });
    }
  }, [location, zoomLevel]);

  // ナビゲーションを開始
  const handleNavigate = useCallback(() => {
    // モバイルデバイス用のナビゲーション
    if (navigator.geolocation && mapLocation) {
      const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${mapLocation.latitude},${mapLocation.longitude}`;
      window.open(mapsUrl, '_blank');
    }
  }, [mapLocation]);

  return (
    <div 
      className="rounded-lg overflow-hidden relative"
      style={{ height: `${height}px` }}
    >
      <Map
        {...mapLocation}
        mapboxAccessToken={MAPBOX_TOKEN}
        style={{ width: '100%', height: '100%' }}
        mapStyle={mapStyle}
        interactive={interactive}
      >
        {/* マーカー表示 */}
        <Marker
          longitude={mapLocation.longitude}
          latitude={mapLocation.latitude}
          anchor="bottom"
        >
          <div className="cursor-pointer">
            <MapPin size={28} className="text-black" />
          </div>
        </Marker>
        
        {/* ナビゲーションコントロール */}
        <NavigationControl position="top-right" showCompass={false} />
      </Map>
      
      {/* オーバーレイコントロール */}
      <div className="absolute bottom-2 right-2 flex space-x-2">
        {/* フルマップ表示ボタン */}
        {showFullMapButton && onClick && (
          <button
            onClick={onClick}
            className="p-2 bg-white rounded-full shadow-md text-gray-700 hover:bg-gray-100 transition-colors"
            aria-label="大きな地図で見る"
          >
            <Maximize2 size={16} />
          </button>
        )}
        
        {/* ナビゲーションボタン */}
        {showNavigationButton && (
          <button
            onClick={handleNavigate}
            className="p-2 bg-white rounded-full shadow-md text-gray-700 hover:bg-gray-100 transition-colors"
            aria-label="ナビゲーションを開始"
          >
            <Navigation size={16} />
          </button>
        )}
      </div>
      
      {/* 地図をクリック可能なことを示すオーバーレイ */}
      {onClick && (
        <div 
          className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 flex items-center justify-center cursor-pointer transition-opacity duration-300"
          onClick={onClick}
        >
          <div className="bg-white text-gray-800 rounded-full px-3 py-1 text-sm shadow-md opacity-0 hover:opacity-100 flex items-center space-x-1 transition-opacity">
            <ExternalLink size={14} />
            <span>大きな地図で見る</span>
          </div>
        </div>
      )}
      
      {/* 住所表示 */}
      <div className="absolute bottom-2 left-2 bg-white bg-opacity-90 rounded-lg px-2 py-1 text-xs text-gray-700 shadow-sm max-w-[70%]">
        {attender.location}
      </div>
    </div>
  );
};

export default AttenderDetailMap;