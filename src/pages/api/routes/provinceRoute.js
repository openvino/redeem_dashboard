import tokenVerify from "../helpers/tokenVerify";
import { getProvices } from "../controllers/countriesController";
export default async function handler(req, res) {

  const isValidJWT = await tokenVerify(req);
  if (!isValidJWT) {
    return res.json("INVALID CREDENTIALS");
  }
      if(req.method == 'GET') {
        try {
          const provinces = await getProvices()
          if(provinces) {
           res.status(200).json(provinces)
          }
        } catch (error) {
          res.status(400).json(error.message)
        }
      }

}
