/**
 * ダッシュボード関連の型定義
 */
export interface RequestData {
  id: string;
  experienceId: string;
  experienceTitle: string;
  userId: string;
  userName: string;
  userAvatar: string;
  userImage?: string; // 互換性のため
  date: string;
  numberOfPeople: number;
  specialRequests?: string;
  message?: string; // 互換性のため
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  createdAt: string;
}

export interface BookingData {
  id: string;
  experienceId: string;
  experienceTitle: string;
  userId: string;
  userName: string;
  userAvatar: string;
  userImage?: string; // 互換性のため
  date: string;
  startTime: string;
  endTime: string;
  numberOfPeople: number;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  rating?: number;
  review?: string;
  createdAt: string;
}

export interface TransactionData {
  id: string;
  date: string;
  bookingId: string;
  experienceTitle: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
}

export interface PerformanceMetricsData {
  totalBookings: number;
  upcomingBookings: number;
  pendingRequests: number;
  totalReviews: number;
  averageRating: number;
  monthlyEarnings: number;
  completionRate: number;
  totalExperiences?: number;
  activeExperiences?: number;
}

export interface EarningsData {
  currentMonth: number;
  lastMonth: number;
  total: number;
  transactions: TransactionData[];
}

export interface DashboardData {
  requests: RequestData[];
  upcomingBookings: BookingData[];
  pastBookings: BookingData[];
  metrics: PerformanceMetricsData;
  earnings: EarningsData;
}
