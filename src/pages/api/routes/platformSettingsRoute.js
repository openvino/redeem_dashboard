import { getToken } from "next-auth/jwt";
import { getAdmin } from "../controllers/adminController";
import {
  getPlatformSettings,
  updatePlatformSettings,
} from "../controllers/platformSettingsController";
import tokenVerify from "../helpers/tokenVerify";
import { isCostafloresAdmin } from "@/utils/authUtils";

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      const settings = await getPlatformSettings();
      return res.status(200).json(settings);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  if (req.method === "PUT") {
    const isValidJWT = await tokenVerify(req);
    if (!isValidJWT) return res.status(401).json("INVALID CREDENTIALS");

    const secret = process.env.JWT_SECRET;
    const token = await getToken({ req, secret });
    const admin = await getAdmin(token.sub);

    // isCostafloresAdmin expects a session-shaped object
    if (!isCostafloresAdmin({ is_admin: admin.is_admin, winery_id: admin.winery_id })) {
      return res.status(403).json("FORBIDDEN");
    }

    try {
      const { common_description } = req.body;
      await updatePlatformSettings({ common_description });
      return res.status(200).json("OK");
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
}
