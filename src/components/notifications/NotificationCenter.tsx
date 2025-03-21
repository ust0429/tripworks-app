import React, { useState } from 'react';
import { Notification } from '../../types/notification';
import NotificationsList from './NotificationsList';
import NotificationSettings from './NotificationSettings';

interface NotificationCenterProps {
  userId: string;
  onClose?: () => void;
  onNavigate?: (url: string) => void;
}

type TabType = 'notifications' | 'settings';

const NotificationCenter: React.FC<NotificationCenterProps> = ({
  userId,
  onClose,
  onNavigate
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('notifications');

  const handleNotificationClick = (notification: Notification) => {
    // If the notification has a redirect URL, navigate to it
    if (notification.data?.redirectUrl && onNavigate) {
      onNavigate(notification.data.redirectUrl);
      if (onClose) {
        onClose();
      }
    }
  };

  return (
    <div className="bg-white w-full md:w-96 h-full md:h-auto md:max-h-[90vh] rounded-lg shadow-xl overflow-hidden flex flex-col">
      <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-800">Notification Center</h2>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 focus:outline-none"
          aria-label="Close"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <div className="border-b border-gray-200">
        <nav className="flex" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('notifications')}
            className={`px-4 py-2 text-sm font-medium border-b-2 ${
              activeTab === 'notifications'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } flex-1 text-center`}
          >
            Notifications
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 text-sm font-medium border-b-2 ${
              activeTab === 'settings'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } flex-1 text-center`}
          >
            Settings
          </button>
        </nav>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'notifications' ? (
          <NotificationsList 
            userId={userId} 
            onNotificationClick={handleNotificationClick} 
          />
        ) : (
          <NotificationSettings userId={userId} />
        )}
      </div>
    </div>
  );
};

export default NotificationCenter;
