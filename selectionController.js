const Selection = require('../models/Selection');
const WeeklyMenu = require('../models/WeeklyMenu');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const { isVotingOpen, getVotingStatusMessage } = require('../utils/timeRestriction');

/**
 * Selection Controller for MealWise Family application
 * Handles meal selections by family members
 */

/**
 * @desc    Get all selections for current user
 * @route   GET /api/selections
 * @access  Private
 */
exports.getMySelections = asyncHandler(async (req, res, next) => {
  const weekId = req.query.weekId || WeeklyMenu.getCurrentWeekId();
  
  const selections = await Selection.getUserSelections(req.user.id, weekId);
  
  res.status(200).json({
    success: true,
    count: selections.length,
    data: selections
  });
});

/**
 * @desc    Get all family selections for a specific day
 * @route   GET /api/selections/family
 * @access  Private
 */
exports.getFamilySelections = asyncHandler(async (req, res, next) => {
  const weekId = req.query.weekId || WeeklyMenu.getCurrentWeekId();
  const day = req.query.day !== undefined ? parseInt(req.query.day) : new Date().getDay();
  
  const selections = await Selection.getFamilySelections(weekId, day);
  
  res.status(200).json({
    success: true,
    count: selections.length,
    data: selections
  });
});

/**
 * @desc    Create new selection
 * @route   POST /api/selections
 * @access  Private
 */
exports.createSelection = asyncHandler(async (req, res, next) => {
  const { mealId, day } = req.body;
  
  // Check if voting is open (skip for admin users)
  if (req.user.role !== 'admin' && !isVotingOpen()) {
    return next(new ErrorResponse(getVotingStatusMessage(), 403));
  }
  
  // Check if meal is in current week's menu
  const isInMenu = await WeeklyMenu.isMealInCurrentMenu(mealId);
  
  if (!isInMenu) {
    return next(new ErrorResponse('Selected meal is not in the current week\'s menu', 400));
  }
  
  // Add user ID and current week ID to request body
  req.body.userId = req.user.id;
  req.body.weekId = WeeklyMenu.getCurrentWeekId();
  
  // Check if user already has 2 selections for this day
  const existingSelections = await Selection.find({
    userId: req.user.id,
    weekId: req.body.weekId,
    day
  });
  
  if (existingSelections.length >= 2) {
    return next(new ErrorResponse('You can only select 2 meals per day', 400));
  }
  
  // Create selection
  const selection = await Selection.create(req.body);
  
  // Populate selection with meal and user details
  const populatedSelection = await Selection.findById(selection._id)
    .populate('mealId', 'name description imageUrl')
    .populate('userId', 'name');
  
  // Emit socket event for real-time updates
  if (req.io) {
    req.io.to('family').emit('selection:new', populatedSelection);
    
    // Update popular meal
    const popularMeal = await Selection.getPopularMeal(req.body.weekId, day);
    req.io.to('family').emit('popular:update', popularMeal);
  }
  
  res.status(201).json({
    success: true,
    data: populatedSelection
  });
});

/**
 * @desc    Delete selection
 * @route   DELETE /api/selections/:id
 * @access  Private
 */
exports.deleteSelection = asyncHandler(async (req, res, next) => {
  const selection = await Selection.findById(req.params.id);
  
  if (!selection) {
    return next(
      new ErrorResponse(`Selection not found with id of ${req.params.id}`, 404)
    );
  }
  
  // Make sure user is selection owner or admin
  if (selection.userId.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse('Not authorized to delete this selection', 401)
    );
  }
  
  // Check if voting is open (skip for admin users)
  if (req.user.role !== 'admin' && !isVotingOpen()) {
    return next(new ErrorResponse(getVotingStatusMessage(), 403));
  }
  
  await selection.remove();
  
  // Emit socket event for real-time updates
  if (req.io) {
    req.io.to('family').emit('selection:removed', req.params.id);
    
    // Update popular meal
    const popularMeal = await Selection.getPopularMeal(
      selection.weekId,
      selection.day
    );
    req.io.to('family').emit('popular:update', popularMeal);
  }
  
  res.status(200).json({
    success: true,
    data: {}
  });
});

/**
 * @desc    Get most popular meal for today
 * @route   GET /api/selections/popular
 * @access  Private
 */
exports.getPopularMeal = asyncHandler(async (req, res, next) => {
  const weekId = req.query.weekId || WeeklyMenu.getCurrentWeekId();
  const day = req.query.day !== undefined ? parseInt(req.query.day) : new Date().getDay();
  
  const popularMeal = await Selection.getPopularMeal(weekId, day);
  
  res.status(200).json({
    success: true,
    data: popularMeal || { message: 'No selections made yet' }
  });
});

/**
 * @desc    Get voting status
 * @route   GET /api/selections/status
 * @access  Private
 */
exports.getVotingStatus = asyncHandler(async (req, res, next) => {
  const { isOpen, nextChangeTime, timeRemaining, nextAction } = require('../utils/timeRestriction').getTimeRemaining();
  
  res.status(200).json({
    success: true,
    data: {
      isOpen,
      nextChangeTime,
      timeRemaining,
      nextAction,
      message: getVotingStatusMessage()
    }
  });
});