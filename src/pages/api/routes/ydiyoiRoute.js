import {
	createYdiyoiUser,
	getYditoiUsers,
} from "../controllers/ydiyoiController";

const cmktUrl = process.env.NEXT_PUBLIC_CRYPTOMKT_URL;
const url = process.env.NEXT_PUBLIC_EXCHANGE_URL;

export default async function handler(req, res) {
	res.setHeader("Access-Control-Allow-Origin", "*");
	res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
	res.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");

	if (req.method === "OPTIONS") {
		res.status(200).end();
		return;
	}
	// Validación de la solicitud
	// const isValidApiRequest = await validateRequest(req);

	// if (!isValidApiRequest) {
	//   return res.status(401).json("INVALID CREDENTIALS");
	// }

	if (req.method === "POST") {
		try {
			const { address } = req.body;

			const user = await createYdiyoiUser(address);

			// res.status(200).json(users);
			// const response = {
			//   exists: !!user,
			//   user: !!user ? user[0] : "",
			// };
			res.status(200).json({ user });
		} catch (error) {
			console.error("Error al crear el usuario:", error);
			res.status(500).json({ message: "Error al crear el usuario" });
		}
		// res.status(200).json("holaaaaaa post");
	}

	// Manejo del método GET
	if (req.method === "GET") {
		try {
			const { address } = req.query;

			const user = await getYditoiUsers(address);

			const response = {
				exists: !!user,
				user: !!user ? user[0] : "",
			};
			res.status(200).json(response);
		} catch (error) {
			console.error("Error al obtener el usuario:", error);
			res.status(500).json({ message: "Error al obtener el usuario" });
		}
		return;
	}

	// Si el método no es GET ni POST, devolver 405 (Method Not Allowed)
	res.setHeader("Allow", ["GET", "POST", "OPTIONS"]);
	res.status(405).end(`Method ${req.method} Not Allowed`);
}
