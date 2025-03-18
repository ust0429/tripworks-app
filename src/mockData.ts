// src/mockData.ts
import { Review, Message, Conversation, ReviewHelpful, ReviewPhoto } from './types';

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
    ]
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
    helpfulCount: 5
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
    helpfulCount: 4
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



export const addReview = (review: Omit<Review, 'id' | 'date'>, photos?: File[]) => {
  // 新しいレビューIDを生成
  const newReviewId = `review-${Date.now()}`;
  
  const newReview: Review = {
    ...review,
    id: newReviewId,
    date: new Date().toISOString(),
    helpfulCount: 0
  };
  
  console.log('レビュー投稿 - 写真データの確認:', { 
    reviewId: newReviewId,
    hasPhotos: Boolean(photos),
    photoCount: photos ? photos.length : 0,
    photoDetails: photos ? photos.map(p => ({ name: p.name, type: p.type, size: p.size })) : []
  });
  
  // 写真がある場合の処理（Base64サンプル画像を使用）
  if (photos && photos.length > 0) {
    // 実際のアプリではここでFile objectsをアップロードサーバーに送信
    // モックではランダムにサンプル画像を割り当て
    const photoUrls = photos.map(photo => {
      // 各写真に対してランダムなサンプル画像を割り当て
      const randomIndex = Math.floor(Math.random() * sampleBase64Images.length);
      console.log(`写真 ${photo.name} に対して ${randomIndex} のサンプル画像を使用`);
      return sampleBase64Images[randomIndex];
    });
    
    // 写真URLを追加
    newReview.photoUrls = photoUrls;
    console.log('レビューに追加された写真URL:', photoUrls.length, '枚');
    
    // モックの写真データをmockReviewPhotosに追加
    photos.forEach((photo, index) => {
      const photoId = `photo-${Date.now()}-${index}`;
      mockReviewPhotos.push({
        id: photoId,
        reviewId: newReviewId,
        url: photoUrls[index],
        thumbnail: photoUrls[index],
        width: 24,
        height: 24,
        createdAt: new Date().toISOString()
      });
      console.log(`写真データ追加: ${photoId} (${photo.name})`);
    });
  }
  
  // 実際のアプリではここでAPIリクエストを送信
  mockReviews.push(newReview);
  
  // レビュー送信成功率のシミュレーション (95%成功)
  const isSuccess = Math.random() < 0.95;
  
  if (!isSuccess) {
    throw new Error('レビューの投稿に失敗しました。ネットワーク接続を確認してください。');
  }
  
  return newReview;
};

// ソート関数
export const sortReviews = (reviews: Review[], sortType: 'newest' | 'highest' | 'lowest' | 'most_helpful'): Review[] => {
  switch (sortType) {
    case 'newest':
      return [...reviews].sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
    case 'highest':
      return [...reviews].sort((a, b) => b.rating - a.rating);
    case 'lowest':
      return [...reviews].sort((a, b) => a.rating - b.rating);
    case 'most_helpful':
      return [...reviews].sort((a, b) => (b.helpfulCount || 0) - (a.helpfulCount || 0));
    default:
      return reviews;
  }
};

// フィルター関数
export const filterReviewsByRating = (reviews: Review[], rating: number | null): Review[] => {
  if (rating === null) return reviews;
  return reviews.filter(review => review.rating === rating);
};

// テキスト検索関数
export const searchReviews = (reviews: Review[], searchTerm: string): Review[] => {
  if (!searchTerm) return reviews;
  
  const lowerSearchTerm = searchTerm.toLowerCase();
  return reviews.filter(review => 
    review.comment.toLowerCase().includes(lowerSearchTerm) ||
    review.userName.toLowerCase().includes(lowerSearchTerm) ||
    (review.experienceTitle && review.experienceTitle.toLowerCase().includes(lowerSearchTerm))
  );
};

// 特定のアテンダーの特定の体験に関するレビューを取得
export const getReviewsByExperience = (attenderId: number, experienceTitle: string): Review[] => {
  return mockReviews.filter(review => 
    review.attenderId === attenderId && 
    review.experienceTitle === experienceTitle
  );
};

// レビューの「役に立った」状態を切り替える
export const toggleReviewHelpful = (reviewId: string, userId: string, helpful: boolean): boolean => {
  // 既存の「役に立った」記録を確認
  const existingIndex = mockReviewHelpful.findIndex(
    item => item.reviewId === reviewId && item.userId === userId
  );
  
  // 既存の記録がある場合は更新
  if (existingIndex >= 0) {
    mockReviewHelpful[existingIndex].helpful = helpful;
  } else {
    // 新しい記録を追加
    mockReviewHelpful.push({
      reviewId,
      userId,
      helpful,
      createdAt: new Date().toISOString()
    });
  }
  
  // レビューの「役に立った」カウントを更新
  updateReviewHelpfulCount(reviewId);
  
  return true;
};

// レビューの「役に立った」カウントを更新
const updateReviewHelpfulCount = (reviewId: string): void => {
  const helpfulCount = mockReviewHelpful.filter(
    item => item.reviewId === reviewId && item.helpful
  ).length;
  
  const reviewIndex = mockReviews.findIndex(review => review.id === reviewId);
  if (reviewIndex >= 0) {
    mockReviews[reviewIndex].helpfulCount = helpfulCount;
  }
};

// レビューを報告する
export const reportReview = (reviewId: string, userId: string, reason: string): boolean => {
  // 実際のアプリではここでAPIリクエストを送信
  console.log(`レビュー報告: reviewId=${reviewId}, userId=${userId}, reason=${reason}`);
  
  // 成功を返す
  return true;
};

// レビュー写真を取得
export const getReviewPhotos = (reviewId: string): ReviewPhoto[] => {
  return mockReviewPhotos.filter(photo => photo.reviewId === reviewId);
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

// メッセージ関連の関数
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