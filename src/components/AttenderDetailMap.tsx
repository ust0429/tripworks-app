// src/components/AttenderDetailMap.tsx
import React from 'react';
import { MapPin } from 'lucide-react';
import { AttenderDetailType } from '../types';

// 実際にはMapboxなどのライブラリを使用
interface AttenderDetailMapProps {
  attender: AttenderDetailType;
  height?: number | string;
}

const AttenderDetailMap: React.FC<AttenderDetailMapProps> = ({ 
  attender, 
  height = 200 
}) => {
  // ロケーション情報を解析（実際のアプリではDBから座標を取得）
  // ここではモックマップを表示する簡易実装
  
  return (
    <div 
      style={{ 
        height, 
        borderRadius: '0.5rem', 
        overflow: 'hidden',
        backgroundColor: '#e5e7eb',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative'
      }}
    >
      {/* モックマップ表示 */}
      <div className="text-gray-400 text-center">
        <div className="flex justify-center mb-2">
          <MapPin size={32} className="text-gray-500" />
        </div>
        <p className="text-sm text-gray-600">
          {attender.name}さんの活動エリア: {attender.location}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          （地図データ読み込み中）
        </p>
      </div>
      
      {/* モック地図のポイント */}
      <div className="absolute left-1/4 top-1/3">
        <div className="w-2 h-2 bg-black rounded-full" />
      </div>
      <div className="absolute right-1/3 top-1/2">
        <div className="w-2 h-2 bg-black rounded-full" />
      </div>
      <div className="absolute left-1/2 bottom-1/4">
        <div className="w-2 h-2 bg-black rounded-full" />
      </div>
      
      {/* メインロケーション */}
      <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <div className="p-1 bg-black rounded-full">
          <MapPin size={16} className="text-white" />
        </div>
      </div>
    </div>
  );
};

export default AttenderDetailMap;