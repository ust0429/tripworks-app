// src/mockData.ts
import { Review, Message, Conversation } from './types';

// 人気リクエストのサンプルデータ
export const popularRequests = [
  {
    id: 1,
    iconType: 'music',
    title: '地元ミュージシャンのライブ体験',
    description: '観光客が知らない本物の音楽シーンを体験',
  },
  {
    id: 2,
    iconType: 'camera',
    title: '夜の裏路地フォトスポット巡り',
    description: 'インスタ映えする隠れた撮影スポットへ',
  },
  {
    id: 3,
    iconType: 'utensils',
    title: '地元民御用達の食堂めぐり',
    description: 'ガイドブックに載っていない味を堪能',
  },
];

// モックレビューデータ
export const mockReviews: Review[] = [
  {
    id: '1001',
    attenderId: 1,
    userId: 'user1',
    userName: 'Taro Y.',
    rating: 5,
    comment: '鈴木さんのツアーは本当に素晴らしかったです！観光客が絶対に知らないような場所に連れて行ってもらい、地元のミュージシャンとも交流できました。次回東京に来るときも絶対に参加したいです。',
    date: '2023-06-15T00:00:00.000Z',
    experienceTitle: '下北沢インディーシーン探訪ツアー'
  },
  {
    id: '1002',
    attenderId: 1,
    userId: 'user2',
    userName: 'Emma S.',
    rating: 5,
    comment: '音楽に詳しくなくても楽しめました。アキラさんの知識が豊富で、東京の音楽シーンの歴史から現在のトレンドまで詳しく教えてもらえて勉強になりました。',
    date: '2023-05-20T00:00:00.000Z',
    experienceTitle: 'ミュージシャン体験ワークショップ'
  },
  {
    id: '1003',
    attenderId: 2,
    userId: 'user3',
    userName: 'Kenji M.',
    rating: 4,
    comment: 'ユカリさんのアートツアーで新しい視点を得ることができました。現代アートについて分かりやすく解説していただき、とても勉強になりました。',
    date: '2023-04-10T00:00:00.000Z',
    experienceTitle: '現代アートギャラリーツアー'
  }
];

// レビュー関連のユーティリティ関数
export const getReviewsByAttenderId = (attenderId: number): Review[] => {
  return mockReviews.filter(review => review.attenderId === attenderId);
};

export const getAverageRating = (attenderId: number): number => {
  const reviews = getReviewsByAttenderId(attenderId);
  if (reviews.length === 0) return 0;
  
  const sum = reviews.reduce((total, review) => total + review.rating, 0);
  return sum / reviews.length;
};

export const addReview = (review: Omit<Review, 'id' | 'date'>) => {
  const newReview: Review = {
    ...review,
    id: `review-${Date.now()}`,
    date: new Date().toISOString()
  };
  
  // 実際のアプリではここでAPIリクエストを送信
  mockReviews.push(newReview);
  return newReview;
};

