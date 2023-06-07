import { combineReducers } from "redux";
import alertReducer from "./alertReducer";
import winaryReducer from "./winaryReducer";
import filterReducer from "./filterReducer";
import notificationReducer from "./notificationReducer";

export default combineReducers({
  alert: alertReducer,
  winaryAdress: winaryReducer,
  filter: filterReducer,
  notification: notificationReducer,
});
