const Selection = require('../models/Selection');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const { getCurrentWeekId } = require('../utils/weekUtils');
const { getTimeRemaining } = require('../utils/timeRestriction');

/**
 * Selection Controller for MealWise Family application
 * Handles meal selections by family members
 */

/**
 * @desc    Get current user's selections
 * @route   GET /api/selections
 * @access  Private
 */
exports.getMySelections = asyncHandler(async (req, res, next) => {
  const day = parseInt(req.query.day);
  const weekId = req.query.weekId || getCurrentWeekId();

  // Validate day parameter
  if (isNaN(day) || day < 0 || day > 6) {
    return next(
      new ErrorResponse('Day must be a number between 0 and 6', 400)
    );
  }

  const selections = await Selection.find({
    userId: req.user.id,
    weekId,
    day
  }).populate({
    path: 'mealId',
    select: 'name description imageUrl tags ingredients preparationSteps'
  });

  res.status(200).json({
    success: true,
    count: selections.length,
    data: selections
  });
});

/**
 * @desc    Get family selections for a specific day
 * @route   GET /api/selections/family
 * @access  Private
 */
exports.getFamilySelections = asyncHandler(async (req, res, next) => {
  const day = parseInt(req.query.day);
  const weekId = req.query.weekId || getCurrentWeekId();

  // Validate day parameter
  if (isNaN(day) || day < 0 || day > 6) {
    return next(
      new ErrorResponse('Day must be a number between 0 and 6', 400)
    );
  }

  const selections = await Selection.getFamilySelections(day, weekId);

  res.status(200).json({
    success: true,
    count: selections.length,
    data: selections
  });
});

/**
 * @desc    Create new selection
 * @route   POST /api/selections
 * @access  Private (Admin, Chooser)
 */
exports.createSelection = asyncHandler(async (req, res, next) => {
  const { mealId, day } = req.body;
  const weekId = req.body.weekId || getCurrentWeekId();

  // Validate required fields
  if (!mealId || day === undefined) {
    return next(
      new ErrorResponse('Please provide meal ID and day', 400)
    );
  }

  // Validate day parameter
  if (isNaN(day) || day < 0 || day > 6) {
    return next(
      new ErrorResponse('Day must be a number between 0 and 6', 400)
    );
  }

  // Create selection
  const selection = await Selection.create({
    userId: req.user.id,
    mealId,
    weekId,
    day
  });

  // Populate the selection
  await selection.populate([
    {
      path: 'mealId',
      select: 'name description imageUrl tags ingredients preparationSteps'
    },
    {
      path: 'userId',
      select: 'name'
    }
  ]);

  // Emit socket event for real-time updates
  if (req.io) {
    req.io.emit('selection:created', selection);
    
    // Also emit updated popular meal
    const popularMeal = await Selection.getPopularMeal(day, weekId);
    if (popularMeal) {
      req.io.emit('meal:popular', { day, meal: popularMeal });
    }
  }

  res.status(201).json({
    success: true,
    data: selection
  });
});

/**
 * @desc    Delete selection
 * @route   DELETE /api/selections/:id
 * @access  Private (Owner or Admin)
 */
exports.deleteSelection = asyncHandler(async (req, res, next) => {
  const selection = await Selection.findById(req.params.id);

  if (!selection) {
    return next(
      new ErrorResponse(`Selection not found with id of ${req.params.id}`, 404)
    );
  }

  // Check if user is selection owner or admin
  if (selection.userId.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse('Not authorized to delete this selection', 403)
    );
  }

  // Store day and weekId for socket event
  const { day, weekId } = selection;

  await selection.remove();

  // Emit socket event for real-time updates
  if (req.io) {
    req.io.emit('selection:deleted', req.params.id);
    
    // Also emit updated popular meal
    const popularMeal = await Selection.getPopularMeal(day, weekId);
    if (popularMeal) {
      req.io.emit('meal:popular', { day, meal: popularMeal });
    }
  }

  res.status(200).json({
    success: true,
    data: {}
  });
});

/**
 * @desc    Get most popular meal for a specific day
 * @route   GET /api/selections/popular
 * @access  Private
 */
exports.getPopularMeal = asyncHandler(async (req, res, next) => {
  const day = parseInt(req.query.day);
  const weekId = req.query.weekId || getCurrentWeekId();

  // Validate day parameter
  if (isNaN(day) || day < 0 || day > 6) {
    return next(
      new ErrorResponse('Day must be a number between 0 and 6', 400)
    );
  }

  const popularMeal = await Selection.getPopularMeal(day, weekId);

  if (!popularMeal) {
    return next(
      new ErrorResponse(`No selections found for day ${day}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: popularMeal
  });
});

/**
 * @desc    Get voting status
 * @route   GET /api/selections/status
 * @access  Private
 */
exports.getVotingStatus = asyncHandler(async (req, res, next) => {
  const status = await getTimeRemaining();

  res.status(200).json({
    success: true,
    data: status
  });
});

/**
 * @desc    Get user's selection history
 * @route   GET /api/selections/history
 * @access  Private
 */
exports.getSelectionHistory = asyncHandler(async (req, res, next) => {
  const timeframe = req.query.timeframe || 'all';
  const userId = req.user.id;
  
  // Create date filters based on timeframe
  let dateFilter = {};
  const now = new Date();
  
  if (timeframe === 'week') {
    // Get selections from the past week
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);
    dateFilter = { createdAt: { $gte: weekAgo } };
  } else if (timeframe === 'month') {
    // Get selections from the past month
    const monthAgo = new Date(now);
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    dateFilter = { createdAt: { $gte: monthAgo } };
  }
  
  // Find user's selections with date filter
  const selections = await Selection.find({
    userId,
    ...dateFilter
  })
    .sort({ createdAt: -1 }) // Sort by most recent first
    .populate({
      path: 'mealId',
      select: 'name description imageUrl tags ingredients preparationSteps'
    });
  
  // Add day name to each selection
  const selectionsWithDayName = selections.map(selection => {
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayName = dayNames[selection.day];
    
    return {
      ...selection.toObject(),
      dayName
    };
  });
  
  res.status(200).json({
    success: true,
    count: selectionsWithDayName.length,
    data: selectionsWithDayName
  });
});