// モックメッセージデータ
export const mockMessages: Message[] = [
  {
    id: 'msg1',
    senderId: 'user1',
    receiverId: 'attender1',
    content: 'こんにちは、東京の音楽シーンについて訪ねたいです。',
    timestamp: '2023-07-01T09:00:00.000Z',
    isRead: true
  },
  {
    id: 'msg2',
    senderId: 'attender1',
    receiverId: 'user1',
    content: 'こんにちは！東京の音楽シーンについて訪ねるのは素晴らしいですね。何か特に知りたいジャンルはありますか？',
    timestamp: '2023-07-01T09:05:00.000Z',
    isRead: true
  },
  {
    id: 'msg3',
    senderId: 'user1',
    receiverId: 'attender1',
    content: 'インディーズシーンに興味があります。どのようなライブハウスがおすすめですか？',
    timestamp: '2023-07-01T09:10:00.000Z',
    isRead: true
  },
  {
    id: 'msg4',
    senderId: 'attender1',
    receiverId: 'user1',
    content: '下北沢には「SHIMOKITA ECHO」と「LIVE HAUS」がありますよ！両方とも小さめでインディーズバンドのライブが頻繁にあります。あなたが来る時期に合わせておすすめライブを紹介します。',
    timestamp: '2023-07-01T09:15:00.000Z',
    isRead: true
  },
  {
    id: 'msg5',
    senderId: 'user1',
    receiverId: 'attender1',
    content: 'ありがとうございます！私は7月15日から20日まで東京にいます。この期間のおすすめがあれば教えてください。',
    timestamp: '2023-07-01T09:20:00.000Z',
    isRead: true
  },
  {
    id: 'msg6',
    senderId: 'attender1',
    receiverId: 'user1',
    content: '7月17日に「The Tokyo Locals」というバンドのLIVE HAUSでのライブがあります。彼らは英語の歌詞も多いので外国人にも人気です。それに、下北沢のレコードショップもチェックしてみますか？',
    timestamp: '2023-07-01T09:30:00.000Z',
    isRead: true,
    attachmentUrl: 'https://example.com/images/the-tokyo-locals-flyer.jpg',
    attachmentType: 'image'
  },
  {
    id: 'msg7',
    senderId: 'user1',
    receiverId: 'attender1',
    content: 'それは素晴らしいです！ライブとレコードショップ巡りの両方に興味があります。あなたがガイドしてくれることは可能ですか？',
    timestamp: '2023-07-01T10:00:00.000Z',
    isRead: true
  },
  {
    id: 'msg8',
    senderId: 'attender1',
    receiverId: 'user1',
    content: 'もちろんです！私の「下北沢インディーシーン探訪ツアー」がおすすめです。レコードショップ巡りとライブハウスをご案内します。ただ、このツアーは予約が必要です。いかがでしょうか？',
    timestamp: '2023-07-01T10:05:00.000Z',
    isRead: true
  },
  {
    id: 'msg9',
    senderId: 'user2',
    receiverId: 'attender2',
    content: 'こんにちは、東京のアートギャラリーについて教えていただけませんか？',
    timestamp: '2023-07-02T15:00:00.000Z',
    isRead: true
  },
  {
    id: 'msg10',
    senderId: 'attender2',
    receiverId: 'user2',
    content: 'こんにちは！東京のアートシーンについてお訪ねいただきありがとうございます。何か特定のジャンルや時代に興味がありますか？',
    timestamp: '2023-07-02T15:10:00.000Z',
    isRead: false
  }
];

// モック会話データ
export const mockConversations: Conversation[] = [
  {
    id: 'conv1',
    participantIds: ['user1', 'attender1'],
    lastMessage: mockMessages.find(m => m.id === 'msg8'),
    updatedAt: '2023-07-01T10:05:00.000Z',
    unreadCount: 0,
    isArchived: false,
    isMuted: false
  },
  {
    id: 'conv2',
    participantIds: ['user2', 'attender2'],
    lastMessage: mockMessages.find(m => m.id === 'msg10'),
    updatedAt: '2023-07-02T15:10:00.000Z',
    unreadCount: 1,
    isArchived: false,
    isMuted: false
  },
  {
    id: 'conv3',
    participantIds: ['user1', 'attender3'],
    lastMessage: {
      id: 'msg-archive',
      senderId: 'attender3',
      receiverId: 'user1',
      content: 'お問い合わせありがとうございます。また機会があればよろしくお願いします。',
      timestamp: '2023-06-15T12:30:00.000Z',
      isRead: true
    },
    updatedAt: '2023-06-15T12:30:00.000Z',
    unreadCount: 0,
    isArchived: true,
    isMuted: false
  }
];

// マーケットアイテムのサンプルデータ
export const marketItems = [
  {
    id: 1,
    name: '地元職人の手作り陶器セット',
    price: 8500,
    description: '伝統技術で作られた日常使いの器。シンプルかつ上品なデザイン。',
    attender: '山本 工房主',
    region: '京都',
    iconType: 'hammer'
  },
  {
    id: 2,
    name: '限定醸造クラフトビール6本セット',
    price: 3600,
    description: '地元の食材を使った季節限定の特別醸造ビール。贈り物にも最適。',
    attender: '佐藤 ケンジ',
    region: '横浜',
    iconType: 'coffee'
  },
  {
    id: 3,
    name: '朝市直送の海産物セット',
    price: 5800,
    description: '漁港から直送の新鮮な海産物。アテンダーがセレクトした特選品。',
    attender: '鈴木 漁師',
    region: '福岡',
    iconType: 'utensils'
  },
];

// コミュニティプロジェクトのサンプルデータ
export const communityProjects = [
  {
    id: 1,
    title: '伝統工芸の継承プロジェクト',
    location: '京都市',
    status: '進行中',
    description: '地域の若手職人を支援し、伝統技術を次世代に継承するためのワークショップや展示会を開催します。',
    progress: 65,
    iconType: 'hammer'
  },
  {
    id: 2,
    title: '商店街活性化プロジェクト',
    location: '神戸市',
    status: '計画中',
    description: 'シャッター街となりつつある商店街に若手クリエイターを誘致し、新しい魅力を創出するプロジェクト。',
    progress: 30,
    iconType: 'shopping-bag'
  },
];

