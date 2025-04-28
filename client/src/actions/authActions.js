import {
  REGISTER_SUCCESS,
  REGISTER_FAIL,
  USER_LOADED,
  AUTH_ERROR,
  LOGIN_SUCCESS,
  LOGIN_FAIL,
  LOGOUT,
  CLEAR_ERRORS,
  UPDATE_PROFILE_SUCCESS,
  UPDATE_PROFILE_FAIL,
  UPDATE_PASSWORD_SUCCESS,
  UPDATE_PASSWORD_FAIL,
  UPLOAD_PROFILE_IMAGE_SUCCESS,
  UPLOAD_PROFILE_IMAGE_FAIL,
  AUTH_LOADING
} from './types';
import setAuthToken from '../utils/setAuthToken';
import api from '../utils/api';
import { initSocket, closeSocket } from '../utils/socket';

// Load User
export const loadUser = () => async dispatch => {
  try {
    console.log('loadUser action called');
    
    // Set token in headers
    if (localStorage.token && localStorage.token !== 'undefined') {
      console.log('Setting auth token from localStorage');
      setAuthToken(localStorage.token);
      
      // Initialize socket if not already connected
      const socket = require('../utils/socket').getSocket();
      if (!socket || !socket.connected) {
        console.log('Initializing socket connection in loadUser');
        initSocket(localStorage.token);
      }
    } else {
      console.log('No valid token found in localStorage');
      // If no token, dispatch AUTH_ERROR and return early
      dispatch({ type: AUTH_ERROR });
      return;
    }

    console.log('Making API request to /auth/me');
    const res = await api.get('/auth/me');
    console.log('User data response:', res.data);
    
    let userData = res.data.data;
    
    // Check if we have a saved profile image URL in localStorage
    const savedImageUrl = localStorage.getItem('profileImageUrl');
    
    // If we have a saved image URL in localStorage, use it
    // Otherwise, use the one from the server if available
    if (savedImageUrl) {
      userData = {
        ...userData,
        imageUrl: savedImageUrl
      };
      
      // If the server doesn't have the image URL, update it
      if (!userData.imageUrl || userData.imageUrl !== savedImageUrl) {
        try {
          await api.put('/auth/uploadimage', { imageUrl: savedImageUrl });
          console.log('Updated server with saved profile image URL');
        } catch (error) {
          console.error('Failed to update server with saved profile image:', error);
        }
      }
    } else if (userData.imageUrl) {
      // If the server has an image URL but localStorage doesn't, save it
      localStorage.setItem('profileImageUrl', userData.imageUrl);
    }
    
    // Store user data in localStorage for persistence
    localStorage.setItem('user', JSON.stringify(userData));

    dispatch({
      type: USER_LOADED,
      payload: userData
    });
  } catch (err) {
    console.error('Error loading user:', err);
    
    if (err.response) {
      console.error('Error response:', err.response.data);
    } else if (err.request) {
      console.error('No response received:', err.request);
    } else {
      console.error('Request setup error:', err.message);
    }
    
    dispatch({
      type: AUTH_ERROR
    });
  }
};

// Register User
export const register = formData => async dispatch => {
  try {
    console.log('Register action called with:', formData);
    
    const config = {
      headers: {
        'Content-Type': 'application/json'
      }
    };

    console.log('Making API request to /auth/register');
    const res = await api.post('/auth/register', formData);
    console.log('Registration API response:', res.data);

    dispatch({
      type: REGISTER_SUCCESS,
      payload: res.data
    });

    console.log('Dispatched REGISTER_SUCCESS, now loading user');
    // Load user after successful registration
    dispatch(loadUser());
  } catch (err) {
    console.error('Registration error:', err);
    console.error('Error response:', err.response?.data);
    
    dispatch({
      type: REGISTER_FAIL,
      payload: err.response?.data?.error || 'Registration failed'
    });
  }
};

