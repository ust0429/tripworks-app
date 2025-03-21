import React from 'react';
// recharts関連のimportはコメントアウト（依存関係追加後に有効化）
// import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { DeviceStats } from '../../../services/notificationAnalyticsService';

interface DeviceDistributionChartProps {
  devices: DeviceStats[];
}

const COLORS = ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

const DeviceDistributionChart: React.FC<DeviceDistributionChartProps> = ({ devices }) => {
  // データが空の場合
  if (!devices || devices.length === 0) {
    return <div className="text-gray-500 p-4">デバイスデータがありません</div>;
  }

  // グラフ用にデータを整形
  const data = devices.map((device) => ({
    name: device.platform,
    value: device.count,
    percentage: device.percentage
  }));

  return (
    <div className="flex flex-col md:flex-row items-center">
      <div className="w-full md:w-1/2 h-64 bg-gray-100 flex items-center justify-center rounded-md">
        <p className="text-gray-500 text-center">グラフ表示には recharts ライブラリの追加が必要です<br/>npm install recharts @types/recharts</p>
      </div>

      <div className="md:w-1/3 p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">デバイス内訳</h3>
        <div className="space-y-3">
          {data.map((device, index) => (
            <div key={device.name} className="flex items-center">
              <div
                className="w-3 h-3 rounded-full mr-2"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              ></div>
              <div className="flex-1">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">{device.name}</span>
                  <span className="text-sm font-medium">
                    {device.percentage.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full h-1.5 bg-gray-200 rounded-full mt-1">
                  <div
                    className="h-1.5 rounded-full"
                    style={{
                      width: `${device.percentage}%`,
                      backgroundColor: COLORS[index % COLORS.length]
                    }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DeviceDistributionChart;
