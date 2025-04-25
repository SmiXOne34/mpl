import {
  GET_NOTIFICATIONS,
  ADD_NOTIFICATION,
  MARK_NOTIFICATION_READ,
  CLEAR_NOTIFICATIONS,
  NOTIFICATION_ERROR,
  SET_LOADING
} from '../actions/types';

const initialState = {
  notifications: [],
  unreadCount: 0,
  pagination: null,
  loading: false,
  error: null
};

export default function(state = initialState, action) {
  switch (action.type) {
    case GET_NOTIFICATIONS:
      return {
        ...state,
        notifications: action.payload,
        unreadCount: action.meta?.unreadCount || 0,
        pagination: action.meta?.pagination || null,
        loading: false
      };
    case MARK_NOTIFICATION_READ:
      return {
        ...state,
        notifications: state.notifications.map(notification =>
          notification._id === action.payload
            ? { ...notification, read: true }
            : notification
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
        loading: false
      };
    case ADD_NOTIFICATION:
      return {
        ...state,
        notifications: [action.payload, ...state.notifications],
        unreadCount: state.unreadCount + 1
      };
    case CLEAR_NOTIFICATIONS:
      return {
        ...state,
        notifications: [],
        unreadCount: 0,
        loading: false
      };
    case NOTIFICATION_ERROR:
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