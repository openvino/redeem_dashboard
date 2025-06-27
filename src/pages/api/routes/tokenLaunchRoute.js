import { getTokenInfo, getTokens } from "../controllers/tokensController";
import tokenVerify from "../helpers/tokenVerify";

export default async function handler(req, res) {
  const isValidJWT = await tokenVerify(req);
  if (!isValidJWT) {
    return res.json("INVALID CREDENTIALS");
  }

  if (req.method === "GET") {
    const { id } = req.query;
    
    try {
      const tokenInfo = await getTokenInfo(id);
      return res.status(200).json(tokenInfo);
    } catch (error) {
      console.log(error);
      return res.status(400).json(error.message);
    }
  }
}
