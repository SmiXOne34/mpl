import { combineReducers } from 'redux';
import authReducer from './authReducer';
import alertReducer from './alertReducer';
import mealReducer from './mealReducer';
import menuReducer from './menuReducer';
import selectionReducer from './selectionReducer';
import timeReducer from './timeReducer';
import userReducer from './userReducer';
import settingsReducer from './settingsReducer';

export default combineReducers({
  auth: authReducer,
  alert: alertReducer,
  meal: mealReducer,
  menu: menuReducer,
  selection: selectionReducer,
  time: timeReducer,
  user: userReducer,
  settings: settingsReducer
});