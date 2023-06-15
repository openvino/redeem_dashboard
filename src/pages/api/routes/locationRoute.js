// todo
import { getToken, jwt } from "next-auth/jwt";
import { getLocation } from "../controllers/locationController";

import tokenVerify from "../helpers/tokenVerify";
export default async function handler(req, res) {
  const secret = process.env.JWT_SECRET;

  const isValidJWT = await tokenVerify(req);
  if (!isValidJWT) {
    return res.json("INVALID CREDENTIALS");
  }

  //GET country and province
  if (req.method === "GET") {
    try {
      // Verificar el token
      const token = await getToken({ req, secret });

      const location = await getLocation(token.sub, country_id, province_id);
      return res.status(200).json(location);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}
