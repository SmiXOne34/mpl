const jwt = require('jsonwebtoken');
const asyncHandler = require('./async');
const ErrorResponse = require('../utils/errorResponse');
const User = require('../models/User');

/**
 * Authentication middleware for MealWise Family application
 * Protects routes and verifies JWT tokens
 */

// Protect routes
exports.protect = asyncHandler(async (req, res, next) => {
  let token;

  // Check for token in Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // Set token from Bearer token in header
    token = req.headers.authorization.split(' ')[1];
  }
  // Check for token in cookies
  else if (req.cookies.token) {
    token = req.cookies.token;
  }

  // Make sure token exists
  if (!token) {
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'mealwise_secret_key');

    // Add user to request object
    req.user = await User.findById(decoded.id);

    next();
  } catch (err) {
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }
});

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ErrorResponse('User not found', 404));
    }
    
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorResponse(
          `User role ${req.user.role} is not authorized to access this route`,
          403
        )
      );
    }
    next();
  };
};

// Check if user is the owner of a resource or an admin
exports.checkOwnership = (model, paramIdField = 'id', userIdField = 'userId') => {
  return asyncHandler(async (req, res, next) => {
    const resource = await model.findById(req.params[paramIdField]);

    if (!resource) {
      return next(
        new ErrorResponse(`Resource not found with id of ${req.params[paramIdField]}`, 404)
      );
    }

    // Check if user is the owner or an admin
    if (
      resource[userIdField].toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return next(
        new ErrorResponse('Not authorized to access this resource', 403)
      );
    }

    // Add resource to request
    req.resource = resource;
    next();
  });
};