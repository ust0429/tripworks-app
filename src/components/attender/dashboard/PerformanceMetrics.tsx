import React from 'react';
import { useTranslation } from '../../../mocks/i18nMock';
import { PerformanceMetricsData } from '../../../types/dashboard';
import {
  Paper,
  Typography,
  Grid,
  Box,
  Rating,
  LinearProgress,
  Divider
} from '../../../mocks/materialMock';
import {
  CalendarMonth as CalendarIcon,
  AccessTime as PendingIcon,
  Star as RatingIcon,
  Assignment as BookingIcon,
  MonetizationOn as EarningsIcon,
  CheckCircle as CompletionIcon,
  Explore as ExperienceIcon
} from '../../../mocks/iconsMock';

interface MetricsProps {
  metrics: PerformanceMetricsData;
}

/**
 * パフォーマンスメトリクスコンポーネント
 * アテンダーのパフォーマンス指標を表示
 */
const PerformanceMetrics: React.FC<MetricsProps> = ({ metrics }) => {
  const { t } = useTranslation(['attender', 'common']);
  
  // 表示用にフォーマット
  const formattedEarnings = new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency: 'JPY',
    maximumFractionDigits: 0
  }).format(metrics.monthlyEarnings);
  
  return (
    <Paper sx={{ p: 3 }}>
      <Grid container spacing={3}>
        {/* 総予約数 */}
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Box display="flex" alignItems="center" mb={1}>
              <BookingIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6" fontWeight="bold">
                {metrics.totalBookings}
              </Typography>
            </Box>
            
            <Typography variant="body2" color="text.secondary">
              総予約数
            </Typography>
          </Paper>
        </Grid>
        
        {/* 予定の予約 */}
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Box display="flex" alignItems="center" mb={1}>
              <CalendarIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6" fontWeight="bold">
                {metrics.upcomingBookings}
              </Typography>
            </Box>
            
            <Typography variant="body2" color="text.secondary">
              予定の予約
            </Typography>
          </Paper>
        </Grid>
        
        {/* 保留中のリクエスト */}
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Box display="flex" alignItems="center" mb={1}>
              <PendingIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6" fontWeight="bold">
                {metrics.pendingRequests}
              </Typography>
            </Box>
            
            <Typography variant="body2" color="text.secondary">
              保留中のリクエスト
            </Typography>
          </Paper>
        </Grid>
        
        {/* 月間収益 */}
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Box display="flex" alignItems="center" mb={1}>
              <EarningsIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6" fontWeight="bold">
                {formattedEarnings}
              </Typography>
            </Box>
            
            <Typography variant="body2" color="text.secondary">
              今月の収益
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
        </Grid>
        
        {/* 評価 */}
        <Grid item xs={12} sm={6} md={4}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Box display="flex" alignItems="center" mb={1}>
              <RatingIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="body1" fontWeight="medium">
                評価
              </Typography>
            </Box>
            
            <Box display="flex" alignItems="center" mt={2}>
              <Rating 
                value={metrics.averageRating} 
                precision={0.1} 
                readOnly 
                size="large"
              />
              <Typography variant="h6" ml={1}>
                {metrics.averageRating.toFixed(1)}
              </Typography>
            </Box>
            
            <Typography variant="caption" color="text.secondary">
              {t('dashboard.metrics.totalReviews', { count: metrics.totalReviews })}
            </Typography>
          </Paper>
        </Grid>
        
        {/* 完了率 */}
        <Grid item xs={12} sm={6} md={4}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Box display="flex" alignItems="center" mb={1}>
              <CompletionIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="body1" fontWeight="medium">
                完了率
              </Typography>
            </Box>
            
            <Box mt={2}>
              <LinearProgress 
                variant="determinate" 
                value={metrics.completionRate} 
                sx={{ height: 10, borderRadius: 5 }}
              />
              <Typography variant="h6" mt={1}>
                {metrics.completionRate}%
              </Typography>
            </Box>
          </Paper>
        </Grid>
        
        {/* 体験数 */}
        <Grid item xs={12} sm={6} md={4}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Box display="flex" alignItems="center" mb={1}>
              <ExperienceIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="body1" fontWeight="medium">
                体験数
              </Typography>
            </Box>
            
            <Box display="flex" justifyContent="space-between" mt={2}>
              <Box>
                <Typography variant="h6">
                  {metrics.activeExperiences}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  公開中
                </Typography>
              </Box>
              
              <Box>
                <Typography variant="h6">
                  {metrics.totalExperiences}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  合計
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default PerformanceMetrics;
