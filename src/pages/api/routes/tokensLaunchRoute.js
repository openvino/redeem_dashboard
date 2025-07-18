import {
	tokensLaunching,
	updateLaunchingToken,
	createLaunchingToken,
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

	if (req.method === "POST") {
		console.log("POST");

		const {
			name,
			symbol,
			cap,
			redeemWalletAddress,
			tokenImage,
			walletAddress,
			rate,
			openingTime,
			closingTime,
			tokensToCrowdsale,
			token_address,
			crowdsale_address,
			winery_id,
		} = req.body?.params;

		console.log(
			name,
			symbol,
			cap,
			redeemWalletAddress,
			tokenImage,
			walletAddress,
			rate,
			openingTime,
			closingTime,
			tokensToCrowdsale,
			token_address,
			crowdsale_address,
			winery_id
		);

		if (!name || !symbol || !cap || !redeemWalletAddress || !winery_id) {
			return res.status(400).json({
				error:
					"Missing required fields: name, symbol, cap, redeemWalletAddress, winery_id",
			});
		}
		const id = symbol;

		try {
			const newToken = await createLaunchingToken({
				id,
				name,
				symbol,
				cap,
				redeemWalletAddress,
				tokenImage,
				walletAddress,
				rate,
				openingTime,
				closingTime,
				tokensToCrowdsale,
				token_address: "",
				crowdsale_address: "",
				winery_id,
			});

			console.log("Nuevo token creado:", newToken);
			return res.status(201).json(newToken);
		} catch (error) {
			console.error("Error al crear token:", error);
			return res.status(500).json({ error: "Error al crear el token" });
		}
	}

	if (req.method === "PATCH") {
		console.log("PATCH");

		const { id, ...fieldsToUpdate } = req.body.params;

		console.log({ id, ...fieldsToUpdate });

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
