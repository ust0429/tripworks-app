// src/mockData.ts
import { Review, Message, Conversation, ReviewHelpful, ReviewPhoto, ReviewReply, MessageStatus, ConversationType } from './types';

// Base64サンプル画像 (モック用)
// 実際の小さなBase64文字列
const sampleBase64Images = [
  'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/4QBaRXhpZgAATU0AKgAAAAgAAgESAAMAAAABAAEAAIdpAAQAAAABAAAAJgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAAGKADAAQAAAABAAAAGAAAAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAYABgDASIAAhEBAxEB/8QAGQAAAwEBAQAAAAAAAAAAAAAAAAQHBQYI/8QAKBAAAgEDAgUDBQAAAAAAAAAAAQIDAAQRBQYhIkFRYRIUoRMjMWKB/8QAFgEBAQEAAAAAAAAAAAAAAAAAAAEC/8QAGBEBAQEBAQAAAAAAAAAAAAAAABEBEgL/2gAMAwEAAhEDEQA/ANhoOl6ZsyyjU9UIkupwQkbkZkbvgnhGvQseGScDM5uHf2tTNJbWEV2tshPqklZUMmDyoBxOMjmPcnA4VPNO/bW0MluJY5JJBOhYscAqvIvTzn+mmNsWkFlZLcMrR3MqCQxkZCZ5lU9cA8fOaiVHakN+9zeXwZb26kZ8ODyAnChfCqMAdMVDXW7dQjRrbwWdkZDghVZpGJ7YGP8APNbpZ4Xfy+tSsSjDcXwcdsGo3c+w55rt7nRvYIz5Z44iQCe5Q8B8AfzU1dCNfXMe4FW+1aG2FqpDBpUcnPXKkcvfBPSvdSFrboS6g6W1ygglMfrDBePcc2Obnz0HXvzWxBNFPC0kLrIrDBZTkfNRsaLW1toOW2gjiz1RQP6K3h8UVEpr//Z',
  'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/4QBaRXhpZgAATU0AKgAAAAgAAgESAAMAAAABAAEAAIdpAAQAAAABAAAAJgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAAGKADAAQAAAABAAAAGAAAAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAYABgDASIAAhEBAxEB/8QAGQAAAgMBAAAAAAAAAAAAAAAAAAUDBAYH/8QAJBAAAgEEAgICAwEAAAAAAAAAAQIDAAQFERIxIUEGFCJRYWL/xAAUAQEAAAAAAAAAAAAAAAAAAAAD/8QAGhEAAwEAAwAAAAAAAAAAAAAAAAECMQMhQf/aAAwDAQACEQMRAD8A6lj/AJJYXOXazx8E5uZFB4qARxB2CxPQ9eP32etVK/kVzlMhHLd3EdrEirFDDCCEVV7Gyd7J/wADpR8tad8HncZcQWK51rcQRzRj8X5EEHsfYJHn1rrxpTZQZCDI4aK5iheONxtJF0Sv770T76PY0etpVqaZWHvRStXEixeFAA0O/wB/uilRZsEuSsrqC4eO3vFeKUjkEJGmI9EeBvzojY86ZYzEZS9d4ILBvpWjcZZAf5nY2ND+9dddD3XUsXi7TGQiO2iVdDW9da/w0UVRJiT+UXVxf2FkktwzIHkmQaUgaC70R56PvZ0PQopUkRRtRv8AeiiimWf/2Q==',
  'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/4QBaRXhpZgAATU0AKgAAAAgAAgESAAMAAAABAAEAAIdpAAQAAAABAAAAJgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAAGKADAAQAAAABAAAAGAAAAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAYABgDASIAAhEBAxEB/8QAGAAAAwEBAAAAAAAAAAAAAAAAAAQFBgP/xAAlEAACAQQBAwQDAAAAAAAAAAABAgMABAUREiExQQYTImEUI1H/xAAWAQEBAQAAAAAAAAAAAAAAAAADAgT/xAAcEQACAgMBAQAAAAAAAAAAAAAAAQIRIQMxQRL/2gAMAwEAAhEDEQA/AOlZjLXOPcJbwrJcOu/aLaIC+D9n6G/GiNVOcNlazI+o7iS5SNlBBYqF4qo7AfQH+k1Iy2MeG3a4TIcLmRvbQoF5Mw8eO3cn6+tVLv0Bj8ngThZ7mFZbf3FWcNyLcgASCO3Xx47d6yW8XFKtXpEnCW6JFjG0Mih42V1I7qwBBrmiVoIrezt1XijcEUHgDyf7RViLMuUVGwNFFWZs8d6p5E9T5H25GCe+w+QI7Hx3+jVMl1JGgXm5AAABPYAdqKKzyNiRzXlzIbhI3ZfbfiwB6MO/X96t+psd+LbyRScw1vxZJANNxPY/0diPqiijE4uqZ//Z',
  'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/4QBaRXhpZgAATU0AKgAAAAgAAgESAAMAAAABAAEAAIdpAAQAAAABAAAAJgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAAGKADAAQAAAABAAAAGAAAAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAYABgDASIAAhEBAxEB/8QAGQAAAgMBAAAAAAAAAAAAAAAAAAUDBAYH/8QAJhAAAgEEAQMDBQAAAAAAAAAAAQIDAAQFERIhMUEGFGETFSJRkf/EABYBAQEBAAAAAAAAAAAAAAAAAAMBAv/EABwRAAICAwEBAAAAAAAAAAAAAAABAhEDEzESQf/aAAwDAQACEQMRAD8A6n6dy2VyFhJLkLS2gdJSg+hwOQGj1BJ7j+D5qRbYW3N/O9zbOgmllkZhkAGIdiQCxUg9ew8eFHal3qOO9Thk4IUtoSEYseigEgE/wED+V8uvTUP3WGe4WB7aKZGaJZCWAMigfkx8aMZ/Q86VEtxe6JU0arFFFU+2/tFFYOdIpXGMcHhZZZoI1XqzSIAB/T4qlJipZLie4iuGtnlbk8aQbQnydtyx/pq'
];

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
    experienceTitle: '下北沢インディーシーン探訪ツアー',
    helpfulCount: 8,
    photoUrls: [
      sampleBase64Images[0],
      sampleBase64Images[1]
    ],
    replyCount: 1
  },
  {
    id: '1002',
    attenderId: 1,
    userId: 'user2',
    userName: 'Emma S.',
    rating: 5,
    comment: '音楽に詳しくなくても楽しめました。アキラさんの知識が豊富で、東京の音楽シーンの歴史から現在のトレンドまで詳しく教えてもらえて勉強になりました。',
    date: '2023-05-20T00:00:00.000Z',
    experienceTitle: 'ミュージシャン体験ワークショップ',
    helpfulCount: 5,
    replyCount: 1
  },
  {
    id: '1003',
    attenderId: 2,
    userId: 'user3',
    userName: 'Kenji M.',
    rating: 4,
    comment: 'ユカリさんのアートツアーで新しい視点を得ることができました。現代アートについて分かりやすく解説していただき、とても勉強になりました。',
    date: '2023-04-10T00:00:00.000Z',
    experienceTitle: '現代アートギャラリーツアー',
    helpfulCount: 3
  },
  {
    id: '1004',
    attenderId: 1,
    userId: 'user4',
    userName: 'Sarah J.',
    rating: 3,
    comment: 'バンドマンのアキラさんと回る音楽ツアーは楽しかったですが、英語でのコミュニケーションに少し苦労しました。それでも東京の音楽シーンについて多くのことを学べました。',
    date: '2023-03-25T00:00:00.000Z',
    experienceTitle: '下北沢インディーシーン探訪ツアー',
    helpfulCount: 2
  },
  {
    id: '1005',
    attenderId: 3,
    userId: 'user5',
    userName: 'Jun T.',
    rating: 5,
    comment: '佐藤さんのクラフトビールツアーは知識が豊富で素晴らしかったです。特に醸造所での説明が詳しく、様々な種類のビールを試飲できて大満足でした。日本のクラフトビール文化への理解が深まりました。',
    date: '2023-06-02T00:00:00.000Z',
    experienceTitle: '醸造所見学と試飲ツアー',
    helpfulCount: 7,
    photoUrls: [
      sampleBase64Images[2]
    ]
  },
  {
    id: '1006',
    attenderId: 1,
    userId: 'user6',
    userName: 'Alex K.',
    rating: 2,
    comment: '期待していたほど楽しめませんでした。スケジュールがタイトで、各場所での滞在時間が短かったです。もう少しゆっくり見たかったです。',
    date: '2023-02-15T00:00:00.000Z',
    experienceTitle: '下北沢インディーシーン探訪ツアー',
    helpfulCount: 4,
    replyCount: 2
  },
  {
    id: '1007',
    attenderId: 2,
    userId: 'user7',
    userName: 'Mei L.',
    rating: 5,
    comment: '山田さんと一緒にアート巡りをしたのは素晴らしい経験でした。彼女の深い知識と情熱は本当に感動的で、アート作品への見方が変わりました。特に若手作家の作品についての解説がとても興味深かったです。',
    date: '2023-05-05T00:00:00.000Z',
    experienceTitle: '現代アートギャラリーツアー',
    helpfulCount: 6,
    photoUrls: [
      sampleBase64Images[3],
      sampleBase64Images[0]
    ]
  }
];

