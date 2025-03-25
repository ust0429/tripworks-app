import React from 'react';
import { Bar, Circle, Clock, Check, AlertTriangle } from 'lucide-react';
import { AttenderApplicationData, FormStatusType } from '@/types/attender';
import { REQUIRED_STEPS, OPTIONAL_STEPS, STEP_METADATA, StepKey } from '../../../constants/applicationSteps';

interface ProgressReportProps {
  formData: Partial<AttenderApplicationData>;
  formStatus: FormStatusType;
  errors: Record<string, string>;
  onNavigateToStep: (step: number) => void;
}

/**
 * アテンダー申請の進捗状況レポートコンポーネント
 * 全セクションの完了状況を可視化し、未入力項目にナビゲートできる
 */
const ProgressReport: React.FC<ProgressReportProps> = ({
  formData,
  formStatus,
  errors,
  onNavigateToStep
}) => {
  // 必要なステップとオプションステップの取得
  const requiredSteps = REQUIRED_STEPS;
  const optionalSteps = OPTIONAL_STEPS;
  const allSteps = [...requiredSteps, ...optionalSteps];
  
  // セクションの完了状態を確認
  const checkSectionStatus = (stepKey: StepKey): {
    completed: boolean;
    progress: number;
    hasError: boolean;
  } => {
    switch (stepKey) {
      case 'BasicInfo':
        const basicInfoFields = ['name', 'email', 'phoneNumber', 'location', 'biography', 'isLocalResident'];
        const completedBasicFields = basicInfoFields.filter(field => 
          field === 'location' 
            ? formData.location?.country && formData.location?.region && formData.location?.city
            : field === 'isLocalResident'
              ? formData.isLocalResident !== undefined
              : !!formData[field as keyof typeof formData]
        );
        
        return {
          completed: completedBasicFields.length === basicInfoFields.length,
          progress: Math.round((completedBasicFields.length / basicInfoFields.length) * 100),
          hasError: Object.keys(errors).some(key => basicInfoFields.some(field => key.startsWith(field)))
        };
        
      case 'Identification':
        // 身分証明書は必須ではないのでプログレスに特別ルールを適用
        const idDoc = formData.identificationDocument;
        const hasIdDocument = !!idDoc;
        const hasIdType = hasIdDocument && !!idDoc?.type;
        const hasIdNumber = hasIdDocument && !!idDoc?.number;
        const hasIdExpiration = hasIdDocument && !!idDoc?.expirationDate;
        const hasIdImage = hasIdDocument && !!idDoc?.frontImageUrl;
        
        const idFields = [hasIdDocument, hasIdType, hasIdNumber, hasIdExpiration, hasIdImage];
        const completedIdFields = idFields.filter(Boolean);
        
        return {
          completed: hasIdDocument && hasIdType && hasIdImage, // 最低条件
          progress: hasIdDocument ? Math.round((completedIdFields.length / idFields.length) * 100) : 0,
          hasError: Object.keys(errors).some(key => key.startsWith('identificationDocument'))
        };
        
      case 'Agreements':
        const agreementKeys = ['termsOfService', 'privacyPolicy', 'codeOfConduct', 'backgroundCheck'];
        const agreements = formData.agreements || {};
        const completedAgreements = agreementKeys.filter(key => agreements[key as keyof typeof agreements]);
        
        return {
          completed: completedAgreements.length === agreementKeys.length,
          progress: Math.round((completedAgreements.length / agreementKeys.length) * 100),
          hasError: Object.keys(errors).some(key => key.startsWith('agreements'))
        };
        
      case 'Expertise':
        let expertiseProgress = 0;
        let expertiseCompleted = false;
        
        // 専門分野
        const hasSpecialties = formData.specialties && formData.specialties.length > 0;
        const hasLanguages = formData.languages && formData.languages.length > 0;
        const hasExpertise = formData.expertise && formData.expertise.length > 0;
        
        if (hasSpecialties && hasLanguages && hasExpertise) {
          // 専門分野の詳細が入力されているか確認
          const expertiseFields = formData.expertise!.map(exp => 
            !!exp.category && 
            !!exp.subcategories?.length && 
            !!exp.description
          );
          
          const completedExpertiseFields = expertiseFields.filter(Boolean);
          
          expertiseCompleted = completedExpertiseFields.length === expertiseFields.length;
          expertiseProgress = Math.round(
            ((hasSpecialties ? 1 : 0) + (hasLanguages ? 1 : 0) + 
            (completedExpertiseFields.length / Math.max(1, expertiseFields.length))) / 3 * 100
          );
        } else {
          expertiseProgress = Math.round(
            ((hasSpecialties ? 1 : 0) + (hasLanguages ? 1 : 0) + (hasExpertise ? 1 : 0)) / 3 * 100
          );
        }
        
        return {
          completed: hasSpecialties && hasLanguages && hasExpertise && expertiseCompleted,
          progress: expertiseProgress,
          hasError: Object.keys(errors).some(key => 
            key === 'specialties' || key === 'languages' || key === 'expertise' || key.startsWith('expertise[')
          )
        };
        
      case 'ExperienceSamples':
        const hasSamples = formData.experienceSamples && formData.experienceSamples.length > 0;
        
        let samplesProgress = 0;
        let samplesCompleted = false;
        
        if (hasSamples) {
          const sampleFields = formData.experienceSamples!.map(sample => 
            !!sample.title && 
            !!sample.description && 
            !!sample.category && 
            sample.estimatedDuration > 0
          );
          
          const completedSampleFields = sampleFields.filter(Boolean);
          
          samplesCompleted = completedSampleFields.length === sampleFields.length;
          samplesProgress = Math.round((completedSampleFields.length / Math.max(1, sampleFields.length)) * 100);
        }
        
        return {
          completed: hasSamples && samplesCompleted,
          progress: hasSamples ? samplesProgress : 0,
          hasError: Object.keys(errors).some(key => key === 'experienceSamples' || key.startsWith('experienceSamples['))
        };
        
      case 'Availability':
        const hasAvailability = formData.availableTimes && formData.availableTimes.length > 0;
        const hasActiveAvailability = hasAvailability && formData.availableTimes!.some(time => time.isAvailable);
        
        return {
          completed: hasAvailability && hasActiveAvailability,
          progress: hasAvailability ? (hasActiveAvailability ? 100 : 50) : 0,
          hasError: Object.keys(errors).some(key => key === 'availableTimes' || key.startsWith('availableTimes['))
        };
        
      default:
        return { completed: false, progress: 0, hasError: false };
    }
  };

  // 各ステップのインデックスを取得
  const getStepIndex = (stepKey: string): number => {
    const allStepsArray = formStatus === 'required' ? requiredSteps : allSteps;
    return allStepsArray.indexOf(stepKey) + 1;
  };
  
  // 全体の進捗率を計算
  const calculateOverallProgress = (): number => {
    const stepsToCheck = formStatus === 'required' ? requiredSteps : allSteps;
    const statusResults = stepsToCheck.map(step => checkSectionStatus(step as StepKey));
    
    const totalProgress = statusResults.reduce((sum, status) => sum + status.progress, 0);
    return Math.round(totalProgress / stepsToCheck.length);
  };
  
  // 全体の進捗状況
  const overallProgress = calculateOverallProgress();
  
  return (
    <div className="bg-white rounded-lg shadow-md p-5">
      <div className="mb-6">
        <h2 className="text-lg font-bold mb-3">アテンダー申請進捗状況</h2>
        
        <div className="flex items-center mb-2">
          <div className="flex-1">
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium">全体の進行状況</span>
              <span className="text-sm font-medium">{overallProgress}%</span>
            </div>
            <div className="h-2 relative max-w-xl rounded-full overflow-hidden bg-gray-200">
              <div 
                className="h-2 rounded-full bg-blue-600 transition-all duration-500"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 mt-2">
          <div className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800 flex items-center">
            <Check size={12} className="mr-1" />
            完了
          </div>
          <div className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 flex items-center">
            <Clock size={12} className="mr-1" />
            進行中
          </div>
          <div className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-800 flex items-center">
            <AlertTriangle size={12} className="mr-1" />
            エラーあり
          </div>
          {formStatus === 'required' && (
            <div className="text-xs px-2 py-1 rounded-full bg-cyan-100 text-cyan-800">
              必須
            </div>
          )}
        </div>
      </div>
      
      <div className="space-y-4">
        {/* 必須ステップ */}
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
            <Circle size={8} className="mr-2 fill-current text-cyan-500" />
            基本情報
            <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-800">必須</span>
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {requiredSteps.map((stepKey) => {
              const stepStatus = checkSectionStatus(stepKey as StepKey);
              const stepIndex = getStepIndex(stepKey);
              const stepMeta = STEP_METADATA[stepKey as StepKey];
              
              // ステータスに応じたスタイル
              let statusBadge;
              let progressBarColor;
              
              if (stepStatus.hasError) {
                statusBadge = (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-800 flex items-center">
                    <AlertTriangle size={10} className="mr-1" />
                    エラー
                  </span>
                );
                progressBarColor = 'bg-red-500';
              } else if (stepStatus.completed) {
                statusBadge = (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-800 flex items-center">
                    <Check size={10} className="mr-1" />
                    完了
                  </span>
                );
                progressBarColor = 'bg-green-500';
              } else if (stepStatus.progress > 0) {
                statusBadge = (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800 flex items-center">
                    <Clock size={10} className="mr-1" />
                    進行中
                  </span>
                );
                progressBarColor = 'bg-yellow-500';
              } else {
                statusBadge = (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-800">
                    未入力
                  </span>
                );
                progressBarColor = 'bg-gray-300';
              }
              
              return (
                <div 
                  key={stepKey}
                  className="p-3 border border-gray-200 rounded-md hover:border-blue-300 cursor-pointer transition-colors"
                  onClick={() => onNavigateToStep(stepIndex)}
                >
                  <div className="flex justify-between items-center mb-2">
                    <div className="font-medium text-sm">{stepMeta.title}</div>
                    {statusBadge}
                  </div>
                  
                  <div className="h-1.5 relative rounded-full overflow-hidden bg-gray-200">
                    <div 
                      className={`h-1.5 rounded-full ${progressBarColor} transition-all duration-500`}
                      style={{ width: `${stepStatus.progress}%` }}
                    />
                  </div>
                  
                  <div className="mt-2 text-xs text-gray-500">
                    {stepStatus.hasError 
                      ? '入力内容にエラーがあります'
                      : stepStatus.completed
                        ? '全ての項目が入力済み'
                        : `入力完了率: ${stepStatus.progress}%`
                    }
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* オプショナルセクション - 全情報モードの場合のみ表示 */}
        {formStatus !== 'required' && (
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
              <Circle size={8} className="mr-2 fill-current text-indigo-500" />
              詳細情報
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {optionalSteps.map((stepKey) => {
                const stepStatus = checkSectionStatus(stepKey as StepKey);
                const stepIndex = getStepIndex(stepKey);
                const stepMeta = STEP_METADATA[stepKey as StepKey];
                
                // ステータスに応じたスタイル
                let statusBadge;
                let progressBarColor;
                
                if (stepStatus.hasError) {
                  statusBadge = (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-800 flex items-center">
                      <AlertTriangle size={10} className="mr-1" />
                      エラー
                    </span>
                  );
                  progressBarColor = 'bg-red-500';
                } else if (stepStatus.completed) {
                  statusBadge = (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-800 flex items-center">
                      <Check size={10} className="mr-1" />
                      完了
                    </span>
                  );
                  progressBarColor = 'bg-green-500';
                } else if (stepStatus.progress > 0) {
                  statusBadge = (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800 flex items-center">
                      <Clock size={10} className="mr-1" />
                      進行中
                    </span>
                  );
                  progressBarColor = 'bg-yellow-500';
                } else {
                  statusBadge = (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-800">
                      未入力
                    </span>
                  );
                  progressBarColor = 'bg-gray-300';
                }
                
                return (
                  <div 
                    key={stepKey}
                    className="p-3 border border-gray-200 rounded-md hover:border-blue-300 cursor-pointer transition-colors"
                    onClick={() => onNavigateToStep(stepIndex)}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <div className="font-medium text-sm">{stepMeta.title}</div>
                      {statusBadge}
                    </div>
                    
                    <div className="h-1.5 relative rounded-full overflow-hidden bg-gray-200">
                      <div 
                        className={`h-1.5 rounded-full ${progressBarColor} transition-all duration-500`}
                        style={{ width: `${stepStatus.progress}%` }}
                      />
                    </div>
                    
                    <div className="mt-2 text-xs text-gray-500">
                      {stepStatus.hasError 
                        ? '入力内容にエラーがあります'
                        : stepStatus.completed
                          ? '全ての項目が入力済み'
                          : `入力完了率: ${stepStatus.progress}%`
                      }
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
      
      <div className="mt-6 border-t border-gray-200 pt-3">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            {formStatus === 'required' 
              ? '基本情報のみ完了すれば申請できます。詳細は後から追加できます。' 
              : '全ての項目を入力して申請を完了しましょう。'}
          </div>
          <button
            onClick={() => onNavigateToStep(1)}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            最初から確認する
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProgressReport;