# Error Handling in MealWise Family

This document explains the error handling approach used in the MealWise Family application.

## Overview

The application implements a centralized error handling system that:

1. Captures errors from various sources
2. Formats them consistently
3. Returns appropriate HTTP status codes
4. Provides helpful error messages to clients

## Error Middleware

The core of the error handling system is the error middleware (`middleware/error.js`), which processes all errors that occur during request handling.

### Implementation

```javascript
const ErrorResponse = require('../utils/errorResponse');

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log to console for dev
  console.error(err);

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = `Resource not found with id of ${err.value}`;
    error = new ErrorResponse(message, 400);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `Duplicate field value entered: ${field}`;
    error = new ErrorResponse(message, 400);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = new ErrorResponse(message, 400);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    error = new ErrorResponse('Not authorized to access this route', 401);
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;
```

## Error Types

The middleware handles several types of errors:

### Custom Application Errors

Custom errors are created using the `ErrorResponse` class:

```javascript
class ErrorResponse extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}
```

Example usage:

```javascript
if (!user) {
  return next(new ErrorResponse('User not found', 404));
}
```

### Mongoose Errors

#### CastError

Occurs when an invalid ID is provided to a Mongoose query.

Example:
```
GET /api/meals/123 (where 123 is not a valid ObjectId)
```

Response:
```json
{
  "success": false,
  "error": "Resource not found with id of 123"
}
```

#### ValidationError

Occurs when a document fails Mongoose schema validation.

Example:
```
POST /api/meals (with missing required fields)
```

Response:
```json
{
  "success": false,
  "error": "Name is required, Description is required"
}
```

#### Duplicate Key Error

Occurs when a unique constraint is violated.

Example:
```
POST /api/auth/register (with an email that already exists)
```

Response:
```json
{
  "success": false,
  "error": "Duplicate field value entered: email"
}
```

### JWT Errors

#### JsonWebTokenError

Occurs when an invalid JWT token is provided.

Response:
```json
{
  "success": false,
  "error": "Not authorized to access this route"
}
```

#### TokenExpiredError

Occurs when a JWT token has expired.

Response:
```json
{
  "success": false,
  "error": "Not authorized to access this route"
}
```

### Default Server Error

For any unhandled errors, a generic server error is returned:

Response:
```json
{
  "success": false,
  "error": "Server Error"
}
```

In development mode, the error stack trace is also included.

## Error Response Format

All error responses follow a consistent format:

```json
{
  "success": false,
  "error": "Detailed error message"
}
```

## HTTP Status Codes

The application uses appropriate HTTP status codes:

- `400` - Bad Request (invalid input, validation errors)
- `401` - Unauthorized (missing or invalid authentication)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (resource doesn't exist)
- `500` - Server Error (unhandled exceptions)

## Async Error Handling

To avoid try/catch blocks in every controller, the application uses an async error handler wrapper:

```javascript
// utils/asyncHandler.js
const asyncHandler = fn => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);
```

Example usage:

```javascript
const asyncHandler = require('../utils/asyncHandler');

// Get all meals
exports.getMeals = asyncHandler(async (req, res, next) => {
  const meals = await Meal.find();
  
  res.status(200).json({
    success: true,
    data: meals
  });
});
```

## Client-Side Error Handling

The frontend handles API errors by:

1. Checking the response status code
2. Displaying appropriate error messages to users
3. Redirecting to error pages when necessary

Example:

```javascript
// client/src/actions/mealActions.js
export const getMeals = () => async dispatch => {
  try {
    dispatch({ type: 'MEALS_LOADING' });
    
    const res = await axios.get('/api/meals');
    
    dispatch({
      type: 'GET_MEALS',
      payload: res.data.data
    });
  } catch (err) {
    dispatch({
      type: 'MEALS_ERROR',
      payload: err.response?.data.error || 'Server Error'
    });
  }
};
```

## Best Practices

1. **Be Specific**: Provide clear, actionable error messages
2. **Security**: Don't expose sensitive information in error messages
3. **Consistency**: Use the same error format throughout the application
4. **Logging**: Log errors for debugging but control what's sent to clients
5. **Validation**: Validate input early to prevent deeper errors

## Testing Error Handling

The error handling system is tested to ensure it correctly processes different error types:

```javascript
// __tests__/unit/error.middleware.test.js
describe('Error Middleware', () => {
  it('should handle custom ErrorResponse', () => {
    const error = new ErrorResponse('Custom error message', 400);
    errorHandler(error, req, res, next);
    
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: 'Custom error message'
    });
  });
  
  // Additional tests for other error types...
});
```