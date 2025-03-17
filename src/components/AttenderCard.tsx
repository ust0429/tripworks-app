// AttenderCard.tsx
import React, { useState } from 'react';
import { Star, Heart } from 'lucide-react';
import DirectRequestModal from './DirectRequestModal';
import { AttenderType } from '../types';
import { useAuth } from '../AuthComponents';

interface AttenderCardProps {
  attender: AttenderType;
  compact?: boolean;
  onClick?: () => void;
}

const AttenderCard: React.FC<AttenderCardProps> = ({ attender, compact = false, onClick }) => {
  const [directRequestModalOpen, setDirectRequestModalOpen] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const { isAuthenticated, openLoginModal } = useAuth();

  const handleRequestClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // 親要素へのクリックイベントの伝播を防止
    if (isAuthenticated) {
      setDirectRequestModalOpen(true);
    } else {
      openLoginModal();
    }
  };

  const handleFavoriteToggle = (e: React.MouseEvent) => {
    e.stopPropagation(); // 親要素へのクリックイベントの伝播を防止
    if (isAuthenticated) {
      setIsFavorite(!isFavorite);
      // TODO: お気に入り状態をサーバーに保存する処理
    } else {
      openLoginModal();
    }
  };

  if (compact) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-3 flex items-center space-x-3" onClick={onClick}>
        <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded-full overflow-hidden flex items-center justify-center">
          {attender.icon ? React.cloneElement(attender.icon, { size: 24, className: "text-gray-600" }) : null}
        </div>
        <div className="flex-1">
          <div className="flex justify-between">
            <div>
              <p className="font-medium">{attender.name}</p>
              <p className="text-sm text-gray-500">{attender.type}</p>
            </div>
            <div className="flex items-center">
              <Star size={16} className="text-yellow-500" />
              <span className="text-sm ml-1">{attender.rating}</span>
            </div>
          </div>
          <div className="flex justify-between items-center mt-1">
            <p className="text-sm text-gray-700">{attender.distance}</p>
            <div className="flex items-center space-x-2">
              <button 
                onClick={handleFavoriteToggle} 
                className="p-1 rounded-full hover:bg-gray-100">
                <Heart 
                  size={16} 
                  className={isFavorite ? "text-red-500 fill-current" : "text-gray-400"} 
                />
              </button>
              <button 
                onClick={handleRequestClick} 
                className="px-3 py-1 bg-black text-white rounded-lg text-xs">
                リクエスト
              </button>
            </div>
          </div>
        </div>
        
        {/* 直接リクエストモーダル */}
        {directRequestModalOpen && (
          <DirectRequestModal 
            attender={attender}
            onClose={() => setDirectRequestModalOpen(false)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden" onClick={onClick}>
      <div className="h-40 bg-gray-100 relative flex items-center justify-center">
        {/* アテンダーのアイコン (大きく表示) */}
        {attender.icon ? React.cloneElement(attender.icon, { size: 64, className: "text-gray-400 opacity-30" }) : null}
        <div className="absolute bottom-3 left-3 bg-white rounded-full p-1 px-3 text-sm font-medium">
          {attender.type}
        </div>
        <button 
          onClick={handleFavoriteToggle}
          className="absolute top-3 right-3 bg-white rounded-full p-2 shadow-sm"
        >
          <Heart 
            size={16} 
            className={isFavorite ? "text-red-500 fill-current" : "text-gray-700"} 
          />
        </button>
      </div>
      <div className="p-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gray-200 rounded-full overflow-hidden flex items-center justify-center">
              {attender.icon ? React.cloneElement(attender.icon, { size: 20, className: "text-gray-600" }) : null}
            </div>
            <p className="font-medium">{attender.name}</p>
          </div>
          <div className="flex items-center">
            <Star size={16} className="text-yellow-500" />
            <span className="text-sm ml-1">{attender.rating}</span>
          </div>
        </div>
        <p className="text-sm text-gray-700 mt-2">{attender.description}</p>
        <div className="flex justify-between items-center mt-3">
          <p className="text-sm text-gray-500">{attender.distance}</p>
          <button 
            onClick={handleRequestClick}
            className="px-4 py-2 bg-black text-white rounded-lg text-sm">
            リクエストする
          </button>
        </div>
      </div>
      
      {/* 直接リクエストモーダル */}
      {directRequestModalOpen && (
        <DirectRequestModal 
          attender={attender}
          onClose={() => setDirectRequestModalOpen(false)}
        />
      )}
    </div>
  );
};

export default AttenderCard;