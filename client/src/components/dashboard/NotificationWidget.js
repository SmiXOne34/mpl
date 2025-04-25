import React, { useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { getNotifications, markAsRead } from '../../actions/notificationActions';
import { formatDate } from '../../utils/dateUtils';

// Material UI
import {
  Typography,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Button,
  Box,
  Divider,
  CircularProgress,
  makeStyles
} from '@material-ui/core';
import {
  RestaurantMenu,
  Event,
  Info,
  Notifications,
  FiberNew
} from '@material-ui/icons';

const useStyles = makeStyles((theme) => ({
  paper: {
    padding: theme.spacing(2),
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  title: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: theme.spacing(2),
  },
  titleIcon: {
    marginRight: theme.spacing(1),
    color: theme.palette.primary.main,
  },
  notificationList: {
    maxHeight: 300,
    overflow: 'auto',
    flexGrow: 1,
  },
  notificationItem: {
    borderLeft: '4px solid transparent',
    marginBottom: theme.spacing(1),
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
  },
  unreadNotification: {
    borderLeft: `4px solid ${theme.palette.primary.main}`,
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
  },
  notificationTime: {
    color: theme.palette.text.secondary,
    fontSize: '0.75rem',
  },
  footer: {
    marginTop: theme.spacing(2),
    display: 'flex',
    justifyContent: 'flex-end',
  },
  noNotifications: {
    padding: theme.spacing(2),
    textAlign: 'center',
    color: theme.palette.text.secondary,
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing(4),
  },
  newIndicator: {
    color: theme.palette.primary.main,
    marginLeft: theme.spacing(1),
  },
}));

const NotificationWidget = ({
  notification: { notifications, loading },
  getNotifications,
  markAsRead
}) => {
  const classes = useStyles();
  
  useEffect(() => {
    getNotifications();
  }, [getNotifications]);
  
  const handleNotificationClick = (id) => {
    markAsRead(id);
  };
  
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
  
  // Get recent notifications (up to 3)
  const recentNotifications = notifications ? notifications.slice(0, 3) : [];
  
  // Get unread count
  const unreadCount = notifications ? notifications.filter(n => !n.read).length : 0;
  
  return (
    <Paper className={classes.paper}>
      <div className={classes.title}>
        <Notifications className={classes.titleIcon} />
        <Typography variant="h6">
          Recent Notifications
          {unreadCount > 0 && (
            <Box 
              component="span" 
              bgcolor="secondary.main" 
              color="secondary.contrastText" 
              borderRadius="50%" 
              px={1} 
              ml={1}
              fontSize="0.75rem"
            >
              {unreadCount}
            </Box>
          )}
        </Typography>
      </div>
      
      {loading ? (
        <div className={classes.loadingContainer}>
          <CircularProgress size={24} />
        </div>
      ) : (
        <>
          {recentNotifications.length > 0 ? (
            <>
              <List className={classes.notificationList}>
                {recentNotifications.map((notification) => (
                  <Paper 
                    key={notification._id} 
                    variant="outlined"
                    className={`${classes.notificationItem} ${!notification.read ? classes.unreadNotification : ''}`}
                  >
                    <ListItem
                      button
                      component={RouterLink}
                      to={`/notifications/${notification._id}`}
                      onClick={() => handleNotificationClick(notification._id)}
                    >
                      <ListItemIcon>
                        {getNotificationIcon(notification.type)}
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box display="flex" alignItems="center">
                            {notification.title}
                            {!notification.read && (
                              <FiberNew className={classes.newIndicator} fontSize="small" />
                            )}
                          </Box>
                        }
                        secondary={
                          <>
                            <Typography variant="body2" component="span">
                              {notification.message.length > 60
                                ? `${notification.message.substring(0, 60)}...`
                                : notification.message}
                            </Typography>
                            <Typography variant="caption" display="block" className={classes.notificationTime}>
                              {formatDate(notification.createdAt, { 
                                year: 'numeric', 
                                month: 'short', 
                                day: 'numeric',
                                hour: 'numeric',
                                minute: 'numeric'
                              })}
                            </Typography>
                          </>
                        }
                      />
                    </ListItem>
                  </Paper>
                ))}
              </List>
              
              <Divider />
              
              <div className={classes.footer}>
                <Button
                  color="primary"
                  component={RouterLink}
                  to="/notifications"
                >
                  View All Notifications
                </Button>
              </div>
            </>
          ) : (
            <div className={classes.noNotifications}>
              <Info color="disabled" style={{ fontSize: 40, marginBottom: 8 }} />
              <Typography variant="body1">
                No notifications to display
              </Typography>
            </div>
          )}
        </>
      )}
    </Paper>
  );
};

NotificationWidget.propTypes = {
  notification: PropTypes.object.isRequired,
  getNotifications: PropTypes.func.isRequired,
  markAsRead: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  notification: state.notification,
});

export default connect(mapStateToProps, {
  getNotifications,
  markAsRead,
})(NotificationWidget);