import { AttenderProfile } from '../types/attender/profile';

/**
 * プロフィール完成度スコアを計算する
 * 各セクションの重み付けに基づいて計算
 */
export const calculateProfileCompletionScore = (profile: AttenderProfile | null): number => {
  if (!profile) return 0;

  // 各セクションの重み付け（合計100）
  const weights = {
    basicInfo: 20,      // 基本情報
    specialties: 15,    // 専門分野
    languages: 10,      // 言語
    expertise: 15,      // 専門知識
    experiences: 25,    // 体験サンプル
    availability: 15,   // 利用可能時間
  };

  let score = 0;

  // 基本情報のスコア計算
  if (profile.name) score += weights.basicInfo * 0.3;
  if (profile.bio && profile.bio.length > 10) score += weights.basicInfo * 0.3;
  if (profile.location) score += weights.basicInfo * 0.2;
  if (profile.profileImage || profile.profilePhoto || profile.imageUrl) score += weights.basicInfo * 0.2;

  // 専門分野のスコア計算
  if (profile.specialties && profile.specialties.length > 0) {
    score += weights.specialties * Math.min(profile.specialties.length / 3, 1);
  }

  // 言語スキルのスコア計算
  if (profile.languages && profile.languages.length > 0) {
    score += weights.languages * Math.min(profile.languages.length / 2, 1);
  }

  // 専門知識のスコア計算
  if (profile.expertise && profile.expertise.length > 0) {
    const expertiseCompleteness = profile.expertise.reduce((sum, item) => {
      let itemScore = 0;
      if (item.category) itemScore += 0.5;
      if (item.description) itemScore += 0.3;
      if (item.yearsOfExperience) itemScore += 0.2;
      return sum + itemScore;
    }, 0) / Math.max(1, profile.expertise.length);
    
    score += weights.expertise * expertiseCompleteness;
  }

  // 体験サンプルのスコア計算
  if (profile.experienceSamples && profile.experienceSamples.length > 0) {
    const samplesCount = Math.min(profile.experienceSamples.length / 2, 1);
    
    const samplesCompleteness = profile.experienceSamples.reduce((sum, sample) => {
      let sampleScore = 0;
      if (sample.title) sampleScore += 0.2;
      if (sample.description && sample.description.length > 20) sampleScore += 0.3;
      if (sample.category) sampleScore += 0.1;
      if (sample.estimatedDuration) sampleScore += 0.1;
      if (sample.images && sample.images.length > 0) sampleScore += 0.3;
      return sum + sampleScore;
    }, 0) / Math.max(1, profile.experienceSamples.length);
    
    score += weights.experiences * (samplesCount * 0.4 + samplesCompleteness * 0.6);
  }

  // 利用可能時間のスコア計算
  if (profile.availableTimes && profile.availableTimes.length > 0) {
    const availableSlots = profile.availableTimes.filter(slot => slot.isAvailable).length;
    score += weights.availability * Math.min(availableSlots / 7, 1);
  }

  return Math.round(score);
};

/**
 * プロフィール改善のためのアドバイスを生成
 */
export const generateProfileImprovementTips = (profile: AttenderProfile | null): string[] => {
  if (!profile) return [];
  
  const tips: string[] = [];
  
  // 基本情報のチェック
  if (!profile.name) {
    tips.push('名前を追加してください');
  }
  
  if (!profile.bio || profile.bio.length < 20) {
    tips.push('自己紹介文を充実させてください（20文字以上推奨）');
  }
  
  if (!profile.location) {
    tips.push('活動地域を設定してください');
  }
  
  if (!profile.profileImage && !profile.profilePhoto && !profile.imageUrl) {
    tips.push('プロフィール写真をアップロードしてください');
  }
  
  // 専門分野のチェック
  if (!profile.specialties || profile.specialties.length === 0) {
    tips.push('専門分野を少なくとも1つ追加してください');
  } else if (profile.specialties.length < 2) {
    tips.push('より多くの専門分野を追加するとマッチング率が上がります');
  }
  
  // 言語スキルのチェック
  if (!profile.languages || profile.languages.length === 0) {
    tips.push('使用可能な言語を追加してください');
  }
  
  // 専門知識のチェック
  if (!profile.expertise || profile.expertise.length === 0) {
    tips.push('専門知識・経験を追加してください');
  } else {
    const incompleteExpertise = profile.expertise.some(item => !item.description || !item.yearsOfExperience);
    if (incompleteExpertise) {
      tips.push('専門知識の詳細や経験年数を追加してください');
    }
  }
  
  // 体験サンプルのチェック
  if (!profile.experienceSamples || profile.experienceSamples.length === 0) {
    tips.push('体験サンプルを少なくとも1つ追加してください');
  } else if (profile.experienceSamples.length < 2) {
    tips.push('複数の体験サンプルを追加すると予約率が上がります');
  } else {
    const incompleteSamples = profile.experienceSamples.some(sample => 
      !sample.title || 
      !sample.description || 
      sample.description.length < 30 ||
      !sample.images || 
      sample.images.length === 0
    );
    
    if (incompleteSamples) {
      tips.push('体験サンプルの詳細や写真を追加してください');
    }
  }
  
  // 利用可能時間のチェック
  if (!profile.availableTimes || profile.availableTimes.length === 0) {
    tips.push('利用可能時間を設定してください');
  } else {
    const availableSlots = profile.availableTimes.filter(slot => slot.isAvailable).length;
    if (availableSlots < 5) {
      tips.push('より多くの利用可能時間枠を設定すると予約率が上がります');
    }
  }
  
  return tips;
};
