import axios from '../mocks/axiosMock';
import { Review, ReviewSummary } from '../types/review';
import { UUID } from '../types/attender';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api';

// モック関数を使用するかのフラグ
const USE_MOCK = process.env.NODE_ENV === 'development';

/**
 * アテンダーのレビュー一覧を取得
 */
export const getAttenderReviews = async (attenderId: UUID): Promise<Review[]> => {
  if (USE_MOCK) {
    return mockGetAttenderReviews(attenderId);
  }
  
  const response = await axios.get(`${API_BASE_URL}/attenders/${attenderId}/reviews`);
  return response.data;
};

/**
 * アテンダーのレビュー統計を取得
 */
export const getReviewSummary = async (attenderId: UUID): Promise<ReviewSummary> => {
  if (USE_MOCK) {
    return mockGetReviewSummary(attenderId);
  }
  
  const response = await axios.get(`${API_BASE_URL}/attenders/${attenderId}/reviews/summary`);
  return response.data;
};

/**
 * レビューに返信
 */
export const submitReply = async (reviewId: string, replyText: string): Promise<Review> => {
  if (USE_MOCK) {
    return mockSubmitReply(reviewId, replyText);
  }
  
  const response = await axios.post(`${API_BASE_URL}/reviews/${reviewId}/reply`, { text: replyText });
  return response.data;
};

/**
 * 体験のレビュー一覧を取得
 */
export const getExperienceReviews = async (experienceId: string): Promise<Review[]> => {
  if (USE_MOCK) {
    return mockGetExperienceReviews(experienceId);
  }
  
  const response = await axios.get(`${API_BASE_URL}/experiences/${experienceId}/reviews`);
  return response.data;
};

/**
 * レビュー投稿
 */
export const submitReview = async (reviewData: {
  experienceId: string;
  reservationId: string;
  rating: number;
  comment: string;
  photos?: string[];
  isAnonymous?: boolean;
}): Promise<Review> => {
  if (USE_MOCK) {
    return mockSubmitReview(reviewData.reservationId, {
      rating: reviewData.rating,
      text: reviewData.comment,
      // ファイルの代わりに文字列のURLを使用
      photos: reviewData.photos ? [] : undefined
    });
  }
  
  // 画像を含む場合はFormDataを使用
  const formData = new FormData();
  formData.append('rating', reviewData.rating.toString());
  formData.append('text', reviewData.comment);
  
  if (reviewData.photos && reviewData.photos.length > 0) {
    reviewData.photos.forEach((photoUrl, index) => {
      formData.append(`photoUrls[${index}]`, photoUrl);
    });
  }
  
  if (reviewData.isAnonymous) {
    formData.append('isAnonymous', 'true');
  }
  
  const response = await axios.post(
    `${API_BASE_URL}/experiences/${reviewData.experienceId}/reviews`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }
  );
  
  return response.data;
};

// モック実装
function mockGetAttenderReviews(attenderId: UUID): Promise<Review[]> {
  // 現在の日時
  const now = new Date();
  
  // 過去の日付を生成するヘルパー関数
  const daysAgo = (days: number) => {
    const date = new Date(now);
    date.setDate(date.getDate() - days);
    return date.toISOString();
  };
  
  const mockReviews: Review[] = [
    {
      id: 'rev-001',
      experienceId: 'exp-101',
      experienceTitle: '路地裏アート探検',
      bookingId: 'book-101',
      userId: 'user-001',
      userName: '田中 優子',
      userImage: '',
      attenderId,
      rating: 5.0,
      text: '素晴らしい体験でした！アテンダーの案内で、普段は絶対に見つけられないような隠れた芸術作品を発見できました。地元の人からしか聞けないようなストーリーも聞けて、とても充実した時間を過ごせました。また参加したいです！',
      photos: [
        { id: 'photo-001', url: 'https://example.com/photo1.jpg' },
        { id: 'photo-002', url: 'https://example.com/photo2.jpg' }
      ],
      attenderReply: {
        id: 'reply-001',
        text: '田中様、素敵なレビューをありがとうございます！路地裏アート探検を楽しんでいただけて嬉しいです。また新しい作品が増えた時にぜひいらしてください。次回もお待ちしております！',
        createdAt: daysAgo(12)
      },
      createdAt: daysAgo(14)
    },
    {
      id: 'rev-002',
      experienceId: 'exp-102',
      experienceTitle: '地元職人と巡る伝統工芸ツアー',
      bookingId: 'book-102',
      userId: 'user-002',
      userName: '佐藤 健太',
      userImage: '',
      attenderId,
      rating: 4.5,
      text: '職人さんの技術を間近で見られて感動しました。伝統工芸の奥深さを知ることができて、とても勉強になりました。ただ、時間が少し長く感じたので、もう少しコンパクトだと良いかもしれません。でも総合的には大変満足しています！',
      photos: [],
      attenderReply: {
        id: 'reply-002',
        text: '佐藤様、ご参加とレビューをありがとうございます。職人の技を感じていただけて嬉しいです。時間配分については貴重なご意見として、今後のツアー改善に活かしてまいります。またのお越しをお待ちしております。',
        createdAt: daysAgo(5)
      },
      createdAt: daysAgo(7)
    },
    {
      id: 'rev-003',
      experienceId: 'exp-103',
      experienceTitle: '夜の屋台グルメツアー',
      bookingId: 'book-103',
      userId: 'user-003',
      userName: '伊藤 雄太',
      userImage: '',
      attenderId,
      rating: 3.0,
      text: '地元の屋台を巡るというコンセプトは良かったのですが、訪れた場所が混雑していてあまり楽しめませんでした。もう少し穴場的な場所に連れて行ってほしかったです。料理自体は美味しかったです。',
      photos: [
        { id: 'photo-003', url: 'https://example.com/photo3.jpg' }
      ],
      attenderReply: null,
      createdAt: daysAgo(2)
    },
    {
      id: 'rev-004',
      experienceId: 'exp-101',
      experienceTitle: '路地裏アート探検',
      bookingId: 'book-104',
      userId: 'user-004',
      userName: '山田 花子',
      userImage: '',
      attenderId,
      rating: 5.0,
      text: 'アテンダーさんの知識が豊富で、各作品の背景やアーティストについて詳しく教えてもらえました。普段は気づかないような場所にもアートがあって新鮮でした。写真スポットも教えてもらえて最高の思い出ができました！',
      photos: [
        { id: 'photo-004', url: 'https://example.com/photo4.jpg' },
        { id: 'photo-005', url: 'https://example.com/photo5.jpg' },
        { id: 'photo-006', url: 'https://example.com/photo6.jpg' }
      ],
      attenderReply: {
        id: 'reply-004',
        text: '山田様、素敵なレビューをありがとうございます！アート作品の魅力をお伝えできて本当に嬉しいです。素敵な写真もたくさん撮れたようで何よりです。また新しい作品が増えたら、ぜひ遊びにいらしてください！',
        createdAt: daysAgo(1)
      },
      createdAt: daysAgo(3)
    },
    {
      id: 'rev-005',
      experienceId: 'exp-102',
      experienceTitle: '地元職人と巡る伝統工芸ツアー',
      bookingId: 'book-105',
      userId: 'user-005',
      userName: '鈴木 一郎',
      userImage: '',
      attenderId,
      rating: 4.0,
      text: '伝統工芸に興味があって参加しました。職人さんの技術を直接見られたのは貴重な体験でした。ただ、もう少し質問できる時間があるとより良かったです。総じて満足できる内容でした。',
      photos: [],
      attenderReply: null,
      createdAt: daysAgo(5)
    }
  ];
  
  return Promise.resolve(mockReviews);
}

