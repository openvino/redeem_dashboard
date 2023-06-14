import { GET_REDEEMS, GET_WINARYS } from "../types";

const initialState = {
  redeems: [],
  winarys: [],
};

export default function winaryReducer(state = initialState, action) {
  switch (action.type) {
    case GET_REDEEMS:
      return {
        ...state,
        redeems: action.payload,
      };

    case GET_WINARYS:
      return {
        ...state,
        winarys: action.payload,
      };
    default:
      return state;
  }
}
