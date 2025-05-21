import {
  SHOW_NOTIFICATION,
  CLOSE_NOTIFICATION,
  COLLAPSE_NOTIFICATION,
  EXPAND_NOTIFICATION,
} from "../types";

const initialState = {
  notification: false,
  showModal: false,
};

export default function notificationReducer(state = initialState, action) {
  switch (action.type) {
    case SHOW_NOTIFICATION:
      return {
        ...state,
        notification: true,
      };

    case CLOSE_NOTIFICATION:
      return {
        ...state,
        notification: false,
      };
    case EXPAND_NOTIFICATION:
      return {
        ...state,
        showModal: true,
      };

    case COLLAPSE_NOTIFICATION:
      return {
        ...state,
        showModal: false,
      };
    default:
      return state;
  }
}
