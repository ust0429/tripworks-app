import { useState, useEffect, useCallback, useRef } from 'react';

interface FormStorageOptions<T> {
  key: string;
  initialValue: T;
  throttleMs?: number;
  version?: string;
}

/**
 * フォームの状態をローカルストレージに保存/復元するフック
 * 
 * @param options ストレージオプション（キー、初期値、スロットル時間、バージョン）
 */
function useFormStorage<T>({
  key,
  initialValue,
  throttleMs = 1000,
  version = '1.0'
}: FormStorageOptions<T>) {
  // ストレージキーにバージョンを含める
  const storageKey = `${key}_v${version}`;
  
  // 初期値を取得（ローカルストレージまたは引数）
  const getInitialValue = (): T => {
    try {
      const storedData = localStorage.getItem(storageKey);
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        return parsedData.data as T;
      }
    } catch (error) {
      console.warn(`Error reading form data from localStorage for key ${storageKey}:`, error);
    }
    
    return initialValue;
  };
  
  // 状態の初期化
  const [storedValue, setStoredValue] = useState<T>(getInitialValue());
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedValueRef = useRef<T>(storedValue);
  
  // 値を保存
  const saveValue = useCallback(
    (value: T) => {
      try {
        setIsSaving(true);
        
        // データに日時情報を付加して保存
        const saveData = {
          data: value,
          timestamp: new Date().toISOString(),
          version
        };
        
        localStorage.setItem(storageKey, JSON.stringify(saveData));
        lastSavedValueRef.current = value;
        setLastSavedAt(new Date());
        
        // 分析イベントがあれば送信（実装があれば）
        try {
          const analyticsAny = window as any;
          if (analyticsAny.analytics) {
            analyticsAny.analytics.track('FormDataSaved', {
              formKey: key,
              version
            });
          }
        } catch (analyticsError) {
          console.warn('分析イベント送信エラー:', analyticsError);
        }
      } catch (error) {
        console.error(`Error saving form data to localStorage for key ${storageKey}:`, error);
      } finally {
        setIsSaving(false);
      }
    },
    [key, storageKey, version]
  );
  
  // 値の更新（スロットルあり）
  const updateValue = useCallback(
    (value: T) => {
      setStoredValue(value);
      
      // 値に変更がなければ保存しない
      if (JSON.stringify(value) === JSON.stringify(lastSavedValueRef.current)) {
        return;
      }
      
      // 前のタイマーをクリア
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
      
      // 保存処理をスロットル
      saveTimerRef.current = setTimeout(() => {
        saveValue(value);
      }, throttleMs);
    },
    [saveValue, throttleMs]
  );
  
  // 強制保存（即時）
  const forceSave = useCallback(() => {
    // 前のタイマーをクリア
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
    }
    
    saveValue(storedValue);
  }, [saveValue, storedValue]);
  
  // データを削除
  const clearStorage = useCallback(() => {
    try {
      localStorage.removeItem(storageKey);
      setStoredValue(initialValue);
      lastSavedValueRef.current = initialValue;
      setLastSavedAt(null);
    } catch (error) {
      console.error(`Error clearing form data from localStorage for key ${storageKey}:`, error);
    }
  }, [initialValue, storageKey]);
  
  // ウィンドウイベントの監視（ページ離脱時に保存）
  useEffect(() => {
    const handleBeforeUnload = () => {
      // 保存が予定されているが実行されていない場合は強制保存
      if (saveTimerRef.current) {
        forceSave();
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      
      // コンポーネントのアンマウント時にタイマーをクリア
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, [forceSave]);
  
  // 5秒ごとに自動保存
  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      // 変更があれば保存
      if (JSON.stringify(storedValue) !== JSON.stringify(lastSavedValueRef.current)) {
        forceSave();
      }
    }, 5000);
    
    return () => {
      clearInterval(autoSaveInterval);
    };
  }, [storedValue, forceSave]);
  
  return {
    value: storedValue,
    updateValue,
    forceSave,
    clearStorage,
    lastSavedAt,
    isSaving
  };
}

export default useFormStorage;