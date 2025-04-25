const WeeklyMenu = require('../models/WeeklyMenu');
const Meal = require('../models/Meal');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

/**
 * Weekly Menu Controller for MealWise Family application
 * Handles weekly menu management by admin users
 */

/**
 * @desc    Get current week's menu
 * @route   GET /api/menu/current
 * @access  Private
 */
exports.getCurrentMenu = asyncHandler(async (req, res, next) => {
  const menu = await WeeklyMenu.getCurrentMenu();
  
  if (!menu) {
    return next(
      new ErrorResponse('No menu has been set for the current week', 404)
    );
  }
  
  res.status(200).json({
    success: true,
    data: menu
  });
});

/**
 * @desc    Get menu by week ID
 * @route   GET /api/menu/:weekId
 * @access  Private
 */
exports.getMenuByWeek = asyncHandler(async (req, res, next) => {
  const menu = await WeeklyMenu.findOne({ weekId: req.params.weekId })
    .populate('meals', 'name description ingredients preparationSteps imageUrl tags')
    .populate('createdBy', 'name');
  
  if (!menu) {
    return next(
      new ErrorResponse(`No menu found for week ${req.params.weekId}`, 404)
    );
  }
  
  res.status(200).json({
    success: true,
    data: menu
  });
});

/**
 * @desc    Create new weekly menu
 * @route   POST /api/menu
 * @access  Private (Admin only)
 */
exports.createMenu = asyncHandler(async (req, res, next) => {
  // Add user to req.body
  req.body.createdBy = req.user.id;
  
  // Check if menu already exists for this week
  const existingMenu = await WeeklyMenu.findOne({ weekId: req.body.weekId });
  
  if (existingMenu) {
    return next(
      new ErrorResponse(`Menu already exists for week ${req.body.weekId}`, 400)
    );
  }
  
  // Validate that all meals exist
  const mealIds = req.body.meals;
  const meals = await Meal.find({ _id: { $in: mealIds } });
  
  if (meals.length !== mealIds.length) {
    return next(
      new ErrorResponse('One or more meal IDs are invalid', 400)
    );
  }
  
  // Create menu
  const menu = await WeeklyMenu.create(req.body);
  
  // Populate menu with meal details
  const populatedMenu = await WeeklyMenu.findById(menu._id)
    .populate('meals', 'name description imageUrl')
    .populate('createdBy', 'name');
  
  // Emit socket event for real-time updates
  if (req.io) {
    req.io.emit('menu:update', populatedMenu);
  }
  
  res.status(201).json({
    success: true,
    data: populatedMenu
  });
});

/**
 * @desc    Update weekly menu
 * @route   PUT /api/menu/:weekId
 * @access  Private (Admin only)
 */
exports.updateMenu = asyncHandler(async (req, res, next) => {
  let menu = await WeeklyMenu.findOne({ weekId: req.params.weekId });
  
  if (!menu) {
    return next(
      new ErrorResponse(`No menu found for week ${req.params.weekId}`, 404)
    );
  }
  
  // Validate that all meals exist if meals are being updated
  if (req.body.meals) {
    const mealIds = req.body.meals;
    const meals = await Meal.find({ _id: { $in: mealIds } });
    
    if (meals.length !== mealIds.length) {
      return next(
        new ErrorResponse('One or more meal IDs are invalid', 400)
      );
    }
  }
  
  // Update menu
  menu = await WeeklyMenu.findOneAndUpdate(
    { weekId: req.params.weekId },
    req.body,
    {
      new: true,
      runValidators: true
    }
  );
  
  // Populate menu with meal details
  const populatedMenu = await WeeklyMenu.findById(menu._id)
    .populate('meals', 'name description imageUrl')
    .populate('createdBy', 'name');
  
  // Emit socket event for real-time updates
  if (req.io) {
    req.io.emit('menu:update', populatedMenu);
  }
  
  res.status(200).json({
    success: true,
    data: populatedMenu
  });
});

/**
 * @desc    Delete weekly menu
 * @route   DELETE /api/menu/:weekId
 * @access  Private (Admin only)
 */
exports.deleteMenu = asyncHandler(async (req, res, next) => {
  const menu = await WeeklyMenu.findOne({ weekId: req.params.weekId });
  
  if (!menu) {
    return next(
      new ErrorResponse(`No menu found for week ${req.params.weekId}`, 404)
    );
  }
  
  await menu.remove();
  
  // Emit socket event for real-time updates
  if (req.io) {
    req.io.emit('menu:delete', req.params.weekId);
  }
  
  res.status(200).json({
    success: true,
    data: {}
  });
});

/**
 * @desc    Copy menu from one week to another
 * @route   POST /api/menu/:sourceWeekId/copy
 * @access  Private (Admin only)
 */
exports.copyMenu = asyncHandler(async (req, res, next) => {
  const { targetWeekId } = req.body;
  
  if (!targetWeekId) {
    return next(new ErrorResponse('Please provide a target week ID', 400));
  }
  
  // Check if source menu exists
  const sourceMenu = await WeeklyMenu.findOne({ weekId: req.params.sourceWeekId });
  
  if (!sourceMenu) {
    return next(
      new ErrorResponse(`No menu found for week ${req.params.sourceWeekId}`, 404)
    );
  }
  
  // Check if target menu already exists
  const existingTargetMenu = await WeeklyMenu.findOne({ weekId: targetWeekId });
  
  if (existingTargetMenu) {
    return next(
      new ErrorResponse(`Menu already exists for week ${targetWeekId}`, 400)
    );
  }
  
  // Create new menu with copied meals
  const newMenu = await WeeklyMenu.create({
    weekId: targetWeekId,
    meals: sourceMenu.meals,
    createdBy: req.user.id
  });
  
  // Populate menu with meal details
  const populatedMenu = await WeeklyMenu.findById(newMenu._id)
    .populate('meals', 'name description imageUrl')
    .populate('createdBy', 'name');
  
  // Emit socket event for real-time updates
  if (req.io) {
    req.io.emit('menu:update', populatedMenu);
  }
  
  res.status(201).json({
    success: true,
    data: populatedMenu
  });
});