/**
 * Default notification preferences
 */
export const DEFAULT_PREFERENCES = {
  // Notification types
  notifyVotingOpen: true,
  notifyVotingClosing: true,
  notifyNewMenu: true,
  notifyNewMeals: true,
  notifySelectionReminders: true,
  
  // Categorized notification types
  mealNotifications: true,
  eventNotifications: true,
  systemNotifications: true,
  
  // Notification methods
  emailNotifications: true,
  pushNotifications: false,
  notificationSounds: true,
  
  // Frequency settings
  dailyDigest: false,
  weeklyDigest: false,
};

/**
 * Get notification preferences from localStorage or use defaults
 * @returns {Object} Notification preferences
 */
export const getNotificationPreferences = () => {
  try {
    const storedPreferences = localStorage.getItem('notificationPreferences');
    if (storedPreferences) {
      // Merge with default preferences to ensure all properties exist
      return {
        ...DEFAULT_PREFERENCES,
        ...JSON.parse(storedPreferences)
      };
    }
  } catch (error) {
    console.error('Error retrieving notification preferences:', error);
  }
  
  // Return default preferences if nothing in localStorage
  return DEFAULT_PREFERENCES;
};

/**
 * Save notification preferences to localStorage
 * @param {Object} preferences - Notification preferences to save
 */
export const saveNotificationPreferences = (preferences) => {
  try {
    localStorage.setItem('notificationPreferences', JSON.stringify(preferences));
  } catch (error) {
    console.error('Error saving notification preferences:', error);
  }
};

/**
 * Check if a specific notification type is enabled
 * @param {string} type - Notification type to check
 * @returns {boolean} Whether the notification type is enabled
 */
export const isNotificationTypeEnabled = (type) => {
  const preferences = getNotificationPreferences();
  
  switch (type) {
    case 'voting-open':
      return preferences.notifyVotingOpen;
    case 'voting-closing':
      return preferences.notifyVotingClosing;
    case 'new-menu':
      return preferences.notifyNewMenu;
    case 'new-meals':
      return preferences.notifyNewMeals;
    case 'selection-reminders':
      return preferences.notifySelectionReminders;
    default:
      return true;
  }
};

/**
 * Check if notification sounds are enabled
 * @returns {boolean} Whether notification sounds are enabled
 */
export const areSoundsEnabled = () => {
  const preferences = getNotificationPreferences();
  return preferences.notificationSounds;
};

/**
 * Check if browser notifications are enabled
 * @returns {boolean} Whether browser notifications are enabled
 */
export const areBrowserNotificationsEnabled = () => {
  const preferences = getNotificationPreferences();
  return preferences.pushNotifications && 
         'Notification' in window && 
         Notification.permission === 'granted';
};

/**
 * Check if email notifications are enabled
 * @returns {boolean} Whether email notifications are enabled
 */
export const areEmailNotificationsEnabled = () => {
  const preferences = getNotificationPreferences();
  return preferences.emailNotifications;
};

/**
 * Check if a specific notification category is enabled
 * @param {string} category - Notification category (meal, event, system)
 * @returns {boolean} Whether the notification category is enabled
 */
export const isNotificationCategoryEnabled = (category) => {
  const preferences = getNotificationPreferences();
  
  switch (category) {
    case 'meal':
      return preferences.mealNotifications;
    case 'event':
      return preferences.eventNotifications;
    case 'system':
      return preferences.systemNotifications;
    default:
      return true;
  }
};