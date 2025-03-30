/**
 * 共通モックデータ
 */

import { registerMockData } from './mockDataHelper';

// モックユーザー
export const MOCK_USERS = {
  'user_123': {
    id: 'user_123',
    email: 'yamada.taro@example.com',
    name: '山田 太郎',
    profileImage: 'https://randomuser.me/api/portraits/men/32.jpg',
    location: {
      country: 'JP',
      region: 'Tokyo',
      city: 'Shinjuku'
    },
    registrationDate: '2024-02-15T08:30:00Z',
    lastLoginDate: '2025-03-28T15:40:00Z',
    role: 'user'
  },
  'user_456': {
    id: 'user_456',
    email: 'tanaka.hanako@example.com',
    name: '田中 花子',
    profileImage: 'https://randomuser.me/api/portraits/women/44.jpg',
    location: {
      country: 'JP',
      region: 'Osaka',
      city: 'Osaka'
    },
    registrationDate: '2024-03-05T10:15:00Z',
    lastLoginDate: '2025-03-29T12:20:00Z',
    role: 'user'
  },
  'user_789': {
    id: 'user_789',
    email: 'sato.kenta@example.com',
    name: '佐藤 健太',
    profileImage: 'https://randomuser.me/api/portraits/men/67.jpg',
    location: {
      country: 'JP',
      region: 'Kyoto',
      city: 'Kyoto'
    },
    registrationDate: '2023-11-10T08:30:00Z',
    lastLoginDate: '2025-03-28T15:40:00Z',
    role: 'attender'
  },
  'admin_001': {
    id: 'admin_001',
    email: 'admin@example.com',
    name: '管理者',
    profileImage: 'https://randomuser.me/api/portraits/lego/3.jpg',
    location: {
      country: 'JP',
      region: 'Tokyo',
      city: 'Chiyoda'
    },
    registrationDate: '2023-10-01T00:00:00Z',
    lastLoginDate: '2025-03-29T09:10:00Z',
    role: 'admin'
  }
};

