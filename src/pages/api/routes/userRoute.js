import { getUsers } from "../controllers/userController";
import tokenVerify from "../helpers/tokenVerify";
export default async function handler(req, res) {
  const isValidJWT = await tokenVerify(req);
  if (!isValidJWT) {
    return res.json("INVALID CREDENTIALS");
  }

  try {
    const users = await getUsers();

    res.status(200).json(users);
  } catch (error) {
    res.status(404).json(error.message);
  }
}
