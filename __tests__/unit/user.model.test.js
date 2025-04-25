const mongoose = require('mongoose');
const User = require('../../models/User');
const bcrypt = require('bcryptjs');

// Load the test setup
require('../setup');

describe('User Model', () => {
  it('should create a new user with encrypted password', async () => {
    // Create test user data
    const userData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      role: 'user'
    };

    // Create a new user
    const user = await User.create(userData);

    // Check that the user was created successfully
    expect(user).toBeDefined();
    expect(user._id).toBeDefined();
    expect(user.name).toBe(userData.name);
    expect(user.email).toBe(userData.email);
    expect(user.role).toBe(userData.role);

    // Check that the password was encrypted
    expect(user.password).not.toBe(userData.password);
    const isMatch = await bcrypt.compare(userData.password, user.password);
    expect(isMatch).toBe(true);
  });

  it('should not create a user with duplicate email', async () => {
    // Create first user
    await User.create({
      name: 'First User',
      email: 'duplicate@example.com',
      password: 'password123',
      role: 'user'
    });

    // Try to create second user with same email
    try {
      await User.create({
        name: 'Second User',
        email: 'duplicate@example.com',
        password: 'password456',
        role: 'user'
      });
      // If we reach this point, the test should fail
      expect(true).toBe(false);
    } catch (error) {
      expect(error).toBeDefined();
      expect(error.code).toBe(11000); // MongoDB duplicate key error code
    }
  });

  it('should require name, email, and password fields', async () => {
    try {
      await User.create({});
      // If we reach this point, the test should fail
      expect(true).toBe(false);
    } catch (error) {
      expect(error).toBeDefined();
      expect(error.errors.name).toBeDefined();
      expect(error.errors.email).toBeDefined();
      expect(error.errors.password).toBeDefined();
    }
  });

  it('should validate email format', async () => {
    try {
      await User.create({
        name: 'Invalid Email User',
        email: 'not-an-email',
        password: 'password123',
        role: 'user'
      });
      // If we reach this point, the test should fail
      expect(true).toBe(false);
    } catch (error) {
      expect(error).toBeDefined();
      expect(error.errors.email).toBeDefined();
    }
  });

  it('should generate a reset password token', async () => {
    // Create a user
    const user = await User.create({
      name: 'Reset Token User',
      email: 'reset@example.com',
      password: 'password123',
      role: 'user'
    });

    // Generate reset token
    const resetToken = user.getResetPasswordToken();

    // Check that the token was generated
    expect(resetToken).toBeDefined();
    expect(user.resetPasswordToken).toBeDefined();
    expect(user.resetPasswordExpire).toBeDefined();

    // Check that the token expiration is in the future
    const now = new Date();
    expect(user.resetPasswordExpire).toBeInstanceOf(Date);
    expect(user.resetPasswordExpire > now).toBe(true);
  });
});