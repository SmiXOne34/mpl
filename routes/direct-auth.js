const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

/**
 * Direct authentication routes for emergency access
 * These routes bypass the regular authentication flow for troubleshooting
 */

// Direct login endpoint - simplified for troubleshooting
router.post('/login', async (req, res) => {
  try {
    console.log('Direct login attempt:', { email: req.body.email });
    
    const { email, password } = req.body;
    
    // Basic validation
    if (!email || !password) {
      console.log('Direct login failed: Missing email or password');
      return res.status(400).json({
        success: false,
        error: 'Please provide an email and password'
      });
    }
    
    // Find user by email
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      console.log('Direct login failed: User not found');
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }
    
    // Check password
    const isMatch = await user.matchPassword(password);
    
    if (!isMatch) {
      console.log('Direct login failed: Password does not match');
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }
    
    // Create token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || 'mealwise_secret_key',
      { expiresIn: process.env.JWT_EXPIRE || '30d' }
    );
    
    // Set cookie
    const cookieOptions = {
      expires: new Date(Date.now() + (process.env.JWT_COOKIE_EXPIRE || 30) * 24 * 60 * 60 * 1000),
      httpOnly: true,
      sameSite: 'lax'
    };
    
    // Only set secure=true if not explicitly disabled
    if (process.env.NODE_ENV === 'production' && process.env.COOKIE_SECURE !== 'false') {
      cookieOptions.secure = true;
    }
    
    console.log('Direct login successful for user:', user._id);
    console.log('Cookie options:', cookieOptions);
    
    // Send response
    res
      .status(200)
      .cookie('token', token, cookieOptions)
      .json({
        success: true,
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
  } catch (error) {
    console.error('Unexpected error in direct login:', error);
    res.status(500).json({
      success: false,
      error: 'Server error during login'
    });
  }
});

// Emergency token generation - for admin use only
router.post('/emergency-token', async (req, res) => {
  try {
    const { email, adminKey } = req.body;
    
    // Verify admin key (this should be a secure, hard-to-guess value)
    const expectedAdminKey = process.env.ADMIN_EMERGENCY_KEY || 'mealwise_emergency_key_2024';
    
    if (adminKey !== expectedAdminKey) {
      return res.status(401).json({
        success: false,
        error: 'Invalid admin key'
      });
    }
    
    // Find user by email
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    // Create token with extended expiration
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || 'mealwise_secret_key',
      { expiresIn: '7d' } // 7 days for emergency access
    );
    
    console.log('Emergency token generated for user:', user._id);
    
    // Send response
    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      message: 'Emergency token generated. Valid for 7 days.'
    });
  } catch (error) {
    console.error('Error generating emergency token:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Direct auth service is operational',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;