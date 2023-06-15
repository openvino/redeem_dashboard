import clientAxios from "@/config/clientAxios";
import {
  AUTH_WINARY,
  GET_REDEEMS,
  LOGIN_METAMASK,
  GET_WINARYS,
  GET_PROVINCES,
  GET_COUNTRIES,
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
      dispatch({ type: GET_REDEEMS, payload: redeems });
    } catch (error) {
      console.log(error);
    }
  };
}

function getWinarys(isAdmin) {
  return async (dispatch) => {
    try {
      const response = await clientAxios.get("/winarysRoute", {
        params: {
          isAdmin,
        },
        withCredentials: true,
      });

      const winarys = response.data;

      dispatch({ type: GET_WINARYS, payload: winarys });
    } catch (error) {
      console.log(error);
    }
  };
}

function getProvinces() {
  return async (dispatch) => {
    try {
      const response = await clientAxios.get("/provinceRoute", {
        withCredentials: true,
      });

      const provinces = response.data;

      dispatch({ type: GET_PROVINCES, payload: provinces });
    } catch (error) {
      console.log(error);
    }
  };
}

function getCountries() {
  return async (dispatch) => {
    try {
      const response = await clientAxios.get("/countriesRoute", {
        withCredentials: true,
      });

      const countries = response.data;

      dispatch({ type: GET_COUNTRIES, payload: countries });
    } catch (error) {
      console.log(error);
    }
  };
}

export { loginApp, getRedeems, getWinarys, getProvinces, getCountries };
