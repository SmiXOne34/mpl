const ErrorResponse = require('../utils/errorResponse');

/**
 * Error handling middleware for MealWise Family application
 * Formats and sends error responses
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log to console for dev
  console.error('Error details:', {
    name: err.name,
    message: err.message,
    code: err.code,
    statusCode: err.statusCode,
    path: req.path,
    method: req.method
  });

  // Handle payload too large error
  if (err.type === 'entity.too.large' || 
      (err.message && err.message.includes('request entity too large'))) {
    const message = 'Request payload too large. Please reduce the size of your request.';
    error = new ErrorResponse(message, 413);
  }

  // Handle JSON parsing errors
  if (err.type === 'entity.parse.failed' || 
      (err.name === 'SyntaxError' && err.message.includes('JSON'))) {
    const message = 'Invalid JSON in request body.';
    error = new ErrorResponse(message, 400);
  }

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = `Resource not found`;
    error = new ErrorResponse(message, 404);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = 'Duplicate field value entered';
    error = new ErrorResponse(message, 400);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message);
    error = new ErrorResponse(message, 400);
  }

  // Voting closed error
  if (err.name === 'VotingClosedError') {
    error = new ErrorResponse(err.message, 403);
  }

  // Selection limit error
  if (err.name === 'SelectionLimitError') {
    error = new ErrorResponse(err.message, 400);
  }

  // Network or timeout errors
  if (err.name === 'NetworkError' || err.code === 'ECONNABORTED') {
    const message = 'Network error or request timeout. Please try again.';
    error = new ErrorResponse(message, 408);
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Server Error',
    path: req.path
  });
};

module.exports = errorHandler;