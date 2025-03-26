import React, { useState, useEffect } from 'react';
import { AttenderApplicationData } from '../../../types/attender';
import { Save, CheckCircle, AlertCircle, WifiOff, RotateCw, Home } from 'lucide-react';
import { isOnline } from '../../../utils/networkUtils';
import { navigateToHome } from '../../../utils/navigation';

interface DraftSaverProps {
  formData: Partial<AttenderApplicationData>;
  onSave: () => Promise<void>;
  withHomeButton?: boolean;
}

/**
 * 下書き保存コンポーネント
 * 定期的な自動保存と手動保存の両方をサポート
 */
const DraftSaver: React.FC<DraftSaverProps> = ({ formData, onSave, withHomeButton = true }) => {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveCount, setSaveCount] = useState(0);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(!isOnline());

  // ネットワーク状態の監視
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // 自動保存（60秒ごと）
  useEffect(() => {
    const timer = setInterval(() => {
      handleAutoSave();
    }, 60000); // 60秒ごと

    return () => clearInterval(timer);
  }, [formData]);

  // 手動保存ハンドラ
  const handleManualSave = async (goToHome: boolean = false) => {
    try {
      setIsSaving(true);
      setSaveError(null);
      
      await onSave();
      
      setLastSaved(new Date());
      setSaveSuccess(true);
      setSaveCount(prev => prev + 1);
      
      // 成功メッセージを3秒後に消す
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
      
      // ホームに移動する場合
      if (goToHome) {
        navigateToHome();
      }
    } catch (error) {
      console.error('下書き保存エラー:', error);
      setSaveError('保存に失敗しました。ネットワーク接続を確認してください。');
    } finally {
      setIsSaving(false);
    }
  };

  // 自動保存ハンドラ
  const handleAutoSave = async () => {
    // オフライン時は自動保存をスキップ
    if (isOffline || isSaving) return;
    
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

  // リトライハンドラ
  const handleRetry = () => {
    setSaveError(null);
    handleManualSave();
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
        
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => handleManualSave(false)}
            disabled={isSaving}
            className={`flex items-center px-3 py-1 rounded-md text-sm ${
              saveSuccess
                ? 'bg-green-100 text-green-700'
                : saveError
                  ? 'bg-red-100 text-red-700'
                  : isOffline
                    ? 'bg-amber-100 text-amber-700'
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
            ) : saveError ? (
              <>
                <AlertCircle className="w-4 h-4 mr-1" />
                保存失敗
              </>
            ) : isOffline ? (
              <>
                <WifiOff className="w-4 h-4 mr-1" />
                オフライン
              </>
            ) : isSaving ? (
              <>
                <Save className="w-4 h-4 mr-1 animate-pulse" />
                保存中...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-1" />
                保存
              </>
            )}
          </button>
          
          {withHomeButton && (
            <button
              type="button"
              onClick={() => handleManualSave(true)}
              disabled={isSaving}
              className={`flex items-center px-3 py-1 rounded-md text-sm ${
                isSaving
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-green-100 text-green-700 hover:bg-green-200'
              }`}
            >
              <Home className="w-4 h-4 mr-1" />
              保存してホームへ
            </button>
          )}
          
          {/* リトライボタン（エラー時のみ表示） */}
          {saveError && (
            <button
              type="button"
              onClick={handleRetry}
              className="flex items-center px-2 py-1 rounded-md text-sm bg-blue-100 text-blue-700 hover:bg-blue-200"
            >
              <RotateCw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
      
      {/* 説明とステータス */}
      <div className="mt-2">
        {saveError ? (
          <p className="text-xs text-red-600">
            {saveError}
          </p>
        ) : isOffline ? (
          <p className="text-xs text-amber-600">
            オフライン状態です。データはローカルに保存され、オンラインに復帰したときに送信されます。
          </p>
        ) : (
          <p className="text-xs text-gray-500">
            1分ごとに自動保存されますが、いつでも手動で保存できます。
          </p>
        )}
      </div>
    </div>
  );
};

export default DraftSaver;