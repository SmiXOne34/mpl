const express = require('express');
const {
  getMeals,
  getMeal,
  createMeal,
  updateMeal,
  deleteMeal,
  getPopularMeals,
  searchMeals,
  generateMeal
} = require('../controllers/mealController');

const router = express.Router();

// Import middleware
const { protect, authorize } = require('../middleware/auth');
const advancedResults = require('../middleware/advancedResults');

// Import model
const Meal = require('../models/Meal');

// Apply protection to all routes
router.use(protect);

// Public routes (protected but not role-restricted)
router.get('/popular', getPopularMeals);
router.get('/search', searchMeals);

// Admin-only routes
router.post('/generate', authorize('admin'), generateMeal);

// Routes
router
  .route('/')
  .get(advancedResults(Meal), getMeals)
  .post(authorize('admin'), createMeal);

router
  .route('/:id')
  .get(getMeal)
  .put(authorize('admin'), updateMeal)
  .delete(authorize('admin'), deleteMeal);

module.exports = router;