// モックアテンダー
export const MOCK_ATTENDERS = {
  'att_123': {
    id: 'att_123',
    userId: 'user_789',
    name: '佐藤 健太',
    profileImage: 'https://randomuser.me/api/portraits/men/67.jpg',
    email: 'sato.kenta@example.com',
    phoneNumber: '090-1111-2222',
    location: {
      country: 'JP',
      region: 'Kyoto',
      city: 'Kyoto'
    },
    biography: '京都の伝統工芸を案内するアテンダーです。15年間陶芸に携わり、様々な工房を訪れてきました。地元のアーティストともつながりがあり、通常は観光客が訪れないような場所もご案内できます。',
    specialties: ['伝統工芸', '陶芸', 'アート'],
    languages: [
      { language: 'ja', proficiency: 'native' },
      { language: 'en', proficiency: 'intermediate' }
    ],
    experiences: ['exp_001', 'exp_002', 'exp_003'],
    averageRating: 4.9,
    reviewCount: 28,
    verificationStatus: 'verified',
    registrationDate: '2023-11-10T08:30:00Z',
    lastActiveDate: '2025-03-28T15:40:00Z',
    status: 'active',
    responseRate: 98,
    responseTime: 25,
    cancellationRate: 0,
    completedExperienceCount: 45,
    earnings: {
      total: 450000,
      lastMonth: 55000
    },
    availableTimes: [
      {
        dayOfWeek: 1,
        startTime: '13:00',
        endTime: '18:00',
        isAvailable: true
      },
      {
        dayOfWeek: 2,
        startTime: '13:00',
        endTime: '18:00',
        isAvailable: true
      },
      {
        dayOfWeek: 3,
        startTime: '13:00',
        endTime: '18:00',
        isAvailable: true
      },
      {
        dayOfWeek: 4,
        startTime: '13:00',
        endTime: '18:00',
        isAvailable: true
      },
      {
        dayOfWeek: 5,
        startTime: '10:00',
        endTime: '18:00',
        isAvailable: true
      },
      {
        dayOfWeek: 6,
        startTime: '10:00',
        endTime: '18:00',
        isAvailable: true
      },
      {
        dayOfWeek: 0,
        startTime: '10:00',
        endTime: '16:00',
        isAvailable: true
      }
    ],
    backgroundCheck: 'passed',
    identityVerified: true,
    isLocalResident: true,
    isMigrant: false,
    expertise: [
      {
        category: '伝統工芸',
        subcategories: ['陶芸'],
        yearsOfExperience: 15,
        description: '京都の伝統工芸に精通しています'
      }
    ],
    socialMediaLinks: {
      instagram: 'https://instagram.com/kenta_pottery',
      twitter: 'https://twitter.com/kenta_kyoto'
    }
  },
  'att_456': {
    id: 'att_456',
    userId: 'user_456',
    name: '田中 花子',
    profileImage: 'https://randomuser.me/api/portraits/women/44.jpg',
    email: 'tanaka.hanako@example.com',
    phoneNumber: '080-2222-3333',
    location: {
      country: 'JP',
      region: 'Osaka',
      city: 'Osaka'
    },
    biography: '大阪で生まれ育ち、地元の食文化に詳しいフードガイドです。特に路地裏の名店や地元の人しか知らない隠れた名店を多数知っています。',
    specialties: ['グルメ', 'ストリートフード', '歴史'],
    languages: [
      { language: 'ja', proficiency: 'native' },
      { language: 'en', proficiency: 'advanced' },
      { language: 'zh', proficiency: 'beginner' }
    ],
    experiences: ['exp_004', 'exp_005'],
    averageRating: 4.7,
    reviewCount: 42,
    verificationStatus: 'verified',
    registrationDate: '2024-01-10T10:15:00Z',
    lastActiveDate: '2025-03-29T12:20:00Z',
    status: 'active',
    responseRate: 95,
    responseTime: 30,
    cancellationRate: 2,
    completedExperienceCount: 63,
    earnings: {
      total: 520000,
      lastMonth: 65000
    },
    availableTimes: [
      {
        dayOfWeek: 1,
        startTime: '17:00',
        endTime: '22:00',
        isAvailable: true
      },
      {
        dayOfWeek: 2,
        startTime: '17:00',
        endTime: '22:00',
        isAvailable: true
      },
      {
        dayOfWeek: 3,
        startTime: '17:00',
        endTime: '22:00',
        isAvailable: true
      },
      {
        dayOfWeek: 4,
        startTime: '17:00',
        endTime: '22:00',
        isAvailable: true
      },
      {
        dayOfWeek: 5,
        startTime: '15:00',
        endTime: '22:00',
        isAvailable: true
      },
      {
        dayOfWeek: 6,
        startTime: '12:00',
        endTime: '22:00',
        isAvailable: true
      },
      {
        dayOfWeek: 0,
        startTime: '12:00',
        endTime: '20:00',
        isAvailable: true
      }
    ],
    backgroundCheck: 'passed',
    identityVerified: true,
    isLocalResident: true,
    isMigrant: false,
    expertise: [
      {
        category: '食文化',
        subcategories: ['大阪グルメ', '屋台料理', 'B級グルメ'],
        yearsOfExperience: 10,
        description: '大阪の食文化に精通しています'
      }
    ],
    socialMediaLinks: {
      instagram: 'https://instagram.com/hanako_food_osaka',
      twitter: 'https://twitter.com/hanako_osaka'
    }
  }
};

