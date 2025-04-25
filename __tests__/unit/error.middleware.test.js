const errorHandler = require('../../middleware/error');
const ErrorResponse = require('../../utils/errorResponse');

// Mock console.error to prevent test output pollution
jest.mock('../../middleware/error', () => {
  const originalModule = jest.requireActual('../../middleware/error');
  return function(err, req, res, next) {
    // Skip the console.error call in the middleware
    return originalModule(err, req, res, next);
  };
});

describe('Error Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    // Mock request, response, and next function
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
  });

  it('should handle custom ErrorResponse', () => {
    // Create custom error
    const error = new ErrorResponse('Custom error message', 400);

    // Call error handler
    errorHandler(error, req, res, next);

    // Verify response
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: 'Custom error message'
    });
  });

  it('should handle Mongoose validation errors', () => {
    // Create Mongoose validation error
    const error = {
      name: 'ValidationError',
      errors: {
        name: { message: 'Name is required' },
        email: { message: 'Email is invalid' }
      }
    };

    // Call error handler
    errorHandler(error, req, res, next);

    // Verify response
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: 'Name is required, Email is invalid'
    });
  });

  it('should handle Mongoose duplicate key errors', () => {
    // Create Mongoose duplicate key error
    const error = {
      name: 'MongoError',
      code: 11000,
      keyValue: { email: 'test@example.com' }
    };

    // Call error handler
    errorHandler(error, req, res, next);

    // Verify response
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: 'Duplicate field value entered: email'
    });
  });

  it('should handle Mongoose cast errors', () => {
    // Create Mongoose cast error
    const error = {
      name: 'CastError',
      path: '_id',
      value: 'invalidid'
    };

    // Call error handler
    errorHandler(error, req, res, next);

    // Verify response
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: 'Resource not found with id of invalidid'
    });
  });

  it('should handle JWT errors', () => {
    // Create JWT error
    const error = {
      name: 'JsonWebTokenError',
      message: 'invalid signature'
    };

    // Call error handler
    errorHandler(error, req, res, next);

    // Verify response
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: 'Not authorized to access this route'
    });
  });

  it('should handle unknown errors with default 500 status', () => {
    // Create unknown error
    const error = new Error('Something went wrong');

    // Call error handler
    errorHandler(error, req, res, next);

    // Verify response
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: 'Server Error'
    });
  });

  it('should include error message in development environment', () => {
    // Save original NODE_ENV
    const originalNodeEnv = process.env.NODE_ENV;
    
    // Set to development
    process.env.NODE_ENV = 'development';
    
    // Create error
    const error = new Error('Development error message');
    
    // Call error handler
    errorHandler(error, req, res, next);
    
    // Verify response includes error message
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: 'Development error message',
      stack: expect.any(String)
    });
    
    // Restore NODE_ENV
    process.env.NODE_ENV = originalNodeEnv;
  });
});