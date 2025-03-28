import React, { useState } from 'react';
import NotificationIcon from './NotificationIcon';
import NotificationDropdown from './NotificationDropdown';
import { useNotification } from '../../contexts/NotificationContext';

const HeaderNotification: React.FC = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { notifications, unreadCount, isLoading, handleNotificationClick, markAllNotificationsAsRead } = useNotification();

  return (
    <div className="relative">
      <NotificationIcon 
        unreadCount={unreadCount} 
        onClick={() => setIsDropdownOpen(!isDropdownOpen)} 
      />
      <NotificationDropdown 
        isOpen={isDropdownOpen}
        onClose={() => setIsDropdownOpen(false)}
        notifications={notifications}
        onNotificationClick={handleNotificationClick}
        onMarkAllAsRead={markAllNotificationsAsRead}
        isLoading={isLoading}
      />
    </div>
  );
};

export default HeaderNotification;
