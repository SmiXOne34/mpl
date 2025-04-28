const express = require('express');
const {
  getAllMenus,
  getCurrentMenu,
  getMenuByWeek,
  createMenu,
  updateMenu,
  deleteMenu,
  copyMenu
} = require('../controllers/menuController');

const router = express.Router();

// Import middleware
const { protect, authorize } = require('../middleware/auth');

// Apply protection to all routes
router.use(protect);

// Public routes (protected but not role-restricted)
router.get('/current', getCurrentMenu);
router.get('/all', authorize('admin'), getAllMenus);
router.get('/:weekId', getMenuByWeek);

// Admin routes
router.post('/', authorize('admin'), createMenu);
router.put('/:weekId', authorize('admin'), updateMenu);
router.delete('/:weekId', authorize('admin'), deleteMenu);
router.post('/:sourceWeekId/copy', authorize('admin'), copyMenu);

module.exports = router;