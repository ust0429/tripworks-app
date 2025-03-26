import React from 'react';
import { useTranslation } from '../../../mocks/i18nMock';
import { RequestData } from '../../../types/dashboard';
import {
  Paper,
  Typography,
  Box,
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

// 互換性のため
interface Request extends RequestData {
  userImage: string;
  message: string;
}

interface RequestsListProps {
  requests: RequestData[] | Request[];
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
      <Box textAlign="center" py={3}>
        <Alert severity="info">
          現在保留中のリクエストはありません
        </Alert>
      </Box>
    );
  }

  // 時間表示を整形
  const getTimeAgo = (dateString: string): string => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMs = now.getTime() - date.getTime();
    
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInMinutes < 60) {
      return t('common.timeAgo.minutes', { count: diffInMinutes });
    } else if (diffInHours < 24) {
      return t('common.timeAgo.hours', { count: diffInHours });
    } else {
      return t('common.timeAgo.days', { count: diffInDays });
    }
  };

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
      {requests.map((request) => (
        <React.Fragment key={request.id}>
          <ListItem alignItems="flex-start" sx={{ px: 0 }}>
            <Card sx={{ width: '100%' }}>
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={2}>
                    <Box display="flex" flexDirection="column" alignItems="center">
                      <Avatar
                        alt={request.userName}
                        src={request.userAvatar || request.userImage}
                        sx={{ width: 60, height: 60, mb: 1 }}
                      />
                      <Typography variant="subtitle2">
                        {request.userName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {getTimeAgo(request.createdAt)}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={10}>
                    <Typography variant="h6" gutterBottom>
                      {request.experienceTitle}
                    </Typography>
                    
                    <Box display="flex" alignItems="center" mb={1}>
                      <EventIcon sx={{ mr: 1, color: 'primary.main' }} />
                      <Typography variant="body2">
                        {formatDate(request.date)}
                      </Typography>
                    </Box>
                    
                    <Box display="flex" alignItems="center" mb={1}>
                      <TimeIcon sx={{ mr: 1, color: 'primary.main' }} />
                      <Typography variant="body2">
                        リクエスト日時: {new Date(request.createdAt).toLocaleString('ja-JP')}
                      </Typography>
                    </Box>
                    
                    <Box display="flex" alignItems="center" mb={2}>
                      <Chip
                        icon={<PersonIcon />}
                        label={t('dashboard.requests.people', { count: request.numberOfPeople })}
                        variant="outlined"
                        size="small"
                      />
                    </Box>
                    
                    {request.specialRequests && (
                      <Box mb={2}>
                        <Typography variant="body2" fontWeight="medium">
                          特別リクエスト:
                        </Typography>
                        <Typography variant="body2">
                          {request.specialRequests || request.message}
                        </Typography>
                      </Box>
                    )}
                  </Grid>
                </Grid>
              </CardContent>
              <Divider />
              <CardActions>
                <Button
                  onClick={() => onAccept(request.id)}
                  variant="contained"
                  color="primary"
                  size="small"
                >
                  承認する
                </Button>
                <Button
                  onClick={() => onDecline(request.id)}
                  variant="outlined"
                  color="error"
                  size="small"
                >
                  断る
                </Button>
              </CardActions>
            </Card>
          </ListItem>
          <Divider variant="inset" component="li" />
        </React.Fragment>
      ))}
    </List>
  );
};

export default RequestsList;
