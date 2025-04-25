const Meal = require('../models/Meal');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const { generateMealRecipe } = require('../utils/geminiApi');

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

  // Emit socket event for real-time updates using the safe method
  console.log('Meal created successfully:', meal);
  
  if (req.safeEmit) {
    console.log('Safely emitting meal:created event');
    req.safeEmit('meal:created', meal);
  } else {
    console.log('Safe emit method not available, trying direct emit');
    try {
      if (req.io) {
        req.io.emit('meal:created', meal);
        console.log('Direct emit successful');
      } else {
        console.log('Socket IO not available for this request');
      }
    } catch (socketError) {
      console.error('Socket emit error:', socketError);
      // Continue processing even if socket emit fails
    }
  }

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
  try {
    console.log(`Updating meal with ID: ${req.params.id}`);
    console.log('Update data:', req.body);
    
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

    console.log('Meal updated successfully:', meal);

    // Emit socket event for real-time updates using the safe method
    if (req.safeEmit) {
      console.log('Safely emitting meal:updated event');
      req.safeEmit('meal:updated', meal);
    } else {
      console.log('Safe emit method not available, trying direct emit');
      try {
        if (req.io) {
          req.io.emit('meal:updated', meal);
          console.log('Direct emit successful');
        } else {
          console.log('Socket IO not available for this request');
        }
      } catch (socketError) {
        console.error('Socket emit error:', socketError);
        // Continue processing even if socket emit fails
      }
    }

    res.status(200).json({
      success: true,
      data: meal
    });
  } catch (error) {
    console.error('Error in updateMeal controller:', error);
    return next(new ErrorResponse('Error updating meal', 500));
  }
});

/**
 * @desc    Delete meal
 * @route   DELETE /api/meals/:id
 * @access  Private (Admin only)
 */
exports.deleteMeal = asyncHandler(async (req, res, next) => {
  try {
    console.log(`Deleting meal with ID: ${req.params.id}`);
    
    const meal = await Meal.findById(req.params.id);

    if (!meal) {
      return next(
        new ErrorResponse(`Meal not found with id of ${req.params.id}`, 404)
      );
    }

    // Use findByIdAndDelete instead of remove() which is deprecated
    await Meal.findByIdAndDelete(req.params.id);
    console.log('Meal deleted successfully');

    // Emit socket event for real-time updates using the safe method
    if (req.safeEmit) {
      console.log('Safely emitting meal:deleted event');
      req.safeEmit('meal:deleted', req.params.id);
    } else {
      console.log('Safe emit method not available, trying direct emit');
      try {
        if (req.io) {
          req.io.emit('meal:deleted', req.params.id);
          console.log('Direct emit successful');
        } else {
          console.log('Socket IO not available for this request');
        }
      } catch (socketError) {
        console.error('Socket emit error:', socketError);
        // Continue processing even if socket emit fails
      }
    }

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error('Error in deleteMeal controller:', error);
    return next(new ErrorResponse('Error deleting meal', 500));
  }
});

/**
 * @desc    Get popular meals
 * @route   GET /api/meals/popular
 * @access  Private
 */
exports.getPopularMeals = asyncHandler(async (req, res, next) => {
  const meals = await Meal.find().populate('popularity').sort('-popularity');

  res.status(200).json({
    success: true,
    count: meals.length,
    data: meals
  });
});

/**
 * @desc    Search meals
 * @route   GET /api/meals/search
 * @access  Private
 */
exports.searchMeals = asyncHandler(async (req, res, next) => {
  const { query } = req.query;

  if (!query) {
    return next(new ErrorResponse('Please provide a search query', 400));
  }

  const meals = await Meal.find({
    $text: {
      $search: query
    }
  }).sort({
    score: { $meta: 'textScore' }
  });

  res.status(200).json({
    success: true,
    count: meals.length,
    data: meals
  });
});

/**
 * @desc    Generate meal using AI
 * @route   POST /api/meals/generate
 * @access  Private (Admin only)
 */
exports.generateMeal = asyncHandler(async (req, res, next) => {
  const { prompt } = req.body;

  if (!prompt) {
    return next(new ErrorResponse('Please provide a prompt for meal generation', 400));
  }

  try {
    console.log('Controller: Generating meal with prompt:', prompt);
    console.log('Controller: Request received at:', new Date().toISOString());
    
    // Add a timeout to prevent long-running requests
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Meal generation timed out after 30 seconds')), 30000);
    });
    
    // Race the meal generation against the timeout
    console.log('Controller: Starting meal generation with timeout...');
    let generatedMeal;
    
    try {
      generatedMeal = await Promise.race([
        generateMealRecipe(prompt),
        timeoutPromise
      ]);
      console.log('Controller: Meal generation completed successfully');
    } catch (generationError) {
      console.error('Controller: Error during meal generation:', generationError);
      // Instead of creating a fallback meal, throw the error to be handled by the outer try/catch
      throw new Error(`Failed to generate meal: ${generationError.message}`);
    }
    
    // Validate the generated meal
    if (!generatedMeal || !generatedMeal.name || !generatedMeal.description) {
      console.error('Controller: Invalid meal data structure:', generatedMeal);
      throw new Error('Invalid meal data structure returned from generation');
    }
    
    // Log the generated meal
    console.log('Controller: Generated meal successfully:', JSON.stringify(generatedMeal, null, 2));
    console.log('Controller: Response ready at:', new Date().toISOString());
    
    // Send the response immediately
    res.status(200).json({
      success: true,
      data: generatedMeal
    });
    
  } catch (error) {
    console.error('Controller: AI Meal Generation Error:', error);
    
    // Return an error response instead of a fallback meal
    console.log('Controller: Sending error response');
    return next(new ErrorResponse(`Failed to generate meal: ${error.message}`, 500));
  }
});