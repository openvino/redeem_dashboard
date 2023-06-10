import clientAxios from "@/config/clientAxios";
import { AUTH_WINARY, GET_REDEEMS, LOGIN_METAMASK } from "../types";


 function loginApp(public_key) {

    
    return async (dispatch) => {
        try {
          
            const token = await jwtGenerator(public_key)

            const response = await clientAxios.post('/loginRoute',{token})
            
            // const response = await clientAxios.post('/loginRoute', {public_key})
        }catch(error) {
            console.log(error.message)
        }
    }
}

function getRedeems() {
    return async (dispatch) => {
        try {
          const response = await clientAxios.get("/redeemRoute",{
            withCredentials:true
          });
          const redeems = response.data;
            console.log(redeems)
          dispatch({ type: GET_REDEEMS, payload: redeems });
        } catch (error) {
          console.log(error)
        }
      };
}

export {loginApp, getRedeems}