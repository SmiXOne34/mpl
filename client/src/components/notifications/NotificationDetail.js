import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { useParams, useHistory } from 'react-router-dom';
import PropTypes from 'prop-types';
import { getNotifications, markAsRead } from '../../actions/notificationActions';
import { formatDate } from '../../utils/dateUtils';

// Material UI
import {
  Container,
  Paper,
  Typography,
  Button,
  Divider,
  Box,
  Chip,
  CircularProgress,
  makeStyles
} from '@material-ui/core';
import {
  ArrowBack,
  RestaurantMenu,
  Event,
  Info,
  CheckCircle,
  Schedule
} from '@material-ui/icons';
import { Alert } from '@material-ui/lab';

const useStyles = makeStyles((theme) => ({
  container: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
  },
  paper: {
    padding: theme.spacing(3),
    marginBottom: theme.spacing(3),
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing(2),
  },
  title: {
    marginBottom: theme.spacing(2),
  },
  backButton: {
    marginBottom: theme.spacing(3),
  },
  content: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  metadata: {
    display: 'flex',
    flexWrap: 'wrap',
    marginTop: theme.spacing(3),
    '& > *': {
      margin: theme.spacing(0.5),
    },
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '50vh',
  },
  notFoundContainer: {
    textAlign: 'center',
    padding: theme.spacing(4),
  },
  actionButton: {
    marginTop: theme.spacing(2),
  },
  typeIcon: {
    marginRight: theme.spacing(1),
    verticalAlign: 'middle',
  },
}));

const NotificationDetail = ({
  notification: { notifications, loading, error },
  getNotifications,
  markAsRead
}) => {
  const classes = useStyles();
  const { id } = useParams();
  const history = useHistory();
  
  useEffect(() => {
    getNotifications();
  }, [getNotifications]);
  
  // Find the notification with the matching ID
  const currentNotification = notifications?.find(n => n._id === id);
  
  // Mark as read when viewing details
  useEffect(() => {
    if (currentNotification && !currentNotification.read) {
      markAsRead(id);
    }
  }, [currentNotification, id, markAsRead]);
  
  // Get notification icon based on type
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'meal':
        return <RestaurantMenu color="primary" />;
      case 'event':
        return <Event color="primary" />;
      default:
        return <Info color="primary" />;
    }
  };
  
  // Handle back button click
  const handleBack = () => {
    history.goBack();
  };
  
  // Handle action button click
  const handleAction = () => {
    if (currentNotification && currentNotification.link) {
      history.push(currentNotification.link);
    }
  };
  
  if (loading) {
    return (
      <Container className={classes.container}>
        <div className={classes.loadingContainer}>
          <CircularProgress />
        </div>
      </Container>
    );
  }
  
  if (!currentNotification) {
    return (
      <Container className={classes.container}>
        <Button
          variant="outlined"
          color="primary"
          onClick={handleBack}
          startIcon={<ArrowBack />}
          className={classes.backButton}
        >
          Back
        </Button>
        
        <Paper className={classes.notFoundContainer}>
          <Typography variant="h5" gutterBottom>
            Notification Not Found
          </Typography>
          <Typography variant="body1">
            The notification you're looking for doesn't exist or has been deleted.
          </Typography>
        </Paper>
      </Container>
    );
  }
  
  return (
    <Container className={classes.container}>
      <Button
        variant="outlined"
        color="primary"
        onClick={handleBack}
        startIcon={<ArrowBack />}
        className={classes.backButton}
      >
        Back to Notifications
      </Button>
      
      {error && (
        <Alert severity="error" style={{ marginBottom: 16 }}>
          {error}
        </Alert>
      )}
      
      <Paper className={classes.paper}>
        <div className={classes.header}>
          <Typography variant="h4" component="h1" className={classes.title}>
            {getNotificationIcon(currentNotification.type)}
            {' '}
            {currentNotification.title}
          </Typography>
          <Chip 
            icon={<CheckCircle />} 
            label={currentNotification.read ? "Read" : "Unread"} 
            color={currentNotification.read ? "default" : "primary"}
            variant={currentNotification.read ? "outlined" : "default"}
          />
        </div>
        
        <Divider />
        
        <div className={classes.content}>
          <Typography variant="body1" paragraph>
            {currentNotification.message}
          </Typography>
          
          {currentNotification.link && (
            <Button
              variant="contained"
              color="primary"
              onClick={handleAction}
              className={classes.actionButton}
            >
              View Related Content
            </Button>
          )}
        </div>
        
        <Divider />
        
        <div className={classes.metadata}>
          <Chip 
            icon={getNotificationIcon(currentNotification.type)} 
            label={`Type: ${currentNotification.type.charAt(0).toUpperCase() + currentNotification.type.slice(1)}`} 
            variant="outlined" 
          />
          <Chip 
            icon={<Schedule />} 
            label={`Created: ${formatDate(currentNotification.createdAt, { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric',
              hour: 'numeric',
              minute: 'numeric'
            })}`} 
            variant="outlined" 
          />
        </div>
      </Paper>
    </Container>
  );
};

NotificationDetail.propTypes = {
  notification: PropTypes.object.isRequired,
  getNotifications: PropTypes.func.isRequired,
  markAsRead: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
  notification: state.notification
});

export default connect(mapStateToProps, { getNotifications, markAsRead })(NotificationDetail);