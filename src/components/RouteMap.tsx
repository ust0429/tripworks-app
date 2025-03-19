// src/components/RouteMap.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MapPin, Clock, Navigation, MoreHorizontal, Info, User, ArrowRight } from 'lucide-react';
import Map, { 
  Marker, 
  NavigationControl, 
  GeolocateControl,
  FullscreenControl,
  Source,
  Layer,
  MapRef
} from 'react-map-gl';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Mapboxのアクセストークン
const MAPBOX_TOKEN = 'pk.eyJ1IjoibWFwYm94LWdsLWpzIiwiYSI6ImNram9ybGI1ajExYzQycW1xMTdoanVoY3QifQ.Ks2t1hGMNWYW_Pt7fVvLFQ';

export interface RoutePoint {
  id: string;
  name: string;
  description?: string;
  longitude: number;
  latitude: number;
  time?: string; // 訪問予定時刻
  icon?: React.ReactNode; // カスタムアイコン
  color?: string; // マーカーの色
  isHighlighted?: boolean; // ハイライト表示するか
}

interface RouteMapProps {
  points: RoutePoint[];
  routePath?: [number, number][]; // 経路の座標配列
  height?: number | string;
  className?: string;
  style?: React.CSSProperties;
  initialZoom?: number;
  showFullscreenControl?: boolean;
  showUserLocation?: boolean;
  showNavigationButton?: boolean;
  showRouteInfo?: boolean;
  routeColor?: string;
  onPointClick?: (point: RoutePoint) => void;
  onNavigateClick?: (start: RoutePoint, end: RoutePoint) => void;
  hideMap?: boolean; // マップを非表示にして、テキストのみ表示
}

