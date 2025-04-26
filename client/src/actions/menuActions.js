import {
  GET_WEEKLY_MENU,
  GET_MENU_BY_WEEK,
  CREATE_MENU,
  UPDATE_MENU,
  DELETE_MENU,
  MENU_ERROR,
  SET_LOADING
} from './types';
import api from '../utils/api';

// Get current weekly menu
export const getWeeklyMenu = (weekNumber, year) => async dispatch => {
  try {
    dispatch({ type: SET_LOADING });

    // If weekNumber and year are provided, fetch specific week
    const url = weekNumber && year 
      ? `/menu/week/${weekNumber}/${year}` 
      : '/menu/current';

    console.log('Fetching weekly menu from:', url);
    const res = await api.get(url);
    console.log('Weekly menu response:', res.data);

    dispatch({
      type: GET_WEEKLY_MENU,
      payload: res.data.data
    });
  } catch (err) {
    console.error('Error fetching weekly menu:', err);
    
    let errorMessage = 'Error fetching weekly menu';
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
      type: MENU_ERROR,
      payload: errorMessage
    });
  }
};

// Get menu by week ID
export const getMenuByWeek = weekId => async dispatch => {
  try {
    console.log('Fetching menu for week ID:', weekId);
    dispatch({ type: SET_LOADING });

    const res = await api.get(`/menu/${weekId}`);
    console.log('Menu by week response:', res.data);

    dispatch({
      type: GET_MENU_BY_WEEK,
      payload: res.data.data
    });
  } catch (err) {
    console.error('Error fetching menu by week:', err);
    
    let errorMessage = 'Error fetching menu';
    if (err.response) {
      errorMessage = err.response.data?.error || `Server error: ${err.response.status}`;
    }
    
    dispatch({
      type: MENU_ERROR,
      payload: errorMessage
    });
  }
};

// Create new weekly menu
export const createMenu = menuData => async dispatch => {
  try {
    console.log('Creating menu with data:', JSON.stringify(menuData, null, 2));
    dispatch({ type: SET_LOADING });

    // Log the request URL and headers
    console.log('Making POST request to:', '/menu');
    console.log('Request headers:', api.defaults.headers);
    
    const res = await api.post('/menu', menuData);
    console.log('Create menu response status:', res.status);
    console.log('Create menu response headers:', res.headers);
    console.log('Create menu response data:', JSON.stringify(res.data, null, 2));

    if (!res.data || !res.data.success) {
      console.error('API returned success: false or no data');
      throw new Error('API returned unsuccessful response');
    }

    dispatch({
      type: CREATE_MENU,
      payload: res.data.data
    });

    return res.data.data;
  } catch (err) {
    console.error('Error creating menu:', err);
    
    let errorMessage = 'Error creating menu';
    if (err.response) {
      errorMessage = err.response.data?.error || err.response.data?.message || `Server error: ${err.response.status}`;
      console.error('Server response details:', {
        status: err.response.status,
        statusText: err.response.statusText,
        data: JSON.stringify(err.response.data, null, 2),
        headers: err.response.headers,
        url: err.response.config?.url,
        method: err.response.config?.method,
        requestData: err.response.config?.data
      });
    } else if (err.request) {
      errorMessage = 'No response from server. Please check your connection.';
      console.error('No response received:', {
        request: err.request,
        url: err.config?.url,
        method: err.config?.method,
        data: err.config?.data
      });
    } else {
      errorMessage = `Request error: ${err.message}`;
    }
    
    dispatch({
      type: MENU_ERROR,
      payload: errorMessage
    });

    throw err;
  }
};

// Update weekly menu
export const updateMenu = (weekId, menuData) => async dispatch => {
  try {
    console.log('Updating menu for week ID:', weekId, 'with data:', menuData);
    dispatch({ type: SET_LOADING });

    // Make sure weekId is in the correct format
    if (!weekId) {
      throw new Error('No weekId provided for menu update');
    }

    // Log the request details
    console.log(`Making PUT request to /menu/${weekId}`);
    
    const res = await api.put(`/menu/${weekId}`, menuData);
    console.log('Update menu response:', res.data);

    dispatch({
      type: UPDATE_MENU,
      payload: res.data.data
    });

    return res.data.data;
  } catch (err) {
    console.error('Error updating menu:', err);
    
    let errorMessage = 'Error updating menu';
    if (err.response) {
      errorMessage = err.response.data?.error || err.response.data?.message || `Server error: ${err.response.status}`;
      console.error('Server response details:', {
        status: err.response.status,
        statusText: err.response.statusText,
        data: err.response.data
      });
    } else if (err.message) {
      errorMessage = `${errorMessage}: ${err.message}`;
    }
    
    dispatch({
      type: MENU_ERROR,
      payload: errorMessage
    });

    throw err;
  }
};

// Delete weekly menu
export const deleteMenu = weekId => async dispatch => {
  try {
    console.log('Deleting menu for week ID:', weekId);
    dispatch({ type: SET_LOADING });

    await api.delete(`/menu/${weekId}`);
    console.log('Menu deleted successfully');

    dispatch({
      type: DELETE_MENU,
      payload: weekId
    });
  } catch (err) {
    console.error('Error deleting menu:', err);
    
    let errorMessage = 'Error deleting menu';
    if (err.response) {
      errorMessage = err.response.data?.error || `Server error: ${err.response.status}`;
    }
    
    dispatch({
      type: MENU_ERROR,
      payload: errorMessage
    });
  }
};

// Copy menu from one week to another
export const copyMenu = (sourceWeekId, targetWeekId) => async dispatch => {
  try {
    console.log('Copying menu from week ID:', sourceWeekId, 'to week ID:', targetWeekId);
    dispatch({ type: SET_LOADING });

    const res = await api.post(
      `/menu/${sourceWeekId}/copy`,
      { targetWeekId }
    );
    console.log('Copy menu response:', res.data);

    dispatch({
      type: CREATE_MENU,
      payload: res.data.data
    });

    return res.data.data;
  } catch (err) {
    console.error('Error copying menu:', err);
    
    let errorMessage = 'Error copying menu';
    if (err.response) {
      errorMessage = err.response.data?.error || `Server error: ${err.response.status}`;
    }
    
    dispatch({
      type: MENU_ERROR,
      payload: errorMessage
    });

    throw err;
  }
};