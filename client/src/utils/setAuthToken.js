import api from './api';

/**
 * Set auth token in axios headers
 * If token is provided, set it in the headers
 * If no token is provided, delete the header
 * 
 * @param {string} token - JWT token
 */
const setAuthToken = token => {
  if (token) {
    console.log('Setting auth token in API headers');
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    console.log('Removing auth token from API headers');
    delete api.defaults.headers.common['Authorization'];
  }
};

export default setAuthToken;