// レビュー写真データ
export const mockReviewPhotos: ReviewPhoto[] = [
  {
    id: 'photo-1001-1',
    reviewId: '1001',
    url: sampleBase64Images[0],
    thumbnail: sampleBase64Images[0],
    width: 24,
    height: 24,
    createdAt: '2023-06-15T12:30:00.000Z'
  },
  {
    id: 'photo-1001-2',
    reviewId: '1001',
    url: sampleBase64Images[1],
    thumbnail: sampleBase64Images[1],
    width: 24,
    height: 24,
    createdAt: '2023-06-15T12:31:00.000Z'
  },
  {
    id: 'photo-1005-1',
    reviewId: '1005',
    url: sampleBase64Images[2],
    thumbnail: sampleBase64Images[2],
    width: 24,
    height: 24,
    createdAt: '2023-06-02T14:20:00.000Z'
  },
  {
    id: 'photo-1007-1',
    reviewId: '1007',
    url: sampleBase64Images[3],
    thumbnail: sampleBase64Images[3],
    width: 24,
    height: 24,
    createdAt: '2023-05-05T09:15:00.000Z'
  },
  {
    id: 'photo-1007-2',
    reviewId: '1007',
    url: sampleBase64Images[0],
    thumbnail: sampleBase64Images[0],
    width: 24,
    height: 24,
    createdAt: '2023-05-05T09:16:00.000Z'
  }
];

