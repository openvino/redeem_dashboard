import {
  SHOW_NOTIFICATION,
  CLOSE_NOTIFICATION,
  EXPAND_NOTIFICATION,
  COLLAPSE_NOTIFICATION,
} from "../types";

export function showNotification() {
  return (dispatch) => {
    dispatch({
      type: SHOW_NOTIFICATION,
    });
  };
}

export function closeNotification() {
  return (dispatch) => {
    dispatch({
      type: CLOSE_NOTIFICATION,
    });
  };
}

export function showNotificationModal() {
  return (dispatch) => {
    dispatch({
      type: EXPAND_NOTIFICATION,
    });
  };
}

export function collapseNotificationModal() {
  return (dispatch) => {
    dispatch({
      type: COLLAPSE_NOTIFICATION,
    });
  };
}
