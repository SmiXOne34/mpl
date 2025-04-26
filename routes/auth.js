const express = require('express');
const {
  register,
  login,
  logout,
  getMe,
  forgotPassword,
  resetPassword,
  updateDetails,
  updatePassword,
  uploadProfileImage
} = require('../controllers/authController');

const router = express.Router();

// Import middleware
const { protect } = require('../middleware/auth');

// Routes
router.post('/register', register);
router.post('/login', login);
router.get('/logout', logout);
router.get('/me', protect, getMe);
router.put('/updatedetails', protect, updateDetails);
router.put('/updatepassword', protect, updatePassword);
router.put('/uploadimage', protect, uploadProfileImage);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);

// Test login route for debugging
router.post('/test-login', (req, res) => {
  const { email, password } = req.body;
  
  console.log('Test login attempt:', { email });
  
  // Send a simple success response
  res.status(200).json({
    success: true,
    message: 'Test login route working',
    receivedCredentials: { email, passwordProvided: !!password },
    token: 'test-token-for-debugging'
  });
});

module.exports = router;