// src/mockData.ts
import { Review } from './types';

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