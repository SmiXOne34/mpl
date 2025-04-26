const WeeklyMenu = require('../models/WeeklyMenu');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const { getCurrentWeekId, getWeekDates } = require('../utils/weekUtils');

/**
 * Menu Controller for MealWise Family application
 * Handles operations for weekly menus
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
  const { weekId } = req.params;
  console.log('Fetching menu for week:', weekId);

  const menu = await WeeklyMenu.findOne({ weekId })
    .populate({
      path: 'days.meals',
      select: 'name description imageUrl tags'
    })
    .populate({
      path: 'createdBy',
      select: 'name'
    });

  if (!menu) {
    return next(
      new ErrorResponse(`No menu found for week ${weekId}`, 404)
    );
  }

  // Get week dates
  const { startDate, endDate } = getWeekDates(weekId);

  res.status(200).json({
    success: true,
    data: {
      ...menu._doc,
      weekDates: {
        startDate,
        endDate
      }
    }
  });
});

/**
 * @desc    Create new weekly menu
 * @route   POST /api/menu
 * @access  Private (Admin only)
 */
exports.createMenu = asyncHandler(async (req, res, next) => {
  console.log('Creating menu with data:', JSON.stringify(req.body, null, 2));
  console.log('User ID:', req.user ? req.user.id : 'No user ID found');
  
  try {
    // Check if user is authenticated
    if (!req.user || !req.user.id) {
      console.error('No authenticated user found');
      return next(new ErrorResponse('Authentication required', 401));
    }
    
    // Validate required fields
    if (!req.body.weekNumber || !req.body.year) {
      console.error('Missing required fields: weekNumber or year');
      return next(new ErrorResponse('Week number and year are required', 400));
    }

    // Ensure weekNumber and year are numbers
    const weekNumber = parseInt(req.body.weekNumber, 10);
    const year = parseInt(req.body.year, 10);

    if (isNaN(weekNumber) || isNaN(year)) {
      console.error('Invalid number format: weekNumber or year');
      return next(new ErrorResponse('Week number and year must be valid numbers', 400));
    }

    // Generate weekId
    const weekNumStr = weekNumber.toString().padStart(2, '0');
    const weekId = `${year}-${weekNumStr}`;
    console.log('Generated weekId:', weekId);
  
    // Check if menu already exists for this week
    const existingMenu = await WeeklyMenu.findOne({ weekId });
  
    if (existingMenu) {
      console.log('Menu already exists:', existingMenu._id);
      return next(new ErrorResponse(`Menu already exists for week ${weekId}`, 400));
    }
  
    // Ensure days array is properly formatted
    if (!Array.isArray(req.body.days)) {
      console.error('Days is not an array');
      return next(new ErrorResponse('Days must be an array', 400));
    }

    // Process days array
    const processedDays = [];
    
    for (let i = 0; i < req.body.days.length; i++) {
      const day = req.body.days[i];
      
      if (!day) {
        processedDays.push({ meals: [] });
        continue;
      }
      
      // Ensure meals is an array
      if (!Array.isArray(day.meals)) {
        processedDays.push({ meals: [] });
        continue;
      }
      
      // Process meal IDs
      const mealIds = day.meals
        .map(meal => {
          if (typeof meal === 'string') {
            return meal;
          } else if (meal && meal._id) {
            return meal._id;
          }
          return null;
        })
        .filter(id => id !== null);
      
      processedDays.push({ meals: mealIds });
    }
    
    // Ensure we have 7 days
    while (processedDays.length < 7) {
      processedDays.push({ meals: [] });
    }
    
    // Prepare the menu data
    const menuData = {
      weekNumber,
      year,
      weekId,
      days: processedDays,
      createdBy: req.user.id
    };
    
    console.log('Creating menu with processed data:', JSON.stringify(menuData, null, 2));
    
    try {
      // Create the menu
      const menu = await WeeklyMenu.create(menuData);
      console.log('Menu created successfully with ID:', menu._id);
    
      // Populate the menu
      await menu.populate([
        {
          path: 'days.meals',
          select: 'name description imageUrl tags'
        },
        {
          path: 'createdBy',
          select: 'name'
        }
      ]);
    
      // Emit socket event for real-time updates
      if (req.io) {
        console.log('Emitting menu:created event');
        req.io.emit('menu:created', menu);
      }
    
      console.log('Sending success response');
      return res.status(201).json({
        success: true,
        data: menu
      });
    } catch (dbError) {
      console.error('Database error creating menu:', dbError);
      
      // Check for validation errors
      if (dbError.name === 'ValidationError') {
        const messages = Object.values(dbError.errors).map(val => val.message);
        return next(new ErrorResponse(`Validation error: ${messages.join(', ')}`, 400));
      }
      
      // Check for duplicate key error
      if (dbError.code === 11000) {
        return next(new ErrorResponse(`Menu already exists for week ${weekId}`, 400));
      }
      
      return next(new ErrorResponse(`Error creating menu: ${dbError.message}`, 500));
    }
  } catch (error) {
    console.error('Unexpected error in createMenu controller:', error);
    return next(new ErrorResponse(`Server error: ${error.message}`, 500));
  }
});

