import {
  GET_MEALS,
  GET_MEAL,
  CREATE_MEAL,
  UPDATE_MEAL,
  DELETE_MEAL,
  MEAL_ERROR,
  CLEAR_MEAL,
  SET_LOADING,
  GENERATE_MEAL
} from './types';
import axios from 'axios';
import api from '../utils/api';

// Get all meals
export const getMeals = () => async dispatch => {
  try {
    console.log('Fetching all meals');
    dispatch({ type: SET_LOADING });

    const res = await api.get('/meals');
    console.log('Meals response:', res.data);

    dispatch({
      type: GET_MEALS,
      payload: res.data.data
    });
  } catch (err) {
    console.error('Error fetching meals:', err);
    
    let errorMessage = 'Error fetching meals';
    if (err.response) {
      errorMessage = err.response.data?.error || `Server error: ${err.response.status}`;
      console.error('Server response:', err.response.data);
    } else if (err.request) {
      errorMessage = 'No response from server. Please check your connection.';
      console.error('No response received:', err.request);
    } else {
      errorMessage = `Request error: ${err.message}`;
    }
    
    dispatch({
      type: MEAL_ERROR,
      payload: errorMessage
    });
  }
};

// Get single meal
export const getMeal = id => async dispatch => {
  try {
    console.log('Fetching meal with ID:', id);
    
    // Validate ID
    if (!id) {
      throw new Error('No meal ID provided');
    }
    
    dispatch({ type: SET_LOADING });

    // Log the request URL
    console.log(`Making GET request to: /meals/${id}`);
    
    const res = await api.get(`/meals/${id}`);
    console.log('Meal response:', res.data);

    dispatch({
      type: GET_MEAL,
      payload: res.data.data
    });
    
    return res.data.data;
  } catch (err) {
    console.error('Error fetching meal:', err);
    
    let errorMessage = 'Error fetching meal';
    if (err.response) {
      errorMessage = err.response.data?.error || err.response.data?.message || `Server error: ${err.response.status}`;
      console.error('Server response details:', {
        status: err.response.status,
        statusText: err.response.statusText,
        data: err.response.data,
        url: err.response.config?.url
      });
    } else if (err.request) {
      errorMessage = 'No response received from server';
      console.error('No response received:', err.request);
    } else {
      errorMessage = `Request error: ${err.message}`;
    }
    
    dispatch({
      type: MEAL_ERROR,
      payload: errorMessage
    });
    
    throw err;
  }
};

// Create new meal
export const createMeal = mealData => async dispatch => {
  try {
    console.log('Creating meal with data:', mealData);
    dispatch({ type: SET_LOADING });

    const res = await api.post('/meals', mealData);
    console.log('Create meal response:', res.data);

    dispatch({
      type: CREATE_MEAL,
      payload: res.data.data
    });

    return res.data.data;
  } catch (err) {
    console.error('Error creating meal:', err);
    
    let errorMessage = 'Error creating meal';
    if (err.response) {
      errorMessage = err.response.data?.error || `Server error: ${err.response.status}`;
    }
    
    dispatch({
      type: MEAL_ERROR,
      payload: errorMessage
    });

    throw err;
  }
};

// Update meal
export const updateMeal = (id, mealData) => async dispatch => {
  try {
    console.log('Updating meal with ID:', id, 'and data:', mealData);
    
    // Validate ID
    if (!id) {
      throw new Error('No meal ID provided for update');
    }
    
    // Validate meal data
    if (!mealData || Object.keys(mealData).length === 0) {
      throw new Error('No meal data provided for update');
    }
    
    dispatch({ type: SET_LOADING });

    // Log the request URL and data
    console.log(`Making PUT request to: /meals/${id}`);
    console.log('Request data:', mealData);
    
    // Set a longer timeout for the request
    const requestConfig = {
      timeout: 30000 // 30 seconds
    };
    
    // Create a more robust request with retry logic
    let attempts = 0;
    const maxAttempts = 3;
    let lastError = null;
    
    while (attempts < maxAttempts) {
      try {
        attempts++;
        console.log(`Update attempt ${attempts} of ${maxAttempts}`);
        
        const res = await api.put(`/meals/${id}`, mealData, requestConfig);
        console.log('Update meal response:', res.data);
        
        dispatch({
          type: UPDATE_MEAL,
          payload: res.data.data
        });
        
        return res.data.data;
      } catch (attemptError) {
        lastError = attemptError;
        
        // Only retry on network errors or 5xx server errors
        if (
          !attemptError.response || 
          (attemptError.response && attemptError.response.status >= 500)
        ) {
          console.warn(`Attempt ${attempts} failed, ${maxAttempts - attempts} retries left:`, attemptError.message);
          
          if (attempts < maxAttempts) {
            // Wait before retrying (exponential backoff)
            await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
            continue;
          }
        } else {
          // Don't retry for client errors (4xx)
          break;
        }
      }
    }
    
    // If we get here, all attempts failed
    console.error(`All ${maxAttempts} update attempts failed`);
    
    // Process the last error
    let errorMessage = 'Error updating meal';
    if (lastError.response) {
      errorMessage = lastError.response.data?.error || lastError.response.data?.message || `Server error: ${lastError.response.status}`;
      console.error('Server response details:', {
        status: lastError.response.status,
        statusText: lastError.response.statusText,
        data: lastError.response.data,
        url: lastError.response.config?.url,
        method: lastError.response.config?.method,
        requestData: lastError.response.config?.data
      });
    } else if (lastError.request) {
      errorMessage = 'No response received from server. The connection may have been interrupted.';
      console.error('No response received:', {
        request: lastError.request,
        url: lastError.config?.url,
        method: lastError.config?.method,
        data: lastError.config?.data
      });
    } else {
      errorMessage = `Request error: ${lastError.message}`;
    }
    
    dispatch({
      type: MEAL_ERROR,
      payload: errorMessage
    });

    throw lastError;
  } catch (err) {
    console.error('Error in updateMeal action:', err);
    
    dispatch({
      type: MEAL_ERROR,
      payload: err.message || 'An unexpected error occurred'
    });

    throw err;
  }
};

