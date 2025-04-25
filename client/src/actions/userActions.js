import {
  GET_USERS,
  GET_USER,
  CREATE_USER,
  UPDATE_USER,
  DELETE_USER,
  UPDATE_USER_ROLE,
  USER_ERROR,
  SET_LOADING
} from './types';
import api from '../utils/api';

// Get all users
export const getUsers = () => async dispatch => {
  try {
    console.log('Fetching all users');
    dispatch({ type: SET_LOADING });

    const res = await api.get('/users');
    console.log('Users response:', res.data);

    dispatch({
      type: GET_USERS,
      payload: res.data.data
    });
  } catch (err) {
    console.error('Error fetching users:', err);
    
    let errorMessage = 'Error fetching users';
    if (err.response) {
      errorMessage = err.response.data?.error || `Server error: ${err.response.status}`;
    }
    
    dispatch({
      type: USER_ERROR,
      payload: errorMessage
    });
  }
};

// Get single user
export const getUser = id => async dispatch => {
  try {
    console.log('Fetching user with ID:', id);
    dispatch({ type: SET_LOADING });

    const res = await api.get(`/users/${id}`);
    console.log('User response:', res.data);

    dispatch({
      type: GET_USER,
      payload: res.data.data
    });
  } catch (err) {
    console.error('Error fetching user:', err);
    
    let errorMessage = 'Error fetching user';
    if (err.response) {
      errorMessage = err.response.data?.error || `Server error: ${err.response.status}`;
    }
    
    dispatch({
      type: USER_ERROR,
      payload: errorMessage
    });
  }
};

// Create new user
export const createUser = userData => async dispatch => {
  try {
    console.log('Creating user with data:', userData);
    dispatch({ type: SET_LOADING });

    const res = await api.post('/users', userData);
    console.log('Create user response:', res.data);

    dispatch({
      type: CREATE_USER,
      payload: res.data.data
    });

    return res.data.data;
  } catch (err) {
    console.error('Error creating user:', err);
    
    let errorMessage = 'Error creating user';
    if (err.response) {
      errorMessage = err.response.data?.error || `Server error: ${err.response.status}`;
    }
    
    dispatch({
      type: USER_ERROR,
      payload: errorMessage
    });

    throw err;
  }
};

// Update user
export const updateUser = (id, userData) => async dispatch => {
  try {
    console.log('Updating user with ID:', id, 'and data:', userData);
    dispatch({ type: SET_LOADING });

    const res = await api.put(`/users/${id}`, userData);
    console.log('Update user response:', res.data);

    dispatch({
      type: UPDATE_USER,
      payload: res.data.data
    });

    return res.data.data;
  } catch (err) {
    console.error('Error updating user:', err);
    
    let errorMessage = 'Error updating user';
    if (err.response) {
      errorMessage = err.response.data?.error || `Server error: ${err.response.status}`;
    }
    
    dispatch({
      type: USER_ERROR,
      payload: errorMessage
    });

    throw err;
  }
};

// Delete user
export const deleteUser = id => async dispatch => {
  try {
    console.log('Deleting user with ID:', id);
    dispatch({ type: SET_LOADING });

    await api.delete(`/users/${id}`);
    console.log('User deleted successfully');

    dispatch({
      type: DELETE_USER,
      payload: id
    });
  } catch (err) {
    console.error('Error deleting user:', err);
    
    let errorMessage = 'Error deleting user';
    if (err.response) {
      errorMessage = err.response.data?.error || `Server error: ${err.response.status}`;
    }
    
    dispatch({
      type: USER_ERROR,
      payload: errorMessage
    });
  }
};

// Update user role
export const updateUserRole = (id, roleData) => async dispatch => {
  try {
    console.log('Updating role for user with ID:', id, 'and data:', roleData);
    dispatch({ type: SET_LOADING });

    const res = await api.put(`/users/${id}/role`, roleData);
    console.log('Update user role response:', res.data);

    dispatch({
      type: UPDATE_USER_ROLE,
      payload: res.data.data
    });

    return res.data.data;
  } catch (err) {
    console.error('Error updating user role:', err);
    
    let errorMessage = 'Error updating user role';
    if (err.response) {
      errorMessage = err.response.data?.error || `Server error: ${err.response.status}`;
    }
    
    dispatch({
      type: USER_ERROR,
      payload: errorMessage
    });

    throw err;
  }
};