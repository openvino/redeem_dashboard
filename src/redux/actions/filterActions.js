import { SET_FILTER, GET_FILTER } from "../types";

export function setFilter(filterPrompt) {
  return (dispatch) => {
    dispatch({
      type: SET_FILTER,
      payload: filterPrompt,
    });
  };
}

export function getFilter() {
  return (dispatch) => {
    dispatch({
      type: GET_FILTER,
    });
  };
}
