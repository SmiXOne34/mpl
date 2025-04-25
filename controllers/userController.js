const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

/**
 * User Controller for MealWise Family application
 * Handles CRUD operations for users (admin only)
 */

/**
 * @desc    Get all users
 * @route   GET /api/users
 * @access  Private (Admin only)
 */
exports.getUsers = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

/**
 * @desc    Get single user
 * @route   GET /api/users/:id
 * @access  Private (Admin only)
 */
exports.getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  
  if (!user) {
    return next(
      new ErrorResponse(`User not found with id of ${req.params.id}`, 404)
    );
  }
  
  res.status(200).json({
    success: true,
    data: user
  });
});

/**
 * @desc    Create user
 * @route   POST /api/users
 * @access  Private (Admin only)
 */
exports.createUser = asyncHandler(async (req, res, next) => {
  const user = await User.create(req.body);
  
  res.status(201).json({
    success: true,
    data: user
  });
});

/**
 * @desc    Update user
 * @route   PUT /api/users/:id
 * @access  Private (Admin only)
 */
exports.updateUser = asyncHandler(async (req, res, next) => {
  let user = await User.findById(req.params.id);
  
  if (!user) {
    return next(
      new ErrorResponse(`User not found with id of ${req.params.id}`, 404)
    );
  }
  
  // Prevent admin from updating their own role
  if (req.params.id === req.user.id && req.body.role) {
    return next(
      new ErrorResponse('Admin cannot change their own role', 403)
    );
  }
  
  user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  
  res.status(200).json({
    success: true,
    data: user
  });
});

/**
 * @desc    Delete user
 * @route   DELETE /api/users/:id
 * @access  Private (Admin only)
 */
exports.deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  
  if (!user) {
    return next(
      new ErrorResponse(`User not found with id of ${req.params.id}`, 404)
    );
  }
  
  // Prevent admin from deleting themselves
  if (req.params.id === req.user.id) {
    return next(
      new ErrorResponse('Admin cannot delete themselves', 403)
    );
  }
  
  await user.remove();
  
  res.status(200).json({
    success: true,
    data: {}
  });
});

/**
 * @desc    Update user role
 * @route   PUT /api/users/:id/role
 * @access  Private (Admin only)
 */
exports.updateUserRole = asyncHandler(async (req, res, next) => {
  let user = await User.findById(req.params.id);
  
  if (!user) {
    return next(
      new ErrorResponse(`User not found with id of ${req.params.id}`, 404)
    );
  }
  
  // Prevent admin from updating their own role
  if (req.params.id === req.user.id) {
    return next(
      new ErrorResponse('Admin cannot change their own role', 403)
    );
  }
  
  // Check if role is provided
  if (!req.body.role) {
    return next(
      new ErrorResponse('Please provide a role', 400)
    );
  }
  
  // Check if role is valid
  const validRoles = ['admin', 'chooser', 'viewer'];
  if (!validRoles.includes(req.body.role)) {
    return next(
      new ErrorResponse(`Role must be one of: ${validRoles.join(', ')}`, 400)
    );
  }
  
  user = await User.findByIdAndUpdate(
    req.params.id,
    { role: req.body.role },
    {
      new: true,
      runValidators: true
    }
  );
  
  // Emit socket event for real-time updates
  if (req.io) {
    req.io.emit('user:roleUpdate', {
      userId: user._id,
      role: user.role
    });
  }
  
  res.status(200).json({
    success: true,
    data: user
  });
});