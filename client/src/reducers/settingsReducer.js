import {
  GET_SETTINGS,
  UPDATE_SETTINGS,
  SETTINGS_ERROR
} from '../actions/types';

const initialState = {
  settings: null,
  loading: true,
  error: null
};

export default function(state = initialState, action) {
  const { type, payload } = action;

  switch (type) {
    case GET_SETTINGS:
    case UPDATE_SETTINGS:
      return {
        ...state,
        settings: payload,
        loading: false,
        error: null
      };
    case SETTINGS_ERROR:
      return {
        ...state,
        error: payload,
        loading: false
      };
    default:
      return state;
  }
}