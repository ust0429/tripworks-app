# アテンダー段階的登録機能 実装計画

## 概要

アテンダー募集バナーと情報ページの実装に続き、アテンダー登録プロセスにおける重要な改善として「段階的登録機能」を実装します。この機能により、ユーザーはより少ない情報入力から始めることができ、登録の障壁を下げることができます。

## 背景と目的

現在のアテンダー申請フォームは、一度に多くの情報（基本情報、専門分野、体験サンプル、利用可能時間、身分証明、同意事項）の入力を求めています。これにより以下の課題が発生しています：

1. **高い離脱率** - 長いフォームに直面し、途中で離脱するユーザーが多い
2. **情報入力の負担** - 一度にすべての情報を準備する必要がある
3. **決断の遅延** - 「すべてを準備してから」という考えで申請を先延ばしにする

段階的登録機能では、登録プロセスを以下の2つのフェーズに分割します：

1. **必須情報フェーズ** - 最小限の情報（基本情報、身分証明、同意事項）のみで基本登録を完了
2. **任意情報フェーズ** - 後日、追加情報（専門分野、体験サンプル、利用可能時間）を入力

## 実装の主要コンポーネント

### 1. AttenderApplicationContext の拡張

```typescript
// contexts/AttenderApplicationContext.tsx
export type FormStatusType = 'required' | 'optional' | 'completed';

interface AttenderApplicationContextType {
  // 既存のプロパティ
  // ...
  
  // 新規追加
  formStatus: FormStatusType;
  setFormStatus: (status: FormStatusType) => void;
}

export const AttenderApplicationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 既存の状態
  // ...
  
  // 新規追加の状態
  const [formStatus, setFormStatus] = useState<FormStatusType>('required');
  
  // ...

  return (
    <AttenderApplicationContext.Provider
      value={{
        // 既存のプロパティ
        // ...
        
        // 新規追加
        formStatus,
        setFormStatus,
      }}
    >
      {children}
    </AttenderApplicationContext.Provider>
  );
};
```

### 2. 段階別ステップの定義

```typescript
// constants/applicationSteps.ts
export const REQUIRED_STEPS = ['BasicInfo', 'Identification', 'Agreements'];
export const OPTIONAL_STEPS = ['Expertise', 'ExperienceSamples', 'Availability'];

export const getStepsForStatus = (status: FormStatusType) => {
  return status === 'required' ? REQUIRED_STEPS : [...REQUIRED_STEPS, ...OPTIONAL_STEPS];
};
```

### 3. AttenderApplicationForm の修正

```typescript
// components/attender/application/AttenderApplicationForm.tsx
const AttenderApplicationForm: React.FC = () => {
  const { formStatus, setFormStatus, /* その他のコンテキスト値 */ } = useAttenderApplication();
  
  // 状態に応じたステップ数の計算
  const steps = getStepsForStatus(formStatus);
  const maxSteps = steps.length;
  
  // 送信処理の分岐
  const handleSubmit = async () => {
    // バリデーション
    const validationErrors = validateForm(formData, formStatus);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    // フォーム状態に応じたデータ構築
    let completeFormData: Partial<AttenderApplicationData>;
    
    if (formStatus === 'required') {
      // 必須情報のみ送信
      completeFormData = {
        name: formData.name!,
        email: formData.email!,
        // その他の必須フィールド
        formStatus: 'required' as const
      };
    } else {
      // 全ての情報を送信
      completeFormData = {
        ...formData as Partial<AttenderApplicationData>,
        formStatus: 'completed' as const
      };
    }
    
    // データ送信処理
    try {
      setSubmitting(true);
      const applicationId = await submitAttenderApplication(completeFormData);
      setApplicationId(applicationId);
      setSubmitting(false);
      setSubmitSuccess(true);
    } catch (error) {
      setSubmitting(false);
      setSubmitError(error.message);
    }
  };
  
  // レンダリング処理
  return (
    /* 既存のJSX */
    
    {/* 状態に応じたボタンテキスト変更 */}
    <button 
      type="button" 
      onClick={handleSubmit}
      disabled={submitting}
      className="..."
    >
      {submitting ? (
        <Spinner size="sm" />
      ) : currentStep < maxSteps ? (
        <>次へ</>
      ) : formStatus === 'required' ? (
        '基本登録を完了する'
      ) : (
        'アテンダー申請を完了する'
      )}
    </button>
  );
};
```

