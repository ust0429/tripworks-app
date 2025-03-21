import React, { useState, useEffect } from 'react';
// モックライブラリをインポート
import { useTranslation } from '../../../mocks/i18nMock';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Button,
  ButtonGroup,
  Paper,
  Divider,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer
} from '../../../mocks/materialMock';
import {
  DateRange as DateRangeIcon,
  FileDownload as DownloadIcon,
  AccountBalanceWallet as WalletIcon,
  TrendingUp as TrendingUpIcon
} from '../../../mocks/iconsMock';
import { useApiClient } from '../../../hooks/useApiClient';
import { UUID } from '../../../types/attender';

// データ型定義
interface EarningsReportData {
  summary: {
    currentPeriodEarnings: number;
    previousPeriodEarnings: number;
    totalBookings: number;
    averagePerBooking: number;
    pendingPayments: number;
    totalExperiences: number;
    topExperience: {
      id: string;
      title: string;
      earnings: number;
      bookingsCount: number;
    };
  };
  monthlyData: {
    month: string; // '2025-01' 形式
    earnings: number;
    bookingsCount: number;
  }[];
  recentPayments: {
    id: string;
    date: Date;
    amount: number;
    status: 'completed' | 'pending' | 'processing';
    bookingId: string;
    experienceTitle: string;
    userName: string;
  }[];
}

// フィルター期間の選択肢
type PeriodFilter = 'week' | 'month' | 'quarter' | 'year' | 'all';

interface EarningsReportProps {
  attenderId: UUID;
}

