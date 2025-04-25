const mongoose = require('mongoose');
const { isVotingOpen } = require('./utils/timeRestriction');

/**
 * Selection Schema for MealWise Family application
 * Represents a meal selection made by a family member
 */
const SelectionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  mealId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Meal',
    required: true
  },
  weekId: {
    type: String,
    required: true
  },
  day: {
    type: Number,
    required: true,
    min: 0,
    max: 6
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index to ensure a user can only select a meal once per day
SelectionSchema.index({ userId: 1, weekId: 1, day: 1, mealId: 1 }, { unique: true });

// Add additional indexes for faster queries
SelectionSchema.index({ weekId: 1, day: 1 });
SelectionSchema.index({ userId: 1 });
SelectionSchema.index({ mealId: 1 });

// Middleware to check if voting is open before saving
SelectionSchema.pre('save', function(next) {
  // Skip validation for admin users (handled in controller)
  
  // Check if voting is open
  if (!isVotingOpen() && this.isNew) {
    const error = new Error('Voting is currently closed. Voting will reopen at 4:00 PM.');
    error.name = 'VotingClosedError';
    return next(error);
  }
  
  next();
});

// Middleware to check selection limit (2 per day)
SelectionSchema.pre('save', async function(next) {
  if (!this.isNew) {
    return next();
  }
  
  try {
    // Count existing selections for this user on this day
    const count = await this.constructor.countDocuments({
      userId: this.userId,
      weekId: this.weekId,
      day: this.day
    });
    
    // If user already has 2 selections, prevent saving
    if (count >= 2) {
      const error = new Error('You can only select 2 meals per day.');
      error.name = 'SelectionLimitError';
      return next(error);
    }
    
    next();
  } catch (error) {
    next(error);
  }
});

// Static method to get the most popular meal for a specific day
SelectionSchema.statics.getPopularMeal = async function(weekId, day) {
  const popularMeal = await this.aggregate([
    {
      $match: { weekId, day }
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
        as: 'mealDetails'
      }
    },
    {
      $unwind: '$mealDetails'
    },
    {
      $project: {
        _id: 1,
        count: 1,
        name: '$mealDetails.name',
        description: '$mealDetails.description',
        imageUrl: '$mealDetails.imageUrl'
      }
    }
  ]);
  
  return popularMeal[0] || null;
};

// Static method to get all selections for a user in the current week
SelectionSchema.statics.getUserSelections = async function(userId, weekId) {
  return await this.find({ userId, weekId })
    .populate('mealId', 'name description imageUrl')
    .sort({ day: 1 });
};

// Static method to get all family selections for a specific day
SelectionSchema.statics.getFamilySelections = async function(weekId, day) {
  return await this.find({ weekId, day })
    .populate('userId', 'name')
    .populate('mealId', 'name description imageUrl');
};

// Create model from schema
const Selection = mongoose.model('Selection', SelectionSchema);

module.exports = Selection;