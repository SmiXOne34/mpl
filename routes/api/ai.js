const express = require('express');
const router = express.Router();
const { protect } = require('../../middleware/auth');
const admin = require('../../middleware/admin');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { generateMealFromIngredients, analyzeImage } = require('../../utils/geminiApi');

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../../uploads');
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'image-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: function (req, file, cb) {
    // Accept only image files
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  }
});

// @route   POST api/ai/analyze-image
// @desc    Analyze image to detect ingredients
// @access  Private (Admin only)
router.post('/analyze-image', protect, admin, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ msg: 'No image file provided' });
    }

    // Get the uploaded file path
    const imagePath = req.file.path;

    // Call the Gemini API to analyze the image
    const ingredients = await analyzeImage(imagePath);

    // Return the detected ingredients
    res.json({ ingredients });

  } catch (err) {
    console.error('Error analyzing image:', err);
    res.status(500).json({ msg: 'Server error during image analysis' });
  }
});

// @route   POST api/ai/generate-recipes
// @desc    Generate recipes based on ingredients
// @access  Private (Admin only)
router.post('/generate-recipes', protect, admin, async (req, res) => {
  try {
    const { ingredients } = req.body;

    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      return res.status(400).json({ msg: 'No ingredients provided' });
    }

    // Call the Gemini API to generate recipes
    const recipe = await generateMealFromIngredients(ingredients);

    // Return the generated recipe
    res.json({ recipe });

  } catch (err) {
    console.error('Error generating recipes:', err);
    res.status(500).json({ msg: 'Server error during recipe generation' });
  }
});

module.exports = router;