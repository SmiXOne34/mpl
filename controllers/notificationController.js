const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Notification = require('../models/Notification');
const { getSocket } = require('../utils/socket');

// @desc    Get all notifications for current user
// @route   GET /api/notifications
// @access  Private
exports.getNotifications = asyncHandler(async (req, res, next) => {
  // Add query parameters for filtering
  const query = { userId: req.user.id };
  
  // Filter by read status if specified
  if (req.query.read === 'true') {
    query.read = true;
  } else if (req.query.read === 'false') {
    query.read = false;
  }
  
  // Filter by type if specified
  if (req.query.type && ['meal', 'event', 'system'].includes(req.query.type)) {
    query.type = req.query.type;
  }
  
  // Filter by date range if specified
  if (req.query.from) {
    const fromDate = new Date(req.query.from);
    if (!isNaN(fromDate)) {
      query.createdAt = { $gte: fromDate };
    }
  }
  
  if (req.query.to) {
    const toDate = new Date(req.query.to);
    if (!isNaN(toDate)) {
      if (!query.createdAt) {
        query.createdAt = {};
      }
      query.createdAt.$lte = toDate;
    }
  }
  
  // Search by title or message
  if (req.query.search) {
    const searchRegex = new RegExp(req.query.search, 'i');
    query.$or = [
      { title: searchRegex },
      { message: searchRegex }
    ];
  }
  
  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await Notification.countDocuments(query);
  
  // Get notifications with pagination
  const notifications = await Notification.find(query)
    .sort({ createdAt: -1 })
    .skip(startIndex)
    .limit(limit);
  
  // Pagination result
  const pagination = {};
  
  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit
    };
  }
  
  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit
    };
  }
  
  // Get unread count
  const unreadCount = await Notification.countDocuments({
    userId: req.user.id,
    read: false
  });
  
  res.status(200).json({
    success: true,
    count: notifications.length,
    unreadCount,
    pagination,
    data: notifications
  });
});

// @desc    Get single notification
// @route   GET /api/notifications/:id
// @access  Private
exports.getNotification = asyncHandler(async (req, res, next) => {
  const notification = await Notification.findById(req.params.id);
  
  if (!notification) {
    return next(
      new ErrorResponse(`Notification not found with id of ${req.params.id}`, 404)
    );
  }
  
  // Make sure user owns the notification
  if (notification.userId.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(`User ${req.user.id} is not authorized to access this notification`, 403)
    );
  }
  
  res.status(200).json({
    success: true,
    data: notification
  });
});

// @desc    Create new notification
// @route   POST /api/notifications
// @access  Private (Admin only)
exports.createNotification = asyncHandler(async (req, res, next) => {
  // If userId is not provided, use the current user's id
  if (!req.body.userId) {
    req.body.userId = req.user.id;
  }
  
  // Create notification
  const notification = await Notification.create(req.body);
  
  // Emit socket event if the notification is for another user
  if (req.body.userId !== req.user.id) {
    const io = getSocket();
    if (io) {
      io.to(`user_${req.body.userId}`).emit('notification:new', notification);
    }
  }
  
  res.status(201).json({
    success: true,
    data: notification
  });
});

// @desc    Create notification for all users
// @route   POST /api/notifications/broadcast
// @access  Private (Admin only)
exports.broadcastNotification = asyncHandler(async (req, res, next) => {
  const { title, message, type, link } = req.body;
  
  // Get all users
  const User = require('../models/User');
  const users = await User.find({}, '_id');
  
  // Create notifications for all users
  const notifications = [];
  const io = getSocket();
  
  for (const user of users) {
    const notification = await Notification.create({
      userId: user._id,
      title,
      message,
      type,
      link
    });
    
    notifications.push(notification);
    
    // Emit socket event
    if (io) {
      io.to(`user_${user._id}`).emit('notification:new', notification);
    }
  }
  
  res.status(201).json({
    success: true,
    count: notifications.length,
    data: notifications
  });
});

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
exports.markAsRead = asyncHandler(async (req, res, next) => {
  let notification = await Notification.findById(req.params.id);
  
  if (!notification) {
    return next(
      new ErrorResponse(`Notification not found with id of ${req.params.id}`, 404)
    );
  }
  
  // Make sure user owns the notification
  if (notification.userId.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(`User ${req.user.id} is not authorized to update this notification`, 403)
    );
  }
  
  // Update notification
  notification = await Notification.findByIdAndUpdate(
    req.params.id,
    { read: true },
    {
      new: true,
      runValidators: true
    }
  );
  
  res.status(200).json({
    success: true,
    data: notification
  });
});

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
exports.markAllAsRead = asyncHandler(async (req, res, next) => {
  const result = await Notification.updateMany(
    { userId: req.user.id, read: false },
    { read: true }
  );
  
  res.status(200).json({
    success: true,
    data: {
      modifiedCount: result.modifiedCount
    }
  });
});

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private
exports.deleteNotification = asyncHandler(async (req, res, next) => {
  const notification = await Notification.findById(req.params.id);
  
  if (!notification) {
    return next(
      new ErrorResponse(`Notification not found with id of ${req.params.id}`, 404)
    );
  }
  
  // Make sure user owns the notification
  if (notification.userId.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(`User ${req.user.id} is not authorized to delete this notification`, 403)
    );
  }
  
  await notification.remove();
  
  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Delete all notifications for current user
// @route   DELETE /api/notifications
// @access  Private
exports.deleteAllNotifications = asyncHandler(async (req, res, next) => {
  await Notification.deleteMany({ userId: req.user.id });
  
  res.status(200).json({
    success: true,
    data: {}
  });
});