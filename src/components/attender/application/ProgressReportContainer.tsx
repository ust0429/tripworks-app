import React from 'react';
import { useAttenderApplication } from '../../../contexts/AttenderApplicationContext';
import ProgressReport from '../../../../components/attender/registration/ProgressReport';

/**
 * 進捗状況レポートコンテナ
 * アテンダー申請コンテキストのデータを進捗状況レポートに渡すコンテナコンポーネント
 */
const ProgressReportContainer: React.FC = () => {
  const { 
    formData, 
    formStatus, 
    errors, 
    goToStep 
  } = useAttenderApplication();
  
  return (
    <ProgressReport
      formData={formData}
      formStatus={formStatus}
      errors={errors}
      onNavigateToStep={goToStep}
    />
  );
};

export default ProgressReportContainer;