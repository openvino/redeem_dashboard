import clientAxios from "@/config/clientAxios";
import { AUTH_WINARY, LOGIN_METAMASK } from "../types";
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

export {loginApp}