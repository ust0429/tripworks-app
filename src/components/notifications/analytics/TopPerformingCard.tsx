import React from 'react';
import { Award, ChevronUp } from 'lucide-react';
import { NotificationType } from '../../../types/notification';

interface TopPerformingCardProps {
  topPerforming: {
    type: NotificationType;
    readRate: number;
    clickRate: number;
  };
}

const TopPerformingCard: React.FC<TopPerformingCardProps> = ({ topPerforming }) => {
  // 通知タイプの日本語名を取得
  const getTypeLabel = (type: NotificationType): string => {
    const typeLabels: Record<NotificationType, string> = {
      [NotificationType.SYSTEM]: 'システム通知',
      [NotificationType.MESSAGE]: 'メッセージ通知',
      [NotificationType.RESERVATION]: '予約通知',
      [NotificationType.REVIEW]: 'レビュー通知',
      [NotificationType.PAYMENT]: '支払い通知',
      [NotificationType.MARKETING]: 'マーケティング通知'
    };
    
    return typeLabels[type] || type;
  };

  // 背景色を取得
  const getBackgroundColor = (type: NotificationType): string => {
    const typeColors: Record<NotificationType, string> = {
      [NotificationType.SYSTEM]: 'bg-blue-500',
      [NotificationType.MESSAGE]: 'bg-indigo-500',
      [NotificationType.RESERVATION]: 'bg-purple-500',
      [NotificationType.REVIEW]: 'bg-yellow-500',
      [NotificationType.PAYMENT]: 'bg-green-500',
      [NotificationType.MARKETING]: 'bg-pink-500'
    };
    
    return typeColors[type] || 'bg-gray-500';
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex justify-between items-start mb-6">
        <Award size={32} className="text-yellow-500" />
        <div className={`px-2 py-1 rounded-full text-xs font-medium text-white ${getBackgroundColor(topPerforming.type)}`}>
          {getTypeLabel(topPerforming.type)}
        </div>
      </div>
      
      <h2 className="text-lg font-semibold mb-2">最もパフォーマンスの高い通知タイプ</h2>
      
      <div className="space-y-4 mt-4">
        <div>
          <div className="flex justify-between items-center mb-1">
            <p className="text-sm text-gray-600">既読率</p>
            <div className="flex items-center text-sm text-green-600">
              <ChevronUp size={16} />
              <span>{topPerforming.readRate.toFixed(1)}%</span>
            </div>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full">
            <div
              className="h-2 bg-green-500 rounded-full"
              style={{ width: `${topPerforming.readRate}%` }}
            ></div>
          </div>
        </div>
        
        <div>
          <div className="flex justify-between items-center mb-1">
            <p className="text-sm text-gray-600">クリック率</p>
            <div className="flex items-center text-sm text-purple-600">
              <ChevronUp size={16} />
              <span>{topPerforming.clickRate.toFixed(1)}%</span>
            </div>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full">
            <div
              className="h-2 bg-purple-500 rounded-full"
              style={{ width: `${topPerforming.clickRate}%` }}
            ></div>
          </div>
        </div>
      </div>
      
      <div className="mt-6 p-3 bg-yellow-50 border border-yellow-100 rounded-md">
        <p className="text-sm text-yellow-700">
          このタイプの通知はユーザーとのエンゲージメントが最も高く、開封率とクリック率が優れています。
        </p>
      </div>
    </div>
  );
};

export default TopPerformingCard;
