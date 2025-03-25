import { useState, useCallback, useRef, useEffect } from 'react';

type FormFields<T> = Record<string, any>;
type FormErrors<T> = Partial<Record<keyof T, string>>;
type ValidationFunction<T> = (values: T) => FormErrors<T>;
type FieldChangeHandler = (
  e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
) => void;

interface UseOptimizedFormResult<T extends FormFields<T>> {
  values: T;
  errors: FormErrors<T>;
  touched: Partial<Record<keyof T, boolean>>;
  isSubmitting: boolean;
  handleChange: FieldChangeHandler;
  handleBlur: FieldChangeHandler;
  setFieldValue: (field: keyof T, value: any) => void;
  setFieldTouched: (field: keyof T, isTouched?: boolean) => void;
  setValues: (values: Partial<T>) => void;
  resetForm: () => void;
  validateForm: () => FormErrors<T>;
  submitForm: (onSubmit: (values: T) => Promise<void> | void) => Promise<void>;
  isDirty: boolean;
}

/**
 * 最適化されたフォーム処理フック
 * 複数のフィールドを持つフォームを効率的に管理
 * 
 * @param initialValues フォームの初期値
 * @param validate バリデーション関数
 * @param debounceMs デバウンス時間（ミリ秒）
 */
function useOptimizedForm<T extends FormFields<T>>(
  initialValues: T,
  validate?: ValidationFunction<T>,
  debounceMs: number = 300
): UseOptimizedFormResult<T> {
  // フォームの状態
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<FormErrors<T>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  
  // refs
  const initialValuesRef = useRef<T>(initialValues);
  const debounceTimerRef = useRef<Record<string, NodeJS.Timeout>>({});
  
  // 初期値が変更された場合に状態を更新
  useEffect(() => {
    initialValuesRef.current = initialValues;
    setValues(initialValues);
  }, [initialValues]);
  
  // フィールド値の更新（デバウンスあり）
  const setFieldValueDebounced = useCallback(
    (field: keyof T, value: any) => {
      setValues(prevValues => {
        // 値に変更がなければ更新しない
        if (prevValues[field] === value) {
          return prevValues;
        }
        
        setIsDirty(true);
        
        // 新しい値でフォームを更新
        const newValues = { ...prevValues, [field]: value };
        
        // 既存のタイマーをクリア
        if (debounceTimerRef.current[field as string]) {
          clearTimeout(debounceTimerRef.current[field as string]);
        }
        
        // バリデーション処理をデバウンス
        debounceTimerRef.current[field as string] = setTimeout(() => {
          if (validate) {
            const fieldErrors = validate(newValues);
            setErrors(prev => ({ ...prev, ...fieldErrors }));
          }
        }, debounceMs);
        
        return newValues;
      });
    },
    [validate, debounceMs]
  );
  
  // フィールドのタッチ状態を更新
  const setFieldTouched = useCallback((field: keyof T, isTouched: boolean = true) => {
    setTouched(prevTouched => {
      if (prevTouched[field] === isTouched) {
        return prevTouched;
      }
      return { ...prevTouched, [field]: isTouched };
    });
  }, []);
  
  // 変更ハンドラ
  const handleChange = useCallback<FieldChangeHandler>(
    (e) => {
      const { name, value, type, checked } = e.target as HTMLInputElement;
      const fieldValue = type === 'checkbox' ? checked : value;
      setFieldValueDebounced(name as keyof T, fieldValue);
    },
    [setFieldValueDebounced]
  );
  
  // ブラーハンドラ
  const handleBlur = useCallback<FieldChangeHandler>(
    (e) => {
      const { name } = e.target;
      setFieldTouched(name as keyof T, true);
    },
    [setFieldTouched]
  );
  
  // フォーム全体のバリデーション
  const validateForm = useCallback((): FormErrors<T> => {
    if (!validate) return {};
    
    const validationErrors = validate(values);
    setErrors(validationErrors);
    return validationErrors;
  }, [validate, values]);
  
  // フォームのリセット
  const resetForm = useCallback(() => {
    setValues(initialValuesRef.current);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
    setIsDirty(false);
    
    // デバウンスタイマーをクリア
    Object.values(debounceTimerRef.current).forEach(timer => {
      clearTimeout(timer);
    });
    debounceTimerRef.current = {};
  }, []);
  
  // フォームの送信
  const submitForm = useCallback(
    async (onSubmit: (values: T) => Promise<void> | void) => {
      setIsSubmitting(true);
      
      try {
        // 全てのフィールドをタッチ済みにする
        const allTouched = Object.keys(values).reduce(
          (acc, key) => ({ ...acc, [key]: true }),
          {} as Record<keyof T, boolean>
        );
        setTouched(allTouched);
        
        // バリデーション
        const formErrors = validateForm();
        
        // エラーがあれば送信しない
        if (Object.keys(formErrors).length > 0) {
          setIsSubmitting(false);
          return;
        }
        
        // 送信処理
        await onSubmit(values);
        setIsDirty(false);
      } catch (error) {
        console.error('Form submission error:', error);
        // エラーを表示する処理などをここに追加
      } finally {
        setIsSubmitting(false);
      }
    },
    [values, validateForm]
  );
  
  // フィールド値を直接設定
  const setFieldValue = useCallback(
    (field: keyof T, value: any) => {
      setFieldValueDebounced(field, value);
    },
    [setFieldValueDebounced]
  );
  
  // 複数のフィールド値を一度に設定
  const setBatchValues = useCallback(
    (newValues: Partial<T>) => {
      setValues(prevValues => {
        const updatedValues = { ...prevValues, ...newValues };
        
        // 値が実際に変更されたかチェック
        let hasChanged = false;
        for (const key in newValues) {
          if (prevValues[key] !== newValues[key]) {
            hasChanged = true;
            break;
          }
        }
        
        if (!hasChanged) {
          return prevValues;
        }
        
        setIsDirty(true);
        
        // バリデーション
        if (validate) {
          // デバウンスタイマーをクリア
          Object.values(debounceTimerRef.current).forEach(timer => {
            clearTimeout(timer);
          });
          
          // 全体のバリデーションを1回だけ実行
          const batchTimer = setTimeout(() => {
            const fieldErrors = validate(updatedValues);
            setErrors(prev => ({ ...prev, ...fieldErrors }));
          }, debounceMs);
          
          debounceTimerRef.current['__batch__'] = batchTimer;
        }
        
        return updatedValues;
      });
    },
    [validate, debounceMs]
  );
  
  // クリーンアップ
  useEffect(() => {
    return () => {
      // コンポーネントのアンマウント時にタイマーをクリア
      Object.values(debounceTimerRef.current).forEach(timer => {
        clearTimeout(timer);
      });
    };
  }, []);
  
  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    setFieldValue,
    setFieldTouched,
    setValues: setBatchValues,
    resetForm,
    validateForm,
    submitForm,
    isDirty
  };
}

export default useOptimizedForm;