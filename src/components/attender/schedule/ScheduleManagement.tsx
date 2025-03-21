import React, { useState } from 'react';
import { UUID } from '../../../types/attender';
import ScheduleSettings from './ScheduleSettings';
import ScheduleCalendar from './ScheduleCalendar';

interface ScheduleManagementProps {
  attenderId: UUID;
}

type ActiveTab = 'calendar' | 'settings';

const ScheduleManagement: React.FC<ScheduleManagementProps> = ({ attenderId }) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('calendar');

  return (
    <div>
      <div className="border-b mb-6">
        <nav className="flex gap-4">
          <button
            className={`py-3 px-4 font-medium ${
              activeTab === 'calendar'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
            onClick={() => setActiveTab('calendar')}
          >
            カレンダー表示
          </button>
          <button
            className={`py-3 px-4 font-medium ${
              activeTab === 'settings'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
            onClick={() => setActiveTab('settings')}
          >
            スケジュール設定
          </button>
        </nav>
      </div>

      {activeTab === 'calendar' && <ScheduleCalendar attenderId={attenderId} />}
      {activeTab === 'settings' && <ScheduleSettings attenderId={attenderId} />}
    </div>
  );
};

export default ScheduleManagement;
