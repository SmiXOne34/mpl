# Time Restrictions in MealWise Family

This document explains the time-based restrictions implemented in the MealWise Family application for meal selections.

## Overview

MealWise Family implements a time-restricted voting system that:

1. Allows meal selections only during specific time windows
2. Provides real-time information about the current voting status
3. Allows administrators to bypass time restrictions

## Voting Window

The application defines a specific voting window:

- **Voting Open**: 4:00 PM to 11:00 AM the next day
- **Voting Closed**: 11:00 AM to 4:00 PM

This schedule allows family members to select meals in the evening and morning, while giving the meal preparer time to prepare during the closed window.

## Implementation

### Time Restriction Utilities

The core time restriction logic is implemented in `utils/timeRestriction.js`:

```javascript
// Check if voting is currently open
const isVotingOpen = () => {
  const now = new Date();
  const hour = now.getHours();
  
  // Voting is open from 4:00 PM (16:00) to 11:00 AM (11:00) the next day
  return hour >= 16 || hour < 11;
};

// Get time remaining in current voting window
const getTimeRemaining = () => {
  const now = new Date();
  const hour = now.getHours();
  const minute = now.getMinutes();
  
  let hoursRemaining, minutesRemaining, message;
  
  if (isVotingOpen()) {
    // If voting is open, calculate time until 11:00 AM
    if (hour < 11) {
      // Morning hours
      hoursRemaining = 10 - hour;
      minutesRemaining = 60 - minute;
      if (minutesRemaining === 60) {
        minutesRemaining = 0;
        hoursRemaining += 1;
      }
    } else {
      // Evening hours (after 4:00 PM)
      hoursRemaining = 24 - hour + 10;
      minutesRemaining = 60 - minute;
      if (minutesRemaining === 60) {
        minutesRemaining = 0;
        hoursRemaining += 1;
      }
    }
    message = `Voting is open for ${hoursRemaining} hours and ${minutesRemaining} minutes`;
  } else {
    // If voting is closed, calculate time until 4:00 PM
    hoursRemaining = 15 - hour;
    minutesRemaining = 60 - minute;
    if (minutesRemaining === 60) {
      minutesRemaining = 0;
      hoursRemaining += 1;
    }
    message = `Voting is closed. Opens in ${hoursRemaining} hours and ${minutesRemaining} minutes`;
  }
  
  return {
    isOpen: isVotingOpen(),
    hoursRemaining,
    minutesRemaining,
    message
  };
};

// Get the next voting window times
const getNextVotingWindow = () => {
  const now = new Date();
  const today = new Date(now);
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  // Set times for today and tomorrow
  const openTime = new Date(today);
  openTime.setHours(16, 0, 0, 0); // 4:00 PM
  
  const closeTime = new Date(tomorrow);
  closeTime.setHours(11, 0, 0, 0); // 11:00 AM next day
  
  // If it's after 4:00 PM today, the window is already open
  if (now.getHours() >= 16) {
    return {
      startTime: openTime,
      endTime: closeTime,
      isCurrentlyOpen: true
    };
  }
  
  // If it's before 11:00 AM today, the window from yesterday is still open
  if (now.getHours() < 11) {
    const yesterdayOpen = new Date(today);
    yesterdayOpen.setDate(yesterdayOpen.getDate() - 1);
    yesterdayOpen.setHours(16, 0, 0, 0); // 4:00 PM yesterday
    
    return {
      startTime: yesterdayOpen,
      endTime: new Date(today).setHours(11, 0, 0, 0), // 11:00 AM today
      isCurrentlyOpen: true
    };
  }
  
  // Otherwise, the window is closed and will open at 4:00 PM today
  return {
    startTime: openTime,
    endTime: closeTime,
    isCurrentlyOpen: false
  };
};

module.exports = {
  isVotingOpen,
  getTimeRemaining,
  getNextVotingWindow
};
```

### Middleware Implementation

The time restriction is enforced through middleware in `middleware/timeRestriction.js`:

```javascript
const ErrorResponse = require('../utils/errorResponse');
const { isVotingOpen, getTimeRemaining } = require('../utils/timeRestriction');

// Middleware to check if voting is open
const checkVotingOpen = (req, res, next) => {
  // Allow admin users to bypass time restrictions
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  
  // Check if voting is currently open
  if (!isVotingOpen()) {
    return next(
      new ErrorResponse(
        'Voting is currently closed. Voting is open from 4:00 PM to 11:00 AM the next day.',
        403
      )
    );
  }
  
  next();
};

// Middleware to add voting status to response
const addVotingStatus = (req, res, next) => {
  // Add voting status to res.locals
  res.locals.votingStatus = {
    isOpen: isVotingOpen()
  };
  
  // Add time remaining information
  const timeRemaining = getTimeRemaining();
  res.locals.votingStatus = {
    ...res.locals.votingStatus,
    ...timeRemaining
  };
  
  // Capture the original send method
  const originalSend = res.json;
  
  // Override the json method
  res.json = function(body) {
    // Only add voting status to successful responses
    if (body && body.success === true) {
      body.votingStatus = res.locals.votingStatus;
    }
    
    // Call the original method
    return originalSend.call(this, body);
  };
  
  next();
};

module.exports = {
  checkVotingOpen,
  addVotingStatus
};
```

