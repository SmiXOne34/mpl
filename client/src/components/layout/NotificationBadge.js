import React, { useState, useEffect, useRef } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { getNotifications, markAsRead } from '../../actions/notificationActions';
import { formatDate } from '../../utils/dateUtils';

// Material UI
import {
  Badge,
  IconButton,
  Popover,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Button,
  Divider,
  Box,
  makeStyles
} from '@material-ui/core';
import {
  Notifications,
  RestaurantMenu,
  Event,
  Info,
  FiberNew
} from '@material-ui/icons';

const useStyles = makeStyles((theme) => ({
  notificationIcon: {
    color: theme.palette.common.white,
  },
  popover: {
    width: 360,
    maxWidth: '100%',
  },
  header: {
    padding: theme.spacing(2),
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
  },
  notificationList: {
    maxHeight: 300,
    overflow: 'auto',
  },
  notificationItem: {
    borderLeft: '4px solid transparent',
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
    padding: theme.spacing(1, 2),
    display: 'flex',
    justifyContent: 'center',
    borderTop: `1px solid ${theme.palette.divider}`,
  },
  noNotifications: {
    padding: theme.spacing(2),
    textAlign: 'center',
    color: theme.palette.text.secondary,
  },
  newIndicator: {
    color: theme.palette.primary.main,
    marginLeft: theme.spacing(1),
  },
}));

const NotificationBadge = ({
  notification: { notifications, loading },
  getNotifications,
  markAsRead
}) => {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = useState(null);
  const notificationsRef = useRef(notifications);
  
  useEffect(() => {
    getNotifications();
    
    // Set up polling for new notifications (every 60 seconds)
    const interval = setInterval(() => {
      getNotifications();
    }, 60000);
    
    return () => clearInterval(interval);
  }, [getNotifications]);
  
  // Check for new notifications and play sound if needed
  useEffect(() => {
    if (notifications && notificationsRef.current) {
      // Check if there are new unread notifications
      const prevUnreadCount = notificationsRef.current.filter(n => !n.read).length;
      const currentUnreadCount = notifications.filter(n => !n.read).length;
      
      if (currentUnreadCount > prevUnreadCount) {
        // New notification received, could play sound here
      }
    }
    
    // Update ref
    notificationsRef.current = notifications;
  }, [notifications]);
  
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleClose = () => {
    setAnchorEl(null);
  };
  
  const handleNotificationClick = (id) => {
    markAsRead(id);
    handleClose();
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
  
  // Get unread count
  const unreadCount = notifications ? notifications.filter(n => !n.read).length : 0;
  
  // Get recent notifications (up to 5)
  const recentNotifications = notifications ? notifications.slice(0, 5) : [];
  
  const open = Boolean(anchorEl);
  
  return (
    <>
      <IconButton
        aria-label="notifications"
        color="inherit"
        onClick={handleClick}
      >
        <Badge badgeContent={unreadCount} color="secondary">
          <Notifications className={classes.notificationIcon} />
        </Badge>
      </IconButton>
      
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        classes={{
          paper: classes.popover,
        }}
      >
        <div className={classes.header}>
          <Typography variant="subtitle1">
            Notifications
          </Typography>
          {unreadCount > 0 && (
            <Badge badgeContent={unreadCount} color="secondary">
              <Notifications />
            </Badge>
          )}
        </div>
        
        {recentNotifications.length > 0 ? (
          <>
            <List className={classes.notificationList}>
              {recentNotifications.map((notification) => (
                <ListItem
                  key={notification._id}
                  button
                  component={RouterLink}
                  to={`/notifications/${notification._id}`}
                  onClick={() => handleNotificationClick(notification._id)}
                  className={`${classes.notificationItem} ${!notification.read ? classes.unreadNotification : ''}`}
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
              ))}
            </List>
            
            <Divider />
            
            <div className={classes.footer}>
              <Button
                color="primary"
                component={RouterLink}
                to="/notifications"
                onClick={handleClose}
              >
                View All Notifications
              </Button>
            </div>
          </>
        ) : (
          <div className={classes.noNotifications}>
            <Typography variant="body1">
              No notifications to display
            </Typography>
          </div>
        )}
      </Popover>
    </>
  );
};

NotificationBadge.propTypes = {
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
})(NotificationBadge);