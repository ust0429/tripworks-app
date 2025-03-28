/**
 * 身分証明・追加情報入力ステップ
 * 
 * アテンダー申請フォームの身分証明書と追加情報を入力するステップ
 */
import React, { useState, useEffect } from 'react';
import { useAttenderApplication } from '../../../../contexts/AttenderApplicationContext';
import { AdditionalDocument, Reference, SocialMediaLinks, IdentificationDocument } from '../../../../types/attender/index';
import IdentificationUploader from '../IdentificationUploader';
import { AlertCircle, CheckCircle, HelpCircle } from 'lucide-react';

interface IdentificationStepProps {
  onNext: () => void;
  onBack: () => void;
}

// 拡張された推薦者型（フォーム入力用）
interface ReferenceForm {
  name: string;
  relationship: string;
  email: string;
  phoneNumber?: string;
  contactInfo?: string;
  yearsKnown?: number;
  message?: string;
  verified?: boolean;
}

const IdentificationStep: React.FC<IdentificationStepProps> = ({ onNext, onBack }) => {
  const { 
    formData, 
    updateFormData, 
    errors, 
    clearError,
    addReference,
    updateReference,
    removeReference,
    addDocument,
    removeDocument,
    updateSocialMediaLinks
  } = useAttenderApplication();
  
  // ファイルアップロード用の状態
  const [frontImageFile, setFrontImageFile] = useState<File | null>(null);
  const [backImageFile, setBackImageFile] = useState<File | null>(null);
  const [additionalDocFile, setAdditionalDocFile] = useState<File | null>(null);
  
  // 新しい推薦者情報
  const [newReference, setNewReference] = useState<ReferenceForm>({
    name: '',
    relationship: '',
    email: '',
    contactInfo: '',
    phoneNumber: '',
    yearsKnown: 0
  });
  
  // 新しい追加書類情報
  const [newDocument, setNewDocument] = useState<Omit<AdditionalDocument, 'fileUrl' | 'uploadDate'>>({
    type: '' as 'certification' | 'license' | 'insurance' | 'reference_letter' | 'other',
    title: '',
    description: '',
    verified: false
  });
  
  // 身分証明書情報の更新
  const handleIdDocChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    const fieldName = name.split('.')[1] as keyof IdentificationDocument;
    
    // 現在のidentificationDocument情報を取得または初期化
    const currentIdDoc = formData.identificationDocument || {
      type: '' as 'passport' | 'driver_license' | 'id_card' | 'residence_card' | 'other',
      number: '',
      expirationDate: '',
      frontImageUrl: ''
    };
    
    updateFormData({
      identificationDocument: {
        ...currentIdDoc,
        [fieldName]: value
      }
    });
    
    clearError(name);
  };
  
  // 身分証明書画像のアップロード処理
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, isFront: boolean) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // 実際の実装ではクラウドストレージへのアップロード処理を行い、URLを取得する
    // ここではモック実装としてファイル名をURLとして扱う
    const mockUrl = `https://storage.example.com/ids/${Date.now()}-${file.name}`;
    
    // 現在のidentificationDocument情報を取得または初期化
    const currentIdDoc = formData.identificationDocument || {
      type: '' as 'passport' | 'driver_license' | 'id_card' | 'residence_card' | 'other',
      number: '',
      expirationDate: '',
      frontImageUrl: ''
    };
    
    if (isFront) {
      setFrontImageFile(file);
      updateFormData({
        identificationDocument: {
          ...currentIdDoc,
          frontImageUrl: mockUrl
        }
      });
      clearError('identificationDocument.frontImageUrl');
    } else {
      setBackImageFile(file);
      updateFormData({
        identificationDocument: {
          ...currentIdDoc,
          backImageUrl: mockUrl
        }
      });
    }
  };
  
  
  // 推薦者情報の入力変更
  const handleReferenceChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewReference({
      ...newReference,
      [name]: name === 'yearsKnown' ? parseFloat(value) : value
    });
  };
  
  // 推薦者の追加
  const handleAddReference = () => {
    if (newReference.name && newReference.relationship && (newReference.contactInfo || newReference.email)) {
      // contactInfo から email または phone を設定
      const reference: Reference = {
        name: newReference.name,
        relationship: newReference.relationship,
        email: newReference.email || newReference.contactInfo || '',
        phone: newReference.phoneNumber,
        yearsKnown: newReference.yearsKnown,
        message: newReference.message,
        verified: newReference.verified || false
      };
      
      addReference(reference);
      setNewReference({
        name: '',
        relationship: '',
        email: '',
        contactInfo: '',
        phoneNumber: '',
        yearsKnown: 0
      });
    }
  };
  
  // 追加書類の入力変更
  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewDocument({
      ...newDocument,
      [name]: value
    });
  };
  
  // 追加書類のアップロード処理
  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setAdditionalDocFile(file);
  };
  
  // 追加書類の追加
  const handleAddDocument = () => {
    if (newDocument.type && newDocument.title && additionalDocFile) {
      // 実際の実装ではクラウドストレージへのアップロード処理を行い、URLを取得する
      // ここではモック実装としてファイル名をURLとして扱う
      const mockUrl = `https://storage.example.com/docs/${Date.now()}-${additionalDocFile.name}`;
      
      const newDoc: AdditionalDocument = {
        ...newDocument,
        fileUrl: mockUrl,
        uploadDate: new Date().toISOString()
      };
      addDocument(newDoc);
      
      setNewDocument({
        type: '' as 'certification' | 'license' | 'insurance' | 'reference_letter' | 'other',
        title: '',
        description: '',
        verified: false
      });
      setAdditionalDocFile(null);
    }
  };
  
  // 次のステップへ進む前のバリデーション
  const handleNext = () => {
    // 身分証明書は任意のため、バリデーションなしで次へ進める
    onNext();
  };
  
  return (
    <div className="space-y-8">
      <h2 className="text-xl font-semibold mb-4">身分証明と追加情報</h2>

      {/* 身分証明書セクション */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">身分証明書</h3>
          <div className="flex items-center bg-amber-50 px-3 py-1 rounded-full text-amber-700 text-xs">
            <AlertCircle className="w-4 h-4 mr-1" />
            <span>任意情報</span>
          </div>
        </div>

<div className="mb-4 p-3 bg-amber-100 rounded-md text-sm text-amber-800 flex items-start">
          <HelpCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
          <div>
            <p className="mb-1 font-medium">本人確認は現時点では任意です</p>
            <p>
              本人確認の提出は現時点では任意です。売上が発生し、振込手続きが必要になった時点で提出をお願いいたします。本ページをスキップして先に進むことも可能です。
            </p>
          </div>
        </div>
        
        <div className="space-y-4">
          {/* 身分証明書タイプ */}
          <div>
            <label htmlFor="identificationDocument.type" className="block text-sm font-medium text-gray-700 mb-1">
              身分証明書の種類
            </label>
            <select
              id="identificationDocument.type"
              name="identificationDocument.type"
              value={formData.identificationDocument?.type || ''}
              onChange={handleIdDocChange}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                errors['identificationDocument.type'] ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">選択してください</option>
              <option value="passport">パスポート</option>
              <option value="driver_license">運転免許証</option>
              <option value="id_card">マイナンバーカード</option>
              <option value="residence_card">在留カード（外国籍の方）</option>
              <option value="other">その他</option>
            </select>
            {errors['identificationDocument.type'] && (
              <p className="mt-1 text-sm text-red-500">{errors['identificationDocument.type']}</p>
            )}
          </div>
          
          {/* 身分証明書番号 */}
          <div>
            <label htmlFor="identificationDocument.number" className="block text-sm font-medium text-gray-700 mb-1">
              身分証明書番号
            </label>
            <input
              type="text"
              id="identificationDocument.number"
              name="identificationDocument.number"
              value={formData.identificationDocument?.number || ''}
              onChange={handleIdDocChange}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                errors['identificationDocument.number'] ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="身分証明書に記載されている番号"
            />
            {errors['identificationDocument.number'] && (
              <p className="mt-1 text-sm text-red-500">{errors['identificationDocument.number']}</p>
            )}
          </div>
          
          {/* 有効期限 */}
          <div>
            <label htmlFor="identificationDocument.expirationDate" className="block text-sm font-medium text-gray-700 mb-1">
              有効期限
            </label>
            <input
              type="date"
              id="identificationDocument.expirationDate"
              name="identificationDocument.expirationDate"
              value={formData.identificationDocument?.expirationDate || ''}
              onChange={handleIdDocChange}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                errors['identificationDocument.expirationDate'] ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors['identificationDocument.expirationDate'] && (
              <p className="mt-1 text-sm text-red-500">{errors['identificationDocument.expirationDate']}</p>
            )}
          </div>
          
          {/* 身分証明書の表面画像 - アップローダーコンポーネントを使用 */}
          {formData.identificationDocument?.type && (
            <div className="mt-6">
              <h4 className="font-medium text-gray-800 mb-3">身分証明書の画像</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <IdentificationUploader 
                    documentType={formData.identificationDocument.type} 
                    side="front"
                    initialImageUrl={formData.identificationDocument.frontImageUrl}
                  />
                  {errors['identificationDocument.frontImageUrl'] && (
                    <p className="mt-1 text-sm text-red-500">{errors['identificationDocument.frontImageUrl']}</p>
                  )}
                </div>
                
                <div>
                  <IdentificationUploader 
                    documentType={formData.identificationDocument.type} 
                    side="back"
                    initialImageUrl={formData.identificationDocument.backImageUrl}
                  />
                </div>
              </div>
              
              <div className="mt-3 text-xs text-gray-500 p-2 bg-gray-50 rounded">
                <p className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-1" /> 
                  アップロードされた画像は安全に暗号化され保存されます
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* 推薦者セクション - 推薦者機能は除外されているため省略 */}
      
      {/* 追加書類 */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <h3 className="text-lg font-medium mb-4">追加書類（任意）</h3>
        <p className="text-sm text-gray-500 mb-4">
          保有している資格証明や免許、保険証書などの追加書類を提出することで、あなたの専門性や信頼性をアピールできます。
        </p>
        
        {/* 登録済み追加書類のリスト */}
        {formData.additionalDocuments && formData.additionalDocuments.length > 0 && (
          <div className="mb-6">
            <h4 className="text-md font-medium mb-2">登録済み書類</h4>
            <ul className="divide-y divide-gray-200">
              {formData.additionalDocuments.map((document, index) => (
                <li key={index} className="py-3 flex justify-between items-center">
                  <div>
                    <p className="font-medium">{document.title}</p>
                    <p className="text-sm text-gray-500">{document.type}</p>
                    {document.description && (
                      <p className="text-xs text-gray-400">{document.description}</p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeDocument(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    削除
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {/* 新しい追加書類フォーム */}
        <div className="space-y-4">
          <h4 className="text-md font-medium mb-2">新しい書類を追加</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 書類タイプ */}
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                書類の種類
              </label>
              <select
                id="type"
                name="type"
                value={newDocument.type}
                onChange={handleDocumentChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">選択してください</option>
                <option value="certification">資格証明書</option>
                <option value="license">免許証</option>
                <option value="insurance">保険証書</option>
                <option value="reference_letter">推薦状</option>
                <option value="other">その他</option>
              </select>
            </div>
            
            {/* タイトル */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                タイトル
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={newDocument.title}
                onChange={handleDocumentChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="例: 調理師免許、英語能力証明書など"
              />
            </div>
            
            {/* 説明 */}
            <div className="md:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                説明（任意）
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                value={newDocument.description || ''}
                onChange={handleDocumentChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="この資格や書類についての補足説明があれば記入してください"
              />
            </div>
            
            {/* ファイルアップロード */}
            <div className="md:col-span-2">
              <label htmlFor="documentFile" className="block text-sm font-medium text-gray-700 mb-1">
                ファイル
              </label>
              <div className="mt-1 flex items-center">
                <input
                  type="file"
                  id="documentFile"
                  name="documentFile"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleDocumentUpload}
                  className="sr-only"
                />
                <label
                  htmlFor="documentFile"
                  className="relative cursor-pointer bg-white border border-gray-300 rounded-md py-2 px-3 flex items-center justify-center text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <span>ファイルを選択</span>
                </label>
                <span className="ml-2 text-sm text-gray-500">
                  {additionalDocFile ? additionalDocFile.name : '選択されていません'}
                </span>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                PDFまたは画像ファイル（JPG、PNG）を選択してください。ファイルサイズは5MB以下にしてください。
              </p>
            </div>
          </div>
          
          {/* 追加ボタン */}
          <div className="mt-4">
            <button
              type="button"
              onClick={handleAddDocument}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={!newDocument.type || !newDocument.title || !additionalDocFile}
            >
              書類を追加
            </button>
          </div>
        </div>
      </div>
      
      {/* ナビゲーションボタン */}
      <div className="flex justify-between pt-6">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          前へ
        </button>
        <button
          type="button"
          onClick={handleNext}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          スキップして次へ
        </button>
      </div>
    </div>
  );
};

export default IdentificationStep;