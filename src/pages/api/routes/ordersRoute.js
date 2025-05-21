import { getToken, jwt } from "next-auth/jwt";
import tokenVerify from "../helpers/tokenVerify";
import { getAllOrders, getOrders } from "../controllers/ordersController";

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
        const orders = await getAllOrders();
        return res.status(200).json(orders);
      } else {
        const orders = await getOrders(token.sub);
        return res.status(200).json(orders);
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}
