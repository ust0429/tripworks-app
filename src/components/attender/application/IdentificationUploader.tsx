import React, { useState, useCallback } from 'react';
import { FileUploader } from '../../common/upload';
import { useAttenderApplication } from '../../../contexts/AttenderApplicationContext';
import { uploadIdentificationDocument } from '../../../services/upload/FileUploadService';
import { IdentificationDocument } from '../../../types/attender/index';

interface IdentificationUploaderProps {
  documentType: 'passport' | 'driver_license' | 'id_card' | 'residence_card' | 'other';
  side: 'front' | 'back';
  initialImageUrl?: string;
}

/**
 * 身分証明書アップロードコンポーネント
 * 
 * アテンダー申請時の身分証明書をアップロードするためのコンポーネント
 */
const IdentificationUploader: React.FC<IdentificationUploaderProps> = ({
  documentType,
  side,
  initialImageUrl
}) => {
  const { formData, updateFormData, setError, clearError } = useAttenderApplication();
  const [isUploading, setIsUploading] = useState(false);

  // 身分証明書情報の現在値を取得
  const currentIdDocument = formData.identificationDocument || {
    type: documentType,
    number: '',
    expirationDate: '',
    frontImageUrl: '',
    backImageUrl: ''
  };

  // ファイルアップロード処理
  const handleUpload = useCallback(async (file: File): Promise<string> => {
    setIsUploading(true);
    clearError(`identificationDocument.${side}ImageUrl`);

    try {
      // ファイルをアップロード
      const url = await uploadIdentificationDocument(file, documentType);

      // 成功したら状態を更新
      const updatedDocument: IdentificationDocument = {
        ...currentIdDocument,
        type: documentType,
        [side === 'front' ? 'frontImageUrl' : 'backImageUrl']: url
      };

      updateFormData({
        identificationDocument: updatedDocument
      });

      return url;
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : '身分証明書のアップロードに失敗しました';
      
      setError(`identificationDocument.${side}ImageUrl`, errorMessage);
      throw error;
    } finally {
      setIsUploading(false);
    }
  }, [documentType, side, currentIdDocument, updateFormData, setError, clearError]);

  // アップロード成功時の処理
  const handleSuccess = useCallback((url: string) => {
    console.log(`${side}側の身分証明書が正常にアップロードされました: ${url}`);
  }, [side]);

  // アップロードエラー時の処理
  const handleError = useCallback((error: Error) => {
    console.error(`身分証明書のアップロードエラー: ${error.message}`);
    setError(`identificationDocument.${side}ImageUrl`, error.message);
  }, [setError, side]);

  // コンポーネントの表示名（サイドに応じて変更）
  const componentTitle = side === 'front' ? '表面' : '裏面';
  const existingUrl = side === 'front' 
    ? currentIdDocument.frontImageUrl 
    : currentIdDocument.backImageUrl;

  return (
    <div className="mb-4">
      <div className="mb-2 text-sm font-medium text-gray-700">
        {documentType === 'passport' ? 'パスポート' : 
         documentType === 'driver_license' ? '運転免許証' : 
         documentType === 'id_card' ? '身分証明書' : 
         documentType === 'residence_card' ? '在留カード' : 
         '身分証明書'} ({componentTitle})
      </div>
      
      <FileUploader
        onFileSelect={handleUpload}
        onSuccess={handleSuccess}
        onError={handleError}
        accept="image/jpeg,image/png,image/gif,application/pdf"
        maxSize={5 * 1024 * 1024} // 5MB
        buttonText={`${componentTitle}をアップロード`}
        dragActiveText={`${componentTitle}をドロップ`}
        dragInactiveText={`${componentTitle}の画像をドラッグ＆ドロップ`}
        showPreview={true}
        initialImageUrl={initialImageUrl || existingUrl}
      />
      
      {isUploading && (
        <div className="mt-2 text-xs text-gray-500">
          アップロード中...しばらくお待ちください
        </div>
      )}
      
      <div className="mt-1 text-xs text-gray-500">
        ※ JPG、PNG、GIF形式の画像またはPDF形式の書類が利用できます（最大5MB）
      </div>
    </div>
  );
};

export default IdentificationUploader;
