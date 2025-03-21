// src/components/explore/ExperienceCard.tsx
import React from 'react';
import { Star, Clock, Users, Heart } from 'lucide-react';
import { ExperienceType } from '../../types';

interface ExperienceCardProps {
  experience: ExperienceType;
  onClick?: () => void;
  compact?: boolean;
  onFavoriteToggle?: (id: number) => void;
  isFavorite?: boolean;
}

const ExperienceCard: React.FC<ExperienceCardProps> = ({
  experience,
  onClick,
  compact = false,
  onFavoriteToggle,
  isFavorite = false,
}) => {
  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onFavoriteToggle) {
      onFavoriteToggle(experience.id);
    }
  };

  if (compact) {
    return (
      <div 
        className="bg-white rounded-lg shadow-sm overflow-hidden flex items-center cursor-pointer"
        onClick={onClick}
      >
        <div 
          className="w-24 h-24 bg-gray-200 flex-shrink-0 relative"
          style={{
            backgroundImage: experience.image ? `url(${experience.image})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
        
        <div className="p-3 flex-1">
          <h3 className="font-medium text-sm line-clamp-2">{experience.title}</h3>
          
          <div className="flex items-center text-xs text-gray-500 mt-1 space-x-3">
            <div className="flex items-center">
              <Clock size={12} className="mr-1" />
              <span>{experience.duration}</span>
            </div>
            <div className="flex items-center">
              <Star size={12} className="mr-1 text-yellow-500" />
              <span>4.8 (12)</span>
            </div>
          </div>
          
          <div className="flex justify-between items-center mt-1">
            <span className="font-medium">¥{experience.price.toLocaleString()}</span>
            <button
              onClick={handleFavoriteClick}
              className="p-1 rounded-full hover:bg-gray-100"
            >
              <Heart
                size={16}
                className={isFavorite ? "text-red-500 fill-current" : "text-gray-400"}
              />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="bg-white rounded-lg shadow-sm overflow-hidden cursor-pointer"
      onClick={onClick}
    >
      <div 
        className="h-44 bg-gray-200 relative"
        style={{
          backgroundImage: experience.image ? `url(${experience.image})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        
        <button
          onClick={handleFavoriteClick}
          className="absolute top-3 right-3 bg-white rounded-full p-1.5 shadow-sm"
        >
          <Heart
            size={18}
            className={isFavorite ? "text-red-500 fill-current" : "text-gray-600"}
          />
        </button>
        
        <div className="absolute bottom-3 left-3 bg-black/70 text-white text-xs py-1 px-2 rounded-full">
          {experience.duration}
        </div>
      </div>
      
      <div className="p-3">
        <h3 className="font-medium text-sm line-clamp-2">{experience.title}</h3>
        
        <div className="flex items-center justify-between mt-1">
          <div className="flex items-center">
            <Star size={14} className="text-yellow-500" />
            <span className="text-sm ml-1">4.8</span>
            <span className="text-xs text-gray-500 ml-1">(12)</span>
          </div>
          
          <div className="flex items-center text-xs text-gray-500">
            <Users size={12} className="mr-1" />
            <span>最大8人</span>
          </div>
        </div>
        
        <p className="text-xs text-gray-600 mt-2 line-clamp-2">
          {experience.description}
        </p>
        
        <div className="mt-2 flex justify-between items-center">
          <div>
            <span className="font-bold">¥{experience.price.toLocaleString()}</span>
            <span className="text-xs text-gray-500">/人</span>
          </div>
          
          <div className="text-xs text-gray-500">
            当日予約可
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExperienceCard;