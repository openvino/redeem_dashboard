import { getToken, jwt } from "next-auth/jwt";
import { getRedeems } from "../controllers/redeemsController";
import tokenVerify from "../helpers/tokenVerify";
export default async function handler(req, res) {
  const secret = process.env.JWT_SECRET;

  try {
    // Verificar el token
    const isValidJWT = await tokenVerify(req);
    if (isValidJWT) {
      const redeems = await getRedeems();
      res.status(200).json(redeems);
    } else {
      res.status(500).json({ message: "No permission" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}
