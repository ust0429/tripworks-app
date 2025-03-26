import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from '../../../mocks/i18nMock';
import { useApiClient } from '../../../hooks/useApiClient';
import { DashboardData, PerformanceMetricsData } from '../../../types/dashboard';
import {
  Box,
  Typography,
  Grid,
  Tab,
  Tabs,
  CircularProgress,
  Alert,
  Button
} from '../../../mocks/materialMock';
import { Add as AddIcon } from '../../../mocks/iconsMock';
import RequestsList from './RequestsList';
import UpcomingBookings from './UpcomingBookings';
import PastBookings from './PastBookings';
import PerformanceMetrics from './PerformanceMetrics';
import EarningsReport from './EarningsReport';

// ダッシュボードタブの定義
enum DashboardTab {
  REQUESTS = 0,
  UPCOMING = 1,
  PAST = 2,
  METRICS = 3,
  EARNINGS = 4,
}

// アテンダーダッシュボードのコンポーネント
const AttenderDashboard: React.FC = () => {
  // アテンダーIDを取得（実際にはルートパラメータやユーザー認証情報から取得）
  const { id: attenderId = '12345' } = useParams<{id?: string}>();
  const { t } = useTranslation(['attender', 'common']);
  const apiClient = useApiClient();
  const [tabValue, setTabValue] = useState(0);
  const [showExperienceForm, setShowExperienceForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // モックデータ
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    requests: [],
    upcomingBookings: [],
    pastBookings: [],
    metrics: {
      totalBookings: 0,
      upcomingBookings: 0,
      pendingRequests: 0,
      completionRate: 0,
      averageRating: 0,
      monthlyEarnings: 0,
      totalReviews: 0,
      totalExperiences: 0,
      activeExperiences: 0
    },
    earnings: {
      currentMonth: 0,
      lastMonth: 0,
      total: 0,
      transactions: []
    }
  });
  
  // データ取得
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // 本番環境では実際のAPIエンドポイントを使用
        // const response = await apiClient.get(`/attender/${attenderId}/dashboard`);
        // setDashboardData(response.data);
        
        // モックデータ (開発用)
        setTimeout(() => {
          setDashboardData({
            requests: [
              {
                id: 'req1',
                experienceId: 'exp1',
                experienceTitle: '下町散策ツアー',
                userId: 'user1',
                userName: '山田太郎',
                userAvatar: 'https://randomuser.me/api/portraits/men/1.jpg',
                date: new Date(Date.now() + 86400000 * 3).toISOString(),
                numberOfPeople: 2,
                specialRequests: '駅で待ち合わせをお願いします。',
                status: 'pending',
                createdAt: new Date(Date.now() - 3600000).toISOString()
              }
            ],
            upcomingBookings: [
              {
                id: 'book1',
                experienceId: 'exp1',
                experienceTitle: '下町散策ツアー',
                userId: 'user2',
                userName: '佐藤花子',
                userAvatar: 'https://randomuser.me/api/portraits/women/1.jpg',
                date: new Date(Date.now() + 86400000 * 7).toISOString(),
                startTime: '10:00',
                endTime: '13:00',
                numberOfPeople: 3,
                totalAmount: 15000,
                status: 'confirmed',
                createdAt: new Date(Date.now() - 86400000).toISOString()
              }
            ],
            pastBookings: [
              {
                id: 'book2',
                experienceId: 'exp2',
                experienceTitle: '寺町ウォーキングツアー',
                userId: 'user3',
                userName: '鈴木一郎',
                userAvatar: 'https://randomuser.me/api/portraits/men/2.jpg',
                date: new Date(Date.now() - 86400000 * 14).toISOString(),
                startTime: '13:00',
                endTime: '16:00',
                numberOfPeople: 2,
                totalAmount: 10000,
                rating: 4.5,
                review: 'とても興味深い体験でした。また参加したいです。',
                status: 'completed',
                createdAt: new Date(Date.now() - 86400000 * 20).toISOString()
              }
            ],
            metrics: {
              totalBookings: 12,
              upcomingBookings: 5,
              pendingRequests: 3,
              completionRate: 92,
              averageRating: 4.7,
              monthlyEarnings: 50000,
              totalReviews: 10,
              totalExperiences: 8,
              activeExperiences: 6
            },
            earnings: {
              currentMonth: 30000,
              lastMonth: 45000,
              total: 120000,
              transactions: [
                {
                  id: 'trans1',
                  date: new Date(Date.now() - 86400000 * 3).toISOString(),
                  bookingId: 'book3',
                  experienceTitle: '古民家カフェ巡り',
                  amount: 8000,
                  status: 'completed'
                },
                {
                  id: 'trans2',
                  date: new Date(Date.now() - 86400000 * 10).toISOString(),
                  bookingId: 'book4',
                  experienceTitle: '伝統工芸体験ツアー',
                  amount: 12000,
                  status: 'completed'
                }
              ]
            }
          });
          setLoading(false);
        }, 1000);
      } catch (err) {
        console.error('ダッシュボードデータ取得エラー:', err);
        setError('データの取得に失敗しました。');
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [attenderId]);
  
  // タブ変更ハンドラ
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  // リクエスト承認ハンドラ
  const handleAcceptRequest = async (requestId: string) => {
    console.log('リクエスト承認:', requestId);
    // 実際のAPI呼び出しとデータ更新を実装
  };
  
  // リクエスト拒否ハンドラ
  const handleDeclineRequest = async (requestId: string) => {
    console.log('リクエスト拒否:', requestId);
    // 実際のAPI呼び出しとデータ更新を実装
  };
  
  // ローディング表示
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }
  
  // エラー表示
  if (error) {
    return (
      <Alert severity="error">
        {error}
      </Alert>
    );
  }
  
  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">アテンダーダッシュボード</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => setShowExperienceForm(true)}
        >
          新しい体験を作成
        </Button>
      </Box>
      
      <Grid container spacing={4}>
        {/* メトリクスサマリー */}
        <Grid item xs={12}>
          <PerformanceMetrics metrics={dashboardData.metrics} />
        </Grid>
        
        {/* ダッシュボードメインコンテンツ */}
        <Grid item xs={12}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleTabChange} aria-label="dashboard tabs">
              <Tab label={`リクエスト (${dashboardData.requests.length})`} />
              <Tab label={`予定の体験 (${dashboardData.upcomingBookings.length})`} />
              <Tab label={`過去の体験 (${dashboardData.pastBookings.length})`} />
              <Tab label="パフォーマンス" />
              <Tab label="収益管理" />
            </Tabs>
          </Box>
          
          {/* リクエストタブ */}
          {tabValue === DashboardTab.REQUESTS && (
            <Box py={2}>
              <RequestsList
                requests={dashboardData.requests}
                onAccept={handleAcceptRequest}
                onDecline={handleDeclineRequest}
              />
            </Box>
          )}
          
          {/* 予定の体験タブ */}
          {tabValue === DashboardTab.UPCOMING && (
            <Box py={2}>
              <UpcomingBookings bookings={dashboardData.upcomingBookings} />
            </Box>
          )}
          
          {/* 過去の体験タブ */}
          {tabValue === DashboardTab.PAST && (
            <Box py={2}>
              <PastBookings bookings={dashboardData.pastBookings} />
            </Box>
          )}
          
          {/* パフォーマンスタブ */}
          {tabValue === DashboardTab.METRICS && (
            <Box py={2}>
              <Typography variant="h6" gutterBottom>詳細パフォーマンス分析</Typography>
              {/* 詳細なパフォーマンス分析コンポーネント */}
            </Box>
          )}
          
          {/* 収益管理タブ */}
          {tabValue === DashboardTab.EARNINGS && (
            <Box py={2}>
              <EarningsReport attenderId={attenderId} />
            </Box>
          )}
        </Grid>
      </Grid>
      
      {/* 新しい体験作成フォームモーダル */}
      {showExperienceForm && (
        <Box>
          {/* ExperienceForm コンポーネント */}
          <Button onClick={() => setShowExperienceForm(false)}>閉じる</Button>
        </Box>
      )}
    </Box>
  );
};

export default AttenderDashboard;
