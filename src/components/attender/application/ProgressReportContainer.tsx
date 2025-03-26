import React from 'react';
import { useAttenderApplication } from '../../../contexts/AttenderApplicationContext';
import ProgressReport from '../registration/ProgressReport';

/**
 * 進捗状況レポートコンテナ
 * アテンダー申請コンテキストのデータを進捗状況レポートに渡すコンテナコンポーネント
 */
const ProgressReportContainer: React.FC = () => {
  const { 
    formData, 
    formStatus, 
    errors, 
    goToStep,
    currentStep,
    maxSteps
  } = useAttenderApplication();
  
  return (
    <ProgressReport
      formData={formData}
      formStatus={formStatus}
      errors={errors}
      onNavigateToStep={goToStep}
      currentStep={currentStep}
      maxSteps={maxSteps}
      completedSteps={[]}
    />
  );
};

export default ProgressReportContainer;