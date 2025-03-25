import React, { useState, useEffect } from 'react';
import { AttenderApplicationData } from '../../../types/attender';
import { Save, CheckCircle } from 'lucide-react';

interface DraftSaverProps {
  formData: Partial<AttenderApplicationData>;
  onSave: () => Promise<void>;
}

/**
 * 下書き保存コンポーネント
 * 定期的な自動保存と手動保存の両方をサポート
 */
const DraftSaver: React.FC<DraftSaverProps> = ({ formData, onSave }) => {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveCount, setSaveCount] = useState(0);

  // 自動保存（60秒ごと）
  useEffect(() => {
    const timer = setInterval(() => {
      handleAutoSave();
    }, 60000); // 60秒ごと

    return () => clearInterval(timer);
  }, [formData]);

  // 手動保存ハンドラ
  const handleManualSave = async () => {
    try {
      setIsSaving(true);
      await onSave();
      setLastSaved(new Date());
      setSaveSuccess(true);
      setSaveCount(prev => prev + 1);
      
      // 成功メッセージを3秒後に消す
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('下書き保存エラー:', error);
      alert('下書きの保存中にエラーが発生しました。');
    } finally {
      setIsSaving(false);
    }
  };

  // 自動保存ハンドラ
  const handleAutoSave = async () => {
    try {
      // フォームデータが空の場合は保存しない
      if (Object.keys(formData).length === 0) return;
      
      setIsSaving(true);
      await onSave();
      setLastSaved(new Date());
      setSaveCount(prev => prev + 1);
    } catch (error) {
      console.error('自動保存エラー:', error);
      // 自動保存のエラーは通知しない
    } finally {
      setIsSaving(false);
    }
  };

  // フォーマット済みの最終保存時間
  const formattedLastSaved = lastSaved 
    ? `${lastSaved.toLocaleDateString('ja-JP')} ${lastSaved.toLocaleTimeString('ja-JP')}`
    : '保存なし';

  return (
    <div className="bg-white rounded-md p-3 border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium">下書き保存</h3>
          <p className="text-xs text-gray-500">
            最終保存: {formattedLastSaved}
            {saveCount > 0 && ` (計${saveCount}回)`}
          </p>
        </div>
        
        <button
          type="button"
          onClick={handleManualSave}
          disabled={isSaving}
          className={`flex items-center px-3 py-1 rounded-md text-sm ${
            saveSuccess
              ? 'bg-green-100 text-green-700'
              : isSaving
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
          }`}
        >
          {saveSuccess ? (
            <>
              <CheckCircle className="w-4 h-4 mr-1" />
              保存完了
            </>
          ) : isSaving ? (
            <>
              <Save className="w-4 h-4 mr-1 animate-pulse" />
              保存中...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-1" />
              今すぐ保存
            </>
          )}
        </button>
      </div>
      
      <div className="mt-2">
        <p className="text-xs text-gray-500">
          1分ごとに自動保存されますが、いつでも手動で保存できます。
        </p>
      </div>
    </div>
  );
};

export default DraftSaver;