const mongoose = require('mongoose');

/**
 * WeeklyMenu Schema for MealWise Family application
 * Represents the weekly menu of meals set by the admin
 */
const WeeklyMenuSchema = new mongoose.Schema({
  weekId: {
    type: String,
    required: [true, 'Please provide a week identifier'],
    unique: true,
    // Format: YYYY-WW (e.g., 2023-01 for the first week of 2023)
    match: [
      /^\d{4}-([0-4][0-9]|5[0-3])$/,
      'Week ID must be in format YYYY-WW (e.g., 2023-01)'
    ]
  },
  meals: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Meal',
    required: [true, 'Please provide meal IDs']
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Validate that exactly 7 meals are provided
WeeklyMenuSchema.path('meals').validate(function(meals) {
  return meals.length === 7;
}, 'Weekly menu must contain exactly 7 meals');

// Static method to get the current week's menu
WeeklyMenuSchema.statics.getCurrentMenu = async function() {
  const currentWeekId = getCurrentWeekId();
  
  const menu = await this.findOne({ weekId: currentWeekId })
    .populate('meals', 'name description ingredients preparationSteps imageUrl tags')
    .populate('createdBy', 'name');
  
  return menu;
};

// Static method to check if a meal is in the current week's menu
WeeklyMenuSchema.statics.isMealInCurrentMenu = async function(mealId) {
  const currentWeekId = getCurrentWeekId();
  
  const menu = await this.findOne({ 
    weekId: currentWeekId,
    meals: mealId 
  });
  
  return !!menu;
};

// Helper function to get current week ID in format YYYY-WW
function getCurrentWeekId() {
  const now = new Date();
  const year = now.getFullYear();
  
  // Get week number (1-53)
  const firstDayOfYear = new Date(year, 0, 1);
  const pastDaysOfYear = (now - firstDayOfYear) / 86400000;
  const weekNumber = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  
  // Format week number with leading zero if needed
  const formattedWeekNumber = weekNumber < 10 ? `0${weekNumber}` : weekNumber;
  
  return `${year}-${formattedWeekNumber}`;
}

// Add the helper function to the model's statics
WeeklyMenuSchema.statics.getCurrentWeekId = getCurrentWeekId;

// Create model from schema
const WeeklyMenu = mongoose.model('WeeklyMenu', WeeklyMenuSchema);

module.exports = WeeklyMenu;