const crypto = require('crypto');
const User = require('../models/User');
const Settings = require('../models/Settings');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const sendEmail = require('../utils/sendEmail');

/**
 * Authentication Controller for MealWise Family application
 * Handles user authentication, registration, and password management
 */

/**
 * @desc    Register user
 * @route   POST /api/auth/register
 * @access  Public
 */
exports.register = asyncHandler(async (req, res, next) => {
  try {
    const { name, email, password, role, preferences } = req.body;

    // Check if registration is allowed
    const settings = await Settings.findOne();
    
    // If settings exist and registration is disabled
    if (settings && settings.allowRegistration === false) {
      return next(new ErrorResponse('Registration is currently disabled. Please contact an administrator.', 403));
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'chooser', // Default role is chooser
      preferences: preferences || []
    });

    sendTokenResponse(user, 200, res);
  } catch (error) {
    console.error('Error in register:', error);
    
    // Check for duplicate email error
    if (error.code === 11000) {
      return next(new ErrorResponse('Email already in use', 400));
    }
    
    return next(new ErrorResponse('Error registering user', 500));
  }
});

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
exports.login = asyncHandler(async (req, res, next) => {
  try {
    console.log('Login attempt:', { email: req.body.email });
    
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      console.log('Login failed: Missing email or password');
      return next(new ErrorResponse('Please provide an email and password', 400));
    }

    // First check if the user exists without fetching the password
    const userExists = await User.findOne({ email });
    
    if (!userExists) {
      console.log('Login failed: User not found in database');
      return next(new ErrorResponse('User not found. Please check your email or register a new account.', 404));
    }
    
    // Now fetch the user with password for authentication
    const user = await User.findOne({ email }).select('+password');

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      console.log('Login failed: Password does not match');
      return next(new ErrorResponse('Invalid password. Please try again.', 401));
    }

    console.log('Login successful for user:', user._id);
    sendTokenResponse(user, 200, res);
  } catch (error) {
    console.error('Unexpected error in login:', error);
    return next(new ErrorResponse('Server error during login', 500));
  }
});

/**
 * @desc    Log user out / clear cookie
 * @route   GET /api/auth/logout
 * @access  Private
 */
exports.logout = asyncHandler(async (req, res, next) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.status(200).json({
    success: true,
    data: {}
  });
});

/**
 * @desc    Get current logged in user
 * @route   GET /api/auth/me
 * @access  Private
 */
exports.getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    data: user
  });
});

/**
 * @desc    Update user details
 * @route   PUT /api/auth/updatedetails
 * @access  Private
 */
exports.updateDetails = asyncHandler(async (req, res, next) => {
  const fieldsToUpdate = {
    name: req.body.name,
    email: req.body.email,
    preferences: req.body.preferences || [],
    imageUrl: req.body.imageUrl || ''
  };

  const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: user
  });
});

/**
 * @desc    Update password
 * @route   PUT /api/auth/updatepassword
 * @access  Private
 */
exports.updatePassword = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password');

  // Check current password
  if (!(await user.matchPassword(req.body.currentPassword))) {
    return next(new ErrorResponse('Password is incorrect', 401));
  }

  user.password = req.body.newPassword;
  await user.save();

  sendTokenResponse(user, 200, res);
});

/**
 * @desc    Upload profile image
 * @route   PUT /api/auth/uploadimage
 * @access  Private
 */
exports.uploadProfileImage = asyncHandler(async (req, res, next) => {
  try {
    console.log('Profile image upload request received');
    
    // Check if image URL is provided
    if (!req.body.imageUrl) {
      console.log('No image URL provided');
      return next(new ErrorResponse('Please provide an image URL', 400));
    }
    
    // Log the length of the image data for debugging
    console.log('Image data length:', req.body.imageUrl.length);
    
    // Validate that the image URL is a base64 data URL
    const isBase64DataUrl = req.body.imageUrl.startsWith('data:image/');
    const isBlobUrl = req.body.imageUrl.startsWith('blob:');
    
    if (!isBase64DataUrl && !isBlobUrl) {
      console.log('Invalid image format');
      return next(new ErrorResponse('Invalid image format. Please provide a valid image.', 400));
    }
    
    // Check if the image data is too large (limit to 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (req.body.imageUrl.length > maxSize) {
      console.log('Image too large:', req.body.imageUrl.length, 'bytes');
      return next(new ErrorResponse('Image is too large. Please upload an image smaller than 5MB.', 400));
    }
    
    console.log('Updating user profile with image');
    
    // Update the user's imageUrl field
    const user = await User.findByIdAndUpdate(
      req.user.id, 
      { imageUrl: req.body.imageUrl },
      { new: true, runValidators: true }
    );
    
    if (!user) {
      console.log('User not found');
      return next(new ErrorResponse('User not found', 404));
    }
    
    console.log('Profile image updated successfully');
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error in uploadProfileImage:', error);
    return next(new ErrorResponse('Server error while uploading profile image', 500));
  }
});

/**
 * @desc    Forgot password
 * @route   POST /api/auth/forgotpassword
 * @access  Public
 */
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new ErrorResponse('There is no user with that email', 404));
  }

  // Get reset token
  const resetToken = user.getResetPasswordToken();

  await user.save({ validateBeforeSave: false });

  // Create reset url
  const resetUrl = `${req.protocol}://${req.get(
    'host'
  )}/api/auth/resetpassword/${resetToken}`;

  const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Password reset token',
      message
    });

    res.status(200).json({ success: true, data: 'Email sent' });
  } catch (err) {
    console.log(err);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });

    return next(new ErrorResponse('Email could not be sent', 500));
  }
});

/**
 * @desc    Reset password
 * @route   PUT /api/auth/resetpassword/:resettoken
 * @access  Public
 */
exports.resetPassword = asyncHandler(async (req, res, next) => {
  // Get hashed token
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.resettoken)
    .digest('hex');

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() }
  });

  if (!user) {
    return next(new ErrorResponse('Invalid token', 400));
  }

  // Set new password
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  sendTokenResponse(user, 200, res);
});

/**
 * Get token from model, create cookie and send response
 */
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = user.getSignedJwtToken();

  // Calculate cookie expiration
  const cookieExpire = process.env.JWT_COOKIE_EXPIRE || 30; // Default to 30 days if not set
  const expiresDate = new Date(Date.now() + cookieExpire * 24 * 60 * 60 * 1000);
  
  console.log('Setting cookie to expire at:', expiresDate);

  const options = {
    expires: expiresDate,
    httpOnly: true,
    sameSite: 'lax' // Allow cookies to be sent in cross-site requests
  };

  // In production, set secure flag if not running on HTTP
  if (process.env.NODE_ENV === 'production') {
    // Only set secure=true if not explicitly disabled
    if (process.env.COOKIE_SECURE !== 'false') {
      options.secure = true;
    }
  }

  // Log the token and cookie options for debugging
  console.log('Token generated successfully');
  console.log('Cookie options:', JSON.stringify(options));

  // Set the cookie and send the response
  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
};