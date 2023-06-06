import { SET_FILTER, GET_FILTER } from "../types";
const initialState = {
  filter: null,
};

export default function filterReducer(state = initialState, action) {
  switch (action.type) {
    case SET_FILTER:
      return {
        ...state,
        filter: action.payload,
      };

    case GET_FILTER:
      // console.log(state);
      return {
        state,
      };
    default:
      return state;
  }
}