// モック体験
export const MOCK_EXPERIENCES = {
  'exp_001': {
    id: 'exp_001',
    attenderId: 'att_123',
    title: '京都の陶芸工房体験',
    description: '京都の伝統的な陶芸を体験できるツアーです。地元の陶芸家の工房を訪れ、実際に作品作りを体験します。初心者でも楽しめる内容となっています。',
    category: 'アクティビティ',
    subcategory: '工芸体験',
    duration: 180,
    price: 12000,
    priceUnit: 'JPY',
    location: {
      country: 'JP',
      region: 'Kyoto',
      city: 'Kyoto',
      address: '京都市東山区清水'
    },
    maxParticipants: 6,
    minParticipants: 1,
    languages: ['ja', 'en'],
    images: [
      'https://images.unsplash.com/photo-1565996489415-24b7286811ed',
      'https://images.unsplash.com/photo-1612543424037-407c575034cb'
    ],
    averageRating: 4.8,
    reviewCount: 15,
    isActive: true,
    createdAt: '2024-01-05T08:00:00Z',
    updatedAt: '2025-02-10T15:30:00Z',
    tags: ['陶芸', '伝統工芸', '制作体験', '京都文化'],
    includedItems: ['材料費', '講師料', 'お茶'],
    excludedItems: ['交通費', '追加素材費'],
    requirements: ['汚れても良い服装'],
    cancellationPolicy: 'moderate'
  },
  'exp_002': {
    id: 'exp_002',
    attenderId: 'att_123',
    title: '京都の隠れた路地裏アート散策',
    description: '観光ガイドブックには載っていない、京都の路地裏に点在するストリートアートやギャラリーを巡るツアーです。地元アーティストの工房訪問も含まれています。',
    category: '文化体験',
    subcategory: 'アート',
    duration: 150,
    price: 8000,
    priceUnit: 'JPY',
    location: {
      country: 'JP',
      region: 'Kyoto',
      city: 'Kyoto',
      address: '京都市中京区'
    },
    maxParticipants: 8,
    minParticipants: 2,
    languages: ['ja', 'en'],
    images: [
      'https://images.unsplash.com/photo-1545569341-9eb8b30979d9',
      'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e'
    ],
    averageRating: 4.9,
    reviewCount: 12,
    isActive: true,
    createdAt: '2024-01-20T10:00:00Z',
    updatedAt: '2025-02-15T11:45:00Z',
    tags: ['アート', '路地裏', '現代アート', '隠れスポット'],
    includedItems: ['ガイド料', 'ギャラリー入場料'],
    excludedItems: ['交通費', '飲食代'],
    requirements: ['歩きやすい靴'],
    cancellationPolicy: 'flexible'
  },
  'exp_003': {
    id: 'exp_003',
    attenderId: 'att_123',
    title: '京都の伝統工芸品を訪ねる旅',
    description: '京都の伝統工芸品を製作する工房を訪ね、職人の技を間近で見学するツアーです。西陣織、京友禅、京指物など、複数の工芸品の制作現場を訪れます。',
    category: '文化体験',
    subcategory: '工芸',
    duration: 240,
    price: 15000,
    priceUnit: 'JPY',
    location: {
      country: 'JP',
      region: 'Kyoto',
      city: 'Kyoto',
      address: '京都市上京区'
    },
    maxParticipants: 6,
    minParticipants: 2,
    languages: ['ja', 'en'],
    images: [
      'https://images.unsplash.com/photo-1527159876135-35a6f9a71c0f',
      'https://images.unsplash.com/photo-1585944673066-48717ff6379f'
    ],
    averageRating: 4.7,
    reviewCount: 8,
    isActive: true,
    createdAt: '2024-02-05T09:30:00Z',
    updatedAt: '2025-03-01T14:20:00Z',
    tags: ['伝統工芸', '西陣織', '京友禅', '職人技'],
    includedItems: ['ガイド料', '工房見学料', 'お茶'],
    excludedItems: ['交通費', '飲食代', 'お土産代'],
    requirements: [],
    cancellationPolicy: 'moderate'
  },
  'exp_004': {
    id: 'exp_004',
    attenderId: 'att_456',
    title: '大阪ストリートフード巡り',
    description: '大阪の名物グルメを食べ歩くツアーです。たこ焼き、お好み焼き、串カツなど、地元の人に人気の店を巡ります。料理の歴史や作り方の解説も行います。',
    category: 'グルメ',
    subcategory: 'フードツアー',
    duration: 180,
    price: 10000,
    priceUnit: 'JPY',
    location: {
      country: 'JP',
      region: 'Osaka',
      city: 'Osaka',
      address: '大阪市中央区道頓堀'
    },
    maxParticipants: 8,
    minParticipants: 2,
    languages: ['ja', 'en', 'zh'],
    images: [
      'https://images.unsplash.com/photo-1630151811402-d53cde8c2833',
      'https://images.unsplash.com/photo-1617196033192-de9c17531a05'
    ],
    averageRating: 4.8,
    reviewCount: 25,
    isActive: true,
    createdAt: '2024-01-15T11:00:00Z',
    updatedAt: '2025-02-20T16:45:00Z',
    tags: ['グルメ', 'ストリートフード', '大阪名物', '食べ歩き'],
    includedItems: ['ガイド料', '5店舗分の食事代'],
    excludedItems: ['追加の飲食代', '交通費'],
    requirements: ['食物アレルギーがある場合は事前にお知らせください'],
    cancellationPolicy: 'moderate'
  },
  'exp_005': {
    id: 'exp_005',
    attenderId: 'att_456',
    title: '大阪の穴場バル巡り',
    description: '観光客には知られていない、地元の人に人気の隠れたバーやビストロを巡るナイトツアーです。',
    category: 'グルメ',
    subcategory: 'バーツアー',
    duration: 240,
    price: 15000,
    priceUnit: 'JPY',
    location: {
      country: 'JP',
      region: 'Osaka',
      city: 'Osaka',
      address: '大阪市北区'
    },
    maxParticipants: 6,
    minParticipants: 2,
    languages: ['ja', 'en'],
    images: [
      'https://images.unsplash.com/photo-1560840067-ddcaeb7831d1',
      'https://images.unsplash.com/photo-1538488881038-e252a119ace7'
    ],
    averageRating: 4.6,
    reviewCount: 14,
    isActive: true,
    createdAt: '2024-02-10T14:30:00Z',
    updatedAt: '2025-02-28T17:15:00Z',
    tags: ['グルメ', 'バー', '穴場', '夜の大阪'],
    includedItems: ['ガイド料', '3店舗分の1ドリンク'],
    excludedItems: ['食事代', '追加ドリンク代', '交通費'],
    requirements: ['20歳以上', '身分証明書'],
    cancellationPolicy: 'strict'
  }
};

