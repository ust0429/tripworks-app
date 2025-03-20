/**
 * アテンダー申請フォームのコンテキスト
 * 
 * マルチステップのアテンダー申請フォームの状態を管理
 */
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { 
  AttenderApplicationData, 
  ExpertiseArea, 
  AvailabilityTimeSlot,
  SocialMediaLinks,
  ExperienceSample,
  Reference,
  AdditionalDocument,
  IdentificationDocument
} from '../types/attender/index';
import { submitAttenderApplication } from '../services/AttenderService';

// コンテキストの型定義
interface AttenderApplicationContextType {
  formData: Partial<AttenderApplicationData>;
  currentStep: number;
  isSubmitting: boolean;
  errors: Record<string, string>;
  maxSteps: number;
  
  // フォームの値を更新する関数
  updateFormData: (data: Partial<AttenderApplicationData>) => void;
  
  // 専門分野を追加・更新・削除する関数
  addExpertise: (expertise: ExpertiseArea) => void;
  updateExpertise: (index: number, expertise: ExpertiseArea) => void;
  removeExpertise: (index: number) => void;
  
  // 利用可能時間を更新する関数
  updateAvailabilityTimes: (availableTimes: AvailabilityTimeSlot[]) => void;
  
  // 体験サンプルを追加・更新・削除する関数
  addExperienceSample: (sample: ExperienceSample) => void;
  updateExperienceSample: (index: number, sample: ExperienceSample) => void;
  removeExperienceSample: (index: number) => void;
  
  // SNSリンクを更新する関数
  updateSocialMediaLinks: (links: Partial<SocialMediaLinks>) => void;
  
  // 推薦者を追加・更新・削除する関数
  addReference: (reference: Reference) => void;
  updateReference: (index: number, reference: Reference) => void;
  removeReference: (index: number) => void;
  
  // 追加書類を追加・削除する関数
  addDocument: (document: AdditionalDocument) => void;
  removeDocument: (index: number) => void;
  
  // 次のステップへ進む
  nextStep: () => void;
  
  // 前のステップへ戻る
  prevStep: () => void;
  
  // 特定のステップへ移動
  goToStep: (step: number) => void;
  
  // フォームの送信
  submitForm: () => Promise<string>;
  
  // エラーを設定
  setError: (field: string, message: string) => void;
  
  // フィールドのエラーをクリア
  clearError: (field: string) => void;
  
  // 全てのエラーをクリア
  clearAllErrors: () => void;
  
  // ステップが完了しているか確認
  isStepCompleted: (step: number) => boolean;
}

// 初期値の設定
const initialFormData: Partial<AttenderApplicationData> = {
  specialties: [],
  languages: [],
  expertise: [],
  availableTimes: [],
  experienceSamples: [],
  isLocalResident: false, // 初期値を設定してタイプエラーを防止
  isMigrant: false, // 初期値を設定してタイプエラーを防止
  agreements: {
    termsOfService: false,
    privacyPolicy: false,
    codeOfConduct: false,
    backgroundCheck: false
  }
};

// コンテキストの作成
const AttenderApplicationContext = createContext<AttenderApplicationContextType | undefined>(undefined);

