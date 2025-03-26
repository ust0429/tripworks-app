import { AttenderProfile } from '../../types/attender/profile';

/**
 * プロフィール項目の重み定義
 * 各項目の合計が100になるように設定
 */
export const PROFILE_FIELD_WEIGHTS = {
  // 基本情報 (40%)
  name: 10,
  email: 5,
  imageUrl: 10,
  location: 5,
  bio: 10,
  
  // 専門情報 (20%)
  specialties: 10,
  background: 10,
  
  // 体験サンプル (20%)
  experienceSamples: 20,
  
  // 利用可能時間 (20%)
  availability: 20
};

/**
 * プロフィール完成度スコアを計算する
 * @param profile アテンダープロフィール
 * @returns 0-100のスコア
 */
export const calculateProfileCompletionScore = (profile: AttenderProfile | null): number => {
  if (!profile) return 0;
  
  let score = 0;
  
  // 基本情報のスコア計算
  if (profile.name) score += PROFILE_FIELD_WEIGHTS.name;
  if (profile.email) score += PROFILE_FIELD_WEIGHTS.email;
  if (profile.imageUrl) score += PROFILE_FIELD_WEIGHTS.imageUrl;
  if (profile.location) score += PROFILE_FIELD_WEIGHTS.location;
  if (profile.bio && profile.bio.length >= 50) score += PROFILE_FIELD_WEIGHTS.bio;
  else if (profile.bio) score += PROFILE_FIELD_WEIGHTS.bio * 0.5; // 短い自己紹介は半分のスコア
  
  // 専門情報のスコア計算
  if (profile.specialties && profile.specialties.length > 0) {
    // 専門分野は最大3つまでカウント (各3.33点)
    const specialtiesScore = Math.min(profile.specialties.length, 3) / 3 * PROFILE_FIELD_WEIGHTS.specialties;
    score += specialtiesScore;
  }
  
  if (profile.background && profile.background.length >= 100) score += PROFILE_FIELD_WEIGHTS.background;
  else if (profile.background) score += PROFILE_FIELD_WEIGHTS.background * 0.5; // 短い経歴は半分のスコア
  
  // 体験サンプルのスコア計算
  const experienceSamplesWeight = PROFILE_FIELD_WEIGHTS.experienceSamples;
  if (profile.experienceSamples && profile.experienceSamples.length > 0) {
    // 体験サンプルは最大3つまでカウント (各6.67点)
    const sampleCount = Math.min(profile.experienceSamples.length, 3);
    const completeSamples = profile.experienceSamples
      .slice(0, 3)
      .filter(sample => 
        sample.title && 
        sample.description && 
        sample.description.length >= 50 &&
        sample.categories &&
        sample.categories.length > 0
      ).length;
    
    // 完全なサンプルと部分的なサンプルで重み付け
    const sampleScore = (completeSamples / 3 * 0.8 + sampleCount / 3 * 0.2) * experienceSamplesWeight;
    score += sampleScore;
  }
  
  // 利用可能時間のスコア計算
  const availabilityWeight = PROFILE_FIELD_WEIGHTS.availability;
  if (profile.availability && profile.availability.length > 0) {
    const availableDays = profile.availability.filter(day => day.isAvailable);
    if (availableDays.length > 0) {
      // 利用可能な日数と時間枠の設定に基づいてスコア計算
      const daysScore = availableDays.length / 7 * 0.6; // 日数 (60%)
      
      // 時間枠が設定されているかをチェック (40%)
      const timeSlotsScore = availableDays.filter(
        day => day.timeSlots && day.timeSlots.length > 0
      ).length / 7 * 0.4;
      
      score += (daysScore + timeSlotsScore) * availabilityWeight;
    }
  }
  
  // 小数点以下を切り捨てて整数値で返す
  return Math.round(score);
};

/**
 * プロフィール完成度に基づいてレベルを取得
 * @param score 完成度スコア (0-100)
 * @returns レベル (1-5)
 */
export const getProfileCompletionLevel = (score: number): number => {
  if (score < 20) return 1;
  if (score < 40) return 2;
  if (score < 60) return 3;
  if (score < 80) return 4;
  return 5;
};

/**
 * スコアに基づく色コードを取得
 * @param score 完成度スコア (0-100)
 * @returns テールウィンドのカラークラス
 */
export const getProfileCompletionColorClass = (score: number): string => {
  if (score < 20) return 'text-red-500'; // 危険
  if (score < 40) return 'text-orange-500'; // 警告
  if (score < 60) return 'text-yellow-500'; // 注意
  if (score < 80) return 'text-blue-500'; // 良好
  return 'text-green-500'; // 優良
};

/**
 * スコアに基づくバッジの背景色クラスを取得
 * @param score 完成度スコア (0-100)
 * @returns テールウィンドの背景色クラス
 */
export const getProfileCompletionBgClass = (score: number): string => {
  if (score < 20) return 'bg-red-100 text-red-800';
  if (score < 40) return 'bg-orange-100 text-orange-800';
  if (score < 60) return 'bg-yellow-100 text-yellow-800';
  if (score < 80) return 'bg-blue-100 text-blue-800';
  return 'bg-green-100 text-green-800';
};

/**
 * スコアに基づくメッセージを取得
 * @param score 完成度スコア (0-100)
 * @returns メッセージ
 */
export const getProfileCompletionMessage = (score: number): string => {
  if (score < 20) return '基本情報を入力しましょう';
  if (score < 40) return 'プロフィールを充実させましょう';
  if (score < 60) return '体験サンプルを追加しましょう';
  if (score < 80) return 'あと少しで完成です';
  if (score < 100) return '素晴らしいプロフィールです';
  return '完璧なプロフィールです！';
};

/**
 * 次に改善すべき項目を提案
 * @param profile アテンダープロフィール
 * @returns 改善提案メッセージ
 */
export const getSuggestionForImprovement = (profile: AttenderProfile | null): string => {
  if (!profile) return '';
  
  // 最も優先度の高い未完了項目を特定
  if (!profile.imageUrl) {
    return 'プロフィール写真を追加すると予約率が3倍に上がります';
  }
  
  if (!profile.bio || profile.bio.length < 50) {
    return '自己紹介文を充実させると、あなたの人柄が伝わりやすくなります';
  }
  
  if (!profile.specialties || profile.specialties.length === 0) {
    return '専門分野を追加して、あなたの強みをアピールしましょう';
  }
  
  if (!profile.background || profile.background.length < 100) {
    return '経歴を詳しく書くと、信頼性が高まります';
  }
  
  if (!profile.experienceSamples || profile.experienceSamples.length === 0) {
    return '体験サンプルを追加して、提供できる体験をアピールしましょう';
  }
  
  if (profile.experienceSamples && profile.experienceSamples.length < 3) {
    return 'もう少し体験サンプルを追加すると、多様な体験を提供できることをアピールできます';
  }
  
  if (!profile.availability || profile.availability.filter(day => day.isAvailable).length === 0) {
    return '利用可能時間を設定すると、予約を受けられるようになります';
  }
  
  if (profile.availability && profile.availability.filter(day => day.isAvailable).length < 3) {
    return '利用可能日を増やすと、より多くの予約機会を得られます';
  }
  
  return 'プロフィールを定期的に更新して、最新情報を反映させましょう';
};