// モック予約
export const MOCK_BOOKINGS = {
  'bk_123': {
    id: 'bk_123',
    userId: 'user_123',
    attenderId: 'att_123',
    experienceId: 'exp_001',
    title: '京都の陶芸工房体験',
    description: '京都の伝統的な陶芸を体験できるツアーです。',
    date: '2025-04-15',
    time: '14:00',
    duration: '3時間',
    location: '京都市東山区清水',
    price: 12000,
    participants: 2,
    totalPrice: 24000,
    status: 'confirmed',
    paymentStatus: 'paid',
    notes: '初めての陶芸体験です。よろしくお願いします。',
    createdAt: '2025-03-10T08:30:00Z',
    updatedAt: '2025-03-10T09:15:00Z'
  },
  'bk_124': {
    id: 'bk_124',
    userId: 'user_123',
    attenderId: 'att_456',
    experienceId: 'exp_004',
    title: '大阪ストリートフード巡り',
    description: '大阪の名物グルメを食べ歩くツアーです。',
    date: '2025-04-20',
    time: '18:00',
    duration: '3時間',
    location: '大阪市中央区道頓堀',
    price: 10000,
    participants: 1,
    totalPrice: 10000,
    status: 'pending',
    paymentStatus: 'pending',
    notes: '海鮮アレルギーがあります。',
    createdAt: '2025-03-15T10:30:00Z',
    updatedAt: '2025-03-15T10:30:00Z'
  },
  'bk_125': {
    id: 'bk_125',
    userId: 'user_456',
    attenderId: 'att_123',
    experienceId: 'exp_002',
    title: '京都の隠れた路地裏アート散策',
    description: '京都の路地裏に点在するストリートアートやギャラリーを巡るツアーです。',
    date: '2025-04-18',
    time: '10:00',
    duration: '2時間30分',
    location: '京都市中京区',
    price: 8000,
    participants: 3,
    totalPrice: 24000,
    status: 'cancelled',
    paymentStatus: 'refunded',
    cancelReason: '予定が変更になりました',
    createdAt: '2025-03-05T14:20:00Z',
    updatedAt: '2025-03-12T11:45:00Z'
  },
  'bk_126': {
    id: 'bk_126',
    userId: 'user_123',
    attenderId: 'att_123',
    experienceId: 'exp_003',
    title: '京都の伝統工芸品を訪ねる旅',
    description: '京都の伝統工芸品を製作する工房を訪ねるツアーです。',
    date: '2025-04-25',
    time: '13:00',
    duration: '4時間',
    location: '京都市上京区',
    price: 15000,
    participants: 2,
    totalPrice: 30000,
    status: 'confirmed',
    paymentStatus: 'paid',
    notes: '',
    createdAt: '2025-03-18T09:15:00Z',
    updatedAt: '2025-03-18T16:30:00Z'
  }
};

// モックレビュー
export const MOCK_REVIEWS = {
  'rev_123': {
    id: 'rev_123',
    userId: 'user_123',
    attenderId: 'att_123',
    experienceId: 'exp_001',
    bookingId: 'bk_123',
    rating: 5,
    comment: 'とても素晴らしい体験でした！佐藤さんは知識豊富で、質問にも丁寧に答えてくれました。陶芸の歴史から技術まで学べて、自分の作品も作れて大満足です。',
    photos: [
      'https://images.unsplash.com/photo-1565996489415-24b7286811ed'
    ],
    helpfulCount: 3,
    reportCount: 0,
    createdAt: '2025-04-16T18:30:00Z',
    updatedAt: '2025-04-16T18:30:00Z'
  },
  'rev_124': {
    id: 'rev_124',
    userId: 'user_456',
    attenderId: 'att_123',
    experienceId: 'exp_002',
    bookingId: 'bk_127',
    rating: 4,
    comment: '隠れた路地裏のギャラリーを巡れたのは貴重な経験でした。地元の人しか知らないような場所にも案内してもらえて良かったです。もう少し時間があれば、さらに充実したツアーになったと思います。',
    photos: [],
    helpfulCount: 1,
    reportCount: 0,
    createdAt: '2025-03-20T09:45:00Z',
    updatedAt: '2025-03-20T09:45:00Z'
  },
  'rev_125': {
    id: 'rev_125',
    userId: 'user_123',
    attenderId: 'att_456',
    experienceId: 'exp_004',
    bookingId: 'bk_128',
    rating: 5,
    comment: '大阪の食文化を深く知ることができました！田中さんは各店舗の歴史から調理法まで詳しく、美味しいだけでなく学びの多いツアーでした。特にたこ焼き屋さんでの裏技は目から鱗でした。',
    photos: [
      'https://images.unsplash.com/photo-1617196033192-de9c17531a05',
      'https://images.unsplash.com/photo-1582670509760-0142efdf2564'
    ],
    helpfulCount: 5,
    reportCount: 0,
    createdAt: '2025-03-25T21:10:00Z',
    updatedAt: '2025-03-25T21:10:00Z'
  }
};

