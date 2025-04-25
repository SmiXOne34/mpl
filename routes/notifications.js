const express = require('express');
const {
  getNotifications,
  getNotification,
  createNotification,
  broadcastNotification,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications
} = require('../controllers/notificationController');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

// Protect all routes
router.use(protect);

// Routes for all authenticated users
router.route('/')
  .get(getNotifications)
  .delete(deleteAllNotifications);

router.route('/:id')
  .get(getNotification)
  .delete(deleteNotification);

router.put('/:id/read', markAsRead);
router.put('/read-all', markAllAsRead);

// Admin-only routes
router.post('/', authorize('admin'), createNotification);
router.post('/broadcast', authorize('admin'), broadcastNotification);

module.exports = router;