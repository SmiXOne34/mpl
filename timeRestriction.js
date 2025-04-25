/**
 * Time Restriction Utility for MealWise Family application
 * Handles the time-based restrictions for meal selection
 */

/**
 * Check if voting is currently open
 * Voting is closed between 11:00 AM and 4:00 PM
 * @returns {boolean} True if voting is open, false otherwise
 */
const isVotingOpen = () => {
  const now = new Date();
  const hours = now.getHours();
  
  // Voting is closed between 11:00 AM and 4:00 PM
  return !(hours >= 11 && hours < 16);
};

/**
 * Get the next time when the voting status will change
 * @returns {Date} Date object representing the next status change time
 */
const getNextStatusChangeTime = () => {
  const now = new Date();
  const hours = now.getHours();
  let nextChangeTime = new Date(now);
  
  if (hours < 11) {
    // Next change is at 11:00 AM (closing)
    nextChangeTime.setHours(11, 0, 0, 0);
  } else if (hours >= 11 && hours < 16) {
    // Next change is at 4:00 PM (opening)
    nextChangeTime.setHours(16, 0, 0, 0);
  } else {
    // Next change is at 11:00 AM tomorrow (closing)
    nextChangeTime.setDate(nextChangeTime.getDate() + 1);
    nextChangeTime.setHours(11, 0, 0, 0);
  }
  
  return nextChangeTime;
};

/**
 * Get information about the current voting status and time remaining
 * @returns {Object} Object containing voting status information
 */
const getTimeRemaining = () => {
  const now = new Date();
  const nextChange = getNextStatusChangeTime();
  
  return {
    isOpen: isVotingOpen(),
    nextChangeTime: nextChange,
    timeRemaining: nextChange - now,
    nextAction: isVotingOpen() ? 'close' : 'open'
  };
};

/**
 * Get the current day of the week (0-6, Sunday to Saturday)
 * @returns {number} Current day of the week
 */
const getCurrentDay = () => {
  return new Date().getDay();
};

/**
 * Format a date as a time string (HH:MM AM/PM)
 * @param {Date} date - The date to format
 * @returns {string} Formatted time string
 */
const formatTimeString = (date) => {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};

/**
 * Get a human-readable message about the voting status
 * @returns {string} Message about voting status
 */
const getVotingStatusMessage = () => {
  const { isOpen, nextChangeTime } = getTimeRemaining();
  const formattedTime = formatTimeString(nextChangeTime);
  
  if (isOpen) {
    return `Voting is open. Voting will close at ${formattedTime}.`;
  } else {
    return `Voting is closed. Voting will reopen at ${formattedTime}.`;
  }
};

module.exports = {
  isVotingOpen,
  getNextStatusChangeTime,
  getTimeRemaining,
  getCurrentDay,
  formatTimeString,
  getVotingStatusMessage
};