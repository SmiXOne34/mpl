import api from '../utils/api';
import { setAlert } from './alertActions';
import {
  GET_SETTINGS,
  UPDATE_SETTINGS,
  SETTINGS_ERROR
} from './types';

// Get settings
export const getSettings = () => async dispatch => {
  try {
    console.log('Calling API to get settings');
    
    try {
      // First try the main settings endpoint
      const res = await api.get('/settings');
      console.log('Settings API response:', res.data);
      
      if (res.data && res.data.success) {
        dispatch({
          type: GET_SETTINGS,
          payload: res.data.data
        });
        return res.data.data;
      }
      
      // If the main endpoint doesn't return success, try the test endpoint
      throw new Error('Main settings endpoint failed');
    } catch (mainError) {
      console.error('Error with main settings endpoint:', mainError);
      console.log('Trying test endpoint...');
      
      // Try the test endpoint as a fallback
      const testRes = await api.get('/settings/test');
      console.log('Test settings API response:', testRes.data);
      
      if (testRes.data && testRes.data.success) {
        dispatch({
          type: GET_SETTINGS,
          payload: testRes.data.data
        });
        return testRes.data.data;
      }
      
      throw new Error('Both settings endpoints failed');
    }
  } catch (err) {
    console.error('Error fetching settings:', err);
    
    // Create default settings
    const defaultSettings = {
      allowRegistration: true,
      votingOpenHour: 8,
      votingOpenMinute: 0,
      votingCloseHour: 18,
      votingCloseMinute: 0,
      autoSelectWinner: true,
      notifyUsers: true,
      allowMultipleSelections: true,
      maxSelectionsPerUser: 2,
      allowViewerRole: true
    };
    
    // Dispatch default settings on error
    dispatch({
      type: GET_SETTINGS,
      payload: defaultSettings
    });
    
    // Also dispatch the error
    dispatch({
      type: SETTINGS_ERROR,
      payload: err.response && err.response.data.error
        ? err.response.data.error
        : 'Failed to load settings'
    });
    
    return defaultSettings;
  }
};

// Update settings
export const updateSettings = (formData) => async dispatch => {
  try {
    console.log('Updating settings with:', formData);

    try {
      // Try the main endpoint first
      const res = await api.put('/settings', formData);
      console.log('Update settings response:', res.data);

      if (res.data && res.data.success) {
        dispatch({
          type: UPDATE_SETTINGS,
          payload: res.data.data
        });
        
        dispatch(setAlert('Settings updated successfully', 'success'));
        return Promise.resolve(res.data.data);
      }
      
      throw new Error('Main settings update endpoint failed');
    } catch (mainError) {
      console.error('Error with main settings update endpoint:', mainError);
      
      // For now, just use the test endpoint to get settings
      // In a real app, we would implement a test update endpoint as well
      const testRes = await api.get('/settings/test');
      console.log('Using test settings as fallback:', testRes.data);
      
      if (testRes.data && testRes.data.success) {
        // Merge the form data with the test data
        const mergedData = {
          ...testRes.data.data,
          ...formData
        };
        
        dispatch({
          type: UPDATE_SETTINGS,
          payload: mergedData
        });
        
        dispatch(setAlert('Settings updated (local only)', 'warning'));
        return Promise.resolve(mergedData);
      }
      
      throw new Error('Both settings endpoints failed');
    }
  } catch (err) {
    console.error('Error updating settings:', err);
    
    dispatch({
      type: SETTINGS_ERROR,
      payload: err.response && err.response.data.error
        ? err.response.data.error
        : 'Failed to update settings'
    });

    dispatch(setAlert('Failed to update settings', 'error'));
    return Promise.reject(err);
  }
};