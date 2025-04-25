import { areSoundsEnabled, areBrowserNotificationsEnabled } from './notificationPreferences';

/**
 * Request permission for browser notifications
 * @returns {Promise<string>} - Permission status: 'granted', 'denied', or 'default'
 */
export const requestNotificationPermission = async () => {
  // Check if the browser supports notifications
  if (!('Notification' in window)) {
    console.log('This browser does not support desktop notifications');
    return 'not-supported';
  }
  
  // Check if permission is already granted
  if (Notification.permission === 'granted') {
    return 'granted';
  }
  
  // Request permission
  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission;
  }
  
  return Notification.permission;
};

/**
 * Play notification sound
 * @param {string} soundUrl - URL to sound file (default: notification sound)
 * @param {boolean} forcePlay - Whether to play the sound regardless of user preferences
 */
export const playNotificationSound = (soundUrl = '/notification.mp3', forcePlay = false) => {
  // Check if sounds are enabled in user preferences
  if (!forcePlay && !areSoundsEnabled()) {
    return;
  }
  
  try {
    const audio = new Audio(soundUrl);
    audio.play().catch(err => {
      console.log('Error playing notification sound:', err);
    });
  } catch (err) {
    console.log('Error creating audio element:', err);
  }
};

/**
 * Show a browser notification
 * @param {string} title - Notification title
 * @param {Object} options - Notification options
 * @param {string} options.body - Notification body text
 * @param {string} options.icon - URL to notification icon
 * @param {string} options.link - URL to open when notification is clicked
 * @param {boolean} options.sound - Whether to play a sound (default: true)
 * @param {string} options.soundUrl - URL to sound file
 * @returns {Notification|null} - Notification object or null if not supported/permitted
 */
export const showBrowserNotification = (title, options = {}) => {
  // Check if notifications are supported, permitted, and enabled in user preferences
  if (!options.forceShow && !areBrowserNotificationsEnabled()) {
    return null;
  }
  
  // Check if notifications are supported and permitted
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return null;
  }
  
  // Create notification
  const notification = new Notification(title, {
    body: options.body || '',
    icon: options.icon || '/logo192.png',
    tag: options.tag || undefined,
    requireInteraction: options.requireInteraction || false,
  });
  
  // Add click handler if link is provided
  if (options.link) {
    notification.onclick = () => {
      window.open(options.link, '_blank');
      notification.close();
    };
  }
  
  // Play sound if enabled in options and user preferences
  if (options.sound !== false) {
    playNotificationSound(options.soundUrl, options.forceSound);
  }
  
  return notification;
};

/**
 * Check if browser notifications are supported and permitted
 * @returns {boolean} - Whether browser notifications are supported and permitted
 */
export const areNotificationsSupported = () => {
  return 'Notification' in window;
};

/**
 * Check if browser notifications are permitted
 * @returns {boolean} - Whether browser notifications are permitted
 */
export const areNotificationsPermitted = () => {
  return areNotificationsSupported() && Notification.permission === 'granted';
};