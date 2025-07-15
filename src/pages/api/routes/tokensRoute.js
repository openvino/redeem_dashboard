import { getTokens } from "../controllers/tokensController";
import tokenVerify from "../helpers/tokenVerify";

export default async function handler(req, res) {
  const isValidJWT = await tokenVerify(req);
  if (!isValidJWT) {
    return res.json("INVALID CREDENTIALS");
  }

  if (req.method === "GET") {
    const { winery_id } = req.query;

    
    try {
      const shippingCost = await getTokens(winery_id);
      return res.status(200).json(shippingCost);
    } catch (error) {
      console.log(error);
      return res.status(400).json(error.message);
    }
  }
}
