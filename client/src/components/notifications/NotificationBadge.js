import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { getNotifications } from '../../actions/notificationActions';

// Material UI
import { Badge, makeStyles } from '@material-ui/core';
import { Notifications } from '@material-ui/icons';

const useStyles = makeStyles((theme) => ({
  badge: {
    backgroundColor: theme.palette.secondary.main,
    color: theme.palette.secondary.contrastText,
  },
  icon: {
    fontSize: '1.5rem',
  },
}));

const NotificationBadge = ({ notification: { unreadCount }, getNotifications }) => {
  const classes = useStyles();
  
  useEffect(() => {
    getNotifications();
    
    // Set up interval to check for new notifications every 5 minutes
    const interval = setInterval(() => {
      getNotifications();
    }, 5 * 60 * 1000);
    
    // Clean up interval on unmount
    return () => clearInterval(interval);
  }, [getNotifications]);
  
  // unreadCount is now directly from the state
  
  return (
    <Badge 
      badgeContent={unreadCount} 
      color="secondary"
      classes={{ badge: classes.badge }}
      overlap="circular"
      max={99}
    >
      <Notifications className={classes.icon} />
    </Badge>
  );
};

NotificationBadge.propTypes = {
  notification: PropTypes.object.isRequired,
  getNotifications: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  notification: state.notification,
});

export default connect(mapStateToProps, { getNotifications })(NotificationBadge);