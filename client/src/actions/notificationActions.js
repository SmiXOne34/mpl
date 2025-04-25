import {
  GET_NOTIFICATIONS,
  MARK_NOTIFICATION_READ,
  CLEAR_NOTIFICATIONS,
  NOTIFICATION_ERROR,
  SET_LOADING,
  ADD_NOTIFICATION
} from './types';
import api from '../utils/api';
import { mockNotificationAPI } from '../utils/mockNotificationService';
import { getSocket } from '../utils/socket';
import { showBrowserNotification, playNotificationSound } from '../utils/browserNotifications';
import { areSoundsEnabled, areBrowserNotificationsEnabled } from '../utils/notificationPreferences';

// Get user notifications
export const getNotifications = (params = {}) => async dispatch => {
  try {
    console.log('Fetching notifications with params:', params);
    dispatch({ type: SET_LOADING });

    // Build query string from params
    const queryParams = new URLSearchParams();
    if (params.read !== undefined) queryParams.append('read', params.read);
    if (params.type) queryParams.append('type', params.type);
    if (params.search) queryParams.append('search', params.search);
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.from) queryParams.append('from', params.from);
    if (params.to) queryParams.append('to', params.to);
    
    const queryString = queryParams.toString();
    const url = `/notifications${queryString ? `?${queryString}` : ''}`;

    const res = await api.get(url);
    console.log('Notifications response:', res.data);

    dispatch({
      type: GET_NOTIFICATIONS,
      payload: res.data.data,
      meta: {
        unreadCount: res.data.unreadCount,
        pagination: res.data.pagination
      }
    });
  } catch (err) {
    console.error('Error fetching notifications:', err);
    
    let errorMessage = 'Error fetching notifications';
    if (err.response) {
      errorMessage = err.response.data?.error || `Server error: ${err.response.status}`;
    }
    
    dispatch({
      type: NOTIFICATION_ERROR,
      payload: errorMessage
    });
  }
};

// Mark notification as read
export const markAsRead = id => async dispatch => {
  try {
    console.log('Marking notification as read:', id);
    dispatch({ type: SET_LOADING });

    await api.put(`/notifications/${id}/read`);
    console.log('Notification marked as read successfully');

    dispatch({
      type: MARK_NOTIFICATION_READ,
      payload: id
    });
  } catch (err) {
    console.error('Error marking notification as read:', err);
    
    let errorMessage = 'Error marking notification as read';
    if (err.response) {
      errorMessage = err.response.data?.error || `Server error: ${err.response.status}`;
    }
    
    dispatch({
      type: NOTIFICATION_ERROR,
      payload: errorMessage
    });
  }
};

// Mark all notifications as read
export const markAllAsRead = () => async dispatch => {
  try {
    console.log('Marking all notifications as read');
    dispatch({ type: SET_LOADING });

    await api.put('/notifications/read-all');
    console.log('All notifications marked as read successfully');

    // Refresh notifications after marking all as read
    dispatch(getNotifications());
  } catch (err) {
    console.error('Error marking all notifications as read:', err);
    
    let errorMessage = 'Error marking all notifications as read';
    if (err.response) {
      errorMessage = err.response.data?.error || `Server error: ${err.response.status}`;
    }
    
    dispatch({
      type: NOTIFICATION_ERROR,
      payload: errorMessage
    });
  }
};

// Clear all notifications
export const clearAllNotifications = () => async dispatch => {
  try {
    console.log('Clearing all notifications');
    dispatch({ type: SET_LOADING });

    await api.delete('/notifications');
    console.log('All notifications cleared successfully');

    dispatch({
      type: CLEAR_NOTIFICATIONS
    });
  } catch (err) {
    console.error('Error clearing notifications:', err);
    
    let errorMessage = 'Error clearing notifications';
    if (err.response) {
      errorMessage = err.response.data?.error || `Server error: ${err.response.status}`;
    }
    
    dispatch({
      type: NOTIFICATION_ERROR,
      payload: errorMessage
    });
  }
};

// Create a notification (admin only)
export const createNotification = notificationData => async dispatch => {
  try {
    console.log('Creating notification with data:', notificationData);

    const res = await api.post('/notifications', notificationData);
    console.log('Create notification response:', res.data);

    // Add the new notification to the state
    dispatch({
      type: ADD_NOTIFICATION,
      payload: res.data.data
    });
    
    // Show browser notification if enabled in user preferences
    if (areBrowserNotificationsEnabled()) {
      showBrowserNotification(notificationData.title, {
        body: notificationData.message,
        link: notificationData.link
      });
    } else if (areSoundsEnabled()) {
      // Just play a sound if browser notifications aren't permitted but sounds are enabled
      playNotificationSound();
    }
  } catch (err) {
    console.error('Error creating notification:', err);
    
    let errorMessage = 'Error creating notification';
    if (err.response) {
      errorMessage = err.response.data?.error || `Server error: ${err.response.status}`;
    }
    
    dispatch({
      type: NOTIFICATION_ERROR,
      payload: errorMessage
    });
  }
};

// Broadcast a notification to all users (admin only)
export const broadcastNotification = notificationData => async dispatch => {
  try {
    console.log('Broadcasting notification with data:', notificationData);

    await api.post('/notifications/broadcast', notificationData);
    console.log('Notification broadcast successful');

    // No need to update state as the socket will handle it
    return true;
  } catch (err) {
    console.error('Error broadcasting notification:', err);
    
    let errorMessage = 'Error broadcasting notification';
    if (err.response) {
      errorMessage = err.response.data?.error || `Server error: ${err.response.status}`;
    }
    
    dispatch({
      type: NOTIFICATION_ERROR,
      payload: errorMessage
    });
    return false;
  }
};

// Add a notification directly to the state (for real-time notifications)
export const addNotification = notification => ({
  type: ADD_NOTIFICATION,
  payload: notification
});

// Initialize socket listeners for real-time notifications
export const initNotificationListeners = () => dispatch => {
  const socket = getSocket();
  
  if (socket) {
    // Listen for new notifications
    socket.on('notification:new', notification => {
      dispatch(addNotification(notification));
      
      // Show browser notification if enabled in user preferences
      if (areBrowserNotificationsEnabled()) {
        showBrowserNotification(notification.title, {
          body: notification.message,
          link: notification.link
        });
      } else if (areSoundsEnabled()) {
        // Just play a sound if browser notifications aren't permitted but sounds are enabled
        playNotificationSound();
      }
    });
    
    // Listen for notification updates
    socket.on('notification:updated', () => {
      dispatch(getNotifications());
    });
    
    return () => {
      socket.off('notification:new');
      socket.off('notification:updated');
    };
  }
};