/**
 * Time restriction middleware
 * Enforces voting time restrictions for meal selections
 */

const ErrorResponse = require('../utils/errorResponse');
const { isVotingOpen, getTimeRemaining } = require('../utils/timeRestriction');
const asyncHandler = require('./async');

/**
 * Middleware to check if voting is currently open
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const checkVotingOpen = asyncHandler(async (req, res, next) => {
  // Skip check for admin users
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  
  // Check if voting is open
  const votingOpen = await isVotingOpen();
  if (!votingOpen) {
    // Get time remaining info for error message
    const timeInfo = await getTimeRemaining();
    return next(new ErrorResponse(`Voting is currently closed. ${timeInfo.message}`, 403));
  }
  
  next();
});

/**
 * Middleware to check if voting is currently closed
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const checkVotingClosed = asyncHandler(async (req, res, next) => {
  // Skip check for admin users
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  
  // Check if voting is closed
  const votingOpen = await isVotingOpen();
  if (votingOpen) {
    // Get time remaining info for error message
    const timeInfo = await getTimeRemaining();
    return next(new ErrorResponse(`This action can only be performed when voting is closed. ${timeInfo.message}`, 403));
  }
  
  next();
});

/**
 * Middleware to add voting status to response
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const addVotingStatus = asyncHandler(async (req, res, next) => {
  // Get full voting status
  const status = await getTimeRemaining();
  
  // Add voting status to res.locals
  res.locals.votingStatus = status;
  
  next();
});

module.exports = {
  checkVotingOpen,
  checkVotingClosed,
  addVotingStatus
};