// レビューの「役に立った」データ
export const mockReviewHelpful: ReviewHelpful[] = [
  {
    reviewId: '1001',
    userId: 'user2',
    helpful: true,
    createdAt: '2023-06-16T10:30:00.000Z'
  },
  {
    reviewId: '1001',
    userId: 'user3',
    helpful: true,
    createdAt: '2023-06-17T14:20:00.000Z'
  },
  {
    reviewId: '1002',
    userId: 'user1',
    helpful: true,
    createdAt: '2023-05-21T09:15:00.000Z'
  }
];

// モックレビュー返信データ
export const mockReviewReplies: ReviewReply[] = [
  {
    id: 'reply-1001',
    reviewId: '1001',
    userId: 'attender1',
    userName: '鈴木 アキラ',
    userType: 'attender',
    content: 'ご参加いただきありがとうございました！次回東京に来られる際もぜひ別のツアーにもご参加ください。新しいルートも開拓中です。',
    date: '2023-06-16T10:00:00.000Z'
  },
  {
    id: 'reply-1002',
    reviewId: '1002',
    userId: 'attender1',
    userName: '鈴木 アキラ',
    userType: 'attender',
    content: '音楽に詳しくなくても楽しんでいただけて嬉しいです。またのご参加をお待ちしています！',
    date: '2023-05-21T14:30:00.000Z'
  },
  {
    id: 'reply-1006',
    reviewId: '1006',
    userId: 'attender1',
    userName: '鈴木 アキラ',
    userType: 'attender',
    content: 'ご期待に沿えず申し訳ありませんでした。フィードバックを参考に、より余裕のあるスケジュールでのツアーも検討させていただきます。',
    date: '2023-02-16T09:15:00.000Z'
  },
  {
    id: 'reply-1006-admin',
    reviewId: '1006',
    userId: 'admin1',
    userName: 'echo運営スタッフ',
    userType: 'admin',
    content: 'ご不便をおかけして申し訳ありません。アテンダーへのフィードバックとして共有させていただきます。また機会がございましたら、ぜひ別のツアーもお試しください。',
    date: '2023-02-16T11:30:00.000Z'
  }
];

