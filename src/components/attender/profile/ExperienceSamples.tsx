import React, { useState } from 'react';
import { useAttenderProfile } from '@/contexts/AttenderProfileContext';
import { ExperienceSample } from '@/types/attender/profile';
import { Clock, DollarSign, Edit, Plus, Trash } from 'lucide-react';
import { addExperienceSample, removeExperienceSample, updateExperienceSample } from '@/services/AttenderProfileService';

interface ExperienceSamplesProps {
  experiences: ExperienceSample[];
  isEditable?: boolean;
}

type ExperienceFormData = Omit<ExperienceSample, 'id'>;

const DEFAULT_EXPERIENCE: ExperienceFormData = {
  title: '',
  description: '',
  imageUrl: '',
  duration: '',
  price: 0
};

const ExperienceSamples: React.FC<ExperienceSamplesProps> = ({
  experiences,
  isEditable = false
}) => {
  const { refreshProfile } = useAttenderProfile();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedExperience, setSelectedExperience] = useState<ExperienceSample | null>(null);
  const [formData, setFormData] = useState<ExperienceFormData>(DEFAULT_EXPERIENCE);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // フォームの入力ハンドラ
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'price' ? Number(value) : value
    }));
  };

  // 新規体験追加ダイアログを開く
  const openAddDialog = () => {
    setFormData(DEFAULT_EXPERIENCE);
    setFormError(null);
    setIsAddDialogOpen(true);
  };

  // 編集ダイアログを開く
  const openEditDialog = (experience: ExperienceSample) => {
    setSelectedExperience(experience);
    setFormData({
      title: experience.title,
      description: experience.description,
      imageUrl: experience.imageUrl || '',
      duration: experience.duration,
      price: experience.price || 0
    });
    setFormError(null);
    setIsEditDialogOpen(true);
  };

  // 削除確認ダイアログを開く
  const openDeleteDialog = (experience: ExperienceSample) => {
    setSelectedExperience(experience);
    setIsDeleteDialogOpen(true);
  };

  // 体験追加処理
  const handleAddExperience = async () => {
    if (!formData.title || !formData.description || !formData.duration) {
      setFormError('タイトル、説明、所要時間は必須項目です');
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    try {
      await addExperienceSample('current', formData);
      await refreshProfile();
      setIsAddDialogOpen(false);
      setFormData(DEFAULT_EXPERIENCE);
    } catch (error) {
      console.error('Error adding experience:', error);
      setFormError('体験サンプルの追加中にエラーが発生しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 体験更新処理
  const handleUpdateExperience = async () => {
    if (!selectedExperience) return;
    
    if (!formData.title || !formData.description || !formData.duration) {
      setFormError('タイトル、説明、所要時間は必須項目です');
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    try {
      await updateExperienceSample('current', selectedExperience.id, formData);
      await refreshProfile();
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error('Error updating experience:', error);
      setFormError('体験サンプルの更新中にエラーが発生しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 体験削除処理
  const handleDeleteExperience = async () => {
    if (!selectedExperience) return;

    setIsSubmitting(true);

    try {
      await removeExperienceSample('current', selectedExperience.id);
      await refreshProfile();
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error('Error deleting experience:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ダイアログのモーダル表示
  const renderModal = (isOpen: boolean, onClose: () => void, title: string, content: React.ReactNode) => {
    if (!isOpen) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-4">
          <div className="flex justify-between items-center p-4 border-b">
            <h3 className="text-lg font-semibold">{title}</h3>
            <button 
              className="text-gray-500 hover:text-gray-700"
              onClick={onClose}
              disabled={isSubmitting}
            >
              ✕
            </button>
          </div>
          <div className="p-4">
            {content}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-xl font-semibold">体験サンプル</h2>
        {isEditable && (
          <button 
            className="px-4 py-2 bg-blue-600 rounded-md text-white hover:bg-blue-700 transition-colors flex items-center"
            onClick={openAddDialog}
          >
            <Plus className="h-4 w-4 mr-2" />
            新規体験を追加
          </button>
        )}
      </div>

      {experiences.length === 0 ? (
        <div className="bg-white p-12 rounded-lg shadow-sm border flex flex-col items-center justify-center">
          <p className="text-gray-500 mb-4">まだ体験サンプルはありません</p>
          {isEditable && (
            <button 
              className="px-4 py-2 bg-gray-100 rounded-md text-gray-700 hover:bg-gray-200 transition-colors flex items-center"
              onClick={openAddDialog}
            >
              <Plus className="h-4 w-4 mr-2" />
              体験を追加する
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {experiences.map((experience) => (
            <div key={experience.id} className="bg-white rounded-lg shadow-sm border overflow-hidden">
              {experience.imageUrl && (
                <div className="h-40 overflow-hidden">
                  <img
                    src={experience.imageUrl}
                    alt={experience.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="p-4">
                <h3 className="text-lg font-semibold">{experience.title}</h3>
                <div className="flex items-center text-sm text-gray-500 mt-1">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>{experience.duration}</span>
                  {experience.price !== undefined && (
                    <>
                      <span className="mx-2">•</span>
                      <DollarSign className="h-4 w-4 mr-1" />
                      <span>{experience.price.toLocaleString()}円</span>
                    </>
                  )}
                </div>
                <p className="mt-2 text-gray-600 line-clamp-3">
                  {experience.description}
                </p>
                {isEditable && (
                  <div className="flex justify-end gap-2 mt-4">
                    <button
                      className="px-3 py-1 bg-gray-100 rounded text-gray-700 hover:bg-gray-200 transition-colors flex items-center text-sm"
                      onClick={() => openEditDialog(experience)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      編集
                    </button>
                    <button
                      className="px-3 py-1 bg-red-50 rounded text-red-600 hover:bg-red-100 transition-colors flex items-center text-sm"
                      onClick={() => openDeleteDialog(experience)}
                    >
                      <Trash className="h-4 w-4 mr-1" />
                      削除
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 新規追加ダイアログ */}
      {renderModal(
        isAddDialogOpen, 
        () => setIsAddDialogOpen(false), 
        "新規体験サンプルを追加",
        <div>
          <p className="mb-4 text-sm text-gray-600">
            あなたが提供できる体験の詳細を入力してください。これらは申請時に確認されます。
          </p>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">タイトル *</label>
              <input
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="例: 隠れた名店を巡るフードツアー"
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">説明 *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="体験の詳細を説明してください"
                rows={4}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">所要時間 *</label>
                <input
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  placeholder="例: 2時間"
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">料金（円）</label>
                <input
                  name="price"
                  type="number"
                  value={formData.price || ''}
                  onChange={handleInputChange}
                  placeholder="例: 5000"
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">画像URL（任意）</label>
              <input
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleInputChange}
                placeholder="体験の画像URL"
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            {formError && (
              <p className="text-sm text-red-500">{formError}</p>
            )}
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <button
              className="px-4 py-2 bg-gray-100 rounded-md text-gray-700 hover:bg-gray-200 transition-colors"
              onClick={() => setIsAddDialogOpen(false)}
              disabled={isSubmitting}
            >
              キャンセル
            </button>
            <button 
              className="px-4 py-2 bg-blue-600 rounded-md text-white hover:bg-blue-700 transition-colors"
              onClick={handleAddExperience} 
              disabled={isSubmitting}
            >
              {isSubmitting ? '追加中...' : '追加'}
            </button>
          </div>
        </div>
      )}

      {/* 編集ダイアログ */}
      {renderModal(
        isEditDialogOpen,
        () => setIsEditDialogOpen(false),
        "体験サンプルを編集",
        <div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">タイトル *</label>
              <input
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">説明 *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">所要時間 *</label>
                <input
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">料金（円）</label>
                <input
                  name="price"
                  type="number"
                  value={formData.price || ''}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">画像URL（任意）</label>
              <input
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            {formError && (
              <p className="text-sm text-red-500">{formError}</p>
            )}
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <button
              className="px-4 py-2 bg-gray-100 rounded-md text-gray-700 hover:bg-gray-200 transition-colors"
              onClick={() => setIsEditDialogOpen(false)}
              disabled={isSubmitting}
            >
              キャンセル
            </button>
            <button 
              className="px-4 py-2 bg-blue-600 rounded-md text-white hover:bg-blue-700 transition-colors"
              onClick={handleUpdateExperience} 
              disabled={isSubmitting}
            >
              {isSubmitting ? '更新中...' : '更新'}
            </button>
          </div>
        </div>
      )}

      {/* 削除確認ダイアログ */}
      {renderModal(
        isDeleteDialogOpen,
        () => setIsDeleteDialogOpen(false),
        "体験サンプルを削除",
        <div>
          <p className="mb-2">本当にこの体験サンプルを削除しますか？この操作は元に戻せません。</p>
          {selectedExperience && (
            <div className="p-3 bg-gray-50 rounded-md mb-4">
              <p className="font-medium">{selectedExperience.title}</p>
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                {selectedExperience.description}
              </p>
            </div>
          )}
          <div className="flex justify-end gap-2 mt-6">
            <button
              className="px-4 py-2 bg-gray-100 rounded-md text-gray-700 hover:bg-gray-200 transition-colors"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isSubmitting}
            >
              キャンセル
            </button>
            <button
              className="px-4 py-2 bg-red-600 rounded-md text-white hover:bg-red-700 transition-colors"
              onClick={handleDeleteExperience}
              disabled={isSubmitting}
            >
              {isSubmitting ? '削除中...' : '削除'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExperienceSamples;
