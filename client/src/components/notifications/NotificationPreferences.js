import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { updateProfile } from '../../actions/authActions';
import { setAlert } from '../../actions/alertActions';
import { saveNotificationPreferences, getNotificationPreferences } from '../../utils/notificationPreferences';
import { playNotificationSound, showBrowserNotification } from '../../utils/browserNotifications';

// Material UI
import {
  Typography,
  Paper,
  FormControl,
  FormGroup,
  FormControlLabel,
  Switch,
  Button,
  Divider,
  Box,
  makeStyles
} from '@material-ui/core';
import { Save, Notifications, VolumeUp, NotificationsActive } from '@material-ui/icons';
import { Alert } from '@material-ui/lab';

const useStyles = makeStyles((theme) => ({
  paper: {
    padding: theme.spacing(3),
    marginBottom: theme.spacing(3),
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
  formControl: {
    margin: theme.spacing(3, 0),
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginTop: theme.spacing(2),
  },
  testButtonsContainer: {
    display: 'flex',
    justifyContent: 'flex-start',
    marginTop: theme.spacing(2),
    '& > button': {
      marginRight: theme.spacing(2),
    },
  },
  divider: {
    margin: theme.spacing(3, 0),
  },
  alert: {
    marginBottom: theme.spacing(2),
  },
}));

const NotificationPreferences = ({ auth: { user, loading }, updateProfile, setAlert }) => {
  const classes = useStyles();
  const [formData, setFormData] = useState({
    notifyVotingOpen: true,
    notifyVotingClosing: true,
    notifyNewMenu: true,
    notifyNewMeals: true,
    notifySelectionReminders: true,
    emailNotifications: true,
    pushNotifications: false,
    notificationSounds: true,
  });
  
  const [success, setSuccess] = useState(false);
  
  useEffect(() => {
    // First try to get preferences from user profile
    if (user && user.notificationPreferences) {
      setFormData({
        notifyVotingOpen: user.notificationPreferences.notifyVotingOpen ?? true,
        notifyVotingClosing: user.notificationPreferences.notifyVotingClosing ?? true,
        notifyNewMenu: user.notificationPreferences.notifyNewMenu ?? true,
        notifyNewMeals: user.notificationPreferences.notifyNewMeals ?? true,
        notifySelectionReminders: user.notificationPreferences.notifySelectionReminders ?? true,
        emailNotifications: user.notificationPreferences.emailNotifications ?? true,
        pushNotifications: user.notificationPreferences.pushNotifications ?? false,
        notificationSounds: user.notificationPreferences.notificationSounds ?? true,
      });
    } else {
      // If not available in user profile, try localStorage
      const localPreferences = getNotificationPreferences();
      setFormData(localPreferences);
    }
  }, [user]);
  
  const {
    notifyVotingOpen,
    notifyVotingClosing,
    notifyNewMenu,
    notifyNewMeals,
    notifySelectionReminders,
    emailNotifications,
    pushNotifications,
    notificationSounds,
  } = formData;
  
  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.checked,
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Save to localStorage first (for immediate effect)
      saveNotificationPreferences(formData);
      
      // Update user profile with notification preferences
      await updateProfile({
        notificationPreferences: formData,
      });
      
      setSuccess(true);
      setAlert('Notification preferences updated successfully', 'success');
      
      // Reset success message after 3 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err) {
      setAlert('Failed to update notification preferences', 'error');
    }
  };
  
  // Test notification sound
  const handleTestSound = () => {
    // Force play sound regardless of current preferences
    playNotificationSound('/notification.mp3', true);
    setAlert('Testing notification sound', 'info');
  };
  
  // Test browser notification
  const handleTestNotification = () => {
    if ('Notification' in window && Notification.permission === 'granted') {
      showBrowserNotification('Test Notification', {
        body: 'This is a test notification from the Meal Planning app.',
        sound: true // Force sound
      });
      setAlert('Test notification sent', 'info');
    } else {
      setAlert('Browser notifications are not enabled', 'warning');
    }
  };
  
  return (
    <Paper className={classes.paper}>
      <div className={classes.title}>
        <Notifications className={classes.titleIcon} />
        <Typography variant="h5">
          Notification Preferences
        </Typography>
      </div>
      
      {success && (
        <Alert severity="success" className={classes.alert}>
          Your notification preferences have been updated successfully.
        </Alert>
      )}
      
      <Typography variant="body1" paragraph>
        Customize which notifications you want to receive and how you want to receive them.
      </Typography>
      
      <form onSubmit={handleSubmit}>
        <Typography variant="h6" gutterBottom>
          Notification Types
        </Typography>
        <FormControl component="fieldset" className={classes.formControl}>
          <FormGroup>
            <FormControlLabel
              control={
                <Switch
                  checked={notifyVotingOpen}
                  onChange={handleChange}
                  name="notifyVotingOpen"
                  color="primary"
                />
              }
              label="Notify me when voting opens"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={notifyVotingClosing}
                  onChange={handleChange}
                  name="notifyVotingClosing"
                  color="primary"
                />
              }
              label="Notify me when voting is closing soon"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={notifyNewMenu}
                  onChange={handleChange}
                  name="notifyNewMenu"
                  color="primary"
                />
              }
              label="Notify me when a new weekly menu is available"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={notifyNewMeals}
                  onChange={handleChange}
                  name="notifyNewMeals"
                  color="primary"
                />
              }
              label="Notify me when new meals are added"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={notifySelectionReminders}
                  onChange={handleChange}
                  name="notifySelectionReminders"
                  color="primary"
                />
              }
              label="Send me reminders to make my meal selections"
            />
          </FormGroup>
        </FormControl>
        
        <Divider className={classes.divider} />
        
        <Typography variant="h6" gutterBottom>
          Notification Methods
        </Typography>
        
        {/* Test buttons */}
        <div className={classes.testButtonsContainer}>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<VolumeUp />}
            onClick={handleTestSound}
          >
            Test Sound
          </Button>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<NotificationsActive />}
            onClick={handleTestNotification}
          >
            Test Notification
          </Button>
        </div>
        
        <FormControl component="fieldset" className={classes.formControl}>
          <FormGroup>
            <FormControlLabel
              control={
                <Switch
                  checked={emailNotifications}
                  onChange={handleChange}
                  name="emailNotifications"
                  color="primary"
                />
              }
              label="Email Notifications"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={pushNotifications}
                  onChange={handleChange}
                  name="pushNotifications"
                  color="primary"
                />
              }
              label="Push Notifications (Browser)"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={notificationSounds}
                  onChange={handleChange}
                  name="notificationSounds"
                  color="primary"
                />
              }
              label="Notification Sounds"
            />
          </FormGroup>
        </FormControl>
        
        <Box className={classes.buttonContainer}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            startIcon={<Save />}
            disabled={loading}
          >
            Save Preferences
          </Button>
        </Box>
      </form>
    </Paper>
  );
};

NotificationPreferences.propTypes = {
  auth: PropTypes.object.isRequired,
  updateProfile: PropTypes.func.isRequired,
  setAlert: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  auth: state.auth,
});

export default connect(mapStateToProps, { updateProfile, setAlert })(NotificationPreferences);