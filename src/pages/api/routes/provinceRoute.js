import tokenVerify from "../helpers/tokenVerify";
import { getProvinces } from "../controllers/countriesController";
export default async function handler(req, res) {

  const isValidJWT = await tokenVerify(req);
  if (!isValidJWT) {
    return res.json("INVALID CREDENTIALS");
  }
      if(req.method == 'GET') {
        try {
          const provinces = await getProvinces()
          if(provinces) {
           res.status(200).json(provinces)
          }
        } catch (error) {
          res.status(400).json(error.message)
        }
      }

}
