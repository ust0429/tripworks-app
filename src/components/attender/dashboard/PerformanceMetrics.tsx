import React from 'react';
// モックライブラリをインポート
import { useTranslation } from '../../../mocks/i18nMock';
import {
  Grid,
  Paper,
  Typography,
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
}

const MetricCard: React.FC<{
  title: string;
  value: React.ReactNode;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}> = ({ title, value, icon, trend }) => {
  return (
    <Paper elevation={2} sx={{ p: 2, height: '100%' }}>
      <Box display="flex" alignItems="center" mb={1}>
        <Box mr={1} display="flex" color="primary.main">
          {icon}
        </Box>
        <Typography variant="body2" color="text.secondary">
          {title}
        </Typography>
      </Box>
      
      <Typography variant="h5" component="div" gutterBottom>
        {value}
      </Typography>
      
      {trend && (
        <Typography 
          variant="caption" 
          color={trend.isPositive ? 'success.main' : 'error.main'}
        >
          {trend.isPositive ? '+' : ''}{trend.value}% {trend.isPositive ? '↑' : '↓'}
        </Typography>
      )}
    </Paper>
  );
};

const PerformanceMetrics: React.FC<MetricsProps> = ({ metrics }) => {
  const { t } = useTranslation(['attender', 'common']);
  
  // 表示用にフォーマット
  const formattedEarnings = new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency: 'JPY'
  }).format(metrics.monthlyEarnings);

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={6} md={4}>
        <MetricCard
          title={t('dashboard.metrics.totalBookings')}
          value={metrics.totalBookings}
          icon={<BookingIcon />}
          trend={{ value: 12, isPositive: true }}
        />
      </Grid>
      
      <Grid item xs={12} sm={6} md={4}>
        <MetricCard
          title={t('dashboard.metrics.upcomingBookings')}
          value={metrics.upcomingBookings}
          icon={<CalendarIcon />}
        />
      </Grid>
      
      <Grid item xs={12} sm={6} md={4}>
        <MetricCard
          title={t('dashboard.metrics.pendingRequests')}
          value={metrics.pendingRequests}
          icon={<PendingIcon />}
        />
      </Grid>
      
      <Grid item xs={12} sm={6} md={4}>
        <Paper elevation={2} sx={{ p: 2, height: '100%' }}>
          <Box display="flex" alignItems="center" mb={1}>
            <Box mr={1} display="flex" color="primary.main">
              <RatingIcon />
            </Box>
            <Typography variant="body2" color="text.secondary">
              {t('dashboard.metrics.rating')}
            </Typography>
          </Box>
          
          <Box display="flex" alignItems="center">
            <Typography variant="h5" component="div" mr={1}>
              {metrics.averageRating.toFixed(1)}
            </Typography>
            <Rating value={metrics.averageRating} precision={0.5} readOnly size="small" />
          </Box>
          
          <Typography variant="caption" color="text.secondary">
            {t('dashboard.metrics.totalReviews', { count: metrics.totalReviews })}
          </Typography>
        </Paper>
      </Grid>
      
      <Grid item xs={12} sm={6} md={4}>
        <MetricCard
          title={t('dashboard.metrics.monthlyEarnings')}
          value={formattedEarnings}
          icon={<EarningsIcon />}
          trend={{ value: 8.5, isPositive: true }}
        />
      </Grid>
      
      <Grid item xs={12} sm={6} md={4}>
        <Paper elevation={2} sx={{ p: 2, height: '100%' }}>
          <Box display="flex" alignItems="center" mb={1}>
            <Box mr={1} display="flex" color="primary.main">
              <CompletionIcon />
            </Box>
            <Typography variant="body2" color="text.secondary">
              {t('dashboard.metrics.completionRate')}
            </Typography>
          </Box>
          
          <Typography variant="h5" component="div" gutterBottom>
            {metrics.completionRate}%
          </Typography>
          
          <LinearProgress 
            variant="determinate" 
            value={metrics.completionRate} 
            color={metrics.completionRate > 90 ? "success" : metrics.completionRate > 70 ? "primary" : "warning"}
            sx={{ height: 8, borderRadius: 4 }}
          />
        </Paper>
      </Grid>
      
      <Grid item xs={12} sm={6} md={4}>
        <Paper elevation={2} sx={{ p: 2, height: '100%' }}>
          <Box display="flex" alignItems="center" mb={1}>
            <Box mr={1} display="flex" color="primary.main">
              <ExperienceIcon />
            </Box>
            <Typography variant="body2" color="text.secondary">
              体験プラン
            </Typography>
          </Box>
          
          <Box display="flex" alignItems="baseline">
            <Typography variant="h5" component="div" mr={1}>
              {metrics.totalExperiences || 0}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              公開中: {metrics.activeExperiences || 0}
            </Typography>
          </Box>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default PerformanceMetrics;
