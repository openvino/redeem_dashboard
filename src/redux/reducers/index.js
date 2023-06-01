import { combineReducers } from "redux";
import alertReducer from "./alertReducer";
import winaryReducer from "./winaryReducer";


export default combineReducers({
    alert: alertReducer,
    winaryAdress:winaryReducer
})