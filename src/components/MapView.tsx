// src/components/MapView.tsx
import React, { useState, useCallback, useEffect, useRef } from 'react';
import Map, { 
  Marker, 
  Popup, 
  NavigationControl, 
  GeolocateControl, 
  ScaleControl,
  FullscreenControl,
  ViewStateChangeEvent,
  MapRef,
  Source,
  Layer
} from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapPin, Map as MapIcon, LocateFixed } from 'lucide-react';
import { AttenderType } from '../types';

// Mapboxのアクセストークン（公開可能なトークンを使用）
// 実際の開発では環境変数として設定することをお勧めします
const MAPBOX_TOKEN = 'pk.eyJ1IjoibWFwYm94LWdsLWpzIiwiYSI6ImNram9ybGI1ajExYzQycW1xMTdoanVoY3QifQ.Ks2t1hGMNWYW_Pt7fVvLFQ';

// マップスタイルのオプション
const MAP_STYLES = {
  streets: 'mapbox://styles/mapbox/streets-v11',
  outdoors: 'mapbox://styles/mapbox/outdoors-v11',
  light: 'mapbox://styles/mapbox/light-v10',
  dark: 'mapbox://styles/mapbox/dark-v10',
  satellite: 'mapbox://styles/mapbox/satellite-v9',
  satelliteStreets: 'mapbox://styles/mapbox/satellite-streets-v11'
};

export interface AttenderWithLocation extends AttenderType {
  longitude: number;
  latitude: number;
  markerColor?: string;
  markerSize?: number;
  isHighlighted?: boolean;
  infoText?: string;
}

interface MapViewProps {
  attendersData?: AttenderType[];
  customMarkers?: AttenderWithLocation[];
  onAttenderClick?: (id: number) => void;
  center?: [number, number]; // [longitude, latitude]
  zoom?: number;
  interactive?: boolean;
  style?: React.CSSProperties;
  className?: string;
  showControls?: boolean;
  showFullscreen?: boolean;
  showStyleSelector?: boolean;
  showUserLocation?: boolean;
  followUserLocation?: boolean;
  mapStyle?: keyof typeof MAP_STYLES;
  routePath?: [number, number][]; // 経路データ（座標の配列）
  routeColor?: string;
  onMapLoad?: () => void;
  onMapMove?: (viewState: {longitude: number; latitude: number; zoom: number}) => void;
}

