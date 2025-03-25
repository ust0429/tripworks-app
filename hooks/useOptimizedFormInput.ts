import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * 最適化されたフォーム入力フック
 * デバウンスと入力値の変更検出を行い、不要な再レンダリングを防止
 * 
 * @param initialValue 初期値
 * @param onChange 値変更時のコールバック
 * @param debounceMs デバウンス時間（ミリ秒）
 * @param validateFn バリデーション関数（オプション）
 */
function useOptimizedFormInput<T = string>(
  initialValue: T,
  onChange: (value: T) => void,
  debounceMs: number = 300,
  validateFn?: (value: T) => string | null
) {
  // 内部状態
  const [localValue, setLocalValue] = useState<T>(initialValue);
  const [error, setError] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [isTouched, setIsTouched] = useState(false);
  const [isDebouncing, setIsDebouncing] = useState(false);
  
  // 最後の値を参照として保持
  const lastValueRef = useRef<T>(initialValue);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // プロップの変更を検出して内部状態を更新
  useEffect(() => {
    if (initialValue !== lastValueRef.current) {
      setLocalValue(initialValue);
      lastValueRef.current = initialValue;
      
      // バリデーションが指定されている場合は実行
      if (validateFn) {
        const validationError = validateFn(initialValue);
        setError(validationError);
      }
    }
  }, [initialValue, validateFn]);
  
  // 入力値の変更ハンドラ
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement> | T) => {
      // イベントか直接値かを判断
      const newValue = e && typeof e === 'object' && 'target' in e 
        ? (e.target as HTMLInputElement).type === 'checkbox'
          ? (e.target as HTMLInputElement).checked as unknown as T
          : (e.target as HTMLInputElement).value as unknown as T
        : e;
      
      // 値が変更された場合のみ処理を実行
      if (newValue !== localValue) {
        setLocalValue(newValue);
        setIsDirty(true);
        setIsDebouncing(true);
        
        // バリデーションが指定されている場合は実行
        if (validateFn) {
          const validationError = validateFn(newValue);
          setError(validationError);
        }
        
        // 前のタイマーをクリア
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
        }
        
        // 新しいタイマーを設定
        debounceTimerRef.current = setTimeout(() => {
          // 値に変更があれば親コンポーネントに通知
          if (newValue !== lastValueRef.current) {
            onChange(newValue);
            lastValueRef.current = newValue;
          }
          setIsDebouncing(false);
        }, debounceMs);
      }
    },
    [localValue, onChange, debounceMs, validateFn]
  );
  
  // フォーカスのハンドラ
  const handleFocus = useCallback(() => {
    setIsTouched(true);
  }, []);
  
  // クリーンアップ
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);
  
  // 値を強制的に更新
  const forceUpdate = useCallback((value: T) => {
    setLocalValue(value);
    lastValueRef.current = value;
    onChange(value);
    setIsDirty(false);
    
    // バリデーションが指定されている場合は実行
    if (validateFn) {
      const validationError = validateFn(value);
      setError(validationError);
    }
  }, [onChange, validateFn]);
  
  return {
    value: localValue,
    error,
    isDirty,
    isTouched,
    isDebouncing,
    handleChange,
    handleFocus,
    forceUpdate,
    reset: () => forceUpdate(initialValue)
  };
}

export default useOptimizedFormInput;