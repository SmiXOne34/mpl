/**
 * Mock Notification Service
 * 
 * This file provides mock implementations of notification API endpoints
 * for development and testing purposes.
 */

// Mock notifications data
let notifications = [
  {
    _id: '1',
    title: 'Voting is Open',
    message: 'Meal voting is now open for this week. Cast your votes before Friday!',
    type: 'event',
    link: '/meals/select',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString() // 1 hour ago
  },
  {
    _id: '2',
    title: 'New Meal Added',
    message: 'A new meal "Vegetable Stir Fry" has been added to the menu.',
    type: 'meal',
    link: '/meals/weekly',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString() // 3 hours ago
  },
  {
    _id: '3',
    title: 'Weekly Menu Updated',
    message: 'The menu for this week has been updated. Check it out!',
    type: 'event',
    link: '/meals/weekly',
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() // 1 day ago
  },
  {
    _id: '4',
    title: 'Reminder: Select Your Meals',
    message: 'Don\'t forget to select your meals for the upcoming week.',
    type: 'event',
    link: '/meals/select',
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString() // 2 days ago
  }
];

// Mock API endpoints
export const mockNotificationAPI = {
  // Get all notifications
  getNotifications: () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          data: {
            success: true,
            data: notifications
          }
        });
      }, 500); // Simulate network delay
    });
  },
  
  // Mark a notification as read
  markAsRead: (id) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        notifications = notifications.map(notification => 
          notification._id === id 
            ? { ...notification, read: true } 
            : notification
        );
        
        resolve({
          data: {
            success: true
          }
        });
      }, 300);
    });
  },
  
  // Clear all notifications
  clearNotifications: () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        notifications = [];
        
        resolve({
          data: {
            success: true
          }
        });
      }, 300);
    });
  },
  
  // Create a new notification (for testing)
  createNotification: (notificationData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newNotification = {
          _id: Date.now().toString(),
          ...notificationData,
          read: false,
          createdAt: new Date().toISOString()
        };
        
        notifications = [newNotification, ...notifications];
        
        resolve({
          data: {
            success: true,
            data: newNotification
          }
        });
      }, 300);
    });
  }
};