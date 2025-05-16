import { getToken, jwt } from "next-auth/jwt";
import { getAllLogs } from "../controllers/redeemsController";
import tokenVerify from "../helpers/tokenVerify";
export default async function handler(req, res) {
  const secret = process.env.JWT_SECRET;

  const isValidJWT = await tokenVerify(req);
  if (!isValidJWT) {
    return res.json("INVALID CREDENTIALS");
  }

  if (req.method === "GET") {
    const { is_admin } = req.query;

    try {
      const token = await getToken({ req, secret });

      if (is_admin === "true") {
        const logs = await getAllLogs();

        return res.status(200).json(logs);
      } else {
        const logs = await getAllLogs(token.sub);
        return res.status(200).json(logs);
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}