function mockGetReviewSummary(attenderId: UUID): Promise<ReviewSummary> {
  // レビューデータから統計を計算
  const reviews = mockGetAttenderReviews(attenderId);
  
  return reviews.then(reviewsData => {
    const totalReviews = reviewsData.length;
    const totalRating = reviewsData.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalReviews > 0 ? totalRating / totalReviews : 0;
    
    // 評価ごとの件数
    const ratingCounts: Record<number, number> = {};
    reviewsData.forEach(review => {
      const roundedRating = Math.round(review.rating);
      ratingCounts[roundedRating] = (ratingCounts[roundedRating] || 0) + 1;
    });
    
    // 返信済みレビュー数
    const repliedReviews = reviewsData.filter(review => review.attenderReply !== null).length;
    
    // 写真付きレビュー数
    const reviewsWithPhotos = reviewsData.filter(review => 
      review.photos && review.photos.length > 0
    ).length;
    
    // 最新レビュー日
    const latestReview = reviewsData.reduce((latest, review) => {
      return new Date(review.createdAt) > new Date(latest.createdAt) ? review : latest;
    }, reviewsData[0]);
    
    // 返信時間の計算（モック用にランダム）
    const averageReplyTime = Math.floor(Math.random() * 48) + 2; // 2〜50時間
    
    const summary: ReviewSummary = {
      attenderId,
      totalReviews,
      averageRating,
      ratingCounts,
      repliedReviews,
      reviewsWithPhotos,
      latestReviewDate: latestReview?.createdAt || new Date().toISOString(),
      averageReplyTime
    };
    
    return summary;
  });
}

function mockSubmitReply(reviewId: string, replyText: string): Promise<Review> {
  // ダミーの返信処理
  return mockGetAttenderReviews('dummy-id').then(reviews => {
    const review = reviews.find(r => r.id === reviewId);
    
    if (!review) {
      throw new Error('Review not found');
    }
    
    const updatedReview = {
      ...review,
      attenderReply: {
        id: `reply-${Date.now()}`,
        text: replyText,
        createdAt: new Date().toISOString()
      }
    };
    
    return updatedReview;
  });
}

function mockGetExperienceReviews(experienceId: string): Promise<Review[]> {
  return mockGetAttenderReviews('dummy-id').then(reviews => {
    return reviews.filter(review => review.experienceId === experienceId);
  });
}

function mockSubmitReview(
  bookingId: string,
  reviewData: {
    rating: number;
    text: string;
    photos?: any[];
  }
): Promise<Review> {
  // ダミーの投稿処理
  const mockPhotos = reviewData.photos 
    ? Array.from({ length: reviewData.photos.length }).map((_, idx) => ({
        id: `photo-new-${idx}`,
        url: `https://example.com/mock-photo-${idx}.jpg`
      }))
    : [];
    
  const mockReview: Review = {
    id: `rev-new-${Date.now()}`,
    experienceId: 'exp-101',
    experienceTitle: '路地裏アート探検',
    bookingId,
    userId: 'user-current',
    userName: '現在のユーザー',
    userImage: '',
    attenderId: 'attender-101',
    rating: reviewData.rating,
    text: reviewData.text,
    photos: mockPhotos,
    attenderReply: null,
    createdAt: new Date().toISOString()
  };
  
  return Promise.resolve(mockReview);
}
