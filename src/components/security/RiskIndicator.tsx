import React from 'react';
import { Shield, AlertTriangle, Info } from 'lucide-react';
import { useLocale } from '../../contexts/LocaleContext';

interface RiskIndicatorProps {
  score: number;
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
  showDetails?: boolean;
  className?: string;
}

const RiskIndicator: React.FC<RiskIndicatorProps> = ({
  score,
  size = 'medium',
  showLabel = true,
  showDetails = false,
  className = ''
}) => {
  const { t } = useLocale();
  
  // スコアに基づいてリスクレベルを決定
  const getRiskLevel = (score: number): 'low' | 'medium' | 'high' => {
    if (score < 0.3) return 'low';
    if (score < 0.7) return 'medium';
    return 'high';
  };
  
  const riskLevel = getRiskLevel(score);
  
  // サイズに基づいてスタイルを設定
  const getSize = () => {
    switch (size) {
      case 'small':
        return 'h-1.5';
      case 'large':
        return 'h-3';
      default:
        return 'h-2';
    }
  };
  
  // リスクレベルに基づいてラベルとスタイルを取得
  const getLabelAndStyle = (level: 'low' | 'medium' | 'high') => {
    switch (level) {
      case 'low':
        return {
          label: t('security.riskLevel.low'),
          bgColor: 'bg-green-500',
          textColor: 'text-green-700',
          bgLight: 'bg-green-100',
          icon: <Shield className="w-4 h-4 text-green-600" />
        };
      case 'medium':
        return {
          label: t('security.riskLevel.medium'),
          bgColor: 'bg-yellow-500',
          textColor: 'text-yellow-700',
          bgLight: 'bg-yellow-100',
          icon: <AlertTriangle className="w-4 h-4 text-yellow-600" />
        };
      case 'high':
        return {
          label: t('security.riskLevel.high'),
          bgColor: 'bg-red-500',
          textColor: 'text-red-700',
          bgLight: 'bg-red-100',
          icon: <AlertTriangle className="w-4 h-4 text-red-600" />
        };
      default:
        return {
          label: t('security.riskLevel.unknown'),
          bgColor: 'bg-gray-500',
          textColor: 'text-gray-700',
          bgLight: 'bg-gray-100',
          icon: <Info className="w-4 h-4 text-gray-600" />
        };
    }
  };
  
  const { label, bgColor, textColor, bgLight, icon } = getLabelAndStyle(riskLevel);
  
  // プログレスバーの幅を計算
  const progressWidth = `${Math.max(0, Math.min(100, score * 100))}%`;
  
  return (
    <div className={`${className}`}>
      {/* リスクインジケーターのプログレスバー */}
      <div className={`w-full ${getSize()} bg-gray-200 rounded-full overflow-hidden`}>
        <div
          className={`${bgColor} h-full rounded-full transition-all duration-500 ease-out`}
          style={{ width: progressWidth }}
        ></div>
      </div>
      
      {/* リスクレベルのラベル（表示する場合） */}
      {showLabel && (
        <div className="flex items-center mt-1">
          {icon}
          <span className={`text-xs font-medium ml-1 ${textColor}`}>{label}</span>
        </div>
      )}
      
      {/* 詳細情報（表示する場合） */}
      {showDetails && (
        <div className={`mt-2 p-2 rounded ${bgLight}`}>
          <div className="flex items-start">
            {icon}
            <div className="ml-2">
              <p className={`text-sm font-medium ${textColor}`}>{label}</p>
              <p className="text-xs text-gray-600 mt-0.5">
                {riskLevel === 'low' && t('security.riskInfo.low')}
                {riskLevel === 'medium' && t('security.riskInfo.medium')}
                {riskLevel === 'high' && t('security.riskInfo.high')}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RiskIndicator;
