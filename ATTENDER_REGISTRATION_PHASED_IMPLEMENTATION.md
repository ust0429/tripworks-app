# アテンダー段階的登録機能の実装詳細

## 概要

アテンダー登録プロセスの障壁を下げるため、登録フローを2つのフェーズに分割しました：

1. **必須情報フェーズ** - 最小限の情報のみを収集して基本登録を完了
2. **任意情報フェーズ** - より詳細なプロフィール情報を収集

この段階的アプローチにより、ユーザーは最初に最小限の情報を入力するだけでアテンダーとして登録でき、後でより詳細な情報を追加できます。

## 主要コンポーネントと実装

### 1. FormStatusType の定義とコンテキスト拡張

```typescript
// types/attender/index.ts
export type FormStatusType = 'required' | 'optional' | 'completed';

// contexts/AttenderApplicationContext.tsx
interface AttenderApplicationContextType {
  // 既存のプロパティ
  // ...
  
  // 新規追加
  formStatus: FormStatusType;
  setFormStatus: (status: FormStatusType) => void;
}

// 状態管理の実装
const [formStatus, setFormStatus] = useState<FormStatusType>('required');
```

### 2. ステップ定義の分離

```typescript
// constants/applicationSteps.ts
export const REQUIRED_STEPS = ['BasicInfo', 'Identification', 'Agreements'];
export const OPTIONAL_STEPS = ['Expertise', 'ExperienceSamples', 'Availability'];

// ステップのメタデータ
export type StepKey = 'BasicInfo' | 'Identification' | 'Agreements' | 'Expertise' | 'ExperienceSamples' | 'Availability';

export const STEP_METADATA: Record<StepKey, { title: string; description: string }> = {
  BasicInfo: { title: '基本情報', description: '個人情報とプロフィール' },
  Expertise: { title: '専門分野', description: '専門知識と言語スキル' },
  ExperienceSamples: { title: '体験サンプル', description: '提供できる体験の例' },
  Availability: { title: '利用可能時間', description: '活動可能な時間帯' },
  Identification: { title: '本人確認', description: '身分証明書の提出' },
  Agreements: { title: '同意事項', description: '規約と条件の確認' }
};
```

### 3. フォーム状態に応じた条件付きバリデーション

```typescript
// services/AttenderService.ts
function validateApplicationData(data: AttenderApplicationData, formStatus: FormStatusType = 'completed'): ApplicationValidationResult {
  const errors: string[] = [];
  const fieldErrors: Record<string, string> = {};
  
  // 基本的なバリデーション（必須フェーズ）
  if (!data.name) {
    errors.push('名前は必須です');
    fieldErrors.name = '名前は必須です';
  }
  
  // その他の必須フィールドのバリデーション
  // ...
  
  // 任意フェーズのバリデーション（状態が'required'でない場合のみ）
  if (formStatus !== 'required') {
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
}
```

### 4. 送信データの最適化

```typescript
// AttenderApplicationForm.tsx
// フォーム状態に応じたデータの準備
if (formStatus === 'required') {
  // 必須情報のみ送信
  completeFormData = {
    name: formData.name!,
    email: formData.email!,
    // ...その他の必須フィールド
    formStatus: 'required' as const
  };
} else {
  // 全ての情報を送信
  completeFormData = {
    ...formData as Partial<AttenderApplicationData>,
    // ...必須フィールドの明示的な設定
    formStatus: 'completed' as const
  };
}

// APIを呼び出してフォームを送信
const applicationId = await submitAttenderApplication(completeFormData);
```

### 5. フォーム進行状況表示の改良

```tsx
// FormProgress.tsx
<div className="flex mb-1 items-center justify-between">
  <div>
    <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-100">
      進行状況
    </span>
  </div>
  <div className="text-right">
    <span className="text-xs font-semibold inline-block text-blue-600">
      {Math.round(progressPercentage)}% 完了
    </span>
  </div>
</div>

{formStatus === 'required' && (
  <span className="bg-cyan-100 text-cyan-800 px-2 py-0.5 rounded-full text-xs">
    基本登録
  </span>
)}
```

### 6. 成功画面の分岐表示

```tsx
// AttenderApplicationForm.tsx
// 申請が完了した場合
if (applicationId) {
  // フォーム状態に応じて異なる成功画面を表示
  return formStatus === 'required' ? (
    <QuickRegistrationSuccess 
      applicationId={applicationId} 
      onReturnHome={handleReturnHome} 
      onContinueSetup={() => {
        // 全情報フォームに切り替え
        setFormStatus('optional');
        setApplicationId(null); // 申請 IDをクリアして続きから入力できるようにする
        goToStep(4); // 最初の任意ステップに移動
      }}
    />
  ) : (
    <SubmitSuccess applicationId={applicationId} onReturnHome={handleReturnHome} />
  );
}
```

### 7. QuickRegistrationSuccess コンポーネント

詳細プロフィール入力継続を促す専用の成功画面を実装しました。このコンポーネントには以下の特徴があります：

- 「基本登録完了」のステータス表示
- 申請ID表示とコピー機能
- 「今すぐプロフィールを完成させる」と「後で続ける」の選択肢
- 詳細プロフィール入力のメリット説明
- 審査完了予定日の表示

## 型システムの調整

TypeScript の型安全性を確保するため、以下の修正を行いました：

1. **FormStatusType の型定義追加**
   - 型をAttenderApplicationDataインターフェースに追加

2. **StepKey 型の定義**
   - 明示的な型定義によるインデックスシグネチャ問題の解決

3. **型アサーションの追加**
   - コンテキスト内での型エラーを解消するためのアサーション

## ユーザー体験の改善

1. **視覚的フィードバック**
   - 「基本登録」バッジによる状態表示
   - フェーズごとに最適化されたプログレスバー
   - 状態に応じたボタンテキスト変更

2. **詳細情報入力の価値提示**
   - 詳細プロフィールのメリット説明
   - 検索優先表示、多様な体験機会、信頼性向上などの利点を強調

3. **シームレスな遷移**
   - 基本登録から任意情報入力へのスムーズな遷移
   - 後日の継続入力に対応した状態管理

## テスト計画

1. **基本登録フローのテスト**
   - 必須ステップのみでの登録完了
   - 基本登録成功画面の表示確認
   - 申請IDの正常な発行確認

2. **任意情報フェーズのテスト**
   - 基本登録からの継続入力
   - 任意フィールドの検証ロジック
   - 全情報を含む完全申請の送信

3. **エッジケースのテスト**
   - 途中離脱と再開
   - バリデーションエラーの適切な表示
   - フォーム状態の永続化

## 今後の拡張計画

1. **分析機能の強化**
   - フェーズ別の完了率測定
   - 離脱率分析ダッシュボード
   - フィールドごとの入力完了率測定

2. **リマインダー機能**
   - 基本登録後の詳細入力促進
   - メール通知との連携
   - パーソナライズされたリマインダー

3. **インセンティブ強化**
   - プロフィール完成度に応じた特典
   - 視覚的な進捗表示強化
   - 詳細プロフィールの効果可視化

## まとめ

アテンダー段階的登録機能の実装により、ユーザーはより少ない労力で基本登録を完了し、その後自分のペースで詳細情報を追加できるようになりました。これにより、登録プロセスの障壁を下げつつ、最終的には質の高いアテンダープロフィールを構築するための基盤が整いました。

この機能は、ユーザーがアプリケーションへの関与を段階的に増やしていくための重要なアプローチであり、TypeScript の型システムを活用した安全で保守性の高い実装となっています。
