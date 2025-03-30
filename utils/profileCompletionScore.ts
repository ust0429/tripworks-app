/**
 * アテンダープロフィールの完成度スコア計算ユーティリティ
 */
import { AttenderProfile } from '../types/attender/index';

// セクションごとの配点
interface SectionWeight {
  basicInfo: number;  // 基本情報
  biography: number;  // 自己紹介
  specialties: number; // 専門分野
  languages: number;  // 言語
  expertise: number;  // 専門知識
  experienceSamples: number; // 体験サンプル
  availability: number; // 利用可能時間
  profilePhoto: number; // プロフィール写真
  location: number;    // 所在地
  background: number;  // 経歴
}

// デフォルトの配点設定
const DEFAULT_WEIGHTS: SectionWeight = {
  basicInfo: 10,
  biography: 15,
  specialties: 10,
  languages: 10,
  expertise: 15,
  experienceSamples: 20,
  availability: 10,
  profilePhoto: 5,
  location: 5,
  background: 0  // オプション
};

/**
 * 基本情報のスコアを計算
 */
const calculateBasicInfoScore = (profile: AttenderProfile): number => {
  let score = 0;
  const maxScore = 100;
  
  // 名前 (40%)
  if (profile.name && profile.name.trim().length > 0) {
    score += 40;
  }
  
  // メールアドレス (30%)
  if (profile.email || profile.emailAddress) {
    score += 30;
  }
  
  // 電話番号 (30%)
  if (profile.phoneNumber) {
    score += 30;
  }
  
  return (score / 100) * DEFAULT_WEIGHTS.basicInfo;
};

/**
 * 自己紹介のスコアを計算
 */
const calculateBiographyScore = (profile: AttenderProfile): number => {
  let score = 0;
  const maxScore = 100;
  const bioText = profile.bio || profile.biography || '';
  
  if (bioText.length === 0) {
    return 0;
  }
  
  // 文字数による段階的なスコア (最大100%)
  if (bioText.length >= 500) {
    score = 100;
  } else if (bioText.length >= 300) {
    score = 80;
  } else if (bioText.length >= 150) {
    score = 60;
  } else if (bioText.length >= 50) {
    score = 40;
  } else {
    score = 20;
  }
  
  return (score / 100) * DEFAULT_WEIGHTS.biography;
};

/**
 * 専門分野のスコアを計算
 */
const calculateSpecialtiesScore = (profile: AttenderProfile): number => {
  let score = 0;
  const maxScore = 100;
  const specialties = profile.specialties || [];
  
  if (specialties.length === 0) {
    return 0;
  }
  
  // 専門分野の数による段階的なスコア (最大100%)
  if (specialties.length >= 5) {
    score = 100;
  } else if (specialties.length >= 3) {
    score = 80;
  } else if (specialties.length >= 2) {
    score = 60;
  } else {
    score = 40;
  }
  
  return (score / 100) * DEFAULT_WEIGHTS.specialties;
};

/**
 * 言語スキルのスコアを計算
 */
const calculateLanguagesScore = (profile: AttenderProfile): number => {
  let score = 0;
  const maxScore = 100;
  const languages = profile.languages || [];
  
  if (languages.length === 0) {
    return 0;
  }
  
  // 言語の数による基本スコア (最大60%)
  if (languages.length >= 3) {
    score += 60;
  } else if (languages.length >= 2) {
    score += 40;
  } else {
    score += 20;
  }
  
  // 各言語の熟練度に基づく追加スコア (最大40%)
  const proficiencyScore = languages.reduce((total, lang) => {
    switch (lang.proficiency) {
      case 'native':
        return total + 10;
      case 'advanced':
        return total + 8;
      case 'intermediate':
        return total + 5;
      case 'beginner':
        return total + 2;
      default:
        return total;
    }
  }, 0);
  
  // 40%を上限とする
  score += Math.min(proficiencyScore, 40);
  
  return (score / 100) * DEFAULT_WEIGHTS.languages;
};

/**
 * 専門知識のスコアを計算
 */