## Usage in Routes

The middleware is applied to relevant routes in `routes/selection.js`:

```javascript
const express = require('express');
const { 
  getSelections,
  createSelection,
  deleteSelection,
  // other controllers...
} = require('../controllers/selections');

const { protect, authorize } = require('../middleware/auth');
const { checkVotingOpen } = require('../middleware/timeRestriction');

const router = express.Router();

// Apply protection to all routes
router.use(protect);

// Routes that require voting to be open
router.post('/', checkVotingOpen, createSelection);
router.delete('/:id', checkVotingOpen, deleteSelection);

// Routes that don't require voting to be open
router.get('/', getSelections);
// other routes...

module.exports = router;
```

## Global Voting Status

The `addVotingStatus` middleware is applied globally in `server.js` to include voting status in all successful responses:

```javascript
// Apply voting status middleware to all routes
app.use(addVotingStatus);
```

## Response Format

When voting status is included, responses look like:

```json
{
  "success": true,
  "data": [...],
  "votingStatus": {
    "isOpen": true,
    "hoursRemaining": 5,
    "minutesRemaining": 30,
    "message": "Voting is open for 5 hours and 30 minutes"
  }
}
```

Or when voting is closed:

```json
{
  "success": true,
  "data": [...],
  "votingStatus": {
    "isOpen": false,
    "hoursRemaining": 2,
    "minutesRemaining": 15,
    "message": "Voting is closed. Opens in 2 hours and 15 minutes"
  }
}
```

## Frontend Integration

The frontend uses the voting status information to:

1. Display the current voting status to users
2. Disable selection controls when voting is closed
3. Show countdown timers for the next voting window
4. Provide clear messaging about when voting will open or close

Example React component:

```jsx
import React from 'react';
import { useSelector } from 'react-redux';

const VotingStatus = () => {
  const { votingStatus } = useSelector(state => state.app);
  
  if (!votingStatus) return null;
  
  return (
    <div className={`voting-status ${votingStatus.isOpen ? 'open' : 'closed'}`}>
      <h3>
        {votingStatus.isOpen ? 'Voting is Open' : 'Voting is Closed'}
      </h3>
      <p>{votingStatus.message}</p>
      <div className="countdown">
        {votingStatus.hoursRemaining}h {votingStatus.minutesRemaining}m
      </div>
    </div>
  );
};

export default VotingStatus;
```

## Admin Override

Administrators can bypass time restrictions to:

1. Make selections outside of voting hours
2. Delete selections at any time
3. Test functionality regardless of the current time

This is implemented by checking the user's role in the `checkVotingOpen` middleware.

## Testing

The time restriction system is tested to ensure it correctly enforces the voting window:

```javascript
// __tests__/unit/timeRestriction.util.test.js
describe('Time Restriction Utility', () => {
  describe('isVotingOpen', () => {
    it('should return true when voting is open (4:00 PM)', () => {
      // Mock date to 4:00 PM
      const mockDate = new Date();
      mockDate.setHours(16, 0, 0, 0);
      global.Date = jest.fn(() => mockDate);
      
      expect(isVotingOpen()).toBe(true);
    });
    
    // Additional tests for different times...
  });
  
  // Tests for other functions...
});

// __tests__/unit/timeRestriction.middleware.test.js
describe('Time Restriction Middleware', () => {
  describe('checkVotingOpen', () => {
    it('should call next() when voting is open', () => {
      // Mock isVotingOpen to return true
      jest.spyOn(timeUtils, 'isVotingOpen').mockReturnValue(true);
      
      const req = {};
      const res = {};
      const next = jest.fn();
      
      checkVotingOpen(req, res, next);
      
      expect(next).toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith();
    });
    
    // Additional tests...
  });
  
  // Tests for other middleware...
});
```

## Considerations

### Time Zones

The current implementation uses the server's local time. For applications with users in multiple time zones, consider:

1. Storing user time zone preferences
2. Converting times based on user preferences
3. Using UTC for server operations and converting for display

### Daylight Saving Time

The system handles daylight saving time transitions automatically since it uses JavaScript's Date object, which accounts for these changes.

### Configuration

For flexibility, consider making the voting window times configurable through environment variables or database settings rather than hardcoding them.

### Real-time Updates

For the best user experience, implement real-time updates when the voting window opens or closes, using Socket.IO to notify connected clients.