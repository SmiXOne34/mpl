/**
 * Time restriction utilities for MealWise Family application
 * Manages voting time windows on the client side
 */

/**
 * Check if voting is currently open
 * Voting is open from 4:00 PM to 11:00 AM the next day
 * 
 * @returns {boolean} True if voting is open, false otherwise
 */
export const isVotingOpen = () => {
  const now = new Date();
  const hour = now.getHours();
  
  // Voting is open from 4:00 PM (16:00) to 11:00 AM (11:00) the next day
  return hour >= 16 || hour < 11;
};

/**
 * Get time remaining until next voting status change
 * 
 * @returns {Object} Object with isOpen status and time remaining information
 */
export const getTimeRemaining = () => {
  const now = new Date();
  const hour = now.getHours();
  const minute = now.getMinutes();
  
  // Check if voting is currently open
  const isOpen = isVotingOpen();
  
  // Calculate time until next status change
  let hoursRemaining, minutesRemaining, nextChangeTime;
  
  if (isOpen) {
    // If voting is open, calculate time until it closes (11:00 AM)
    if (hour < 11) {
      // Same day closing
      hoursRemaining = 10 - hour;
      minutesRemaining = 60 - minute;
      if (minutesRemaining === 60) {
        minutesRemaining = 0;
        hoursRemaining += 1;
      }
      nextChangeTime = new Date(now);
      nextChangeTime.setHours(11, 0, 0, 0);
    } else {
      // Next day closing
      hoursRemaining = 24 - hour + 10;
      minutesRemaining = 60 - minute;
      if (minutesRemaining === 60) {
        minutesRemaining = 0;
        hoursRemaining += 1;
      }
      nextChangeTime = new Date(now);
      nextChangeTime.setDate(nextChangeTime.getDate() + 1);
      nextChangeTime.setHours(11, 0, 0, 0);
    }
  } else {
    // If voting is closed, calculate time until it opens (4:00 PM)
    hoursRemaining = 15 - hour;
    minutesRemaining = 60 - minute;
    if (minutesRemaining === 60) {
      minutesRemaining = 0;
      hoursRemaining += 1;
    }
    nextChangeTime = new Date(now);
    nextChangeTime.setHours(16, 0, 0, 0);
  }
  
  // Format message
  let message;
  if (isOpen) {
    message = `Voting is open. Closes in ${hoursRemaining} hours and ${minutesRemaining} minutes (11:00 AM).`;
  } else {
    message = `Voting is closed. Opens in ${hoursRemaining} hours and ${minutesRemaining} minutes (4:00 PM).`;
  }
  
  return {
    isOpen,
    hoursRemaining,
    minutesRemaining,
    nextChangeTime,
    message
  };
};

/**
 * Get the next voting window
 * 
 * @returns {Object} Object with start and end times for the next voting window
 */
export const getNextVotingWindow = () => {
  const now = new Date();
  const hour = now.getHours();
  
  let startTime, endTime;
  
  if (hour < 11) {
    // Current voting window ends at 11:00 AM today
    // Next voting window starts at 4:00 PM today
    startTime = new Date(now);
    startTime.setHours(16, 0, 0, 0);
    
    endTime = new Date(now);
    endTime.setDate(endTime.getDate() + 1);
    endTime.setHours(11, 0, 0, 0);
  } else if (hour < 16) {
    // Current voting window is closed
    // Next voting window starts at 4:00 PM today
    startTime = new Date(now);
    startTime.setHours(16, 0, 0, 0);
    
    endTime = new Date(now);
    endTime.setDate(endTime.getDate() + 1);
    endTime.setHours(11, 0, 0, 0);
  } else {
    // Current voting window ends at 11:00 AM tomorrow
    // Next voting window starts at 4:00 PM tomorrow
    startTime = new Date(now);
    startTime.setDate(startTime.getDate() + 1);
    startTime.setHours(16, 0, 0, 0);
    
    endTime = new Date(now);
    endTime.setDate(endTime.getDate() + 2);
    endTime.setHours(11, 0, 0, 0);
  }
  
  return {
    startTime,
    endTime
  };
};

/**
 * Format time remaining in a human-readable format
 * 
 * @param {number} hours - Hours remaining
 * @param {number} minutes - Minutes remaining
 * @returns {string} Formatted time remaining
 */
export const formatTimeRemaining = (hours, minutes) => {
  if (hours === 0) {
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  }
  
  if (minutes === 0) {
    return `${hours} hour${hours !== 1 ? 's' : ''}`;
  }
  
  return `${hours} hour${hours !== 1 ? 's' : ''} and ${minutes} minute${minutes !== 1 ? 's' : ''}`;
};

/**
 * Get a formatted message about voting status
 * 
 * @returns {Object} Object with status information and formatted message
 */
export const getVotingStatusMessage = () => {
  const { isOpen, hoursRemaining, minutesRemaining } = getTimeRemaining();
  const timeRemaining = formatTimeRemaining(hoursRemaining, minutesRemaining);
  
  if (isOpen) {
    return {
      isOpen,
      severity: hoursRemaining < 1 ? 'warning' : 'info',
      message: `Voting is open. Closes in ${timeRemaining}.`,
      timeRemaining
    };
  } else {
    return {
      isOpen,
      severity: 'error',
      message: `Voting is closed. Opens in ${timeRemaining}.`,
      timeRemaining
    };
  }
};

/**
 * Check if voting is about to close (less than 1 hour remaining)
 * 
 * @returns {boolean} True if voting is about to close, false otherwise
 */
export const isVotingClosingSoon = () => {
  const { isOpen, hoursRemaining } = getTimeRemaining();
  return isOpen && hoursRemaining < 1;
};

/**
 * Check if voting just opened (less than 30 minutes since opening)
 * 
 * @returns {boolean} True if voting just opened, false otherwise
 */
export const didVotingJustOpen = () => {
  const now = new Date();
  const hour = now.getHours();
  const minute = now.getMinutes();
  
  // Check if it's between 4:00 PM and 4:30 PM
  return hour === 16 && minute < 30;
};

/**
 * Check if voting just closed (less than 30 minutes since closing)
 * 
 * @returns {boolean} True if voting just closed, false otherwise
 */
export const didVotingJustClose = () => {
  const now = new Date();
  const hour = now.getHours();
  const minute = now.getMinutes();
  
  // Check if it's between 11:00 AM and 11:30 AM
  return hour === 11 && minute < 30;
};