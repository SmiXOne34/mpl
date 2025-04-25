const Settings = require('../models/Settings');
const VotingSettings = require('../models/VotingSettings');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

/**
 * Settings Controller for MealWise Family application
 * Handles system-wide settings management
 */

/**
 * @desc    Get settings
 * @route   GET /api/settings
 * @access  Private
 */
exports.getSettings = asyncHandler(async (req, res, next) => {
  try {
    console.log('GET /api/settings called');
    
    // Set CORS headers
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    
    // Get settings or create default if none exists
    let settings = await Settings.findOne();
    
    if (!settings) {
      console.log('No settings found, creating default settings');
      settings = await Settings.create({
        allowRegistration: true, // Default to allowing registration
        votingOpenHour: 8,
        votingOpenMinute: 0,
        votingCloseHour: 18,
        votingCloseMinute: 0,
        autoSelectWinner: true,
        notifyUsers: true,
        allowMultipleSelections: true,
        maxSelectionsPerUser: 2,
        allowViewerRole: true
      });
    }
    
    console.log('Returning settings:', settings);
    
    // Return settings with explicit allowRegistration value
    return res.status(200).json({
      success: true,
      data: {
        ...settings.toObject(),
        allowRegistration: settings.allowRegistration !== false
      }
    });
  } catch (error) {
    console.error('Error in getSettings:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error while fetching settings'
    });
  }
});

/**
 * @desc    Update settings
 * @route   PUT /api/settings
 * @access  Private/Admin
 */
exports.updateSettings = asyncHandler(async (req, res, next) => {
  try {
    console.log('PUT /api/settings called with data:', req.body);
    
    // Set CORS headers
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    
    // Get settings or create default if none exists
    let settings = await Settings.findOne();
    
    if (!settings) {
      console.log('No settings found, creating default settings');
      settings = await Settings.create({
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
      });
    }
    
    console.log('Updating settings with:', req.body);
    
    // Update settings
    settings = await Settings.findByIdAndUpdate(
      settings._id,
      { 
        ...req.body,
        updatedAt: Date.now()
      },
      {
        new: true,
        runValidators: true
      }
    );
    
    console.log('Settings updated successfully:', settings);
    
    // Emit socket event for settings update
    if (req.safeEmit) {
      req.safeEmit('settings:updated', settings);
    }
    
    return res.status(200).json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('Error in updateSettings:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error while updating settings'
    });
  }
});