import React, { useState } from 'react';
// recharts関連のimportはコメントアウト（依存関係追加後に有効化）
// import { 
//   BarChart, 
//   Bar, 
//   XAxis, 
//   YAxis, 
//   CartesianGrid, 
//   Tooltip, 
//   Legend, 
//   ResponsiveContainer 
// } from 'recharts';
import { NotificationType } from '../../../types/notification';

interface NotificationTypeBreakdownProps {
  breakdown: {
    [key in NotificationType]: {
      sent: number;
      read: number;
      clicked: number;
      readRate: number;
      clickRate: number;
    };
  };
}

const NotificationTypeBreakdown: React.FC<NotificationTypeBreakdownProps> = ({
  breakdown
}) => {
  const [metric, setMetric] = useState<'count' | 'rate'>('count');

  // 通知タイプの日本語表示
  const typeLabels: Record<NotificationType, string> = {
    [NotificationType.SYSTEM]: 'システム',
    [NotificationType.MESSAGE]: 'メッセージ',
    [NotificationType.RESERVATION]: '予約',
    [NotificationType.REVIEW]: 'レビュー',
    [NotificationType.PAYMENT]: '支払い',
    [NotificationType.MARKETING]: 'マーケティング'
  };

  // グラフ用にデータを整形
  const data = Object.entries(breakdown).map(([type, stats]) => {
    const notificationType = type as NotificationType;
    return {
      name: typeLabels[notificationType] || notificationType,
      sent: stats.sent,
      read: stats.read,
      clicked: stats.clicked,
      readRate: stats.readRate,
      clickRate: stats.clickRate
    };
  });

  return (
    <div>
      <div className="flex justify-end mb-4">
        <div className="flex border rounded-md overflow-hidden">
          <button
            className={`px-3 py-1 text-sm font-medium ${
              metric === 'count'
                ? 'bg-indigo-500 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
            onClick={() => setMetric('count')}
          >
            数値
          </button>
          <button
            className={`px-3 py-1 text-sm font-medium ${
              metric === 'rate'
                ? 'bg-indigo-500 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
            onClick={() => setMetric('rate')}
          >
            割合
          </button>
        </div>
      </div>

      <div className="bg-gray-100 p-4 rounded-md mt-4 text-center">
        <p className="text-gray-500">グラフ表示には recharts ライブラリの追加が必要です</p>
        <p className="text-sm text-gray-400 mt-2">npm install recharts @types/recharts</p>
        
        <div className="mt-6">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">通知タイプ</th>
                {metric === 'count' ? (
                  <>
                    <th className="p-2 text-right">送信数</th>
                    <th className="p-2 text-right">既読数</th>
                    <th className="p-2 text-right">クリック数</th>
                  </>
                ) : (
                  <>
                    <th className="p-2 text-right">既読率</th>
                    <th className="p-2 text-right">クリック率</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {data.map((item) => (
                <tr key={item.name} className="border-b">
                  <td className="p-2">{item.name}</td>
                  {metric === 'count' ? (
                    <>
                      <td className="p-2 text-right">{item.sent}</td>
                      <td className="p-2 text-right">{item.read}</td>
                      <td className="p-2 text-right">{item.clicked}</td>
                    </>
                  ) : (
                    <>
                      <td className="p-2 text-right">{item.readRate.toFixed(1)}%</td>
                      <td className="p-2 text-right">{item.clickRate.toFixed(1)}%</td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default NotificationTypeBreakdown;
