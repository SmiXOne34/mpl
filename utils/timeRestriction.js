/**
 * Time restriction utilities for MealWise Family application
 * Manages voting time windows
 */
const VotingSettings = require('../models/VotingSettings');

// Cache for voting settings to avoid frequent DB queries
let cachedSettings = null;
let cacheExpiry = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Get current voting settings from database or cache
 * 
 * @returns {Promise<Object>} Current voting settings
 */
const getVotingSettings = async () => {
  const now = Date.now();
  
  // Return cached settings if they're still valid
  if (cachedSettings && cacheExpiry && now < cacheExpiry) {
    return cachedSettings;
  }
  
  // Get fresh settings from database
  try {
    const settings = await VotingSettings.getCurrentSettings();
    
    // Update cache
    cachedSettings = settings;
    cacheExpiry = now + CACHE_DURATION;
    
    return settings;
  } catch (err) {
    console.error('Error fetching voting settings:', err);
    
    // If there's an error, use default settings
    return {
      enableVoting: true,
      startHour: 16,
      startMinute: 0,
      endHour: 11,
      endMinute: 0,
      overrideStatus: false,
      manualStatus: true
    };
  }
};

/**
 * Check if voting is currently open
 * Uses settings from database
 * 
 * @param {Object} settings - Optional settings object to use instead of fetching from DB
 * @returns {boolean} True if voting is open, false otherwise
 */
const isVotingOpen = async (settings = null) => {
  // Get settings if not provided
  if (!settings) {
    settings = await getVotingSettings();
  }
  
  // If voting is disabled entirely
  if (!settings.enableVoting) {
    return false;
  }
  
  // If manual override is enabled
  if (settings.overrideStatus) {
    return settings.manualStatus;
  }
  
  // Otherwise, calculate based on time
  const now = new Date();
  const hour = now.getHours();
  const startHour = settings.startHour;
  const endHour = settings.endHour;
  
  // Voting is open from startHour to endHour (possibly crossing midnight)
  if (startHour < endHour) {
    // Simple case: start and end on same day
    return hour >= startHour && hour < endHour;
  } else {
    // Complex case: crosses midnight
    return hour >= startHour || hour < endHour;
  }
};

/**
 * Get time remaining until next voting status change
 * 
 * @returns {Promise<Object>} Object with isOpen status and time remaining information
 */
const getTimeRemaining = async () => {
  // Get current settings
  const settings = await getVotingSettings();
  
  const now = new Date();
  const hour = now.getHours();
  const minute = now.getMinutes();
  
  // Check if voting is currently open
  const isOpen = await isVotingOpen(settings);
  
  // Calculate time until next status change
  let hoursRemaining, minutesRemaining, nextChangeTime;
  
  // If manual override is enabled, don't show time remaining
  if (settings.overrideStatus) {
    hoursRemaining = 0;
    minutesRemaining = 0;
    nextChangeTime = null;
    
    const message = isOpen 
      ? 'Voting is open indefinitely (manual override).' 
      : 'Voting is closed indefinitely (manual override).';
      
    return {
      isOpen,
      hoursRemaining,
      minutesRemaining,
      nextChangeTime,
      message,
      settings: {
        enableVoting: settings.enableVoting,
        startHour: settings.startHour,
        startMinute: settings.startMinute,
        endHour: settings.endHour,
        endMinute: settings.endMinute,
        overrideStatus: settings.overrideStatus,
        manualStatus: settings.manualStatus
      }
    };
  }
  
  // Format time for display
  const formatTime = (hour, minute) => {
    const hourNum = parseInt(hour, 10);
    const minuteNum = parseInt(minute, 10);
    const period = hourNum >= 12 ? 'PM' : 'AM';
    const displayHour = hourNum % 12 === 0 ? 12 : hourNum % 12;
    const displayMinute = minuteNum < 10 ? `0${minuteNum}` : minuteNum;
    return `${displayHour}:${displayMinute} ${period}`;
  };
  
  const startTimeFormatted = formatTime(settings.startHour, settings.startMinute);
  const endTimeFormatted = formatTime(settings.endHour, settings.endMinute);
  
  if (isOpen) {
    // If voting is open, calculate time until it closes
    if (hour < settings.endHour || (hour === settings.endHour && minute < settings.endMinute)) {
      // Same day closing
      hoursRemaining = settings.endHour - hour - 1;
      minutesRemaining = 60 - minute + settings.endMinute;
      if (minutesRemaining >= 60) {
        minutesRemaining -= 60;
        hoursRemaining += 1;
      }
      nextChangeTime = new Date(now);
      nextChangeTime.setHours(settings.endHour, settings.endMinute, 0, 0);
    } else {
      // Next day closing
      hoursRemaining = 24 - hour + settings.endHour - 1;
      minutesRemaining = 60 - minute + settings.endMinute;
      if (minutesRemaining >= 60) {
        minutesRemaining -= 60;
        hoursRemaining += 1;
      }
      nextChangeTime = new Date(now);
      nextChangeTime.setDate(nextChangeTime.getDate() + 1);
      nextChangeTime.setHours(settings.endHour, settings.endMinute, 0, 0);
    }
  } else {
    // If voting is closed, calculate time until it opens
    if (hour < settings.startHour || (hour === settings.startHour && minute < settings.startMinute)) {
      // Same day opening
      hoursRemaining = settings.startHour - hour - 1;
      minutesRemaining = 60 - minute + settings.startMinute;
      if (minutesRemaining >= 60) {
        minutesRemaining -= 60;
        hoursRemaining += 1;
      }
      nextChangeTime = new Date(now);
      nextChangeTime.setHours(settings.startHour, settings.startMinute, 0, 0);
    } else {
      // Next day opening
      hoursRemaining = 24 - hour + settings.startHour - 1;
      minutesRemaining = 60 - minute + settings.startMinute;
      if (minutesRemaining >= 60) {
        minutesRemaining -= 60;
        hoursRemaining += 1;
      }
      nextChangeTime = new Date(now);
      nextChangeTime.setDate(nextChangeTime.getDate() + 1);
      nextChangeTime.setHours(settings.startHour, settings.startMinute, 0, 0);
    }
  }
  
  // Format message
  let message;
  if (isOpen) {
    message = `Voting is open. Closes in ${hoursRemaining} hours and ${minutesRemaining} minutes (${endTimeFormatted}).`;
  } else {
    message = `Voting is closed. Opens in ${hoursRemaining} hours and ${minutesRemaining} minutes (${startTimeFormatted}).`;
  }
  
  return {
    isOpen,
    hoursRemaining,
    minutesRemaining,
    nextChangeTime,
    message,
    settings: {
      enableVoting: settings.enableVoting,
      startHour: settings.startHour,
      startMinute: settings.startMinute,
      endHour: settings.endHour,
      endMinute: settings.endMinute,
      overrideStatus: settings.overrideStatus,
      manualStatus: settings.manualStatus
    }
  };
};

