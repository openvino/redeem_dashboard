import tokenVerify from "../helpers/tokenVerify";
import {
  getTokenShippingInfo,
  getTokenShippingInfoById,
  updateShipping,
} from "../controllers/tokensController";

export default async function handler(req, res) {
  const isValidJWT = await tokenVerify(req);

  if (!isValidJWT) {
    return res.json("INVALID CREDENTIALS");
  }

  if (req.method === "GET") {
    const tokenId = req.query.tokenId;
    const shippingId = req.query.shippingId;

    try {
      if (!shippingId) {
        const tokenShippingInfo = await getTokenShippingInfo(tokenId);
        return res.status(200).json(tokenShippingInfo);
      } else {
        const tokenShippingById = await getTokenShippingInfoById(shippingId);

        return res.status(200).json(tokenShippingById);
      }
    } catch (error) {
      console.log(error);
      return res.status(400).json(error.message);
    }
  }

  if (req.method === "PUT") {
    console.log(req.body.data);

    try {
      const updatedShipping = await updateShipping(req.body.data);
      return res.status(200).json(updatedShipping);
    } catch (error) {
      console.log(error);
      return res.status(400).json(error.message);
    }
  }
}
