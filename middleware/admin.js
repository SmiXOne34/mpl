const User = require('../models/User');

/**
 * Middleware to check if user is an admin
 */
module.exports = async function(req, res, next) {
  try {
    // Get user from database
    const user = await User.findById(req.user.id).select('-password');
    
    // Check if user exists
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    // Check if user is an admin
    if (user.role !== 'admin') {
      return res.status(403).json({ msg: 'Access denied. Admin privileges required.' });
    }
    
    // User is an admin, proceed
    next();
  } catch (err) {
    console.error('Error in admin middleware:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};