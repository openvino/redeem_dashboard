import {
	tokensLaunching,
	updateLaunchingToken,
} from "../controllers/tokensController";
import tokenVerify from "../helpers/tokenVerify";

export default async function handler(req, res) {
	const isValidJWT = await tokenVerify(req);
	if (!isValidJWT) {
		return res.status(401).json("INVALID CREDENTIALS");
	}

	if (req.method === "GET") {
		const { winery_id } = req.query;

		try {
			const tokenInfo = await tokensLaunching(winery_id);
			return res.status(200).json(tokenInfo);
		} catch (error) {
			console.error("Error en GET:", error);
			return res.status(400).json({ error: error.message });
		}
	}

	if (req.method === "PATCH") {
		console.log("PATCH");

		const { id, ...fieldsToUpdate } = req.body.params;

		// id,
		// name,
		// symbol,
		// cap,
		// redeemWalletAddress,
		// tokenImage,
		// walletAddress,
		// rate,
		// openingTime,
		// closingTime,
		// tokensToCrowdsale,
		// token_address,
		// crowdsale_address,
		// winery_id

		if (!id) {
			return res.status(400).json({ error: "ID is required to update record" });
		}

		try {
			const updatedRow = await updateLaunchingToken(id, fieldsToUpdate);

			console.log("Registro actualizado:", updatedRow);
			return res.status(200).json(updatedRow);
		} catch (error) {
			console.error("Error al actualizar:", error);
			return res.status(500).json({ error: "Error al actualizar el registro" });
		}
	}

	return res.status(405).json({ error: "Method not allowed" });
}
