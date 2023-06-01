import { LOGIN_METAMASK } from "../types"

const initialState = {
    winaryAdress:null,
    winaryName: null
}


export default function winaryReducer(state = initialState, action) {

    switch(action.type) {
        case LOGIN_METAMASK:
            return {
                ...state,
                winaryAdress:action.payload,
                winaryName: action.name
            }

            default:
                return state
    }

}