const calculateExpertiseScore = (profile: AttenderProfile): number => {
  let score = 0;
  const maxScore = 100;
  const expertise = profile.expertise || [];
  
  if (expertise.length === 0) {
    return 0;
  }
  
  // 専門知識の数による基本スコア (最大50%)
  if (expertise.length >= 3) {
    score += 50;
  } else if (expertise.length >= 2) {
    score += 30;
  } else {
    score += 15;
  }
  
  // 詳細の充実度によるスコア (最大50%)
  let detailScore = 0;
  expertise.forEach(exp => {
    let itemScore = 0;
    
    // カテゴリ
    if (exp.category) itemScore += 3;
    
    // サブカテゴリ
    if (exp.subcategories && exp.subcategories.length > 0) {
      itemScore += Math.min(exp.subcategories.length * 2, 6);
    }
    
    // 経験年数
    if (exp.yearsOfExperience && exp.yearsOfExperience > 0) itemScore += 4;
    
    // 説明文
    if (exp.description) {
      if (exp.description.length >= 100) {
        itemScore += 7;
      } else if (exp.description.length >= 50) {
        itemScore += 5;
      } else {
        itemScore += 2;
      }
    }
    
    detailScore += itemScore;
  });
  
  // 50%を上限とする
  score += Math.min((detailScore / (expertise.length * 20)) * 50, 50);
  
  return (score / 100) * DEFAULT_WEIGHTS.expertise;
};

/**
 * 体験サンプルのスコアを計算
 */
const calculateExperienceSamplesScore = (profile: AttenderProfile): number => {
  let score = 0;
  const maxScore = 100;
  const samples = profile.experienceSamples || [];
  
  if (samples.length === 0) {
    return 0;
  }
  
  // サンプル数による基本スコア (最大50%)
  if (samples.length >= 3) {
    score += 50;
  } else if (samples.length >= 2) {
    score += 30;
  } else {
    score += 15;
  }
  
  // 各サンプルの詳細度によるスコア (最大50%)
  let detailScore = 0;
  samples.forEach(sample => {
    let itemScore = 0;
    
    // タイトル
    if (sample.title) itemScore += 2;
    
    // 説明文
    if (sample.description) {
      if (sample.description.length >= 200) {
        itemScore += 8;
      } else if (sample.description.length >= 100) {
        itemScore += 5;
      } else if (sample.description.length >= 50) {
        itemScore += 3;
      } else {
        itemScore += 1;
      }
    }
    
    // カテゴリ
    if (sample.category) itemScore += 2;
    if (sample.subcategory) itemScore += 1;
    
    // 所要時間と料金
    if (sample.estimatedDuration > 0 || sample.duration > 0) itemScore += 2;
    if (sample.price > 0 || sample.pricePerPerson > 0) itemScore += 2;
    
    // 画像
    if (sample.images && sample.images.length > 0) {
      itemScore += Math.min(sample.images.length * 3, 6);
    } else if (sample.imageUrl || (sample.imageUrls && sample.imageUrls.length > 0)) {
      itemScore += 3;
    }
    
    // 場所
    if (sample.location) itemScore += 2;
    
    // その他の詳細情報
    if (sample.maxParticipants) itemScore += 1;
    if (sample.includesFood !== undefined) itemScore += 1;
    if (sample.includesTransportation !== undefined) itemScore += 1;
    if (sample.cancellationPolicy) itemScore += 1;
    if (sample.specialRequirements) itemScore += 1;
    
    detailScore += itemScore;
  });
  
  // 50%を上限とする
  const maxDetailScore = samples.length * 30; // 1サンプルあたり最大30ポイント
  score += Math.min((detailScore / maxDetailScore) * 50, 50);
  
  return (score / 100) * DEFAULT_WEIGHTS.experienceSamples;
};

/**
 * 利用可能時間のスコアを計算
 */