// 季節限定イベントのサンプルデータ
export const seasonalEvents = [
  {
    id: 1,
    day: '15',
    title: '早朝の漁港見学と海鮮朝食',
    time: '5:00〜8:00',
    attender: '鈴木 漁師',
    period: '7月限定',
    note: '温かい服装でお越しください',
  },
  {
    id: 2,
    day: '20',
    title: '夏祭り特別ガイドツアー',
    time: '18:00〜21:00',
    attender: '田中 歴史家',
    period: '年に一度',
    note: '浴衣でご参加の方は割引あり',
  },
  {
    id: 3,
    day: '25',
    title: '満月の夜の路地裏散策',
    time: '20:00〜22:00',
    attender: '佐藤 写真家',
    period: '満月限定',
    note: 'カメラ持参推奨',
  },
];

// メッセージ関連のユーティリティ関数
export const getMessagesByConversationId = (conversationId: string): Message[] => {
  const conversation = mockConversations.find(c => c.id === conversationId);
  if (!conversation) return [];
  
  const [user1, user2] = conversation.participantIds;
  return mockMessages.filter(
    message => (
      (message.senderId === user1 && message.receiverId === user2) ||
      (message.senderId === user2 && message.receiverId === user1)
    )
  ).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
};

// アクティブな会話を取得
export const getActiveConversations = (): Conversation[] => {
  return mockConversations.filter(c => !c.isArchived);
};

// アーカイブされた会話を取得
export const getArchivedConversations = (): Conversation[] => {
  return mockConversations.filter(c => c.isArchived);
};

// 会話をアーカイブ
export const archiveConversation = (conversationId: string): boolean => {
  const index = mockConversations.findIndex(c => c.id === conversationId);
  if (index === -1) return false;
  
  mockConversations[index].isArchived = true;
  return true;
};

// 会話のアーカイブを解除
export const unarchiveConversation = (conversationId: string): boolean => {
  const index = mockConversations.findIndex(c => c.id === conversationId);
  if (index === -1) return false;
  
  mockConversations[index].isArchived = false;
  return true;
};

// 会話をミュート
export const muteConversation = (conversationId: string): boolean => {
  const index = mockConversations.findIndex(c => c.id === conversationId);
  if (index === -1) return false;
  
  mockConversations[index].isMuted = true;
  return true;
};

// 会話のミュートを解除
export const unmuteConversation = (conversationId: string): boolean => {
  const index = mockConversations.findIndex(c => c.id === conversationId);
  if (index === -1) return false;
  
  mockConversations[index].isMuted = false;
  return true;
};

// 会話を削除
export const deleteConversation = (conversationId: string): boolean => {
  const index = mockConversations.findIndex(c => c.id === conversationId);
  if (index === -1) return false;
  
  mockConversations.splice(index, 1);
  return true;
};

export const addMessage = (message: Omit<Message, 'id' | 'timestamp' | 'isRead'>) => {
  const newMessage: Message = {
    ...message,
    id: `msg-${Date.now()}`,
    timestamp: new Date().toISOString(),
    isRead: false
  };
  
  mockMessages.push(newMessage);
  
  // 会話の更新
  const conversationId = mockConversations.find(
    c => c.participantIds.includes(message.senderId) && c.participantIds.includes(message.receiverId)
  )?.id;
  
  if (conversationId) {
    const conversation = mockConversations.find(c => c.id === conversationId);
    if (conversation) {
      conversation.lastMessage = newMessage;
      conversation.updatedAt = newMessage.timestamp;
      if (message.receiverId === conversation.participantIds[0] || 
          message.receiverId === conversation.participantIds[1]) {
        conversation.unreadCount += 1;
      }
    }
  } else {
    // 新しい会話を作成
    const newConversation: Conversation = {
      id: `conv-${Date.now()}`,
      participantIds: [message.senderId, message.receiverId],
      lastMessage: newMessage,
      updatedAt: newMessage.timestamp,
      unreadCount: 1,
      isArchived: false,
      isMuted: false
    };
    
    mockConversations.push(newConversation);
  }
  
  return newMessage;
};

export const markConversationAsRead = (conversationId: string, userId: string) => {
  const conversation = mockConversations.find(c => c.id === conversationId);
  if (conversation && conversation.participantIds.includes(userId)) {
    conversation.unreadCount = 0;
    
    // この会話の未読メッセージを既読にする
    const messages = getMessagesByConversationId(conversationId);
    messages.forEach(message => {
      if (message.receiverId === userId && !message.isRead) {
        const index = mockMessages.findIndex(m => m.id === message.id);
        if (index !== -1) {
          mockMessages[index].isRead = true;
        }
      }
    });
    
    return true;
  }
  
  return false;
};