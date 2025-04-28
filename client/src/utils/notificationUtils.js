import { createNotification } from '../actions/notificationActions';
import { formatDate } from './dateUtils';

/**
 * Check if a notification should be created based on last notification time
 * @param {Array} notifications - Current notifications
 * @param {string} title - Notification title to check for
 * @param {number} minInterval - Minimum interval in hours between notifications
 * @returns {boolean} - Whether a new notification should be created
 */
export const shouldCreateNotification = (notifications, title, minInterval = 24) => {
  if (!notifications || notifications.length === 0) return true;
  
  // Find the most recent notification with the same title
  const existingNotification = notifications
    .filter(n => n.title === title)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
  
  if (!existingNotification) return true;
  
  // Check if enough time has passed since the last notification
  const lastNotificationTime = new Date(existingNotification.createdAt).getTime();
  const currentTime = new Date().getTime();
  const hoursSinceLastNotification = (currentTime - lastNotificationTime) / (1000 * 60 * 60);
  
  return hoursSinceLastNotification >= minInterval;
};

/**
 * Generate reminder notifications based on voting status
 * @param {Object} votingStatus - Current voting status
 * @param {Function} dispatch - Redux dispatch function
 * @param {Array} notifications - Current notifications
 */
export const generateReminders = (votingStatus, dispatch, notifications = []) => {
  if (!votingStatus) return;
  
  // If voting is open, remind users to vote
  if (votingStatus.isOpen) {
    const hoursRemaining = votingStatus.hoursRemaining;
    const minutesRemaining = votingStatus.minutesRemaining;
    
    // Create urgent reminder if less than 6 hours remaining
    if (hoursRemaining < 6) {
      const title = 'Urgent: Voting Closing Soon';
      if (shouldCreateNotification(notifications, title, 3)) { // Check every 3 hours
        dispatch(createNotification({
          title,
          message: `Meal voting closes in ${hoursRemaining} hours and ${minutesRemaining} minutes. Cast your votes now!`,
          type: 'event',
          link: '/meals/select'
        }));
      }
    } 
    // Create regular reminder if less than 24 hours remaining
    else if (hoursRemaining < 24) {
      const title = 'Reminder: Voting Closing Soon';
      if (shouldCreateNotification(notifications, title, 6)) { // Check every 6 hours
        dispatch(createNotification({
          title,
          message: `Meal voting closes in ${hoursRemaining} hours. Don't forget to cast your votes!`,
          type: 'event',
          link: '/meals/select'
        }));
      }
    }
    // Create initial reminder when voting opens
    else {
      const title = 'Voting Now Open';
      if (shouldCreateNotification(notifications, title, 24)) { // Check every 24 hours
        dispatch(createNotification({
          title,
          message: 'Meal voting is now open for this week. Select your meals for the upcoming week.',
          type: 'event',
          link: '/meals/select'
        }));
      }
    }
  } 
  // If voting just closed, notify users
  else if (votingStatus.justClosed) {
    const title = 'Voting Has Closed';
    if (shouldCreateNotification(notifications, title, 24)) {
      dispatch(createNotification({
        title,
        message: 'Meal voting has closed for this week. The weekly menu is now available.',
        type: 'event',
        link: '/meals/select'
      }));
    }
  }
};

/**
 * Generate notification for new menu
 * @param {Object} menu - New menu data
 * @param {Function} dispatch - Redux dispatch function
 */
export const notifyNewMenu = (menu, dispatch) => {
  if (!menu) return;
  
  dispatch(createNotification({
    title: 'New Weekly Menu Available',
    message: `The menu for week ${menu.weekNumber} is now available. Check it out!`,
    type: 'meal',
    link: '/meals/weekly'
  }));
};

/**
 * Generate notification for new meal added to menu
 * @param {Object} meal - New meal data
 * @param {Function} dispatch - Redux dispatch function
 */
export const notifyNewMeal = (meal, dispatch) => {
  if (!meal) return;
  
  dispatch(createNotification({
    title: 'New Meal Added',
    message: `A new meal "${meal.name}" has been added to the menu.`,
    type: 'meal',
    link: `/meals/${meal._id}`
  }));
};

/**
 * Group notifications by date
 * @param {Array} notifications - Array of notification objects
 * @returns {Object} Object with date keys and notification arrays
 */
export const groupNotificationsByDate = (notifications) => {
  if (!notifications || !notifications.length) return {};
  
  const groups = {};
  
  notifications.forEach(notification => {
    const date = new Date(notification.createdAt);
    const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD
    
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    
    groups[dateKey].push(notification);
  });
  
  return groups;
};

/**
 * Get a human-readable date label for a date key
 * @param {string} dateKey - Date key in YYYY-MM-DD format
 * @returns {string} Human-readable date label
 */
export const getDateLabel = (dateKey) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const date = new Date(dateKey);
  
  if (date.toISOString().split('T')[0] === today.toISOString().split('T')[0]) {
    return 'Today';
  } else if (date.toISOString().split('T')[0] === yesterday.toISOString().split('T')[0]) {
    return 'Yesterday';
  } else {
    return formatDate(date);
  }
};