### 4. 完了画面の分岐表示

```typescript
// components/attender/application/SubmitSuccess.tsx
const AttenderApplicationSuccess: React.FC = () => {
  const { formStatus, applicationId } = useAttenderApplication();
  
  // 登録状態によって表示を分岐
  return formStatus === 'required' ? (
    <QuickRegistrationSuccess 
      applicationId={applicationId} 
      onReturnHome={handleReturnHome} 
      onContinueSetup={handleContinueSetup} 
    />
  ) : (
    <CompleteRegistrationSuccess 
      applicationId={applicationId} 
      onReturnHome={handleReturnHome} 
    />
  );
};

// 基本登録成功時のコンポーネント
const QuickRegistrationSuccess: React.FC<{
  applicationId: string;
  onReturnHome: () => void;
  onContinueSetup: () => void;
}> = ({ applicationId, onReturnHome, onContinueSetup }) => {
  return (
    <div className="...">
      <div className="...">
        <div className="bg-green-100 rounded-full p-4">
          <Check className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold mt-4">基本登録が完了しました！</h2>
        <p className="text-gray-600 mt-2">
          おめでとうございます！基本的な情報の登録が完了しました。
          このままプロフィールの詳細情報を設定することで、
          より多くの体験リクエストを受け取ることができます。
        </p>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
          <h3 className="font-bold text-blue-800">申請ID: {applicationId}</h3>
          <p className="text-sm text-blue-700">この申請IDはプロフィール詳細設定時に必要です。メモしておくことをおすすめします。</p>
        </div>
        
        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <button
            onClick={onContinueSetup}
            className="flex-1 bg-black text-white py-3 rounded-lg font-medium"
          >
            今すぐプロフィールを完成させる
          </button>
          <button
            onClick={onReturnHome}
            className="flex-1 border border-gray-300 py-3 rounded-lg font-medium"
          >
            後で続ける
          </button>
        </div>
      </div>
    </div>
  );
};

// 完全登録成功時のコンポーネント（既存のものを活用）
const CompleteRegistrationSuccess = SubmitSuccess;
```

### 5. フォームプログレスの修正

```typescript
// components/attender/application/FormProgress.tsx
const FormProgress: React.FC<{
  currentStep: number;
  totalSteps: number;
}> = ({ currentStep, totalSteps }) => {
  const { formStatus } = useAttenderApplication();
  
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-bold">
          アテンダー申請フォーム
          {formStatus === 'required' && (
            <span className="ml-2 bg-cyan-100 text-cyan-800 px-2 py-0.5 rounded-full text-xs">
              基本登録
            </span>
          )}
        </h2>
        <span className="text-sm text-gray-500">
          ステップ {currentStep} / {totalSteps}
        </span>
      </div>
      
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-teal-600 rounded-full"
          style={{ width: `${(currentStep / totalSteps) * 100}%` }}
        ></div>
      </div>
    </div>
  );
};
```

### 6. 型定義の拡張

```typescript
// types/attender/index.ts
export interface AttenderApplicationData {
  // 既存のプロパティ
  // ...
  
  // フォームの状態を追加
  formStatus?: 'required' | 'optional' | 'completed';
}
```

### 7. バリデーション関数の拡張

