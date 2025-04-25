import {
  GET_MY_SELECTIONS,
  GET_FAMILY_SELECTIONS,
  CREATE_SELECTION,
  DELETE_SELECTION,
  GET_POPULAR_MEAL,
  GET_SELECTION_HISTORY,
  SELECTION_ERROR,
  SET_LOADING
} from '../actions/types';

const initialState = {
  mySelections: [],
  familySelections: [],
  popularMeal: null,
  history: [],
  loading: false,
  error: null
};

export default function(state = initialState, action) {
  switch (action.type) {
    case GET_MY_SELECTIONS:
      return {
        ...state,
        mySelections: action.payload,
        loading: false
      };
    case GET_FAMILY_SELECTIONS:
      return {
        ...state,
        familySelections: action.payload,
        loading: false
      };
    case CREATE_SELECTION:
      return {
        ...state,
        mySelections: [...state.mySelections, action.payload],
        loading: false
      };
    case DELETE_SELECTION:
      return {
        ...state,
        mySelections: state.mySelections.filter(
          selection => selection._id !== action.payload
        ),
        familySelections: state.familySelections.filter(
          selection => selection._id !== action.payload
        ),
        loading: false
      };
    case GET_POPULAR_MEAL:
      return {
        ...state,
        popularMeal: action.payload,
        loading: false
      };
    case GET_SELECTION_HISTORY:
      return {
        ...state,
        history: action.payload,
        loading: false
      };
    case SELECTION_ERROR:
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