// モック会話
export const MOCK_CONVERSATIONS = {
  'conv_123': {
    id: 'conv_123',
    participants: ['user_123', 'user_789'],
    title: '京都の陶芸工房体験について',
    lastMessageId: 'msg_125',
    lastMessageText: '当日は工房の前でお待ちしております。',
    lastMessageTime: '2025-03-12T15:45:00Z',
    unreadCount: {
      'user_123': 1,
      'user_789': 0
    },
    createdAt: '2025-03-08T10:15:00Z',
    updatedAt: '2025-03-12T15:45:00Z'
  },
  'conv_124': {
    id: 'conv_124',
    participants: ['user_123', 'user_456'],
    title: '大阪ストリートフード巡りについて',
    lastMessageId: 'msg_127',
    lastMessageText: 'アレルギーについては対応可能です。ご心配なく。',
    lastMessageTime: '2025-03-16T09:30:00Z',
    unreadCount: {
      'user_123': 0,
      'user_456': 1
    },
    createdAt: '2025-03-15T14:20:00Z',
    updatedAt: '2025-03-16T09:30:00Z'
  }
};

// モックメッセージ
export const MOCK_MESSAGES = {
  'msg_123': {
    id: 'msg_123',
    conversationId: 'conv_123',
    senderId: 'user_123',
    receiverId: 'user_789',
    text: '京都の陶芸工房体験に興味があります。初心者でも大丈夫でしょうか？',
    status: 'read',
    createdAt: '2025-03-08T10:15:00Z'
  },
  'msg_124': {
    id: 'msg_124',
    conversationId: 'conv_123',
    senderId: 'user_789',
    receiverId: 'user_123',
    text: 'もちろん大丈夫です！初めての方向けにしっかりサポートしますので、安心してご参加いただけます。',
    status: 'read',
    createdAt: '2025-03-09T08:30:00Z'
  },
  'msg_125': {
    id: 'msg_125',
    conversationId: 'conv_123',
    senderId: 'user_789',
    receiverId: 'user_123',
    text: '当日は工房の前でお待ちしております。',
    status: 'delivered',
    createdAt: '2025-03-12T15:45:00Z'
  },
  'msg_126': {
    id: 'msg_126',
    conversationId: 'conv_124',
    senderId: 'user_123',
    receiverId: 'user_456',
    text: '大阪ストリートフード巡りに参加したいのですが、海鮮アレルギーがあります。対応可能でしょうか？',
    status: 'read',
    createdAt: '2025-03-15T14:20:00Z'
  },
  'msg_127': {
    id: 'msg_127',
    conversationId: 'conv_124',
    senderId: 'user_456',
    receiverId: 'user_123',
    text: 'アレルギーについては対応可能です。ご心配なく。',
    status: 'delivered',
    createdAt: '2025-03-16T09:30:00Z'
  }
};

/**
 * モックデータの初期化
 */
export function initializeMockData(): void {
  // すべてのモックデータを登録
  registerMockData({
    users: MOCK_USERS,
    attenders: MOCK_ATTENDERS,
    experiences: MOCK_EXPERIENCES,
    bookings: MOCK_BOOKINGS,
    reviews: MOCK_REVIEWS,
    conversations: MOCK_CONVERSATIONS,
    messages: MOCK_MESSAGES
  });
  
  console.info('モックデータが初期化されました');
}

export default {
  MOCK_USERS,
  MOCK_ATTENDERS,
  MOCK_EXPERIENCES,
  MOCK_BOOKINGS,
  MOCK_REVIEWS,
  MOCK_CONVERSATIONS,
  MOCK_MESSAGES,
  initializeMockData
};
