const mongoose = require('mongoose');

/**
 * WeeklyMenu Schema for MealWise Family application
 * Defines the weekly menu with selected meals for each day
 */
const WeeklyMenuSchema = new mongoose.Schema({
  weekNumber: {
    type: Number,
    required: [true, 'Please add a week number']
  },
  year: {
    type: Number,
    required: [true, 'Please add a year']
  },
  weekId: {
    type: String,
    unique: true
  },
  days: [
    {
      meals: [
        {
          type: mongoose.Schema.ObjectId,
          ref: 'Meal'
        }
      ]
    }
  ],
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Created by user is required']
  },
  updatedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Generate weekId from weekNumber and year
WeeklyMenuSchema.pre('save', function(next) {
  if (!this.weekId) {
    this.weekId = `${this.year}-${this.weekNumber.toString().padStart(2, '0')}`;
  }
  next();
});

// Middleware to validate meals
WeeklyMenuSchema.pre('save', function(next) {
  // We no longer require exactly 7 meals
  // This allows for more flexible menu creation
  next();
});

// Static method to get current week's menu
WeeklyMenuSchema.statics.getCurrentMenu = async function() {
  const { getCurrentWeekId, getWeekNumber, getYear } = require('../utils/weekUtils');
  const currentWeekId = getCurrentWeekId();
  const currentWeekNumber = getWeekNumber(new Date());
  const currentYear = getYear(new Date());
  
  return this.findOne({ 
    $or: [
      { weekId: currentWeekId },
      { weekNumber: currentWeekNumber, year: currentYear }
    ]
  })
    .populate({
      path: 'days.meals',
      select: 'name description imageUrl tags'
    })
    .populate({
      path: 'createdBy',
      select: 'name'
    })
    .populate({
      path: 'updatedBy',
      select: 'name'
    });
};

// Static method to copy menu from one week to another
WeeklyMenuSchema.statics.copyMenu = async function(sourceWeekId, targetWeekId, userId) {
  const sourceMenu = await this.findOne({ weekId: sourceWeekId });
  
  if (!sourceMenu) {
    throw new Error(`Source menu for week ${sourceWeekId} not found`);
  }
  
  const targetMenu = await this.findOne({ weekId: targetWeekId });
  
  if (targetMenu) {
    throw new Error(`Target menu for week ${targetWeekId} already exists`);
  }
  
  // Parse the target week ID to get year and week number
  const [targetYear, targetWeek] = targetWeekId.split('-').map(Number);
  
  const newMenu = new this({
    weekId: targetWeekId,
    weekNumber: targetWeek,
    year: targetYear,
    days: sourceMenu.days,
    createdBy: userId || sourceMenu.createdBy,
    updatedBy: userId || sourceMenu.createdBy // Set updatedBy to the same as createdBy initially
  });
  
  return newMenu.save();
};

module.exports = mongoose.model('WeeklyMenu', WeeklyMenuSchema);