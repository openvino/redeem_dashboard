import clientAxios from "@/config/clientAxios";
import {
  AUTH_WINARY,
  GET_REDEEMS,
  LOGIN_METAMASK,
  GET_WINARYS,
} from "../types";

function loginApp(public_key) {
  return async (dispatch) => {
    try {
      const token = await jwtGenerator(public_key);

      const response = await clientAxios.post("/loginRoute", { token });

      // const response = await clientAxios.post('/loginRoute', {public_key})
    } catch (error) {
      console.log(error.message);
    }
  };
}

function getRedeems(isAdmin) {
  return async (dispatch) => {
    try {
      const response = await clientAxios.get("/redeemRoute", {
        params: {
          isAdmin,
        },
        withCredentials: true,
      });
      const redeems = response.data;
      // console.log(redeems)
      dispatch({ type: GET_REDEEMS, payload: redeems });
    } catch (error) {
      console.log(error);
    }
  };
}

function getWinarys(isAdmin) {
  console.log("GET WINARYS");
  return async (dispatch) => {
    try {
      const response = await clientAxios.get("/winarysRoute", {
        params: {
          isAdmin,
        },
        withCredentials: true,
      });
      console.log(response.data);
      const winarys = response.data;
      console.log("winarys                    :", winarys);
      dispatch({ type: GET_WINARYS, payload: winarys });
    } catch (error) {
      console.log(error);
    }
  };
}

export { loginApp, getRedeems, getWinarys };
