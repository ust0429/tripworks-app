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
  CardActions,
  Avatar,
  Button,
  Chip,
  Divider,
  Grid,
  Alert
} from '../../../mocks/materialMock';
import {
  Event as EventIcon,
  PersonOutline as PersonIcon,
  AccessTime as TimeIcon
} from '../../../mocks/iconsMock';

interface Request {
  id: string;
  userId: string;
  userName: string;
  userImage: string;
  date: Date;
  numberOfPeople: number;
  message: string;
  status: string;
  createdAt: Date;
}

interface RequestsListProps {
  requests: Request[];
  onAccept: (requestId: string) => void;
  onDecline: (requestId: string) => void;
}

const RequestsList: React.FC<RequestsListProps> = ({ 
  requests,
  onAccept,
  onDecline
}) => {
  const { t } = useTranslation(['attender', 'common']);

  if (requests.length === 0) {
    return (
      <Alert severity="info">
        {t('dashboard.requests.empty')}
      </Alert>
    );
  }

  // 日付をフォーマット
  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(new Date(date));
  };

  // 時間経過の表示
  const getTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffInMs = now.getTime() - new Date(date).getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 60) {
      return t('common.timeAgo.minutes', { count: diffInMinutes });
    } else if (diffInHours < 24) {
      return t('common.timeAgo.hours', { count: diffInHours });
    } else {
      return t('common.timeAgo.days', { count: diffInDays });
    }
  };

  return (
    <List disablePadding>
      {requests.map((request, index) => (
        <React.Fragment key={request.id}>
          {index > 0 && <Divider component="li" />}
          <ListItem alignItems="flex-start" disablePadding>
            <Card sx={{ width: '100%', mb: 0, boxShadow: 'none' }}>
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={8}>
                    <Box display="flex" alignItems="center" mb={2}>
                      <Avatar 
                        src={request.userImage}
                        alt={request.userName}
                        sx={{ mr: 2 }}
                      >
                        {!request.userImage && request.userName.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="h6">
                          {request.userName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          <TimeIcon fontSize="inherit" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                          {getTimeAgo(request.createdAt)}
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      {request.message}
                    </Typography>
                    
                    <Box display="flex" flexWrap="wrap" gap={1}>
                      <Chip
                        icon={<EventIcon />}
                        label={formatDate(request.date)}
                        variant="outlined"
                        size="small"
                      />
                      <Chip
                        icon={<PersonIcon />}
                        label={t('dashboard.requests.people', { count: request.numberOfPeople })}
                        variant="outlined"
                        size="small"
                      />
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} sm={4} display="flex" flexDirection="column" justifyContent="center">
                    <Box 
                      sx={{ 
                        display: 'flex', 
                        flexDirection: { xs: 'row', sm: 'column' }, 
                        gap: 1,
                        mt: { xs: 2, sm: 0 }
                      }}
                    >
                      <Button
                        variant="contained"
                        color="primary"
                        fullWidth
                        onClick={() => onAccept(request.id)}
                      >
                        {t('dashboard.requests.accept')}
                      </Button>
                      <Button
                        variant="outlined"
                        color="inherit"
                        fullWidth
                        onClick={() => onDecline(request.id)}
                      >
                        {t('dashboard.requests.decline')}
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

export default RequestsList;
