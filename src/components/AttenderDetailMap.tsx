// src/components/AttenderDetailMap.tsx
import React from 'react';
import Map, { Marker, NavigationControl } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapPin } from 'lucide-react';
import { AttenderDetailType } from '../types';

// Mapboxのアクセストークン（公開可能なトークンを使用）
const MAPBOX_TOKEN = 'pk.eyJ1IjoibWFwYm94LWdsLWpzIiwiYSI6ImNram9ybGI1ajExYzQycW1xMTdoanVoY3QifQ.Ks2t1hGMNWYW_Pt7fVvLFQ';

interface AttenderDetailMapProps {
  attender: AttenderDetailType;
  height?: number | string;
}

const AttenderDetailMap: React.FC<AttenderDetailMapProps> = ({ 
  attender, 
  height = 200 
}) => {
  // ロケーション情報を解析（実際のアプリではDBから座標を取得）
  // ここではロケーション文字列から座標を生成する簡易的な実装
  const getLocationCoordinates = (locationStr: string): [number, number] => {
    // 地域名に応じた座標をモックで返す
    const mockCoordinates: Record<string, [number, number]> = {
      '東京都・新宿区': [139.7030, 35.6938],
      '東京都・目黒区': [139.6970, 35.6414],
      '東京都・墨田区': [139.8107, 35.7095],
      '東京都': [139.7690, 35.6804]
    };
    
    for (const [key, coords] of Object.entries(mockCoordinates)) {
      if (locationStr.includes(key)) {
        return coords;
      }
    }
    
    // デフォルト（東京）
    return [139.7690, 35.6804];
  };
  
  const [longitude, latitude] = getLocationCoordinates(attender.location);
  
  // アテンダーの活動範囲を示す座標（実際はDBから取得）
  // ここでは簡易的に主な活動場所の座標をモックで生成
  const activityPoints = Array.from({ length: 3 }, (_, i) => ({
    id: i + 1,
    longitude: longitude + (Math.random() - 0.5) * 0.02,
    latitude: latitude + (Math.random() - 0.5) * 0.02,
    name: attender.specialties[i % attender.specialties.length]
  }));
  
  return (
    <div style={{ height, borderRadius: '0.5rem', overflow: 'hidden' }}>
      <Map
        initialViewState={{
          longitude,
          latitude,
          zoom: 13
        }}
        mapStyle="mapbox://styles/mapbox/streets-v11"
        mapboxAccessToken={MAPBOX_TOKEN}
        style={{ width: '100%', height: '100%' }}
      >
        {/* メインの位置（アテンダーの拠点） */}
        <Marker
          longitude={longitude}
          latitude={latitude}
          anchor="bottom"
        >
          <div className="flex flex-col items-center">
            <div className="p-1 bg-black rounded-full">
              <MapPin size={20} className="text-white" />
            </div>
            <div className="bg-black text-white text-xs px-2 py-1 rounded mt-1">
              {attender.name}
            </div>
          </div>
        </Marker>
        
        {/* 活動範囲の場所 */}
        {activityPoints.map(point => (
          <Marker
            key={point.id}
            longitude={point.longitude}
            latitude={point.latitude}
            anchor="bottom"
          >
            <MapPin size={16} className="text-gray-700" />
          </Marker>
        ))}
        
        <NavigationControl position="top-right" />
      </Map>
    </div>
  );
};

export default AttenderDetailMap;