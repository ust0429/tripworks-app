import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { collectDeviceFingerprint, generateDeviceId, storeDeviceId, getStoredDeviceId } from '../../utils/fraudDetection/deviceFingerprinting';
import { getCurrentIP, getLocationFromIP } from '../../utils/fraudDetection/geoRiskAnalysis';
import SecurityVerificationModal from './SecurityVerificationModal';

interface FraudDetectionContextType {
  deviceId: string | null;
  isCollectingDeviceInfo: boolean;
  riskScore: number;
  isHighRisk: boolean;
  requiresVerification: boolean;
  showVerificationModal: (method: 'sms' | 'email' | 'captcha' | '3ds', riskLevel: 'low' | 'medium' | 'high', reasons?: string[]) => Promise<boolean>;
  collectDeviceInfo: () => Promise<{ deviceId: string; ipAddress: string }>;
}

const FraudDetectionContext = createContext<FraudDetectionContextType>({
  deviceId: null,
  isCollectingDeviceInfo: false,
  riskScore: 0,
  isHighRisk: false,
  requiresVerification: false,
  showVerificationModal: async () => false,
  collectDeviceInfo: async () => ({ deviceId: '', ipAddress: '' })
});

export const useFraudDetection = () => useContext(FraudDetectionContext);

interface FraudDetectionProviderProps {
  children: ReactNode;
}

export const FraudDetectionProvider: React.FC<FraudDetectionProviderProps> = ({ children }) => {
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [isCollectingDeviceInfo, setIsCollectingDeviceInfo] = useState(false);
  const [riskScore, setRiskScore] = useState(0);
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [verificationMethod, setVerificationMethod] = useState<'sms' | 'email' | 'captcha' | '3ds'>('sms');
  const [verificationRiskLevel, setVerificationRiskLevel] = useState<'low' | 'medium' | 'high'>('medium');
  const [verificationReasons, setVerificationReasons] = useState<string[]>([]);
  const [verificationPromiseResolve, setVerificationPromiseResolve] = useState<((value: boolean) => void) | null>(null);

  // 初期化時にデバイスIDを取得
  useEffect(() => {
    const storedDeviceId = getStoredDeviceId();
    if (storedDeviceId) {
      setDeviceId(storedDeviceId);
    } else {
      // デバイスIDがなければ初期デバイス情報収集
      collectDeviceInfo();
    }
  }, []);

  // デバイス情報を収集
  const collectDeviceInfo = async (): Promise<{ deviceId: string; ipAddress: string }> => {
    try {
      setIsCollectingDeviceInfo(true);
      
      // デバイスフィンガープリントを収集
      const fingerprint = await collectDeviceFingerprint();
      const generatedDeviceId = await generateDeviceId(fingerprint);
      
      // デバイスIDを保存
      storeDeviceId(generatedDeviceId);
      setDeviceId(generatedDeviceId);
      
      // IPアドレスを取得
      const ipAddress = await getCurrentIP();
      
      // 実際のアプリケーションでは、サーバーにデバイス情報を送信して
      // ユーザーアカウントと関連付けるなどの処理を行う
      
      return { deviceId: generatedDeviceId, ipAddress };
    } catch (error) {
      console.error('デバイス情報の収集に失敗しました:', error);
      return { deviceId: 'unknown', ipAddress: 'unknown' };
    } finally {
      setIsCollectingDeviceInfo(false);
    }
  };

  // 検証モーダルを表示
  const showVerificationModal = (
    method: 'sms' | 'email' | 'captcha' | '3ds',
    riskLevel: 'low' | 'medium' | 'high' = 'medium',
    reasons: string[] = []
  ): Promise<boolean> => {
    return new Promise((resolve) => {
      setVerificationMethod(method);
      setVerificationRiskLevel(riskLevel);
      setVerificationReasons(reasons);
      setVerificationPromiseResolve(() => resolve);
      setIsVerificationModalOpen(true);
    });
  };

  // 検証完了時の処理
  const handleVerificationComplete = (success: boolean) => {
    if (verificationPromiseResolve) {
      verificationPromiseResolve(success);
    }
    
    // モーダルを閉じる（成功時は少し遅延させる）
    if (success) {
      setTimeout(() => {
        setIsVerificationModalOpen(false);
      }, 1500);
    } else {
      setIsVerificationModalOpen(false);
    }
  };

  // キャンセル時の処理
  const handleVerificationCancel = () => {
    if (verificationPromiseResolve) {
      verificationPromiseResolve(false);
    }
    setIsVerificationModalOpen(false);
  };

  const value = {
    deviceId,
    isCollectingDeviceInfo,
    riskScore,
    isHighRisk: riskScore >= 0.7,
    requiresVerification: riskScore >= 0.4,
    showVerificationModal,
    collectDeviceInfo
  };

  return (
    <FraudDetectionContext.Provider value={value}>
      {children}
      
      {/* 検証モーダル */}
      <SecurityVerificationModal
        isOpen={isVerificationModalOpen}
        onClose={handleVerificationCancel}
        onVerificationComplete={handleVerificationComplete}
        verificationMethod={verificationMethod}
        riskLevel={verificationRiskLevel}
        reasons={verificationReasons}
      />
    </FraudDetectionContext.Provider>
  );
};
