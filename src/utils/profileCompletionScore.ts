import { AttenderProfile } from '../types/attender/profile';

export const calculateProfileCompletionScore = (profile: AttenderProfile | null): number => {
  if (!profile) return 0;

  const weights = {
    basicInfo: 20, specialties: 15, languages: 10,
    expertise: 15, experiences: 25, availability: 15,
  };

  let score = 0;

  if (profile.name) score += weights.basicInfo * 0.25;
  if (profile.bio && profile.bio.length > 10) score += weights.basicInfo * 0.25;
  if (profile.location) score += weights.basicInfo * 0.2;
  
  const hasProfileImage = profile.profilePhoto || profile.imageUrl;
  if (hasProfileImage) {
    score += weights.basicInfo * 0.2;
  }
  
  if (profile.isLocalResident !== undefined || profile.isMigrant !== undefined) {
    score += weights.basicInfo * 0.1;
  }

  if (profile.specialties && profile.specialties.length > 0) {
    score += weights.specialties * Math.min(profile.specialties.length / 3, 1);
  }

  if (profile.languages && profile.languages.length > 0) {
    score += weights.languages * Math.min(profile.languages.length / 2, 1);
  }

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

  if (profile.experienceSamples && profile.experienceSamples.length > 0) {
    const samplesCount = Math.min(profile.experienceSamples.length / 3, 1);
    
    const samplesCompleteness = profile.experienceSamples.reduce((sum, sample) => {
      let sampleScore = 0;
      
      if (sample.title) sampleScore += 0.15;
      if (sample.description) {
        if (sample.description.length > 50) sampleScore += 0.25;
        else if (sample.description.length > 20) sampleScore += 0.15;
      }
      
      if (sample.category) sampleScore += 0.1;
      if (sample.subcategory) sampleScore += 0.05;
      if (sample.estimatedDuration) sampleScore += 0.1;
      
      if (sample.price && sample.price > 0) sampleScore += 0.1;
      
      if (sample.images) {
        if (sample.images.length >= 3) sampleScore += 0.25;
        else if (sample.images.length > 0) sampleScore += 0.15;
      }
      
      return sum + sampleScore;
    }, 0) / Math.max(1, profile.experienceSamples.length);
    
    score += weights.experiences * (samplesCount * 0.3 + samplesCompleteness * 0.7);
  }

  if (profile.availableTimes && profile.availableTimes.length > 0) {
    const availableSlots = profile.availableTimes.filter(slot => slot.isAvailable).length;
    score += weights.availability * Math.min(availableSlots / 7, 1);
  }

  return Math.round(score);
};

export const generateProfileImprovementTips = (profile: AttenderProfile | null): string[] => {
  if (!profile) return [];
  
  const tips: string[] = [];
  
  if (!profile.name) {
    tips.push('名前を追加してください');
  }
  
  if (!profile.bio || profile.bio.length < 20) {
    tips.push('自己紹介文を充実させてください（20文字以上推奨）');
  }
  
  if (!profile.location) {
    tips.push('活動地域を設定してください');
  }
  
  const hasProfileImage = profile.profilePhoto || profile.imageUrl;
    
  if (!hasProfileImage) {
    tips.push('プロフィール写真をアップロードしてください（予約率が2倍以上高まります）');
  }
  
  if (profile.isLocalResident === undefined && profile.isMigrant === undefined) {
    tips.push('地元居住者か移住者かの情報を設定すると、より適切な体験を提供できます');
  }
  
  if (!profile.specialties || profile.specialties.length === 0) {
    tips.push('専門分野を少なくとも1つ追加してください');
  } else if (profile.specialties.length < 2) {
    tips.push('より多くの専門分野を追加するとマッチング率が上がります');
  }
  
  if (!profile.languages || profile.languages.length === 0) {
    tips.push('使用可能な言語を追加してください');
  }
  
  if (!profile.expertise || profile.expertise.length === 0) {
    tips.push('専門知識・経験を追加してください');
  } else {
    const incompleteExpertise = profile.expertise.some(item => !item.description || !item.yearsOfExperience);
    if (incompleteExpertise) {
      tips.push('専門知識の詳細や経験年数を追加してください');
    }
  }
  
  if (!profile.experienceSamples || profile.experienceSamples.length === 0) {
    tips.push('体験サンプルを少なくとも1つ追加してください');
  } else if (profile.experienceSamples.length < 3) {
    tips.push('3つ以上の体験サンプルを追加すると予約率が大幅に上がります');
  } else {
    let missingImages = 0;
    let shortDescriptions = 0;
    let missingPrices = 0;
    
    profile.experienceSamples.forEach(sample => {
      if (!sample.images || sample.images.length === 0) missingImages++;
      if (!sample.description || sample.description.length < 50) shortDescriptions++;
      if (!sample.price || sample.price <= 0) missingPrices++;
    });
    
    if (missingImages > 0) {
      tips.push(`${missingImages}個の体験サンプルに画像を追加してください（選択率が3倍以上高まります）`);
    }
    
    if (shortDescriptions > 0) {
      tips.push(`${shortDescriptions}個の体験サンプルの説明をより詳しく記載してください（50文字以上推奨）`);
    }
    
    if (missingPrices > 0) {
      tips.push(`${missingPrices}個の体験サンプルに適切な価格を設定してください`);
    }
  }
  
  if (!profile.availableTimes || profile.availableTimes.length === 0) {
    tips.push('利用可能時間を設定してください');
  } else {
    const availableSlots = profile.availableTimes.filter(slot => slot.isAvailable).length;
    
    if (availableSlots === 0) {
      tips.push('少なくとも1つの利用可能な時間枠を設定してください');
    } else if (availableSlots < 5) {
      tips.push('週に5枠以上の利用可能時間を設定すると予約率が大幅に上がります');
    }
    
    const hasWeekendSlots = profile.availableTimes.some(slot => 
      slot.isAvailable && (slot.dayOfWeek === 0 || slot.dayOfWeek === 6)
    );
    
    if (!hasWeekendSlots) {
      tips.push('週末（土曜または日曜）の利用可能時間を設定すると予約が増えます');
    }
    
    const hasEveningSlots = profile.availableTimes.some(slot => {
      if (!slot.isAvailable) return false;
      const startHour = parseInt(slot.startTime.split(':')[0]);
      return startHour >= 17;
    });
    
    if (!hasEveningSlots) {
      tips.push('夕方以降の時間帯も設定すると、日中に仕事がある旅行者も予約しやすくなります');
    }
  }
  
  return tips;
};