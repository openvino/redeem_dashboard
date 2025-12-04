import {
	daoLaunchingAll,
	updateLaunchingDAOToken,
} from "../controllers/tokensController";
import tokenVerify from "../helpers/tokenVerify";

export default async function handler(req, res) {
	const isValidJWT = await tokenVerify(req);
	if (!isValidJWT) {
		return res.status(401).json("INVALID CREDENTIALS");
	}

	if (req.method === "GET") {
		try {
			const tokensInfo = await daoLaunchingAll();
			return res.status(200).json(tokensInfo);
		} catch (error) {
			console.error("Error en GET:", error);
			return res.status(400).json({ error: error.message });
		}
	}

	if (req.method === "PATCH") {
		const { id, ...fieldsToUpdate } = req.body.params;

		if (!id) {
			return res.status(400).json({ error: "ID is required to update record" });
		}
		try {
			const updatedRow = await updateLaunchingDAOToken(id, fieldsToUpdate);

			console.log("Registro actualizado:", updatedRow);
			return res.status(200).json(updatedRow);
		} catch (error) {
			console.error("Error al actualizar:", error);
			return res.status(500).json({ error: "Error al actualizar el registro" });
		}
	}

	return res.status(405).json({ error: "Method not allowed" });
}
