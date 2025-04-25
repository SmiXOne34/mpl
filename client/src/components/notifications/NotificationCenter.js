import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { getNotifications, markAsRead, markAllAsRead } from '../../actions/notificationActions';
import { formatDate } from '../../utils/dateUtils';
import { groupNotificationsByDate, getDateLabel } from '../../utils/notificationUtils';

// Material UI
import {
  IconButton,
  Menu,
  MenuItem,
  Typography,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Button,
  Box,
  CircularProgress,
  makeStyles
} from '@material-ui/core';
import {
  RestaurantMenu,
  Event,
  Info,
  CheckCircle,
  FiberNew
} from '@material-ui/icons';
import NotificationBadge from './NotificationBadge';

const useStyles = makeStyles((theme) => ({
  notificationIcon: {
    marginRight: theme.spacing(1),
  },
  notificationMenu: {
    width: 320,
    maxHeight: 400,
  },
  notificationHeader: {
    padding: theme.spacing(2),
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
  dateHeader: {
    backgroundColor: theme.palette.background.default,
    padding: theme.spacing(1, 2),
    position: 'sticky',
    top: 0,
    zIndex: 1,
  },
  unreadNotification: {
    borderLeft: `4px solid ${theme.palette.primary.main}`,
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
  },
  notificationFooter: {
    padding: theme.spacing(1, 2),
    display: 'flex',
    justifyContent: 'space-between',
    borderTop: `1px solid ${theme.palette.divider}`,
  },
  noNotifications: {
    padding: theme.spacing(2),
    textAlign: 'center',
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing(2),
  },
  notificationTime: {
    color: theme.palette.text.secondary,
    fontSize: '0.75rem',
  },
  newIndicator: {
    color: theme.palette.primary.main,
    marginLeft: theme.spacing(1),
  },
}));

const NotificationCenter = ({
  notification: { notifications, unreadCount, loading },
  getNotifications,
  markAsRead,
  markAllAsRead
}) => {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = useState(null);
  
  useEffect(() => {
    getNotifications();
  }, [getNotifications]);
  
  const handleOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleClose = () => {
    setAnchorEl(null);
  };
  
  const handleNotificationClick = (id) => {
    markAsRead(id);
    handleClose();
  };
  
  const handleMarkAllAsRead = () => {
    // Mark all notifications as read
    markAllAsRead();
  };
  
  // Use the unreadCount from the state
  
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
  
  return (
    <>
      <IconButton
        aria-label="notifications"
        color="inherit"
        onClick={handleOpen}
      >
        <NotificationBadge />
      </IconButton>
      
      <Menu
        id="notification-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
        getContentAnchorEl={null}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          className: classes.notificationMenu,
        }}
      >
        <div className={classes.notificationHeader}>
          <Typography variant="h6">
            Notifications
          </Typography>
        </div>
        
        {loading ? (
          <div className={classes.loadingContainer}>
            <CircularProgress size={24} />
          </div>
        ) : (
          <>
            {notifications && notifications.length > 0 ? (
              <List className={classes.notificationList}>
                {Object.entries(groupNotificationsByDate(notifications))
                  .sort(([dateA], [dateB]) => new Date(dateB) - new Date(dateA))
                  .map(([dateKey, dateNotifications]) => (
                    <React.Fragment key={dateKey}>
                      <ListItem className={classes.dateHeader}>
                        <Typography variant="subtitle2" color="textSecondary">
                          {getDateLabel(dateKey)}
                        </Typography>
                      </ListItem>
                      {dateNotifications.map((notification) => (
                        <ListItem
                          key={notification._id}
                          button
                          component={RouterLink}
                          to={`/notifications/${notification._id}`}
                          className={`${classes.notificationItem} ${!notification.read ? classes.unreadNotification : ''}`}
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
                                  {notification.message}
                                </Typography>
                                <Typography variant="caption" display="block" className={classes.notificationTime}>
                                  {formatDate(notification.createdAt, { 
                                    hour: 'numeric',
                                    minute: 'numeric'
                                  })}
                                </Typography>
                              </>
                            }
                          />
                        </ListItem>
                      ))}
                    </React.Fragment>
                  ))}
              </List>
            ) : (
              <div className={classes.noNotifications}>
                <Info color="disabled" style={{ fontSize: 48, marginBottom: 8 }} />
                <Typography variant="body1">
                  No notifications to display
                </Typography>
              </div>
            )}
            
            {notifications && notifications.length > 0 && (
              <div className={classes.notificationFooter}>
                <Button
                  size="small"
                  color="primary"
                  startIcon={<CheckCircle />}
                  onClick={handleMarkAllAsRead}
                  disabled={unreadCount === 0}
                >
                  Mark All as Read
                </Button>
                <Button
                  size="small"
                  color="primary"
                  component={RouterLink}
                  to="/notifications"
                  onClick={handleClose}
                >
                  View All
                </Button>
              </div>
            )}
          </>
        )}
      </Menu>
    </>
  );
};

NotificationCenter.propTypes = {
  notification: PropTypes.object.isRequired,
  getNotifications: PropTypes.func.isRequired,
  markAsRead: PropTypes.func.isRequired,
  markAllAsRead: PropTypes.func.isRequired
};

const mapStateToProps = (state) => ({
  notification: state.notification,
});

export default connect(mapStateToProps, {
  getNotifications,
  markAsRead,
  markAllAsRead
})(NotificationCenter);