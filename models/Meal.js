const mongoose = require('mongoose');

/**
 * Ingredient Schema
 * Defines ingredients for meals
 */
const IngredientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add ingredient name'],
    trim: true
  },
  quantity: {
    type: String,
    required: [true, 'Please add ingredient quantity'],
    trim: true
  },
  unit: {
    type: String,
    trim: true
  }
});

/**
 * Meal Schema for MealWise Family application
 * Defines meals with ingredients and preparation steps
 */
const MealSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a meal name'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  imageUrl: {
    type: String
    // Removed the regex validation to allow any URL format
  },
  ingredients: {
    type: [IngredientSchema],
    default: []
  },
  preparationSteps: {
    type: [String],
    default: []
  },
  tags: {
    type: [String],
    default: []
  },
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
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
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Create index for meal search
MealSchema.index({ name: 'text', description: 'text', tags: 'text' });

// Virtual for popularity (calculated from selections)
MealSchema.virtual('popularity', {
  ref: 'Selection',
  localField: '_id',
  foreignField: 'mealId',
  count: true
});

module.exports = mongoose.model('Meal', MealSchema);