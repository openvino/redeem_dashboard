import { SHOW_ALERT,CLOSE_ALERT } from "../types";

export function showAlert(alertMessage) {
    return (dispatch) => {
        dispatch({
            type: SHOW_ALERT,
            payload: alertMessage
        })


        setTimeout(() => {
            dispatch({
                type:CLOSE_ALERT
            })
        }, 3000)
    }
}

export function closeAlert() {
    return (dispatch) => {
        dispatch({
            type: CLOSE_ALERT,
        })
    }
}