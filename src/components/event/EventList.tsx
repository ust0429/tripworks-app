import React from 'react';
import { Info, User } from 'lucide-react';
import { EventType } from '../../types/event';
import { useNavigate } from 'react-router-dom';

interface EventListProps {
  events: EventType[];
  monthLabel?: string;
}

const EventList: React.FC<EventListProps> = ({ events, monthLabel = '7月' }) => {
  const navigate = useNavigate();

  const handleEventClick = (eventId: string | number) => {
    navigate(`/events/${eventId}`);
  };

  return (
    <div className="space-y-3">
      {events.map(event => (
        <div 
          key={event.id} 
          className="bg-white rounded-lg shadow-sm p-3 cursor-pointer"
          onClick={() => handleEventClick(event.id)}
        >
          <div className="flex justify-between items-start">
            <div className="flex items-start space-x-3">
              <div className="bg-gray-100 rounded-lg p-2 text-center w-12">
                <p className="text-xs text-gray-600">{monthLabel}</p>
                <p className="text-lg font-bold text-gray-800">{event.day}</p>
              </div>
              <div>
                <p className="font-medium">{event.title}</p>
                <p className="text-xs text-gray-600 mt-1">{event.time}</p>
                <div className="flex items-center mt-1">
                  <User size={12} className="text-gray-500 mr-1" />
                  <span className="text-xs text-gray-600">{event.attender}</span>
                </div>
              </div>
            </div>
            <div className="bg-green-100 text-green-800 text-xs py-1 px-2 rounded-full">
              {event.period}
            </div>
          </div>
          <div className="mt-2 pt-2 border-t flex justify-between items-center">
            <div className="flex items-center">
              <Info size={14} className="text-gray-500 mr-1" />
              <span className="text-xs text-gray-600">{event.note}</span>
            </div>
            <button className="text-black text-sm font-medium">
              予約する
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default EventList;
