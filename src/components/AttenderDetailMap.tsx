// src/components/AttenderDetailMap.tsx
import React from 'react';
import { MapPin } from 'lucide-react';
import { AttenderDetailType } from '../types';

interface AttenderDetailMapProps {
  attender: AttenderDetailType;
  height?: number;
  onClick?: () => void;
}

const AttenderDetailMap: React.FC<AttenderDetailMapProps> = ({ 
  attender, 
  height = 200, 
  onClick 
}) => {
  // 実際のアプリでは地図APIを使用して実際の地図を表示する
  // 今回はモックの表示のみ
  
  return (
    <div 
      className="bg-gray-100 rounded-lg flex items-center justify-center relative overflow-hidden"
      style={{ height: `${height}px` }}
      onClick={onClick}
    >
      <div className="text-center">
        <MapPin size={32} className="text-gray-400 mx-auto mb-2" />
        <p className="text-gray-500 text-sm font-medium">{attender.location}</p>
      </div>
      
      {/* 地図をクリック可能なことを示すオーバーレイ（オプション） */}
      {onClick && (
        <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 flex items-center justify-center">
          <div className="bg-white text-gray-800 rounded-full px-3 py-1 text-sm font-medium opacity-0 hover:opacity-100">
            大きな地図で見る
          </div>
        </div>
      )}
    </div>
  );
};

export default AttenderDetailMap;