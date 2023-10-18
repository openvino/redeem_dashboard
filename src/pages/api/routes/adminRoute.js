import {
  createAdmin,
  getAdmin,
  getAdminsForWinery,
  getAllAdmins,
  updateAdmin,
} from "../controllers/adminController";
import tokenVerify from "../helpers/tokenVerify";
export default async function handler(req, res) {
  const isValidJWT = await tokenVerify(req);
  if (!isValidJWT) {
    return res.json("INVALID CREDENTIALS");
  }
  if (req.method === "GET") {
    if (Object.keys(req.query).length > 0 && req.query.id) {
      const { id } = req.query;
      try {
        const admin = await getAdmin(id);

        return res.status(200).json(admin);
      } catch (error) {
        console.log(error);
        return res.status(500).json(error.message);
      }
    } else if (
      Object.keys(req.query).length > 0 &&
      req.query.is_admin === "true"
    ) {
      try {
        const admins = await getAllAdmins();
        return res.status(200).json(admins);
      } catch (error) {
        return res.status(500).json(error.message);
      }
    } else if (
      Object.keys(req.query).length > 0 &&
      req.query.is_admin === "false"
    ) {
      try {
        const admins = await getAdminsForWinery(req.query.winery_id);
        return res.status(200).json(admins);
      } catch (error) {
        console.log(error);

        return res.status(500).json(error.message);
      }
    }
  }

  if (req.method === "PUT") {
    try {
      await updateAdmin(req);
      return res.status(200).json("Success");
    } catch (error) {
      console.log(error);
      return res.status(500).json(error.message);
    }
  }

  if (req.method === "POST") {
    console.log(req.body.data);

    try {
      const response = await createAdmin(req);
      return res.status(200).json("Success");
    } catch (error) {
      console.log(error);
      return res.status(500).json(error.message);
    }
  }
}
