import React, { useState, useCallback, useEffect } from 'react';
import FileUploader from './CustomFileUploader';
import { useAttenderApplication } from '../../../contexts/AttenderApplicationContext';
import { uploadIdentificationDocument } from '../../../services/upload/FileUploadService';
import { IdentificationDocument } from '../../../types/attender/index';
import { AlertTriangle, Info, CheckCircle } from 'lucide-react';

interface IdentificationUploaderProps {
  documentType: 'passport' | 'driver_license' | 'id_card' | 'residence_card' | 'other';
  side: 'front' | 'back';
  initialImageUrl?: string;
  required?: boolean;
}

/**
 * 身分証明書アップロードコンポーネント
 * 
 * アテンダー申請時の身分証明書をアップロードするためのコンポーネント
 * UI/UXと視覚的フィードバックを強化
 */
const IdentificationUploader: React.FC<IdentificationUploaderProps> = ({
  documentType,
  side,
  initialImageUrl,
  required = side === 'front' // 表面は常に必須
}) => {
  const { formData, updateFormData, setError, clearError, errors } = useAttenderApplication();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // 身分証明書情報の現在値を取得
  const currentIdDocument = formData.identificationDocument || {
    type: documentType,
    number: '',
    expirationDate: '',
    frontImageUrl: '',
    backImageUrl: ''
  };

  // エラーを取得
  const errorKey = `identificationDocument.${side}ImageUrl`;
  const hasError = Boolean(errors[errorKey]);
  const errorMessage = errors[errorKey];

  // 現在のアップロード済み画像URL
  const existingUrl = side === 'front' 
    ? currentIdDocument.frontImageUrl 
    : currentIdDocument.backImageUrl;

  // コンポーネントマウント時に必要な初期化
  useEffect(() => {
    // 既にURLがあれば成功状態にする
    if (existingUrl) {
      setUploadSuccess(true);
    }
    
    // タイプが変更された場合、身分証明書のタイプを更新
    if (currentIdDocument.type !== documentType) {
      const updatedDocument: IdentificationDocument = {
        ...currentIdDocument,
        type: documentType
      };
      updateFormData({
        identificationDocument: updatedDocument
      });
    }
  }, [existingUrl, documentType, currentIdDocument, updateFormData]);

  // 進行状況表示用のシミュレート関数
  const simulateProgress = useCallback(() => {
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 95) {
          clearInterval(interval);
          return prev;
        }
        return prev + Math.floor(Math.random() * 10) + 1;
      });
    }, 300);
    
    return () => clearInterval(interval);
  }, []);

  // ファイルアップロード処理
  const handleUpload = useCallback(async (file: File): Promise<string> => {
    setIsUploading(true);
    setUploadSuccess(false);
    clearError(errorKey);
    
    // 進行状況表示開始
    const stopSimulation = simulateProgress();

    try {
      // ファイルをアップロード
      const url = await uploadIdentificationDocument(file, documentType);
      stopSimulation();
      setUploadProgress(100);

      // 成功したら状態を更新
      const updatedDocument: IdentificationDocument = {
        ...currentIdDocument,
        type: documentType,
        [side === 'front' ? 'frontImageUrl' : 'backImageUrl']: url
      };

      updateFormData({
        identificationDocument: updatedDocument
      });

      setUploadSuccess(true);
      return url;
    } catch (error) {
      stopSimulation();
      setUploadProgress(0);
      
      const errorMessage = error instanceof Error 
        ? error.message 
        : '身分証明書のアップロードに失敗しました';
      
      setError(errorKey, errorMessage);
      throw error;
    } finally {
      setIsUploading(false);
    }
  }, [documentType, side, currentIdDocument, updateFormData, setError, clearError, errorKey, simulateProgress]);

  // アップロード成功時の処理
  const handleSuccess = useCallback((url: string) => {
    console.log(`${side}側の身分証明書が正常にアップロードされました: ${url}`);
    setUploadSuccess(true);
  }, [side]);

  // アップロードエラー時の処理
  const handleError = useCallback((error: Error) => {
    console.error(`身分証明書のアップロードエラー: ${error.message}`);
    setError(errorKey, error.message);
    setUploadSuccess(false);
  }, [setError, errorKey]);

  // 書類タイプの表示名
  const getDocumentTypeName = () => {
    switch (documentType) {
      case 'passport': return 'パスポート';
      case 'driver_license': return '運転免許証';
      case 'id_card': return 'マイナンバーカード';
      case 'residence_card': return '在留カード';
      default: return '身分証明書';
    }
  };

  // 表裏の表示名
  const getSideName = () => side === 'front' ? '表面' : '裏面';

  // コンポーネントの表示名
  const componentTitle = `${getDocumentTypeName()}（${getSideName()}）${required ? ' *' : ''}`;

  return (
    <div className="mb-6">
      <div className="mb-2 flex items-center">
        <span className="font-medium text-gray-700">{componentTitle}</span>
        <div className="ml-2 text-blue-500">
          <Info 
            className="w-4 h-4 cursor-help"
            aria-label={`${getDocumentTypeName()}の${getSideName()}をアップロードしてください`}
          />
        </div>
      </div>
      
      {/* アップローダーコンポーネント */}
      <FileUploader
        onFileSelect={handleUpload}
        onSuccess={handleSuccess}
        onError={handleError}
        accept="image/jpeg,image/png,image/gif,application/pdf"
        maxSize={5 * 1024 * 1024} // 5MB
        buttonText={`${getSideName()}をアップロード`}
        dragActiveText={`${getSideName()}をドロップ`}
        dragInactiveText={`${getSideName()}の画像をドラッグ＆ドロップ`}
        showPreview={true}
        initialImageUrl={initialImageUrl || existingUrl}
        previewHeight={240}
        className={`border-2 ${hasError ? 'border-red-300' : uploadSuccess ? 'border-green-300' : 'border-gray-300'} ${isUploading ? 'bg-blue-50' : ''}`}
      />
      
      {/* アップロード進行状況 */}
      {isUploading && (
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
          <p className="mt-2 text-sm text-gray-500 flex items-center">
            <span className="mr-2 animate-pulse">⏳</span>
            アップロード中...しばらくお待ちください ({uploadProgress}%)
          </p>
        </div>
      )}
      
      {/* 成功メッセージ */}
      {uploadSuccess && !isUploading && (
        <div className="mt-2 flex items-center text-sm text-green-600">
          <CheckCircle className="w-4 h-4 mr-1" />
          {getSideName()}のアップロードが完了しました
        </div>
      )}
      
      {/* エラーメッセージ */}
      {hasError && (
        <div className="mt-2 text-sm text-red-600 flex items-center">
          <AlertTriangle className="w-4 h-4 mr-1" />
          {errorMessage}
        </div>
      )}
      
      {/* ヘルプメッセージ */}
      <div className="mt-2 text-xs text-gray-500">
        <p>※ JPG、PNG、GIF形式の画像またはPDF形式の書類が利用できます（最大5MB）</p>
        {side === 'front' && (
          <p className="mt-1">※ 証明書のお名前、生年月日、有効期限が明確に見えるようにアップロードしてください</p>
        )}
      </div>
    </div>
  );
};

export default IdentificationUploader;
