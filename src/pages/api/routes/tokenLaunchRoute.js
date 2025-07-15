import { tokenLaunching } from "../controllers/tokensController";
import tokenVerify from "../helpers/tokenVerify";

export default async function handler(req, res) {
	const isValidJWT = await tokenVerify(req);
	if (!isValidJWT) {
		return res.status(401).json("INVALID CREDENTIALS");
	}

	if (req.method === "GET") {
		const { id } = req.query;
		console.log(id);

		try {
			const tokenInfo = await tokenLaunching(id);
			return res.status(200).json(tokenInfo);
		} catch (error) {
			console.error("Error en GET:", error);
			return res.status(400).json({ error: error.message });
		}
	}

	return res.status(405).json({ error: "Method not allowed" });
}
