
import { setWatchedTrue } from "../controllers/notificationsController"
export default async function handler(req, res) {

      if(req.method == 'POST') {
        try {
          const {id} = req.body
          const redeem = await setWatchedTrue(id)
         
           res.status(200).json(redeem)
       
        } catch (error) {
          res.status(400).json(error.message)
        }
      }

}