// レビュー関連のユーティリティ関数
export const getReviewsByAttenderId = (attenderId: number | string) => {
  return mockReviews.filter(review => review.attenderId === attenderId);
};

export const getAverageRating = (input: Review[] | number): number => {
  // 引数が数値（attenderId）の場合は、そのアテンダーのレビューを取得して処理
  if (typeof input === 'number') {
    const reviews = getReviewsByAttenderId(input);
    return getAverageRating(reviews);
  }
  
  // 引数がReview[]の場合の処理
  const reviews = input as Review[];
  if (!reviews || reviews.length === 0) return 0;
  const sum = reviews.reduce((acc: number, review: Review) => acc + review.rating, 0);
  return sum / reviews.length;
};

export const sortReviews = (reviews: Review[], sortBy: string = 'date') => {
  return [...reviews].sort((a, b) => {
    if (sortBy === 'date') {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    } else if (sortBy === 'rating_high') {
      return b.rating - a.rating;
    } else if (sortBy === 'rating_low') {
      return a.rating - b.rating;
    } else if (sortBy === 'helpful') {
      return (b.helpfulCount || 0) - (a.helpfulCount || 0);
    }
    return 0;
  });
};

export const filterReviewsByRating = (reviews: Review[], rating: number | null) => {
  if (!rating) return reviews;
  return reviews.filter((review: Review) => review.rating === rating);
};

export const toggleReviewHelpful = (reviewId: string, userId: string, isHelpful: boolean) => {
  // 実際のアプリではAPIリクエストを送信する
  // ここではモックデータを更新
  const existingIndex = mockReviewHelpful.findIndex(
    h => h.reviewId === reviewId && h.userId === userId
  );

  if (existingIndex >= 0) {
    if (isHelpful) {
      // 既に「役に立った」が押されている場合は何もしない
      return false;
    } else {
      // 「役に立った」を取り消す
      mockReviewHelpful.splice(existingIndex, 1);
      return true;
    }
  } else if (isHelpful) {
    // 新しく「役に立った」を追加
    mockReviewHelpful.push({
      reviewId,
      userId,
      helpful: true,
      createdAt: new Date().toISOString()
    });
    return true;
  }

  return false;
};

export const addReview = (review: Partial<Review>, photos?: File[] | string[]) => {
  // File[]型の写真をstring[]型に変換する処理
  let photoUrls: string[] | undefined;
  
  if (photos && photos.length > 0 && photos[0] instanceof File) {
    // ここでFile型をstring型（データURL）に変換
    // 実際の実装では、APIでアップロードした後にURLを取得する
    // モックでは、ファイル名をURLとして扱う
    photoUrls = (photos as File[]).map(
      file => `data:image/jpeg;base64,imagemock_${file.name.replace(/\s+/g, '_')}`
    );
  } else if (photos && photos.length > 0) {
    // 既にstring[]の場合はそのまま使用
    photoUrls = photos as string[];
  }
  
  const newReview = {
    ...review,
    id: `review-${Date.now()}`,
    date: new Date().toISOString(),
    helpfulCount: review.helpfulCount || 0,
    photoUrls: photoUrls,
    attenderId: review.attenderId || 1 // デフォルト値を設定
  } as Review;

  mockReviews.unshift(newReview);
  return newReview;
};

// レビュー関連の関数
// 特定のレビューに対する返信を取得
export const getReviewReplies = (reviewId: string) => {
  return mockReviewReplies.filter(reply => reply.reviewId === reviewId);
};

// レビュー返信を追加
export const addReviewReply = (reply: Partial<ReviewReply>): ReviewReply => {
  const newReply: ReviewReply = {
    id: `reply-${Date.now()}`,
    reviewId: reply.reviewId || '',
    userId: reply.userId || '',
    userName: reply.userName || '',
    userType: reply.userType || 'user',
    content: reply.content || '',
    date: new Date().toISOString(),
    userImage: reply.userImage
  };
  
  mockReviewReplies.push(newReply);
  
  return newReply;
};

