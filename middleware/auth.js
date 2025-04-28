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

  console.log('Auth middleware - checking for token');
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  console.log('Cookies:', req.cookies);

  // Check for token in Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer') &&
    req.headers.authorization.split(' ')[1] !== 'undefined'
  ) {
    // Set token from Bearer token in header
    token = req.headers.authorization.split(' ')[1];
    console.log('Found token in Authorization header');
  }
  // Check for token in cookies
  else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
    console.log('Found token in cookies');
  }

  // Make sure token exists
  if (!token) {
    console.error('No token found in request');
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }

  try {
    // Verify token
    console.log('Verifying token');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'mealwise_secret_key');
    console.log('Token verified, user ID:', decoded.id);

    // Add user to request object
    const user = await User.findById(decoded.id);
    
    if (!user) {
      console.error('User not found for ID:', decoded.id);
      return next(new ErrorResponse('User not found', 401));
    }
    
    console.log('User found:', user.name, 'Role:', user.role);
    req.user = user;

    next();
  } catch (err) {
    console.error('Token verification failed:', err.message);
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }
});

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    console.log('Authorize middleware - checking role authorization');
    console.log('Required roles:', roles);
    
    if (!req.user) {
      console.error('No user found in request');
      return next(new ErrorResponse('User not found', 404));
    }
    
    console.log('User role:', req.user.role);
    
    if (!roles.includes(req.user.role)) {
      console.error(`User role ${req.user.role} is not authorized. Required roles: ${roles.join(', ')}`);
      return next(
        new ErrorResponse(
          `User role ${req.user.role} is not authorized to access this route`,
          403
        )
      );
    }
    
    console.log('User authorized successfully');
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