// コンテキストプロバイダーコンポーネント
export const AttenderApplicationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [formData, setFormData] = useState<Partial<AttenderApplicationData>>(initialFormData);
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // 全ステップ数
  const maxSteps = 6;
  
  // フォームデータの更新
  const updateFormData = (data: Partial<AttenderApplicationData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };
  
  // 専門分野の追加
  const addExpertise = (expertise: ExpertiseArea) => {
    setFormData(prev => ({
      ...prev,
      expertise: [...(prev.expertise || []), expertise]
    }));
  };
  
  // 専門分野の更新
  const updateExpertise = (index: number, expertise: ExpertiseArea) => {
    setFormData(prev => {
      const newExpertise = [...(prev.expertise || [])];
      newExpertise[index] = expertise;
      return { ...prev, expertise: newExpertise };
    });
  };
  
  // 専門分野の削除
  const removeExpertise = (index: number) => {
    setFormData(prev => {
      const newExpertise = [...(prev.expertise || [])];
      newExpertise.splice(index, 1);
      return { ...prev, expertise: newExpertise };
    });
  };
  
  // 利用可能時間の更新
  const updateAvailabilityTimes = (availableTimes: AvailabilityTimeSlot[]) => {
    setFormData(prev => ({ ...prev, availableTimes }));
  };
  
  // 体験サンプルの追加
  const addExperienceSample = (sample: ExperienceSample) => {
    setFormData(prev => ({
      ...prev,
      experienceSamples: [...(prev.experienceSamples || []), sample]
    }));
  };
  
  // 体験サンプルの更新
  const updateExperienceSample = (index: number, sample: ExperienceSample) => {
    setFormData(prev => {
      const newSamples = [...(prev.experienceSamples || [])];
      newSamples[index] = sample;
      return { ...prev, experienceSamples: newSamples };
    });
  };
  
  // 体験サンプルの削除
  const removeExperienceSample = (index: number) => {
    setFormData(prev => {
      const newSamples = [...(prev.experienceSamples || [])];
      newSamples.splice(index, 1);
      return { ...prev, experienceSamples: newSamples };
    });
  };
  
  // SNSリンクの更新
  const updateSocialMediaLinks = (links: Partial<SocialMediaLinks>) => {
    setFormData(prev => ({
      ...prev,
      socialMediaLinks: { ...(prev.socialMediaLinks || {}), ...links }
    }));
  };
  
  // 推薦者の追加
  const addReference = (reference: Reference) => {
    setFormData(prev => ({
      ...prev,
      references: [...(prev.references || []), reference]
    }));
  };
  
  // 推薦者の更新
  const updateReference = (index: number, reference: Reference) => {
    setFormData(prev => {
      const newReferences = [...(prev.references || [])];
      newReferences[index] = reference;
      return { ...prev, references: newReferences };
    });
  };
  
  // 推薦者の削除
  const removeReference = (index: number) => {
    setFormData(prev => {
      const newReferences = [...(prev.references || [])];
      newReferences.splice(index, 1);
      return { ...prev, references: newReferences };
    });
  };
  
  // 追加書類の追加
  const addDocument = (document: AdditionalDocument) => {
    setFormData(prev => ({
      ...prev,
      additionalDocuments: [...(prev.additionalDocuments || []), document]
    }));
  };
  
  // 追加書類の削除
  const removeDocument = (index: number) => {
    setFormData(prev => {
      const newDocuments = [...(prev.additionalDocuments || [])];
      newDocuments.splice(index, 1);
      return { ...prev, additionalDocuments: newDocuments };
    });
  };
  
  // 次のステップへ進む
  const nextStep = () => {
    if (currentStep < maxSteps) {
      setCurrentStep(currentStep + 1);
    }
  };
  
  // 前のステップへ戻る
  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  // 特定のステップへ移動
  const goToStep = (step: number) => {
    if (step >= 1 && step <= maxSteps) {
      setCurrentStep(step);
    }
  };
  
  // フォームの送信
  const submitForm = async (): Promise<string> => {
    setIsSubmitting(true);
    clearAllErrors(); // 前回のエラーをクリア
    
    try {
      // バリデーション
      const validationErrors = validateForm(formData);
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        setIsSubmitting(false);
        throw new Error('入力内容に誤りがあります。各フィールドを確認してください。');
      }
      
      // フォームが完全なデータを持っていることを検証
      if (!isFullyValidApplicationData(formData)) {
        setError('form', '申請データが不完全です。すべての必須項目を入力してください。');
        setIsSubmitting(false);
        throw new Error('申請データが不完全です。すべての必須項目を入力してください。');
      }
      
      console.info('アテンダー申請の送信を開始します...');
      
      // API呼び出し前の最終確認
      try {
        verifyIdentificationDocument(formData.identificationDocument);
        verifyExperienceSamples(formData.experienceSamples || []);
        verifyAgreements(formData.agreements);
      } catch (validationError) {
        setError('formValidation', validationError instanceof Error ? validationError.message : '検証エラー');
        setIsSubmitting(false);
        throw validationError;
      }
      
      // 必須フィールドがisMigrantとisLocalResidentが確実にboolean型になるように設定
      const completeFormData: AttenderApplicationData = {
        ...formData as Partial<AttenderApplicationData>,
        // 以下のフィールドは必須なので存在しない場合はエラーになるはず
        name: formData.name!,
        email: formData.email!,
        phoneNumber: formData.phoneNumber!,
        location: formData.location!,
        biography: formData.biography!,
        specialties: formData.specialties || [],
        languages: formData.languages || [],
        isLocalResident: formData.isLocalResident === true,  // undefinedの場合はfalseに設定
        isMigrant: formData.isMigrant === true,  // undefinedの場合はfalseに設定
        expertise: formData.expertise || [],
        experienceSamples: formData.experienceSamples || [],
        availableTimes: formData.availableTimes || [],
        identificationDocument: formData.identificationDocument!,
        agreements: formData.agreements!,
      };
      
      // APIを呼び出してフォームを送信
      const applicationId = await submitAttenderApplication(completeFormData);
      console.info(`アテンダー申請が正常に送信されました。申請ID: ${applicationId}`);
      setIsSubmitting(false);
      return applicationId;
    } catch (error) {
      console.error('アテンダー申請の送信中にエラーが発生しました:', error);
      setIsSubmitting(false);
      
      // エラーメッセージの抽出
      const errorMessage = error instanceof Error
        ? error.message
        : '申請の送信中に予期せぬエラーが発生しました';
      
      // API通信エラーの場合は特別なエラーメッセージを設定
      if (errorMessage.includes('NETWORK_ERROR') || errorMessage.includes('TIMEOUT')) {
        setError('apiConnection', 'サーバーとの通信に失敗しました。インターネット接続を確認してください。');
      } else {
        setError('submission', errorMessage);
      }
      
      throw error;
    }
  };
  
  // フォームデータが完全かどうかをチェック
  const isFullyValidApplicationData = (data: Partial<AttenderApplicationData>): data is AttenderApplicationData => {
    // すべての必須フィールドが存在するかチェック
    return !!(
      data.name &&
      data.email &&
      data.phoneNumber &&
      data.location &&
      data.biography &&
      data.specialties &&
      data.languages &&
      data.expertise &&
      data.availableTimes &&
      data.experienceSamples &&
      data.identificationDocument &&
      data.agreements
    );
  };
  
  // エラーを設定
  const setError = (field: string, message: string) => {
    setErrors(prev => ({ ...prev, [field]: message }));
  };
  
  // フィールドのエラーをクリア
  const clearError = (field: string) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  };
  
  // 全てのエラーをクリア
  const clearAllErrors = () => {
    setErrors({});
  };
  
  // ステップが完了しているか確認
  const isStepCompleted = (step: number): boolean => {
    switch (step) {
      case 1: // 基本情報
        return !!(
          formData.name && 
          formData.email && 
          formData.phoneNumber && 
          formData.location && 
          formData.biography && 
          formData.isLocalResident !== undefined
        );
      case 2: // 専門分野と言語
        return !!(
          formData.specialties && 
          formData.specialties.length > 0 && 
          formData.languages && 
          formData.languages.length > 0 && 
          formData.expertise && 
          formData.expertise.length > 0
        );
      case 3: // 体験サンプル
        return !!(
          formData.experienceSamples && 
          formData.experienceSamples.length > 0
        );
      case 4: // 利用可能時間
        return !!(
          formData.availableTimes && 
          formData.availableTimes.length > 0
        );
      case 5: // 身分証明と追加情報
        return !!(
          formData.identificationDocument
        );
      case 6: // 同意事項
        return !!(
          formData.agreements &&
          formData.agreements.termsOfService && 
          formData.agreements.privacyPolicy && 
          formData.agreements.codeOfConduct && 
          formData.agreements.backgroundCheck
        );
      default:
        return false;
    }
  };
  
    // 身分証明書の検証
  const verifyIdentificationDocument = (idDoc?: IdentificationDocument): void => {
    if (!idDoc) {
      throw new Error('身分証明書情報が提供されていません');
    }
    
    // 有効期限のチェック
    if (idDoc.expirationDate) {
      const expirationDate = new Date(idDoc.expirationDate);
      const today = new Date();
      
      if (isNaN(expirationDate.getTime())) {
        throw new Error('身分証明書の有効期限が無効な形式です');
      }
      
      if (expirationDate < today) {
        throw new Error('身分証明書の有効期限が切れています');
      }
    }
    
    // 画像チェック
    if (!idDoc.frontImageUrl) {
      throw new Error('身分証明書の表面画像がありません');
    }
    
    // 画像のURL形式チェック
    if (!isValidImageUrl(idDoc.frontImageUrl)) {
      throw new Error('身分証明書の表面画像のURL形式が無効です');
    }
    
    if (idDoc.backImageUrl && !isValidImageUrl(idDoc.backImageUrl)) {
      throw new Error('身分証明書の裏面画像のURL形式が無効です');
    }
  };
  
  // 画像のURLが有効かチェック
  const isValidImageUrl = (url: string): boolean => {
    // アップロードされた画像は一時パスが付与されるので、無効なURLを除外
    return (
      url.startsWith('http://') ||
      url.startsWith('https://') ||
      url.startsWith('/uploads/') ||
      url.startsWith('data:image/')
    );
  };
  
  // 体験サンプルの検証
  const verifyExperienceSamples = (samples: ExperienceSample[]): void => {
    if (samples.length === 0) {
      throw new Error('少なくとも1つの体験サンプルが必要です');
    }
    
    samples.forEach((sample, index) => {
      // 必須フィールドのチェック
      if (!sample.title) throw new Error(`体験サンプル${index + 1}: タイトルが必要です`);
      if (!sample.description) throw new Error(`体験サンプル${index + 1}: 説明が必要です`);
      if (sample.description.length < 50) {
        throw new Error(`体験サンプル${index + 1}: 説明は50文字以上必要です`);
      }
      
      // 価格チェック
      if (sample.pricePerPerson < 0) {
        throw new Error(`体験サンプル${index + 1}: 価格は0以上にしてください`);
      }
      
      // 所要時間のチェック
      if (!sample.estimatedDuration || sample.estimatedDuration <= 0) {
        throw new Error(`体験サンプル${index + 1}: 有効な所要時間を設定してください`);
      }
      
      // 画像のチェック（sampleImagesはimageUrlsに変更）
      if (sample.imageUrls && sample.imageUrls.length > 0) {
        sample.imageUrls.forEach((imageUrl: string, imgIndex: number) => {
          if (!isValidImageUrl(imageUrl)) {
            throw new Error(`体験サンプル${index + 1}: 画像${imgIndex + 1}のURL形式が無効です`);
          }
        });
      }
    });
  };
  
  // 同意事項の検証
  const verifyAgreements = (agreements?: { termsOfService: boolean; privacyPolicy: boolean; codeOfConduct: boolean; backgroundCheck: boolean }): void => {
    if (!agreements) {
      throw new Error('全ての同意事項に同意する必要があります');
    }
    
    if (!agreements.termsOfService) {
      throw new Error('利用規約に同意する必要があります');
    }
    
    if (!agreements.privacyPolicy) {
      throw new Error('プライバシーポリシーに同意する必要があります');
    }
    
    if (!agreements.codeOfConduct) {
      throw new Error('行動規範に同意する必要があります');
    }
    
    if (!agreements.backgroundCheck) {
      throw new Error('バックグラウンドチェックに同意する必要があります');
    }
  };
  
  // フォームのバリデーション
  const validateForm = (data: Partial<AttenderApplicationData>): Record<string, string> => {
    const validationErrors: Record<string, string> = {};
    
    // ステップ1: 基本情報
    if (!data.name) validationErrors.name = '名前は必須です';
    if (!data.email) validationErrors.email = 'メールアドレスは必須です';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      validationErrors.email = '有効なメールアドレスを入力してください';
    }
    if (!data.phoneNumber) validationErrors.phoneNumber = '電話番号は必須です';
    if (!data.location?.country) validationErrors['location.country'] = '国は必須です';
    if (!data.location?.region) validationErrors['location.region'] = '地域は必須です';
    if (!data.location?.city) validationErrors['location.city'] = '都市は必須です';
    if (!data.biography) validationErrors.biography = '自己紹介文は必須です';
    else if (data.biography.length < 50) {
      validationErrors.biography = '自己紹介文は少なくとも50文字必要です';
    }
    if (data.isLocalResident === undefined) validationErrors.isLocalResident = '地元住民かどうかを選択してください';
    
    // 移住者の場合の追加チェック
    if (data.isMigrant && !data.previousLocation) {
      validationErrors.previousLocation = '以前の居住地は必須です';
    }
    if (data.isMigrant && (!data.yearsMoved || data.yearsMoved <= 0)) {
      validationErrors.yearsMoved = '移住してからの年数を入力してください';
    }
    
    // ステップ2: 専門分野と言語
    if (!data.specialties || data.specialties.length === 0) {
      validationErrors.specialties = '少なくとも1つの専門分野を選択してください';
    }
    if (!data.languages || data.languages.length === 0) {
      validationErrors.languages = '少なくとも1つの言語を選択してください';
    }
    if (!data.expertise || data.expertise.length === 0) {
      validationErrors.expertise = '少なくとも1つの専門知識を追加してください';
    } else {
      data.expertise.forEach((expertise, index) => {
        if (!expertise.category) {
          validationErrors[`expertise[${index}].category`] = 'カテゴリは必須です';
        }
        if (!expertise.subcategories || expertise.subcategories.length === 0) {
          validationErrors[`expertise[${index}].subcategories`] = '少なくとも1つのサブカテゴリを選択してください';
        }
        if (expertise.yearsOfExperience === undefined || expertise.yearsOfExperience < 0) {
          validationErrors[`expertise[${index}].yearsOfExperience`] = '有効な経験年数を入力してください';
        }
        if (!expertise.description) {
          validationErrors[`expertise[${index}].description`] = '説明は必須です';
        }
      });
    }
    
    // ステップ3: 体験サンプル
    if (!data.experienceSamples || data.experienceSamples.length === 0) {
      validationErrors.experienceSamples = '少なくとも1つの体験サンプルを追加してください';
    } else {
      data.experienceSamples.forEach((sample, index) => {
        if (!sample.title) {
          validationErrors[`experienceSamples[${index}].title`] = 'タイトルは必須です';
        }
        if (!sample.description) {
          validationErrors[`experienceSamples[${index}].description`] = '説明は必須です';
        }
        if (!sample.category) {
          validationErrors[`experienceSamples[${index}].category`] = 'カテゴリは必須です';
        }
        if (!sample.estimatedDuration || sample.estimatedDuration <= 0) {
          validationErrors[`experienceSamples[${index}].estimatedDuration`] = '有効な予想所要時間を入力してください';
        }
        if (!sample.maxParticipants || sample.maxParticipants <= 0) {
          validationErrors[`experienceSamples[${index}].maxParticipants`] = '有効な最大参加者数を入力してください';
        }
        if (sample.pricePerPerson === undefined || sample.pricePerPerson < 0) {
          validationErrors[`experienceSamples[${index}].pricePerPerson`] = '有効な価格を入力してください';
        }
      });
    }
    
    // ステップ4: 利用可能時間
    if (!data.availableTimes || data.availableTimes.length === 0) {
      validationErrors.availableTimes = '少なくとも1つの利用可能時間を設定してください';
    } else {
      const hasAvailable = data.availableTimes.some(time => time.isAvailable);
      if (!hasAvailable) {
        validationErrors.availableTimes = '少なくとも1つの利用可能時間を設定してください';
      }
    }
    
    // ステップ5: 身分証明
    if (!data.identificationDocument) {
      validationErrors.identificationDocument = '身分証明書情報は必須です';
    } else {
      if (!data.identificationDocument.type) {
        validationErrors['identificationDocument.type'] = '身分証明書の種類を選択してください';
      }
      if (!data.identificationDocument.number) {
        validationErrors['identificationDocument.number'] = '身分証明書番号は必須です';
      }
      if (!data.identificationDocument.expirationDate) {
        validationErrors['identificationDocument.expirationDate'] = '有効期限は必須です';
      }
      if (!data.identificationDocument.frontImageUrl) {
        validationErrors['identificationDocument.frontImageUrl'] = '身分証明書の表面画像は必須です';
      }
    }
    
    // ステップ6: 同意事項
    if (!data.agreements) {
      validationErrors.agreements = 'すべての同意事項を承諾する必要があります';
    } else {
      if (!data.agreements.termsOfService) {
        validationErrors['agreements.termsOfService'] = '利用規約への同意が必要です';
      }
      if (!data.agreements.privacyPolicy) {
        validationErrors['agreements.privacyPolicy'] = 'プライバシーポリシーへの同意が必要です';
      }
      if (!data.agreements.codeOfConduct) {
        validationErrors['agreements.codeOfConduct'] = '行動規範への同意が必要です';
      }
      if (!data.agreements.backgroundCheck) {
        validationErrors['agreements.backgroundCheck'] = 'バックグラウンドチェックへの同意が必要です';
      }
    }
    
    return validationErrors;
  };
  
  // コンテキスト値の作成
  const contextValue: AttenderApplicationContextType = {
    formData,
    currentStep,
    isSubmitting,
    errors,
    maxSteps,
    updateFormData,
    addExpertise,
    updateExpertise,
    removeExpertise,
    updateAvailabilityTimes,
    addExperienceSample,
    updateExperienceSample,
    removeExperienceSample,
    updateSocialMediaLinks,
    addReference,
    updateReference,
    removeReference,
    addDocument,
    removeDocument,
    nextStep,
    prevStep,
    goToStep,
    submitForm,
    setError,
    clearError,
    clearAllErrors,
    isStepCompleted
  };
  
  return (
    <AttenderApplicationContext.Provider value={contextValue}>
      {children}
    </AttenderApplicationContext.Provider>
  );
};

// カスタムフック
export const useAttenderApplication = (): AttenderApplicationContextType => {
  const context = useContext(AttenderApplicationContext);
  if (context === undefined) {
    throw new Error('useAttenderApplication must be used within a AttenderApplicationProvider');
  }
  return context;
};

export default AttenderApplicationContext;
