import { combineReducers } from "redux";
import alertReducer from "./alertReducer";
import winaryReducer from "./winaryReducer";
import filterReducer from "./filterReducer";

export default combineReducers({
  alert: alertReducer,
  winaryAdress: winaryReducer,
  filter: filterReducer,
});
