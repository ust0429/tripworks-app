/**
 * アテンダー申請に関する定数
 */

export type FormStatusType = 'required' | 'optional' | 'completed';

// 必須ステップと任意ステップの区分
export const REQUIRED_STEPS = ['BasicInfo', 'Identification', 'Agreements'];
export const OPTIONAL_STEPS = ['Expertise', 'ExperienceSamples', 'Availability'];

// ステップのメタデータ
export type StepKey = 'BasicInfo' | 'Identification' | 'Agreements' | 'Expertise' | 'ExperienceSamples' | 'Availability';

export const STEP_METADATA: Record<StepKey, { title: string; description: string }> = {
  BasicInfo: { title: '基本情報', description: '個人情報とプロフィール' },
  Expertise: { title: '専門分野', description: '専門知識と言語スキル' },
  ExperienceSamples: { title: '体験サンプル', description: '提供できる体験の例' },
  Availability: { title: '利用可能時間', description: '活動可能な時間帯' },
  Identification: { title: '本人確認', description: '身分証明書の提出（任意）' },
  Agreements: { title: '同意事項', description: '規約と条件の確認' }
};

// ステップインデックスからステップキーを取得
export const getStepKeyByIndex = (index: number, formStatus: FormStatusType): StepKey | null => {
  const steps = formStatus === 'required' ? REQUIRED_STEPS : [...REQUIRED_STEPS, ...OPTIONAL_STEPS];
  return steps[index - 1] as StepKey || null;
};

// ステップキーからステップインデックスを取得
export const getIndexByStepKey = (key: StepKey, formStatus: FormStatusType): number => {
  const steps = formStatus === 'required' ? REQUIRED_STEPS : [...REQUIRED_STEPS, ...OPTIONAL_STEPS];
  return steps.indexOf(key) + 1;
};

// フォーム状態に応じたステップの配列を取得
export const getStepsForStatus = (status: FormStatusType): StepKey[] => {
  return status === 'required' 
    ? REQUIRED_STEPS as StepKey[]
    : [...REQUIRED_STEPS, ...OPTIONAL_STEPS] as StepKey[];
};

// ステップインデックスの計算
export const getStepIndexMap = (status: FormStatusType): Record<number, StepKey> => {
  const steps = getStepsForStatus(status);
  return steps.reduce((map, key, index) => {
    map[index + 1] = key;
    return map;
  }, {} as Record<number, StepKey>);
};
