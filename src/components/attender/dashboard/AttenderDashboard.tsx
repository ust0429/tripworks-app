import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
// モックライブラリをインポート
import { useTranslation } from '../../../mocks/i18nMock';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Tab,
  Tabs,
  CircularProgress,
  Alert,
  Button
} from '../../../mocks/materialMock';
import { Add as AddIcon } from '../../../mocks/iconsMock';
import { useApiClient } from '../../../hooks/useApiClient';
import PerformanceMetrics from './PerformanceMetrics';
import RequestsList from './RequestsList';
import UpcomingBookings from './UpcomingBookings';
import PastBookings from './PastBookings';
import ScheduleManagement from '../schedule/ScheduleManagement';
import { ReviewDashboard } from '../reviews';
import { ExperienceList } from '../experience';
import EarningsReport from './EarningsReport'; // 後で作成するコンポーネント

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index, ...other }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`dashboard-tabpanel-${index}`}
      aria-labelledby={`dashboard-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

const a11yProps = (index: number) => {
  return {
    id: `dashboard-tab-${index}`,
    'aria-controls': `dashboard-tabpanel-${index}`,
  };
};

interface DashboardData {
  metrics: {
    totalBookings: number;
    upcomingBookings: number;
    pendingRequests: number;
    totalReviews: number;
    averageRating: number;
    monthlyEarnings: number;
    completionRate: number;
    totalExperiences?: number;
    activeExperiences?: number;
  };
  pendingRequests: any[];
  upcomingBookings: any[];
  pastBookings: any[];
}

const AttenderDashboard: React.FC = () => {
  // アテンダーIDを取得（実際にはルートパラメータやユーザー認証情報から取得）
  const { id: attenderId = '12345' } = useParams<{id?: string}>();
  const { t } = useTranslation(['attender', 'common']);
  const apiClient = useApiClient();
  const [tabValue, setTabValue] = useState(0);
  const [showExperienceForm, setShowExperienceForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    metrics: {
      totalBookings: 0,
      upcomingBookings: 0,
      pendingRequests: 0,
      totalReviews: 0,
      averageRating: 0,
      monthlyEarnings: 0,
      completionRate: 0
    },
    pendingRequests: [],
    upcomingBookings: [],
    pastBookings: []
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // 実際の実装ではAPIからデータを取得
      // const response = await apiClient.get('/attender/dashboard');
      // setDashboardData(response.data);
      
      // 仮のデータを設定
      setTimeout(() => {
        setDashboardData({
          metrics: {
            totalBookings: 42,
            upcomingBookings: 5,
            pendingRequests: 3,
            totalReviews: 37,
            averageRating: 4.7,
            monthlyEarnings: 125000,
            completionRate: 98,
            totalExperiences: 3,
            activeExperiences: 1
          },
          pendingRequests: [
            {
              id: 'req-1',
              userId: 'user-456',
              userName: '佐藤 健太',
              userImage: '',
              date: new Date('2025-04-01'),
              numberOfPeople: 2,
              message: '伝統工芸ワークショップに興味があります。',
              status: 'pending',
              createdAt: new Date('2025-03-18')
            },
            {
              id: 'req-2',
              userId: 'user-789',
              userName: '山田 花子',
              userImage: '',
              date: new Date('2025-04-05'),
              numberOfPeople: 1,
              message: '地元の隠れた名所を案内してもらえますか？',
              status: 'pending',
              createdAt: new Date('2025-03-19')
            },
            {
              id: 'req-3',
              userId: 'user-101',
              userName: '鈴木 一郎',
              userImage: '',
              date: new Date('2025-04-10'),
              numberOfPeople: 4,
              message: '家族で訪問します。子供も楽しめる体験をお願いします。',
              status: 'pending',
              createdAt: new Date('2025-03-20')
            }
          ],
          upcomingBookings: [
            {
              id: 'book-1',
              userId: 'user-202',
              userName: '田中 優子',
              userImage: '',
              experienceId: 'exp-101',
              experienceTitle: '路地裏アート探検',
              date: new Date('2025-03-25'),
              startTime: '13:00',
              endTime: '16:00',
              numberOfPeople: 2,
              status: 'confirmed',
              createdAt: new Date('2025-03-10')
            },
            {
              id: 'book-2',
              userId: 'user-303',
              userName: '伊藤 雄太',
              userImage: '',
              experienceId: 'exp-102',
              experienceTitle: '地元職人と巡る伝統工芸ツアー',
              date: new Date('2025-03-27'),
              startTime: '10:00',
              endTime: '14:00',
              numberOfPeople: 3,
              status: 'confirmed',
              createdAt: new Date('2025-03-12')
            }
          ],
          pastBookings: [
            {
              id: 'book-3',
              userId: 'user-404',
              userName: '高橋 真由美',
              userImage: '',
              experienceId: 'exp-103',
              experienceTitle: '夜の屋台グルメツアー',
              date: new Date('2025-03-15'),
              startTime: '18:00',
              endTime: '21:00',
              numberOfPeople: 4,
              status: 'completed',
              rating: 5,
              review: 'とても素晴らしい体験でした！地元の方しか知らないような屋台を案内してもらい、最高の思い出になりました。',
              createdAt: new Date('2025-03-05')
            },
            {
              id: 'book-4',
              userId: 'user-505',
              userName: '渡辺 健',
              userImage: '',
              experienceId: 'exp-101',
              experienceTitle: '路地裏アート探検',
              date: new Date('2025-03-18'),
              startTime: '13:00',
              endTime: '16:00',
              numberOfPeople: 1,
              status: 'completed',
              rating: 4,
              review: '普段気づかないような場所にあるアート作品を発見できて楽しかったです。もう少し詳しい説明があるともっと良かったです。',
              createdAt: new Date('2025-03-08')
            }
          ]
        });
        setLoading(false);
      }, 1000);
      
    } catch (error: any) {
      console.error('Failed to fetch dashboard data:', error);
      setError(error.message || t('dashboard.error.fetchFailed'));
      setLoading(false);
    }
  };

  const handleChangeTab = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleAcceptRequest = async (requestId: string) => {
    try {
      // 実際の実装ではAPIリクエストでリクエストを承認
      // await apiClient.post(`/attender/requests/${requestId}/accept`);
      
      // 仮の実装として状態のみ更新
      setDashboardData(prev => ({
        ...prev,
        pendingRequests: prev.pendingRequests.filter(req => req.id !== requestId)
      }));
      
      // 成功メッセージなどを表示
    } catch (error) {
      console.error('Failed to accept request:', error);
      // エラーメッセージを表示
    }
  };

  const handleDeclineRequest = async (requestId: string) => {
    try {
      // 実際の実装ではAPIリクエストでリクエストを拒否
      // await apiClient.post(`/attender/requests/${requestId}/decline`);
      
      // 仮の実装として状態のみ更新
      setDashboardData(prev => ({
        ...prev,
        pendingRequests: prev.pendingRequests.filter(req => req.id !== requestId)
      }));
      
      // 成功メッセージなどを表示
    } catch (error) {
      console.error('Failed to decline request:', error);
      // エラーメッセージを表示
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" my={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box my={4}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        {t('dashboard.title')}
      </Typography>
      
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12}>
          <PerformanceMetrics metrics={dashboardData.metrics} />
        </Grid>
      </Grid>
      
      <Paper elevation={3}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={tabValue}
            onChange={handleChangeTab}
            aria-label="dashboard tabs"
            variant="fullWidth"
          >
            <Tab 
              label={`${t('dashboard.tabs.requests')} (${dashboardData.pendingRequests.length})`}
              {...a11yProps(0)} 
            />
            <Tab 
              label={`${t('dashboard.tabs.upcoming')} (${dashboardData.upcomingBookings.length})`}
              {...a11yProps(1)} 
            />
            <Tab 
              label={t('dashboard.tabs.past')}
              {...a11yProps(2)} 
            />
            <Tab 
              label="体験プラン管理"
              {...a11yProps(3)} 
            />
            <Tab 
              label="スケジュール管理"
              {...a11yProps(4)} 
            />
            <Tab 
              label="レビュー管理"
              {...a11yProps(5)} 
            />
            <Tab 
              label="収益レポート"
              {...a11yProps(6)} 
            />
          </Tabs>
        </Box>
        
        <TabPanel value={tabValue} index={0}>
          <RequestsList
            requests={dashboardData.pendingRequests}
            onAccept={handleAcceptRequest}
            onDecline={handleDeclineRequest}
          />
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          <UpcomingBookings bookings={dashboardData.upcomingBookings} />
        </TabPanel>
        
        <TabPanel value={tabValue} index={2}>
          <PastBookings bookings={dashboardData.pastBookings} />
        </TabPanel>
        
        <TabPanel value={tabValue} index={3}>
          <Box display="flex" justifyContent="flex-end" mb={3}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => setShowExperienceForm(true)}
            >
              {t('experience.list.addNew') || '新規体験プラン作成'}
            </Button>
          </Box>
          <ExperienceList />
        </TabPanel>
        
        <TabPanel value={tabValue} index={4}>
          <ScheduleManagement attenderId={attenderId} />
        </TabPanel>
        
        <TabPanel value={tabValue} index={5}>
          <ReviewDashboard attenderId={attenderId} />
        </TabPanel>
        
        <TabPanel value={tabValue} index={6}>
          <EarningsReport attenderId={attenderId} />
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default AttenderDashboard;