const calculateAvailabilityScore = (profile: AttenderProfile): number => {
  let score = 0;
  const maxScore = 100;
  
  // 新しい形式と旧形式の両方をサポート
  const availabilitySlots = profile.availability || [];
  const availableTimes = profile.availableTimes || [];
  
  if (availabilitySlots.length === 0 && availableTimes.length === 0) {
    return 0;
  }
  
  // 新しい形式の場合
  if (availabilitySlots.length > 0) {
    const availableDays = availabilitySlots.filter(slot => slot.isAvailable).length;
    const totalTimeSlots = availabilitySlots.reduce((total, day) => 
      total + (day.timeSlots?.length || 0), 0);
    
    // 利用可能な日数によるスコア (最大50%)
    if (availableDays >= 5) {
      score += 50;
    } else if (availableDays >= 3) {
      score += 30;
    } else if (availableDays >= 1) {
      score += 10;
    }
    
    // 合計時間枠数によるスコア (最大50%)
    if (totalTimeSlots >= 10) {
      score += 50;
    } else if (totalTimeSlots >= 5) {
      score += 30;
    } else if (totalTimeSlots >= 1) {
      score += 10;
    }
  } 
  // 旧形式の場合
  else if (availableTimes.length > 0) {
    const availableSlots = availableTimes.filter(slot => slot.isAvailable).length;
    
    // 利用可能時間枠の数によるスコア
    if (availableSlots >= 7) {
      score = 100;
    } else if (availableSlots >= 5) {
      score = 80;
    } else if (availableSlots >= 3) {
      score = 60;
    } else if (availableSlots >= 1) {
      score = 30;
    }
  }
  
  return (score / 100) * DEFAULT_WEIGHTS.availability;
};

/**
 * プロフィール写真のスコアを計算
 */
const calculateProfilePhotoScore = (profile: AttenderProfile): number => {
  const maxScore = 100;
  
  // プロフィール写真の有無
  if (profile.profilePhoto || profile.imageUrl) {
    return DEFAULT_WEIGHTS.profilePhoto;
  }
  
  return 0;
};

/**
 * 所在地情報のスコアを計算
 */
const calculateLocationScore = (profile: AttenderProfile): number => {
  let score = 0;
  const maxScore = 100;
  
  // 所在地情報が文字列の場合
  if (typeof profile.location === 'string') {
    if (profile.location.trim().length > 0) {
      score = 100;
    }
  } 
  // 所在地情報がオブジェクトの場合
  else if (typeof profile.location === 'object' && profile.location) {
    // 国、地域、都市の有無で段階的にスコア付け
    if (profile.location.country) score += 30;
    if (profile.location.region) score += 30;
    if (profile.location.city) score += 40;
  }
  
  return (score / 100) * DEFAULT_WEIGHTS.location;
};

/**
 * 経歴情報のスコアを計算
 */
const calculateBackgroundScore = (profile: AttenderProfile): number => {
  let score = 0;
  const maxScore = 100;
  
  // 経歴情報があればスコアを付与
  if (profile.background && profile.background.trim().length > 0) {
    // 文字数に応じたスコア
    if (profile.background.length >= 300) {
      score = 100;
    } else if (profile.background.length >= 100) {
      score = 70;
    } else {
      score = 30;
    }
  }
  
  return (score / 100) * DEFAULT_WEIGHTS.background;
};

/**
 * プロフィールの完成度スコアを計算
 * 
 * @param profile アテンダープロフィール
 * @param weights セクションごとの重み付け（オプション）
 * @returns 0から95点満点の完成度スコア
 */
