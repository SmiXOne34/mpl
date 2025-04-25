import {
  GET_MY_SELECTIONS,
  GET_FAMILY_SELECTIONS,
  CREATE_SELECTION,
  DELETE_SELECTION,
  GET_POPULAR_MEAL,
  GET_SELECTION_HISTORY,
  SELECTION_ERROR,
  SET_LOADING
} from './types';
import api from '../utils/api';

// Get current user's selections
export const getMySelections = (day) => async dispatch => {
  try {
    console.log('Fetching my selections for day:', day);
    dispatch({ type: SET_LOADING });

    const res = await api.get(`/selections?day=${day}`);
    console.log('My selections response:', res.data);

    dispatch({
      type: GET_MY_SELECTIONS,
      payload: res.data.data
    });
  } catch (err) {
    console.error('Error fetching my selections:', err);
    
    let errorMessage = 'Error fetching selections';
    if (err.response) {
      errorMessage = err.response.data?.error || `Server error: ${err.response.status}`;
    }
    
    dispatch({
      type: SELECTION_ERROR,
      payload: errorMessage
    });
  }
};

// Get family selections for a specific day
export const getFamilySelections = (day) => async dispatch => {
  try {
    console.log('Fetching family selections for day:', day);
    dispatch({ type: SET_LOADING });

    const res = await api.get(`/selections/family?day=${day}`);
    console.log('Family selections response:', res.data);

    dispatch({
      type: GET_FAMILY_SELECTIONS,
      payload: res.data.data
    });
  } catch (err) {
    console.error('Error fetching family selections:', err);
    
    let errorMessage = 'Error fetching family selections';
    if (err.response) {
      errorMessage = err.response.data?.error || `Server error: ${err.response.status}`;
    }
    
    dispatch({
      type: SELECTION_ERROR,
      payload: errorMessage
    });
  }
};

// Create new selection
export const createSelection = (mealId, day) => async dispatch => {
  try {
    console.log('Creating selection for meal ID:', mealId, 'and day:', day);
    dispatch({ type: SET_LOADING });

    // Get the current week ID
    const now = new Date();
    const year = now.getFullYear();
    const firstDayOfYear = new Date(year, 0, 1);
    const pastDaysOfYear = (now - firstDayOfYear) / 86400000;
    const weekNumber = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
    const formattedWeekNumber = weekNumber < 10 ? `0${weekNumber}` : weekNumber;
    const weekId = `${year}-${formattedWeekNumber}`;
    
    console.log('Using weekId:', weekId);

    // Make the API request with the weekId included
    const res = await api.post('/selections', { mealId, day, weekId });
    console.log('Create selection response:', res.data);

    dispatch({
      type: CREATE_SELECTION,
      payload: res.data.data
    });

    return res.data.data;
  } catch (err) {
    console.error('Error creating selection:', err);
    
    let errorMessage = 'Error creating selection';
    if (err.response) {
      errorMessage = err.response.data?.error || `Server error: ${err.response.status}`;
      console.error('Server error details:', err.response.data);
    } else if (err.request) {
      errorMessage = 'No response received from server. Please check your connection.';
      console.error('No response received:', err.request);
    } else {
      errorMessage = err.message || 'Unknown error occurred';
      console.error('Request setup error:', err.message);
    }
    
    dispatch({
      type: SELECTION_ERROR,
      payload: errorMessage
    });

    throw err;
  }
};

// Delete selection
export const deleteSelection = id => async dispatch => {
  try {
    console.log('Deleting selection with ID:', id);
    dispatch({ type: SET_LOADING });

    const res = await api.delete(`/selections/${id}`);
    console.log('Selection deleted successfully:', res.data);

    dispatch({
      type: DELETE_SELECTION,
      payload: id
    });
    
    return true;
  } catch (err) {
    console.error('Error deleting selection:', err);
    
    let errorMessage = 'Error deleting selection';
    if (err.response) {
      errorMessage = err.response.data?.error || `Server error: ${err.response.status}`;
      console.error('Server error details:', err.response.data);
    } else if (err.request) {
      errorMessage = 'No response received from server. Please check your connection.';
      console.error('No response received:', err.request);
    } else {
      errorMessage = err.message || 'Unknown error occurred';
      console.error('Request setup error:', err.message);
    }
    
    dispatch({
      type: SELECTION_ERROR,
      payload: errorMessage
    });
    
    throw err;
  }
};

// Get most popular meal for a specific day
export const getPopularMeal = (day) => async dispatch => {
  try {
    console.log('Fetching popular meal for day:', day);
    dispatch({ type: SET_LOADING });

    const res = await api.get(`/selections/popular?day=${day}`);
    console.log('Popular meal response:', res.data);

    dispatch({
      type: GET_POPULAR_MEAL,
      payload: res.data.data
    });
  } catch (err) {
    console.error('Error fetching popular meal:', err);
    
    // Don't dispatch error if no popular meal is found (404)
    if (err.response && err.response.status !== 404) {
      let errorMessage = 'Error fetching popular meal';
      if (err.response) {
        errorMessage = err.response.data?.error || `Server error: ${err.response.status}`;
      }
      
      dispatch({
        type: SELECTION_ERROR,
        payload: errorMessage
      });
    } else {
      console.log('No popular meal found (404), setting to null');
      // Clear popular meal if none found
      dispatch({
        type: GET_POPULAR_MEAL,
        payload: null
      });
    }
  }
};

// Get user's selection history
export const getSelectionHistory = (timeframe = 'all') => async dispatch => {
  try {
    console.log('Fetching selection history with timeframe:', timeframe);
    dispatch({ type: SET_LOADING });

    const res = await api.get(`/selections/history?timeframe=${timeframe}`);
    console.log('Selection history response:', res.data);

    dispatch({
      type: GET_SELECTION_HISTORY,
      payload: res.data.data
    });
  } catch (err) {
    console.error('Error fetching selection history:', err);
    
    let errorMessage = 'Error fetching selection history';
    if (err.response) {
      errorMessage = err.response.data?.error || `Server error: ${err.response.status}`;
    }
    
    dispatch({
      type: SELECTION_ERROR,
      payload: errorMessage
    });
  }
};