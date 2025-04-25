const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { protect, authorize, checkOwnership } = require('../../middleware/auth');
const User = require('../../models/User');

// Mock the User model
jest.mock('../../models/User');

// Mock jsonwebtoken
jest.mock('jsonwebtoken');

describe('Auth Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Mock request, response, and next function
    req = {
      headers: {},
      cookies: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
  });

  describe('protect', () => {
    it('should return 401 if no token is provided', async () => {
      // Call middleware
      await protect(req, res, next);

      // Verify error response
      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        error: 'Not authorized to access this route'
      }));
    });

    it('should use token from Authorization header', async () => {
      // Mock token in Authorization header
      req.headers.authorization = 'Bearer testtoken';

      // Mock jwt.verify to return decoded token
      jwt.verify.mockReturnValue({ id: 'user123' });

      // Mock User.findById to return a user
      const mockUser = { _id: 'user123', name: 'Test User' };
      User.findById.mockResolvedValue(mockUser);

      // Call middleware
      await protect(req, res, next);

      // Verify user was added to request
      expect(jwt.verify).toHaveBeenCalledWith('testtoken', process.env.JWT_SECRET);
      expect(User.findById).toHaveBeenCalledWith('user123');
      expect(req.user).toEqual(mockUser);
      expect(next).toHaveBeenCalled();
    });

    it('should use token from cookie if available', async () => {
      // Mock token in cookie
      req.cookies.token = 'cookietoken';

      // Mock jwt.verify to return decoded token
      jwt.verify.mockReturnValue({ id: 'user456' });

      // Mock User.findById to return a user
      const mockUser = { _id: 'user456', name: 'Cookie User' };
      User.findById.mockResolvedValue(mockUser);

      // Call middleware
      await protect(req, res, next);

      // Verify user was added to request
      expect(jwt.verify).toHaveBeenCalledWith('cookietoken', process.env.JWT_SECRET);
      expect(User.findById).toHaveBeenCalledWith('user456');
      expect(req.user).toEqual(mockUser);
      expect(next).toHaveBeenCalled();
    });

    it('should return 401 if token is invalid', async () => {
      // Mock token in Authorization header
      req.headers.authorization = 'Bearer invalidtoken';

      // Mock jwt.verify to throw error
      jwt.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      // Call middleware
      await protect(req, res, next);

      // Verify error response
      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        error: 'Not authorized to access this route'
      }));
    });

    it('should return 401 if user not found', async () => {
      // Mock token in Authorization header
      req.headers.authorization = 'Bearer testtoken';

      // Mock jwt.verify to return decoded token
      jwt.verify.mockReturnValue({ id: 'nonexistent' });

      // Mock User.findById to return null (user not found)
      User.findById.mockResolvedValue(null);

      // Call middleware
      await protect(req, res, next);

      // Verify error response
      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        error: 'User not found'
      }));
    });
  });

  describe('authorize', () => {
    it('should call next() if user has authorized role', () => {
      // Set up request with user
      req.user = { role: 'admin' };

      // Create middleware with authorized roles
      const middleware = authorize('admin', 'superadmin');

      // Call middleware
      middleware(req, res, next);

      // Verify next was called
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });

    it('should return 403 if user role is not authorized', () => {
      // Set up request with user
      req.user = { role: 'user' };

      // Create middleware with authorized roles
      const middleware = authorize('admin', 'superadmin');

      // Call middleware
      middleware(req, res, next);

      // Verify error response
      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        error: 'User role user is not authorized to access this route'
      }));
    });
  });

  describe('checkOwnership', () => {
    it('should call next() if user is owner', async () => {
      // Set up request with user and params
      const userId = new mongoose.Types.ObjectId();
      req.user = { _id: userId, role: 'user' };
      req.params = { id: 'resource123' };

      // Mock model findById to return resource with matching userId
      const mockModel = {
        findById: jest.fn().mockResolvedValue({
          userId: userId
        })
      };

      // Create middleware
      const middleware = checkOwnership(mockModel, 'id', 'userId');

      // Call middleware
      await middleware(req, res, next);

      // Verify next was called
      expect(mockModel.findById).toHaveBeenCalledWith('resource123');
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });

    it('should call next() if user is admin', async () => {
      // Set up request with admin user and params
      const adminId = new mongoose.Types.ObjectId();
      const ownerId = new mongoose.Types.ObjectId();
      req.user = { _id: adminId, role: 'admin' };
      req.params = { id: 'resource123' };

      // Mock model findById to return resource with different userId
      const mockModel = {
        findById: jest.fn().mockResolvedValue({
          userId: ownerId // Different from adminId
        })
      };

      // Create middleware
      const middleware = checkOwnership(mockModel, 'id', 'userId');

      // Call middleware
      await middleware(req, res, next);

      // Verify next was called (admin bypass)
      expect(mockModel.findById).toHaveBeenCalledWith('resource123');
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });

    it('should return 404 if resource not found', async () => {
      // Set up request with user and params
      req.user = { _id: 'user123', role: 'user' };
      req.params = { id: 'nonexistent' };

      // Mock model findById to return null
      const mockModel = {
        findById: jest.fn().mockResolvedValue(null)
      };

      // Create middleware
      const middleware = checkOwnership(mockModel, 'id', 'userId');

      // Call middleware
      await middleware(req, res, next);

      // Verify error response
      expect(mockModel.findById).toHaveBeenCalledWith('nonexistent');
      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        error: expect.stringContaining('not found')
      }));
    });

    it('should return 403 if user is not owner', async () => {
      // Set up request with user and params
      const userId = new mongoose.Types.ObjectId();
      const ownerId = new mongoose.Types.ObjectId();
      req.user = { _id: userId, role: 'user' };
      req.params = { id: 'resource123' };

      // Mock model findById to return resource with different userId
      const mockModel = {
        findById: jest.fn().mockResolvedValue({
          userId: ownerId // Different from userId
        })
      };

      // Create middleware
      const middleware = checkOwnership(mockModel, 'id', 'userId');

      // Call middleware
      await middleware(req, res, next);

      // Verify error response
      expect(mockModel.findById).toHaveBeenCalledWith('resource123');
      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        error: expect.stringContaining('Not authorized')
      }));
    });
  });
});