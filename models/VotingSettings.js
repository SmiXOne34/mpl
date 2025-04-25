const mongoose = require('mongoose');

/**
 * Voting Settings Schema
 * Stores global voting settings for the application
 */
const VotingSettingsSchema = new mongoose.Schema({
  enableVoting: {
    type: Boolean,
    default: true
  },
  startHour: {
    type: Number,
    default: 16, // 4:00 PM
    min: 0,
    max: 23
  },
  startMinute: {
    type: Number,
    default: 0,
    min: 0,
    max: 59
  },
  endHour: {
    type: Number,
    default: 11, // 11:00 AM
    min: 0,
    max: 23
  },
  endMinute: {
    type: Number,
    default: 0,
    min: 0,
    max: 59
  },
  overrideStatus: {
    type: Boolean,
    default: false
  },
  manualStatus: {
    type: Boolean,
    default: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Static method to get current settings
VotingSettingsSchema.statics.getCurrentSettings = async function() {
  // Get the most recent settings or create default if none exist
  let settings = await this.findOne().sort({ updatedAt: -1 });
  
  if (!settings) {
    settings = await this.create({});
  }
  
  return settings;
};

module.exports = mongoose.model('VotingSettings', VotingSettingsSchema);