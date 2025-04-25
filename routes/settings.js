const express = require('express');
const {
  getSettings,
  updateSettings
} = require('../controllers/settingsController');

const router = express.Router();

// Import middleware
const { protect, authorize } = require('../middleware/auth');

// Get settings - accessible to all users (public)
router.get('/', getSettings);

// Simple test route for settings
router.get('/test', (req, res) => {
  console.log('GET /api/settings/test called');
  return res.status(200).json({
    success: true,
    data: {
      message: 'Settings API is working',
      allowRegistration: true,
      votingOpenHour: 8,
      votingOpenMinute: 0,
      votingCloseHour: 18,
      votingCloseMinute: 0,
      autoSelectWinner: true,
      notifyUsers: true,
      allowMultipleSelections: true,
      maxSelectionsPerUser: 2,
      allowViewerRole: true
    }
  });
});

// All routes below this require authentication
router.use(protect);

// Update settings - only accessible to admins
router.put('/', authorize('admin'), updateSettings);

// Voting settings routes
const VotingSettings = require('../models/VotingSettings');
const asyncHandler = require('../middleware/async');

/**
 * @desc    Get current voting settings
 * @route   GET /api/settings/voting
 * @access  Private (Admin only)
 */
router.get('/voting', authorize('admin'), asyncHandler(async (req, res, next) => {
  const settings = await VotingSettings.getCurrentSettings();
  
  res.status(200).json({
    success: true,
    data: settings
  });
}));

/**
 * @desc    Update voting settings
 * @route   PUT /api/settings/voting
 * @access  Private (Admin only)
 */
router.put('/voting', authorize('admin'), asyncHandler(async (req, res, next) => {
  // Validate input
  const { 
    enableVoting, 
    startHour, 
    startMinute, 
    endHour, 
    endMinute, 
    overrideStatus, 
    manualStatus 
  } = req.body;
  
  // Create new settings
  const settings = await VotingSettings.create({
    enableVoting: enableVoting !== undefined ? enableVoting : true,
    startHour: startHour !== undefined ? startHour : 16,
    startMinute: startMinute !== undefined ? startMinute : 0,
    endHour: endHour !== undefined ? endHour : 11,
    endMinute: endMinute !== undefined ? endMinute : 0,
    overrideStatus: overrideStatus !== undefined ? overrideStatus : false,
    manualStatus: manualStatus !== undefined ? manualStatus : true
  });
  
  // Emit socket event for real-time updates
  if (req.safeEmit) {
    req.safeEmit('voting:settings', settings);
  }
  
  res.status(200).json({
    success: true,
    data: settings
  });
}));

module.exports = router;