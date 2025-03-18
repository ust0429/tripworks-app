// src/mockData.ts
import { Review, Message, Conversation } from './types';

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
    unreadCount: 0
  },
  {
    id: 'conv2',
    participantIds: ['user2', 'attender2'],
    lastMessage: mockMessages.find(m => m.id === 'msg10'),
    updatedAt: '2023-07-02T15:10:00.000Z',
    unreadCount: 1
  }
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
      unreadCount: 1
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