const EarningsReport: React.FC<EarningsReportProps> = ({ attenderId }) => {
  const { t } = useTranslation(['attender', 'common']);
  const apiClient = useApiClient();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reportData, setReportData] = useState<EarningsReportData | null>(null);
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('month');

  useEffect(() => {
    fetchEarningsReport();
  }, [periodFilter]);

  const fetchEarningsReport = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // 実際の実装ではAPIからデータを取得
      // const response = await apiClient.get(`/attender/${attenderId}/earnings`, {
      //   params: { period: periodFilter }
      // });
      // setReportData(response.data);
      
      // 仮のデータを設定
      setTimeout(() => {
        setReportData({
          summary: {
            currentPeriodEarnings: 184500,
            previousPeriodEarnings: 158000,
            totalBookings: 22,
            averagePerBooking: 8386,
            pendingPayments: 18500,
            totalExperiences: 3,
            topExperience: {
              id: 'exp-101',
              title: '路地裏アート探検',
              earnings: 97500,
              bookingsCount: 15
            }
          },
          monthlyData: [
            { month: '2024-10', earnings: 105000, bookingsCount: 12 },
            { month: '2024-11', earnings: 126000, bookingsCount: 14 },
            { month: '2024-12', earnings: 158000, bookingsCount: 18 },
            { month: '2025-01', earnings: 142000, bookingsCount: 16 },
            { month: '2025-02', earnings: 164000, bookingsCount: 19 },
            { month: '2025-03', earnings: 184500, bookingsCount: 22 }
          ],
          recentPayments: [
            {
              id: 'pay-101',
              date: new Date('2025-03-19'),
              amount: 13000,
              status: 'completed',
              bookingId: 'book-123',
              experienceTitle: '路地裏アート探検',
              userName: '田中 優子'
            },
            {
              id: 'pay-102',
              date: new Date('2025-03-17'),
              amount: 19600,
              status: 'completed',
              bookingId: 'book-124',
              experienceTitle: '地元職人と巡る伝統工芸ツアー',
              userName: '伊藤 雄太'
            },
            {
              id: 'pay-103',
              date: new Date('2025-03-15'),
              amount: 9800,
              status: 'completed',
              bookingId: 'book-125',
              experienceTitle: '夜の屋台グルメツアー',
              userName: '高橋 真由美'
            },
            {
              id: 'pay-104',
              date: new Date('2025-03-14'),
              amount: 9800,
              status: 'pending',
              bookingId: 'book-126',
              experienceTitle: '夜の屋台グルメツアー',
              userName: '渡辺 健'
            },
            {
              id: 'pay-105',
              date: new Date('2025-03-12'),
              amount: 8700,
              status: 'pending',
              bookingId: 'book-127',
              experienceTitle: '路地裏アート探検',
              userName: '佐藤 健太'
            }
          ]
        });
        setLoading(false);
      }, 1000);
      
    } catch (error: any) {
      console.error('Failed to fetch earnings report:', error);
      setError(error.message || 'レポートデータの取得に失敗しました');
      setLoading(false);
    }
  };

  const handlePeriodChange = (period: PeriodFilter) => {
    setPeriodFilter(period);
  };

  const handleDownloadReport = () => {
    // 実際の実装ではCSVなどでレポートをダウンロード
    alert('レポートのダウンロード機能は現在開発中です。');
  };

  // 金額フォーマット用関数
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY'
    }).format(amount);
  };

  // 日付フォーマット用関数
  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // 月表示フォーマット
  const formatMonth = (monthStr: string): string => {
    const [year, month] = monthStr.split('-');
    return `${year}年${month}月`;
  };

  // 増減率計算
  const calculateGrowthRate = (current: number, previous: number): number => {
    if (previous === 0) return 100;
    return Math.round((current - previous) / previous * 100);
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
      <Alert severity="error" sx={{ my: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!reportData) {
    return (
      <Alert severity="warning" sx={{ my: 2 }}>
        レポートデータがありません。
      </Alert>
    );
  }

  const growthRate = calculateGrowthRate(
    reportData.summary.currentPeriodEarnings,
    reportData.summary.previousPeriodEarnings
  );

  return (
    <Box>
      <Box 
        display="flex" 
        justifyContent="space-between" 
        alignItems="center" 
        mb={3}
        flexDirection={{ xs: 'column', sm: 'row' }}
        gap={2}
      >
        <Typography variant="h4" component="h1">
          収益レポート
        </Typography>
        
        <Box display="flex" gap={2} flexDirection={{ xs: 'column', sm: 'row' }}>
          <ButtonGroup variant="outlined" size="small">
            <Button 
              onClick={() => handlePeriodChange('week')}
              variant={periodFilter === 'week' ? 'contained' : 'outlined'}
            >
              週間
            </Button>
            <Button 
              onClick={() => handlePeriodChange('month')}
              variant={periodFilter === 'month' ? 'contained' : 'outlined'}
            >
              月間
            </Button>
            <Button 
              onClick={() => handlePeriodChange('quarter')}
              variant={periodFilter === 'quarter' ? 'contained' : 'outlined'}
            >
              四半期
            </Button>
            <Button 
              onClick={() => handlePeriodChange('year')}
              variant={periodFilter === 'year' ? 'contained' : 'outlined'}
            >
              年間
            </Button>
          </ButtonGroup>
          
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleDownloadReport}
            size="small"
          >
            レポートダウンロード
          </Button>
        </Box>
      </Box>
      
      {/* サマリーカード */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography color="text.secondary" variant="body2">
                  現在の収益
                </Typography>
                <WalletIcon color="primary" fontSize="small" />
              </Box>
              <Typography variant="h5" component="div" sx={{ my: 1 }}>
                {formatCurrency(reportData.summary.currentPeriodEarnings)}
              </Typography>
              <Typography 
                variant="body2" 
                color={growthRate >= 0 ? 'success.main' : 'error.main'}
                sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
              >
                <TrendingUpIcon fontSize="inherit" />
                {growthRate > 0 ? '+' : ''}{growthRate}% 前期比
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography color="text.secondary" variant="body2">
                  予約数
                </Typography>
                <DateRangeIcon color="primary" fontSize="small" />
              </Box>
              <Typography variant="h5" component="div" sx={{ my: 1 }}>
                {reportData.summary.totalBookings}件
              </Typography>
              <Typography variant="body2" color="text.secondary">
                平均{formatCurrency(reportData.summary.averagePerBooking)}/予約
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography color="text.secondary" variant="body2">
                  人気体験プラン
                </Typography>
              </Box>
              <Typography variant="h6" component="div" noWrap sx={{ my: 1 }}>
                {reportData.summary.topExperience.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {reportData.summary.topExperience.bookingsCount}件 / 
                {formatCurrency(reportData.summary.topExperience.earnings)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography color="text.secondary" variant="body2">
                  保留中の支払い
                </Typography>
              </Box>
              <Typography variant="h5" component="div" sx={{ my: 1 }}>
                {formatCurrency(reportData.summary.pendingPayments)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                処理中の支払い
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* 月別データ */}
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          月別収益推移
        </Typography>
        
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>月</TableCell>
                <TableCell align="right">収益</TableCell>
                <TableCell align="right">予約数</TableCell>
                <TableCell align="right">平均収益/予約</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reportData.monthlyData.map((monthData) => (
                <TableRow key={monthData.month}>
                  <TableCell>{formatMonth(monthData.month)}</TableCell>
                  <TableCell align="right">{formatCurrency(monthData.earnings)}</TableCell>
                  <TableCell align="right">{monthData.bookingsCount}件</TableCell>
                  <TableCell align="right">
                    {formatCurrency(monthData.earnings / monthData.bookingsCount)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
      
      {/* 最近の支払い */}
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          最近の取引
        </Typography>
        
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>日付</TableCell>
                <TableCell>体験プラン</TableCell>
                <TableCell>ユーザー</TableCell>
                <TableCell align="right">金額</TableCell>
                <TableCell align="center">ステータス</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reportData.recentPayments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell>{formatDate(payment.date)}</TableCell>
                  <TableCell>{payment.experienceTitle}</TableCell>
                  <TableCell>{payment.userName}</TableCell>
                  <TableCell align="right">{formatCurrency(payment.amount)}</TableCell>
                  <TableCell align="center">
                    <Box display="inline" 
                      sx={{ 
                        px: 1, 
                        py: 0.5, 
                        borderRadius: 1, 
                        fontSize: '0.75rem',
                        bgcolor: 
                          payment.status === 'completed' ? 'success.light' : 
                          payment.status === 'pending' ? 'warning.light' : 
                          'info.light',
                        color: 
                          payment.status === 'completed' ? 'success.dark' : 
                          payment.status === 'pending' ? 'warning.dark' : 
                          'info.dark'
                      }}
                    >
                      {payment.status === 'completed' ? '完了' : 
                       payment.status === 'pending' ? '保留中' : '処理中'}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default EarningsReport;
