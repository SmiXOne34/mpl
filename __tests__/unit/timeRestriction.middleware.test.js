const { checkVotingOpen, addVotingStatus } = require('../../middleware/timeRestriction');
const { isVotingOpen, getTimeRemaining } = require('../../utils/timeRestriction');

// Mock the timeRestriction utility functions
jest.mock('../../utils/timeRestriction');

describe('Time Restriction Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Mock request, response, and next function
    req = {
      user: { role: 'user' }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
  });

  describe('checkVotingOpen', () => {
    it('should call next() when voting is open', () => {
      // Mock isVotingOpen to return true
      isVotingOpen.mockReturnValue(true);

      // Call middleware
      checkVotingOpen(req, res, next);

      // Verify next was called
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });

    it('should return error when voting is closed', () => {
      // Mock isVotingOpen to return false
      isVotingOpen.mockReturnValue(false);

      // Call middleware
      checkVotingOpen(req, res, next);

      // Verify error response
      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        error: expect.stringContaining('Voting is currently closed')
      }));
    });

    it('should allow admin users to bypass time restrictions', () => {
      // Set user role to admin
      req.user.role = 'admin';

      // Mock isVotingOpen to return false
      isVotingOpen.mockReturnValue(false);

      // Call middleware
      checkVotingOpen(req, res, next);

      // Verify next was called (admin bypass)
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  describe('addVotingStatus', () => {
    it('should add voting status to response', () => {
      // Mock getTimeRemaining to return status
      const mockStatus = {
        isOpen: true,
        hoursRemaining: 5,
        minutesRemaining: 30,
        message: 'Voting is open'
      };
      getTimeRemaining.mockReturnValue(mockStatus);

      // Mock response.json to capture the modified response
      const originalJson = res.json;
      res.json = jest.fn(data => {
        // Call the original to simulate normal behavior
        originalJson(data);
        return res;
      });

      // Call middleware
      addVotingStatus(req, res, next);

      // Call res.json with some data
      res.json({ success: true, data: 'test' });

      // Verify voting status was added to response
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        data: 'test',
        votingStatus: mockStatus
      }));
      expect(next).toHaveBeenCalled();
    });

    it('should not modify error responses', () => {
      // Mock getTimeRemaining to return status
      const mockStatus = {
        isOpen: true,
        hoursRemaining: 5,
        minutesRemaining: 30,
        message: 'Voting is open'
      };
      getTimeRemaining.mockReturnValue(mockStatus);

      // Mock response.json to capture the modified response
      const originalJson = res.json;
      res.json = jest.fn(data => {
        // Call the original to simulate normal behavior
        originalJson(data);
        return res;
      });

      // Call middleware
      addVotingStatus(req, res, next);

      // Call res.json with error data
      res.json({ success: false, error: 'Test error' });

      // Verify voting status was not added to error response
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        error: 'Test error'
      }));
      expect(res.json).not.toHaveBeenCalledWith(expect.objectContaining({
        votingStatus: mockStatus
      }));
      expect(next).toHaveBeenCalled();
    });
  });
});