/**
 * @desc    Update weekly menu
 * @route   PUT /api/menu/:weekId
 * @access  Private (Admin only)
 */
exports.updateMenu = asyncHandler(async (req, res, next) => {
  const { weekId } = req.params;
  console.log('Updating menu for week:', weekId, 'with data:', JSON.stringify(req.body, null, 2));
  console.log('User ID:', req.user.id);

  try {
    // Validate weekId format
    if (!weekId || !/^\d{4}-\d{2}$/.test(weekId)) {
      return next(
        new ErrorResponse(`Invalid week ID format: ${weekId}. Expected format: YYYY-WW`, 400)
      );
    }

    // Find the menu
    let menu = await WeeklyMenu.findOne({ weekId });
  
    if (!menu) {
      return next(
        new ErrorResponse(`No menu found for week ${weekId}`, 404)
      );
    }
  
    console.log('Found existing menu with ID:', menu._id);

    // Ensure weekNumber and year are numbers if provided
    let updateData = { ...req.body };
    
    if (updateData.weekNumber) {
      updateData.weekNumber = parseInt(updateData.weekNumber, 10);
      if (isNaN(updateData.weekNumber)) {
        return next(
          new ErrorResponse('Week number must be a valid number', 400)
        );
      }
    }
    
    if (updateData.year) {
      updateData.year = parseInt(updateData.year, 10);
      if (isNaN(updateData.year)) {
        return next(
          new ErrorResponse('Year must be a valid number', 400)
        );
      }
    }
  
    // Process days array if provided
    if (Array.isArray(updateData.days)) {
      const processedDays = [];
      
      for (let i = 0; i < updateData.days.length; i++) {
        const day = updateData.days[i];
        
        if (!day) {
          processedDays.push({ meals: [] });
          continue;
        }
        
        // Ensure meals is an array
        if (!Array.isArray(day.meals)) {
          processedDays.push({ meals: [] });
          continue;
        }
        
        // Process meal IDs
        const mealIds = day.meals
          .map(meal => {
            if (typeof meal === 'string') {
              return meal;
            } else if (meal && meal._id) {
              return meal._id;
            }
            return null;
          })
          .filter(id => id !== null);
        
        processedDays.push({ meals: mealIds });
      }
      
      // Ensure we have 7 days
      while (processedDays.length < 7) {
        processedDays.push({ meals: [] });
      }
      
      updateData.days = processedDays;
    }
    
    console.log('Updating menu with processed data:', JSON.stringify(updateData, null, 2));
    
    // Update the menu
    menu = await WeeklyMenu.findOneAndUpdate({ weekId }, updateData, {
      new: true,
      runValidators: true
    });
  
    if (!menu) {
      return next(
        new ErrorResponse(`Failed to update menu for week ${weekId}`, 500)
      );
    }
    
    console.log('Menu updated successfully with ID:', menu._id);
  
    // Populate the menu
    await menu.populate([
      {
        path: 'days.meals',
        select: 'name description imageUrl tags'
      },
      {
        path: 'createdBy',
        select: 'name'
      }
    ]);
  
    // Emit socket event for real-time updates
    if (req.io) {
      console.log('Emitting menu:updated event');
      req.io.emit('menu:updated', menu);
    }
  
    console.log('Sending success response');
    res.status(200).json({
      success: true,
      data: menu
    });
  } catch (error) {
    console.error('Error in updateMenu controller:', error);
    return next(new ErrorResponse(`Error updating menu: ${error.message}`, 500));
  }
});

/**
 * @desc    Delete weekly menu
 * @route   DELETE /api/menu/:weekId
 * @access  Private (Admin only)
 */
exports.deleteMenu = asyncHandler(async (req, res, next) => {
  const { weekId } = req.params;

  const menu = await WeeklyMenu.findOne({ weekId });

  if (!menu) {
    return next(
      new ErrorResponse(`No menu found for week ${weekId}`, 404)
    );
  }

  await menu.remove();

  // Emit socket event for real-time updates
  if (req.io) {
    req.io.emit('menu:deleted', weekId);
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
  const { sourceWeekId } = req.params;
  const { targetWeekId } = req.body;

  if (!targetWeekId) {
    return next(
      new ErrorResponse('Please provide a target week ID', 400)
    );
  }

  try {
    const newMenu = await WeeklyMenu.copyMenu(sourceWeekId, targetWeekId);

    // Populate the menu
    await newMenu.populate([
      {
        path: 'meals',
        select: 'name description imageUrl tags'
      },
      {
        path: 'createdBy',
        select: 'name'
      }
    ]);

    // Emit socket event for real-time updates
    if (req.io) {
      req.io.emit('menu:created', newMenu);
    }

    res.status(201).json({
      success: true,
      data: newMenu
    });
  } catch (err) {
    return next(
      new ErrorResponse(err.message, 400)
    );
  }
});