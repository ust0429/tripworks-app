// src/components/MapView.tsx
import React, { useState, useCallback } from 'react';
import Map, { Marker, Popup, NavigationControl, GeolocateControl } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapPin } from 'lucide-react';
import { AttenderType } from '../types';

// Mapboxのアクセストークン（公開可能なトークンを使用）
// 実際の開発では環境変数として設定することをお勧めします
const MAPBOX_TOKEN = 'pk.eyJ1IjoibWFwYm94LWdsLWpzIiwiYSI6ImNram9ybGI1ajExYzQycW1xMTdoanVoY3QifQ.Ks2t1hGMNWYW_Pt7fVvLFQ';

interface AttenderWithLocation extends AttenderType {
  longitude: number;
  latitude: number;
}

interface MapViewProps {
  attendersData?: AttenderType[];
  onAttenderClick?: (id: number) => void;
  center?: [number, number]; // [longitude, latitude]
  zoom?: number;
  interactive?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

const MapView: React.FC<MapViewProps> = ({
  attendersData = [],
  onAttenderClick,
  center = [139.7690, 35.6804], // 東京の座標をデフォルトに設定
  zoom = 12,
  interactive = true,
  style,
  className
}) => {
  const [viewState, setViewState] = useState({
    longitude: center[0],
    latitude: center[1],
    zoom: zoom
  });
  const [selectedAttender, setSelectedAttender] = useState<AttenderWithLocation | null>(null);

  // 地図上でのマーカーのクリックハンドラ
  const handleMarkerClick = useCallback((attender: AttenderWithLocation) => {
    setSelectedAttender(attender);
  }, []);

  // アテンダー詳細ページへの遷移
  const handleAttenderSelect = useCallback(() => {
    if (selectedAttender && onAttenderClick) {
      onAttenderClick(selectedAttender.id);
      setSelectedAttender(null);
    }
  }, [selectedAttender, onAttenderClick]);

  // ポップアップを閉じる処理
  const closePopup = useCallback(() => {
    setSelectedAttender(null);
  }, []);

  // モックのアテンダー位置データを生成
  // 実際のアプリではデータベースから座標を取得します
  const attendersWithLocation = attendersData.map((attender): AttenderWithLocation => {
    // デモ用に東京周辺にランダムな位置を生成
    const longitude = center[0] + (Math.random() - 0.5) * 0.05;
    const latitude = center[1] + (Math.random() - 0.5) * 0.05;
    return {
      ...attender,
      longitude,
      latitude
    };
  });

  return (
    <div style={style} className={className}>
      <Map
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        mapStyle="mapbox://styles/mapbox/streets-v11"
        mapboxAccessToken={MAPBOX_TOKEN}
        style={{ width: '100%', height: '100%', borderRadius: '0.5rem' }}
        interactive={interactive}
      >
        {/* 現在地特定ボタン */}
        <GeolocateControl
          positionOptions={{ enableHighAccuracy: true }}
          trackUserLocation={true}
          showUserLocation={true}
        />
        
        {/* ナビゲーションコントロール（ズームなど） */}
        <NavigationControl position="top-right" />
        
        {/* アテンダーのマーカー */}
        {attendersWithLocation.map((attender) => (
          <Marker
            key={attender.id}
            longitude={attender.longitude}
            latitude={attender.latitude}
            anchor="bottom"
            onClick={e => {
              e.originalEvent.stopPropagation();
              handleMarkerClick(attender);
            }}
          >
            <div className="cursor-pointer">
              <MapPin size={28} className="text-black" />
            </div>
          </Marker>
        ))}
        
        {/* 選択中アテンダーのポップアップ */}
        {selectedAttender && (
          <Popup
            longitude={selectedAttender.longitude}
            latitude={selectedAttender.latitude}
            anchor="bottom"
            onClose={closePopup}
            closeButton={true}
            closeOnClick={false}
            className="rounded-lg"
          >
            <div className="p-2" style={{ minWidth: '200px' }}>
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                  {React.cloneElement(selectedAttender.icon, { size: 16, className: "text-gray-600" })}
                </div>
                <div>
                  <h3 className="font-medium text-sm">{selectedAttender.name}</h3>
                  <p className="text-xs text-gray-500">{selectedAttender.type}</p>
                </div>
              </div>
              <p className="text-xs text-gray-700 mb-2 line-clamp-2">{selectedAttender.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">{selectedAttender.distance}</span>
                <button 
                  onClick={handleAttenderSelect}
                  className="text-xs bg-black text-white px-3 py-1 rounded-lg"
                >
                  詳細を見る
                </button>
              </div>
            </div>
          </Popup>
        )}
      </Map>
    </div>
  );
};

export default MapView;