export const calculateProfileCompletionScore = (
  profile: AttenderProfile,
  weights: Partial<SectionWeight> = {}
): number => {
  // 指定された重み付けとデフォルト値をマージ
  const mergedWeights = { ...DEFAULT_WEIGHTS, ...weights };
  
  // 各セクションのスコアを計算
  const basicInfoScore = calculateBasicInfoScore(profile);
  const biographyScore = calculateBiographyScore(profile);
  const specialtiesScore = calculateSpecialtiesScore(profile);
  const languagesScore = calculateLanguagesScore(profile);
  const expertiseScore = calculateExpertiseScore(profile);
  const experienceSamplesScore = calculateExperienceSamplesScore(profile);
  const availabilityScore = calculateAvailabilityScore(profile);
  const profilePhotoScore = calculateProfilePhotoScore(profile);
  const locationScore = calculateLocationScore(profile);
  const backgroundScore = calculateBackgroundScore(profile);
  
  // 総合スコアを計算
  const totalScore = basicInfoScore + biographyScore + specialtiesScore + 
    languagesScore + expertiseScore + experienceSamplesScore + 
    availabilityScore + profilePhotoScore + locationScore + backgroundScore;
  
  // 重み付け合計を計算
  const totalWeight = Object.values(mergedWeights).reduce((sum, weight) => sum + weight, 0);
  
  // 完成度スコアを計算（95点満点、四捨五入）
  return Math.round((totalScore / totalWeight) * 95);
};

/**
 * 各セクションの完成度情報を計算
 * 
 * @param profile アテンダープロフィール
 * @returns セクションごとの完成度情報
 */
export const calculateSectionCompletionDetails = (profile: AttenderProfile) => {
  return {
    basicInfo: {
      score: calculateBasicInfoScore(profile),
      maxScore: DEFAULT_WEIGHTS.basicInfo,
      percentage: calculateBasicInfoScore(profile) / DEFAULT_WEIGHTS.basicInfo * 100
    },
    biography: {
      score: calculateBiographyScore(profile),
      maxScore: DEFAULT_WEIGHTS.biography,
      percentage: calculateBiographyScore(profile) / DEFAULT_WEIGHTS.biography * 100
    },
    specialties: {
      score: calculateSpecialtiesScore(profile),
      maxScore: DEFAULT_WEIGHTS.specialties,
      percentage: calculateSpecialtiesScore(profile) / DEFAULT_WEIGHTS.specialties * 100
    },
    languages: {
      score: calculateLanguagesScore(profile),
      maxScore: DEFAULT_WEIGHTS.languages,
      percentage: calculateLanguagesScore(profile) / DEFAULT_WEIGHTS.languages * 100
    },
    expertise: {
      score: calculateExpertiseScore(profile),
      maxScore: DEFAULT_WEIGHTS.expertise,
      percentage: calculateExpertiseScore(profile) / DEFAULT_WEIGHTS.expertise * 100
    },
    experienceSamples: {
      score: calculateExperienceSamplesScore(profile),
      maxScore: DEFAULT_WEIGHTS.experienceSamples,
      percentage: calculateExperienceSamplesScore(profile) / DEFAULT_WEIGHTS.experienceSamples * 100
    },
    availability: {
      score: calculateAvailabilityScore(profile),
      maxScore: DEFAULT_WEIGHTS.availability,
      percentage: calculateAvailabilityScore(profile) / DEFAULT_WEIGHTS.availability * 100
    },
    profilePhoto: {
      score: calculateProfilePhotoScore(profile),
      maxScore: DEFAULT_WEIGHTS.profilePhoto,
      percentage: calculateProfilePhotoScore(profile) / DEFAULT_WEIGHTS.profilePhoto * 100
    },
    location: {
      score: calculateLocationScore(profile),
      maxScore: DEFAULT_WEIGHTS.location,
      percentage: calculateLocationScore(profile) / DEFAULT_WEIGHTS.location * 100
    },
    background: {
      score: calculateBackgroundScore(profile),
      maxScore: DEFAULT_WEIGHTS.background,
      percentage: calculateBackgroundScore(profile) / DEFAULT_WEIGHTS.background * 100
    }
  };
};

/**
 * プロフィール完成度に基づく改善アドバイスを生成
 * 
 * @param profile アテンダープロフィール
 * @returns 改善アドバイスの配列
 */
