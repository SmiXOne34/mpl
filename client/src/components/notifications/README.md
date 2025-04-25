# Notification System

This directory contains components and utilities for the application's notification system.

## Components

- **NotificationBadge**: Displays a badge with the count of unread notifications in the navbar.
- **NotificationCenter**: Dropdown menu that shows recent notifications when clicking the notification icon.
- **NotificationDetail**: Detailed view of a single notification with full content and metadata.
- **NotificationPermissionPrompt**: Prompts users to enable browser notifications.
- **NotificationPreferences**: Form for users to customize their notification preferences.
- **NotificationsPage**: Full page view of all notifications with filtering options.
- **NotificationSoundToggle**: Button in the navbar to quickly toggle notification sounds on/off.

## Features

1. **In-App Notifications**
   - Real-time notifications via socket.io
   - Notification badge showing unread count
   - Notification center dropdown in the navbar
   - Full notifications page with advanced search and filtering
   - Detailed view for individual notifications
   - Filter notifications by type, date, and read status
   - Search notifications by title and content
   - Export notifications to CSV for record-keeping
   - Group notifications by date for better organization

2. **Browser Notifications**
   - Desktop notifications for important events
   - Permission request prompt
   - Notification sounds
   - Click to navigate to relevant page

3. **Notification Types**
   - Event notifications (voting open/closing, etc.)
   - Meal notifications (new meals, menu updates)
   - System notifications (updates, maintenance)

4. **User Preferences**
   - Control which notifications to receive
   - Enable/disable email notifications
   - Enable/disable browser notifications
   - Enable/disable notification sounds
   - Quick sound toggle in the navbar
   - Customize notification frequency

## Implementation Details

### Socket Events

The notification system listens for these socket events:

- `notification:new` - When a new notification is created
- `notification:updated` - When notifications are updated

### Browser Notifications

Browser notifications are implemented using the Web Notifications API. The system:

1. Requests permission from the user
2. Shows desktop notifications when new notifications arrive
3. Plays a sound effect (if enabled)
4. Provides a click handler to navigate to the relevant page

### Notification Preferences

Notification preferences are stored in localStorage and include:

1. **Notification Types**
   - Meal notifications (menu updates, new meals)
   - Event notifications (voting open/closing)
   - System notifications (updates, maintenance)

2. **Notification Methods**
   - Email notifications
   - Browser notifications
   - Notification sounds

3. **Frequency Settings**
   - Daily digest
   - Weekly digest
   - Individual notifications

### Redux Integration

Notifications are stored in the Redux store with these actions:

- `GET_NOTIFICATIONS` - Fetch all notifications
- `ADD_NOTIFICATION` - Add a new notification
- `MARK_NOTIFICATION_READ` - Mark a notification as read
- `CLEAR_NOTIFICATIONS` - Clear all notifications

## Usage

To create a new notification:

```javascript
import { createNotification } from '../../actions/notificationActions';

// In a component with access to dispatch
dispatch(createNotification({
  title: 'Notification Title',
  message: 'Notification message text',
  type: 'event', // 'event', 'meal', or 'system'
  link: '/relevant/page' // Where to navigate when clicked
}));
```

To initialize notification listeners (already done in App.js):

```javascript
import { initNotificationListeners } from '../../actions/notificationActions';

// In a component with access to dispatch
dispatch(initNotificationListeners());
```