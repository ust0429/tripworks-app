import React from 'react';
import { TrendingUp, TrendingDown, Send, Eye, MousePointer, Bell } from 'lucide-react';

interface NotificationMetricsCardProps {
  title: string;
  value: number;
  suffix?: string;
  icon: 'send' | 'eye' | 'click' | 'bell';
  trend?: number;
}

const NotificationMetricsCard: React.FC<NotificationMetricsCardProps> = ({
  title,
  value,
  suffix = '',
  icon,
  trend
}) => {
  const renderIcon = () => {
    switch (icon) {
      case 'send':
        return <Send size={24} className="text-indigo-500" />;
      case 'eye':
        return <Eye size={24} className="text-green-500" />;
      case 'click':
        return <MousePointer size={24} className="text-purple-500" />;
      case 'bell':
        return <Bell size={24} className="text-blue-500" />;
      default:
        return null;
    }
  };

  const isTrendPositive = trend && trend > 0;
  
  const formattedValue = value % 1 === 0 
    ? value.toLocaleString() 
    : value.toFixed(1);

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-start">
        <div className="bg-gray-100 rounded-full p-3">{renderIcon()}</div>
        
        {trend !== undefined && (
          <div className={`flex items-center ${isTrendPositive ? 'text-green-500' : 'text-red-500'}`}>
            {isTrendPositive ? (
              <TrendingUp size={16} className="mr-1" />
            ) : (
              <TrendingDown size={16} className="mr-1" />
            )}
            <span className="text-sm font-medium">
              {Math.abs(trend).toFixed(1)}%
            </span>
          </div>
        )}
      </div>
      
      <div className="mt-4">
        <p className="text-sm text-gray-600">{title}</p>
        <p className="text-2xl font-bold mt-1">
          {formattedValue}{suffix}
        </p>
      </div>
    </div>
  );
};

export default NotificationMetricsCard;
