import React from 'react';
import { Award, ChevronRight } from 'lucide-react';
import { UserContributionStat } from '../../types/community';

interface ContributionCardProps {
  contributionStat: UserContributionStat;
  onViewHistory?: () => void;
}

const ContributionCard: React.FC<ContributionCardProps> = ({ 
  contributionStat,
  onViewHistory 
}) => {
  const levelColors = [
    { bg: 'bg-gray-100', text: 'text-gray-800', icon: 'text-gray-500' },
    { bg: 'bg-green-100', text: 'text-green-800', icon: 'text-green-500' },
    { bg: 'bg-blue-100', text: 'text-blue-800', icon: 'text-blue-500' },
    { bg: 'bg-purple-100', text: 'text-purple-800', icon: 'text-purple-500' },
    { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: 'text-yellow-500' }
  ];
  
  const colorSet = levelColors[Math.min(contributionStat.level, levelColors.length - 1)];
  const progressPercentage = Math.min(
    (contributionStat.totalAmount / contributionStat.nextMilestone) * 100,
    100
  );
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl font-bold">あなたの貢献</h2>
        <div className={`flex items-center ${colorSet.bg} ${colorSet.text} px-2 py-1 rounded-full`}>
          <Award size={16} className={`mr-1 ${colorSet.icon}`} />
          <span className="text-sm font-medium">レベル {contributionStat.level}</span>
        </div>
      </div>
      
      <div className="flex items-center justify-between mb-3">
        <p className="text-gray-700">これまでの貢献額</p>
        <p className="text-xl font-bold text-black">¥{contributionStat.totalAmount.toLocaleString()}</p>
      </div>
      
      <div className="mb-1">
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className="bg-black h-2.5 rounded-full" 
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>
      
      <div className="flex justify-between text-sm text-gray-600 mb-3">
        <p>次のレベルまで ¥{(contributionStat.nextLevelAmount - contributionStat.totalAmount).toLocaleString()}</p>
        <p>¥{contributionStat.nextMilestone.toLocaleString()}</p>
      </div>
      
      <div className="flex justify-between items-center text-sm pt-2 border-t">
        <div>
          <p>サポートしたプロジェクト</p>
          <p className="font-bold">{contributionStat.projectsSupported}件</p>
        </div>
        <button 
          onClick={onViewHistory}
          className="flex items-center text-black font-medium"
        >
          履歴を見る
          <ChevronRight size={16} className="ml-1" />
        </button>
      </div>
    </div>
  );
};

export default ContributionCard;
