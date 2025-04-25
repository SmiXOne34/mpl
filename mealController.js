const Meal = require('../models/Meal');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

/**
 * Meal Controller for MealWise Family application
 * Handles CRUD operations for meals
 */

/**
 * @desc    Get all meals
 * @route   GET /api/meals
 * @access  Private
 */
exports.getMeals = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

/**
 * @desc    Get single meal
 * @route   GET /api/meals/:id
 * @access  Private
 */
exports.getMeal = asyncHandler(async (req, res, next) => {
  const meal = await Meal.findById(req.params.id);
  
  if (!meal) {
    return next(
      new ErrorResponse(`Meal not found with id of ${req.params.id}`, 404)
    );
  }
  
  res.status(200).json({
    success: true,
    data: meal
  });
});

/**
 * @desc    Create new meal
 * @route   POST /api/meals
 * @access  Private (Admin only)
 */
exports.createMeal = asyncHandler(async (req, res, next) => {
  // Add user to req.body
  req.body.createdBy = req.user.id;
  
  const meal = await Meal.create(req.body);
  
  res.status(201).json({
    success: true,
    data: meal
  });
});

/**
 * @desc    Update meal
 * @route   PUT /api/meals/:id
 * @access  Private (Admin only)
 */
exports.updateMeal = asyncHandler(async (req, res, next) => {
  let meal = await Meal.findById(req.params.id);
  
  if (!meal) {
    return next(
      new ErrorResponse(`Meal not found with id of ${req.params.id}`, 404)
    );
  }
  
  meal = await Meal.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  
  res.status(200).json({
    success: true,
    data: meal
  });
});

/**
 * @desc    Delete meal
 * @route   DELETE /api/meals/:id
 * @access  Private (Admin only)
 */
exports.deleteMeal = asyncHandler(async (req, res, next) => {
  const meal = await Meal.findById(req.params.id);
  
  if (!meal) {
    return next(
      new ErrorResponse(`Meal not found with id of ${req.params.id}`, 404)
    );
  }
  
  await meal.remove();
  
  res.status(200).json({
    success: true,
    data: {}
  });
});

/**
 * @desc    Get popular meals
 * @route   GET /api/meals/popular
 * @access  Private
 */
exports.getPopularMeals = asyncHandler(async (req, res, next) => {
  const { weekId, day } = req.query;
  
  // Default to current week and day if not specified
  const currentWeekId = weekId || require('../models/WeeklyMenu').getCurrentWeekId();
  const currentDay = day !== undefined ? parseInt(day) : new Date().getDay();
  
  const popularMeals = await Meal.getPopularMeals(currentWeekId, currentDay);
  
  res.status(200).json({
    success: true,
    count: popularMeals.length,
    data: popularMeals
  });
});

/**
 * @desc    Search meals by name or tags
 * @route   GET /api/meals/search
 * @access  Private
 */
exports.searchMeals = asyncHandler(async (req, res, next) => {
  const { query } = req.query;
  
  if (!query) {
    return next(new ErrorResponse('Please provide a search query', 400));
  }
  
  const meals = await Meal.find({
    $or: [
      { name: { $regex: query, $options: 'i' } },
      { tags: { $regex: query, $options: 'i' } }
    ]
  });
  
  res.status(200).json({
    success: true,
    count: meals.length,
    data: meals
  });
});