import { SHOW_NOTIFICATION, CLOSE_NOTIFICATION } from "../types";
const initialState = {
  notification: false,
};

export default function notificationReducer(state = initialState, action) {
  switch (action.type) {
    case SHOW_NOTIFICATION:
      return {
        notification: true,
      };

    case CLOSE_NOTIFICATION:
      return {
        notification: false,
      };

    default:
      return state;
  }
}
