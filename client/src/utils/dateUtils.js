/**
 * Date utilities for MealWise Family application
 * Provides functions for formatting and working with dates
 */

/**
 * Format date as a string
 * @param {Date|string} date - Date to format
 * @param {Object} options - Formatting options
 * @returns {string} Formatted date string
 */
export const formatDate = (date, options = {}) => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  const defaultOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options
  };
  
  return dateObj.toLocaleDateString(undefined, defaultOptions);
};

/**
 * Format time as a string
 * @param {Date|string} date - Date to format
 * @param {Object} options - Formatting options
 * @returns {string} Formatted time string
 */
export const formatTime = (date, options = {}) => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  const defaultOptions = {
    hour: 'numeric',
    minute: 'numeric',
    ...options
  };
  
  return dateObj.toLocaleTimeString(undefined, defaultOptions);
};

/**
 * Format date and time as a string
 * @param {Date|string} date - Date to format
 * @param {Object} options - Formatting options
 * @returns {string} Formatted date and time string
 */
export const formatDateTime = (date, options = {}) => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  const defaultOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    ...options
  };
  
  return dateObj.toLocaleString(undefined, defaultOptions);
};

/**
 * Get day name for a day number
 * @param {number} day - Day number (0-6, Sunday to Saturday)
 * @returns {string} Day name
 */
export const getDayName = (day) => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[day];
};

/**
 * Get current day number (0-6, Sunday to Saturday)
 * @returns {number} Current day number
 */
export const getCurrentDay = () => {
  return new Date().getDay();
};

/**
 * Format time remaining
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
 * Get start and end dates for a specific week
 * @param {number|string} weekNumber - Week number (1-52) or weekId in format 'YYYY-WW'
 * @param {number} [year] - Year (optional if weekId is provided)
 * @returns {Object} Object with start and end dates
 */
export const getWeekDates = (weekNumber, year) => {
  // Check if weekNumber is actually a weekId in the format 'YYYY-WW'
  if (typeof weekNumber === 'string' && weekNumber.includes('-')) {
    const [yearStr, weekStr] = weekNumber.split('-');
    year = parseInt(yearStr, 10);
    weekNumber = parseInt(weekStr, 10);
    
    if (isNaN(year) || isNaN(weekNumber)) {
      throw new Error(`Invalid week ID format: ${weekNumber}. Expected format: YYYY-WW`);
    }
  }
  
  // Create a date for January 1st of the given year
  const januaryFirst = new Date(year, 0, 1);
  
  // Get the day of the week for January 1st (0-6, Sunday to Saturday)
  const dayOfWeek = januaryFirst.getDay();
  
  // Calculate the date of the first day of the first week
  // If January 1st is not a Sunday, we need to go back to the previous Sunday
  const firstWeekStart = new Date(year, 0, 1 - dayOfWeek);
  
  // Calculate the start date of the requested week
  const weekStart = new Date(firstWeekStart);
  weekStart.setDate(firstWeekStart.getDate() + (weekNumber - 1) * 7);
  
  // Calculate the end date of the requested week (6 days after the start)
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  
  return {
    start: weekStart,
    end: weekEnd,
    startDate: weekStart, // For compatibility with the new API
    endDate: weekEnd      // For compatibility with the new API
  };
};

/**
 * Format a date range as a string
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {string} Formatted date range
 */
export const formatDateRange = (startDate, endDate) => {
  const options = { month: 'short', day: 'numeric' };
  
  // If the dates are in different years, include the year
  if (startDate.getFullYear() !== endDate.getFullYear()) {
    options.year = 'numeric';
  }
  
  const start = startDate.toLocaleDateString(undefined, options);
  
  // For the end date, always include the year
  const end = endDate.toLocaleDateString(undefined, {
    ...options,
    year: 'numeric'
  });
  
  return `${start} - ${end}`;
};

/**
 * Get the week number for a given date
 * @param {Date} date - The date to get the week number for
 * @returns {number} Week number (1-53)
 */
export const getWeekNumber = (date) => {
  // Create a copy of the date to avoid modifying the original
  const d = new Date(date);
  
  // Set to nearest Thursday: current date + 4 - current day number
  // Make Sunday's day number 7
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  
  // Get first day of year
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  
  // Calculate full weeks to nearest Thursday
  const weekNumber = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  
  return weekNumber;
};

/**
 * Get the current week ID in the format YYYY-WW
 * @returns {string} The current week ID
 */
export const getCurrentWeekId = () => {
  const now = new Date();
  const weekNum = getWeekNumber(now);
  const year = now.getFullYear();
  return `${year}-${weekNum.toString().padStart(2, '0')}`;
};

/**
 * Format a date in a human-readable format
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date string (e.g., "April 19, 2025")
 */
export const formatReadableDate = (date) => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  const options = {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  };
  
  return dateObj.toLocaleDateString(undefined, options);
};