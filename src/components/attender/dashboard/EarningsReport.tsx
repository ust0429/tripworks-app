import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../../mocks/i18nMock';
import {
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Button,
  ButtonGroup,
  Paper as PaperContainer,
  Divider,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Box,
  Chip
} from '../../../mocks/materialMock';
import {
  DateRange as DateRangeIcon,
  AccountBalance as DownloadIcon,
  Money as WalletIcon,
  AccountBalance as TrendingUpIcon
} from '../../../mocks/iconsMock';
import { useApiClient } from '../../../hooks/useApiClient';
import { UUID } from '../../../types/attender';
import { EarningsData, TransactionData } from '../../../types/dashboard';

interface EarningsReportProps {
  attenderId: UUID | string;
}

// 期間フィルター
enum DateFilterType {
  WEEK = 'week',
  MONTH = 'month',
  QUARTER = 'quarter',
  YEAR = 'year'
}

/**
 * 収益レポートコンポーネント
 */
const EarningsReport: React.FC<EarningsReportProps> = ({ attenderId }) => {
  const { t } = useTranslation(['attender', 'common']);
  const apiClient = useApiClient();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState<DateFilterType>(DateFilterType.MONTH);
  const [earnings, setEarnings] = useState<EarningsData>({
    currentMonth: 0,
    lastMonth: 0,
    total: 0,
    transactions: []
  });
  
  // データ取得
  useEffect(() => {
    const fetchEarningsData = async () => {
      try {
        setLoading(true);
        // 本番環境では実際のAPIエンドポイントを使用
        // const response = await apiClient.get(`/attender/${attenderId}/earnings?period=${dateFilter}`);
        // setEarnings(response.data);
        
        // モックデータ (開発用)
        setTimeout(() => {
          setEarnings({
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
              },
              {
                id: 'trans3',
                date: new Date(Date.now() - 86400000 * 20).toISOString(),
                bookingId: 'book5',
                experienceTitle: '寺町ウォーキングツアー',
                amount: 10000,
                status: 'completed'
              }
            ]
          });
          setLoading(false);
        }, 1000);
      } catch (err) {
        console.error('収益データ取得エラー:', err);
        setError('データの取得に失敗しました。');
        setLoading(false);
      }
    };
    
    fetchEarningsData();
  }, [attenderId, dateFilter]);
  
  // 日付のフォーマット
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  // 金額のフォーマット
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  // 期間フィルター変更ハンドラ
  const handleFilterChange = (filter: DateFilterType) => {
    setDateFilter(filter);
  };
  
  // ローディング表示
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" my={4}>
        <CircularProgress />
      </Box>
    );
  }
  
  // エラー表示
  if (error) {
    return (
      <Alert severity="error" sx={{ my: 2 }}>
        {error}
      </Alert>
    );
  }
  
  return (
    <div>
      <Grid container spacing={3}>
        {/* ヘッダー */}
        <Grid item xs={12}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h5">収益管理</Typography>
            <ButtonGroup variant="outlined" size="small">
              <Button 
                onClick={() => handleFilterChange(DateFilterType.WEEK)}
                variant={dateFilter === DateFilterType.WEEK ? 'contained' : 'outlined'}
              >
                週間
              </Button>
              <Button 
                onClick={() => handleFilterChange(DateFilterType.MONTH)}
                variant={dateFilter === DateFilterType.MONTH ? 'contained' : 'outlined'}
              >
                月間
              </Button>
              <Button 
                onClick={() => handleFilterChange(DateFilterType.QUARTER)}
                variant={dateFilter === DateFilterType.QUARTER ? 'contained' : 'outlined'}
              >
                四半期
              </Button>
              <Button 
                onClick={() => handleFilterChange(DateFilterType.YEAR)}
                variant={dateFilter === DateFilterType.YEAR ? 'contained' : 'outlined'}
              >
                年間
              </Button>
            </ButtonGroup>
          </Box>
        </Grid>
        
        {/* サマリーカード */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <WalletIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="body1">今月の収益</Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold" color="primary">
                {formatCurrency(earnings.currentMonth)}
              </Typography>
              <Box display="flex" alignItems="center" mt={1}>
                {earnings.currentMonth > earnings.lastMonth ? (
                  <TrendingUpIcon sx={{ color: 'success.main', fontSize: 16, mr: 0.5 }} />
                ) : (
                  <TrendingUpIcon sx={{ color: 'error.main', fontSize: 16, mr: 0.5 }} />
                )}
                <Typography variant="body2" color={earnings.currentMonth > earnings.lastMonth ? 'success.main' : 'error.main'}>
                  {earnings.currentMonth > earnings.lastMonth ? '+' : '-'}
                  {Math.abs(earnings.currentMonth - earnings.lastMonth) / earnings.lastMonth * 100}%
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <DateRangeIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="body1">先月の収益</Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold">
                {formatCurrency(earnings.lastMonth)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <DownloadIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="body1">累計収益</Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold">
                {formatCurrency(earnings.total)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        {/* 取引履歴 */}
        <Grid item xs={12}>
          <PaperContainer sx={{ mt: 3 }}>
            <Box p={3}>
              <Typography variant="h6" mb={2}>取引履歴</Typography>
              
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>日時</TableCell>
                      <TableCell>体験</TableCell>
                      <TableCell>ステータス</TableCell>
                      <TableCell align="right">金額</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {earnings.transactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>{formatDate(transaction.date)}</TableCell>
                        <TableCell>{transaction.experienceTitle}</TableCell>
                        <TableCell>
                          <Chip
                            label={transaction.status === 'completed' ? '完了' : '保留中'}
                            color={transaction.status === 'completed' ? 'success' : 'warning'}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell align="right">{formatCurrency(transaction.amount)}</TableCell>
                      </TableRow>
                    ))}
                    {earnings.transactions.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} align="center">
                          <Typography variant="body2" color="text.secondary" py={3}>
                            取引履歴がありません
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </PaperContainer>
        </Grid>
      </Grid>
    </div>
  );
};

export default EarningsReport;
