import React, { useState, useEffect } from 'react';
import { 
  NotificationAnalytics, 
  notificationAnalyticsService 
} from '../../../services/notificationAnalyticsService';
import NotificationMetricsCard from './NotificationMetricsCard';
import NotificationTrendsChart from './NotificationTrendsChart';
import NotificationTypeBreakdown from './NotificationTypeBreakdown';
import DeviceDistributionChart from './DeviceDistributionChart';
import TopPerformingCard from './TopPerformingCard';

interface NotificationAnalyticsDashboardProps {
  userId?: string;
}

const NotificationAnalyticsDashboard: React.FC<NotificationAnalyticsDashboardProps> = ({ 
  userId 
}) => {
  const [analytics, setAnalytics] = useState<NotificationAnalytics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<{
    startDate: string;
    endDate: string;
  }>({
    startDate: (() => {
      const date = new Date();
      date.setDate(date.getDate() - 7);
      return date.toISOString().split('T')[0];
    })(),
    endDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const data = await notificationAnalyticsService.getAnalytics(
          dateRange.startDate,
          dateRange.endDate,
          userId
        );
        setAnalytics(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching notification analytics:', err);
        setError('通知分析データの取得に失敗しました。後でもう一度お試しください。');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [dateRange, userId]);

  const handleDateRangeChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setDateRange(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-600">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-2 px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
        >
          再試行
        </button>
      </div>
    );
  }

  if (!analytics) {
    return null;
  }

  return (
    <div className="p-4 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h1 className="text-2xl font-bold mb-2 sm:mb-0">通知分析ダッシュボード</h1>
        
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
          <div className="flex items-center space-x-2">
            <label htmlFor="startDate" className="text-sm font-medium text-gray-700">開始</label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              value={dateRange.startDate}
              onChange={handleDateRangeChange}
              className="px-2 py-1 border rounded-md text-sm"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <label htmlFor="endDate" className="text-sm font-medium text-gray-700">終了</label>
            <input
              type="date"
              id="endDate"
              name="endDate"
              value={dateRange.endDate}
              onChange={handleDateRangeChange}
              className="px-2 py-1 border rounded-md text-sm"
            />
          </div>
          
          <select
            className="px-2 py-1 border rounded-md text-sm"
            onChange={(e) => {
              const today = new Date();
              let startDate = new Date();
              
              switch (e.target.value) {
                case 'last7days':
                  startDate.setDate(today.getDate() - 7);
                  break;
                case 'last30days':
                  startDate.setDate(today.getDate() - 30);
                  break;
                case 'last90days':
                  startDate.setDate(today.getDate() - 90);
                  break;
                default:
                  startDate = new Date(e.target.value);
              }
              
              setDateRange({
                startDate: startDate.toISOString().split('T')[0],
                endDate: today.toISOString().split('T')[0]
              });
            }}
          >
            <option value="last7days">過去7日間</option>
            <option value="last30days">過去30日間</option>
            <option value="last90days">過去90日間</option>
          </select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <NotificationMetricsCard
          title="送信済み通知"
          value={analytics.metrics.totalSent}
          icon="send"
          trend={+5.2}
        />
        <NotificationMetricsCard
          title="既読率"
          value={analytics.metrics.readRate}
          suffix="%"
          icon="eye"
          trend={+1.8}
        />
        <NotificationMetricsCard
          title="クリック率"
          value={analytics.metrics.clickRate}
          suffix="%"
          icon="click"
          trend={-2.3}
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold mb-4">通知送信トレンド</h2>
          <NotificationTrendsChart trends={analytics.trends} />
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold mb-4">通知タイプ別分析</h2>
          <NotificationTypeBreakdown breakdown={analytics.metrics.breakdown} />
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-4 rounded-lg shadow-sm lg:col-span-2">
          <h2 className="text-lg font-semibold mb-4">デバイス分布</h2>
          <DeviceDistributionChart devices={analytics.devices} />
        </div>
        
        <TopPerformingCard topPerforming={analytics.topPerforming} />
      </div>
      
      <div className="mt-6 p-4 bg-indigo-50 border border-indigo-100 rounded-lg">
        <h2 className="text-lg font-semibold text-indigo-800 mb-2">分析インサイト</h2>
        <p className="text-indigo-700">
          メッセージ通知が最も高いエンゲージメントを示しています。
          平均読み取り率は前週比で1.8%増加しています。
          iOSユーザーの方がAndroidユーザーよりも通知に反応する傾向があります。
        </p>
      </div>
    </div>
  );
};

export default NotificationAnalyticsDashboard;
