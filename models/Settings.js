const mongoose = require('mongoose');

/**
 * Settings Schema for MealWise Family application
 * Defines system-wide settings for the application
 */
const SettingsSchema = new mongoose.Schema({
  votingOpenHour: {
    type: Number,
    default: 8, // 8 AM
    min: 0,
    max: 23
  },
  votingOpenMinute: {
    type: Number,
    default: 0,
    min: 0,
    max: 59
  },
  votingCloseHour: {
    type: Number,
    default: 18, // 6 PM
    min: 0,
    max: 23
  },
  votingCloseMinute: {
    type: Number,
    default: 0,
    min: 0,
    max: 59
  },
  autoSelectWinner: {
    type: Boolean,
    default: true
  },
  notifyUsers: {
    type: Boolean,
    default: true
  },
  allowMultipleSelections: {
    type: Boolean,
    default: true
  },
  maxSelectionsPerUser: {
    type: Number,
    default: 2,
    min: 1,
    max: 5
  },
  allowViewerRole: {
    type: Boolean,
    default: true
  },
  allowRegistration: {
    type: Boolean,
    default: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Settings', SettingsSchema);