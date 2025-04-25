import {
  GET_WEEKLY_MENU,
  GET_MENU_BY_WEEK,
  CREATE_MENU,
  UPDATE_MENU,
  DELETE_MENU,
  MENU_ERROR,
  SET_LOADING
} from '../actions/types';

const initialState = {
  currentMenu: null,
  menus: [],
  loading: false,
  error: null
};

export default function(state = initialState, action) {
  switch (action.type) {
    case GET_WEEKLY_MENU:
      return {
        ...state,
        currentMenu: action.payload,
        loading: false
      };
    case GET_MENU_BY_WEEK:
      return {
        ...state,
        menus: state.menus.some(menu => menu.weekId === action.payload.weekId)
          ? state.menus.map(menu =>
              menu.weekId === action.payload.weekId ? action.payload : menu
            )
          : [...state.menus, action.payload],
        loading: false
      };
    case CREATE_MENU:
      return {
        ...state,
        menus: [...state.menus, action.payload],
        currentMenu: action.payload,
        loading: false
      };
    case UPDATE_MENU:
      return {
        ...state,
        menus: state.menus.map(menu =>
          menu.weekId === action.payload.weekId ? action.payload : menu
        ),
        currentMenu:
          state.currentMenu && state.currentMenu.weekId === action.payload.weekId
            ? action.payload
            : state.currentMenu,
        loading: false
      };
    case DELETE_MENU:
      return {
        ...state,
        menus: state.menus.filter(menu => menu.weekId !== action.payload),
        currentMenu:
          state.currentMenu && state.currentMenu.weekId === action.payload
            ? null
            : state.currentMenu,
        loading: false
      };
    case MENU_ERROR:
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