// Login User
export const login = (email, password) => async dispatch => {
  console.log('Login action called with email:', email);
  
  // Dispatch a loading action to show a spinner
  dispatch({ type: AUTH_LOADING });
  
  // Log browser information for debugging
  console.log('Browser information:', {
    userAgent: navigator.userAgent,
    location: window.location.href,
    protocol: window.location.protocol,
    host: window.location.host
  });
  
  // Determine the API URL based on environment
  let apiUrl;
  if (process.env.NODE_ENV === 'production') {
    // In production, use a relative URL to avoid CORS issues
    apiUrl = '/api/auth/login';
  } else if (process.env.REACT_APP_API_URL) {
    // Use environment variable if available
    apiUrl = `${process.env.REACT_APP_API_URL}/auth/login`;
  } else {
    // Default development server
    apiUrl = 'http://localhost:9092/api/auth/login';
  }
  
  console.log(`Using API URL: ${apiUrl}`);
  
  try {
    // Use axios for the request
    console.log('Making login request with axios');
    
    const response = await api.post('/auth/login', { email, password });
    
    console.log('Login successful, response:', response.data);
    
    // Store token in localStorage
    if (response.data && response.data.token) {
      localStorage.setItem('token', response.data.token);
      console.log('Token stored in localStorage');
      
      // Set the token in axios defaults for future requests
      setAuthToken(response.data.token);
    }
    
    dispatch({
      type: LOGIN_SUCCESS,
      payload: response.data
    });
    
    // Initialize socket connection with the new token
    if (response.data && response.data.token) {
      console.log('Initializing socket connection after login');
      initSocket(response.data.token);
    }
    
    // Load user after successful login
    dispatch(loadUser());
    
  } catch (err) {
    console.error('Login failed with axios:', err);
    
    // Check if we have a specific error message from the server
    if (err.response && err.response.data) {
      // Log the full error response for debugging
      console.log('Server error response:', err.response.data);
      
      // Include the status code in the error message for all errors
      let errorMessage;
      
      // Handle 404 errors specifically for user not found
      if (err.response.status === 404 && 
          (err.response.data.error?.includes('User not found') || 
           err.response.data.message?.includes('User not found'))) {
        errorMessage = 'User not found. Please check your email or register a new account.';
      } else {
        // For other errors, use the provided error message or a default
        errorMessage = err.response.data.error || err.response.data.message || `Server error (${err.response.status})`;
      }
      
      // Dispatch the error with the server's message
      dispatch({
        type: LOGIN_FAIL,
        payload: errorMessage
      });
      return; // Exit early since we've handled the error
    } else if (err.request) {
      // The request was made but no response was received
      dispatch({
        type: LOGIN_FAIL,
        payload: 'Network Error: No response from server'
      });
      return;
    } else {
      // Something happened in setting up the request
      dispatch({
        type: LOGIN_FAIL,
        payload: `Request Error: ${err.message}`
      });
      return;
    }
    
    // Try with fetch as a fallback
    console.log('Attempting fetch as fallback');
    
    try {
      const fetchResponse = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include'
      });
      
      console.log('Fetch response status:', fetchResponse.status);
      
      // Even if we get a 401 or 404, try to parse the response
      const responseText = await fetchResponse.text();
      console.log('Server response text:', responseText);
      
      let data;
      try {
        data = JSON.parse(responseText);
        console.log('Parsed response data:', data);
      } catch (e) {
        console.error('Failed to parse response as JSON:', e);
      }
      
      if (!fetchResponse.ok) {
        // Handle 404 errors specifically for user not found
        if (fetchResponse.status === 404 && 
            ((data && data.error && data.error.includes('User not found')) || 
             (data && data.message && data.message.includes('User not found')))) {
          throw new Error('User not found. Please check your email or register a new account.');
        }
        // If we have a structured error message from the server, use it
        else if (data && (data.error || data.message)) {
          throw new Error(data.error || data.message);
        } else {
          throw new Error(`Server error (${fetchResponse.status})`);
        }
      }
      
      // If we got here, the fetch was successful
      console.log('Login successful with fetch, response:', data);
      
      // Store token in localStorage
      if (data && data.token) {
        localStorage.setItem('token', data.token);
        console.log('Token stored in localStorage');
        
        // Set the token in axios defaults for future requests
        setAuthToken(data.token);
      }
      
      dispatch({
        type: LOGIN_SUCCESS,
        payload: data
      });
      
      // Initialize socket connection with the new token
      if (data && data.token) {
        console.log('Initializing socket connection after login');
        initSocket(data.token);
      }
      
      // Load user after successful login
      dispatch(loadUser());
      
    } catch (fetchErr) {
      console.error('Login failed with fetch:', fetchErr);
      
      // Use the error message from the fetch error
      let errorMessage = fetchErr.message || 'Login failed. Please check your credentials and try again.';
      
      // Dispatch the error
      dispatch({
        type: LOGIN_FAIL,
        payload: errorMessage
      });
      
      // Log diagnostic information
      console.error('Login diagnostic information:', {
        environment: process.env.NODE_ENV,
        apiUrl: apiUrl,
        browserLocation: window.location.href,
        userAgent: navigator.userAgent
      });
    }
  }
};

