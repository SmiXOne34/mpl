import {
  GET_VOTING_STATUS,
  UPDATE_VOTING_SETTINGS,
  TIME_ERROR,
  SET_LOADING
} from '../actions/types';

const initialState = {
  votingStatus: null,
  loading: false,
  error: null
};

export default function(state = initialState, action) {
  switch (action.type) {
    case GET_VOTING_STATUS:
      return {
        ...state,
        votingStatus: action.payload,
        loading: false
      };
    case UPDATE_VOTING_SETTINGS:
      return {
        ...state,
        votingStatus: action.payload,
        loading: false
      };
    case TIME_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false
      };
    case SET_LOADING:
      return {
        ...state,
        loading: true
      };
    default:
      return state;
  }
}