const MapView: React.FC<MapViewProps> = ({
  attendersData = [],
  customMarkers = [],
  onAttenderClick,
  center = [139.7690, 35.6804], // 東京の座標をデフォルトに設定
  zoom = 12,
  interactive = true,
  style,
  className,
  showControls = true,
  showFullscreen = false,
  showStyleSelector = false,
  showUserLocation = true,
  followUserLocation = false,
  mapStyle = 'streets',
  routePath,
  routeColor = '#3b82f6', // デフォルトは青色
  onMapLoad,
  onMapMove
}) => {
  const [viewState, setViewState] = useState({
    longitude: center[0],
    latitude: center[1],
    zoom: zoom
  });
  const [selectedAttender, setSelectedAttender] = useState<AttenderWithLocation | null>(null);
  const [currentMapStyle, setCurrentMapStyle] = useState<keyof typeof MAP_STYLES>(mapStyle);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [userLocation, setUserLocation] = useState<{longitude: number; latitude: number} | null>(null);
  const [showStyleMenu, setShowStyleMenu] = useState(false);
  
  const mapRef = useRef<MapRef>(null);
  
  // 初期表示位置の更新
  useEffect(() => {
    setViewState(prev => ({
      ...prev,
      longitude: center[0],
      latitude: center[1],
      zoom
    }));
  }, [center, zoom]);
  
  // 地図の移動イベント処理
  const handleViewStateChange = useCallback((evt: ViewStateChangeEvent) => {
    setViewState(evt.viewState);
    if (onMapMove) {
      onMapMove(evt.viewState);
    }
  }, [onMapMove]);
  
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
  
  // 地図スタイルの変更
  const changeMapStyle = useCallback((style: keyof typeof MAP_STYLES) => {
    setCurrentMapStyle(style);
    setShowStyleMenu(false);
  }, []);
  
  // フルスクリーン切替
  const toggleFullscreen = useCallback(() => {
    const newState = !isFullscreen;
    setIsFullscreen(newState);
    
    // フルスクリーン時のスタイル変更
    const mapContainer = document.getElementById('map-container');
    if (mapContainer) {
      if (newState) {
        mapContainer.style.position = 'fixed';
        mapContainer.style.top = '0';
        mapContainer.style.left = '0';
        mapContainer.style.right = '0';
        mapContainer.style.bottom = '0';
        mapContainer.style.zIndex = '1000';
        mapContainer.style.width = '100%';
        mapContainer.style.height = '100%';
        mapContainer.style.borderRadius = '0';
      } else {
        mapContainer.style.position = '';
        mapContainer.style.top = '';
        mapContainer.style.left = '';
        mapContainer.style.right = '';
        mapContainer.style.bottom = '';
        mapContainer.style.zIndex = '';
        mapContainer.style.width = '';
        mapContainer.style.height = '';
        mapContainer.style.borderRadius = '';
      }
    }
  }, [isFullscreen]);
  
  // ユーザー位置の更新処理
  const handleGeolocate = useCallback((position: GeolocationPosition) => {
    const { longitude, latitude } = position.coords;
    setUserLocation({ longitude, latitude });
  }, []);
  
  // 現在位置へのズーム
  const flyToUserLocation = useCallback(() => {
    if (userLocation && mapRef.current) {
      mapRef.current.flyTo({
        center: [userLocation.longitude, userLocation.latitude],
        zoom: 15,
        duration: 2000
      });
    }
  }, [userLocation]);
  
  // モックのアテンダー位置データを生成
  // 実際のアプリではデータベースから座標を取得します
  const attendersWithLocation: AttenderWithLocation[] = [
    ...customMarkers,
    ...attendersData.map((attender): AttenderWithLocation => {
      // デモ用に東京周辺にランダムな位置を生成
      const longitude = center[0] + (Math.random() - 0.5) * 0.05;
      const latitude = center[1] + (Math.random() - 0.5) * 0.05;
      return {
        ...attender,
        longitude,
        latitude,
        markerColor: '#000000', // デフォルトはブラック
        markerSize: 28,
        isHighlighted: false
      };
    })
  ];

  // マップがロード完了時のコールバック
  const handleMapLoad = useCallback(() => {
    if (onMapLoad) {
      onMapLoad();
    }
    
    // ルートパスがあれば、地図の範囲を調整
    if (routePath && routePath.length > 0 && mapRef.current) {
      // 経路全体が見えるように地図を調整する処理を追加
      // 現在は実装なし
    }
  }, [onMapLoad, routePath]);

  return (
    <div id="map-container" style={style} className={`relative ${className || ''}`}>
      <Map
        ref={mapRef}
        {...viewState}
        onMove={handleViewStateChange}
        mapStyle={MAP_STYLES[currentMapStyle]}
        mapboxAccessToken={MAPBOX_TOKEN}
        style={{ width: '100%', height: '100%', borderRadius: '0.5rem' }}
        interactive={interactive}
        onLoad={handleMapLoad}
      >
        {/* ルート表示 */}
        {routePath && routePath.length > 1 && (
          <Source
            id="route"
            type="geojson"
            data={{
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'LineString',
                coordinates: routePath
              }
            }}
          >
            <Layer
              id="route-line"
              type="line"
              layout={{
                'line-join': 'round',
                'line-cap': 'round'
              }}
              paint={{
                'line-color': routeColor,
                'line-width': 4,
                'line-opacity': 0.8
              }}
            />
          </Source>
        )}
        
        {/* 現在地特定ボタン */}
        {showUserLocation && (
          <GeolocateControl
            positionOptions={{ enableHighAccuracy: true }}
            trackUserLocation={followUserLocation}
            showUserLocation={true}
            onGeolocate={handleGeolocate}
            style={{ margin: 10 }}
            fitBoundsOptions={{ maxZoom: 15 }}
          />
        )}
        
        {/* コントロール表示 */}
        {showControls && (
          <>
            {/* ナビゲーションコントロール（ズームなど） */}
            <NavigationControl position="top-right" />
            
            {/* スケールコントロール */}
            <ScaleControl position="bottom-left" />
          </>
        )}
        
        {/* フルスクリーンコントロール */}
        {showFullscreen && (
          <FullscreenControl position="top-right" />
        )}
        
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
            <div className={`cursor-pointer transition-all duration-300 ${attender.isHighlighted ? 'scale-125' : ''}`}>
              <MapPin 
                size={attender.markerSize || 28} 
                className={`${attender.isHighlighted ? 'text-red-500 drop-shadow-lg' : 'text-black'}`}
                color={attender.markerColor}
                fill={attender.isHighlighted ? '#ef4444' : 'none'}
              />
              {attender.infoText && (
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white px-2 py-0.5 rounded-full text-xs whitespace-nowrap">
                  {attender.infoText}
                </div>
              )}
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
            className="rounded-lg shadow-lg"
            maxWidth="300px"
          >
            <div className="p-3">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                  {React.cloneElement(selectedAttender.icon, { size: 18, className: "text-gray-700" })}
                </div>
                <div>
                  <h3 className="font-medium text-sm">{selectedAttender.name}</h3>
                  <p className="text-xs text-gray-500">{selectedAttender.type}</p>
                </div>
              </div>
              <p className="text-sm text-gray-700 mb-3 line-clamp-3">{selectedAttender.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">{selectedAttender.distance}</span>
                <button 
                  onClick={handleAttenderSelect}
                  className="text-xs bg-black text-white px-3 py-1.5 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  詳細を見る
                </button>
              </div>
            </div>
          </Popup>
        )}
      </Map>
      
      {/* マップコントロールオーバーレイ */}
      <div className="absolute bottom-4 left-4 flex flex-col space-y-2">
        {/* 地図スタイル選択ボタン */}
        {showStyleSelector && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <button
              onClick={() => setShowStyleMenu(!showStyleMenu)}
              className="p-2 bg-white text-gray-700 hover:bg-gray-100"
              aria-label="地図スタイル"
            >
              <MapIcon size={20} />
            </button>
            
            {showStyleMenu && (
              <div className="p-2 bg-white">
                <div className="space-y-1">
                  {Object.keys(MAP_STYLES).map((style) => (
                    <button
                      key={style}
                      onClick={() => changeMapStyle(style as keyof typeof MAP_STYLES)}
                      className={`w-full text-left px-2 py-1 text-sm rounded ${
                        currentMapStyle === style ? 'bg-gray-100 font-medium' : 'hover:bg-gray-50'
                      }`}
                    >
                      {style.charAt(0).toUpperCase() + style.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* 現在地ボタン */}
        {userLocation && (
          <button
            onClick={flyToUserLocation}
            className="p-2 bg-white rounded-lg shadow-md text-gray-700 hover:bg-gray-100"
            aria-label="現在地へ移動"
          >
            <LocateFixed size={20} />
          </button>
        )}
        
        {/* フルスクリーンボタン（オーバーレイ版） */}
        {!showFullscreen && (
          <button
            onClick={toggleFullscreen}
            className="p-2 bg-white rounded-lg shadow-md text-gray-700 hover:bg-gray-100"
            aria-label={isFullscreen ? "フルスクリーン解除" : "フルスクリーン表示"}
          >
            {isFullscreen ? (
              <div className="w-5 h-5 border-2 border-gray-700 rounded-sm"></div>
            ) : (
              <div className="w-5 h-5 border-2 border-gray-700 rounded-sm flex items-center justify-center">
                <div className="w-3 h-3 bg-gray-700"></div>
              </div>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default MapView;