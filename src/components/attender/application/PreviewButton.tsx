import React, { useState } from 'react';
import { Eye } from 'lucide-react';
import { AttenderApplicationData } from '../../../types/attender';
import ProfilePreview from '../../../../components/attender/registration/ProfilePreview';

interface PreviewButtonProps {
  formData: Partial<AttenderApplicationData>;
  isFormValid: boolean;
}

const PreviewButton: React.FC<PreviewButtonProps> = ({ formData, isFormValid }) => {
  const [showPreview, setShowPreview] = useState(false);

  const handleOpenPreview = () => {
    if (!isFormValid) {
      // フォームが有効でない場合は警告を表示
      alert('すべての必須項目を入力してからプレビューを表示してください。');
      return;
    }
    setShowPreview(true);
  };

  const handleClosePreview = () => {
    setShowPreview(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={handleOpenPreview}
        className={`flex items-center px-4 py-2 text-sm rounded-md ${
          isFormValid
            ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
        }`}
        disabled={!isFormValid}
      >
        <Eye className="w-4 h-4 mr-2" />
        プレビュー
      </button>

      {showPreview && (
        <ProfilePreview data={formData} onClose={handleClosePreview} />
      )}
    </>
  );
};

export default PreviewButton;