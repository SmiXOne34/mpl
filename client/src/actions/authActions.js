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
    if (localStorage.token) {
      console.log('Setting auth token from localStorage');
      setAuthToken(localStorage.token);
      
      // Initialize socket if not already connected
      const socket = require('../utils/socket').getSocket();
      if (!socket || !socket.connected) {
        console.log('Initializing socket connection in loadUser');
        initSocket(localStorage.token);
      }
    } else {
      console.log('No token found in localStorage');
      // If no token, dispatch AUTH_ERROR and return early
      dispatch({ type: AUTH_ERROR });
      return;
    }

    console.log('Making API request to /auth/me');
    const res = await api.get('/auth/me');
    console.log('User data response:', res.data);
    
    // Check if we have a saved profile image URL
    const savedImageUrl = localStorage.getItem('profileImageUrl');
    let userData = res.data.data;
    
    // If we have a saved image URL, add it to the user data
    if (savedImageUrl) {
      userData = {
        ...userData,
        imageUrl: savedImageUrl
      };
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
  
  // First, try using the standard API utility
  try {
    console.log('Making login request to /auth/login using api utility');
    const res = await api.post('/auth/login', { email, password });
    
    console.log('Login successful, response:', res.data);
    
    dispatch({
      type: LOGIN_SUCCESS,
      payload: res.data
    });

    // Initialize socket connection with the new token
    if (res.data && res.data.token) {
      console.log('Initializing socket connection after login');
      initSocket(res.data.token);
    }

    // Load user after successful login
    dispatch(loadUser());
    return; // Exit early if successful
  } catch (err) {
    console.error('First login attempt failed:', err);
    // Continue to fallback methods
  }
  
  // Second attempt: Try using axios directly with absolute URL
  try {
    console.log('Making second login attempt with axios directly');
    
    // Determine the API URL based on environment
    const apiUrl = process.env.NODE_ENV === 'production' 
      ? `${window.location.origin}/api/auth/login`
      : 'http://localhost:9091/api/auth/login';
      
    console.log(`Using direct axios with URL: ${apiUrl}`);
    
    const axiosResponse = await axios({
      method: 'post',
      url: apiUrl,
      data: { email, password },
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      withCredentials: true
    });
    
    console.log('Second login attempt successful:', axiosResponse.data);
    
    dispatch({
      type: LOGIN_SUCCESS,
      payload: axiosResponse.data
    });

    // Initialize socket connection with the new token
    if (axiosResponse.data && axiosResponse.data.token) {
      console.log('Initializing socket connection after second login attempt');
      initSocket(axiosResponse.data.token);
    }

    // Load user after successful login
    dispatch(loadUser());
    return; // Exit early if successful
  } catch (err) {
    console.error('Second login attempt failed:', err);
    // Continue to final fallback
  }
  
  // Final attempt: Try using fetch API as a last resort
  try {
    console.log('Making final login attempt with fetch API');
    
    // Determine the API URL based on environment
    const apiUrl = process.env.NODE_ENV === 'production' 
      ? `${window.location.origin}/api/auth/login`
      : 'http://localhost:9091/api/auth/login';
      
    console.log(`Using fetch with URL: ${apiUrl}`);
    
    const fetchResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password }),
      credentials: 'include'
    });
    
    console.log('Fetch response status:', fetchResponse.status);
    
    if (!fetchResponse.ok) {
      throw new Error(`Fetch failed with status ${fetchResponse.status}`);
    }
    
    const data = await fetchResponse.json();
    console.log('Fetch login successful:', data);
    
    dispatch({
      type: LOGIN_SUCCESS,
      payload: data
    });
    
    // Initialize socket connection with the new token
    if (data && data.token) {
      console.log('Initializing socket connection after fetch login');
      initSocket(data.token);
      
      // Load user after successful login
      dispatch(loadUser());
    }
  } catch (err) {
    console.error('All login attempts failed:', err);
    
    // Determine the most appropriate error message
    let errorMessage = 'Login failed after multiple attempts. Please check your network connection and try again.';
    
    if (err.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      errorMessage = err.response.data?.error || `Server error: ${err.response.status}`;
    } else if (err.request) {
      // The request was made but no response was received
      errorMessage = 'No response from server. The server might be down or unreachable.';
    } else if (err.message) {
      // Something happened in setting up the request that triggered an Error
      errorMessage = `Error: ${err.message}`;
    }
    
    // Dispatch the final error
    dispatch({
      type: LOGIN_FAIL,
      payload: errorMessage
    });
    
    // Log diagnostic information
    console.error('Login diagnostic information:', {
      environment: process.env.NODE_ENV,
      apiBaseUrl: api.defaults.baseURL,
      browserLocation: window.location.href,
      userAgent: navigator.userAgent
    });
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

  dispatch({ type: LOGOUT });
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

// Upload Profile Image
export const uploadProfileImage = (imageFile) => async dispatch => {
  try {
    console.log('Uploading profile image');
    
    // Create a URL for the uploaded image
    const imageUrl = URL.createObjectURL(imageFile);
    
    // In a real implementation, we would upload the image to a server
    // and get back a URL. For now, we'll use the local object URL.
    
    // Simulate a network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Send the image URL to the server
    const res = await api.put('/auth/uploadimage', { imageUrl });
    
    // Store the image URL in localStorage for persistence
    localStorage.setItem('profileImageUrl', imageUrl);
    
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
      errorMessage = err.response.data?.error || `Server error: ${err.response.status}`;
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