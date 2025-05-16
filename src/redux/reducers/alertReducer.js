
import { SHOW_ALERT,CLOSE_ALERT } from "../types"
const initialState = {
    alert:null
}

export default function alertReducer(state = initialState, action) {

    switch(action.type) {
        case SHOW_ALERT:
            return {
                ...state,
                alert:action.payload
            }

            case CLOSE_ALERT:
            return {
                ...state,
                alert:null
            }
            default:
                return state;
    }

}