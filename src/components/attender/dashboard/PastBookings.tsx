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
  Rating,
  Alert
} from '../../../mocks/materialMock';
import {
  Event as EventIcon,
  AccessTime as TimeIcon,
  PersonOutline as PersonIcon,
  LocalActivity as ActivityIcon,
  Comment as CommentIcon
} from '../../../mocks/iconsMock';

// 互換性のため
interface Booking extends BookingData {
  userImage: string;
}

interface PastBookingsProps {
  bookings: BookingData[] | Booking[];
}

const PastBookings: React.FC<PastBookingsProps> = ({ bookings }) => {
  const { t } = useTranslation(['attender', 'common']);

  if (bookings.length === 0) {
    return (
      <Box textAlign="center" py={3}>
        <Alert severity="info">
          過去の体験はまだありません
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
                        label={t('dashboard.pastBookings.people', { count: booking.numberOfPeople })}
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
                    
                    {booking.rating && (
                      <Box mb={2}>
                        <Typography variant="body2" fontWeight="medium">
                          ユーザー評価:
                        </Typography>
                        <Box display="flex" alignItems="center">
                          <Rating value={booking.rating} precision={0.5} readOnly />
                          <Typography variant="body2" ml={1}>
                            {booking.rating}
                          </Typography>
                        </Box>
                      </Box>
                    )}
                    
                    {booking.review && (
                      <Box mb={2}>
                        <Typography variant="body2" fontWeight="medium" display="flex" alignItems="center">
                          <CommentIcon fontSize="small" sx={{ mr: 0.5 }} />
                          レビュー:
                        </Typography>
                        <Typography variant="body2" color="text.secondary" mt={0.5}>
                          {booking.review}
                        </Typography>
                      </Box>
                    )}
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

export default PastBookings;
