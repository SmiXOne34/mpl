import React, { useState, useEffect } from 'react';
import { saveNotificationPreferences, getNotificationPreferences } from '../../utils/notificationPreferences';
import { playNotificationSound } from '../../utils/browserNotifications';

// Material UI
import {
  IconButton,
  Tooltip,
  makeStyles
} from '@material-ui/core';
import {
  VolumeUp,
  VolumeOff
} from '@material-ui/icons';

const useStyles = makeStyles((theme) => ({
  iconButton: {
    padding: theme.spacing(1),
  },
}));

const NotificationSoundToggle = () => {
  const classes = useStyles();
  const [soundsEnabled, setSoundsEnabled] = useState(true);
  
  // Load sound preference on mount
  useEffect(() => {
    const preferences = getNotificationPreferences();
    setSoundsEnabled(preferences.notificationSounds);
  }, []);
  
  const handleToggleSound = () => {
    // Get current preferences
    const preferences = getNotificationPreferences();
    
    // Toggle sound setting
    const newSoundSetting = !soundsEnabled;
    
    // Update preferences
    preferences.notificationSounds = newSoundSetting;
    saveNotificationPreferences(preferences);
    
    // Update state
    setSoundsEnabled(newSoundSetting);
    
    // Play a sound if enabling
    if (newSoundSetting) {
      playNotificationSound('/notification.mp3', true);
    }
  };
  
  return (
    <Tooltip title={soundsEnabled ? 'Notification sounds on' : 'Notification sounds off'}>
      <IconButton
        color="inherit"
        onClick={handleToggleSound}
        className={classes.iconButton}
        aria-label="Toggle notification sounds"
      >
        {soundsEnabled ? <VolumeUp /> : <VolumeOff />}
      </IconButton>
    </Tooltip>
  );
};

export default NotificationSoundToggle;