// Delete meal
export const deleteMeal = id => async dispatch => {
  try {
    console.log('Deleting meal with ID:', id);
    dispatch({ type: SET_LOADING });

    await api.delete(`/meals/${id}`);
    console.log('Meal deleted successfully');

    dispatch({
      type: DELETE_MEAL,
      payload: id
    });
  } catch (err) {
    console.error('Error deleting meal:', err);
    
    let errorMessage = 'Error deleting meal';
    if (err.response) {
      errorMessage = err.response.data?.error || `Server error: ${err.response.status}`;
    }
    
    dispatch({
      type: MEAL_ERROR,
      payload: errorMessage
    });
  }
};

// Search meals
export const searchMeals = query => async dispatch => {
  try {
    console.log('Searching meals with query:', query);
    dispatch({ type: SET_LOADING });

    const res = await api.get(`/meals/search?query=${query}`);
    console.log('Search meals response:', res.data);

    dispatch({
      type: GET_MEALS,
      payload: res.data.data
    });
  } catch (err) {
    console.error('Error searching meals:', err);
    
    let errorMessage = 'Error searching meals';
    if (err.response) {
      errorMessage = err.response.data?.error || `Server error: ${err.response.status}`;
    }
    
    dispatch({
      type: MEAL_ERROR,
      payload: errorMessage
    });
  }
};

// Get popular meals
export const getPopularMeals = () => async dispatch => {
  try {
    console.log('Fetching popular meals');
    dispatch({ type: SET_LOADING });

    const res = await api.get('/meals/popular');
    console.log('Popular meals response:', res.data);

    dispatch({
      type: GET_MEALS,
      payload: res.data.data
    });
  } catch (err) {
    console.error('Error fetching popular meals:', err);
    
    let errorMessage = 'Error fetching popular meals';
    if (err.response) {
      errorMessage = err.response.data?.error || `Server error: ${err.response.status}`;
    }
    
    dispatch({
      type: MEAL_ERROR,
      payload: errorMessage
    });
  }
};

// Clear current meal
export const clearMeal = () => dispatch => {
  dispatch({ type: CLEAR_MEAL });
};

// Generate meal using AI
export const generateMeal = (prompt) => async dispatch => {
  try {
    console.log('Generating meal with AI using prompt:', prompt);
    dispatch({ type: SET_LOADING });

    // Create a custom axios instance with a timeout
    const axiosWithTimeout = axios.create({
      baseURL: api.defaults.baseURL,
      timeout: 10000 // 10 second timeout
    });

    console.log('Sending API request to generate meal...');
    // Make sure prompt is a string before sending to the API
    const promptString = typeof prompt === 'object' ? prompt.prompt : prompt;
    const res = await axiosWithTimeout.post('/meals/generate', { prompt: promptString });
    console.log('Generate meal response received:', res.data);

    if (!res.data || !res.data.data) {
      console.error('Invalid response format from server:', res.data);
      throw new Error('Invalid response format from server');
    }

    dispatch({
      type: GENERATE_MEAL,
      payload: res.data.data
    });

    return res.data.data;
  } catch (err) {
    console.error('Error generating meal with AI:', err);
    
    let errorMessage = 'Error generating meal with AI';
    
    if (err.code === 'ECONNABORTED') {
      errorMessage = 'Request timed out. The server took too long to respond.';
    } else if (err.response) {
      errorMessage = err.response.data?.error || `Server error: ${err.response.status}`;
    } else if (err.request) {
      errorMessage = 'No response received from server. Please check your network connection.';
    }
    
    console.log('Dispatching error:', errorMessage);
    dispatch({
      type: MEAL_ERROR,
      payload: errorMessage
    });

    // Throw the error instead of returning a mock meal
    throw new Error(errorMessage);
  }
};