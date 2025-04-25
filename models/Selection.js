const mongoose = require('mongoose');
const { isVotingOpen } = require('../utils/timeRestriction');

/**
 * Selection Schema for MealWise Family application
 * Defines meal selections made by family members
 */
const SelectionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  mealId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Meal',
    required: true
  },
  weekId: {
    type: String,
    required: [true, 'Please add a week identifier (YYYY-WW format)'],
    match: [
      /^\d{4}-\d{2}$/,
      'Week ID must be in YYYY-WW format (e.g., 2023-01)'
    ]
  },
  day: {
    type: Number,
    required: [true, 'Please specify the day (0-6, Sunday to Saturday)'],
    min: [0, 'Day must be between 0 and 6'],
    max: [6, 'Day must be between 0 and 6']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Create compound index to prevent duplicate selections
SelectionSchema.index({ userId: 1, mealId: 1, weekId: 1, day: 1 }, { unique: true });

// Create index for querying by day
SelectionSchema.index({ day: 1 });

// Create index for querying by weekId
SelectionSchema.index({ weekId: 1 });

// Middleware to check if voting is open
SelectionSchema.pre('save', function(next) {
  // Skip validation for admin users (they can add selections anytime)
  if (this._skipTimeRestriction) {
    return next();
  }
  
  // Check if voting is open for the current time
  if (!isVotingOpen()) {
    const error = new Error('Voting is currently closed');
    error.name = 'VotingClosedError';
    return next(error);
  }
  
  next();
});

// Middleware to check selection limit (max 2 per day per user)
SelectionSchema.pre('save', async function(next) {
  // Skip validation if explicitly requested
  if (this._skipLimitCheck) {
    return next();
  }
  
  // Check if user already has 2 selections for this day
  const count = await this.constructor.countDocuments({
    userId: this.userId,
    weekId: this.weekId,
    day: this.day
  });
  
  if (count >= 2) {
    const error = new Error('You can only select 2 meals per day');
    error.name = 'SelectionLimitError';
    return next(error);
  }
  
  next();
});

// Static method to get the most popular meal for a specific day
SelectionSchema.statics.getPopularMeal = async function(day, weekId) {
  const { getCurrentWeekId } = require('../utils/weekUtils');
  const currentWeekId = weekId || getCurrentWeekId();
  
  const result = await this.aggregate([
    {
      $match: {
        day,
        weekId: currentWeekId
      }
    },
    {
      $group: {
        _id: '$mealId',
        count: { $sum: 1 }
      }
    },
    {
      $sort: { count: -1 }
    },
    {
      $limit: 1
    },
    {
      $lookup: {
        from: 'meals',
        localField: '_id',
        foreignField: '_id',
        as: 'meal'
      }
    },
    {
      $unwind: '$meal'
    },
    {
      $project: {
        _id: '$meal._id',
        name: '$meal.name',
        description: '$meal.description',
        imageUrl: '$meal.imageUrl',
        tags: '$meal.tags',
        count: 1
      }
    }
  ]);
  
  return result.length > 0 ? result[0] : null;
};

// Static method to get all selections for a family on a specific day
SelectionSchema.statics.getFamilySelections = async function(day, weekId) {
  const { getCurrentWeekId } = require('../utils/weekUtils');
  const currentWeekId = weekId || getCurrentWeekId();
  
  return this.find({
    day,
    weekId: currentWeekId
  })
  .populate({
    path: 'userId',
    select: 'name imageUrl'
  })
  .populate({
    path: 'mealId',
    select: 'name description imageUrl tags'
  })
  .sort({ createdAt: 1 });
};

module.exports = mongoose.model('Selection', SelectionSchema);