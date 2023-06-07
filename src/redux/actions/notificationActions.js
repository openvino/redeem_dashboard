import { SHOW_NOTIFICATION, CLOSE_NOTIFICATION } from "../types";

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
