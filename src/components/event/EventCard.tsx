import React from 'react';
import { Calendar, MapPin, Clock, User, Star } from 'lucide-react';
import { EventType } from '../../types/event';
import { IconProps } from '../../types/common';
import { useNavigate } from 'react-router-dom';

interface EventCardProps {
  event: EventType;
  variant?: 'compact' | 'full';
}

const EventCard: React.FC<EventCardProps> = ({ event, variant = 'full' }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/events/${event.id}`);
  };

  if (variant === 'compact') {
    return (
      <div 
        className="bg-white rounded-lg shadow-sm overflow-hidden cursor-pointer"
        onClick={handleClick}
      >
        <div className="bg-gray-100 p-3 flex items-center">
          {event.icon && React.isValidElement(event.icon) && 
            React.cloneElement(event.icon as React.ReactElement<IconProps>, { size: 20, className: "text-gray-600 mr-2" })}
          <span className="font-medium">{event.type || '特別体験'}</span>
        </div>
        <div className="p-3">
          <p className="font-medium text-sm">{event.title}</p>
          <p className="text-xs text-gray-600 mt-1">{event.time}</p>
          <div className="flex items-center mt-2">
            {event.rating && (
              <div className="flex items-center">
                <Star size={12} className="text-yellow-400 fill-yellow-400" />
                <span className="text-xs ml-1">{event.rating.toFixed(1)} ({event.reviewCount || 0}件)</span>
              </div>
            )}
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
        {event.imageUrl ? (
          <img 
            src={event.imageUrl} 
            alt={event.title} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            {event.icon && React.isValidElement(event.icon) && 
              React.cloneElement(event.icon as React.ReactElement<IconProps>, { size: 48, className: "text-gray-300" })}
          </div>
        )}
        {event.badge && (
          <div className="absolute top-3 left-3 bg-red-600 text-white text-xs py-1 px-2 rounded-full">
            {event.badge}
          </div>
        )}
      </div>
      <div className="p-3">
        <div className="flex items-center mb-2">
          <Calendar size={14} className="text-gray-500 mr-1" />
          <span className="text-xs text-gray-600">{event.date || `${event.month || '7'}月${event.day}日`}</span>
          {event.period && (
            <>
              <div className="mx-2 w-1 h-1 rounded-full bg-gray-300"></div>
              <span className="text-xs text-gray-600">{event.period}</span>
            </>
          )}
        </div>
        <h3 className="font-bold">{event.title}</h3>
        <div className="mt-2 space-y-1">
          <div className="flex items-center">
            <MapPin size={14} className="text-gray-500 mr-1 flex-shrink-0" />
            <span className="text-xs text-gray-600 truncate">{event.location}</span>
          </div>
          <div className="flex items-center">
            <Clock size={14} className="text-gray-500 mr-1 flex-shrink-0" />
            <span className="text-xs text-gray-600">{event.time}</span>
          </div>
          <div className="flex items-center">
            <User size={14} className="text-gray-500 mr-1 flex-shrink-0" />
            <span className="text-xs text-gray-600">{event.attender}</span>
          </div>
        </div>
        {(event.rating !== undefined) && (
          <div className="flex items-center mt-2">
            <div className="flex items-center">
              {Array(5).fill(0).map((_, i) => (
                <Star 
                  key={i}
                  size={12}
                  className={i < Math.floor(event.rating || 0) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}
                />
              ))}
              <span className="text-xs ml-1">{event.rating.toFixed(1)} ({event.reviewCount || 0})</span>
            </div>
          </div>
        )}
        <div className="flex justify-between items-center mt-3">
          <p className="font-bold">¥{event.price.toLocaleString()}</p>
          <button className="bg-black text-white text-sm py-1 px-3 rounded-lg">
            予約する
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventCard;