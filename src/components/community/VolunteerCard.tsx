import React from 'react';
import { MapPin, Calendar, Clock, Users, ArrowRight } from 'lucide-react';
import { VolunteerType } from '../../types/community';
import { IconProps } from '../../types/common';
import { useNavigate } from 'react-router-dom';

interface VolunteerCardProps {
  volunteer: VolunteerType;
  variant?: 'compact' | 'full';
}

const VolunteerCard: React.FC<VolunteerCardProps> = ({ volunteer, variant = 'full' }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/community/volunteer/${volunteer.id}`);
  };

  const progressPercentage = Math.min(
    (volunteer.currentPeople / volunteer.requiredPeople) * 100,
    100
  );
  
  if (variant === 'compact') {
    return (
      <div 
        className="bg-white rounded-lg shadow-sm p-3 cursor-pointer"
        onClick={handleClick}
      >
        <h3 className="font-medium line-clamp-1">{volunteer.title}</h3>
        <div className="flex items-center mt-1 text-xs text-gray-600">
          <Calendar size={12} className="mr-1" />
          <span>{volunteer.date}</span>
          <span className="mx-1">|</span>
          <Clock size={12} className="mr-1" />
          <span>{volunteer.time}</span>
        </div>
        <div className="flex items-center mt-2 justify-between">
          <div className="flex items-center text-xs text-gray-600">
            <Users size={12} className="mr-1" />
            <span>{volunteer.currentPeople}/{volunteer.requiredPeople}名</span>
          </div>
          <div className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
            {volunteer.category || '地域イベント'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="bg-white rounded-lg shadow-sm overflow-hidden cursor-pointer"
      onClick={handleClick}
    >
      <div className="aspect-video bg-gray-100 relative">
        {volunteer.imageUrl ? (
          <img 
            src={volunteer.imageUrl} 
            alt={volunteer.title} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            {volunteer.icon && React.isValidElement(volunteer.icon) ? 
              React.cloneElement(volunteer.icon as React.ReactElement<IconProps>, { size: 48, className: "text-gray-300" })
              : <Users size={48} className="text-gray-300" />
            }
          </div>
        )}
        {volunteer.category && (
          <div className="absolute top-3 left-3 bg-green-100 text-green-800 text-xs py-1 px-2 rounded-full">
            {volunteer.category}
          </div>
        )}
      </div>
      
      <div className="p-3">
        <h3 className="font-bold">{volunteer.title}</h3>
        
        <div className="mt-2 space-y-1">
          <div className="flex items-center text-sm text-gray-600">
            <Calendar size={14} className="mr-1 flex-shrink-0" />
            <span>{volunteer.date}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Clock size={14} className="mr-1 flex-shrink-0" />
            <span>{volunteer.time}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <MapPin size={14} className="mr-1 flex-shrink-0" />
            <span>{volunteer.location}</span>
          </div>
        </div>
        
        <div className="mt-3">
          <div className="flex justify-between text-sm mb-1">
            <span>募集人数</span>
            <span>{volunteer.currentPeople}/{volunteer.requiredPeople}名</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${
                progressPercentage >= 100 ? 'bg-red-500' : 'bg-green-500'
              }`} 
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          {progressPercentage >= 100 ? (
            <p className="text-xs text-red-600 mt-1">募集枠が埋まりました</p>
          ) : (
            <p className="text-xs text-green-600 mt-1">あと{volunteer.requiredPeople - volunteer.currentPeople}名募集中</p>
          )}
        </div>
        
        <button 
          className={`w-full py-2 mt-3 rounded-lg text-sm ${
            progressPercentage >= 100 
              ? 'bg-gray-200 text-gray-600' 
              : 'bg-black text-white'
          }`}
          disabled={progressPercentage >= 100}
        >
          参加する
        </button>
      </div>
    </div>
  );
};

export default VolunteerCard;