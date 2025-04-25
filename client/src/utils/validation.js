/**
 * Validation utilities for MealWise Family application
 */

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} - True if email is valid
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {Object} - Validation result with isValid and message
 */
export const validatePassword = (password) => {
  if (!password) {
    return {
      isValid: false,
      message: 'Password is required'
    };
  }
  
  if (password.length < 6) {
    return {
      isValid: false,
      message: 'Password must be at least 6 characters'
    };
  }
  
  // Check for stronger password (optional)
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  const strength = [hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChars].filter(Boolean).length;
  
  if (strength < 3) {
    return {
      isValid: true,
      isStrong: false,
      message: 'Consider using a stronger password with uppercase, lowercase, numbers, and special characters'
    };
  }
  
  return {
    isValid: true,
    isStrong: true,
    message: 'Password is strong'
  };
};

/**
 * Validate form fields
 * @param {Object} fields - Form fields to validate
 * @param {Object} rules - Validation rules
 * @returns {Object} - Validation errors
 */
export const validateForm = (fields, rules) => {
  const errors = {};
  
  Object.keys(rules).forEach(field => {
    const value = fields[field];
    const fieldRules = rules[field];
    
    // Required validation
    if (fieldRules.required && (!value || value.trim() === '')) {
      errors[field] = `${fieldRules.label || field} is required`;
      return;
    }
    
    // Email validation
    if (fieldRules.email && value && !isValidEmail(value)) {
      errors[field] = `${fieldRules.label || field} must be a valid email address`;
      return;
    }
    
    // Min length validation
    if (fieldRules.minLength && value && value.length < fieldRules.minLength) {
      errors[field] = `${fieldRules.label || field} must be at least ${fieldRules.minLength} characters`;
      return;
    }
    
    // Max length validation
    if (fieldRules.maxLength && value && value.length > fieldRules.maxLength) {
      errors[field] = `${fieldRules.label || field} must be no more than ${fieldRules.maxLength} characters`;
      return;
    }
    
    // Match validation
    if (fieldRules.match && value !== fields[fieldRules.match]) {
      errors[field] = `${fieldRules.label || field} must match ${fieldRules.matchLabel || fieldRules.match}`;
      return;
    }
    
    // Custom validation
    if (fieldRules.validate && typeof fieldRules.validate === 'function') {
      const customError = fieldRules.validate(value, fields);
      if (customError) {
        errors[field] = customError;
        return;
      }
    }
  });
  
  return errors;
};

/**
 * Check if form has errors
 * @param {Object} errors - Validation errors
 * @returns {boolean} - True if form has errors
 */
export const hasErrors = (errors) => {
  return Object.keys(errors).length > 0;
};

/**
 * Validate meal form
 * @param {Object} mealData - Meal data to validate
 * @returns {Object} - Validation errors
 */
export const validateMealForm = (mealData) => {
  const errors = {};
  
  if (!mealData.name || mealData.name.trim() === '') {
    errors.name = 'Meal name is required';
  }
  
  if (!mealData.description || mealData.description.trim() === '') {
    errors.description = 'Description is required';
  }
  
  if (!mealData.tags || mealData.tags.length === 0) {
    errors.tags = 'At least one tag is required';
  }
  
  return errors;
};

/**
 * Validate menu form
 * @param {Object} menuData - Menu data to validate
 * @returns {Object} - Validation errors
 */
export const validateMenuForm = (menuData) => {
  const errors = {};
  
  if (!menuData.weekNumber) {
    errors.weekNumber = 'Week number is required';
  }
  
  if (!menuData.year) {
    errors.year = 'Year is required';
  }
  
  // Check if at least one day has meals
  const hasMeals = menuData.days.some(day => day.meals && day.meals.length > 0);
  
  if (!hasMeals) {
    errors.days = 'At least one day must have meals';
  }
  
  return errors;
};