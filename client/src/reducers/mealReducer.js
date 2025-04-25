import {
  GET_MEALS,
  GET_MEAL,
  CREATE_MEAL,
  UPDATE_MEAL,
  DELETE_MEAL,
  MEAL_ERROR,
  CLEAR_MEAL,
  SET_LOADING,
  GENERATE_MEAL
} from '../actions/types';

const initialState = {
  meals: [],
  meal: null,
  generatedMeal: null,
  loading: false,
  error: null
};

export default function(state = initialState, action) {
  switch (action.type) {
    case GET_MEALS:
      return {
        ...state,
        meals: action.payload,
        loading: false
      };
    case GET_MEAL:
      return {
        ...state,
        meal: action.payload,
        loading: false
      };
    case CREATE_MEAL:
      return {
        ...state,
        meals: [action.payload, ...state.meals],
        meal: action.payload,
        loading: false
      };
    case UPDATE_MEAL:
      return {
        ...state,
        meals: state.meals.map(meal =>
          meal._id === action.payload._id ? action.payload : meal
        ),
        meal: action.payload,
        loading: false
      };
    case DELETE_MEAL:
      return {
        ...state,
        meals: state.meals.filter(meal => meal._id !== action.payload),
        loading: false
      };
    case CLEAR_MEAL:
      return {
        ...state,
        meal: null
      };
    case MEAL_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false
      };
    case GENERATE_MEAL:
      return {
        ...state,
        generatedMeal: action.payload,
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