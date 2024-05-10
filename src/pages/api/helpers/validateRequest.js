import { getToken, jwt } from 'next-auth/jwt'

export default async function validateRequest(req) {

 const apiSecret = process.env.API_SECRET
 const authHeader = req.headers.authorization
 if (!authHeader || !authHeader.startsWith('Bearer ')) {
  return false; 
}
const token = authHeader.split(' ')[1];
 console.log(token);
    
    

    if (!token) {
     
      return false
    } else {
        return true
    }

}
