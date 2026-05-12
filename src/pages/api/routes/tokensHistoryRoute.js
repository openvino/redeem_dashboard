import {
	tokensLaunching,
	updateLaunchingToken,
	createLaunchingToken,
} from "../controllers/tokensController";
import {
	tokensHistory,
	tokenStock,
	updateTokenHistory,
} from "../controllers/tokensHistoryController";
import tokenVerify from "../helpers/tokenVerify";

export default async function handler(req, res) {
	const isValidJWT = await tokenVerify(req);
	if (!isValidJWT) {
		return res.status(401).json("INVALID CREDENTIALS");
	}

	if (req.method === "PATCH") {
		try {
			const { token, chain, values = {} } = req.body ?? {};
			if (!token) {
				return res.status(400).json({ error: "token is required" });
			}

			const fieldMap = {
				bottlesStock: "bottles_stock",
				bottles_stock: "bottles_stock",
				pendingRedeems: "pending_redeems",
				pending_redeems: "pending_redeems",
				lastDataCid: "last_data_cid",
				last_data_cid: "last_data_cid",
				reserveAddresses: "reserve_addresses",
				reserve_addresses: "reserve_addresses",
			};

			const updates = {};
			const source = { ...values };

			for (const [key, mapped] of Object.entries(fieldMap)) {
				const value =
					source[key] !== undefined
						? source[key]
						: req.body?.[key] !== undefined
						? req.body[key]
						: undefined;
				if (value !== undefined) {
					updates[mapped] = value;
				}
			}

			const updatedRow = await updateTokenHistory({
				symbol: token,
				chain,
				updates,
			});

			return res.status(200).json({ success: true, record: updatedRow });
		} catch (error) {
			console.error("Error en PATCH:", error);
			return res.status(400).json({ error: error.message });
		}
	}

	if (req.method === "GET") {
		const { token, chain } = req.query;

		try {
			const tokenRemainingStock = await tokenStock(token, chain);
			return res.status(200).json(tokenRemainingStock);
		} catch (error) {
			console.error("Error en GET:", error);
			return res.status(400).json({ error: error.message });
		}
	}

	// if (req.method === "POST") {
	//   console.log("POST");

	//   const {
	//     name,
	//     symbol,
	//     cap,
	//     redeem_wallet_address,
	//     vintage,
	//     bottle_image,
	//     token_image,
	//     winery_id,
	//     description,
	//     wallet_address,
	//     price_per_token,
	//     rate,
	//     opening_time,
	//     closing_time,
	//     tokens_to_crowdsale,
	//   } = req.body?.params;

	//   console.log(req.body);

	//   if (!name || !symbol || !cap || !redeem_wallet_address || !winery_id) {
	//     return res.status(400).json({
	//       error:
	//         "Missing required fields: name, symbol, cap, redeem_wallet_address, winery_id",
	//     });
	//   }
	//   const id = symbol;

	//   try {
	//     const newToken = await createLaunchingToken({
	//       id,
	//       name,
	//       symbol,
	//       cap,
	//       redeem_wallet_address,
	//       vintage,
	//       bottle_image,
	//       token_image,
	//       winery_id,
	//       description,
	//       wallet_address,
	//       price_per_token,
	//       rate,
	//       opening_time,
	//       closing_time,
	//       tokens_to_crowdsale,
	//       token_address: "",
	//       crowdsale_address: "",
	//     });

	//     console.log("Nuevo token creado:", newToken);
	//     return res.status(201).json(newToken);
	//   } catch (error) {
	//     console.error("Error al crear token:", error);
	//     return res.status(500).json({ error: "Error al crear el token" });
	//   }
	// }

	// if (req.method === "PATCH") {

	//   const { id, ...fieldsToUpdate} = req.body.params;

	//   if (!id) {
	//     return res.status(400).json({ error: "ID is required to update record" });
	//   }
	//   try {
	//     const updatedRow = await updateLaunchingToken(id, fieldsToUpdate);

	//     console.log("Registro actualizado:", updatedRow);
	//     return res.status(200).json(updatedRow);
	//   } catch (error) {
	//     console.error("Error al actualizar:", error);
	//     return res.status(500).json({ error: "Error al actualizar el registro" });
	//   }
	// }

	return res.status(405).json({ error: "Method not allowed" });
}