// レビュー返信を編集
export const updateReviewReply = (replyId: string, content: string) => {
  const replyIndex = mockReviewReplies.findIndex(reply => reply.id === replyId);
  if (replyIndex === -1) return false;
  
  mockReviewReplies[replyIndex].content = content;
  return true;
};

// レビュー返信を削除
export const deleteReviewReply = (replyId: string) => {
  const replyIndex = mockReviewReplies.findIndex(reply => reply.id === replyId);
  if (replyIndex === -1) return false;
  
  const reviewId = mockReviewReplies[replyIndex].reviewId;
  
  // 返信を削除
  mockReviewReplies.splice(replyIndex, 1);
  
  return true;
};

// メッセージ関連のモックデータ
const mockMessages: Message[] = [];
const mockConversations: Conversation[] = [];

// 会話に追加のプロパティを持つインターフェース
interface ConversationWithLastReadTimestamp extends Conversation {
  lastReadTimestamp?: string;
  createdBy?: string;
}

// メッセージ関連の関数
export const getMessagesByConversationId = (conversationId: string) => {
  return mockMessages.filter(message => message.conversationId === conversationId);
};

export const addMessage = (message: Partial<Message>): Message => {
  const newMessage: Message = {
    id: `message-${Date.now()}`,
    senderId: message.senderId || '',
    receiverId: message.receiverId || '',
    content: message.content || '',
    timestamp: new Date().toISOString(),
    isRead: false,
    status: MessageStatus.SENT,
    attachments: message.attachments,
    attachmentUrl: message.attachmentUrl,
    attachmentType: message.attachmentType,
    conversationId: message.conversationId,
    mentions: message.mentions
  };
  
  mockMessages.push(newMessage);
  return newMessage;
};

export const markConversationAsRead = (conversationId: string, userId: string) => {
  const conversation = mockConversations.find(c => c.id === conversationId) as ConversationWithLastReadTimestamp;
  if (!conversation) return false;
  
  // 会話を既読としてマーク
  conversation.lastReadTimestamp = new Date().toISOString();
  conversation.unreadCount = 0;
  
  return true;
};

export const getActiveConversations = (userId: string = '') => {
  return mockConversations.filter(c => {
    const conv = c as ConversationWithLastReadTimestamp;
    return !conv.isArchived && 
      (conv.participantIds.includes(userId) || conv.createdBy === userId);
  });
};

export const getArchivedConversations = (userId: string = '') => {
  return mockConversations.filter(c => {
    const conv = c as ConversationWithLastReadTimestamp;
    return conv.isArchived && 
      (conv.participantIds.includes(userId) || conv.createdBy === userId);
  });
};

export const archiveConversation = (conversationId: string) => {
  const conversation = mockConversations.find(c => c.id === conversationId);
  if (!conversation) return false;
  
  conversation.isArchived = true;
  return true;
};

export const unarchiveConversation = (conversationId: string) => {
  const conversation = mockConversations.find(c => c.id === conversationId);
  if (!conversation) return false;
  
  conversation.isArchived = false;
  return true;
};

export const muteConversation = (conversationId: string) => {
  const conversation = mockConversations.find(c => c.id === conversationId);
  if (!conversation) return false;
  
  conversation.isMuted = true;
  return true;
};

export const unmuteConversation = (conversationId: string) => {
  const conversation = mockConversations.find(c => c.id === conversationId);
  if (!conversation) return false;
  
  conversation.isMuted = false;
  return true;
};

export const deleteConversation = (conversationId: string) => {
  const index = mockConversations.findIndex(c => c.id === conversationId);
  if (index === -1) return false;
  
  mockConversations.splice(index, 1);
  
  // 関連するメッセージも削除
  const messagesToDelete = mockMessages.filter(m => m.conversationId === conversationId);
  messagesToDelete.forEach(message => {
    const messageIndex = mockMessages.findIndex(m => m.id === message.id);
    if (messageIndex !== -1) {
      mockMessages.splice(messageIndex, 1);
    }
  });
  
  return true;
};
