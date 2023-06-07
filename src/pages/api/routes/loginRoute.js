import { getProfile } from "../controllers/authContoller";
import tokenVerify from "../helpers/tokenVerify";
export default async function handler(req, res) {

      if(req.method == 'POST') {
        try {
          const {public_key} = req.body
          const profile = await getProfile(public_key)
          if(profile) {
           res.status(200).json(profile)
          }
        } catch (error) {
          res.status(400).json(error.message)
        }
      }

}