export const generateProfileImprovementTips = (profile: AttenderProfile): string[] => {
  const sectionDetails = calculateSectionCompletionDetails(profile);
  const tips: string[] = [];
  
  // 基本情報
  if (sectionDetails.basicInfo.percentage < 100) {
    if (!profile.name || profile.name.trim().length === 0) {
      tips.push('名前を入力してください。');
    }
    if (!profile.email && !profile.emailAddress) {
      tips.push('メールアドレスを入力してください。');
    }
    if (!profile.phoneNumber) {
      tips.push('電話番号を入力するとスコアが上がります。');
    }
  }
  
  // 自己紹介
  if (sectionDetails.biography.percentage < 60) {
    const bioText = profile.bio || profile.biography || '';
    if (bioText.length === 0) {
      tips.push('自己紹介文を追加してください。');
    } else if (bioText.length < 150) {
      tips.push('もう少し詳しい自己紹介文を書くと良いでしょう。（150文字以上推奨）');
    }
  }
  
  // 専門分野
  if (sectionDetails.specialties.percentage < 60) {
    const specialties = profile.specialties || [];
    if (specialties.length === 0) {
      tips.push('専門分野を追加してください。');
    } else if (specialties.length < 3) {
      tips.push('もう少し専門分野を追加すると良いでしょう。（少なくとも3つ推奨）');
    }
  }
  
  // 言語
  if (sectionDetails.languages.percentage < 60) {
    const languages = profile.languages || [];
    if (languages.length === 0) {
      tips.push('使用可能な言語を追加してください。');
    } else if (languages.length < 2) {
      tips.push('複数の言語を登録するとより多くのユーザーにアピールできます。');
    }
  }
  
  // 専門知識
  if (sectionDetails.expertise.percentage < 60) {
    const expertise = profile.expertise || [];
    if (expertise.length === 0) {
      tips.push('専門知識やスキルを追加してください。');
    } else {
      const incomplete = expertise.some(exp => !exp.description || exp.description.length < 50);
      if (incomplete) {
        tips.push('専門知識の詳細な説明を加えると良いでしょう。（50文字以上推奨）');
      }
    }
  }
  
  // 体験サンプル
  if (sectionDetails.experienceSamples.percentage < 70) {
    const samples = profile.experienceSamples || [];
    if (samples.length === 0) {
      tips.push('提供可能な体験サンプルを追加してください。');
    } else if (samples.length < 2) {
      tips.push('全ての始まりは、頭の中のアイデアから。もう少し体験サンプルを追加してみましょう。');
    } else {
      const incompleteImages = samples.some(sample => {
        const hasImages = (
          (sample.images && sample.images.length > 0) || 
          sample.imageUrl || 
          (sample.imageUrls && sample.imageUrls.length > 0)
        );
        return !hasImages;
      });
      
      if (incompleteImages) {
        tips.push('体験サンプルに画像を追加すると、より多くの予約を獲得できる可能性が高まります。');
      }
    }
  }
  
  // 利用可能時間
  if (sectionDetails.availability.percentage < 50) {
    const availability = profile.availability || [];
    const availableTimes = profile.availableTimes || [];
    
    if (availability.length === 0 && availableTimes.length === 0) {
      tips.push('利用可能な時間帯を設定してください。');
    } else if (
      (availability.length > 0 && availability.filter(a => a.isAvailable).length < 3) ||
      (availableTimes.length > 0 && availableTimes.filter(a => a.isAvailable).length < 3)
    ) {
      tips.push('利用可能な時間帯を増やすと、より多くのマッチング機会が得られます。');
    }
  }
  
  // プロフィール写真
  if (sectionDetails.profilePhoto.percentage < 100) {
    tips.push('プロフィール写真を追加すると信頼性が高まります。');
  }
  
  // 所在地
  if (sectionDetails.location.percentage < 100) {
    if (typeof profile.location === 'string') {
      if (!profile.location || profile.location.trim().length === 0) {
        tips.push('所在地情報を追加してください。');
      }
    } else if (typeof profile.location === 'object' && profile.location) {
      if (!profile.location.country || !profile.location.region || !profile.location.city) {
        tips.push('所在地情報（国、地域、都市）を完全に入力してください。');
      }
    } else {
      tips.push('所在地情報を追加してください。');
    }
  }
  
  return tips;
};

export default {
  calculateProfileCompletionScore,
  calculateSectionCompletionDetails,
  generateProfileImprovementTips
};
