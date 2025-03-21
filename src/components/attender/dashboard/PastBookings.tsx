import React from 'react';
// モックライブラリをインポート
import { useTranslation } from '../../../mocks/i18nMock';
import {
  Box,
  Typography,
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

interface Booking {
  id: string;
  userId: string;
  userName: string;
  userImage: string;
  experienceId: string;
  experienceTitle: string;
  date: Date;
  startTime: string;
  endTime: string;
  numberOfPeople: number;
  status: string;
  rating?: number;
  review?: string;
  createdAt: Date;
}

interface PastBookingsProps {
  bookings: Booking[];
}

const PastBookings: React.FC<PastBookingsProps> = ({ bookings }) => {
  const { t } = useTranslation(['attender', 'common']);

  if (bookings.length === 0) {
    return (
      <Alert severity="info">
        {t('dashboard.pastBookings.empty')}
      </Alert>
    );
  }

  // 日付をフォーマット
  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    }).format(new Date(date));
  };

  // 日付を比較して新しい順に並べ替え
  const sortedBookings = [...bookings].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  return (
    <List disablePadding>
      {sortedBookings.map((booking, index) => (
        <React.Fragment key={booking.id}>
          {index > 0 && <Divider component="li" />}
          <ListItem alignItems="flex-start" disablePadding>
            <Card sx={{ width: '100%', mb: 0, boxShadow: 'none' }}>
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={8}>
                    <Box mb={2}>
                      <Typography variant="h6" gutterBottom>
                        <ActivityIcon color="primary" sx={{ verticalAlign: 'middle', mr: 1 }} />
                        {booking.experienceTitle}
                      </Typography>
                      
                      <Box display="flex" alignItems="center" mt={2}>
                        <Avatar 
                          src={booking.userImage}
                          alt={booking.userName}
                          sx={{ mr: 2 }}
                        >
                          {!booking.userImage && booking.userName.charAt(0)}
                        </Avatar>
                        <Typography variant="body1">
                          {booking.userName}
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
                      <Chip
                        icon={<EventIcon />}
                        label={formatDate(booking.date)}
                        variant="outlined"
                        size="small"
                      />
                      <Chip
                        icon={<TimeIcon />}
                        label={`${booking.startTime} - ${booking.endTime}`}
                        variant="outlined"
                        size="small"
                      />
                      <Chip
                        icon={<PersonIcon />}
                        label={t('dashboard.pastBookings.people', { count: booking.numberOfPeople })}
                        variant="outlined"
                        size="small"
                      />
                    </Box>
                    
                    <Chip
                      label={t(`dashboard.pastBookings.status.${booking.status}`)}
                      color={booking.status === 'completed' ? 'success' : 'default'}
                      size="small"
                    />
                    
                    {booking.rating && (
                      <Box mt={2}>
                        <Box display="flex" alignItems="center" mb={1}>
                          <Rating value={booking.rating} precision={0.5} readOnly size="small" />
                          <Typography variant="body2" sx={{ ml: 1 }}>
                            ({booking.rating})
                          </Typography>
                        </Box>
                        
                        {booking.review && (
                          <Box
                            sx={{
                              p: 1.5,
                              bgcolor: 'action.hover',
                              borderRadius: 1,
                              position: 'relative'
                            }}
                          >
                            <CommentIcon
                              fontSize="small"
                              sx={{
                                position: 'absolute',
                                top: -10,
                                left: 10,
                                color: 'text.secondary',
                                transform: 'rotate(180deg)'
                              }}
                            />
                            <Typography variant="body2">{booking.review}</Typography>
                          </Box>
                        )}
                      </Box>
                    )}
                  </Grid>
                  
                  <Grid item xs={12} sm={4} display="flex" flexDirection="column" justifyContent="center">
                    <Box 
                      sx={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        gap: 1,
                        mt: { xs: 2, sm: 0 }
                      }}
                    >
                      <Button
                        variant="outlined"
                        color="primary"
                        fullWidth
                      >
                        {t('dashboard.pastBookings.viewDetails')}
                      </Button>
                      {booking.status === 'completed' && !booking.review && (
                        <Button
                          variant="outlined"
                          color="warning"
                          fullWidth
                        >
                          {t('dashboard.pastBookings.reminderForReview')}
                        </Button>
                      )}
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </ListItem>
        </React.Fragment>
      ))}
    </List>
  );
};

export default PastBookings;