```typescript
// services/AttenderService.ts
export const validateApplicationData = (
  data: Partial<AttenderApplicationData>,
  status: FormStatusType = 'completed'
): ApplicationValidationResult => {
  const errors: string[] = [];
  const fieldErrors: Record<string, string> = {};
  
  // 基本的なバリデーション（必須フェーズ）
  if (!data.name) {
    errors.push('名前は必須です');
    fieldErrors.name = '名前は必須です';
  }
  
  if (!data.email) {
    errors.push('メールアドレスは必須です');
    fieldErrors.email = 'メールアドレスは必須です';
  } else if (!/\S+@\S+\.\S+/.test(data.email)) {
    errors.push('有効なメールアドレスを入力してください');
    fieldErrors.email = '有効なメールアドレスを入力してください';
  }
  
  // その他の必須フィールドのバリデーション
  // ...
  
  // 任意フェーズのバリデーション（状態が'required'でない場合のみ）
  if (status !== 'required') {
    if (!data.expertise || data.expertise.length === 0) {
      errors.push('少なくとも1つの専門分野を選択してください');
      fieldErrors.expertise = '少なくとも1つの専門分野を選択してください';
    }
    
    // その他の任意フィールドのバリデーション
    // ...
  }
  
  return {
    valid: errors.length === 0,
    errors,
    fieldErrors
  };
};
```

## バックエンド対応

バックエンドAPIも段階的登録をサポートするために、以下の変更が必要です：

1. **申請ステータスの追加**
   - `formStatus` フィールドのデータベースへの追加
   - 段階別の承認フローのサポート

2. **段階的データ検証**
   - 必須フィールドと任意フィールドを区別した検証ロジック
   - 段階に応じた異なるレスポンス

3. **継続登録のサポート**
   - 申請IDによる既存データの取得と更新機能
   - セッション管理の拡張

## ユーザー体験の流れ

1. **初回訪問時**
   - 「基本登録」モードでフォームを表示
   - 少ない必須ステップのみを表示

2. **基本登録完了後**
   - 成功画面で2つの選択肢を提示
     - 「今すぐプロフィールを完成させる」→ 任意情報入力フェーズへ
     - 「後で続ける」→ ホーム画面へ戻る

3. **後日の続き入力**
   - 申請IDを使用して未完了のプロフィールにアクセス
   - 任意情報入力フェーズから開始

## テスト計画

1. **ユニットテスト**
   - 段階に応じたバリデーションロジックのテスト
   - フォーム状態管理のテスト
   - 表示/非表示ロジックのテスト

2. **インテグレーションテスト**
   - 必須フェーズ→任意フェーズの遷移テスト
   - APIとの連携テスト
   - エラー処理のテスト

3. **ユーザビリティテスト**
   - 実際のユーザーによる操作性評価
   - 離脱率と完了率の計測
   - フィードバック収集

## 実装スケジュール

1. **フェーズ1: コア機能実装（3日間）**
   - AttenderApplicationContext の拡張
   - ステップ定義の変更
   - フォームUI修正

2. **フェーズ2: データフロー実装（2日間）**
   - バリデーションロジックの拡張
   - 送信データ形式の変更
   - バックエンド連携

3. **フェーズ3: 完了画面実装（2日間）**
   - 基本登録成功画面の実装
   - 完全登録成功画面の調整
   - 遷移ロジックの実装

4. **フェーズ4: 検証とリファインメント（3日間）**
   - ユニットテスト作成
   - エッジケース対応
   - UI/UX調整

## 期待される効果

1. **登録完了率の向上**
   - 現在の60%から80%へ向上
   - 離脱ポイントの減少

2. **ユーザー満足度の向上**
   - フォーム入力の負担軽減
   - 徐々に情報を提供するアプローチ

3. **アテンダー数の増加**
   - 初期障壁の低下による申請者増加
   - 多様なタイプのアテンダーの獲得

## 結論

アテンダー段階的登録機能の実装により、ユーザーはより少ない労力で基本登録プロセスを完了し、その後自分のペースで詳細情報を追加できるようになります。これにより、登録プロセスの障壁を下げつつ、最終的には質の高いアテンダープロフィールを構築するための基盤が整います。

上記の設計およびスケジュールに従って実装を進め、アテンダー募集とエコシステムの拡大を加速させることを目指します。
