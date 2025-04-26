const express = require('express');
const mongoose = require('mongoose');
const User = require('../models/User');
const router = express.Router();

/**
 * Diagnostic routes for troubleshooting database and authentication issues
 */

// Get database status
router.get('/db-status', async (req, res) => {
  try {
    // Check MongoDB connection
    const dbState = mongoose.connection.readyState;
    const dbStateText = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };
    
    // Get database stats
    let dbStats = null;
    if (dbState === 1) {
      try {
        dbStats = await mongoose.connection.db.stats();
      } catch (error) {
        console.error('Error getting DB stats:', error);
      }
    }
    
    // Count users
    let userCount = 0;
    try {
      userCount = await User.countDocuments();
    } catch (error) {
      console.error('Error counting users:', error);
    }
    
    // Get a sample user (without password)
    let sampleUser = null;
    try {
      sampleUser = await User.findOne().select('-password').lean();
      
      // If we found a user, add a note that this is just a sample
      if (sampleUser) {
        sampleUser._note = 'This is a sample user for diagnostic purposes only';
      }
    } catch (error) {
      console.error('Error getting sample user:', error);
    }
    
    res.status(200).json({
      success: true,
      database: {
        state: dbState,
        stateText: dbStateText[dbState],
        connectionString: process.env.MONGO_URI ? 'Set (value hidden)' : 'Not set',
        stats: dbStats
      },
      users: {
        count: userCount,
        sampleUser: sampleUser
      },
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        JWT_SECRET: process.env.JWT_SECRET ? 'Set (value hidden)' : 'Not set',
        JWT_EXPIRE: process.env.JWT_EXPIRE,
        JWT_COOKIE_EXPIRE: process.env.JWT_COOKIE_EXPIRE,
        COOKIE_SECURE: process.env.COOKIE_SECURE
      }
    });
  } catch (error) {
    console.error('Error in db-status endpoint:', error);
    res.status(500).json({
      success: false,
      error: 'Server error',
      message: error.message
    });
  }
});

// Test user creation
router.post('/create-test-user', async (req, res) => {
  try {
    // Check if test user already exists
    const existingUser = await User.findOne({ email: 'test@example.com' });
    
    if (existingUser) {
      return res.status(200).json({
        success: true,
        message: 'Test user already exists',
        user: {
          id: existingUser._id,
          name: existingUser.name,
          email: existingUser.email,
          role: existingUser.role
        }
      });
    }
    
    // Create a test user
    const user = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      role: 'admin'
    });
    
    res.status(201).json({
      success: true,
      message: 'Test user created successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error creating test user:', error);
    res.status(500).json({
      success: false,
      error: 'Server error',
      message: error.message
    });
  }
});

// List all users (admin only)
router.get('/users', async (req, res) => {
  try {
    // Get all users (without passwords)
    const users = await User.find().select('-password').lean();
    
    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    console.error('Error listing users:', error);
    res.status(500).json({
      success: false,
      error: 'Server error',
      message: error.message
    });
  }
});

module.exports = router;