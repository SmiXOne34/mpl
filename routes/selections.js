const express = require('express');
const {
  getMySelections,
  getFamilySelections,
  createSelection,
  deleteSelection,
  getPopularMeal,
  getVotingStatus,
  getSelectionHistory
} = require('../controllers/selectionController');

const router = express.Router();

// Import middleware
const { protect, authorize, checkOwnership } = require('../middleware/auth');
const { checkVotingOpen, addVotingStatus } = require('../middleware/timeRestriction');

// Import model
const Selection = require('../models/Selection');

// Apply protection to all routes
router.use(protect);

// Add voting status to all responses
router.use(addVotingStatus);

// Routes
router.get('/', getMySelections);
router.get('/family', getFamilySelections);
router.get('/popular', getPopularMeal);
router.get('/status', getVotingStatus);
router.get('/history', getSelectionHistory);

// Apply time restriction to create and delete operations
router.post('/', authorize('admin', 'chooser'), checkVotingOpen, createSelection);
router.delete('/:id', checkOwnership(Selection, 'id', 'userId'), checkVotingOpen, deleteSelection);

module.exports = router;