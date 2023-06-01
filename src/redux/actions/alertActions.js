import { SHOW_ALERT,CLOSE_ALERT } from "../types";

export function showAlert(alertMessage) {
    return (dispatch) => {
        dispatch({
            type: SHOW_ALERT,
            payload: alertMessage
        })
    }
}

export function closeAlert() {
    return (dispatch) => {
        dispatch({
            type: CLOSE_ALERT,
        })
    }
}