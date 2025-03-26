import React, { ReactNode } from 'react';
import { Smartphone } from 'lucide-react';

import { FormStatusType } from '../../../types/attender/index';

interface MobileFormWrapperProps {
  children: ReactNode;
  currentStep: number;
  maxSteps: number;
  formStatus: FormStatusType;
  onNavigate: (step: number) => void;
  isStepCompleted: (step: number) => boolean;
  isMobile?: boolean;
  showDeviceIndicator?: boolean;
  className?: string;
}

/**
 * モバイル表示に最適化されたフォームラッパーコンポーネント
 * 
 * レスポンシブデザインと、異なるデバイスでの表示を最適化する
 */
const MobileFormWrapper: React.FC<MobileFormWrapperProps> = ({
  children,
  currentStep,
  maxSteps,
  formStatus,
  onNavigate,
  isStepCompleted,
  isMobile = false,
  showDeviceIndicator = true,
  className = ''
}) => {
  // モバイル用とデスクトップ用のスタイルを分岐
  const wrapperClasses = isMobile
    ? 'max-w-sm mx-auto px-2 py-4'
    : 'max-w-4xl mx-auto px-4 py-6';
    
  return (
    <div className={`${wrapperClasses} ${className}`}>
      {/* デバイス表示インジケーター（開発モード時のみ表示） */}
      {process.env.NODE_ENV !== 'production' && showDeviceIndicator && (
        <div className="mb-3 text-xs text-gray-500 flex items-center justify-end">
          <div className="hidden sm:block md:hidden">タブレット表示</div>
          <div className="hidden md:block">デスクトップ表示</div>
          <div className="sm:hidden flex items-center">
            <Smartphone className="w-3 h-3 mr-1" />
            <span>モバイル表示</span>
          </div>
        </div>
      )}
      
      {/* モバイル用の最適化コンテナ */}
      {isMobile ? (
        <div className="bg-white rounded-lg shadow-sm pb-20">
          {children}
        </div>
      ) : (
        // デスクトップ用の標準コンテナ
        <div className="bg-white rounded-lg shadow-sm">
          {children}
        </div>
      )}
    </div>
  );
};

export default MobileFormWrapper;