// Logout
export const logout = () => async dispatch => {
  try {
    console.log('Logging out user');
    await api.get('/auth/logout');
    console.log('Logout successful');
  } catch (err) {
    console.error('Logout error:', err);
  }

  // Close socket connection on logout
  console.log('Closing socket connection on logout');
  closeSocket();
  
  // Save the profile image URL before logout
  const profileImageUrl = localStorage.getItem('profileImageUrl');
  
  // Dispatch logout action
  dispatch({ type: LOGOUT });
  
  // Restore the profile image URL after logout
  if (profileImageUrl) {
    localStorage.setItem('profileImageUrl', profileImageUrl);
  }
};

// Update Profile
export const updateProfile = formData => async dispatch => {
  try {
    console.log('Updating user profile with data:', formData);
    
    const res = await api.put('/auth/updatedetails', formData);
    console.log('Profile update response:', res.data);

    dispatch({
      type: UPDATE_PROFILE_SUCCESS,
      payload: res.data.data
    });
    
    return res.data;
  } catch (err) {
    console.error('Profile update error:', err);
    
    let errorMessage = 'Profile update failed';
    if (err.response) {
      errorMessage = err.response.data?.error || `Server error: ${err.response.status}`;
    }
    
    dispatch({
      type: UPDATE_PROFILE_FAIL,
      payload: errorMessage
    });
    
    throw err;
  }
};

// Update Password
export const updatePassword = (passwordData) => async dispatch => {
  try {
    console.log('Updating user password');
    
    const res = await api.put(
      '/auth/updatepassword',
      { 
        currentPassword: passwordData.currentPassword, 
        newPassword: passwordData.newPassword 
      }
    );
    
    console.log('Password update response:', res.data);

    dispatch({
      type: UPDATE_PASSWORD_SUCCESS,
      payload: res.data
    });
    
    return res.data;
  } catch (err) {
    console.error('Password update error:', err);
    
    let errorMessage = 'Password update failed';
    if (err.response) {
      errorMessage = err.response.data?.error || `Server error: ${err.response.status}`;
    }
    
    dispatch({
      type: UPDATE_PASSWORD_FAIL,
      payload: errorMessage
    });
    
    throw err;
  }
};

// Helper function to resize an image
const resizeImage = (file, maxWidth = 800, maxHeight = 800, quality = 0.7) => {
  return new Promise((resolve, reject) => {
    // Create a FileReader to read the file
    const reader = new FileReader();
    
    // Set up the FileReader onload callback
    reader.onload = (readerEvent) => {
      // Create an image object
      const img = new Image();
      img.onload = () => {
        // Calculate new dimensions while maintaining aspect ratio
        let width = img.width;
        let height = img.height;
        
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }
        
        // Create a canvas and resize the image
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        // Draw the image on the canvas
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert the canvas to a data URL
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        
        // Resolve with the data URL
        resolve(dataUrl);
      };
      
      // Set the source of the image to the FileReader result
      img.src = readerEvent.target.result;
    };
    
    // Handle errors
    reader.onerror = (error) => {
      console.error('Error reading file:', error);
      reject(error);
    };
    
    // Read the file as a data URL
    reader.readAsDataURL(file);
  });
};

// Upload Profile Image
export const uploadProfileImage = (imageFile) => async dispatch => {
  try {
    console.log('Uploading profile image');
    console.log('Image file size:', imageFile.size, 'bytes');
    
    // Resize the image before uploading
    const resizedImageData = await resizeImage(imageFile);
    console.log('Resized image data length:', resizedImageData.length);
    
    // Send the resized image data to the server
    console.log('Sending image data to server...');
    const res = await api.put('/auth/uploadimage', { imageUrl: resizedImageData });
    
    // Store the resized image data in localStorage for persistence
    localStorage.setItem('profileImageUrl', resizedImageData);
    
    console.log('Profile image upload response:', res.data);

    dispatch({
      type: UPLOAD_PROFILE_IMAGE_SUCCESS,
      payload: res.data.data
    });
    
    return res.data;
  } catch (err) {
    console.error('Profile image upload error:', err);
    
    let errorMessage = 'Profile image upload failed';
    if (err.response) {
      console.error('Error response data:', err.response.data);
      console.error('Error response status:', err.response.status);
      errorMessage = err.response.data?.error || `Server error: ${err.response.status}`;
    } else if (err.request) {
      console.error('No response received:', err.request);
      errorMessage = 'No response received from server. Please check your connection.';
    } else {
      console.error('Request setup error:', err.message);
      errorMessage = `Request error: ${err.message}`;
    }
    
    dispatch({
      type: UPLOAD_PROFILE_IMAGE_FAIL,
      payload: errorMessage
    });
    
    throw err;
  }
};

// Clear Errors
export const clearErrors = () => dispatch => {
  dispatch({ type: CLEAR_ERRORS });
};