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
  Alert
} from '../../../mocks/materialMock';
import {
  Event as EventIcon,
  AccessTime as TimeIcon,
  PersonOutline as PersonIcon,
  LocalActivity as ActivityIcon
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
  createdAt: Date;
}

interface UpcomingBookingsProps {
  bookings: Booking[];
}

const UpcomingBookings: React.FC<UpcomingBookingsProps> = ({ bookings }) => {
  const { t } = useTranslation(['attender', 'common']);

  if (bookings.length === 0) {
    return (
      <Alert severity="info">
        {t('dashboard.upcomingBookings.empty')}
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

  // 日付を比較して近い順に並べ替え
  const sortedBookings = [...bookings].sort((a, b) => {
    return new Date(a.date).getTime() - new Date(b.date).getTime();
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
                        color="primary"
                      />
                      <Chip
                        icon={<TimeIcon />}
                        label={`${booking.startTime} - ${booking.endTime}`}
                        variant="outlined"
                        size="small"
                      />
                      <Chip
                        icon={<PersonIcon />}
                        label={t('dashboard.upcomingBookings.people', { count: booking.numberOfPeople })}
                        variant="outlined"
                        size="small"
                      />
                    </Box>
                    
                    <Chip
                      label={t(`dashboard.upcomingBookings.status.${booking.status}`)}
                      color={booking.status === 'confirmed' ? 'success' : 'default'}
                      size="small"
                    />
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
                        {t('dashboard.upcomingBookings.viewDetails')}
                      </Button>
                      <Button
                        variant="outlined"
                        color="success"
                        fullWidth
                      >
                        {t('dashboard.upcomingBookings.message')}
                      </Button>
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

export default UpcomingBookings;
