import { getToken, jwt } from "next-auth/jwt";
import { getAllWinarys, updateWinary } from "../controllers/winarysController";
import tokenVerify from "../helpers/tokenVerify";

export default async function handler(req, res) {
  const secret = process.env.JWT_SECRET;

  const isValidJWT = await tokenVerify(req);
  if (!isValidJWT) {
    return res.json("INVALID CREDENTIALS");
  }

  //GET REDEEMS
  if (req.method === "GET") {
    const { isAdmin } = req.query;
    try {
      // Verificar el token
      const token = await getToken({ req, secret });

      if (isAdmin === "true") {
        const winarys = await getAllWinarys();
        return res.status(200).json(winarys);
      }

      //   else {
      //     const winarys = await getWinarys(token.sub);
      //     return res.status(200).json(redeems);
      //   }
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: error.message });
    }
  }

  // EDIT WINARY
  if (req.method === "PUT") {
    // const { redeemId, status } = req.body;
    // console.log(redeemId, status);

    try {
      const updatedWinary = await updateWinary(req.body.data);
      return res.status(200).json(updatedWinary);
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: error.message });
    }
  }

if (req.method === "POST") {
  // const { redeemId, status } = req.body;
  // console.log(redeemId, status);

  console.log(req.body)
  return
  try {
    const updateWinary = await updateWinary(req.body.data);
    return res.status(200).json(updateWinary);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
}

} 
