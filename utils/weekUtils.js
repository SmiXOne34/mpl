/**
 * Week utilities for MealWise Family application
 * Provides functions for working with week identifiers and dates
 */

/**
 * Get current week ID in format YYYY-WW
 * @returns {string} Week ID (e.g., 2023-01 for the first week of 2023)
 */
const getCurrentWeekId = () => {
  const now = new Date();
  const year = now.getFullYear();
  
  // Get week number (1-53)
  const firstDayOfYear = new Date(year, 0, 1);
  const pastDaysOfYear = (now - firstDayOfYear) / 86400000;
  const weekNumber = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  
  // Format week number with leading zero if needed
  const formattedWeekNumber = weekNumber < 10 ? `0${weekNumber}` : weekNumber;
  
  return `${year}-${formattedWeekNumber}`;
};

/**
 * Get week ID for a specific date
 * @param {Date} date - Date to get week ID for
 * @returns {string} Week ID (e.g., 2023-01 for the first week of 2023)
 */
const getWeekIdForDate = (date) => {
  const year = date.getFullYear();
  
  // Get week number (1-53)
  const firstDayOfYear = new Date(year, 0, 1);
  const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
  const weekNumber = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  
  // Format week number with leading zero if needed
  const formattedWeekNumber = weekNumber < 10 ? `0${weekNumber}` : weekNumber;
  
  return `${year}-${formattedWeekNumber}`;
};

/**
 * Get start and end dates for a week ID
 * @param {string} weekId - Week ID in format YYYY-WW
 * @returns {Object} Object with start and end dates
 */
const getWeekDates = (weekId) => {
  const [year, week] = weekId.split('-').map(Number);
  
  // Get first day of the year
  const firstDayOfYear = new Date(year, 0, 1);
  
  // Get day of the week for the first day (0-6, Sunday to Saturday)
  const dayOfWeek = firstDayOfYear.getDay();
  
  // Calculate days to add to get to the first day of the week
  const daysToAdd = (week - 1) * 7 - dayOfWeek;
  
  // Calculate start date (Sunday)
  const startDate = new Date(year, 0, 1 + daysToAdd);
  
  // Calculate end date (Saturday)
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 6);
  
  return {
    startDate,
    endDate
  };
};

/**
 * Get previous week ID
 * @param {string} weekId - Current week ID
 * @returns {string} Previous week ID
 */
const getPreviousWeekId = (weekId) => {
  const [year, week] = weekId.split('-').map(Number);
  
  // If it's the first week of the year
  if (week === 1) {
    const prevYear = year - 1;
    // Get the number of weeks in the previous year (52 or 53)
    const lastWeekOfPrevYear = getWeeksInYear(prevYear);
    return `${prevYear}-${lastWeekOfPrevYear}`;
  }
  
  // Format week number with leading zero if needed
  const prevWeek = week - 1;
  const formattedWeekNumber = prevWeek < 10 ? `0${prevWeek}` : prevWeek;
  
  return `${year}-${formattedWeekNumber}`;
};

/**
 * Get next week ID
 * @param {string} weekId - Current week ID
 * @returns {string} Next week ID
 */
const getNextWeekId = (weekId) => {
  const [year, week] = weekId.split('-').map(Number);
  
  // Get the number of weeks in the current year
  const weeksInYear = getWeeksInYear(year);
  
  // If it's the last week of the year
  if (week === weeksInYear) {
    return `${year + 1}-01`;
  }
  
  // Format week number with leading zero if needed
  const nextWeek = week + 1;
  const formattedWeekNumber = nextWeek < 10 ? `0${nextWeek}` : nextWeek;
  
  return `${year}-${formattedWeekNumber}`;
};

/**
 * Get the number of weeks in a year
 * @param {number} year - Year to check
 * @returns {number} Number of weeks (52 or 53)
 */
const getWeeksInYear = (year) => {
  // A year has 53 weeks if:
  // 1. It starts on a Thursday, or
  // 2. It's a leap year and starts on a Wednesday
  const firstDayOfYear = new Date(year, 0, 1).getDay();
  const isLeapYear = new Date(year, 1, 29).getMonth() === 1;
  
  if (firstDayOfYear === 4 || (isLeapYear && firstDayOfYear === 3)) {
    return 53;
  }
  
  return 52;
};

/**
 * Format date as a string (YYYY-MM-DD)
 * @param {Date} date - Date to format
 * @returns {string} Formatted date
 */
const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

/**
 * Get day name for a day number
 * @param {number} day - Day number (0-6, Sunday to Saturday)
 * @returns {string} Day name
 */
const getDayName = (day) => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[day];
};

/**
 * Get week number for a date
 * @param {Date} date - Date to get week number for
 * @returns {number} Week number (1-53)
 */
const getWeekNumber = (date) => {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
};

/**
 * Get year for a date
 * @param {Date} date - Date to get year for
 * @returns {number} Year
 */
const getYear = (date) => {
  return date.getFullYear();
};

module.exports = {
  getCurrentWeekId,
  getWeekIdForDate,
  getWeekDates,
  getPreviousWeekId,
  getNextWeekId,
  getWeeksInYear,
  formatDate,
  getDayName,
  getWeekNumber,
  getYear
};