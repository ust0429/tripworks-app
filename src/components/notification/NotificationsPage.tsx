import React, { useState, useEffect } from 'react';
import { ChevronLeft, Bell, Filter, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import NotificationItem from './NotificationItem';
import { useNotification } from '../../contexts/NotificationContext';
import { Notification } from '../../types';

const NotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  const { notifications, isLoading, handleNotificationClick, markAllNotificationsAsRead } = useNotification();
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');
  const [activeType, setActiveType] = useState<'all' | 'booking' | 'review' | 'system'>('all');
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // 通知のフィルタリング
  useEffect(() => {
    let filtered = [...notifications];
    
    // 未読フィルター
    if (activeTab === 'unread') {
      filtered = filtered.filter(notification => !notification.isRead);
    }
    
    // タイプフィルター
    if (activeType !== 'all') {
      filtered = filtered.filter(notification => notification.type === activeType);
    }
    
    // 検索フィルター
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(
        notification => 
          notification.title.toLowerCase().includes(term) ||
          notification.message.toLowerCase().includes(term)
      );
    }
    
    setFilteredNotifications(filtered);
  }, [notifications, activeTab, activeType, searchTerm]);

  return (
    <div className="bg-gray-100 min-h-screen">
      {/* ヘッダー */}
      <div className="bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-full hover:bg-gray-100"
            >
              <ChevronLeft size={20} className="text-gray-800" />
            </button>
            <h1 className="text-xl font-bold">通知</h1>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => markAllNotificationsAsRead()}
              className="px-3 py-1 text-sm bg-black text-white rounded-lg"
            >
              すべて既読にする
            </button>
          </div>
        </div>
      </div>

      {/* フィルターとタブ */}
      <div className="bg-white p-4 shadow-sm mt-2">
        <div className="relative mb-4">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="通知を検索"
            className="w-full pl-10 pr-4 py-2 bg-gray-100 border border-gray-200 rounded-lg"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex justify-between mb-4">
          {/* タブ切り替え */}
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1 text-sm rounded-lg ${
                activeTab === 'all'
                  ? 'bg-black text-white'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              すべて
            </button>
            <button
              onClick={() => setActiveTab('unread')}
              className={`px-3 py-1 text-sm rounded-lg ${
                activeTab === 'unread'
                  ? 'bg-black text-white'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              未読のみ
            </button>
          </div>

          {/* カテゴリ切り替え */}
          <div className="flex items-center space-x-1">
            <Filter size={16} className="text-gray-500" />
            <select
              value={activeType}
              onChange={(e) => setActiveType(e.target.value as any)}
              className="text-sm bg-gray-100 border-none rounded-lg py-1 pl-2 pr-8"
            >
              <option value="all">すべてのタイプ</option>
              <option value="booking">予約</option>
              <option value="review">レビュー</option>
              <option value="system">システム</option>
            </select>
          </div>
        </div>
      </div>

      {/* 通知リスト */}
      <div className="bg-white rounded-lg shadow-sm mt-2 divide-y">
        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <p className="text-gray-500">読み込み中...</p>
          </div>
        ) : filteredNotifications.length > 0 ? (
          filteredNotifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onClick={handleNotificationClick}
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-40 p-4">
            <Bell size={32} className="text-gray-300 mb-2" />
            <p className="text-gray-500">表示できる通知はありません</p>
            {(activeTab !== 'all' || activeType !== 'all' || searchTerm) && (
              <button
                onClick={() => {
                  setActiveTab('all');
                  setActiveType('all');
                  setSearchTerm('');
                }}
                className="mt-2 text-sm text-blue-500"
              >
                フィルターをクリア
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
