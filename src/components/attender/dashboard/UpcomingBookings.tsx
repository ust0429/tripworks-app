import React from 'react';
import { useTranslation } from '../../../mocks/i18nMock';
import { BookingData } from '../../../types/dashboard';
import {
  Paper,
  Typography,
  Box,
  List,
  ListItem,
  Card,
  CardContent,
  Avatar,
  Chip,
  Divider,
  Grid,
  Button,
  Alert
} from '../../../mocks/materialMock';
import {
  Event as EventIcon,
  AccessTime as TimeIcon,
  PersonOutline as PersonIcon,
  LocalActivity as ActivityIcon
} from '../../../mocks/iconsMock';

// 互換性のため
interface Booking extends BookingData {
  userImage: string;
}

interface UpcomingBookingsProps {
  bookings: BookingData[] | Booking[];
}

const UpcomingBookings: React.FC<UpcomingBookingsProps> = ({ bookings }) => {
  const { t } = useTranslation(['attender', 'common']);

  if (bookings.length === 0) {
    return (
      <Box textAlign="center" py={3}>
        <Alert severity="info">
          現在予定されている体験はありません
        </Alert>
      </Box>
    );
  }

  // 日付をフォーマット
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      weekday: 'short'
    });
  };

  return (
    <List sx={{ width: '100%', bgcolor: 'background.paper', p: 0 }}>
      {bookings.map((booking) => (
        <React.Fragment key={booking.id}>
          <ListItem alignItems="flex-start" sx={{ px: 0 }}>
            <Card sx={{ width: '100%' }}>
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={2}>
                    <Box display="flex" flexDirection="column" alignItems="center">
                      <Avatar
                        alt={booking.userName}
                        src={booking.userAvatar || booking.userImage}
                        sx={{ width: 60, height: 60, mb: 1 }}
                      />
                      <Typography variant="subtitle2">
                        {booking.userName}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={10}>
                    <Typography variant="h6" gutterBottom>
                      {booking.experienceTitle}
                    </Typography>
                    
                    <Box display="flex" alignItems="center" mb={1}>
                      <EventIcon sx={{ mr: 1, color: 'primary.main' }} />
                      <Typography variant="body2">
                        {formatDate(booking.date)}
                      </Typography>
                    </Box>
                    
                    <Box display="flex" alignItems="center" mb={1}>
                      <TimeIcon sx={{ mr: 1, color: 'primary.main' }} />
                      <Typography variant="body2">
                        {booking.startTime} - {booking.endTime}
                      </Typography>
                    </Box>
                    
                    <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
                      <Chip
                        icon={<PersonIcon />}
                        label={t('dashboard.upcomingBookings.people', { count: booking.numberOfPeople })}
                        variant="outlined"
                        size="small"
                      />
                      <Chip
                        icon={<ActivityIcon />}
                        label={`¥${booking.totalAmount.toLocaleString()}`}
                        variant="outlined"
                        size="small"
                        color="primary"
                      />
                    </Box>
                    
                    <Box mt={2} display="flex" justifyContent="flex-end">
                      <Button
                        variant="outlined"
                        size="small"
                        sx={{ mr: 1 }}
                      >
                        メッセージを送る
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                      >
                        キャンセル
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </ListItem>
          <Divider variant="inset" component="li" />
        </React.Fragment>
      ))}
    </List>
  );
};

export default UpcomingBookings;
