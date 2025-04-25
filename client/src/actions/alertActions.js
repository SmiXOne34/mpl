import { v4 as uuidv4 } from 'uuid';
import { SET_ALERT, REMOVE_ALERT } from './types';

/**
 * Set an alert
 * @param {string} msg - Alert message
 * @param {string} type - Alert type (success, error, info, warning)
 * @param {number} timeout - Time in milliseconds before alert disappears (default: 5000)
 * @returns {Function} - Dispatch function
 */
export const setAlert = (msg, type, timeout = 5000) => dispatch => {
  const id = uuidv4();
  
  dispatch({
    type: SET_ALERT,
    payload: { msg, type, id }
  });

  setTimeout(() => 
    dispatch({
      type: REMOVE_ALERT,
      payload: id
    }), 
    timeout
  );
};