import { GET_REDEEMS } from "../types"

const initialState = {
    redeems:[]
}

export default function winaryReducer(state = initialState, action) {

    switch(action.type) {
        case GET_REDEEMS:
            return {
                ...state,
                redeems: action.payload
            }

            default:
                return state
    }

}