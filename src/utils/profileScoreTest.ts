import { AttenderProfile } from '../types/attender/profile';
import { calculateProfileCompletionScore, generateProfileImprovementTips } from './profileCompletionScore';

export const createSampleProfile = (
  overrides: Partial<AttenderProfile> = {}
): AttenderProfile => {
  const defaultProfile: AttenderProfile = {
    id: `profile_${Date.now()}`,
    name: 'サンプルアテンダー',
    bio: '簡単な自己紹介です。',
    location: '東京都渋谷区',
    specialties: ['料理', '観光案内'],
    imageUrl: '',
    experienceSamples: [],
    languages: [
      { language: '日本語', proficiency: 'native' },
      { language: '英語', proficiency: 'intermediate' }
    ],
    isLocalResident: true,
    isMigrant: false,
    expertise: [
      {
        category: '料理',
        subcategories: ['和食', '洋食'],
        yearsOfExperience: 5,
        description: '料理教室で指導経験あり'
      }
    ],
    availableTimes: [
      { dayOfWeek: 1, startTime: '09:00', endTime: '17:00', isAvailable: true },
      { dayOfWeek: 2, startTime: '09:00', endTime: '17:00', isAvailable: true },
      { dayOfWeek: 3, startTime: '09:00', endTime: '17:00', isAvailable: true }
    ],
    rating: 4.5,
    reviewCount: 10,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  return { ...defaultProfile, ...overrides };
};

export const analyzeProfileScore = (profile: AttenderProfile): void => {
  const score = calculateProfileCompletionScore(profile);
  const tips = generateProfileImprovementTips(profile);
  
  console.info('プロフィール完成度診断', {
    profileId: profile.id,
    name: profile.name,
    score,
    tipsCount: tips.length
  });
  
  console.info('プロフィール完成度スコア', score);
  
  if (tips.length > 0) {
    console.info('改善ヒント:');
    tips.forEach((tip, index) => {
      console.info(`${index + 1}. ${tip}`);
    });
  } else {
    console.info('完璧なプロフィールです！改善の必要はありません。');
  }
  
  const sections = [
    { name: '基本情報', fields: ['name', 'bio', 'location', 'imageUrl'] },
    { name: '専門分野', fields: ['specialties'] },
    { name: '言語スキル', fields: ['languages'] },
    { name: '専門知識', fields: ['expertise'] },
    { name: '体験サンプル', fields: ['experienceSamples'] },
    { name: '利用可能時間', fields: ['availableTimes'] }
  ];
  
  console.info('セクション別診断:');
  sections.forEach(section => {
    const missingFields = section.fields.filter(field => {
      const value = profile[field as keyof AttenderProfile];
      if (Array.isArray(value)) {
        return value.length === 0;
      }
      return !value;
    });
    
    if (missingFields.length > 0) {
      console.info(`${section.name}: 未完成 (${missingFields.join(', ')}が不足しています)`);
    } else {
      console.info(`${section.name}: 完成済み`);
    }
  });
};

export const simulateProfileImprovements = (profile: AttenderProfile): void => {
  const originalScore = calculateProfileCompletionScore(profile);
  console.info(`元のスコア: ${originalScore}`);
  
  const improvements = [
    {
      name: '基本情報の充実',
      apply: (p: AttenderProfile) => {
        p.bio = 'こんにちは！私は東京で生まれ育ち、10年以上にわたって料理と観光案内を通じて多くの方々と交流してきました。和食と洋食の両方に精通しており、特に伝統的な日本料理については深い知識を持っています。また、東京の隠れた名所や地元民しか知らないスポットもご案内できます。趣味は旅行と料理研究で、常に新しい体験と知識を追求しています。';
        p.imageUrl = 'https://example.com/profile-photo.jpg';
        return p;
      }
    },
    {
      name: 'より多くの専門分野',
      apply: (p: AttenderProfile) => {
        p.specialties = [...(p.specialties || []), '文化体験', 'アート', '伝統工芸'];
        return p;
      }
    },
    {
      name: '言語スキルの追加',
      apply: (p: AttenderProfile) => {
        const currentLangs = p.languages || [];
        p.languages = [
          ...currentLangs,
          { language: '中国語', proficiency: 'beginner' },
          { language: 'フランス語', proficiency: 'beginner' }
        ];
        return p;
      }
    },
    {
      name: '専門知識の拡充',
      apply: (p: AttenderProfile) => {
        const currentExpertise = p.expertise || [];
        p.expertise = [
          ...currentExpertise,
          {
            category: '観光',
            subcategories: ['歴史', '文化', 'ローカル体験'],
            yearsOfExperience: 7,
            description: '東京の歴史と文化に精通しています。特に江戸時代からの変遷や地域ごとの特色に詳しく、観光客には見えない東京の魅力をお伝えします。'
          },
          {
            category: 'アート',
            subcategories: ['現代アート', '伝統工芸'],
            yearsOfExperience: 3,
            description: '現代美術館の元ガイドとして、日本の現代アートシーンに精通しています。また伝統工芸についても学びを深めています。'
          }
        ];
        return p;
      }
    },
    {
      name: '体験サンプルの追加',
      apply: (p: AttenderProfile) => {
        p.experienceSamples = [
          {
            id: `exp_${Date.now()}_1`,
            title: '東京下町食べ歩きツアー',
            description: '下町エリアの名店を巡りながら、江戸時代から続く食文化とその背景にある歴史を学ぶツアーです。地元の人しか知らない隠れた名店や、昔ながらの製法を守る職人の技を間近で見ることができます。',
            category: '料理',
            subcategory: '和食',
            estimatedDuration: 3,
            price: 8000,
            images: ['https://example.com/food-tour-1.jpg', 'https://example.com/food-tour-2.jpg']
          },
          {
            id: `exp_${Date.now()}_2`,
            title: '朝の築地市場と寿司作り体験',
            description: '早朝の築地市場を訪れ、新鮮な魚介類の仕入れ方を学んだ後、プロの寿司職人から基本的な寿司の握り方を教わります。自分で作った寿司を食べながら、日本の食文化についても解説します。',
            category: '料理',
            subcategory: '和食',
            estimatedDuration: 4,
            price: 12000,
            images: ['https://example.com/sushi-1.jpg', 'https://example.com/sushi-2.jpg', 'https://example.com/sushi-3.jpg']
          },
          {
            id: `exp_${Date.now()}_3`,
            title: '浅草寺と周辺の伝統工芸めぐり',
            description: '浅草寺とその周辺には、江戸時代から続く伝統工芸の工房が点在しています。匠の技を間近で見学し、一部は実際に体験できます。日本の伝統文化と職人技の奥深さを体感できるツアーです。',
            category: '文化体験',
            subcategory: '伝統工芸',
            estimatedDuration: 5,
            price: 9000,
            images: ['https://example.com/craft-1.jpg', 'https://example.com/craft-2.jpg']
          }
        ];
        return p;
      }
    },
    {
      name: '利用可能時間の拡充',
      apply: (p: AttenderProfile) => {
        p.availableTimes = [
          { dayOfWeek: 0, startTime: '10:00', endTime: '18:00', isAvailable: true },
          { dayOfWeek: 1, startTime: '09:00', endTime: '17:00', isAvailable: true },
          { dayOfWeek: 2, startTime: '09:00', endTime: '17:00', isAvailable: true },
          { dayOfWeek: 3, startTime: '09:00', endTime: '17:00', isAvailable: true },
          { dayOfWeek: 4, startTime: '09:00', endTime: '17:00', isAvailable: true },
          { dayOfWeek: 5, startTime: '09:00', endTime: '17:00', isAvailable: true },
          { dayOfWeek: 6, startTime: '10:00', endTime: '18:00', isAvailable: true }
        ];
        return p;
      }
    }
  ];
  
  let currentProfile = { ...profile };
  
  for (const improvement of improvements) {
    currentProfile = improvement.apply({ ...currentProfile });
    const newScore = calculateProfileCompletionScore(currentProfile);
    console.info(`${improvement.name} 適用後のスコア: ${newScore} (${newScore - originalScore >= 0 ? '+' : ''}${newScore - originalScore})`);
  }
  
  const finalScore = calculateProfileCompletionScore(currentProfile);
  const finalTips = generateProfileImprovementTips(currentProfile);
  
  console.info(`\n最終スコア: ${finalScore} (${finalScore - originalScore >= 0 ? '+' : ''}${finalScore - originalScore})`);
  if (finalTips.length > 0) {
    console.info('残りの改善ヒント:');
    finalTips.forEach((tip, index) => {
      console.info(`${index + 1}. ${tip}`);
    });
  } else {
    console.info('完璧なプロフィールになりました！');
  }
};

export default {
  createSampleProfile,
  analyzeProfileScore,
  simulateProfileImprovements
};