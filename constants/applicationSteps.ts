/**
 * アテンダー申請のステップ定義
 */

// 必須ステップと任意ステップの定義
export const REQUIRED_STEPS = ['BasicInfo', 'Identification', 'Agreements'];
export const OPTIONAL_STEPS = ['Expertise', 'ExperienceSamples', 'Availability'];

// 各ステップのキータイプ
export type StepKey = 'BasicInfo' | 'Identification' | 'Agreements' | 'Expertise' | 'ExperienceSamples' | 'Availability';

// 各ステップのメタデータ
export const STEP_METADATA: Record<StepKey, { title: string; description: string }> = {
  BasicInfo: { title: '基本情報', description: '個人情報とプロフィール' },
  Identification: { title: '本人確認', description: '身分証明書の提出' },
  Agreements: { title: '同意事項', description: '規約と条件の確認' },
  Expertise: { title: '専門分野', description: '専門知識と言語スキル' },
  ExperienceSamples: { title: '体験サンプル', description: '提供できる体験の例' },
  Availability: { title: '利用可能時間', description: '活動可能な時間帯' }
};
