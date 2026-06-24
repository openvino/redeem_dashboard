import tokenVerify from "../helpers/tokenVerify";
import {
  getStockByCountry,
  upsertStockByCountry,
} from "../controllers/tokenStockByCountryController";

export default async function handler(req, res) {
  const isValidJWT = await tokenVerify(req);
  if (!isValidJWT) return res.status(401).json("INVALID CREDENTIALS");

  if (req.method === "GET") {
    const { token_id } = req.query;
    if (!token_id) return res.status(400).json({ error: "token_id required" });
    try {
      const rows = await getStockByCountry(token_id);
      return res.status(200).json(rows);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  if (req.method === "PUT") {
    const { token_id, country_id, stock } = req.body;
    if (!token_id || !country_id || stock === undefined) {
      return res.status(400).json({ error: "token_id, country_id, stock required" });
    }
    try {
      const row = await upsertStockByCountry({ token_id, country_id, stock });
      return res.status(200).json(row);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