/**
 * Get the next voting window
 * 
 * @returns {Promise<Object>} Object with start and end times for the next voting window
 */
const getNextVotingWindow = async () => {
  // Get current settings
  const settings = await getVotingSettings();
  
  const now = new Date();
  const hour = now.getHours();
  const minute = now.getMinutes();
  
  let startTime, endTime;
  
  // If manual override is enabled, return null
  if (settings.overrideStatus) {
    return {
      startTime: null,
      endTime: null,
      message: 'Voting windows are manually controlled.'
    };
  }
  
  const isCurrentlyOpen = await isVotingOpen(settings);
  
  if (isCurrentlyOpen) {
    // If voting is currently open, next window starts after current one ends
    
    // First, calculate when current window ends
    let currentEndTime = new Date(now);
    if (hour < settings.endHour || (hour === settings.endHour && minute < settings.endMinute)) {
      // Ends today
      currentEndTime.setHours(settings.endHour, settings.endMinute, 0, 0);
    } else {
      // Ends tomorrow
      currentEndTime.setDate(currentEndTime.getDate() + 1);
      currentEndTime.setHours(settings.endHour, settings.endMinute, 0, 0);
    }
    
    // Next window starts after current one ends
    startTime = new Date(currentEndTime);
    startTime.setHours(settings.startHour, settings.startMinute, 0, 0);
    if (startTime <= currentEndTime) {
      // If start time is before or equal to end time, it must be next day
      startTime.setDate(startTime.getDate() + 1);
    }
    
    // End time is after start time
    endTime = new Date(startTime);
    endTime.setDate(endTime.getDate() + 1);
    endTime.setHours(settings.endHour, settings.endMinute, 0, 0);
    if (endTime <= startTime) {
      // If end time is before or equal to start time, it must be next day
      endTime.setDate(endTime.getDate() + 1);
    }
  } else {
    // If voting is currently closed, next window starts at next start time
    
    // Calculate next start time
    startTime = new Date(now);
    if (hour < settings.startHour || (hour === settings.startHour && minute < settings.startMinute)) {
      // Starts today
      startTime.setHours(settings.startHour, settings.startMinute, 0, 0);
    } else {
      // Starts tomorrow
      startTime.setDate(startTime.getDate() + 1);
      startTime.setHours(settings.startHour, settings.startMinute, 0, 0);
    }
    
    // End time is after start time
    endTime = new Date(startTime);
    endTime.setDate(endTime.getDate() + 1);
    endTime.setHours(settings.endHour, settings.endMinute, 0, 0);
    if (endTime <= startTime) {
      // If end time is before or equal to start time, it must be next day
      endTime.setDate(endTime.getDate() + 1);
    }
  }
  
  // Format times for display
  const formatDate = (date) => {
    if (!date) return 'N/A';
    
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayName = days[date.getDay()];
    
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 === 0 ? 12 : hours % 12;
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    
    return `${dayName} at ${formattedHours}:${formattedMinutes} ${ampm}`;
  };
  
  const message = `Next voting window: ${formatDate(startTime)} to ${formatDate(endTime)}`;
  
  return {
    startTime,
    endTime,
    message
  };
};

module.exports = {
  isVotingOpen,
  getTimeRemaining,
  getNextVotingWindow
};