const RouteMap: React.FC<RouteMapProps> = ({
  points,
  routePath,
  height = 400,
  className = '',
  style = {},
  initialZoom = 13,
  showFullscreenControl = true,
  showUserLocation = true,
  showNavigationButton = true,
  showRouteInfo = true,
  routeColor = '#3b82f6', // デフォルトは青色
  onPointClick,
  onNavigateClick,
  hideMap = false
}) => {
  const [selectedPoint, setSelectedPoint] = useState<RoutePoint | null>(null);
  const [viewState, setViewState] = useState({
    longitude: 0,
    latitude: 0,
    zoom: initialZoom
  });
  
  const mapRef = useRef<MapRef>(null);
  
  // 地図の初期表示範囲を設定
  useEffect(() => {
    if (points.length > 0) {
      if (points.length === 1) {
        // 1点のみの場合はその位置を中心に
        setViewState({
          longitude: points[0].longitude,
          latitude: points[0].latitude,
          zoom: initialZoom
        });
      } else {
        // 複数点がある場合は全点を表示する範囲に設定
        const bounds = new mapboxgl.LngLatBounds();
        points.forEach(point => {
          bounds.extend([point.longitude, point.latitude]);
        });
        
        if (mapRef.current) {
          // 型アサーションを使用して型エラーを解決
          const cameraOptions = mapRef.current.cameraForBounds(bounds, { padding: 80 }) as {
            longitude: number;
            latitude: number;
            zoom: number;
          } | null;
          
          const { longitude, latitude, zoom } = cameraOptions || {
            longitude: 0,
            latitude: 0,
            zoom: initialZoom
          };
          
          setViewState({
            longitude,
            latitude,
            zoom: zoom || initialZoom
          });
        }
      }
    }
  }, [points, initialZoom]);
  
  // マーカークリック処理
  const handleMarkerClick = useCallback((point: RoutePoint) => {
    setSelectedPoint(point);
    if (onPointClick) {
      onPointClick(point);
    }
  }, [onPointClick]);
  
  // ナビゲーション開始
  const handleNavigateClick = useCallback(() => {
    if (points.length >= 2 && onNavigateClick) {
      onNavigateClick(points[0], points[points.length - 1]);
    } else if (points.length > 0) {
      // Google マップで目的地を開く
      const destination = selectedPoint || points[0];
      const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${destination.latitude},${destination.longitude}`;
      window.open(mapsUrl, '_blank');
    }
  }, [points, selectedPoint, onNavigateClick]);
  
  // テキストのみの表示（マップ非表示時）
  if (hideMap) {
    return (
      <div className={`bg-gray-50 p-4 rounded-lg ${className}`} style={style}>
        <h3 className="font-medium text-sm mb-3">ルート情報</h3>
        <ul className="space-y-3">
          {points.map((point, index) => (
            <li key={point.id} className="flex items-start">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-white shadow-sm border border-gray-200 flex items-center justify-center text-xs font-medium mr-2 mt-0.5">
                {index + 1}
              </div>
              <div className="flex-1">
                <div className="font-medium text-sm">{point.name}</div>
                {point.description && (
                  <div className="text-xs text-gray-500 mt-0.5">{point.description}</div>
                )}
                {point.time && (
                  <div className="flex items-center text-xs text-gray-500 mt-1">
                    <Clock size={12} className="mr-1" />
                    {point.time}
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
        
        {showNavigationButton && points.length > 0 && (
          <button
            onClick={handleNavigateClick}
            className="mt-4 w-full flex items-center justify-center py-2 bg-black text-white rounded-lg text-sm font-medium"
          >
            <Navigation size={14} className="mr-1" />
            ナビゲーションを開始
          </button>
        )}
      </div>
    );
  }
  
  // マップ表示
  return (
    <div 
      className={`relative rounded-lg overflow-hidden ${className}`} 
      style={{ ...style, height: typeof height === 'number' ? `${height}px` : height }}
    >
      <Map
        ref={mapRef}
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        mapStyle="mapbox://styles/mapbox/streets-v11"
        mapboxAccessToken={MAPBOX_TOKEN}
        style={{ width: '100%', height: '100%' }}
      >
        {/* 経路描画 */}
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
        
        {/* ポイントのマーカー表示 */}
        {points.map((point, index) => (
          <Marker
            key={point.id}
            longitude={point.longitude}
            latitude={point.latitude}
            anchor="bottom"
            onClick={e => {
              e.originalEvent.stopPropagation();
              handleMarkerClick(point);
            }}
          >
            <div 
              className={`cursor-pointer transition-all duration-300 ${
                point.isHighlighted || selectedPoint?.id === point.id 
                  ? 'scale-110 z-10' 
                  : ''
              }`}
            >
              {point.icon ? (
                point.icon
              ) : (
                <div className="relative">
                  <MapPin 
                    size={30} 
                    className={`text-${point.color || 'black'}`}
                    fill={point.isHighlighted || selectedPoint?.id === point.id ? (point.color || '#ef4444') : 'none'} 
                  />
                  <div 
                    className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-[60%] 
                    w-5 h-5 rounded-full flex items-center justify-center
                    ${point.isHighlighted || selectedPoint?.id === point.id 
                      ? 'bg-white text-black' 
                      : 'bg-black text-white'
                    }`}
                  >
                    <span className="text-xs font-medium">{index + 1}</span>
                  </div>
                </div>
              )}
              {point.time && selectedPoint?.id === point.id && (
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                  <div className="bg-black text-white px-2 py-0.5 rounded text-xs shadow-lg">
                    {point.time}
                  </div>
                </div>
              )}
            </div>
          </Marker>
        ))}
        
        {/* 地図コントロール */}
        <NavigationControl position="top-right" />
        
        {showUserLocation && (
          <GeolocateControl
            positionOptions={{ enableHighAccuracy: true }}
            trackUserLocation={true}
            showUserLocation={true}
          />
        )}
        
        {showFullscreenControl && (
          <FullscreenControl position="top-right" />
        )}
      </Map>
      
      {/* ルート情報パネル */}
      {showRouteInfo && points.length > 0 && (
        <div className="absolute bottom-0 left-0 right-0 bg-white bg-opacity-90 rounded-t-lg shadow-md p-3 max-h-40 overflow-y-auto">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium text-sm">ルート情報</h3>
            {showNavigationButton && (
              <button
                onClick={handleNavigateClick}
                className="text-xs bg-black text-white px-2 py-1 rounded-full flex items-center"
              >
                <Navigation size={12} className="mr-1" />
                ナビ開始
              </button>
            )}
          </div>
          
          <div className="space-y-2">
            {points.length === 1 ? (
              <div className="flex items-center">
                <div className="w-5 h-5 rounded-full bg-black text-white flex items-center justify-center text-xs mr-2">
                  1
                </div>
                <div>
                  <div className="text-sm font-medium">{points[0].name}</div>
                  {points[0].time && (
                    <div className="text-xs text-gray-500 flex items-center">
                      <Clock size={10} className="mr-0.5" />
                      {points[0].time}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-stretch">
                <div className="flex flex-col items-center mr-2">
                  <div className="w-5 h-5 rounded-full bg-black text-white flex items-center justify-center text-xs">
                    1
                  </div>
                  <div className="flex-1 w-0.5 bg-gray-300 my-1"></div>
                  <div className="w-5 h-5 rounded-full bg-black text-white flex items-center justify-center text-xs">
                    {points.length}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium">{points[0].name}</div>
                  {points[0].time && (
                    <div className="text-xs text-gray-500 flex items-center">
                      <Clock size={10} className="mr-0.5" />
                      {points[0].time}
                    </div>
                  )}
                  
                  <div className="flex items-center my-1 text-xs text-gray-500">
                    <ArrowRight size={10} className="mx-1" />
                    {points.length - 2 > 0 && `${points.length - 2}箇所を経由`}
                  </div>
                  
                  <div className="text-sm font-medium">{points[points.length - 1].name}</div>
                  {points[points.length - 1].time && (
                    <div className="text-xs text-gray-500 flex items-center">
                      <Clock size={10} className="mr-0.5" />
                      {points[points.length - 1].time}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RouteMap;