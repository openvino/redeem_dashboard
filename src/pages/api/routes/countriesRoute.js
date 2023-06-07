import tokenVerify from "../helpers/tokenVerify";
import { getCountries } from "../controllers/countriesController";
export default async function handler(req, res) {

  const isValidJWT = await tokenVerify(req);
  if (!isValidJWT) {
    return res.json("INVALID CREDENTIALS");
  }
      if(req.method == 'GET') {
        try {
          const countries = await getCountries()
          if(countries) {
           res.status(200).json(countries)
          }
        } catch (error) {
          res.status(400).json(error.message)
        }
      }

}
