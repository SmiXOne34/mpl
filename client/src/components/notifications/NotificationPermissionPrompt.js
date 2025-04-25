import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { requestNotificationPermission, areNotificationsSupported } from '../../utils/browserNotifications';
import { saveNotificationPreferences, getNotificationPreferences } from '../../utils/notificationPreferences';

// Material UI
import {
  Button,
  Paper,
  Typography,
  Box,
  Snackbar,
  makeStyles
} from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import { NotificationsActive, NotificationsOff } from '@material-ui/icons';

const useStyles = makeStyles((theme) => ({
  paper: {
    padding: theme.spacing(3),
    marginBottom: theme.spacing(3),
    display: 'flex',
    alignItems: 'center',
  },
  icon: {
    fontSize: 40,
    marginRight: theme.spacing(2),
    color: theme.palette.primary.main,
  },
  content: {
    flexGrow: 1,
  },
  title: {
    marginBottom: theme.spacing(1),
  },
  actions: {
    marginTop: theme.spacing(2),
  },
  button: {
    marginRight: theme.spacing(1),
  },
}));

const NotificationPermissionPrompt = () => {
  const classes = useStyles();
  const [showPrompt, setShowPrompt] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('info');
  
  useEffect(() => {
    // Check if browser supports notifications
    if (!areNotificationsSupported()) {
      return;
    }
    
    // Check current permission status
    const currentPermission = Notification.permission;
    
    // Check if user has already made a choice
    const preferences = getNotificationPreferences();
    const hasPrompted = preferences.hasPromptedForNotifications;
    
    // Show prompt if:
    // 1. Permission is not granted or denied (it's "default")
    // 2. User hasn't been prompted before or it's been more than 7 days since last prompt
    if (currentPermission === 'default' && (!hasPrompted || isTimeToPromptAgain(preferences.lastPromptDate))) {
      setShowPrompt(true);
    }
  }, []);
  
  // Check if it's time to prompt again (after 7 days)
  const isTimeToPromptAgain = (lastPromptDate) => {
    if (!lastPromptDate) return true;
    
    const lastPrompt = new Date(lastPromptDate);
    const now = new Date();
    const daysSinceLastPrompt = Math.floor((now - lastPrompt) / (1000 * 60 * 60 * 24));
    
    return daysSinceLastPrompt >= 7;
  };
  
  const handleRequestPermission = async () => {
    try {
      const permission = await requestNotificationPermission();
      
      // Update preferences
      const preferences = getNotificationPreferences();
      preferences.hasPromptedForNotifications = true;
      preferences.lastPromptDate = new Date().toISOString();
      
      if (permission === 'granted') {
        preferences.pushNotifications = true;
        setSnackbarMessage('Notifications enabled successfully!');
        setSnackbarSeverity('success');
      } else {
        preferences.pushNotifications = false;
        setSnackbarMessage('Notification permission denied. You can change this in your browser settings.');
        setSnackbarSeverity('warning');
      }
      
      saveNotificationPreferences(preferences);
      setShowPrompt(false);
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      setSnackbarMessage('Error requesting notification permission');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };
  
  const handleDismiss = () => {
    // Update preferences to remember that user was prompted
    const preferences = getNotificationPreferences();
    preferences.hasPromptedForNotifications = true;
    preferences.lastPromptDate = new Date().toISOString();
    saveNotificationPreferences(preferences);
    
    setShowPrompt(false);
  };
  
  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };
  
  if (!showPrompt) {
    return null;
  }
  
  return (
    <>
      <Paper className={classes.paper}>
        <NotificationsActive className={classes.icon} />
        <div className={classes.content}>
          <Typography variant="h6" className={classes.title}>
            Enable Notifications
          </Typography>
          <Typography variant="body1">
            Would you like to receive notifications about new meals, voting reminders, and other important updates?
          </Typography>
          <Box className={classes.actions}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleRequestPermission}
              className={classes.button}
            >
              Enable Notifications
            </Button>
            <Button
              variant="outlined"
              onClick={handleDismiss}
            >
              Not Now
            </Button>
          </Box>
        </div>
      </Paper>
      
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default NotificationPermissionPrompt;