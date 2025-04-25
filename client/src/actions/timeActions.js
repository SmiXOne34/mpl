import {
  GET_VOTING_STATUS,
  UPDATE_VOTING_SETTINGS,
  TIME_ERROR,
  SET_LOADING
} from './types';
import api from '../utils/api';

// Get current voting status
export const getVotingStatus = () => async dispatch => {
  try {
    console.log('Fetching voting status');
    dispatch({ type: SET_LOADING });

    // Always fetch from API to ensure all users have the same status
    const res = await api.get('/selections/status');
    console.log('Voting status response:', res.data);

    dispatch({
      type: GET_VOTING_STATUS,
      payload: res.data.data
    });
  } catch (err) {
    console.error('Error fetching voting status:', err);
    
    let errorMessage = 'Error fetching voting status';
    if (err.response) {
      errorMessage = err.response.data?.error || `Server error: ${err.response.status}`;
    }
    
    dispatch({
      type: TIME_ERROR,
      payload: errorMessage
    });
  }
};

// Update voting settings
export const updateVotingSettings = (settings) => async dispatch => {
  try {
    console.log('Updating voting settings', settings);
    dispatch({ type: SET_LOADING });

    // Send the settings to the backend
    const res = await api.put('/settings/voting', settings);
    console.log('Update voting settings response:', res.data);

    dispatch({
      type: UPDATE_VOTING_SETTINGS,
      payload: res.data.data
    });

    // Fetch the updated status to ensure it's consistent
    dispatch(getVotingStatus());

    return Promise.resolve(res.data);
  } catch (err) {
    console.error('Error updating voting settings:', err);
    
    let errorMessage = 'Error updating voting settings';
    if (err.response) {
      errorMessage = err.response.data?.error || `Server error: ${err.response.status}`;
    }
    
    dispatch({
      type: TIME_ERROR,
      payload: errorMessage
    });

    return Promise.reject(err);
  }
};