const mongoose = require('mongoose');

/**
 * Meal Schema for MealWise Family application
 * Represents individual meal options that can be selected by family members
 */
const MealSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a meal name'],
    trim: true,
    maxlength: [100, 'Meal name cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please provide a meal description'],
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  ingredients: [{
    name: {
      type: String,
      required: [true, 'Please provide ingredient name'],
      trim: true
    },
    quantity: {
      type: String,
      required: [true, 'Please provide ingredient quantity'],
      trim: true
    },
    unit: {
      type: String,
      trim: true
    }
  }],
  preparationSteps: [{
    type: String,
    required: [true, 'Please provide preparation steps']
  }],
  imageUrl: {
    type: String,
    match: [
      /^(http|https):\/\/[^ "]+$/,
      'Please provide a valid URL for the image'
    ]
  },
  tags: [{
    type: String,
    trim: true
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Add index for faster queries
MealSchema.index({ name: 1 });
MealSchema.index({ tags: 1 });

// Virtual for meal's selections
MealSchema.virtual('selections', {
  ref: 'Selection',
  localField: '_id',
  foreignField: 'mealId',
  justOne: false
});

// Static method to get popular meals for a specific day
MealSchema.statics.getPopularMeals = async function(weekId, day) {
  const popularMeals = await this.model('Selection').aggregate([
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
  
  return popularMeals;
};

// Create model from schema
const Meal = mongoose.model('Meal', MealSchema);

module.exports = Meal;