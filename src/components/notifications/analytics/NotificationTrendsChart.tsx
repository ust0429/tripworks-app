import React from 'react';
// recharts関連のimportはコメントアウト（依存関係追加後に有効化）
// import { 
//   LineChart, 
//   Line, 
//   XAxis, 
//   YAxis, 
//   CartesianGrid, 
//   Tooltip, 
//   Legend, 
//   ResponsiveContainer 
// } from 'recharts';
import { NotificationTrend } from '../../../services/notificationAnalyticsService';

interface NotificationTrendsChartProps {
  trends: NotificationTrend[];
}

const NotificationTrendsChart: React.FC<NotificationTrendsChartProps> = ({ trends }) => {
  // 日付の表示形式をカスタマイズ
  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  // Reactにデータが配列であることを確認
  if (!Array.isArray(trends) || trends.length === 0) {
    return <div className="text-gray-500 p-4">データがありません</div>;
  }

  return (
    <div className="bg-gray-100 p-4 rounded-md flex items-center justify-center h-64">
      <div className="text-center">
        <p className="text-gray-500">グラフ表示には recharts ライブラリの追加が必要です</p>
        <p className="text-sm text-gray-400 mt-2">npm install recharts @types/recharts</p>
        <div className="mt-4">
          <table className="text-sm text-gray-600">
            <thead>
              <tr className="border-b">
                <th className="px-2 py-1 text-left">日付</th>
                <th className="px-2 py-1 text-right">送信数</th>
                <th className="px-2 py-1 text-right">既読数</th>
                <th className="px-2 py-1 text-right">クリック数</th>
              </tr>
            </thead>
            <tbody>
              {trends.slice(0, 3).map((item) => (
                <tr key={item.date} className="border-b border-gray-200">
                  <td className="px-2 py-1">{formatDate(item.date)}</td>
                  <td className="px-2 py-1 text-right">{item.sent}</td>
                  <td className="px-2 py-1 text-right">{item.read}</td>
                  <td className="px-2 py-1 text-right">{item.clicked}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default NotificationTrendsChart;
