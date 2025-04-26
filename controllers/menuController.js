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
  
  // Add user to req.body
  req.body.createdBy = req.user.id;

  // Generate weekId if not provided
  if (!req.body.weekId && req.body.weekNumber && req.body.year) {
    const weekNum = req.body.weekNumber.toString().padStart(2, '0');
    req.body.weekId = `${req.body.year}-${weekNum}`;
  }

  // Check if menu already exists for this week
  let existingMenu;
  if (req.body.weekId) {
    existingMenu = await WeeklyMenu.findOne({ weekId: req.body.weekId });
  } else if (req.body.weekNumber && req.body.year) {
    existingMenu = await WeeklyMenu.findOne({ 
      weekNumber: req.body.weekNumber, 
      year: req.body.year 
    });
  }

  if (existingMenu) {
    return next(
      new ErrorResponse(`Menu already exists for week ${req.body.weekId || `${req.body.year}-${req.body.weekNumber}`}`, 400)
    );
  }

  // Ensure days array is properly formatted
  if (req.body.days) {
    console.log('Days before processing:', JSON.stringify(req.body.days, null, 2));
    
    // Make sure each day's meals array contains valid meal IDs
    for (let i = 0; i < req.body.days.length; i++) {
      const day = req.body.days[i];
      if (day && day.meals) {
        // Ensure all meal IDs are strings
        day.meals = day.meals.map(meal => {
          if (typeof meal === 'object' && meal._id) {
            return meal._id;
          }
          return meal;
        });
      }
    }
    
    console.log('Days after processing:', JSON.stringify(req.body.days, null, 2));
  }

  // Create the menu
  const menu = await WeeklyMenu.create(req.body);
  
  console.log('Menu after creation:', JSON.stringify(menu, null, 2));

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
  
  console.log('Menu after population:', JSON.stringify(menu, null, 2));

  // Emit socket event for real-time updates
  if (req.io) {
    req.io.emit('menu:created', menu);
  }

  res.status(201).json({
    success: true,
    data: menu
  });
});

/**
 * @desc    Update weekly menu
 * @route   PUT /api/menu/:weekId
 * @access  Private (Admin only)
 */
exports.updateMenu = asyncHandler(async (req, res, next) => {
  const { weekId } = req.params;
  console.log('Updating menu for week:', weekId, 'with data:', JSON.stringify(req.body, null, 2));

  let menu = await WeeklyMenu.findOne({ weekId });

  if (!menu) {
    return next(
      new ErrorResponse(`No menu found for week ${weekId}`, 404)
    );
  }

  // Ensure days array is properly formatted
  if (req.body.days) {
    console.log('Days before processing:', JSON.stringify(req.body.days, null, 2));
    
    // Make sure each day's meals array contains valid meal IDs
    for (let i = 0; i < req.body.days.length; i++) {
      const day = req.body.days[i];
      if (day && day.meals) {
        // Ensure all meal IDs are strings
        day.meals = day.meals.map(meal => {
          if (typeof meal === 'object' && meal._id) {
            return meal._id;
          }
          return meal;
        });
      }
    }
    
    console.log('Days after processing:', JSON.stringify(req.body.days, null, 2));
  }

  menu = await WeeklyMenu.findOneAndUpdate({ weekId }, req.body, {
    new: true,
    runValidators: true
  });

  console.log('Menu after update:', JSON.stringify(menu, null, 2));

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

  console.log('Menu after population:', JSON.stringify(menu, null, 2));

  // Emit socket event for real-time updates
  if (req.io) {
    req.io.emit('menu:updated', menu);
  }

  res.status(200).json({
    success: true,
    data: menu
  });
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